'use client';

import { useState, useEffect } from 'react';

import { useCreditBalance } from './use-credit-balance';
import { useCreditTransactions } from './use-credit-transactions';
import { useCreditPackages, type CreditPackage } from './use-credit-packages';
import { useCreditRecharges } from './use-credit-recharges';

interface CreditTransaction {
  id: string;
  type: string;
  amount: number;
  balance_after: number;
  created_at: string;
  description?: string;
  metadata?: any;
  status: string;
}

interface UseCreditsReturn {
  // 积分余额信息
  balance: number | null;
  lifetime_earned: number | null;
  lifetime_spent: number | null;
  
  // 交易记录
  recentTransactions: CreditTransaction[];
  
  // 积分套餐
  creditPackages: CreditPackage[];
  
  // 状态
  loading: boolean;
  error: string | null;
  
  // 操作函数
  refresh: () => Promise<void>;
}

/**
 * 整合积分相关功能的钩子
 * 提供积分余额、交易记录、积分套餐等信息
 */
export function useCredits(): UseCreditsReturn {
  // 使用各个积分相关钩子
  const { balance, isLoading: balanceLoading, error: balanceError, refetch: refreshBalance } = useCreditBalance();
  const { transactions, isLoading: transactionsLoading, error: transactionsError, refetch: refreshTransactions } = useCreditTransactions(20);
  const { packages, isLoading: packagesLoading, error: packagesError, refetch: refreshPackages } = useCreditPackages();
  const { recharges, isLoading: rechargesLoading, error: rechargesError, refetch: refreshRecharges } = useCreditRecharges(20);
  
  // 计算的状态
  const [lifetime_earned, setLifetimeEarned] = useState<number | null>(null);
  const [lifetime_spent, setLifetimeSpent] = useState<number | null>(null);
  
  // 格式化交易记录
  const formatTransactions = (transactions: any[]): CreditTransaction[] => {
    return transactions.map(transaction => ({
      id: transaction.id,
      type: transaction.actionType,
      amount: transaction.amount,
      balance_after: transaction.balanceAfter,
      created_at: transaction.createdAt,
      description: transaction.description,
      metadata: transaction.metadata,
      status: 'COMPLETED', // 默认状态
    }));
  };
  
  // 计算总收入和总支出
  useEffect(() => {
    if (transactions.length > 0) {
      let earned = 0;
      let spent = 0;
      
      transactions.forEach(transaction => {
        if (transaction.amount > 0) {
          earned += transaction.amount;
        } else {
          spent += Math.abs(transaction.amount);
        }
      });
      
      setLifetimeEarned(earned);
      setLifetimeSpent(spent);
    }
  }, [transactions]);
  
  // 刷新所有数据
  const refresh = async () => {
    await Promise.all([
      refreshBalance(),
      refreshTransactions(),
      refreshPackages(),
      refreshRecharges()
    ]);
  };
  
  // 整合错误信息
  const error = balanceError || transactionsError || packagesError || rechargesError;
  
  // 整合加载状态
  const loading = balanceLoading || transactionsLoading || packagesLoading || rechargesLoading;
  
  return {
    balance,
    lifetime_earned,
    lifetime_spent,
    recentTransactions: formatTransactions(transactions),
    creditPackages: packages,
    loading,
    error,
    refresh,
  };
}