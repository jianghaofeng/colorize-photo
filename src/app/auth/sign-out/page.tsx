import { redirect } from "next/navigation";

import { createServerSupabaseClient } from "~/lib/supabase-auth";

export default async function SignOutPage() {
  const supabase = createServerSupabaseClient();

  // 退出登录
  await supabase.auth.signOut();

  // 重定向到首页
  redirect("/");
}
