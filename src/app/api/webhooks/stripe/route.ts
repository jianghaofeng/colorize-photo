import type { NextRequest } from "next/server";
import type Stripe from "stripe";

import { headers } from "next/headers";
import { NextResponse } from "next/server";

import { handleCreditRechargeSuccess } from "~/app/api/credits/service/credit-service";
import { syncSubscription } from "~/app/api/stripe/service/stripe-service";
import { stripe } from "~/lib/stripe";

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const headersList = headers();
    const signature = (await headersList).get("stripe-signature");

    if (!signature || !webhookSecret) {
      return new NextResponse("Webhook 签名验证失败", { status: 400 });
    }

    // 验证 webhook 签名
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      webhookSecret,
    );

    // 处理事件
    switch (event.type) {
      case "customer.subscription.created":
      case "customer.subscription.deleted":
      case "customer.subscription.updated":
        await handleSubscriptionChange(event);
        break;
      case "payment_intent.succeeded":
        await handlePaymentIntentSucceeded(event);
        break;
      default:
        console.log(`未处理的事件类型: ${event.type}`);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Webhook 错误:", error);
    return NextResponse.json(
      { error: "Webhook 处理错误", success: false },
      { status: 500 },
    );
  }
}

async function handleSubscriptionChange(event: any) {
  const subscription = event.data.object as Stripe.Subscription;
  const customerId = subscription.customer as string;

  // 获取关联的用户 ID
  const customer = await stripe.customers.retrieve(customerId);
  if (!customer || customer.deleted) {
    throw new Error("找不到客户");
  }

  // 从元数据中获取用户 ID
  const userId = customer.metadata.userId;
  if (!userId) {
    throw new Error("找不到用户 ID");
  }

  // 获取商品 ID
  let productId = "";
  if (subscription.items.data.length > 0) {
    const product = await stripe.products.retrieve(
      subscription.items.data[0].price.product as string,
    );
    productId = product.id;
  }

  // 同步订阅数据
  await syncSubscription(
    userId,
    customerId,
    subscription.id,
    productId,
    subscription.status,
  );
}

async function handlePaymentIntentSucceeded(event: any) {
  const paymentIntent = event.data.object as Stripe.PaymentIntent;
  const { metadata } = paymentIntent;

  // 检查是否是积分充值
  if (metadata && metadata.type === "credit_recharge") {
    const { rechargeId } = metadata;
    if (rechargeId) {
      try {
        // 处理积分充值成功
        await handleCreditRechargeSuccess(rechargeId, paymentIntent.id);
        console.log(`积分充值成功处理完成: ${rechargeId}`);
      } catch (error) {
        console.error(`处理积分充值失败: ${rechargeId}`, error);
        throw error;
      }
    }
  }
}
