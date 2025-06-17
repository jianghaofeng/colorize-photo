import type { NextRequest } from "next/server";

import { createServerClient } from '@supabase/ssr';
import createMiddleware from 'next-intl/middleware';
import { NextResponse } from 'next/server';

import { routing } from '~/i18n/i18nConfig';

// 创建中间件实例
const intlMiddleware = createMiddleware(routing);

// 中间件处理函数
export async function middleware(request: NextRequest) {
  // 先更新会话
  const sessionResponse = await updateSession(request);

  // 如果updateSession返回了重定向响应，直接返回该响应
  if (sessionResponse && sessionResponse.status !== 200) {
    return sessionResponse;
  }

  // 使用next-intl中间件处理所有路径
  return intlMiddleware(request);
}

// Supabase 会话更新函数
async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          // 更新请求中的cookies
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))

          // 创建新的响应
          supabaseResponse = NextResponse.next({
            request,
          })

          // 设置响应中的cookies，包含完整选项
          cookiesToSet.forEach(({ name, options, value }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // 不要在 createServerClient 和 supabase.auth.getUser() 之间运行代码。
  // 一个简单的错误可能会导致很难调试的问题，比如用户被随机登出。

  // 重要：不要删除 auth.getUser() 调用

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // 定义公共路径，这些路径不需要身份验证
  const publicPaths = ['/auth', "/pricing"]
  if (request.nextUrl.pathname === "/") {
    return supabaseResponse
  }
  if (!user && !publicPaths.some(path => request.nextUrl.pathname.startsWith(path))) {
    // 没有用户，且不是公共路径，重定向到登录页面
    const url = request.nextUrl.clone()
    url.pathname = '/auth/sign-in'

    // 保存原始URL作为重定向参数
    url.searchParams.set('redirect', request.nextUrl.pathname + request.nextUrl.search)

    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
