"use client";

import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import type { CreditPackage } from "~/hooks/use-credit-packages";

import { useCreditPackages } from "~/hooks/use-credit-packages";
import { Button } from "~/ui/primitives/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/ui/primitives/dialog";

import { PaymentForm } from "./payment-form";

// 确保在客户端加载 Stripe
const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY as string,
);

interface CreditRechargeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function CreditRechargeModal({
  isOpen,
  onClose,
  onSuccess,
}: CreditRechargeModalProps) {
  const t = useTranslations("Payment");
  const router = useRouter();
  const { error: packagesError, isLoading: packagesLoading, packages } = useCreditPackages();
  const [selectedPackage, setSelectedPackage] = useState<CreditPackage | null>(
    null,
  );
  const [clientSecret, setClientSecret] = useState("");
  const [, setRechargeId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [paymentStatus, setPaymentStatus] = useState<
    "error" | "initial" | "processing" | "success"
  >("initial");

  // 获取积分套餐
  useEffect(() => {
    if (isOpen && packages.length > 0 && !selectedPackage) {
      // 默认选择第一个套餐
      setSelectedPackage(packages[0]);
    }
  }, [isOpen, packages, selectedPackage]);

  useEffect(() => {
    if (packagesError) {
      setError(t("failedToLoadPackages"));
    }
  }, [packagesError, t]);

  // 创建充值
  const createRecharge = async () => {
    if (!selectedPackage) return;

    setIsLoading(true);
    setError("");
    setPaymentStatus("processing");

    try {
      const response = await fetch("/api/credits/recharge", {
        body: JSON.stringify({
          packageId: selectedPackage.id,
        }),
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
      });

      const data: any = await response.json();

      if (data.success && data.clientSecret) {
        setClientSecret(data.clientSecret);
        setRechargeId(data.rechargeId);
      } else {
        throw new Error(data.error || t("failedToCreateRecharge"));
      }
    } catch (error: any) {
      console.error("创建充值失败:", error);
      setError(error.message || t("failedToCreateRecharge"));
      setPaymentStatus("error");
    } finally {
      setIsLoading(false);
    }
  };

  // 处理支付成功
  const handlePaymentSuccess = () => {
    setPaymentStatus("success");
    setTimeout(() => {
      onClose();
      if (onSuccess) {
        onSuccess();
      }
      // 刷新页面以更新积分余额
      router.refresh();
    }, 2000);
  };

  // 处理支付失败
  const handlePaymentError = (error: string) => {
    console.error("支付失败:", error);
    setError(error || t("paymentFailed"));
    setPaymentStatus("error");
  };

  // 重置状态
  const handleClose = () => {
    setClientSecret("");
    setRechargeId("");
    setError("");
    setPaymentStatus("initial");
    onClose();
  };

  return (
    <Dialog onOpenChange={handleClose} open={isOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t("rechargeCredits")}</DialogTitle>
          <DialogDescription>{t("selectPackageToRecharge")}</DialogDescription>
        </DialogHeader>

        {paymentStatus === "initial" && (
          <div className="grid gap-4 py-4">
            {packagesLoading ? (
              <div className="py-4 text-center">
                <div className={`
                  mx-auto h-8 w-8 animate-spin rounded-full border-b-2
                  border-primary
                `} />
                <p className="mt-2 text-sm text-muted-foreground">加载套餐中...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {packages.map((pkg) => (
                  <div
                    className={`
                      flex cursor-pointer flex-col rounded-lg border p-4
                      ${selectedPackage?.id === pkg.id
                        ? "border-primary bg-primary/5"
                        : "border-border"
                      }
                    `}
                    key={pkg.id}
                    onClick={() => setSelectedPackage(pkg)}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-medium">{pkg.name}</span>
                      <span className="text-lg font-bold">
                        ¥{pkg.price.toFixed(2)}
                      </span>
                    </div>
                    <div className="mt-2 text-sm text-muted-foreground">
                      {pkg.description}
                    </div>
                    <div className="mt-2 text-sm font-medium text-primary">
                      {t("getCredits", { credits: pkg.creditsRequired })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {paymentStatus === "processing" &&
          clientSecret &&
          (
            <div className="py-4">
              <Elements
                options={{ clientSecret }}
                stripe={stripePromise}
              >
                <PaymentForm
                  amount={selectedPackage?.price || 0}
                  onError={handlePaymentError}
                  onSuccess={handlePaymentSuccess}
                />
              </Elements>
            </div>
          )}

        {paymentStatus === "success" && (
          <div className="py-6 text-center">
            <div className="mb-2 text-xl text-green-500">
              {t("paymentSuccessful")}
            </div>
            <p>{t("creditsAddedToAccount")}</p>
          </div>
        )}

        {paymentStatus === "error" && (
          <div className="py-6 text-center">
            <div className="mb-2 text-xl text-red-500">
              {t("paymentFailed")}
            </div>
            <p>{error || t("tryAgainLater")}</p>
          </div>
        )}

        <DialogFooter>
          {paymentStatus === "initial" && (
            <Button
              disabled={!selectedPackage || isLoading}
              onClick={createRecharge}
            >
              {isLoading ? t("processing") : t("proceedToPayment")}
            </Button>
          )}

          {paymentStatus === "error" && (
            <Button onClick={() => setPaymentStatus("initial")}>
              {t("tryAgain")}
            </Button>
          )}

          {(paymentStatus === "success" || paymentStatus === "processing") && (
            <Button onClick={handleClose} variant="outline">
              {t("close")}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
