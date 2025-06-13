'use client';

import { useTranslations } from 'next-intl';
import Link from 'next/link';

import { Button } from '~/ui/primitives/button';

export function FinalCTASection() {
  const t = useTranslations("Home");

  return (
    <section
      className={`
        from-primary to-primary/80 py-20
        dark:bg-black
      `}
    >
      <div className="container mx-auto px-4">
        <div className="space-y-8 text-center">
          <h2
            className={`
              text-3xl font-bold text-primary-foreground
              lg:text-4xl
              dark:text-white
            `}
          >
            {t('millionPhotosColorized')}
          </h2>
          <Button
            asChild
            className="px-8 py-4 text-lg font-semibold"
            size="lg"
            variant="secondary"
          >
            <Link href="/generate">
              {t('getStartNow')}
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
