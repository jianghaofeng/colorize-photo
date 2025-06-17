'use client';

import { Button } from 'antd';
import { useEffect, useState } from 'react';

import { useRouter } from '~/i18n/i18nConfig';
import { createRealtimeSubscription } from '~/lib/supabase-realtime';
import { createClient } from '~/lib/supabase/client';
import { useSupabase } from '~/lib/supabase/SupabaseProvider';

interface CreditBalance {
  balance: number;
  createdAt: string;
  id: string;
  totalConsumed: number;
  totalRecharged: number;
  updatedAt: string;
  userId: string;
}

interface CreditPackage {
  credits: number;
  currency: string;
  description: null | string;
  id: string;
  isActive: number;
  isPopular: number;
  name: string;
  price: number;
}

interface CreditRecharge {
  amount: number;
  createdAt: string;
  currency: string;
  id: string;
  paymentMethod: null | string;
  price: number;
  status: 'completed' | 'failed' | 'pending';
  userId: string;
}

interface CreditTransaction {
  amount: number;
  balanceAfter: number;
  createdAt: string;
  description: null | string;
  id: string;
  relatedRechargeId: null | string;
  relatedUploadId: null | string;
  type: 'bonus' | 'consumption' | 'expiration' | 'recharge' | 'refund' | 'subscription';
  userId: string;
}

export function AccountTab() {
  const [balance, setBalance] = useState<CreditBalance | null>(null);
  const [transactions, setTransactions] = useState<CreditTransaction[]>([]);
  const [recharges, setRecharges] = useState<CreditRecharge[]>([]);
  const [packages, setPackages] = useState<CreditPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'packages' | 'recharges' | 'transactions'>('overview');
  const { user } = useSupabase();
  const supabase = createClient();
  const router = useRouter();
  // 获取积分余额
  const fetchBalance = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_credit_balance')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('获取积分余额失败:', error);
        return;
      }

      setBalance(data);
    } catch (error) {
      console.error('获取积分余额失败:', error);
    }
  };

  // 获取交易记录
  const fetchTransactions = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('credit_transaction')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        console.error('获取交易记录失败:', error);
        return;
      }

      setTransactions(data || []);
    } catch (error) {
      console.error('获取交易记录失败:', error);
    }
  };

  // 获取充值记录
  const fetchRecharges = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('credit_recharge')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) {
        console.error('获取充值记录失败:', error);
        return;
      }

      setRecharges(data || []);
    } catch (error) {
      console.error('获取充值记录失败:', error);
    }
  };

  // 获取积分套餐
  const fetchPackages = async () => {
    try {
      const { data, error } = await supabase
        .from('credit_package')
        .select('*')
        .eq('is_active', 1)
        .order('sort_order', { ascending: true });

      if (error) {
        console.error('获取积分套餐失败:', error);
        return;
      }

      setPackages(data || []);
    } catch (error) {
      console.error('获取积分套餐失败:', error);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      await Promise.all([
        fetchBalance(),
        fetchTransactions(),
        fetchRecharges(),
        fetchPackages()
      ]);
      setLoading(false);
    };

    loadData();
  }, [user]);

  // 设置实时订阅
  useEffect(() => {
    if (!user) return;

    const unsubscribeBalance = createRealtimeSubscription<CreditBalance>(
      'user_credit_balance',
      (payload) => {
        if (payload.eventType === 'UPDATE' && payload.new) {
          setBalance(payload.new);
        }
      },
      {
        event: 'UPDATE',
        filter: `user_id=eq.${user.id}`,
        schema: 'public'
      }
    );

    const unsubscribeTransactions = createRealtimeSubscription<CreditTransaction>(
      'credit_transaction',
      (payload) => {
        if (payload.eventType === 'INSERT' && payload.new) {
          setTransactions(prev => [payload.new!, ...prev.slice(0, 49)]);
        }
      },
      {
        event: 'UPDATE',
        filter: `user_id=eq.${user.id}`,
        schema: 'public'
      }
    );

    const unsubscribeRecharges = createRealtimeSubscription<CreditRecharge>(
      'credit_recharge',
      (payload) => {
        if (payload.eventType === 'INSERT' && payload.new) {
          setRecharges(prev => [payload.new!, ...prev.slice(0, 19)]);
        } else if (payload.eventType === 'UPDATE' && payload.new) {
          setRecharges(prev => prev.map(r => r.id === payload.new!.id ? payload.new! : r));
        }
      },
      {
        event: 'UPDATE',
        filter: `user_id=eq.${user.id}`,
        schema: 'public'
      }
    );

    return () => {
      unsubscribeBalance();
      unsubscribeTransactions();
      unsubscribeRecharges();
    };
  }, [user]);

  const getTransactionTypeLabel = (type: string) => {
    const labels = {
      bonus: '奖励',
      consumption: '消费',
      expiration: '过期',
      recharge: '充值',
      refund: '退款',
      subscription: '订阅赠送'
    };
    return labels[type as keyof typeof labels] || type;
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      completed: '已完成',
      failed: '失败',
      pending: '待支付'
    };
    return labels[status as keyof typeof labels] || status;
  };

  const getStatusColor = (status: string) => {
    const colors = {
      completed: 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/30',
      failed: 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/30',
      pending: 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/30'
    };
    return colors[status as keyof typeof colors] || 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-700';
  };

  const handlePurchase = async (packageId: string) => {
    // 这里应该调用支付API
    console.log('购买套餐:', packageId);
    // TODO: 实现支付逻辑
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className={`
          grid grid-cols-1 gap-4
          md:grid-cols-3
        `}>
          {[...Array(3)].map((_, i) => (
            <div className={`
              h-24 animate-pulse rounded-lg bg-gray-200
              dark:bg-gray-700
            `} key={i} />
          ))}
        </div>
        <div className={`
          h-64 animate-pulse rounded-lg bg-gray-200
          dark:bg-gray-700
        `} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 积分概览 */}
      <div className={`
        grid grid-cols-1 gap-4
        md:grid-cols-3
      `}>
        <div className={`
          rounded-lg border border-gray-200 bg-white p-6 shadow-sm
          dark:border-gray-700 dark:bg-gray-800
        `}>
          <div className={`
            mb-2 text-3xl font-bold text-blue-600
            dark:text-blue-400
          `}>
            {balance?.balance || 0}
          </div>
          <div className={`
            text-gray-600
            dark:text-gray-300
          `}>当前积分余额</div>
        </div>
        <div className={`
          rounded-lg border border-gray-200 bg-white p-6 shadow-sm
          dark:border-gray-700 dark:bg-gray-800
        `}>
          <div className={`
            mb-2 text-3xl font-bold text-green-600
            dark:text-green-400
          `}>
            {balance?.totalRecharged || 0}
          </div>
          <div className={`
            text-gray-600
            dark:text-gray-300
          `}>累计充值积分</div>
        </div>
        <div className={`
          rounded-lg border border-gray-200 bg-white p-6 shadow-sm
          dark:border-gray-700 dark:bg-gray-800
        `}>
          <div className={`
            mb-2 text-3xl font-bold text-red-600
            dark:text-red-400
          `}>
            {balance?.totalConsumed || 0}
          </div>
          <div className={`
            text-gray-600
            dark:text-gray-300
          `}>累计消费积分</div>
        </div>
      </div>

      {/* Tab导航 */}
      <div className={`
        rounded-lg border border-gray-200 bg-white shadow-sm
        dark:border-gray-700 dark:bg-gray-800
      `}>
        <div className={`
          border-b border-gray-200
          dark:border-gray-700
        `}>
          <nav className="flex space-x-8 px-6">
            {[
              { key: 'overview', label: '概览' },
              { key: 'transactions', label: '交易记录' },
              { key: 'recharges', label: '充值记录' },
              { key: 'packages', label: '充值套餐' }
            ].map((tab) => (
              <button
                className={`
                  border-b-2 px-1 py-4 text-sm font-medium
                  ${activeTab === tab.key
                    ? `
                      border-blue-500 text-blue-600
                      dark:text-blue-400
                    `
                    : `
                      border-transparent text-gray-500
                      hover:border-gray-300 hover:text-gray-700
                      dark:text-gray-400 dark:hover:border-gray-600
                      dark:hover:text-gray-200
                    `
                  }
                `}
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="py-8 text-center">
                <div className={`
                  mb-4 text-6xl font-bold text-blue-600
                  dark:text-blue-400
                `}>
                  {balance?.balance || 0}
                </div>
                <div className={`
                  mb-6 text-xl text-gray-600
                  dark:text-gray-300
                `}>当前积分余额</div>
                <button
                  onClick={() => router.push('/pricing')}
                >
                  立即充值
                </button>
              </div>

              <div className={`
                grid grid-cols-1 gap-6
                md:grid-cols-2
              `}>
                <div className={`
                  rounded-lg bg-gray-50 p-4
                  dark:bg-gray-700
                `}>
                  <h3 className={`
                    mb-4 text-lg font-semibold text-gray-900
                    dark:text-gray-100
                  `}>最近交易</h3>
                  <div className="space-y-3">
                    {transactions.slice(0, 5).map((transaction) => (
                      <div className="flex items-center justify-between" key={transaction.id}>
                        <div>
                          <div className={`
                            font-medium text-gray-900
                            dark:text-gray-100
                          `}>
                            {getTransactionTypeLabel(transaction.type)}
                          </div>
                          <div className={`
                            text-sm text-gray-500
                            dark:text-gray-400
                          `}>
                            {new Date(transaction.createdAt).toLocaleDateString('zh-CN')}
                          </div>
                        </div>
                        <div className={`
                          font-semibold
                          ${transaction.amount > 0 ? `
                            text-green-600
                            dark:text-green-400
                          ` : `
                            text-red-600
                            dark:text-red-400
                          `
                          }
                        `}>
                          {transaction.amount > 0 ? '+' : ''}{transaction.amount}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className={`
                  rounded-lg bg-gray-50 p-4
                  dark:bg-gray-700
                `}>
                  <h3 className={`
                    mb-4 text-lg font-semibold text-gray-900
                    dark:text-gray-100
                  `}>最近充值</h3>
                  <div className="space-y-3">
                    {recharges.slice(0, 5).map((recharge) => (
                      <div className="flex items-center justify-between" key={recharge.id}>
                        <div>
                          <div className={`
                            font-medium text-gray-900
                            dark:text-gray-100
                          `}>{recharge.amount} 积分</div>
                          <div className={`
                            text-sm text-gray-500
                            dark:text-gray-400
                          `}>
                            {new Date(recharge.createdAt).toLocaleDateString('zh-CN')}
                          </div>
                        </div>
                        <span className={`
                          rounded-full px-2 py-1 text-xs font-medium
                          ${getStatusColor(recharge.status)
                          }
                        `}>
                          {getStatusLabel(recharge.status)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'transactions' && (
            <div className="space-y-4">
              <h3 className={`
                text-lg font-semibold text-gray-900
                dark:text-gray-100
              `}>交易记录</h3>
              <div className="overflow-x-auto">
                <table className={`
                  min-w-full divide-y divide-gray-200
                  dark:divide-gray-700
                `}>
                  <thead className={`
                    bg-gray-50
                    dark:bg-gray-700
                  `}>
                    <tr>
                      <th className={`
                        px-6 py-3 text-left text-xs font-medium tracking-wider
                        text-gray-500 uppercase
                        dark:text-gray-300
                      `}>
                        类型
                      </th>
                      <th className={`
                        px-6 py-3 text-left text-xs font-medium tracking-wider
                        text-gray-500 uppercase
                      `}>
                        金额
                      </th>
                      <th className={`
                        px-6 py-3 text-left text-xs font-medium tracking-wider
                        text-gray-500 uppercase
                      `}>
                        余额
                      </th>
                      <th className={`
                        px-6 py-3 text-left text-xs font-medium tracking-wider
                        text-gray-500 uppercase
                      `}>
                        描述
                      </th>
                      <th className={`
                        px-6 py-3 text-left text-xs font-medium tracking-wider
                        text-gray-500 uppercase
                      `}>
                        时间
                      </th>
                    </tr>
                  </thead>
                  <tbody className={`
                    divide-y divide-gray-200 bg-white
                    dark:divide-gray-700 dark:bg-gray-800
                  `}>
                    {transactions.map((transaction) => (
                      <tr key={transaction.id}>
                        <td className={`
                          px-6 py-4 text-sm font-medium whitespace-nowrap
                          text-gray-900
                          dark:text-gray-100
                        `}>
                          {getTransactionTypeLabel(transaction.type)}
                        </td>
                        <td className={`
                          px-6 py-4 text-sm font-semibold whitespace-nowrap
                          ${transaction.amount > 0 ? `
                            text-green-600
                            dark:text-green-400
                          ` : `
                            text-red-600
                            dark:text-red-400
                          `
                          }
                        `}>
                          {transaction.amount > 0 ? '+' : ''}{transaction.amount}
                        </td>
                        <td className={`
                          px-6 py-4 text-sm whitespace-nowrap text-gray-900
                          dark:text-gray-100
                        `}>
                          {transaction.balanceAfter}
                        </td>
                        <td className={`
                          px-6 py-4 text-sm whitespace-nowrap text-gray-500
                          dark:text-gray-400
                        `}>
                          {transaction.description || '-'}
                        </td>
                        <td className={`
                          px-6 py-4 text-sm whitespace-nowrap text-gray-500
                          dark:text-gray-400
                        `}>
                          {new Date(transaction.createdAt).toLocaleString('zh-CN')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'recharges' && (
            <div className="space-y-4">
              <h3 className={`
                text-lg font-semibold text-gray-900
                dark:text-gray-100
              `}>充值记录</h3>
              <div className="overflow-x-auto">
                <table className={`
                  min-w-full divide-y divide-gray-200
                  dark:divide-gray-700
                `}>
                  <thead className={`
                    bg-gray-50
                    dark:bg-gray-700
                  `}>
                    <tr>
                      <th className={`
                        px-6 py-3 text-left text-xs font-medium tracking-wider
                        text-gray-500 uppercase
                      `}>
                        积分数量
                      </th>
                      <th className={`
                        px-6 py-3 text-left text-xs font-medium tracking-wider
                        text-gray-500 uppercase
                      `}>
                        支付金额
                      </th>
                      <th className={`
                        px-6 py-3 text-left text-xs font-medium tracking-wider
                        text-gray-500 uppercase
                      `}>
                        状态
                      </th>
                      <th className={`
                        px-6 py-3 text-left text-xs font-medium tracking-wider
                        text-gray-500 uppercase
                      `}>
                        支付方式
                      </th>
                      <th className={`
                        px-6 py-3 text-left text-xs font-medium tracking-wider
                        text-gray-500 uppercase
                      `}>
                        时间
                      </th>
                    </tr>
                  </thead>
                  <tbody className={`
                    divide-y divide-gray-200 bg-white
                    dark:divide-gray-700 dark:bg-gray-800
                  `}>
                    {recharges.map((recharge) => (
                      <tr key={recharge.id}>
                        <td className={`
                          px-6 py-4 text-sm font-medium whitespace-nowrap
                          text-gray-900
                          dark:text-gray-100
                        `}>
                          {recharge.amount} 积分
                        </td>
                        <td className={`
                          px-6 py-4 text-sm whitespace-nowrap text-gray-900
                          dark:text-gray-100
                        `}>
                          ${(recharge.price / 100).toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`
                            rounded-full px-2 py-1 text-xs font-medium
                            ${getStatusColor(recharge.status)
                            }
                          `}>
                            {getStatusLabel(recharge.status)}
                          </span>
                        </td>
                        <td className={`
                          px-6 py-4 text-sm whitespace-nowrap text-gray-500
                          dark:text-gray-400
                        `}>
                          {recharge.paymentMethod || '-'}
                        </td>
                        <td className={`
                          px-6 py-4 text-sm whitespace-nowrap text-gray-500
                          dark:text-gray-400
                        `}>
                          {new Date(recharge.createdAt).toLocaleString('zh-CN')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'packages' && (
            <div className="space-y-4">
              <h3 className={`
                text-lg font-semibold text-gray-900
                dark:text-gray-100
              `}>充值套餐</h3>
              <div className={`
                grid grid-cols-1 gap-6
                md:grid-cols-2
                lg:grid-cols-3
              `}>
                {packages.map((pkg) => (
                  <div
                    className={`
                      relative rounded-lg border-2 bg-white p-6
                      dark:bg-gray-800
                      ${pkg.isPopular ? `
                        border-blue-500
                        dark:border-blue-400
                      ` : `
                        border-gray-200
                        dark:border-gray-700
                      `
                      }
                    `}
                    key={pkg.id}
                  >
                    {pkg.isPopular === 1 && (
                      <div className={`
                        absolute -top-3 left-1/2 -translate-x-1/2 transform
                      `}>
                        <span className={`
                          rounded-full bg-blue-500 px-3 py-1 text-xs font-medium
                          text-white
                          dark:bg-blue-400
                        `}>
                          热门
                        </span>
                      </div>
                    )}
                    <div className="text-center">
                      <h4 className={`
                        mb-2 text-xl font-bold text-gray-900
                        dark:text-gray-100
                      `}>{pkg.name}</h4>
                      <div className={`
                        mb-2 text-3xl font-bold text-blue-600
                        dark:text-blue-400
                      `}>
                        {pkg.credits} 积分
                      </div>
                      <div className={`
                        mb-4 text-lg text-gray-600
                        dark:text-gray-300
                      `}>
                        ${(pkg.price / 100).toFixed(2)}
                      </div>
                      {pkg.description && (
                        <p className={`
                          mb-6 text-sm text-gray-500
                          dark:text-gray-400
                        `}>{pkg.description}</p>
                      )}
                      <button
                        className={`
                          w-full rounded-lg px-4 py-3 font-medium
                          transition-colors
                          ${pkg.isPopular
                            ? `
                              bg-blue-600 text-white
                              hover:bg-blue-700
                              dark:bg-blue-500 dark:hover:bg-blue-600
                            `
                            : `
                              bg-gray-100 text-gray-900
                              hover:bg-gray-200
                              dark:bg-gray-700 dark:text-gray-100
                              dark:hover:bg-gray-600
                            `
                          }
                        `}
                        onClick={() => handlePurchase(pkg.id)}
                      >
                        立即购买
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}