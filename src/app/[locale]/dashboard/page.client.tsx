"use client";

import type { User } from "@supabase/supabase-js";

import {
  Activity,
  BarChart3,
  Clock,
  Coins,
  CreditCard,
  ImageIcon,
  Palette,
  Settings,
  Sparkles,
  TrendingUp,
  User as UserIcon,
  Zap,
} from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { Badge } from "~/ui/primitives/badge";
import { Button } from "~/ui/primitives/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/ui/primitives/card";
import { Progress } from "~/ui/primitives/progress";
import { Skeleton } from "~/ui/primitives/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/ui/primitives/tabs";

interface DashboardPageProps {
  user: null | User;
}

export function DashboardPageClient({ user }: DashboardPageProps) {
  const t = useTranslations();
  const router = useRouter();
  const [isPending, setIsPending] = useState(true);
  const [stats, setStats] = useState({
    colorizedImages: 0,
    creditsRemaining: 0,
    creditsUsed: 0,
    restoredImages: 0,
    totalImages: 0,
  });

  useEffect(() => {
    const fetchUserStats = async () => {
      if (!user) return;

      try {
        // 这里应该是从API获取用户统计数据的逻辑
        // 模拟API调用和数据获取
        console.log("Fetching stats for user:", user.id);

        // 模拟API响应数据 - 在实际应用中，这里应该是真实的API调用
        const userStats = {
          colorizedImages: 12,
          creditsRemaining: 50,
          creditsUsed: 30,
          restoredImages: 8,
          totalImages: 20,
        };

        // 更新状态
        setStats(userStats);
      } catch (error) {
        console.error("Error fetching user stats:", error);
      } finally {
        // 无论成功还是失败，都将加载状态设为false
        setIsPending(false);
      }
    };

    fetchUserStats();
  }, [user]);

  if (isPending) {
    return (
      <div className="min-h-screen bg-gray-50/50">
        <div className="container mx-auto p-6">
          {/* Header Skeleton */}
          <div className="mb-8">
            <Skeleton className="mb-2 h-8 w-64" />
            <Skeleton className="h-4 w-96" />
          </div>

          {/* Stats Cards Skeleton */}
          <div
            className={`
              mb-8 grid gap-6
              md:grid-cols-2
              lg:grid-cols-4
            `}
          >
            {[...Array(4)].map((_, i) => (
              <Card className="animate-pulse" key={i}>
                <CardContent className="p-6">
                  <div
                    className={`flex items-center justify-between`}
                  >
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-8 w-16" />
                    </div>
                    <Skeleton
                      className={`h-12 w-12 rounded-lg`}
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Main Content Skeleton */}
          <div
            className={`
              grid gap-6
              lg:grid-cols-3
            `}
          >
            <div
              className={`
                space-y-6
                lg:col-span-2
              `}
            >
              <Card className="animate-pulse">
                <CardHeader>
                  <Skeleton className="h-6 w-32" />
                  <Skeleton className="h-4 w-48" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-64 w-full" />
                </CardContent>
              </Card>
            </div>
            <div className="space-y-6">
              <Card className="animate-pulse">
                <CardHeader>
                  <Skeleton className="h-6 w-24" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-32 w-full" />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const creditUsagePercentage =
    stats.creditsUsed > 0
      ? (stats.creditsUsed / (stats.creditsUsed + stats.creditsRemaining)) * 100
      : 0;
  const completionRate =
    stats.totalImages > 0
      ? ((stats.colorizedImages + stats.restoredImages) / stats.totalImages) *
        100
      : 0;

  return (
    <div
      className={`
        min-h-screen bg-gray-50/50
        dark:bg-gray-900/50
      `}
    >
      <div className="container mx-auto p-6">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1
                className={`
                  mb-2 text-3xl font-bold text-gray-900
                  dark:text-gray-100
                `}
              >
                {t("Dashboard.welcome")}
              </h1>
              <p
                className={`
                  text-gray-600
                  dark:text-gray-400
                `}
              >
                {t("Dashboard.welcomeDescription") ||
                  "Track your image processing progress and manage your credits"}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Badge
                className={`
                  border-green-200 bg-green-100 text-green-700
                  dark:border-green-800 dark:bg-green-900/30 dark:text-green-400
                `}
                variant="secondary"
              >
                <div
                  className={`
                    mr-2 h-2 w-2 rounded-full bg-green-500
                    dark:bg-green-400
                  `}
                ></div>
                Active
              </Badge>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div
          className={`
            mb-8 grid gap-6
            md:grid-cols-2
            lg:grid-cols-4
          `}
        >
          {/* Total Images */}
          <Card
            className={`
              relative overflow-hidden border-0 shadow-sm transition-all
              duration-200
              hover:shadow-md
              dark:bg-gray-800/50 dark:hover:shadow-lg
            `}
          >
            <div
              className={`
                absolute top-0 left-0 h-1 w-full bg-gradient-to-r from-blue-500
                to-blue-600
                dark:from-blue-400 dark:to-blue-500
              `}
            ></div>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p
                    className={`
                      mb-1 text-sm font-medium text-gray-600
                      dark:text-gray-400
                    `}
                  >
                    {t("Dashboard.totalImages")}
                  </p>
                  <p
                    className={`
                      text-3xl font-bold text-gray-900
                      dark:text-gray-100
                    `}
                  >
                    {stats.totalImages}
                  </p>
                  <p
                    className={`
                      mt-1 text-xs text-gray-500
                      dark:text-gray-400
                    `}
                  >
                    {t("Dashboard.allTimeTotal")}
                  </p>
                </div>
                <div
                  className={`
                    flex h-12 w-12 items-center justify-center rounded-lg
                    bg-blue-100
                    dark:bg-blue-900/30
                  `}
                >
                  <ImageIcon
                    className={`
                      h-6 w-6 text-blue-600
                      dark:text-blue-400
                    `}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Colorized Images */}
          <Card
            className={`
              relative overflow-hidden border-0 shadow-sm transition-all
              duration-200
              hover:shadow-md
              dark:bg-gray-800/50 dark:hover:shadow-lg
            `}
          >
            <div
              className={`
                absolute top-0 left-0 h-1 w-full bg-gradient-to-r
                from-purple-500 to-purple-600
                dark:from-purple-400 dark:to-purple-500
              `}
            ></div>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p
                    className={`
                      mb-1 text-sm font-medium text-gray-600
                      dark:text-gray-400
                    `}
                  >
                    {t("Dashboard.colorizedImages")}
                  </p>
                  <p
                    className={`
                      text-3xl font-bold text-gray-900
                      dark:text-gray-100
                    `}
                  >
                    {stats.colorizedImages}
                  </p>
                  <p
                    className={`
                      mt-1 text-xs text-gray-500
                      dark:text-gray-400
                    `}
                  >
                    {t("Dashboard.successfullyProcessed")}
                  </p>
                </div>
                <div
                  className={`
                    flex h-12 w-12 items-center justify-center rounded-lg
                    bg-purple-100
                    dark:bg-purple-900/30
                  `}
                >
                  <Palette
                    className={`
                      h-6 w-6 text-purple-600
                      dark:text-purple-400
                    `}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Restored Images */}
          <Card
            className={`
              relative overflow-hidden border-0 shadow-sm transition-all
              duration-200
              hover:shadow-md
              dark:bg-gray-800/50 dark:hover:shadow-lg
            `}
          >
            <div
              className={`
                absolute top-0 left-0 h-1 w-full bg-gradient-to-r from-green-500
                to-green-600
                dark:from-green-400 dark:to-green-500
              `}
            ></div>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p
                    className={`
                      mb-1 text-sm font-medium text-gray-600
                      dark:text-gray-400
                    `}
                  >
                    {t("Dashboard.restoredImages")}
                  </p>
                  <p
                    className={`
                      text-3xl font-bold text-gray-900
                      dark:text-gray-100
                    `}
                  >
                    {stats.restoredImages}
                  </p>
                  <p
                    className={`
                      mt-1 text-xs text-gray-500
                      dark:text-gray-400
                    `}
                  >
                    {t("Dashboard.enhancedQuality")}
                  </p>
                </div>
                <div
                  className={`
                    flex h-12 w-12 items-center justify-center rounded-lg
                    bg-green-100
                    dark:bg-green-900/30
                  `}
                >
                  <Sparkles
                    className={`
                      h-6 w-6 text-green-600
                      dark:text-green-400
                    `}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Credits Used */}
          <Card
            className={`
              relative overflow-hidden border-0 shadow-sm transition-all
              duration-200
              hover:shadow-md
              dark:bg-gray-800/50 dark:hover:shadow-lg
            `}
          >
            <div
              className={`
                absolute top-0 left-0 h-1 w-full bg-gradient-to-r
                from-orange-500 to-orange-600
                dark:from-orange-400 dark:to-orange-500
              `}
            ></div>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p
                    className={`
                      mb-1 text-sm font-medium text-gray-600
                      dark:text-gray-400
                    `}
                  >
                    {t("Dashboard.creditsUsed")}
                  </p>
                  <p
                    className={`
                      text-3xl font-bold text-gray-900
                      dark:text-gray-100
                    `}
                  >
                    {stats.creditsUsed}
                  </p>
                  <p
                    className={`
                      mt-1 text-xs text-gray-500
                      dark:text-gray-400
                    `}
                  >
                    {t("Dashboard.thisMonth")}
                  </p>
                </div>
                <div
                  className={`
                    flex h-12 w-12 items-center justify-center rounded-lg
                    bg-orange-100
                    dark:bg-orange-900/30
                  `}
                >
                  <CreditCard
                    className={`
                      h-6 w-6 text-orange-600
                      dark:text-orange-400
                    `}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Credits Remaining */}
          <Card
            className={`
              relative overflow-hidden border-0 shadow-sm transition-all
              duration-200
              hover:shadow-md
              dark:bg-gray-800/50 dark:hover:shadow-lg
            `}
          >
            <div
              className={`
                absolute top-0 left-0 h-1 w-full bg-gradient-to-r
                from-emerald-500 to-emerald-600
                dark:from-emerald-400 dark:to-emerald-500
              `}
            ></div>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p
                    className={`
                      mb-1 text-sm font-medium text-gray-600
                      dark:text-gray-400
                    `}
                  >
                    {t("Dashboard.creditsRemaining")}
                  </p>
                  <p
                    className={`
                      text-3xl font-bold text-gray-900
                      dark:text-gray-100
                    `}
                  >
                    {stats.creditsRemaining}
                  </p>
                  <p
                    className={`
                      mt-1 text-xs text-gray-500
                      dark:text-gray-400
                    `}
                  >
                    {t("Dashboard.availableNow")}
                  </p>
                </div>
                <div
                  className={`
                    flex h-12 w-12 items-center justify-center rounded-lg
                    bg-emerald-100
                    dark:bg-emerald-900/30
                  `}
                >
                  <Coins
                    className={`
                      h-6 w-6 text-emerald-600
                      dark:text-emerald-400
                    `}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs className="space-y-6" defaultValue="overview">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger className="flex items-center gap-2" value="overview">
              <BarChart3 className="h-4 w-4" />
              {t("Dashboard.overview")}
            </TabsTrigger>
            <TabsTrigger className="flex items-center gap-2" value="activity">
              <Activity className="h-4 w-4" />
              {t("Dashboard.activity")}
            </TabsTrigger>
            <TabsTrigger className="flex items-center gap-2" value="credits">
              <Coins className="h-4 w-4" />
              {t("Dashboard.credits")}
            </TabsTrigger>
          </TabsList>

          <TabsContent className="space-y-6" value="overview">
            <div
              className={`
                grid gap-6
                lg:grid-cols-3
              `}
            >
              <div
                className={`
                  space-y-6
                  lg:col-span-2
                `}
              >
                {/* Quick Actions */}
                <Card className="dark:bg-gray-800/50">
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Zap
                        className={`
                          h-5 w-5 text-indigo-600
                          dark:text-indigo-400
                        `}
                      />
                      <CardTitle
                        className={`
                          text-xl font-semibold text-gray-900
                          dark:text-gray-100
                        `}
                      >
                        {t("Dashboard.quickActions")}
                      </CardTitle>
                    </div>
                    <CardDescription
                      className={`
                        text-gray-600
                        dark:text-gray-400
                      `}
                    >
                      {t("Dashboard.quickActionsDescription")}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div
                      className={`
                        grid gap-4
                        md:grid-cols-3
                      `}
                    >
                      <Button
                        asChild
                        className={`
                          h-auto flex-col gap-2 rounded-lg bg-gradient-to-br
                          from-blue-500 to-blue-600 p-6 text-white shadow-sm
                          transition-all
                          hover:shadow-md
                          dark:from-blue-600 dark:to-blue-700
                        `}
                      >
                        <Link href="/colorize">
                          <Palette className="h-8 w-8" />
                          <div className="text-center">
                            <div
                              className={`mb-1 font-medium text-white`}
                            >
                              {t("Dashboard.processImages")}
                            </div>
                            <div
                              className={`text-center text-sm text-blue-100`}
                            >
                              {t("Dashboard.colorizeRestore")}
                            </div>
                          </div>
                        </Link>
                      </Button>

                      <Button
                        asChild
                        className={`
                          h-auto flex-col gap-2 rounded-lg border-gray-200 p-6
                          transition-all
                          hover:bg-gray-50
                          dark:border-gray-700 dark:hover:bg-gray-800/50
                        `}
                        variant="outline"
                      >
                        <Link href="/profile">
                          <UserIcon
                            className={`h-8 w-8`}
                          />
                          <div className="text-center">
                            <div
                              className={`
                                mb-1 font-medium text-gray-900
                                dark:text-gray-100
                              `}
                            >
                              {t("Dashboard.editProfile")}
                            </div>
                            <div
                              className={`
                                text-center text-sm text-gray-500
                                dark:text-gray-400
                              `}
                            >
                              {t("Dashboard.manageAccount")}
                            </div>
                          </div>
                        </Link>
                      </Button>

                      <Button
                        asChild
                        className={`
                          h-auto flex-col gap-2 rounded-lg border-gray-200 p-6
                          transition-all
                          hover:bg-gray-50
                          dark:border-gray-700 dark:hover:bg-gray-800/50
                        `}
                        variant="outline"
                      >
                        <Link href="/settings">
                          <Settings
                            className={`h-8 w-8`}
                          />
                          <div className="text-center">
                            <div
                              className={`
                                mb-1 font-medium text-gray-900
                                dark:text-gray-100
                              `}
                            >
                              {t("Dashboard.settings")}
                            </div>
                            <div
                              className={`
                                text-center text-sm text-gray-500
                                dark:text-gray-400
                              `}
                            >
                              {t("Dashboard.preferences")}
                            </div>
                          </div>
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Progress Overview */}
                <Card className="dark:bg-gray-800/50">
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <TrendingUp
                        className={`
                          h-5 w-5 text-cyan-600
                          dark:text-cyan-400
                        `}
                      />
                      <CardTitle
                        className={`
                          text-xl font-semibold text-gray-900
                          dark:text-gray-100
                        `}
                      >
                        {t("Dashboard.progressOverview")}
                      </CardTitle>
                    </div>
                    <CardDescription
                      className={`
                        text-gray-600
                        dark:text-gray-400
                      `}
                    >
                      {t("Dashboard.progressDescription")}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <div
                        className={`flex justify-between`}
                      >
                        <span
                          className={`
                            text-sm font-medium text-gray-700
                            dark:text-gray-300
                          `}
                        >
                          {t("Dashboard.completionRate")}
                        </span>
                        <span
                          className={`
                            text-sm text-gray-500
                            dark:text-gray-400
                          `}
                        >
                          {completionRate.toFixed(1)}%
                        </span>
                      </div>
                      <Progress className="h-2" value={completionRate} />
                    </div>

                    <div className="space-y-2">
                      <div
                        className={`flex justify-between`}
                      >
                        <span
                          className={`
                            text-sm font-medium text-gray-700
                            dark:text-gray-300
                          `}
                        >
                          {t("Dashboard.creditUsage")}
                        </span>
                        <span
                          className={`
                            text-sm text-gray-500
                            dark:text-gray-400
                          `}
                        >
                          {creditUsagePercentage.toFixed(1)}%
                        </span>
                      </div>
                      <Progress className="h-2" value={creditUsagePercentage} />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div
                        className={`
                          rounded-lg bg-gray-50 p-4 text-center
                          dark:bg-gray-800/50
                        `}
                      >
                        <div
                          className={`flex items-center justify-center gap-2`}
                        >
                          <Palette
                            className={`
                              h-5 w-5 text-purple-600
                              dark:text-purple-400
                            `}
                          />
                          <div>
                            <div
                              className={`
                                text-2xl font-bold text-gray-900
                                dark:text-gray-100
                              `}
                            >
                              {stats.colorizedImages}
                            </div>
                            <p
                              className={`
                                text-xs text-gray-500
                                dark:text-gray-400
                              `}
                            >
                              Colorized
                            </p>
                          </div>
                        </div>
                      </div>
                      <div
                        className={`
                          rounded-lg bg-gray-50 p-4 text-center
                          dark:bg-gray-800/50
                        `}
                      >
                        <div
                          className={`flex items-center justify-center gap-2`}
                        >
                          <Sparkles
                            className={`
                              h-5 w-5 text-green-600
                              dark:text-green-400
                            `}
                          />
                          <div>
                            <div
                              className={`
                                text-2xl font-bold text-gray-900
                                dark:text-gray-100
                              `}
                            >
                              {stats.restoredImages}
                            </div>
                            <p
                              className={`
                                text-xs text-gray-500
                                dark:text-gray-400
                              `}
                            >
                              Restored
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-6">
                {/* Credits Balance */}
                <Card className="dark:bg-gray-800/50">
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Coins
                        className={`
                          h-5 w-5 text-yellow-600
                          dark:text-yellow-400
                        `}
                      />
                      <CardTitle
                        className={`
                          text-lg font-semibold text-gray-900
                          dark:text-gray-100
                        `}
                      >
                        {t("Dashboard.creditsBalance")}
                      </CardTitle>
                    </div>
                    <CardDescription
                      className={`
                        text-gray-600
                        dark:text-gray-400
                      `}
                    >
                      {t("Dashboard.creditsDescription")}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-center">
                      <div
                        className={`
                          mb-2 text-4xl font-bold text-gray-900
                          dark:text-gray-100
                        `}
                      >
                        {stats.creditsRemaining}
                      </div>
                      <p
                        className={`
                          mb-4 text-sm text-gray-500
                          dark:text-gray-400
                        `}
                      >
                        {t("Dashboard.creditsAvailable")}
                      </p>
                      <Button
                        asChild
                        className={`
                          w-full bg-gradient-to-r from-yellow-500 to-yellow-600
                          text-white
                          hover:from-yellow-600 hover:to-yellow-700
                          dark:from-yellow-600 dark:to-yellow-700
                        `}
                      >
                        <Link href="/credits">
                          <CreditCard
                            className={`mr-2 h-4 w-4`}
                          />
                          {t("Dashboard.buyCredits")}
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Recent Activity */}
                <Card className="dark:bg-gray-800/50">
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Activity
                        className={`
                          h-5 w-5 text-gray-600
                          dark:text-gray-400
                        `}
                      />
                      <CardTitle
                        className={`
                          text-lg font-semibold text-gray-900
                          dark:text-gray-100
                        `}
                      >
                        {t("Dashboard.recentActivity")}
                      </CardTitle>
                    </div>
                    <CardDescription
                      className={`
                        text-gray-600
                        dark:text-gray-400
                      `}
                    >
                      {t("Dashboard.activityDescription")}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div
                      className={`
                        flex flex-col items-center justify-center rounded-lg
                        bg-gray-100 p-8
                        dark:bg-gray-800/50
                      `}
                    >
                      <Clock
                        className={`
                          h-6 w-6 text-gray-400
                          dark:text-gray-500
                        `}
                      />
                      <p className="mt-2 text-center">
                        <span
                          className={`
                            text-sm text-gray-500
                            dark:text-gray-400
                          `}
                        >
                          {t("Dashboard.noRecentActivity")}
                        </span>
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Achievement Badge */}
                <Card className="dark:bg-gray-800/50">
                  <CardContent className="p-6">
                    <div className="text-center">
                      <div
                        className={`
                          mx-auto mb-3 flex h-16 w-16 items-center
                          justify-center rounded-full bg-gradient-to-br
                          from-purple-500 to-pink-500
                          dark:from-purple-600 dark:to-pink-600
                        `}
                      >
                        <Sparkles
                          className={`h-8 w-8 text-white`}
                        />
                      </div>
                      <h3
                        className={`
                          mb-2 font-semibold text-gray-900
                          dark:text-gray-100
                        `}
                      >
                        Getting Started
                      </h3>
                      <p
                        className={`
                          mb-4 text-sm text-gray-600
                          dark:text-gray-400
                        `}
                      >
                        Welcome to your dashboard! Start by uploading your first
                        image.
                      </p>
                      <Button
                        asChild
                        className={`
                          bg-gradient-to-r from-purple-500 to-pink-500
                          text-white
                          hover:from-purple-600 hover:to-pink-600
                          dark:from-purple-600 dark:to-pink-600
                        `}
                        size="sm"
                      >
                        <Link href="/colorize">
                          {t("Dashboard.getStarted")}
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="activity">
            <Card className="dark:bg-gray-800/50">
              <CardHeader>
                <CardTitle
                  className={`
                    text-gray-900
                    dark:text-gray-100
                  `}
                >
                  {t("Dashboard.recentActivity")}
                </CardTitle>
                <CardDescription
                  className={`
                    text-gray-600
                    dark:text-gray-400
                  `}
                >
                  {t("Dashboard.activityDescription")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div
                  className={`
                    flex flex-col items-center justify-center rounded-lg
                    bg-gray-100 p-12
                    dark:bg-gray-800/50
                  `}
                >
                  <Clock
                    className={`
                      h-8 w-8 text-gray-400
                      dark:text-gray-500
                    `}
                  />
                  <p className="mt-4 text-center">
                    <span
                      className={`
                        text-gray-500
                        dark:text-gray-400
                      `}
                    >
                      {t("Dashboard.noRecentActivity")}
                    </span>
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="credits">
            <div
              className={`
                grid gap-6
                lg:grid-cols-2
              `}
            >
              <Card className="dark:bg-gray-800/50">
                <CardHeader>
                  <CardTitle
                    className={`
                      text-gray-900
                      dark:text-gray-100
                    `}
                  >
                    {t("Dashboard.creditsBalance")}
                  </CardTitle>
                  <CardDescription
                    className={`
                      text-gray-600
                      dark:text-gray-400
                    `}
                  >
                    {t("Dashboard.creditsDescription")}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div
                      className={`
                        mb-2 text-4xl font-bold text-gray-900
                        dark:text-gray-100
                      `}
                    >
                      {stats.creditsRemaining}
                    </div>
                    <p
                      className={`
                        mb-4 text-sm text-gray-500
                        dark:text-gray-400
                      `}
                    >
                      {t("Dashboard.creditsAvailable")}
                    </p>
                    <Button
                      asChild
                      className={`
                        w-full bg-gradient-to-r from-yellow-500 to-yellow-600
                        text-white
                        hover:from-yellow-600 hover:to-yellow-700
                        dark:from-yellow-600 dark:to-yellow-700
                      `}
                    >
                      <Link href="/credits">
                        <CreditCard
                          className={`mr-2 h-4 w-4`}
                        />
                        {t("Dashboard.buyCredits")}
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="dark:bg-gray-800/50">
                <CardHeader>
                  <CardTitle
                    className={`
                      text-gray-900
                      dark:text-gray-100
                    `}
                  >
                    {t("Dashboard.usageHistory")}
                  </CardTitle>
                  <CardDescription
                    className={`
                      text-gray-600
                      dark:text-gray-400
                    `}
                  >
                    {t("Dashboard.historyDescription")}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div
                    className={`
                      flex flex-col items-center justify-center rounded-lg
                      bg-gray-100 p-8
                      dark:bg-gray-800/50
                    `}
                  >
                    <Clock
                      className={`
                        h-6 w-6 text-gray-400
                        dark:text-gray-500
                      `}
                    />
                    <p className="mt-2 text-center">
                      <span
                        className={`
                          text-sm text-gray-500
                          dark:text-gray-400
                        `}
                      >
                        {t("Dashboard.noHistory")}
                      </span>
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
