"use client";

import { Menu, X } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { SEO_CONFIG } from "~/app";
import { useSupabase } from "~/lib/supabase/SupabaseProvider";
import { cn } from "~/lib/utils";
import { Button } from "~/ui/primitives/button";

import { LanguageSwitcher } from "../language-switcher";
import { NotificationsWidget } from "../notifications/notifications-widget";
import { ThemeToggle } from "../theme-toggle";
import { HeaderUserDropdown } from "./header-user";

interface HeaderProps {
  children?: React.ReactNode;
  showAuth?: boolean;
}

export function Header({ showAuth = true }: HeaderProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const t = useTranslations();
  const { getSession } = useSupabase();

  useEffect(() => {
    const getUser = async () => {
      try {
        const { data } = await getSession();
        if (data.session?.user) {
          setUser(data.session.user);
        }
      } catch (error) {
        console.error("获取用户信息失败:", error);
      }
    };
    getUser();
  }, [getSession]);

  const mainNavigation = [
    { href: "/", name: "Home" },
    // { href: "/products", name: "Products" },
    { href: "/pricing", name: "Pricing" },
    // { href: "/payment-test", name: "Payment" },
    // { href: "/tts", name: "TTS" },
  ];

  // const dashboardNavigation = [
  //   { href: "/dashboard/stats", name: "Stats" },
  //   { href: "/dashboard/profile", name: "Profile" },
  //   { href: "/dashboard/settings", name: "Settings" },
  // ];

  // const isDashboard = user && pathname.startsWith("/dashboard"); // todo: remove /admin when admin role is implemented
  // const navigation = isDashboard ? dashboardNavigation : mainNavigation;

  const renderContent = () => (
    <header
      className={`
        sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur
        supports-[backdrop-filter]:bg-background/60
      `}
    >
      <div
        className={`
          container mx-auto max-w-7xl px-4
          sm:px-6
          lg:px-8
        `}
      >
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-6">
            <Link className="flex items-center gap-2" href="/">
              <span
                className={cn(
                  "text-xl font-bold",
                  `
                    bg-gradient-to-r from-primary to-primary/70 bg-clip-text
                    tracking-tight text-transparent
                  `
                )}
              >
                {SEO_CONFIG.name}
              </span>
            </Link>
            <nav
              className={`
                hidden
                md:flex
              `}
            >
              <ul className="flex items-center gap-6">
                {mainNavigation.map((item) => {
                  const isActive =
                    pathname === item.href ||
                    (item.href !== "/" && pathname?.startsWith(item.href));

                  return (
                    <li key={item.name}>
                      <Link
                        className={cn(
                          `
                            text-sm font-medium transition-colors
                            hover:text-primary
                          `,
                          isActive
                            ? "font-semibold text-primary"
                            : "text-muted-foreground"
                        )}
                        href={item.href}
                      >
                        {item.name}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            {/* <NotificationsWidget /> */}

            {showAuth && (
              <div
                className={`
                  hidden
                  md:block
                `}
              >
                {user ? (
                  <HeaderUserDropdown
                    isDashboard={false}
                    userEmail={user.email || ""}
                    userImage={""}
                    userName={""}
                  />
                ) : (
                  <div className="flex items-center gap-2">
                    <Link href="/auth/sign-in">
                      <Button size="sm" variant="ghost">
                        {t("User.login")}
                      </Button>
                    </Link>
                    <Link href="/auth/sign-up">
                      <Button size="sm">Sign up</Button>
                    </Link>
                  </div>
                )}
              </div>
            )}

            <Link className={`
              hidden
              md:block
            `} href="/image-processing">
              <Button size="sm" variant="default">
                Get Started
              </Button>
            </Link>

            <ThemeToggle />
            <LanguageSwitcher />
            {user && (
              <HeaderUserDropdown
                isDashboard={false}
                userEmail={user.email || ""}
                userImage={""}
                userName={""}
              />
            )}
            {/* Mobile menu button */}
            <Button
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              size="icon"
              variant="ghost"
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden">
          <div className="space-y-1 border-b px-4 py-3">
            {mainNavigation.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== "/" && pathname?.startsWith(item.href));

              return (
                <Link
                  className={cn(
                    "block rounded-md px-3 py-2 text-base font-medium",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : `
                        text-foreground
                        hover:bg-muted/50 hover:text-primary
                      `
                  )}
                  href={item.href}
                  key={item.name}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              );
            })}
          </div>

          {showAuth && !user && (
            <div className="space-y-1 border-b px-4 py-3">
              <Link
                className={`
                  block rounded-md px-3 py-2 text-base font-medium
                  hover:bg-muted/50
                `}
                href="/auth/sign-in"
                onClick={() => setMobileMenuOpen(false)}
              >
                Log in
              </Link>
              <Link
                className={`
                  block rounded-md bg-primary px-3 py-2 text-base font-medium
                  text-primary-foreground
                  hover:bg-primary/90
                `}
                href="/auth/sign-up"
                onClick={() => setMobileMenuOpen(false)}
              >
                {t("Auth.signUp")}
              </Link>
            </div>
          )}

          {/* Get Started 按钮 */}
          <div className="space-y-1 border-b px-4 py-3">
            <Link
              className={`
                block rounded-md bg-primary px-3 py-2 text-base font-medium
                text-primary-foreground
                hover:bg-primary/90
              `}
              href="/get-started"
              onClick={() => setMobileMenuOpen(false)}
            >
              Get Started
            </Link>
          </div>

          {/* 设置选项 */}
          <div className="space-y-1 border-b px-4 py-3">
            <div className="flex items-center justify-between px-3 py-2">
              <span className="text-base font-medium">{t("Common.theme")}</span>
              <ThemeToggle />
            </div>
            <div className="flex items-center justify-between px-3 py-2">
              <span className="text-base font-medium">
                {t("Settings.language")}
              </span>
              <LanguageSwitcher />
            </div>
          </div>


        </div>
      )}
    </header>
  );

  return renderContent();
}
