'use client';

import { useEffect, useState } from 'react';

import { supabase } from '~/lib/supabase-client';
import { createRealtimeSubscription } from '~/lib/supabase-realtime';

interface UseCreditBalanceReturn {
  balance: null | number;
  error: null | string;
  isLoading: boolean;
  refetch: () => Promise<void>;
}

/**
 * 使用 Supabase 实时订阅管理用户积分余额
 * @returns 积分余额状态和操作函数
 */
export function useCreditBalance(): UseCreditBalanceReturn {
  const [balance, setBalance] = useState<null | number>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<null | string>(null);
  const [userId, setUserId] = useState<null | string>(null);

  // 获取当前用户ID
  useEffect(() => {
    const getCurrentUser = async () => {
      try {
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError) {
          setError('获取用户信息失败');
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

  // 获取积分余额
  const fetchBalance = async () => {
    if (!userId) return;

    setIsLoading(true);
    setError(null);

    try {
      const { data, error: queryError } = await supabase
        .from('user_credit_balance')
        .select('balance')
        .eq('userId', userId)
        .single();

      if (queryError) {
        // 如果记录不存在，创建一个新的余额记录
        if (queryError.code === 'PGRST116') {
          const { data: newBalance, error: insertError } = await supabase
            .from('user_credit_balance')
            .insert({
              balance: 0,
              totalConsumed: 0,
              totalRecharged: 0,
              userId,
            })
            .select('balance')
            .single();

          if (insertError) {
            setError('创建积分余额记录失败');
          } else {
            setBalance(newBalance.balance);
          }
        } else {
          setError('获取积分余额失败');
        }
      } else {
        setBalance(data.balance);
      }
    } catch (err) {
      setError(`获取积分余额失败 ${err}`);
    } finally {
      setIsLoading(false);
    }
  };

  // 初始化积分余额
  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    if (userId) {
      fetchBalance();
    }
  }, [userId]);

  // 设置实时订阅
  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    if (!userId) return;

    // 订阅用户积分余额变化
    const unsubscribeBalance = createRealtimeSubscription(
      'user_credit_balance',
      (payload) => {
        if (payload.new && (payload.new as any).userId === userId) {
          setBalance((payload.new as any).balance);
        }
      },
      {
        event: 'UPDATE',
        filter: `userId=eq.${userId}`,
      }
    );

    // 订阅积分交易记录变化
    const unsubscribeTransaction = createRealtimeSubscription(
      'credit_transaction',
      async (payload) => {
        if (payload.new && (payload.new as any).userId === userId) {
          // 当有新的积分交易时，重新获取最新余额
          await fetchBalance();
        }
      },
      {
        event: 'INSERT',
        filter: `userId=eq.${userId}`,
      }
    );

    // 订阅积分充值记录变化
    const unsubscribeRecharge = createRealtimeSubscription(
      'credit_recharge',
      async (payload) => {
        if (payload.new && (payload.new as any).userId === userId && (payload.new as any).status === 'completed') {
          // 当充值完成时，重新获取最新余额
          await fetchBalance();
        }
      },
      {
        event: 'UPDATE',
        filter: `userId=eq.${userId}`,
      }
    );

    return () => {
      unsubscribeBalance();
      unsubscribeTransaction();
      unsubscribeRecharge();
    };
  }, [userId]);

  return {
    balance,
    error,
    isLoading,
    refetch: fetchBalance,
  };
}