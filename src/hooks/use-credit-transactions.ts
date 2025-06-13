"use client";

import { useCallback, useEffect, useState } from "react";

import { supabase } from "~/lib/supabase-client";
import { createRealtimeSubscription } from "~/lib/supabase-realtime";

interface CreditTransaction {
  actionType: string;
  amount: number;
  createdAt: string;
  description?: string;
  id: string;
  updatedAt: string;
  userId: string;
}

interface UseCreditTransactionsReturn {
  error: null | string;
  hasMore: boolean;
  isLoading: boolean;
  loadMore: () => Promise<void>;
  refetch: () => Promise<void>;
  transactions: CreditTransaction[];
}

/**
 * 使用 Supabase 实时订阅管理用户积分交易记录
 * @param limit 每页加载的记录数
 * @returns 积分交易记录状态和操作函数
 */
export function useCreditTransactions(limit = 10): UseCreditTransactionsReturn {
  const [transactions, setTransactions] = useState<CreditTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<null | string>(null);
  const [hasMore, setHasMore] = useState(true);
  const [userId, setUserId] = useState<null | string>(null);
  const [page, setPage] = useState(0);

  // 获取当前用户ID
  useEffect(() => {
    const getCurrentUser = async () => {
      try {
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();
        if (authError) {
          setError(`获取用户信息失败: ${authError.message}`);
          setIsLoading(false);
          return;
        }
        if (user) {
          setUserId(user.id);
        } else {
          setIsLoading(false);
        }
      } catch (err) {
        setError(`获取用户信息失败: ${err}`);
        setIsLoading(false);
      }
    };
    getCurrentUser();
  }, []);

  // 获取积分交易记录
  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  const fetchTransactions = useCallback(async (pageNum = 0, append = false) => {
    if (!userId) return;

    if (!append) {
      setIsLoading(true);
    }
    setError(null);

    try {
      const offset = pageNum * limit;
      const { data, error: queryError } = await supabase
        .from("credit_transaction")
        .select("*")
        .eq("userId", userId)
        .order("createdAt", { ascending: false })
        .range(offset, offset + limit - 1);

      if (queryError) {
        setError("获取积分交易记录失败");
        return;
      }

      if (data) {
        if (data.length < limit) {
          setHasMore(false);
        }

        if (append) {
          setTransactions((prev) => [...prev, ...data]);
        } else {
          setTransactions(data);
        }
      }
    } catch (err) {
      setError(`获取积分交易记录失败: ${err}`);
    } finally {
      setIsLoading(false);
    }
  }, [userId, limit, supabase]);

  // 加载更多记录
  const loadMore = async () => {
    if (!hasMore || isLoading) return;
    const nextPage = page + 1;
    setPage(nextPage);
    await fetchTransactions(nextPage, true);
  };

  // 重新获取记录
  const refetch = async () => {
    setPage(0);
    setHasMore(true);
    await fetchTransactions(0, false);
  };

  // 初始化积分交易记录
  useEffect(() => {
    if (userId) {
      fetchTransactions();
    }
  }, [userId, fetchTransactions]);

  // 设置实时订阅
  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    if (!userId) return;

    // 订阅新的积分交易记录
    const unsubscribeTransaction = createRealtimeSubscription(
      "credit_transaction",
      (payload) => {
        if (payload.new && (payload.new as any).userId === userId) {
          // 将新交易记录添加到列表顶部
          setTransactions((prev) => [
            payload.new as CreditTransaction,
            ...prev,
          ]);
        }
      },
      {
        event: "INSERT",
        filter: `userId=eq.${userId}`,
      },
    );

    return () => {
      unsubscribeTransaction();
    };
  }, [userId, createRealtimeSubscription, setTransactions]);

  return {
    error,
    hasMore,
    isLoading,
    loadMore,
    refetch,
    transactions,
  };
}
