"use client";

import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";

import { PaymentForm } from "~/ui/components/payments/payment-form";
import { type PricingPlan, PricingPlans } from "~/ui/components/pricing/pricing-plans";
import { Button } from "~/ui/primitives/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "~/ui/primitives/dialog";

// Initialize Stripe
const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

export function PricingPageClient() {
  const t = useTranslations('Pricing');
  const [selectedPlan, setSelectedPlan] = useState<null | PricingPlan>(null);
  const [clientSecret, setClientSecret] = useState<null | string>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isCreatingPayment, setIsCreatingPayment] = useState(false);

  const handleSelectPlan = async (plan: PricingPlan) => {
    setSelectedPlan(plan);
    setIsCreatingPayment(true);

    try {
      // Create payment intent
      const response = await fetch("/api/credits/recharge", {
        body: JSON.stringify({
          credits: plan.credits,
          currency: "usd",
          packageName: plan.name,
          price: plan.price,
        }),
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
      });

      if (!response.ok) {
        throw new Error(t('payment.failed'));
      }

      const data: any = await response.json();
      setClientSecret(data.clientSecret);
      setIsPaymentModalOpen(true);
    } catch (error) {
      console.error("Payment creation failed:", error);
      toast.error(t('payment.error'));
    } finally {
      setIsCreatingPayment(false);
    }
  };

  const handlePaymentSuccess = () => {
    toast.success(t('payment.success'));
    setIsPaymentModalOpen(false);
    setClientSecret(null);
    setSelectedPlan(null);
  };

  const handlePaymentError = (error: string) => {
    toast.error(error);
  };

  const handleCloseModal = () => {
    setIsPaymentModalOpen(false);
    setClientSecret(null);
    setSelectedPlan(null);
  };

  const stripeOptions = {
    appearance: {
      theme: "stripe" as const,
      variables: {
        borderRadius: "6px",
        colorBackground: "hsl(var(--background))",
        colorDanger: "hsl(var(--destructive))",
        colorPrimary: "hsl(var(--primary))",
        colorText: "hsl(var(--foreground))",
        fontFamily: "var(--font-sans)",
        spacingUnit: "4px",
      },
    },
    clientSecret: clientSecret || undefined,
  };

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Page title */}
      <div className="mb-16 text-center">
        <h1 className={`
          mb-6 text-4xl font-bold tracking-tight
          md:text-5xl
        `}>
          {t('page.title')}
        </h1>
        <p className="mx-auto max-w-3xl text-xl text-muted-foreground">
          {t('page.subtitle')}
        </p>
      </div>

      {/* Pricing plans */}
      <PricingPlans
        className="mb-16"
        onSelectPlan={handleSelectPlan}
      />

      {/* FAQ */}
      <div className="mx-auto max-w-4xl">
        <h2 className="mb-8 text-center text-2xl font-bold">{t('faq.title')}</h2>
        <div className={`
          grid grid-cols-1 gap-6
          md:grid-cols-2
        `}>
          <div className="rounded-lg bg-muted/50 p-6">
            <h3 className="mb-2 font-semibold">{t('faq.howToUse.question')}</h3>
            <p className="text-sm text-muted-foreground">
              {t('faq.howToUse.answer')}
            </p>
          </div>
          <div className="rounded-lg bg-muted/50 p-6">
            <h3 className="mb-2 font-semibold">{t('faq.expiry.question')}</h3>
            <p className="text-sm text-muted-foreground">
              {t('faq.expiry.answer')}
            </p>
          </div>
          <div className="rounded-lg bg-muted/50 p-6">
            <h3 className="mb-2 font-semibold">{t('faq.paymentMethods.question')}</h3>
            <p className="text-sm text-muted-foreground">
              {t('faq.paymentMethods.answer')}
            </p>
          </div>
          <div className="rounded-lg bg-muted/50 p-6">
            <h3 className="mb-2 font-semibold">{t('faq.refund.question')}</h3>
            <p className="text-sm text-muted-foreground">
              {t('faq.refund.answer')}
            </p>
          </div>
        </div>
      </div>

      {/* Payment dialog */}
      <Dialog onOpenChange={handleCloseModal} open={isPaymentModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t('payment.title')}</DialogTitle>
            <DialogDescription>
              {selectedPlan && (
                <span>
                  {t('payment.description', {
                    credits: selectedPlan.credits,
                    planName: selectedPlan.name,
                    price: selectedPlan.price
                  })}
                </span>
              )}
            </DialogDescription>
          </DialogHeader>

          {isCreatingPayment ? (
            <div className="flex items-center justify-center py-8">
              <div className="flex items-center gap-3">
                <div className={`
                  h-6 w-6 animate-spin rounded-full border-2 border-primary
                  border-t-transparent
                `} />
                <span>{t('payment.creating')}</span>
              </div>
            </div>
          ) : clientSecret ? (
            <Elements options={stripeOptions} stripe={stripePromise}>
              <PaymentForm
                amount={selectedPlan?.price || 0}
                onError={handlePaymentError}
                onSuccess={handlePaymentSuccess}
              />
            </Elements>
          ) : (
            <div className="py-8 text-center">
              <p className="mb-4 text-muted-foreground">{t('payment.failed')}</p>
              <Button onClick={handleCloseModal} variant="outline">
                {t('payment.close')}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}