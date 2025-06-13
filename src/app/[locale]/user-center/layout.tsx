import type { Metadata } from "next";

export const metadata: Metadata = {
  description: "Manage your account, images, and settings",
  title: "User Center - Colorize Photo",
};

export default function UserCenterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="container mx-auto min-h-screen bg-background">
      {children}
    </div>
  );
}
