'use client';

import { ConfigProvider } from 'antd';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { getAntdTheme } from '~/lib/antd-theme';

interface AntdThemeProviderProps {
  children: React.ReactNode;
  locale?: any;
}

export function AntdThemeProvider({ children, locale }: AntdThemeProviderProps) {
  const { theme, systemTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // 避免服务端渲染时的主题不匹配
    return (
      <ConfigProvider locale={locale} theme={getAntdTheme(false)}>
        {children}
      </ConfigProvider>
    );
  }

  const currentTheme = theme === 'system' ? systemTheme : theme;
  const isDark = currentTheme === 'dark';

  return (
    <ConfigProvider locale={locale} theme={getAntdTheme(isDark)}>
      {children}
    </ConfigProvider>
  );
}