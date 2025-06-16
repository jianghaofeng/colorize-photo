'use client';

import type { User } from '@supabase/supabase-js';

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
          `}>请先登录</div>
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
        relative h-64 bg-gradient-to-r from-blue-600 to-purple-600
        dark:from-blue-800 dark:to-purple-800
      `}>
        <div className={`
          bg-opacity-20 absolute inset-0 bg-black
          dark:bg-opacity-40
        `} />
        <div className="relative z-10 flex h-full items-end justify-center p-8 w-full">
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
                  border-4 border-white bg-white text-4xl font-bold
                  text-blue-600 shadow-lg
                  dark:border-gray-800 dark:bg-gray-900 dark:text-blue-400
                `}>
                  {getInitials(profileUser.user_metadata?.full_name || profileUser.email || 'U')}
                </div>
              )}
              <div className={`
                absolute right-2 bottom-2 h-8 w-8 rounded-full border-4
                border-white bg-green-500
                dark:border-gray-800 dark:bg-green-500
              `} />
            </div>

            {/* 用户信息 */}
            <div className="text-white">
              <h1 className="mb-2 text-3xl font-bold">
                {profileUser.user_metadata?.full_name || profileUser.email}
              </h1>
              <p className={`
                text-lg text-blue-100
                dark:text-blue-200
              `}>
                {profileUser.email}
              </p>
              <p className={`
                mt-1 text-sm text-blue-200
                dark:text-blue-300
              `}>
                加入时间: {new Date(profileUser.created_at).toLocaleDateString('zh-CN')}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tab导航 */}
      <div className={`
        sticky top-0 z-20 border-b bg-white
        dark:border-gray-800 dark:bg-gray-900
      `}>
        <div className={`
          mx-auto max-w-7xl px-4
          sm:px-6
          lg:px-8
        `}>
          <nav className="flex space-x-8">
            {[
              { icon: '🖼️', key: 'gallery', label: '画廊' },
              { icon: '💳', key: 'account', label: '账号' },
              { icon: '⚙️', key: 'settings', label: '个人设置' }
            ].map((tab) => (
              <button
                className={`
                  flex items-center space-x-2 border-b-2 px-1 py-4 text-sm
                  font-medium transition-colors
                  ${activeTab === tab.key
                    ? `
                      border-blue-500 text-blue-600
                      dark:border-blue-500 dark:text-blue-400
                    `
                    : `
                      border-transparent text-gray-500
                      hover:border-gray-300 hover:text-gray-700
                      dark:text-gray-400 dark:hover:border-gray-700
                      dark:hover:text-gray-200
                    `
                  }
                `}
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
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