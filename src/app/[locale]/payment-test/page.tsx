"use client";

import { useState } from "react";

import { PaymentModal } from "~/ui/components/payments/payment-modal";
import { SubscriptionModal } from "~/ui/components/payments/subscription-modal";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/ui/primitives/card";
import { Input } from "~/ui/primitives/input";
import { Label } from "~/ui/primitives/label";

// 订阅计划配置
const subscriptionPlans = [
  {
    features: ["基础功能", "5个项目", "邮件支持"],
    id: "basic",
    interval: "月",
    name: "基础版",
    price: "$9.99",
    priceId: "price_basic_monthly", // 这里应该是真实的 Stripe Price ID
  },
  {
    features: ["所有基础功能", "无限项目", "优先支持", "高级分析"],
    id: "pro",
    interval: "月",
    name: "专业版",
    price: "$19.99",
    priceId: "price_pro_monthly", // 这里应该是真实的 Stripe Price ID
  },
  {
    features: ["所有专业功能", "团队协作", "API访问", "专属客服"],
    id: "enterprise",
    interval: "月",
    name: "企业版",
    price: "$49.99",
    priceId: "price_enterprise_monthly", // 这里应该是真实的 Stripe Price ID
  },
];

export default function PaymentTestPage() {
  const [amount, setAmount] = useState(10);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"" | "error" | "success">("");

  const handlePaymentSuccess = () => {
    setMessage("一次性支付成功！");
    setMessageType("success");
    setTimeout(() => {
      setMessage("");
      setMessageType("");
    }, 5000);
  };

  const handlePaymentError = (error: string) => {
    setMessage(`支付失败: ${error}`);
    setMessageType("error");
    setTimeout(() => {
      setMessage("");
      setMessageType("");
    }, 5000);
  };

  const handleSubscriptionSuccess = (subscriptionId: string) => {
    setMessage(`订阅创建成功！订阅ID: ${subscriptionId}`);
    setMessageType("success");
    setTimeout(() => {
      setMessage("");
      setMessageType("");
    }, 5000);
  };

  const handleSubscriptionError = (error: string) => {
    setMessage(`订阅失败: ${error}`);
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
          Stripe 支付测试
        </h1>
        <p className="mt-2 text-muted-foreground">
          使用测试卡号进行支付测试 - 支持一次性支付和订阅支付
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
            <CardTitle>测试卡信息</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className={`
              grid grid-cols-1 gap-2 text-sm
              md:grid-cols-2
            `}>
              <div>
                <strong>成功支付:</strong> 4242 4242 4242 4242
              </div>
              <div>
                <strong>需要验证:</strong> 4000 0025 0000 3155
              </div>
              <div>
                <strong>被拒绝:</strong> 4000 0000 0000 0002
              </div>
              <div>
                <strong>过期日期:</strong> 任何未来日期
              </div>
              <div>
                <strong>CVC:</strong> 任何3位数字
              </div>
              <div>
                <strong>邮编:</strong> 任何5位数字
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 一次性支付测试 */}
        <Card>
          <CardHeader>
            <CardTitle>一次性支付测试</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="amount">金额 (USD)</Label>
              <Input
                id="amount"
                min="0.5"
                onChange={(e) => setAmount(Number(e.target.value))}
                placeholder="输入金额"
                step="0.01"
                type="number"
                value={amount}
              />
            </div>

            <PaymentModal
              amount={amount}
              description={`测试支付 - $${amount}`}
              onError={handlePaymentError}
              onSuccess={handlePaymentSuccess}
              triggerText={`支付 $${amount}`}
            />
          </CardContent>
        </Card>

        {/* 订阅支付测试 */}
        <Card>
          <CardHeader>
            <CardTitle>订阅支付测试</CardTitle>
            <CardDescription>
              选择一个订阅计划进行测试（使用测试价格ID）
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
                    triggerText={`订阅 ${plan.name}`}
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