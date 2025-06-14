"use client";

import { useCallback, useEffect, useState } from "react";

import { supabaseClient } from "~/lib/supabase-auth-client";
import { createRealtimeSubscription } from "~/lib/supabase-realtime";

interface CreditRecharge {
  amount: number;
  created_at: string;
  currency: string;
  id: string;
  paymentIntentId?: string;
  paymentMethod?: string;
  price: number;
  status: "pending" | "completed" | "failed";
  updated_at: string;
  user_id: string;
}

interface UseCreditRechargesReturn {
  error: null | string;
  hasMore: boolean;
  isLoading: boolean;
  loadMore: () => Promise<void>;
  refetch: () => Promise<void>;
  recharges: CreditRecharge[];
}

/**
 * 使用 Supabase 实时订阅管理用户积分充值记录
 * @param limit 每页加载的记录数
 * @returns 积分充值记录状态和操作函数
 */
export function useCreditRecharges(limit = 10): UseCreditRechargesReturn {
  const [recharges, setRecharges] = useState<CreditRecharge[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<null | string>(null);
  const [hasMore, setHasMore] = useState(true);
  const [userId, setUserId] = useState<null | string>(null);
  const [page, setPage] = useState(0);

  // 获取当前用户ID
  useEffect(() => {
    console.log("[DEBUG] Getting current user");
    const getCurrentUser = async () => {
      try {
        const {
          data: { user },
          error: authError,
        } = await supabaseClient.auth.getUser();
        if (authError) {
          console.error("[DEBUG] Auth error:", authError);
          setError("AUTH_ERROR");
          setIsLoading(false);
          return;
        }
        if (user) {
          console.log("[DEBUG] User found:", user.id);
          setUserId(user.id);
        } else {
          console.log("[DEBUG] No user found");
          setIsLoading(false);
        }
      } catch (err) {
        console.error("[DEBUG] Error getting user:", err);
        setError("AUTH_ERROR");
        setIsLoading(false);
      }
    };
    getCurrentUser();
  }, []);

  // 获取积分充值记录
  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  const fetchRecharges = useCallback(async (pageNum = 0, append = false) => {
    console.log("[DEBUG] fetchRecharges called", { userId, pageNum, append });
    if (!userId) {
      console.log("[DEBUG] No userId available, skipping fetch");
      return;
    }

    if (!append) {
      setIsLoading(true);
    }
    setError(null);

    try {
      console.log("[DEBUG] Fetching recharges for userId:", userId);
      const offset = pageNum * limit;
      const { data, error: queryError } = await supabaseClient
        .from("credit_recharge")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .range(offset, offset + limit - 1);

      if (queryError) {
        console.error("[DEBUG] Query error:", queryError);
        setError("FETCH_ERROR");
        return;
      }

      console.log("[DEBUG] Fetch result:", { dataLength: data?.length });
      if (data) {
        if (data.length < limit) {
          setHasMore(false);
        }

        if (append) {
          setRecharges((prev) => [...prev, ...data]);
        } else {
          setRecharges(data);
        }
      }
    } catch (err) {
      setError("FETCH_ERROR");
    } finally {
      setIsLoading(false);
    }
  }, [userId, limit]);

  // 加载更多记录
  const loadMore = async () => {
    if (!hasMore || isLoading) return;
    const nextPage = page + 1;
    setPage(nextPage);
    await fetchRecharges(nextPage, true);
  };

  // 重新获取记录
  const refetch = async () => {
    setPage(0);
    setHasMore(true);
    await fetchRecharges(0, false);
  };

  // 初始化积分充值记录
  useEffect(() => {
    console.log("[DEBUG] Initialize recharges effect triggered, userId:", userId);
    if (userId) {
      console.log("[DEBUG] Calling fetchRecharges from init effect");
      fetchRecharges();
    }
  }, [userId, fetchRecharges]);

  // 设置实时订阅
  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    if (!userId) return;

    // 订阅新的积分充值记录
    const unsubscribeRecharge = createRealtimeSubscription(
      "credit_recharge",
      (payload) => {
        if (payload.new && (payload.new as any).user_id === userId) {
          // 将新充值记录添加到列表顶部
          setRecharges((prev) => [
            payload.new as CreditRecharge,
            ...prev,
          ]);
        }
      },
      {
        event: "INSERT",
        filter: `user_id=eq.${userId}`,
      },
    );

    return () => {
      unsubscribeRecharge();
    };
  }, [userId, createRealtimeSubscription, setRecharges]);

  return {
    error,
    hasMore,
    isLoading,
    loadMore,
    refetch,
    recharges,
  };
}