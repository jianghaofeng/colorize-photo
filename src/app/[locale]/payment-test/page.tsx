"use client";

import { useState } from "react";

import { useTranslations } from "next-intl";

import { PaymentModal } from "~/ui/components/payments/payment-modal";
import { SubscriptionModal } from "~/ui/components/payments/subscription-modal";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/ui/primitives/card";
import { Input } from "~/ui/primitives/input";
import { Label } from "~/ui/primitives/label";

// 订阅计划配置
const getSubscriptionPlans = (t: any) => [
  {
    features: [t("Payment.basicFeatures"), t("Payment.fiveProjects"), t("Payment.emailSupport")],
    id: "basic",
    interval: t("Payment.monthly"),
    name: t("Payment.basicPlan"),
    price: "$9.99",
    priceId: "price_basic_monthly", // 这里应该是真实的 Stripe Price ID
  },
  {
    features: [t("Payment.allBasicFeatures"), t("Payment.unlimitedProjects"), t("Payment.prioritySupport"), t("Payment.advancedAnalytics")],
    id: "pro",
    interval: t("Payment.monthly"),
    name: t("Payment.proPlan"),
    price: "$19.99",
    priceId: "price_pro_monthly", // 这里应该是真实的 Stripe Price ID
  },
  {
    features: [t("Payment.allProFeatures"), t("Payment.teamCollaboration"), t("Payment.apiAccess"), t("Payment.dedicatedSupport")],
    id: "enterprise",
    interval: t("Payment.monthly"),
    name: t("Payment.enterprisePlan"),
    price: "$49.99",
    priceId: "price_enterprise_monthly", // 这里应该是真实的 Stripe Price ID
  },
];

export default function PaymentTestPage() {
  const t = useTranslations();
  const [amount, setAmount] = useState(10);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"" | "error" | "success">("");
  
  const subscriptionPlans = getSubscriptionPlans(t);

  const handlePaymentSuccess = () => {
    setMessage(t("Payment.oneTimePaymentSuccess"));
    setMessageType("success");
    setTimeout(() => {
      setMessage("");
      setMessageType("");
    }, 5000);
  };

  const handlePaymentError = (error: string) => {
    setMessage(`${t("Payment.paymentFailed")}: ${error}`);
    setMessageType("error");
    setTimeout(() => {
      setMessage("");
      setMessageType("");
    }, 5000);
  };

  const handleSubscriptionSuccess = (subscriptionId: string) => {
    setMessage(`${t("Payment.subscriptionCreated")}! ${t("Payment.subscriptionId")}: ${subscriptionId}`);
    setMessageType("success");
    setTimeout(() => {
      setMessage("");
      setMessageType("");
    }, 5000);
  };

  const handleSubscriptionError = (error: string) => {
    setMessage(`${t("Payment.subscriptionFailed")}: ${error}`);
    setMessageType("error");
    setTimeout(() => {
      setMessage("");
      setMessageType("");
    }, 5000);
  };

  return (
    <div className="container mx-auto max-w-4xl py-8">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-foreground">
          {t("Payment.stripePaymentTest")}
        </h1>
        <p className="mt-2 text-muted-foreground">
          {t("Payment.testCardDescription")}
        </p>
      </div>

      {/* 全局消息显示 */}
      {message && (
        <div className="mb-6">
          <div
            className={`
              rounded-md p-4 text-sm
              ${messageType === "success"
                ? `
                  bg-green-50 text-green-700
                  dark:bg-green-900/20 dark:text-green-400
                `
                : `
                  bg-red-50 text-red-700
                  dark:bg-red-900/20 dark:text-red-400
                `
              }
            `}
          >
            {message}
          </div>
        </div>
      )}

      <div className="space-y-8">
        {/* 测试卡信息 */}
        <Card>
          <CardHeader>
            <CardTitle>{t("Payment.testCardInfo")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className={`
              grid grid-cols-1 gap-2 text-sm
              md:grid-cols-2
            `}>
              <div>
                <strong>{t("Payment.successfulPayment")}:</strong> 4242 4242 4242 4242
              </div>
              <div>
                <strong>{t("Payment.requiresAuthentication")}:</strong> 4000 0025 0000 3155
              </div>
              <div>
                <strong>{t("Payment.declined")}:</strong> 4000 0000 0000 0002
              </div>
              <div>
                <strong>{t("Payment.expirationDate")}:</strong> {t("Payment.anyFutureDate")}
              </div>
              <div>
                <strong>CVC:</strong> {t("Payment.anyThreeDigits")}
              </div>
              <div>
                <strong>{t("Payment.postalCode")}:</strong> {t("Payment.anyFiveDigits")}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 一次性支付测试 */}
        <Card>
          <CardHeader>
            <CardTitle>{t("Payment.oneTimePaymentTest")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="amount">{t("Payment.amount")} (USD)</Label>
              <Input
                id="amount"
                min="0.5"
                onChange={(e) => setAmount(Number(e.target.value))}
                placeholder={t("Payment.enterAmount")}
                step="0.01"
                type="number"
                value={amount}
              />
            </div>

            <PaymentModal
              amount={amount}
              description={`${t("Payment.testPayment")} - $${amount}`}
              onError={handlePaymentError}
              onSuccess={handlePaymentSuccess}
              triggerText={`${t("Payment.pay")} $${amount}`}
            />
          </CardContent>
        </Card>

        {/* 订阅支付测试 */}
        <Card>
          <CardHeader>
            <CardTitle>{t("Payment.subscriptionPaymentTest")}</CardTitle>
            <CardDescription>
              {t("Payment.selectSubscriptionPlanForTest")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className={`
              grid gap-4
              md:grid-cols-3
            `}>
              {subscriptionPlans.map((plan) => (
                <div
                  className={`
                    space-y-4 rounded-lg border p-4 transition-shadow
                    hover:shadow-md
                  `}
                  key={plan.id}
                >
                  <div className="text-center">
                    <h3 className="text-lg font-semibold">{plan.name}</h3>
                    <div className="mt-2 text-2xl font-bold text-primary">
                      {plan.price}
                      <span className={`
                        text-sm font-normal text-muted-foreground
                      `}>/{plan.interval}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {plan.features.map((feature, index) => (
                      <div className="flex items-center gap-2 text-sm" key={index}>
                        <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                        {feature}
                      </div>
                    ))}
                  </div>

                  <SubscriptionModal
                    interval={plan.interval}
                    onError={handleSubscriptionError}
                    onSuccess={handleSubscriptionSuccess}
                    planName={plan.name}
                    price={plan.price}
                    priceId={plan.priceId}
                    triggerText={`${t("Payment.subscribe")} ${plan.name}`}
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}