import type { Metadata } from "next";

import { SEO_CONFIG } from "~/app";

export const metadata: Metadata = {
  description: "查看和管理您的个人资料、作品和账单信息",
  title: `个人资料 - ${SEO_CONFIG.fullName}`,
};

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="min-h-screen bg-background">{children}</div>;
}
