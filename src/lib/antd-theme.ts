import type { ThemeConfig } from 'antd';
import { theme } from 'antd';

export const getAntdTheme = (isDark: boolean): ThemeConfig => ({
  algorithm: isDark ? [theme.darkAlgorithm] : [theme.defaultAlgorithm],
  components: {
    Button: {
      borderRadius: 8,
      fontWeight: 500,
    },
    Card: {
      borderRadius: 10,
    },
    Input: {
      borderRadius: 6,
    },
    Modal: {
      borderRadius: 12,
    },
    Upload: {
      borderRadius: 8,
    },
  },
  token: {
    // 圆角
    borderRadius: 6,
    // 与项目主题色保持一致
    colorBgContainer: 'var(--background)',
    colorBorder: 'var(--border)',
    colorBorderBg: 'var(--border)',
    // 主色
    colorPrimary: 'var(--primary)',
    colorText: 'var(--foreground)',
    // 字体
    fontFamily: 'var(--font-geist-sans)',
  },
});

// 保持向后兼容的默认导出
export const antdTheme: ThemeConfig = getAntdTheme(false);