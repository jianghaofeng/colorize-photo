"use client";

import { format } from "date-fns";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { useEffect, useState } from "react";

import type { UserGenerateRecord } from "~/db/schema";

import { useCredits } from "~/hooks/use-credits";
import { usePayment } from "~/hooks/use-payment";
import { formatCurrency } from "~/lib/format";
import { createClient } from "~/lib/supabase/client";
import { Badge } from "~/ui/primitives/badge";
import { Button } from "~/ui/primitives/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/ui/primitives/card";
import { Skeleton } from "~/ui/primitives/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/ui/primitives/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/ui/primitives/tabs";

export default function ProfilePage() {
  const t = useTranslations();
  const supabase = createClient();
  const { creditPackages, credits, fetchCredits } = useCredits();
  const {
    closePayment,
    paymentStatus,
    selectedPlan,
    setSelectedPlan,
    showPayment,
  } = usePayment();

  const [generationHistory, setGenerationHistory] = useState<
    UserGenerateRecord[]
  >([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);

  // 获取生成历史记录
  useEffect(() => {
    const fetchGenerationHistory = async () => {
      try {
        setIsLoadingHistory(true);
        const { data, error: fetchError } = await supabase
          .from("user_generate_records")
          .select("*")
          .order("created_at", { ascending: false });

        if (fetchError) {
          console.error("Error fetching generation history:", fetchError);
          return;
        }

        setGenerationHistory(data || []);
      } catch (err) {
        console.error(t("profile.fetchHistoryError"), err);
      } finally {
        setIsLoadingHistory(false);
      }
    };

    fetchGenerationHistory();
  }, [supabase]);

  // 格式化时间
  const formatTime = (timestamp: string) => {
    try {
      return format(new Date(timestamp), "yyyy-MM-dd HH:mm:ss");
    } catch (err) {
      console.error("Error formatting time:", err);
      return timestamp;
    }
  };

  // 获取交易类型标签
  const getTransactionTypeLabel = (type: string) => {
    const typeMap: Record<string, string> = {
      CONSUMPTION: t("profile.transactionTypes.CONSUMPTION"),
      PURCHASE: t("profile.transactionTypes.PURCHASE"),
      REFUND: t("profile.transactionTypes.REFUND"),
      REWARD: t("profile.transactionTypes.REWARD"),
    };
    return typeMap[type] || type;
  };

  // 获取功能名称
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const getFeatureName = (feature: null | string) => {
    if (!feature) return t("profile.features.unknown");

    const featureMap: Record<string, string> = {
      colorize: t("profile.features.colorize"),
      video_colorize: t("profile.features.video_colorize"),
    };

    return featureMap[feature] || feature;
  };

  // 处理充值
  const handleTopUp = (packageId: string) => {
    setSelectedPlan(packageId);
  };

  // 支付成功处理
  useEffect(() => {
    if (paymentStatus === "success") {
      refreshCredits();
    }
  }, [paymentStatus]);

  // 刷新积分数据
  const refreshCredits = () => {
    fetchCredits();
    closePayment();
  };

  // 关闭支付弹窗
  const handleClosePayment = () => {
    closePayment();
  };

  return (
    <div className="container mx-auto py-10">
      <h1 className="mb-6 text-3xl font-bold">{t("profile.title")}</h1>

      {/* 积分概览卡片 */}
      <div
        className={`
          mb-8 grid gap-4
          md:grid-cols-3
        `}
      >
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>{t("profile.currentCredits")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{credits?.balance || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>{t("profile.totalEarned")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {credits?.totalEarned || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>{t("profile.totalSpent")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{credits?.totalSpent || 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* 主要内容区域 */}
      <Tabs defaultValue="credits">
        <TabsList className="mb-4">
          <TabsTrigger value="credits">
            {t("profile.creditsOverview")}
          </TabsTrigger>
          <TabsTrigger value="history">
            {t("profile.transactionHistory")}
          </TabsTrigger>
          <TabsTrigger value="generations">
            {t("profile.generationHistory")}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="credits">
          <div
            className={`
              grid gap-6
              md:grid-cols-2
            `}
          >
            {/* 最近交易 */}
            <Card>
              <CardHeader>
                <CardTitle>{t("profile.recentTransactions")}</CardTitle>
                <CardDescription>
                  {t("profile.currentCredits")}: {credits?.balance || 0}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {credits?.transactions && credits.transactions.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t("profile.type")}</TableHead>
                        <TableHead>{t("profile.description")}</TableHead>
                        <TableHead>{t("profile.amount")}</TableHead>
                        <TableHead>{t("profile.balance")}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {credits.transactions.slice(0, 5).map((transaction) => (
                        <TableRow key={transaction.id}>
                          <TableCell>
                            <Badge
                              variant={
                                transaction.type === "CONSUMPTION"
                                  ? "destructive"
                                  : "default"
                              }
                            >
                              {getTransactionTypeLabel(transaction.type)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {transaction.description || "-"}
                          </TableCell>
                          <TableCell>{transaction.amount}</TableCell>
                          <TableCell>{transaction.balance}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="py-4 text-center">
                    {t("Payment.noTransactions")}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* 积分套餐 */}
            <Card>
              <CardHeader>
                <CardTitle>{t("profile.creditPackages")}</CardTitle>
                <CardDescription>
                  {t("profile.purchaseCredits")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {creditPackages ? (
                    creditPackages.map((pkg) => (
                      <Card className="overflow-hidden" key={pkg.id}>
                        <div className="flex">
                          <div className="flex-1 p-4">
                            <div className="font-semibold">
                              {pkg.name}
                              {pkg.isRecommended && (
                                <Badge className="ml-2" variant="outline">
                                  {t("profile.recommended")}
                                </Badge>
                              )}
                            </div>
                            <div className="mt-1 text-2xl font-bold">
                              {t("profile.credits")}: {pkg.credits}
                            </div>
                            <div className="mt-1 text-muted-foreground">
                              {formatCurrency(pkg.price)}
                            </div>
                          </div>
                          <div className="flex items-center pr-4">
                            <Button onClick={() => handleTopUp(pkg.id)}>
                              {t("profile.purchaseCredits")}
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))
                  ) : (
                    <div className="space-y-2">
                      <Skeleton className="h-20 w-full" />
                      <Skeleton className="h-20 w-full" />
                      <Skeleton className="h-20 w-full" />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>{t("profile.transactionHistory")}</CardTitle>
            </CardHeader>
            <CardContent>
              {credits?.transactions && credits.transactions.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t("profile.date")}</TableHead>
                      <TableHead>{t("profile.type")}</TableHead>
                      <TableHead>{t("profile.description")}</TableHead>
                      <TableHead>{t("profile.amount")}</TableHead>
                      <TableHead>{t("profile.balance")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {credits.transactions.map((transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell>
                          {formatTime(transaction.createdAt)}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              transaction.type === "CONSUMPTION"
                                ? "destructive"
                                : "default"
                            }
                          >
                            {getTransactionTypeLabel(transaction.type)}
                          </Badge>
                        </TableCell>
                        <TableCell>{transaction.description || "-"}</TableCell>
                        <TableCell>{transaction.amount}</TableCell>
                        <TableCell>{transaction.balance}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="py-4 text-center">
                  {t("Payment.noTransactions")}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="generations">
          <Card>
            <CardHeader>
              <CardTitle>{t("profile.generationHistory")}</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingHistory ? (
                <div className="space-y-2">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              ) : generationHistory.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t("profile.type")}</TableHead>
                      <TableHead>{t("profile.status")}</TableHead>
                      <TableHead>{t("profile.result")}</TableHead>
                      <TableHead>{t("profile.createdAt")}</TableHead>
                      <TableHead>{t("profile.actions")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {generationHistory.map((record) => (
                      <TableRow key={record.id}>
                        <TableCell>
                          <Badge variant="outline">
                            {record.type === "video_colorize"
                              ? t("profile.video")
                              : t("profile.image")}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {record.status === "completed" && (
                            <Badge variant="success">
                              {t("profile.completed")}
                            </Badge>
                          )}
                          {record.status === "failed" && (
                            <Badge variant="destructive">
                              {t("profile.failed")}
                            </Badge>
                          )}
                          {record.status === "processing" && (
                            <Badge variant="secondary">
                              {t("profile.pending")}
                            </Badge>
                          )}
                          {record.status === "waiting" && (
                            <Badge variant="outline">
                              {t("profile.waiting")}
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {record.outputUrl ? (
                            <div
                              className={`
                                relative h-16 w-16 overflow-hidden rounded-md
                              `}
                            >
                              <Image
                                alt={t("profile.result")}
                                className="object-cover"
                                fill
                                sizes="64px"
                                height={64}
                                src={record.outputUrl}
                                width={64}
                              />
                            </div>
                          ) : (
                            <span className="text-muted-foreground">
                              {t("profile.noResult")}
                            </span>
                          )}
                        </TableCell>
                        <TableCell>{formatTime(record.createdAt)}</TableCell>
                        <TableCell>
                          {record.outputUrl && (
                            <Button asChild size="sm" variant="outline">
                              <a
                                href={record.outputUrl}
                                rel="noopener noreferrer"
                                target="_blank"
                              >
                                {t("profile.view")}
                              </a>
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="py-4 text-center">
                  {t("Payment.noTransactions")}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Stripe 支付弹窗 */}
      {showPayment && selectedPlan && (
        <div
          className={`
            fixed inset-0 z-50 flex items-center justify-center bg-black/50
          `}
        >
          <div className="w-full max-w-md rounded-lg bg-white p-6">
            <h2 className="mb-4 text-xl font-bold">
              {t("Payment.rechargeCredits")}
            </h2>
            <p className="mb-4">{t("Payment.selectPackageToRecharge")}</p>
            <div className="flex justify-end space-x-2">
              <Button onClick={handleClosePayment} variant="outline">
                {t("Common.cancel")}
              </Button>
              <Button onClick={refreshCredits}>{t("Common.confirm")}</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
