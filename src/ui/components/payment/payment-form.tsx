"use client";

import {
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { useState } from "react";

import { Button } from "~/ui/primitives/button";

interface PaymentFormProps {
  amount: number;
  onError?: (error: string) => void;
  onSuccess?: () => void;
}

export function PaymentForm({ amount, onError, onSuccess }: PaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsLoading(true);
    setMessage("");

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        confirmParams: {
          return_url: `${window.location.origin}/payment-test?success=true`,
        },
        elements,
        redirect: "if_required",
      });

      if (error) {
        if (error.type === "card_error" || error.type === "validation_error") {
          const errorMessage = error.message || "支付失败";
          setMessage(errorMessage);
          onError?.(errorMessage);
        } else {
          const errorMessage = "发生意外错误";
          setMessage(errorMessage);
          onError?.(errorMessage);
        }
      } else if (paymentIntent && paymentIntent.status === "succeeded") {
        const successMessage = `支付成功！支付ID: ${paymentIntent.id}`;
        setMessage(successMessage);
        onSuccess?.();
      } else {
        const statusMessage = `支付状态: ${paymentIntent?.status}`;
        setMessage(statusMessage);
      }
    } catch (_err) {
      const errorMessage = `支付处理失败: ${_err}`;
      setMessage(errorMessage);
      onError?.(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const paymentElementOptions = {
    layout: "tabs" as const,
  };

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <div className="rounded-lg border p-4">
        <PaymentElement
          id="payment-element"
          options={paymentElementOptions}
        />
      </div>

      {message && (
        <div
          className={`
            rounded-md p-3 text-sm
            ${message.includes("成功")
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
      )}

      <Button
        className="w-full"
        disabled={isLoading || !stripe || !elements}
        size="lg"
        type="submit"
      >
        {isLoading ? (
          <div className="flex items-center gap-2">
            <div className={`
              h-4 w-4 animate-spin rounded-full border-2 border-current
              border-t-transparent
            `} />
            处理中...
          </div>
        ) : (
          `支付 $${amount}`
        )}
      </Button>
    </form>
  );
}