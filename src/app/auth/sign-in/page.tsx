import { SYSTEM_CONFIG } from "~/app";
import { getCurrentSupabaseUserOrRedirect } from "~/lib/supabase-auth";

import { SignInPageClient } from "./page.client";

export default async function SignInPage() {
  await getCurrentSupabaseUserOrRedirect(
    undefined,
    SYSTEM_CONFIG.redirectAfterSignIn,
    true,
  );

  return <SignInPageClient />;
}
