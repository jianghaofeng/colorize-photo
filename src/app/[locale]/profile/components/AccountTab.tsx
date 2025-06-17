'use client';

import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';

import { useRouter } from '~/i18n/i18nConfig';
import { createRealtimeSubscription } from '~/lib/supabase-realtime';
import { createClient } from '~/lib/supabase/client';
import { useSupabase } from '~/lib/supabase/SupabaseProvider';

interface CreditBalance {
  balance: number;
  created_at: string;
  id: string;
  total_consumed: number;
  total_recharged: number;
  updated_at: string;
  user_id: string;
}

interface CreditPackage {
  credits: number;
  currency: string;
  description: null | string;
  id: string;
  is_active: number;
  is_popular: number;
  name: string;
  price: number;
}

interface CreditRecharge {
  amount: number;
  created_at: string;
  currency: string;
  id: string;
  payment_method: null | string;
  price: number;
  status: 'completed' | 'failed' | 'pending';
  user_id: string;
}

interface CreditTransaction {
  amount: number;
  balance_after: number;
  created_at: string;
  description: null | string;
  id: string;
  related_recharge_id: null | string;
  related_upload_id: null | string;
  type: 'bonus' | 'consumption' | 'expiration' | 'recharge' | 'refund' | 'subscription';
  user_id: string;
}

export function AccountTab() {
  const t = useTranslations('Profile');
  const [balance, setBalance] = useState<CreditBalance | null>(null);
  const [transactions, setTransactions] = useState<CreditTransaction[]>([]);
  const [recharges, setRecharges] = useState<CreditRecharge[]>([]);
  const [packages, setPackages] = useState<CreditPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'packages' | 'recharges' | 'transactions'>('overview');
  const { user } = useSupabase();
  const supabase = createClient();
  const router = useRouter();
  // Fetch credit balance
  const fetchBalance = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_credit_balance')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error(`${t('errors.fetchBalanceFailed')}:`, error);
        return;
      }

      setBalance(data);
    } catch (error) {
      console.error(`${t('errors.fetchBalanceFailed')}:`, error);
    }
  };

  // Fetch transaction records
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
        console.error(`${t('errors.fetchTransactionsFailed')}:`, error);
        return;
      }

      setTransactions(data || []);
    } catch (error) {
      console.error(`${t('errors.fetchTransactionsFailed')}:`, error);
    }
  };

  // Fetch recharge records
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
        console.error(`${t('errors.fetchRechargesFailed')}:`, error);
        return;
      }

      setRecharges(data || []);
    } catch (error) {
      console.error(`${t('errors.fetchRechargesFailed')}:`, error);
    }
  };

  // Fetch credit packages
  const fetchPackages = async () => {
    try {
      const { data, error } = await supabase
        .from('credit_package')
        .select('*')
        .eq('is_active', 1)
        .order('sort_order', { ascending: true });

      if (error) {
        console.error(`${t('errors.fetchPackagesFailed')}:`, error);
        return;
      }

      setPackages(data || []);
    } catch (error) {
      console.error(`${t('errors.fetchPackagesFailed')}:`, error);
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

  // Set up realtime subscriptions
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
      bonus: t('transactionType.bonus'),
      consumption: t('transactionType.consumption'),
      expiration: t('transactionType.expiration'),
      recharge: t('transactionType.recharge'),
      refund: t('transactionType.refund'),
      subscription: t('transactionType.subscription')
    };
    return labels[type as keyof typeof labels] || type;
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      completed: t('status.completed'),
      failed: t('status.failed'),
      pending: t('status.pending')
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
    // Call payment API here
    console.log(`${t('logs.purchasePackage')}:`, packageId);
    // TODO: Implement payment logic
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
          rounded-lg border border-border bg-card p-6 shadow-sm
          dark:border-border dark:bg-card
        `}>
          <div className={`
            mb-2 text-3xl font-bold text-[oklch(0.488_0.243_264.376)]
            dark:text-[oklch(0.488_0.243_264.376)]
          `}>
            {balance?.balance || 0}
          </div>
          <div className={`
            text-muted-foreground
            dark:text-muted-foreground
          `}>{t('currentBalance')}</div>
        </div>
        <div className={`
          rounded-lg border border-border bg-card p-6 shadow-sm
          dark:border-border dark:bg-card
        `}>
          <div className={`
            mb-2 text-3xl font-bold text-[oklch(0.696_0.17_162.48)]
            dark:text-[oklch(0.696_0.17_162.48)]
          `}>
            {balance?.total_recharged || 0}
          </div>
          <div className={`
            text-muted-foreground
            dark:text-muted-foreground
          `}>{t('totalRecharged')}</div>
        </div>
        <div className={`
          rounded-lg border border-border bg-card p-6 shadow-sm
          dark:border-border dark:bg-card
        `}>
          <div className={`
            mb-2 text-3xl font-bold text-[oklch(0.645_0.246_16.439)]
            dark:text-[oklch(0.645_0.246_16.439)]
          `}>
            {balance?.total_consumed || 0}
          </div>
          <div className={`
            text-muted-foreground
            dark:text-muted-foreground
          `}>{t('totalConsumed')}</div>
        </div>
      </div>

      {/* Tab导航 */}
      <div className={`
        rounded-lg border border-border bg-card shadow-sm
        dark:border-border dark:bg-card
      `}>
        <div className={`
          border-b border-border
          dark:border-border
        `}>
          <nav className="flex space-x-8 px-6">
            {[
              { key: 'overview', label: t('tabs.overview') },
              { key: 'transactions', label: t('tabs.transactions') },
              { key: 'recharges', label: t('tabs.recharges') },
            ].map((tab) => (
              <button
                className={`
                  border-b-2 px-1 py-4 text-sm font-medium
                  ${activeTab === tab.key
                    ? `
                      border-[oklch(0.488_0.243_264.376)] text-[oklch(0.488_0.243_264.376)]
                      dark:text-[oklch(0.488_0.243_264.376)]
                    `
                    : `
                      border-transparent text-muted-foreground
                      hover:border-border hover:text-foreground
                      dark:text-muted-foreground dark:hover:border-muted
                      dark:hover:text-foreground
                    `
                  }
                `}
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                type='button'
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
                  mb-4 text-6xl font-bold text-[oklch(0.488_0.243_264.376)]
                  dark:text-[oklch(0.488_0.243_264.376)]
                `}>
                  {balance?.balance || 0}
                </div>
                <div className={`
                  mb-6 text-xl text-muted-foreground
                  dark:text-muted-foreground
                `}>{t('currentBalance')}</div>
                <button
                  onClick={() => router.push('/pricing')}
                  type='button'
                >
                  {t('rechargeNow')}
                </button>
              </div>

              <div className={`
                grid grid-cols-1 gap-6
                md:grid-cols-2
              `}>
                <div className={`
                  rounded-lg bg-muted p-4
                  dark:bg-muted
                `}>
                  <h3 className={`
                    mb-4 text-lg font-semibold text-foreground
                    dark:text-foreground
                  `}>{t('recentTransactions')}</h3>
                  <div className="space-y-3">
                    {transactions.slice(0, 5).map((transaction) => (
                      <div className="flex items-center justify-between" key={transaction.id}>
                        <div>
                          <div className={`
                            font-medium text-foreground
                            dark:text-foreground
                          `}>
                            {getTransactionTypeLabel(transaction.type)}
                          </div>
                          <div className={`
                            text-sm text-muted-foreground
                            dark:text-muted-foreground
                          `}>
                            {new Date(transaction.created_at).toLocaleDateString()}
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
                  rounded-lg bg-muted p-4
                  dark:bg-muted
                `}>
                  <h3 className={`
                    mb-4 text-lg font-semibold text-foreground
                    dark:text-foreground
                  `}>{t('recentRecharges')}</h3>
                  <div className="space-y-3">
                    {recharges.slice(0, 5).map((recharge) => (
                      <div className="flex items-center justify-between" key={recharge.id}>
                        <div>
                          <div className={`
                            font-medium text-foreground
                            dark:text-foreground
                          `}>{recharge.amount} {t('credits')}</div>
                          <div className={`
                            text-sm text-muted-foreground
                            dark:text-muted-foreground
                          `}>
                            {new Date(recharge.created_at).toLocaleDateString()}
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
                text-lg font-semibold text-foreground
                dark:text-foreground
              `}>{t('tabs.transactions')}</h3>
              <div className="overflow-x-auto">
                <table className={`
                  min-w-full divide-y divide-border
                  dark:divide-border
                `}>
                  <thead className={`
                    bg-muted
                    dark:bg-muted
                  `}>
                    <tr>
                      <th className={`
                        px-6 py-3 text-left text-xs font-medium tracking-wider
                        text-muted-foreground uppercase
                        dark:text-muted-foreground
                      `}>
                        {t('transactionTable.type')}
                      </th>
                      <th className={`
                        px-6 py-3 text-left text-xs font-medium tracking-wider
                        text-muted-foreground uppercase
                        dark:text-muted-foreground
                      `}>
                        {t('transactionTable.amount')}
                      </th>
                      <th className={`
                        px-6 py-3 text-left text-xs font-medium tracking-wider
                        text-muted-foreground uppercase
                        dark:text-muted-foreground
                      `}>
                        {t('transactionTable.balance')}
                      </th>
                      <th className={`
                        px-6 py-3 text-left text-xs font-medium tracking-wider
                        text-muted-foreground uppercase
                        dark:text-muted-foreground
                      `}>
                        {t('transactionTable.description')}
                      </th>
                      <th className={`
                        px-6 py-3 text-left text-xs font-medium tracking-wider
                        text-muted-foreground uppercase
                        dark:text-muted-foreground
                      `}>
                        {t('transactionTable.time')}
                      </th>
                    </tr>
                  </thead>
                  <tbody className={`
                    divide-y divide-border bg-background
                    dark:divide-border dark:bg-background
                  `}>
                    {transactions.map((transaction) => (
                      <tr key={transaction.id}>
                        <td className={`
                          px-6 py-4 text-sm font-medium whitespace-nowrap
                          text-foreground
                          dark:text-foreground
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
                          px-6 py-4 text-sm whitespace-nowrap text-foreground
                          dark:text-foreground
                        `}>
                          {transaction.balance_after}
                        </td>
                        <td className={`
                          px-6 py-4 text-sm whitespace-nowrap text-muted-foreground
                          dark:text-muted-foreground
                        `}>
                          {transaction.description || '-'}
                        </td>
                        <td className={`
                          px-6 py-4 text-sm whitespace-nowrap text-muted-foreground
                          dark:text-muted-foreground
                        `}>
                          {new Date(transaction.created_at).toLocaleString()}
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
                text-lg font-semibold text-foreground
                dark:text-foreground
              `}>{t('tabs.recharges')}</h3>
              <div className="overflow-x-auto">
                <table className={`
                  min-w-full divide-y divide-border
                  dark:divide-border
                `}>
                  <thead className={`
                    bg-muted
                    dark:bg-muted
                  `}>
                    <tr>
                      <th className={`
                        px-6 py-3 text-left text-xs font-medium tracking-wider
                        text-muted-foreground uppercase
                        dark:text-muted-foreground
                      `}>
                        {t('rechargeTable.creditAmount')}
                      </th>
                      <th className={`
                        px-6 py-3 text-left text-xs font-medium tracking-wider
                        text-muted-foreground uppercase
                        dark:text-muted-foreground
                      `}>
                        {t('rechargeTable.paymentAmount')}
                      </th>
                      <th className={`
                        px-6 py-3 text-left text-xs font-medium tracking-wider
                        text-muted-foreground uppercase
                        dark:text-muted-foreground
                      `}>
                        {t('rechargeTable.status')}
                      </th>
                      <th className={`
                        px-6 py-3 text-left text-xs font-medium tracking-wider
                        text-muted-foreground uppercase
                        dark:text-muted-foreground
                      `}>
                        {t('rechargeTable.paymentMethod')}
                      </th>
                      <th className={`
                        px-6 py-3 text-left text-xs font-medium tracking-wider
                        text-muted-foreground uppercase
                        dark:text-muted-foreground
                      `}>
                        {t('rechargeTable.time')}
                      </th>
                    </tr>
                  </thead>
                  <tbody className={`
                    divide-y divide-border bg-background
                    dark:divide-border dark:bg-background
                  `}>
                    {recharges.map((recharge) => (
                      <tr key={recharge.id}>
                        <td className={`
                          px-6 py-4 text-sm font-medium whitespace-nowrap
                          text-foreground
                          dark:text-foreground
                        `}>
                          {recharge.amount} {t('credits')}
                        </td>
                        <td className={`
                          px-6 py-4 text-sm whitespace-nowrap text-foreground
                          dark:text-foreground
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
                          px-6 py-4 text-sm whitespace-nowrap text-muted-foreground
                          dark:text-muted-foreground
                        `}>
                          {recharge.payment_method || '-'}
                        </td>
                        <td className={`
                          px-6 py-4 text-sm whitespace-nowrap text-muted-foreground
                          dark:text-muted-foreground
                        `}>
                          {new Date(recharge.created_at).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}