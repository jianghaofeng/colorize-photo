import type { NextRequest } from "next/server";

import createMiddleware from 'next-intl/middleware';

import { routing } from '~/i18n/i18nConfig';
import { updateSession } from "~/lib/supabase/middleware";

// 创建中间件实例
const intlMiddleware = createMiddleware(routing);

// 中间件处理函数
export async function middleware(request: NextRequest) {
  // 先更新会话
  await updateSession(request);

  // 使用next-intl中间件处理所有路径
  return intlMiddleware(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
