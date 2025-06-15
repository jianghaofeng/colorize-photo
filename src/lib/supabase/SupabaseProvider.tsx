'use client';

import type {Provider, Session, User} from '@supabase/supabase-js';
import type {ReactNode} from 'react';
import {createContext, use, useCallback, useEffect, useMemo, useState} from 'react';

import {createClient} from './client';

// 创建Supabase上下文类型
interface SupabaseContextType {
    getSession: () => Promise<{ data: { session: null | Session } }>;
    isLoading: boolean;
    resetPassword: (email: string) => Promise<void>;
    signIn: (email: string, password: string) => Promise<void>;
    signInWithOAuth: (provider: Provider) => Promise<void>;
    signInWithPassword: (email: string, password: string) => Promise<void>;
    signOut: () => Promise<void>;
    signUp: (email: string, password: string) => Promise<void>;
    signUpWithPassword: (email: string, password: string, options?: { data?: any }) => Promise<void>;
    supabase: ReturnType<typeof createClient>;
    updateUser: (attributes: { data?: any; email?: string; password?: string; }) => Promise<void>;
    user: null | User;
}

// 创建Supabase上下文
const SupabaseContext = createContext<SupabaseContextType | undefined>(undefined);

// Supabase提供者组件
export function SupabaseProvider({children}: { children: ReactNode }) {
    const [user, setUser] = useState<null | User>(null);
    const [isLoading, setIsLoading] = useState(true);
    const supabase = createClient();

    // 初始化用户状态
    useEffect(() => {
        let subscription: any;

        const initUser = async () => {
            try {
                // 获取当前会话
                const {data: {session}} = await supabase.auth.getSession();
                setUser(session?.user || null);

                // 监听认证状态变化
                const {data: {subscription: authSubscription}} = supabase.auth.onAuthStateChange(
                    (_event, session) => {
                        setUser(session?.user || null);
                    },
                );
                subscription = authSubscription;
            } catch (error) {
                console.error('初始化用户状态错误:', error);
            } finally {
                setIsLoading(false);
            }
        };

        initUser();

        return () => {
            if (subscription) {
                subscription.unsubscribe();
            }
        };
    }, [supabase.auth]);

    // 登录方法
    const signIn = useCallback(async (email: string, password: string) => {
        try {
            const {error} = await supabase.auth.signInWithPassword({email, password});
            if (error) {
                throw error;
            }
        } catch (error) {
            console.error('登录错误:', error);
            throw error;
        }
    }, [supabase.auth]);

    // 注册方法
    const signUp = useCallback(async (email: string, password: string) => {
        try {
            const {error} = await supabase.auth.signUp({
                email,
                options: {
                    emailRedirectTo: `${window.location.origin}/auth/callback`,
                },
                password,
            });
            if (error) {
                throw error;
            }
        } catch (error) {
            console.error('注册错误:', error);
            throw error;
        }
    }, [supabase.auth]);


    // 登出方法
    const signOut = useCallback(async () => {
        try {
            const {error} = await supabase.auth.signOut();
            if (error) {
                throw error;
            }
        } catch (error) {
            console.error('登出错误:', error);
            throw error;
        }
    }, [supabase.auth]);

    // 获取当前用户会话
    const getSession = useCallback(async () => {
        return supabase.auth.getSession();
    }, [supabase.auth]);

    // 重置密码方法
    const resetPassword = useCallback(async (email: string) => {
        try {
            const {error} = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/auth/reset-password`,
            });
            if (error) {
                throw error;
            }
        } catch (error) {
            console.error('重置密码错误:', error);
            throw error;
        }
    }, [supabase.auth]);

    // 第三方登录方法
    const signInWithOAuth = useCallback(async (provider: Provider) => {
        try {
            const {error} = await supabase.auth.signInWithOAuth({
                options: {
                    redirectTo: `${window.location.origin}/auth/callback`,
                },
                provider,
            });
            if (error) {
                throw error;
            }
        } catch (error) {
            console.error('第三方登录错误:', error);
            throw error;
        }
    }, [supabase.auth]);

    // 使用邮箱和密码登录方法
    const signInWithPassword = useCallback(async (email: string, password: string) => {
        try {
            const {error} = await supabase.auth.signInWithPassword({email, password});
            if (error) {
                throw error;
            }
        } catch (error) {
            console.error('使用邮箱和密码登录错误:', error);
            throw error;
        }
    }, [supabase.auth]);

    // 使用邮箱和密码注册方法
    const signUpWithPassword = useCallback(async (email: string, password: string, options?: { data?: any }) => {
        try {
            const {error} = await supabase.auth.signUp({
                email,
                options: {
                    data: options?.data,
                    emailRedirectTo: `${window.location.origin}/auth/callback`,
                },
                password,
            });
            if (error) {
                throw error;
            }
        } catch (error) {
            console.error('使用邮箱和密码注册错误:', error);
            throw error;
        }
    }, [supabase.auth]);

    // 更新用户信息方法
    const updateUser = useCallback(async (attributes: { data?: any; email?: string; password?: string; }) => {
        try {
            const {error} = await supabase.auth.updateUser(attributes);
            if (error) {
                throw error;
            }
        } catch (error) {
            console.error('更新用户信息错误:', error);
            throw error;
        }
    }, [supabase.auth]);

    // 提供上下文值
    const value = useMemo(() => ({
        getSession,
        isLoading,
        resetPassword,
        signIn,
        signInWithOAuth,
        signInWithPassword,
        signOut,
        signUp,
        signUpWithPassword,
        supabase,
        updateUser,
        user,
    }), [user, isLoading, signIn, signUp, signOut, resetPassword, getSession, signInWithOAuth, signInWithPassword, signUpWithPassword, supabase, updateUser]);

    return (
        <SupabaseContext value={value}>
            {children}
        </SupabaseContext>
    );
}

// 使用Supabase上下文的钩子
export function useSupabase() {
    const context = use(SupabaseContext);
    if (context === undefined) {
        throw new Error('useSupabase必须在SupabaseProvider内部使用');
    }
    return context;
}
