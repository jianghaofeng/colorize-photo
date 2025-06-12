import { type NextRequest, NextResponse } from "next/server";

import { SYSTEM_CONFIG } from "~/app";
import { createServerSupabaseClient } from "~/lib/supabase-auth";

// 处理 Supabase Auth 重定向回调
export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");

  // 如果没有授权码，重定向到登录页面
  if (!code) {
    return NextResponse.redirect(new URL("/auth/sign-in", request.url));
  }

  try {
    const supabase = createServerSupabaseClient();

    // 交换授权码获取会话
    await supabase.auth.exchangeCodeForSession(code);

    // 授权成功后重定向到系统配置的重定向地址
    return NextResponse.redirect(
      new URL(SYSTEM_CONFIG.redirectAfterSignIn, request.url),
    );
  } catch (error) {
    console.error("Auth callback error:", error);
    // 授权失败重定向到登录页面
    return NextResponse.redirect(
      new URL("/auth/sign-in?error=callback_error", request.url),
    );
  }
}
