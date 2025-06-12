"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

import { SEO_CONFIG } from "~/app";
import { supabaseClient } from "~/lib/supabase-auth-client";
import { Button } from "~/ui/primitives/button";
import { Card, CardContent } from "~/ui/primitives/card";
import { Input } from "~/ui/primitives/input";
import { Label } from "~/ui/primitives/label";

export function ResetPasswordClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // 验证密码匹配
    if (password !== confirmPassword) {
      setError("密码不匹配");
      setLoading(false);
      return;
    }

    // 验证密码强度
    if (password.length < 8) {
      setError("密码至少需要8个字符");
      setLoading(false);
      return;
    }

    try {
      // 使用 Supabase 更新密码
      const { error: updateError } = await supabaseClient.auth.updateUser({
        password,
      });

      if (updateError) {
        throw updateError;
      }

      // 密码重置成功
      setSuccess(true);

      // 3秒后重定向到登录页面
      setTimeout(() => {
        router.push("/auth/sign-in?reset=success");
      }, 3000);
    } catch (err) {
      console.error("重置密码错误:", err);
      setError("无法重置密码，请稍后再试");
    } finally {
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
          alt="Reset password background image"
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

      {/* Right side - Reset password form */}
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
            <h2 className="text-3xl font-bold">重置密码</h2>
            <p className="text-sm text-muted-foreground">请输入您的新密码</p>
          </div>

          <Card className="border-none shadow-sm">
            <CardContent className="pt-4">
              {success ? (
                <div className="space-y-4">
                  <div className="rounded-lg bg-green-50 p-4 text-green-800">
                    <p>密码已成功重置！</p>
                    <p className="mt-2 text-sm">
                      您将在几秒钟后被重定向到登录页面。
                    </p>
                  </div>
                </div>
              ) : (
                <form className="space-y-4" onSubmit={handleResetPassword}>
                  <div className="grid gap-2">
                    <Label htmlFor="password">新密码</Label>
                    <Input
                      id="password"
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      type="password"
                      value={password}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="confirmPassword">确认密码</Label>
                    <Input
                      id="confirmPassword"
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      type="password"
                      value={confirmPassword}
                    />
                  </div>
                  {error && (
                    <div className="text-sm font-medium text-destructive">
                      {error}
                    </div>
                  )}
                  <Button className="w-full" disabled={loading} type="submit">
                    {loading ? "重置中..." : "重置密码"}
                  </Button>
                  <div className="text-center text-sm text-muted-foreground">
                    <Link
                      className={`
                        text-primary
                        hover:underline
                      `}
                      href="/auth/sign-in"
                    >
                      返回登录
                    </Link>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
