import type { Metadata } from "next";

import { ReactPlugin } from "@stagewise-plugins/react";
import { StagewiseToolbar } from "@stagewise/toolbar-next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";

import "~/css/globals.css";
// 移除 Google Fonts 导入，使用系统字体堆栈
import { SEO_CONFIG } from "~/app";
import { CartProvider } from "~/lib/hooks/use-cart";
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
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          disableTransitionOnChange
          enableSystem
        >
          <CartProvider>
            <NextIntlClientProvider messages={messages}>
              <Header showAuth={false} />
              <main className={`flex min-h-screen flex-col`}>{children}</main>
              <Footer />
              <Toaster />
              <StagewiseToolbar config={{ plugins: [ReactPlugin] }} />
            </NextIntlClientProvider>
          </CartProvider>
        </ThemeProvider>
        <SpeedInsights />
      </body>
    </html>
  );
}
