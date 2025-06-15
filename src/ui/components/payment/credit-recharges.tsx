"use client";

import { useTranslations } from "next-intl";

import { useCreditRecharges } from "~/hooks/use-credit-recharges";
import { Badge } from "~/ui/primitives/badge";
import { Button } from "~/ui/primitives/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/ui/primitives/table";

interface CreditRechargesProps {
  className?: string;
}

export function CreditRecharges({ className = "" }: CreditRechargesProps) {
  console.log("[DEBUG] Rendering CreditRecharges component");
  const t = useTranslations("Payment");
  const { error, hasMore, isLoading, loadMore, recharges } =
    useCreditRecharges(10);

  console.log("[DEBUG] CreditRecharges hook state:", {
    error,
    isLoading,
    rechargesCount: recharges.length,
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const formatPrice = (price: number, currency: string) => {
    // 价格以美分存储，转换为美元显示
    const amount = price / 100;
    return new Intl.NumberFormat("zh-CN", {
      currency: currency.toUpperCase(),
      style: "currency",
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-500">{t("completed")}</Badge>;
      case "failed":
        return <Badge className="bg-red-500">{t("failed")}</Badge>;
      case "pending":
        return <Badge className="bg-yellow-500">{t("pending")}</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  if (error) {
    console.log(
      "[DEBUG] Rendering error state in CreditRecharges, error:",
      error
    );
    return (
      <div
        className={`
          space-y-4
          ${className}
        `}
      >
        <h3 className="text-lg font-medium">{t("creditRecharges")}</h3>
        <div className="text-center text-red-500">
          {t("loadRechargesFailed")} (Error: {error})
        </div>
        <div className="flex justify-center">
          <Button onClick={() => window.location.reload()} variant="outline">
            {t("tryAgain")}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`
        space-y-4
        ${className}
      `}
    >
      <h3 className="text-lg font-medium">{t("creditRecharges")}</h3>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("date")}</TableHead>
              <TableHead>{t("amount")}</TableHead>
              <TableHead>{t("price")}</TableHead>
              <TableHead>{t("status")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {recharges.length === 0 && !isLoading ? (
              <TableRow>
                <TableCell
                  className={`h-24 text-center text-muted-foreground`}
                  colSpan={4}
                >
                  {t("noRecharges")}
                </TableCell>
              </TableRow>
            ) : (
              recharges.map((recharge) => (
                <TableRow key={recharge.id}>
                  <TableCell>{formatDate(recharge.created_at)}</TableCell>
                  <TableCell className="font-medium">
                    {recharge.amount}
                  </TableCell>
                  <TableCell>
                    {formatPrice(recharge.price, recharge.currency)}
                  </TableCell>
                  <TableCell>{getStatusBadge(recharge.status)}</TableCell>
                </TableRow>
              ))
            )}

            {isLoading && (
              <TableRow>
                <TableCell
                  className={`h-24 text-center text-muted-foreground`}
                  colSpan={4}
                >
                  <div className={`flex h-full items-center justify-center`}>
                    <div
                      className={`
                        h-6 w-6 animate-spin rounded-full border-b-2
                        border-primary
                      `}
                    />
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {hasMore && !isLoading && recharges.length > 0 && (
        <div className="mt-4 flex justify-center">
          <Button onClick={loadMore} variant="outline">
            {t("loadMore")}
          </Button>
        </div>
      )}
    </div>
  );
}
