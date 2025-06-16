"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

import { SEO_CONFIG, SYSTEM_CONFIG } from "~/app";
import { useSupabase } from "~/lib/supabase/SupabaseProvider";
import { GoogleIcon } from "~/ui/components/icons/google";
import { Starfield } from "~/ui/components/starfield";
import { Button } from "~/ui/primitives/button";
import { Card, CardContent } from "~/ui/primitives/card";
import { Input } from "~/ui/primitives/input";
import { Label } from "~/ui/primitives/label";
import { Separator } from "~/ui/primitives/separator";

export function SignInPageClient() {
  const { signInWithOAuth, signInWithPassword } = useSupabase();
  const t = useTranslations();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // 检查 URL 参数中是否有错误信息和重定向地址
  const errorFromParams = searchParams.get("error");
  const registered = searchParams.get("registered");
  const redirectPath = searchParams.get("redirect");

  // 如果存在错误参数，设置错误信息
  useState(() => {
    if (errorFromParams === "callback_error") {
      setError(t("Auth.oauthLoginFailed"));
    } else if (registered === "true") {
      setError(""); // 清除错误
    }
  });

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await signInWithPassword(email, password);
      // 如果有重定向路径，则使用它；否则使用默认路径
      router.push(redirectPath || SYSTEM_CONFIG.redirectAfterSignIn);
    } catch (err) {
      setError(t("Auth.invalidCredentials"));
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // const handleGitHubLogin = async () => {
  //   setLoading(true);
  //   try {
  //     await supabaseAuth.signInWithOAuth("github");
  //   } catch (err) {
  //     setError("GitHub 登录失败");
  //     console.error(err);
  //     setLoading(false);
  //   }
  // };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      // 将重定向路径添加到 OAuth 登录的 redirectTo URL 中
      await signInWithOAuth("google", redirectPath || "/");
    } catch (err) {
      setError(t("Auth.googleLoginFailed"));
      console.error(err);
      setLoading(false);
    }
  };

  return (
    <div
      className={`
        relative grid h-screen w-screen overflow-hidden
        md:grid-cols-2
      `}
    >
      {/* 渐变背景 */}
      <div className={`
        absolute inset-0 bg-gradient-to-br from-white via-blue-50 to-purple-50
        dark:from-black dark:via-gray-950 dark:to-black
      `} />

      {/* 星空装饰 */}
      <Starfield />
      {/* Left side - Brand info */}
      <div
        className={`
          relative z-10 hidden items-end p-8
          md:flex
        `}
      >
        <div className={`
          text-gray-900
          dark:text-white
        `}>
          <h1 className={`
            bg-gradient-to-r from-gray-900 to-blue-600 bg-clip-text text-4xl
            font-bold text-transparent
            dark:from-white dark:to-blue-200
          `}>
            {SEO_CONFIG.name}
          </h1>
          <p className={`
            mt-4 max-w-md text-lg text-gray-700
            dark:text-white/90
          `}>
            {SEO_CONFIG.slogan}
          </p>
          <div className="mt-6 flex space-x-2">
            <div className="h-2 w-2 animate-pulse rounded-full bg-blue-400" />
            <div className="h-2 w-2 animate-pulse rounded-full bg-purple-400" style={{ animationDelay: '0.5s' }} />
            <div className="h-2 w-2 animate-pulse rounded-full bg-pink-400" style={{ animationDelay: '1s' }} />
          </div>
        </div>
      </div>

      {/* Right side - Login form */}
      <div
        className={`
          relative z-10 flex items-center justify-center p-4
          md:p-8
        `}
      >
        {/* 半透明背景 */}
        <div className="absolute inset-0" />
        <div className="relative z-10 w-full max-w-md space-y-4">
          <div
            className={`
              space-y-4 text-center
              md:text-left
            `}
          >
            <h2 className={`
              text-3xl font-bold text-gray-900
              dark:text-white
            `}>{t("Auth.signIn")}</h2>
            <p className={`
              text-sm text-gray-600
              dark:text-white/70
            `}>
              {t("Auth.signInDescription")}
            </p>
          </div>

          <Card >
            <CardContent className="pt-2">
              <form className="space-y-4" onSubmit={handleEmailLogin}>
                <div className="grid gap-2">
                  <Label className={`
                    text-gray-900
                    dark:text-white
                  `} htmlFor="email">{t("Auth.emailAddress")}</Label>
                  <Input
                    id="email"
                    onChange={(e) => {
                      setEmail(e.target.value);
                    }}
                    placeholder="name@example.com"
                    required
                    type="email"
                    value={email}
                  />
                </div>
                <div className="grid gap-2">
                  <div className="flex items-center justify-between">
                    <Label className={`
                      text-gray-900
                      dark:text-white
                    `} htmlFor="password">{t("Auth.password")}</Label>
                    <Link
                      className={`
                        text-sm text-gray-600
                        hover:text-gray-900 hover:underline
                        dark:text-white/70 dark:hover:text-white
                      `}
                      href="/auth/forgot-password"
                    >
                      {t("Auth.forgotPassword")}
                    </Link>
                  </div>
                  <Input
                    id="password"
                    onChange={(e) => {
                      setPassword(e.target.value);
                    }}
                    required
                    type="password"
                    value={password}
                  />
                </div>
                {error && (
                  <div className="text-sm font-medium text-red-400">
                    {error}
                  </div>
                )}
                {registered === "true" && (
                  <div className="text-sm font-medium text-green-400">
                    {t("Auth.registrationSuccess")}
                  </div>
                )}
                <Button className="w-full" disabled={loading} type="submit">
                  {loading ? t("Auth.signingIn") : t("Auth.signIn")}
                </Button>
              </form>
              <div className="relative mt-6">
                <div className="absolute inset-0 flex items-center">
                  <Separator className="w-full" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className={`
                    bg-white/80 px-2 text-gray-600
                    dark:bg-white/10 dark:text-white/70
                  `}>
                    {t("Auth.orContinueWith")}
                  </span>
                </div>
              </div>
              <div className="mt-6">
                {/* <Button
                  className="flex items-center gap-2"
                  disabled={loading}
                  onClick={handleGitHubLogin}
                  variant="outline"
                >
                  <GitHubIcon className="h-5 w-5" />
                  GitHub
                </Button> */}
                <Button
                  className="flex w-full items-center"
                  disabled={loading}
                  onClick={handleGoogleLogin}
                  variant="outline"
                >
                  <GoogleIcon className="h-5 w-5" />
                  Google
                </Button>
              </div>
              <div className={`
                mt-6 text-center text-sm text-gray-600
                dark:text-white/70
              `}>
                {t("Auth.noAccount")}{" "}
                <Link
                  className={`
                    text-blue-600 underline-offset-4
                    hover:text-blue-800 hover:underline
                    dark:text-blue-400 dark:hover:text-blue-300
                  `}
                  href="/auth/sign-up"
                >
                  {t("Auth.signUp")}
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div >
  );
}
