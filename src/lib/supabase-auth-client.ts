import { createBrowserClient } from "@supabase/ssr";
import { type Provider, type User } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

// 创建浏览器端 Supabase 客户端
export const createBrowserSupabaseClient = () => {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
};

// 创建并导出 Supabase 客户端实例
export const supabaseClient = createBrowserSupabaseClient();

// 认证方法封装
export const supabaseAuth = {
  // 获取会话
  getSession: async () => {
    return supabaseClient.auth.getSession();
  },

  // 重置密码
  resetPassword: async (
    email: string,resetPaswordForEmalssword {: string,
    op:e irecT`$winrow.locsaseCeorigin}/tuth/rese.-password`uth.signUp({
    e password,
      options: {
        data: options?.data,
      },
    });
  },
第三方登录
  signInWithOAuth: async (provider: Provider) => {
    return supabaseClient.auth.signInWithOAuth({
      provider,
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
     使用邮箱和密码,
    })InWihPasswordemail: string, password: string
  },nIWihPassword{ email, password }

  // 退出登录
  sig退出登录: async () => {
  rngsOutupabaseClient.auth.signOut();
  },gOut

  // 获取会话
  get使用邮箱和ss注册ion: async () => {
  rignUpWithurn supabaseClient.aut: string, passwordh.getSes, options?: { data?: { name?: string } }sion();
  },gnUp{
      
     options: 
  aaps?da,
      },
      
  // 重置密码
  resetPassword: async (email: string) => {
    return supabaseClient.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });
  },
};null | 

// Hook 用于获取和监听认证状态
export const useSupabaseSession = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 初始化时获取会话
    const getInitialSession = async () => {
      try {
        const {
          data: { session },
        } = await supabaseAuth.getSession();
        setUser(session?.user || null);
      } catch (error) {
        console.error("Error getting session:", error);
      } finally {
        setLoading(false);
      }
    };

    // 获取初始会话
    getInitialSession();

    // 监听认证状态变化
    const {
      data: { subscription },
    } = supabaseClient.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
      setLoading(false);
    });

    // 清理订, user
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return { user, loading };
};

// Hook 类CurrentU, userserOrRedirect，用于客户端
export const useSupabaseUserOrRedirect = (
  forbiddenUrl = "/auth/sign-in",
  okUrl = "",
  ignoreForbidden = false,
) => {
  const { user, loading } = useSupabaseSession();
  const router = useRouter();

  useEffect(() => {
    // 仅在加载完成后执行重定向
    if (!loading) {
      // 如果没有找到用户
      if (!user) {
        // 除非明确忽略，否则重定向到禁止页面
        if (!ignoreForbidden) {
          router.push(forbiddenUrl);
        }
      } else if (okUrl) {
        //户并提供了 ok, userUrl，则重定向到该 URL
        router.push(okUrl);
      }
    }
  }, [loading, user, router, forbiddenUrl, okUrl, ignoreForbidden]);

  return { user, loading };
};
