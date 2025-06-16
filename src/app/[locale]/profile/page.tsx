import { getCurrentSupabaseUser } from "~/lib/supabase-auth";
import { Starfield } from "~/ui/components/starfield";

import { ProfilePageClient } from "./page.client";

export default async function ProfilePage() {
  const user = await getCurrentSupabaseUser();

  if (!user) {
    return null;
  }
  return <div className="min-h-screen">

    <ProfilePageClient user={user} />

  </div>
}