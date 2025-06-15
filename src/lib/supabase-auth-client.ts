import type { Provider } from "@supabase/supabase-js";

import { createClient } from "./supabase/client";

// 创建 Supabase 客户端实例
export const supabaseClient = createClient();

// 认证方法封装
export const supabaseAuth = {
  // 获取当前用户会话
  getSession: async () => {
    return supabaseClient.auth.getSession();
  },

  // 获取当前用户
  getUser: async () => {
    return supabaseClient.auth.getUser();
  },

  // 重置密码
  resetPassword: async (email: string) => {
    return supabaseClient.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });
  },

  // 第三方登录
  signInWithOAuth: async (provider: Provider) => {
    return supabaseClient.auth.signInWithOAuth({
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
      provider,
    });
  },

  // 使用邮箱和密码登录
  signInWithPassword: async (email: string, password: string) => {
    return supabaseClient.auth.signInWithPassword({ email, password });
  },

  // 退出登录
  signOut: async () => {
    return supabaseClient.auth.signOut();
  },

  // 使用邮箱和密码注册
  signUpWithPassword: async (
    email: string,
    password: string,
    options?: { data?: { name?: string } },
  ) => {
    return supabaseClient.auth.signUp({
      email,
      options: {
        data: options?.data,
      },
      password,
    });
  },
};

/**
 * 注意：客户端钩子函数已被移除
 * 
 * 请使用服务器端的认证函数：
 * - getCurrentSupabaseUser
 * - getCurrentSupabaseUserOrRedirect
 * 
 * 如果需要在客户端组件中获取用户信息，请直接使用：
 * ```typescript
 * import { supabaseAuth } from "~/lib/supabase-auth-client";
 * 
 * // 在组件内部
 * const [user, setUser] = useState(null);
 * const [isPending, setIsPending] = useState(true);
 * 
 * useEffect(() => {
 *   const getUser = async () => {
 *     try {
 *       const { data, error } = await supabaseAuth.getUser();
 *       if (!error && data.user) {
 *         setUser(data.user);
 *       }
 *     } catch (error) {
 *       console.error("获取用户信息失败:", error);
 *     } finally {
 *       setIsPending(false);
 *     }
 *   };
 *   
 *   getUser();
 * }, []);
 * ```
 */