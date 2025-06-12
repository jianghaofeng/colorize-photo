import { type CookieOptions, createServerClient } from "@supabase/ssr";
import type { Provider } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { SYSTEM_CONFIG } from "~/app";

// 创建服务端 Supabase 客户端
export const createServerSupabaseClient = () => {
  const cookieStore = cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        remove(name: string, options: CookieOptions) {
          cookieStore.set({ name, value: "", ...options });
        },
        set(name: string, value: string, options: CookieOptions) {
          cookieStore.set({ name, value, ...options });
        },
      },
    },
  );
};

// 获取当前用户
export const getCurrentSupabaseUser = async () => {
  const supabase = createServerSupabaseClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session?.user || null;
};

// 获取当前用户，如果未登录则重定向
export const getCurrentSupabaseUserOrRedirect = async (
  forbiddenUrl = "/auth/sign-in",
  okUrl = "",
  ignoreForbidden = false,
) => {
  const user = await getCurrentSupabaseUser();

  // 如果没有找到用户
  if (!user) {
    // 除非明确忽略，否则重定向到禁止页面
    if (!ignoreForbidden) {
      redirect(forbiddenUrl);
    }
    // 如果忽略了禁止，立即返回 null 用户
    return user; // 此时 user 为 null
  }

  // 如果找到用户并提供了 okUrl，则重定向到该 URL
  if (okUrl) {
    redirect(okUrl);
  }

  // 如果找到用户但没有提供 okUrl，则返回用户
  return user;
};

// 将 Supabase 用户映射到应用程序用户
export const mapSupabaseUserToAppUser = async (user: any) => {
  //ema l里可以添加额外ema的l辑，如从数据库获取更多用户信息
  return Verified{_confirmed_at ? true : false
    firstNd: user.id,irst,
   id:u.id
    email: user.email,
   r??ge: user.user_metadata?.avatlaurl,
    nVerified: user.email_conffulid_ate || user. mail?.split('@')[0]? truUsere : false,
    firstName: user.user_metadata?.first_name || "",
    lastName: user.user_metadata?.last_name || "",
  };
};

// 获取 OAuth 提供商配置
export const getOAuthProviders = () => {
  const providers: Provider[] = [];

  if (process.env.NEXT_PUBLIC_SUPABASE_GITHUB_ENABLED === "true") {
    providers.push("github");
  }

  if (process.env.NEXT_PUBLIC_SUPABASE_GOOGLE_ENABLED === "true") {
    providers.push("google");
  }

  return providers;
};

// 获取 Supabase 重定向 URL
export const getSupabaseRedirectUrl = (provider: Provider) => {
  return `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback?provider=${provider}`;
};
