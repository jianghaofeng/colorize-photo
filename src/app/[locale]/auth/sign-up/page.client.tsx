"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { SEO_CONFIG } from "~/app";
import { supabaseAuth } from "~/lib/supabase-auth-client";
import { GitHubIcon } from "~/ui/components/icons/github";
import { GoogleIcon } from "~/ui/components/icons/google";
import { Button } from "~/ui/primitives/button";
import { Card, CardContent } from "~/ui/primitives/card";
import { Input } from "~/ui/primitives/input";
import { Label } from "~/ui/primitives/label";
import { Separator } from "~/ui/primitives/separator";

export function SignUpPageClient() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: "",
    name: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { error: signUpError } = await supabaseAuth.signUpWithPassword(
        formData.email,
        formData.password,
        {
          data: {
            name: formData.name,
          },
        }
      );

      if (signUpError) {
        throw signUpError;
      }

      router.push("/auth/sign-in?registered=true");
    } catch (err: any) {
      if (err.message?.includes("email") || err.message?.includes("Email")) {
        setError("该邮箱已被注册，请尝试使用其他邮箱");
      } else {
        setError("注册失败，请稍后再试");
      }
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleGitHubSignUp = async () => {
    setLoading(true);
    try {
      await supabaseAuth.signInWithOAuth("github");
    } catch (err) {
      setError("GitHub 注册失败");
      console.error(err);
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setLoading(true);
    try {
      await supabaseAuth.signInWithOAuth("google");
    } catch (err) {
      setError("Google 注册失败");
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
          alt="Sign-up background image"
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

      {/* Right side - Sign up form */}
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
            <h2 className="text-3xl font-bold">创建账户</h2>
            <p className="text-sm text-muted-foreground">
              输入您的详细信息创建账户
            </p>
          </div>

          <Card className="border-none shadow-sm">
            <CardContent className="pt-2">
              <form className="space-y-4" onSubmit={handleSubmit}>
                <div className="grid gap-2">
                  <Label htmlFor="name">姓名</Label>
                  <Input
                    id="name"
                    name="name"
                    onChange={handleChange}
                    placeholder="张三"
                    required
                    type="text"
                    value={formData.name}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">邮箱</Label>
                  <Input
                    id="email"
                    name="email"
                    onChange={handleChange}
                    placeholder="name@example.com"
                    required
                    type="email"
                    value={formData.email}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="password">密码</Label>
                  <Input
                    id="password"
                    name="password"
                    onChange={handleChange}
                    required
                    type="password"
                    value={formData.password}
                  />
                </div>
                {error && (
                  <div className="text-sm font-medium text-destructive">
                    {error}
                  </div>
                )}
                <Button className="w-full" disabled={loading} type="submit">
                  {loading ? "创建账户中..." : "创建账户"}
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
                  onClick={handleGitHubSignUp}
                  variant="outline"
                >
                  <GitHubIcon className="h-5 w-5" />
                  GitHub
                </Button>
                <Button
                  className="flex items-center gap-2"
                  disabled={loading}
                  onClick={handleGoogleSignUp}
                  variant="outline"
                >
                  <GoogleIcon className="h-5 w-5" />
                  Google
                </Button>
              </div>
              <div className="mt-6 text-center text-sm text-muted-foreground">
                已有账户?{" "}
                <Link
                  className={`
                    text-primary underline-offset-4
                    hover:underline
                  `}
                  href="/auth/sign-in"
                >
                  登录
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
