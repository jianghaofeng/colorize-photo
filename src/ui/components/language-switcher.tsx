"use client";

import { Globe } from "lucide-react";
import { useTranslations } from "next-intl";
import * as React from "react";
import { useTransition } from "react";

import { useRouter } from "~/i18n/i18nConfig";
import { getCurrentLocale, type Locale, locales } from "~/i18n/i18nConfig";
import { cn } from "~/lib/utils";
import { Button } from "~/ui/primitives/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/ui/primitives/dropdown-menu";

const languageNames: Record<Locale, string> = {
  en: "English",
  zh: "中文",
};

export function LanguageSwitcher({ className }: { className?: string }) {
  const t = useTranslations();
  const router = useRouter();
  const [mounted, setMounted] = React.useState(false);
  const [currentLocale, setCurrentLocale] = React.useState<Locale>("en");
  const [, startTransition] = useTransition();

  // 获取当前语言
  React.useEffect(() => {
    // 从 localStorage 获取当前语言或使用浏览器语言偏好
    const currentLocale = getCurrentLocale();
    setCurrentLocale(currentLocale);
  }, []);

  // 避免水合不匹配，仅在客户端渲染
  React.useEffect(() => {
    requestAnimationFrame(() => setMounted(true));
  }, []);

  // 切换语言
  const changeLanguage = (locale: Locale) => {
    console.warn("changeLanguage", locale);
    if (locale === currentLocale) return;

    startTransition(() => {
      setCurrentLocale(locale);
      document.cookie = `preferred-locale=${locale}; path=/; max-age=31536000; SameSite=Lax`;
      // 刷新页面以应用新语言
      router.refresh();
    });
  };

  if (!mounted) {
    return (
      <Button
        className={cn("h-9 w-9 rounded-full", className)}
        disabled
        size="icon"
        variant="ghost"
      >
        <Globe className="h-[1.2rem] w-[1.2rem] opacity-70" />
        <span className="sr-only">Loading language switcher</span>
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          className={cn(
            `
              h-9 w-9 rounded-full bg-background transition-colors
              hover:bg-muted
            `,
            className,
          )}
          size="icon"
          variant="ghost"
        >
          <Globe className="h-[1.2rem] w-[1.2rem]" />
          <span className="sr-only">{t("common.selectLanguage")}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {locales.map((locale) => (
          <DropdownMenuItem
            className={cn(
              "flex cursor-pointer items-center gap-2",
              currentLocale === locale && "font-medium text-primary",
            )}
            key={locale}
            onClick={() => changeLanguage(locale)}
          >
            {languageNames[locale]}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
