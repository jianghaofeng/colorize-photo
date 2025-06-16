import type { Metadata } from "next";

import { AntdRegistry } from '@ant-design/nextjs-registry';
import { ReactPlugin } from "@stagewise-plugins/react";
import { StagewiseToolbar } from "@stagewise/toolbar-next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { ConfigProvider } from "antd";
import enUS from "antd/locale/en_US";
import zhCN from "antd/locale/zh_CN";
import '@ant-design/v5-patch-for-react-19';

import "~/css/globals.css";

import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";

// 移除 Google Fonts 导入，使用系统字体堆栈
import { SEO_CONFIG } from "~/app";
import { CartProvider } from "~/lib/hooks/use-cart";
import { SupabaseProvider } from "~/lib/supabase/SupabaseProvider";
import { AntdThemeProvider } from "~/ui/components/antd-theme-provider";
import { Footer } from "~/ui/components/footer";
import { Header } from "~/ui/components/header/header";
import { ThemeProvider } from "~/ui/components/theme-provider";
import { Toaster } from "~/ui/primitives/sonner";

// 定义系统字体堆栈作为备用
const systemFontStack = {
  className: "",
  variable: "--font-geist-sans",
};

const monoFontStack = {
  className: "",
  variable: "--font-geist-mono",
};

export const metadata: Metadata = {
  description: `${SEO_CONFIG.description}`,
  title: `${SEO_CONFIG.fullName}`,
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const messages = await getMessages();

  // 根据 locale 选择语言包
  // const antdLocale = locale === 'zh' ? zhCN : enUS;
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`
          ${systemFontStack.variable}
          ${monoFontStack.variable}
          min-h-screen bg-gradient-to-br from-white to-slate-100 font-sans
          text-neutral-900 antialiased
          selection:bg-primary/80
          dark:from-neutral-950 dark:to-neutral-900 dark:text-neutral-100
        `}
      >
        <AntdRegistry>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            disableTransitionOnChange
            enableSystem
          >
            <SupabaseProvider>
              <CartProvider>
                <AntdThemeProvider locale={enUS}>
                  <NextIntlClientProvider messages={messages}>
                    <Header showAuth={false} />
                    <main className={`flex min-h-screen flex-col`}>{children}</main>
                    <Footer />
                    <Toaster />
                    <StagewiseToolbar config={{ plugins: [ReactPlugin] }} />
                  </NextIntlClientProvider>
                </AntdThemeProvider>
              </CartProvider>
            </SupabaseProvider>
          </ThemeProvider>
        </AntdRegistry>
        <SpeedInsights />
      </body>
    </html>
  );
}
