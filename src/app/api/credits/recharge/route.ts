import { createId } from "@paralleldrive/cuid2";
import { eq } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";

import { db } from "~/db";
import { creditRechargeTable } from "~/db/schema";
import { stripe } from "~/lib/stripe";
import { getCurrentSupabaseUser } from "~/lib/supabase-auth";

export async function POST(request: NextRequest) {
  try {
    // 获取用户会话
    const user = await getCurrentSupabaseUser();
    if (!user) {
      return NextResponse.json(
        { error: "未授权访问" },
        { status: 401 },
      );
    }

    const userId = user.id;
    const { credits, currency, packageName, price }: any = await request.json();

    if (!credits || !price || !currency || !packageName) {
      return NextResponse.json(
        { error: "缺少必要参数" },
        { status: 400 },
      );
    }

    // 创建充值记录
    const rechargeId = createId();
    const recharge = await db
      .insert(creditRechargeTable)
      .values({
        amount: credits,
        createdAt: new Date(),
        currency,
        id: rechargeId,
        price,
        status: "pending",
        updatedAt: new Date(),
        userId,
      })
      .returning();

    // 创建 Stripe PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: price,
      currency,
      metadata: {
        credits: credits.toString(),
        packageName,
        rechargeId,
        type: "credit_recharge",
        userId,
      },
    });

    // 更新充值记录的 PaymentIntent ID
    await db
      .update(creditRechargeTable)
      .set({
        paymentIntentId: paymentIntent.id,
        updatedAt: new Date(),
      })
      .where(eq(creditRechargeTable.id, rechargeId));

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      rechargeId: recharge[0].id,
      success: true,
    });
  } catch (error: any) {
    console.error("创建积分充值失败:", error);
    return NextResponse.json(
      { error: error.message || "创建积分充值失败" },
      { status: 500 },
    );
  }
}