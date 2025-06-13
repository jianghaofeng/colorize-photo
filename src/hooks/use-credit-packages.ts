'use client';

import { useEffect, useState } from 'react';

import { supabase } from '~/lib/supabase-client';

export interface CreditPackage {
  createdAt: string;
  creditsRequired: number;
  description?: string;
  id: string;
  isActive: boolean;
  name: string;
  price: number;
  updatedAt: string;
}

export interface UseCreditPackagesReturn {
  error: null | string;
  isLoading: boolean;
  packages: CreditPackage[];
  refetch: () => Promise<void>;
}

/**
 * 使用 Supabase 直接查询管理积分套餐
 * @returns 积分套餐状态和操作函数
 */
export function useCreditPackages(): UseCreditPackagesReturn {
  const [packages, setPackages] = useState<CreditPackage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<null | string>(null);

  // 获取积分套餐
  const fetchPackages = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: queryError } = await supabase
        .from('credit_package')
        .select('*')
        .eq('isActive', true)
        .order('price', { ascending: true });

      if (queryError) {
        setError(`获取积分套餐失败: ${queryError}`);
        return;
      }

      if (data) {
        setPackages(data);
      }
    } catch (err) {
      setError(`获取积分套餐失败: ${err}`);
    } finally {
      setIsLoading(false);
    }
  };

  // 初始化积分套餐
  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    fetchPackages();
  }, []);

  return {
    error,
    isLoading,
    packages,
    refetch: fetchPackages,
  };
}