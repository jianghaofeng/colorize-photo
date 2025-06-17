'use client';

import type { User } from '@supabase/supabase-js';

import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { useState } from 'react';

import { useSupabase } from '~/lib/supabase/SupabaseProvider';

import { AccountTab } from './components/AccountTab';
import { GalleryTab } from './components/GalleryTab';
import { SettingsTab } from './components/SettingsTab';

interface ProfilePageProps {
  user: null | User;
}

export function ProfilePageClient({ user }: ProfilePageProps) {
  const [activeTab, setActiveTab] = useState<'account' | 'gallery' | 'settings'>('gallery');
  const { user: currentUser } = useSupabase();
  const t = useTranslations('Profile');

  // 使用传入的user或者从context获取的user
  const profileUser = user || currentUser;

  // 生成用户名首字母
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };

  if (!profileUser) {
    return (
      <div className={`
        flex min-h-screen items-center justify-center bg-gray-50
        dark:bg-gray-950
      `}>
        <div className="text-center">
          <div className={`
            text-lg text-gray-500
            dark:text-gray-300
          `}>{t('pleaseLogin')}</div>
        </div>
      </div>
    );
  }

  return (
    <div className={`
      min-h-screen bg-gray-50
      dark:bg-gray-950
    `}>
      {/* 顶部图片布局 */}
      <div className={`
        relative h-64 bg-gradient-to-r from-[oklch(0.488_0.243_264.376)] to-[oklch(0.627_0.265_303.9)]
        dark:from-[oklch(0.488_0.243_264.376)] dark:to-[oklch(0.627_0.265_303.9)]
      `}>
        <div className={`
          bg-opacity-20 absolute inset-0 bg-black
          dark:bg-opacity-40
        `} />
        <div className={`
          relative z-10 flex h-full w-full items-end justify-center p-8
        `}>
          <div className="flex items-center space-x-6">
            {/* 用户头像 */}
            <div className="relative">
              {profileUser.user_metadata?.avatar_url ? (
                <Image
                  alt={profileUser.user_metadata?.full_name || profileUser.email || 'User'}
                  className={`
                    h-32 w-32 rounded-full border-4 border-white object-cover
                    shadow-lg
                  `}
                  height={128}
                  src={profileUser.user_metadata.avatar_url}
                  width={128}
                />
              ) : (
                <div className={`
                  flex h-32 w-32 items-center justify-center rounded-full
                  border-4 border-background bg-background text-4xl font-bold
                  text-[oklch(0.488_0.243_264.376)] shadow-lg
                  dark:border-[oklch(0.274_0.006_286.033)] dark:bg-[oklch(0.21_0.006_285.885)] dark:text-[oklch(0.488_0.243_264.376)]
                `}>
                  {getInitials(profileUser.user_metadata?.full_name || profileUser.email || 'U')}
                </div>
              )}
              <div className={`
                absolute right-2 bottom-2 h-8 w-8 rounded-full border-4
                border-background bg-[oklch(0.696_0.17_162.48)]
                dark:border-[oklch(0.274_0.006_286.033)] dark:bg-[oklch(0.696_0.17_162.48)]
              `} />
            </div>

            {/* 用户信息 */}
            <div className="text-white">
              <h1 className="mb-2 text-3xl font-bold">
                {profileUser.user_metadata?.full_name || profileUser.email}
              </h1>
              <p className={`
                text-lg text-[oklch(0.967_0.001_286.375)]
                dark:text-[oklch(0.967_0.001_286.375)]
              `}>
                {profileUser.email}
              </p>
              <p className={`
                mt-1 text-sm text-[oklch(0.967_0.001_286.375)/0.8]
                dark:text-[oklch(0.967_0.001_286.375)/0.8]
              `}>
                {t('joinedDate')}: {new Date(profileUser.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tab导航 */}
      <div className={`
        sticky top-0 z-20 border-b bg-background
        dark:border-border dark:bg-card
      `}>
        <div className={`
          mx-auto max-w-7xl px-4
          sm:px-6
          lg:px-8
        `}>
          <nav className="flex space-x-8">
            {[
              { icon: '🖼️', key: 'gallery', label: t('gallery') },
              { icon: '💳', key: 'account', label: t('account') },
              { icon: '⚙️', key: 'settings', label: t('settings') }
            ].map((tab) => (
              <button
                className={`
                  flex items-center space-x-2 border-b-2 px-1 py-4 text-sm
                  font-medium transition-colors
                  ${activeTab === tab.key
                    ? `
                      border-[oklch(0.488_0.243_264.376)] text-[oklch(0.488_0.243_264.376)]
                      dark:border-[oklch(0.488_0.243_264.376)] dark:text-[oklch(0.488_0.243_264.376)]
                    `
                    : `
                      border-transparent text-muted-foreground
                      hover:border-border hover:text-foreground
                      dark:text-muted-foreground dark:hover:border-muted
                      dark:hover:text-foreground
                    `
                  }
                `}
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                type="button"
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Tab内容 */}
      <div className={`
        mx-auto max-w-7xl px-4 py-8
        sm:px-6
        lg:px-8
      `}>
        {activeTab === 'gallery' && <GalleryTab />}
        {activeTab === 'account' && <AccountTab />}
        {activeTab === 'settings' && <SettingsTab />}
      </div>
    </div>
  );
}