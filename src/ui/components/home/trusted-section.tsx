'use client';

import { useTranslations } from 'next-intl';
import NextImage from 'next/image';

export function TrustedSection() {
  const t = useTranslations("Home");

  return (
    <section className="bg-muted/30 py-16">
      <div className="container mx-auto px-4">
        <div
          className={`
            grid grid-cols-1 gap-8
            md:grid-cols-3
          `}
        >
          {/* Column 1 */}
          <div className="space-y-4 text-center">
            <p
              className={`
                text-sm font-medium tracking-wide text-muted-foreground
                uppercase
              `}
            >
              {t('trustedInProductions')}
            </p>
            <div className="space-y-2">
              <p className="text-lg font-semibold text-foreground">
                "
                {t('remarkablyAccurate')}
                "
              </p>
              <p className="text-sm text-muted-foreground">
                - Kevin Kelly, Founding Editor, Wired
              </p>
            </div>
          </div>

          {/* Column 2 */}
          <div className="space-y-4 text-center">
            <div className="flex justify-center">
              <NextImage
                alt="History Channel Logo"
                className="h-10 w-auto"
                height={40}
                src="https://zvcxdyuidlhzvmhsviwc.supabase.co/storage/v1/object/public/images/history-channel.svg"
                width={120}
              />
            </div>
            <div className="space-y-2">
              <p className="text-lg font-semibold text-foreground">
                "
                {t('worldsBestAI')}
                "
              </p>
              <p className="text-sm text-muted-foreground">
                - PIXimperfect, Photoshop Expert, 4M Subscribers on YouTube
              </p>
            </div>
          </div>

          {/* Column 3 */}
          <div className="space-y-4 text-center">
            <div className="flex justify-center">
              <NextImage
                alt="BBC Logo"
                className="h-10 w-auto"
                height={40}
                src="https://zvcxdyuidlhzvmhsviwc.supabase.co/storage/v1/object/public/images/bbc-logo.svg"
                width={80}
              />
            </div>
            <div className="space-y-2">
              <p className="text-lg font-semibold text-foreground">
                "
                {t('inALeagueOfItsOwn')}
                "
              </p>
              <p className="text-sm text-muted-foreground">
                - Bycloud, AI Expert, 112K Subscribers on YouTube
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
