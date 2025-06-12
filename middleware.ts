import { type CookieOptions, createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  consnst response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        remove(name: string, options: CookieOptions) {
          response.cookies.delete({ name, ...options });
        },
        set(name: string, value: string, options: CookieOptions) {
          // 如果值不存在或空字符串，则删除 cookie
          if (value === "") {
            response.cookies.delete(name);
            return;
          }
          response.cookies.set({ name, value, ...options });
        },
      },
    },
  );

  // 刷新会话，确保始终拥有最新的 auth cookie
  await supabase.auth.getSession();

  return response;
}

// 仅对以下路径应用中间件
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
