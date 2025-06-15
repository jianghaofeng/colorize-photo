"use client";

import { ProfileHeader } from "../components/profile-header";
import { RecentUploads } from "../components/recent-uploads";

export default function ProfileFilesPage() {
  return (
    <div className="container py-10">
      <div className="mx-auto max-w-4xl">
        {/* 个人资料头部 */}
        <ProfileHeader />

        {/* 最近上传 */}
        <div className="mt-8">
          <RecentUploads />
        </div>
      </div>
    </div>
  );
}
