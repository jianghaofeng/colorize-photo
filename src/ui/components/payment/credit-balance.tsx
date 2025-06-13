'use client';

import { CreditBalanceDisplay } from './credit-balance-display';

export function CreditBalance({ className }: { className?: string }) {
  // 不再需要服务端获取初始余额，CreditBalanceDisplay 组件会通过实时订阅自动获取和更新
  return <CreditBalanceDisplay className={className} />;
}