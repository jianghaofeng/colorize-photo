"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

import { SEO_CONFIG, SYSTEM_CONFIG } from "~/app";
import { supabaseAuth } from "~/lib/supabase-auth-client";
import { GitHubIcon } from "~/ui/components/icons/github";
import { GoogleIcon } from "~/ui/components/icons/google";
import { Button } from "~/ui/primitives/button";
import { Card, CardContent } from "~/ui/primitives/card";
import { Input } from "~/ui/primitives/input";
import { Label } from "~/ui/primitives/label";
import { Separator } from "~/ui/primitives/separator";

export function SignInPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // 检查 URL 参数中是否有错误信息
  const errorFromParams = searchParams.get("error");
  const registered = searchParams.get("registered");

  // 如果存在错误参数，设置错误信息
  useState(() => {
    if (errorFromParams === "callback_error") {
      setError("第三方登录失败，请稍后再试");
    } else if (registered === "true") {
      setError(""); // 清除错误
    }
  });

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { error: signInError } = await supabaseAuth.signInWithPassword(
        email,
        password
      );

      if (signInError) {
        throw signInError;
      }

      router.push(SYSTEM_CONFIG.redirectAfterSignIn);
    } catch (err) {
      setError("邮箱或密码无效");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleGitHubLogin = async () => {
    setLoading(true);
    try {
      await supabaseAuth.signInWithOAuth("github");
    } catch (err) {
      setError("GitHub 登录失败");
      console.error(err);
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      await supabaseAuth.signInWithOAuth("google");
    } catch (err) {
      setError("Google 登录失败");
      console.error(err);
      setLoading(false);
    }
  };

  return (
    <div
      className={`
        grid h-screen w-screen
        md:grid-cols-2
      `}
    >
      {/* Left side - Image */}
      <div
        className={`
          relative hidden
          md:block
        `}
      >
        <Image
          alt="Sign-in background image"
          className="object-cover"
          fill
          priority
          sizes="(max-width: 768px) 0vw, 50vw"
          src="https://images.unsplash.com/photo-1719811059181-09032aef07b8?q=80&w=1200&auto=format&fit=crop&ixlib=rb-4.0.3"
        />
        <div
          className={`
            absolute inset-0 bg-gradient-to-t from-background/80 to-transparent
          `}
        />
        <div className="absolute bottom-8 left-8 z-10 text-white">
          <h1 className="text-3xl font-bold">{SEO_CONFIG.name}</h1>
          <p className="mt-2 max-w-md text-sm text-white/80">
            {SEO_CONFIG.slogan}
          </p>
        </div>
      </div>

      {/* Right side - Login form */}
      <div
        className={`
          flex items-center justify-center p-4
          md:p-8
        `}
      >
        <div className="w-full max-w-md space-y-4">
          <div
            className={`
              space-y-4 text-center
              md:text-left
            `}
          >
            <h2 className="text-3xl font-bold">登录</h2>
            <p className="text-sm text-muted-foreground">
              输入您的凭据访问您的账户
            </p>
          </div>

          <Card className="border-none shadow-sm">
            <CardContent className="pt-2">
              <form className="space-y-4" onSubmit={handleEmailLogin}>
                <div className="grid gap-2">
                  <Label htmlFor="email">邮箱</Label>
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
                    <Label htmlFor="password">密码</Label>
                    <Link
                      className={`
                        text-sm text-muted-foreground
                        hover:underline
                      `}
                      href="/auth/forgot-password"
                    >
                      忘记密码?
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
                  <div className="text-sm font-medium text-destructive">
                    {error}
                  </div>
                )}
                {registered === "true" && (
                  <div className="text-sm font-medium text-green-600">
                    注册成功！请登录。
                  </div>
                )}
                <Button className="w-full" disabled={loading} type="submit">
                  {loading ? "登录中..." : "登录"}
                </Button>
              </form>
              <div className="relative mt-6">
                <div className="absolute inset-0 flex items-center">
                  <Separator className="w-full" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    或继续使用
                  </span>
                </div>
              </div>
              <div className="mt-6 grid grid-cols-2 gap-4">
                <Button
                  className="flex items-center gap-2"
                  disabled={loading}
                  onClick={handleGitHubLogin}
                  variant="outline"
                >
                  <GitHubIcon className="h-5 w-5" />
                  GitHub
                </Button>
                <Button
                  className="flex items-center gap-2"
                  disabled={loading}
                  onClick={handleGoogleLogin}
                  variant="outline"
                >
                  <GoogleIcon className="h-5 w-5" />
                  Google
                </Button>
              </div>
              <div className="mt-6 text-center text-sm text-muted-foreground">
                还没有账户?{" "}
                <Link
                  className={`
                    text-primary underline-offset-4
                    hover:underline
                  `}
                  href="/auth/sign-up"
                >
                  注册
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
