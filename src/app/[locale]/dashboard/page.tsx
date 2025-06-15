import { getCurrentSupabaseUser } from "~/lib/supabase-auth";

import { DashboardPageClient } from "./page.client";

export default async function DashboardPage() {
  const user = await getCurrentSupabaseUser();

  if (!user) {
    return null;
  }
  return <DashboardPageClient user={user} />;
}
