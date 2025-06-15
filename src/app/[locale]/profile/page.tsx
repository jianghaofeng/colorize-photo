"use client";

import { ProfileHeader } from "./components/profile-header";
import { ProfileTabs } from "./components/profile-tabs";

export default function ProfilePage() {
  return (
    <div className="container py-10">
      <div className="mx-auto max-w-4xl">
        {/* 个人资料头部 */}
        <ProfileHeader />

        {/* 标签页内容 */}
        <ProfileTabs />
      </div>
    </div>
  );
}
