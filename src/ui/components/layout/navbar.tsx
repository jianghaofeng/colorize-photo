'use client';

import { CreditCard, Menu, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

import { HeaderUserDropdown } from '~/ui/components/header/header-user';
import { LanguageSwitcher } from '~/ui/components/language-switcher';
import { CreditBalance } from '~/ui/components/payment/credit-balance';
import { ThemeToggle } from '~/ui/components/theme-toggle';
import { Button } from '~/ui/primitives/button';

interface NavbarProps {
  user?: null | {
    email?: null | string;
    image?: null | string;
    name?: null | string;
  };
}

export function Navbar({ user }: NavbarProps) {
  const t = useTranslations('Navigation');
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // 关闭菜单当路径改变时
  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  const navItems = [
    { href: '/', label: t('home') },
    { href: '/gallery', label: t('gallery') },
    { href: '/pricing', label: t('pricing') },
    { href: '/credits', label: t('credits') },
  ];

  return (
    <header className={`
      sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur
      supports-[backdrop-filter]:bg-background/60
    `}>
      <div className="container flex h-16 items-center">
        <div className={`
          mr-4 hidden
          md:flex
        `}>
          <Link className="mr-6 flex items-center space-x-2" href="/">
            <span className="font-bold">Colorize</span>
          </Link>

          <nav className="flex items-center space-x-6 text-sm font-medium">
            {navItems.map((item) => (
              <Link
                className={`
                  transition-colors
                  hover:text-foreground/80
                  ${pathname === item.href ? `text-foreground` : `
                    text-foreground/60
                  `}
                `}
                href={item.href}
                key={item.href}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className={`
          flex
          md:hidden
        `}>
          <Button
            className="mr-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            size="icon"
            variant="ghost"
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle Menu</span>
          </Button>
          <Link className="flex items-center" href="/">
            <span className="font-bold">Colorize</span>
          </Link>
        </div>

        <div className="flex flex-1 items-center justify-end space-x-4">
          <div className={`
            hidden items-center
            md:flex
          `}>
            {user && <CreditBalance className="mr-4" />}
          </div>
          <nav className="flex items-center space-x-2">
            <ThemeToggle />
            <LanguageSwitcher />
            {user ? (
              <HeaderUserDropdown
                isDashboard={false}
                userEmail={user.email || ''}
                userImage={user.image}
                userName={user.name || ''}
              />
            ) : (
              <Button asChild size="sm">
                <Link href="/auth/signin">{t('signIn')}</Link>
              </Button>
            )}
          </nav>
        </div>
      </div>

      {/* 移动端菜单 */}
      {isMenuOpen && (
        <div className={`
          fixed inset-0 z-50 bg-background
          md:hidden
        `}>
          <div className="container flex h-16 items-center justify-between">
            <Link className="flex items-center" href="/">
              <span className="font-bold">Colorize</span>
            </Link>
            <Button
              onClick={() => setIsMenuOpen(false)}
              size="icon"
              variant="ghost"
            >
              <X className="h-5 w-5" />
              <span className="sr-only">Close Menu</span>
            </Button>
          </div>
          <nav className="container grid gap-6 py-6">
            {navItems.map((item) => (
              <Link
                className={`
                  flex items-center text-lg font-medium
                  ${pathname === item.href ? `text-foreground` : `
                    text-foreground/60
                  `}
                `}
                href={item.href}
                key={item.href}
              >
                {item.label}
              </Link>
            ))}
            {user && (
              <div className="flex items-center py-4">
                <CreditCard className="mr-2 h-5 w-5" />
                <CreditBalance />
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}