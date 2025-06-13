"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

import { SEO_CONFIG } from "~/app";
import { supabaseAuth } from "~/lib/supabase-auth-client";
import { Button } from "~/ui/primitives/button";
import { Card, CardContent } from "~/ui/primitives/card";
import { Input } from "~/ui/primitives/input";
import { Label } from "~/ui/primitives/label";

export function ForgotPasswordClient() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setLoading(true);

    try {
      const { error: resetError } = await supabaseAuth.resetPassword(email);

      if (resetError) {
        throw resetError;
      }

      // 重置成功
      setSuccess(true);
    } catch (err) {
      console.error("密码重置错误:", err);
      setError("无法发送重置密码邮件，请稍后再试");
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
          alt="Forgot password background image"
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
            <p className="text-sm text-muted-foreground">
              输入您的邮箱地址，我们将发送重置密码的链接
            </p>
          </div>

          <Card className="border-none shadow-sm">
            <CardContent className="pt-4">
              {success ? (
                <div className="space-y-4">
                  <div className="rounded-lg bg-green-50 p-4 text-green-800">
                    <p>重置密码链接已发送至您的邮箱。</p>
                    <p className="mt-2 text-sm">
                      请查看您的邮箱并点击链接重置密码。如果没有收到邮件，请检查您的垃圾邮件文件夹。
                    </p>
                  </div>
                  <Button asChild className="w-full">
                    <Link href="/auth/sign-in">返回登录</Link>
                  </Button>
                </div>
              ) : (
                <form className="space-y-4" onSubmit={handleResetPassword}>
                  <div className="grid gap-2">
                    <Label htmlFor="email">邮箱</Label>
                    <Input
                      id="email"
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@example.com"
                      required
                      type="email"
                      value={email}
                    />
                  </div>
                  {error && (
                    <div className="text-sm font-medium text-destructive">
                      {error}
                    </div>
                  )}
                  <Button className="w-full" disabled={loading} type="submit">
                    {loading ? "发送中..." : "发送重置链接"}
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
