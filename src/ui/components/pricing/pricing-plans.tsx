"use client";

import { Check, Crown, Star, Zap } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";

import { cn } from "~/lib/utils";
import { Badge } from "~/ui/primitives/badge";
import { Button } from "~/ui/primitives/button";
import { Card, CardContent, CardFooter, CardHeader } from "~/ui/primitives/card";

interface PricingPlan {
  badge?: string;
  credits: number;
  description: string;
  features: string[];
  icon: React.ReactNode;
  id: string;
  isPopular?: boolean;
  name: string;
  originalPrice?: number; // 原价（美分）
  price: number; // 价格（美分）
}

interface PricingPlansProps {
  className?: string;
  onSelectPlan?: (plan: PricingPlan) => void;
}

const getPricingPlans = (t: any): PricingPlan[] => [
  {
    credits: 100,
    description: t('basicDescription'),
    features: [
      `100 ${t('credits')}`,
      t('features.imageProcessing'),
      t('features.colorization'),
      t('features.noExpiry')
    ],
    icon: <Zap className="h-6 w-6" />,
    id: "basic",
    name: t('basic'),
    price: 999 // $9.99
  },
  {
    badge: t('mostPopular'),
    credits: 300,
    description: t('standardDescription'),
    features: [
      `300 ${t('credits')}`,
      t('features.imageProcessing'),
      t('features.colorization'),
      t('features.restoration'),
      t('features.noExpiry'),
      t('features.prioritySupport')
    ],
    icon: <Star className="h-6 w-6" />,
    id: "standard",
    isPopular: true,
    name: t('standard'),
    originalPrice: 2997, // $29.97
    price: 2499 // $24.99
  },
  {
    badge: t('bestValue'),
    credits: 600,
    description: t('popularDescription'),
    features: [
      `600 ${t('credits')}`,
      t('features.imageProcessing'),
      t('features.colorization'),
      t('features.restoration'),
      t('features.enhancement'),
      t('features.noExpiry'),
      t('features.prioritySupport')
    ],
    icon: <Crown className="h-6 w-6" />,
    id: "popular",
    name: t('popular'),
    originalPrice: 5994, // $59.94
    price: 3999 // $39.99
  },
  {
    credits: 1200,
    description: t('professionalDescription'),
    features: [
      `1200 ${t('credits')}`,
      t('features.imageProcessing'),
      t('features.colorization'),
      t('features.restoration'),
      t('features.enhancement'),
      t('features.superResolution'),
      t('features.bulkProcessing'),
      t('features.noExpiry'),
      t('features.prioritySupport'),
      t('features.apiAccess')
    ],
    icon: <Crown className="h-6 w-6" />,
    id: "professional",
    name: t('professional'),
    originalPrice: 11988, // $119.88
    price: 6999 // $69.99
  }
];

export function PricingPlans({ className, onSelectPlan }: PricingPlansProps) {
  const t = useTranslations('Pricing');
  const [selectedPlan, setSelectedPlan] = useState<null | string>(null);
  const [isLoading, setIsLoading] = useState<null | string>(null);

  const pricingPlans = getPricingPlans(t);

  const handleSelectPlan = async (plan: PricingPlan) => {
    setSelectedPlan(plan.id);
    setIsLoading(plan.id);

    try {
      await onSelectPlan?.(plan);
    } finally {
      setIsLoading(null);
    }
  };

  const formatPrice = (priceInCents: number) => {
    return `$${(priceInCents / 100).toFixed(2)}`;
  };

  const calculateDiscount = (price: number, originalPrice?: number) => {
    if (!originalPrice) return 0;
    return Math.round(((originalPrice - price) / originalPrice) * 100);
  };

  return (
    <div className={cn("w-full", className)}>
      {/* 标题部分 */}
      <div className="mb-12 text-center">
        <h2 className="mb-4 text-3xl font-bold tracking-tight">
          {t('title')}
        </h2>
        <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
          {t('subtitle')}
        </p>
      </div>

      {/* 定价卡片网格 */}
      <div className={`
        grid grid-cols-1 gap-6
        md:grid-cols-2
        lg:grid-cols-4
      `}>
        {pricingPlans.map((plan) => {
          const discount = calculateDiscount(plan.price, plan.originalPrice);
          const isSelected = selectedPlan === plan.id;
          const loading = isLoading === plan.id;

          return (
            <Card
              className={cn(
                `
                  relative transition-all duration-300
                  hover:shadow-lg
                `,
                plan.isPopular && "scale-105 border-primary shadow-md",
                isSelected && "ring-2 ring-primary"
              )}
              key={plan.id}
            >
              {/* 热门标签 */}
              {plan.badge && (
                <div className={`
                  absolute -top-3 left-1/2 -translate-x-1/2 transform
                `}>
                  <Badge
                    className={cn(
                      "px-3 py-1 text-xs font-medium",
                      plan.isPopular && "bg-primary text-primary-foreground"
                    )}
                    variant={plan.isPopular ? "default" : "secondary"}
                  >
                    {plan.badge}
                  </Badge>
                </div>
              )}

              <CardHeader className="pb-4 text-center">
                {/* 图标 */}
                <div className={cn(
                  "mx-auto mb-4 rounded-full p-3",
                  plan.isPopular
                    ? "bg-primary/10 text-primary"
                    : "bg-muted text-muted-foreground"
                )}>
                  {plan.icon}
                </div>

                {/* 套餐名称 */}
                <h3 className="text-xl font-semibold">{plan.name}</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {plan.description}
                </p>

                {/* 价格 */}
                <div className="mt-4">
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-3xl font-bold">
                      {formatPrice(plan.price)}
                    </span>
                    {plan.originalPrice && (
                      <span className={`
                        text-lg text-muted-foreground line-through
                      `}>
                        {formatPrice(plan.originalPrice)}
                      </span>
                    )}
                  </div>
                  {discount > 0 && (
                    <div className="mt-1 text-sm font-medium text-green-600">
                      {t('discount', { percent: discount })}
                    </div>
                  )}
                  <div className="mt-1 text-sm text-muted-foreground">
                    {plan.credits} {t('credits')}
                  </div>
                </div>
              </CardHeader>

              <CardContent className="px-6">
                {/* 功能列表 */}
                <ul className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <li className="flex items-start gap-3" key={index}>
                      <Check className={`
                        mt-0.5 h-4 w-4 flex-shrink-0 text-green-500
                      `} />
                      <span className="text-sm text-muted-foreground">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
              </CardContent>

              <CardFooter className="px-6 pt-4">
                <Button
                  className="w-full"
                  disabled={loading}
                  onClick={() => handleSelectPlan(plan)}
                  size="lg"
                  variant={plan.isPopular ? "default" : "outline"}
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className={`
                        h-4 w-4 animate-spin rounded-full border-2
                        border-current border-t-transparent
                      `} />
                      {t('payment.processing')}
                    </div>
                  ) : (
                    t('selectPlan')
                  )}
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>

      {/* 底部说明 */}
      <div className="mt-12 text-center">
        <div className="mx-auto max-w-4xl rounded-lg bg-muted/50 p-6">
          <h4 className="mb-3 font-semibold">{t('usageInstructions.title')}</h4>
          <div className={`
            grid grid-cols-1 gap-4 text-sm text-muted-foreground
            md:grid-cols-4
          `}>
            <div>
              {t('usageInstructions.step1')}
            </div>
            <div>
              {t('usageInstructions.step2')}
            </div>
            <div>
              {t('usageInstructions.step3')}
            </div>
            <div>
              {t('usageInstructions.step4')}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export type { PricingPlan };