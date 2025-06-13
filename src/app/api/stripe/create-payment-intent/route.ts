import { type NextRequest, NextResponse } from "next/server";

import { stripe } from "~/lib/stripe";

export async function POST(request: NextRequest) {
  try {
    const { amount, currency = "usd", description }: any = await request.json();

    if (!amount || amount < 0.5) {
      return NextResponse.json(
        { error: "金额必须至少为 $0.50" },
        { status: 400 },
      );
    }

    // 创建 PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Stripe 使用分为单位
      automatic_payment_methods: {
        enabled: true,
      },
      currency,
      description: description || "测试支付",
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (error) {
    console.error("创建支付意图错误:", error);
    return NextResponse.json({ error: "创建支付失败" }, { status: 500 });
  }
}
