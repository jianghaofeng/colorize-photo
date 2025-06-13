'use client';

import { useCreditBalance } from '~/hooks/use-credit-balance';

interface CreditBalanceDisplayProps {
  className?: string;
}

export function CreditBalanceDisplay({ className }: CreditBalanceDisplayProps) {
  const { balance, isLoading, error } = useCreditBalance();

  if (error) {
    return (
      <div className={className}>
        <span className="text-sm font-medium text-red-500">
          积分余额: 加载失败
        </span>
      </div>
    );
  }

  return (
    <div className={className}>
      <span className="text-sm font-medium">
        积分余额: {isLoading ? '加载中...' : balance ?? 0}
      </span>
    </div>
  );
}