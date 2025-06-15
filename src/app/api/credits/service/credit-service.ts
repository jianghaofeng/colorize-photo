import { createId } from "@paralleldrive/cuid2";
import { and, eq, sql } from "drizzle-orm";

import { db } from "~/db";
import {
  creditConsumptionConfigTable,
  creditPackageTable,
  creditRechargeTable,
  creditTransactionTable,
  userCreditBalanceTable,
} from "~/db/schema";
import { stripe } from "~/lib/stripe";

/**
 * 添加奖励积分
 * @param userId 用户ID
 * @param amount 积分数量
 * @param reason 奖励原因
 * @param metadata 元数据
 * @returns 奖励结果
 */
export async function addBonusCredits(
  userId: string,
  amount: number,
  reason: string,
  metadata: Record<string, any> = {},
) {
  if (amount <= 0) {
    throw new Error("奖励积分必须大于0");
  }

  // 获取用户积分余额
  const userBalance = await getUserCreditBalance(userId);

  // 开始数据库事务
  try {
    // 1. 更新用户积分余额
    const newBalance = userBalance.balance + amount;

    await db
      .update(userCreditBalanceTable)
      .set({
        balance: newBalance,
        updatedAt: new Date(),
      })
      .where(eq(userCreditBalanceTable.id, userBalance.id));

    // 2. 创建积分交易记录
    await db.insert(creditTransactionTable).values({
      amount,
      balanceAfter: newBalance,
      createdAt: new Date(),
      description: reason,
      id: createId(),
      metadata: JSON.stringify(metadata),
      type: "bonus",
      userId,
    });

    return {
      added: amount,
      balance: newBalance,
      success: true,
    };
  } catch (error) {
    console.error("添加奖励积分失败:", error);
    throw error;
  }
}

/**
 * 消费积分
 * @param userId 用户ID
 * @param actionType 操作类型
 * @param uploadId 上传ID（可选）
 * @param description 描述（可选）
 * @returns 消费结果
 */
export async function consumeCredits(
  userId: string,
  actionType: string,
  uploadId?: string,
  description?: string,
) {
  // 获取操作所需积分
  const config = await getCreditConsumptionConfig(actionType);
  if (!config) {
    throw new Error(`未找到操作类型 ${actionType} 的积分配置`);
  }

  const creditsRequired = config.creditsRequired;

  // 获取用户积分余额
  const userBalance = await getUserCreditBalance(userId);

  // 检查积分是否足够
  if (userBalance.balance < creditsRequired) {
    return {
      balance: userBalance.balance,
      message: "积分不足",
      required: creditsRequired,
      success: false,
    };
  }

  // 开始数据库事务
  // 注意：这里使用了简化的事务处理，实际项目中应该使用数据库事务
  try {
    // 1. 更新用户积分余额
    const newBalance = userBalance.balance - creditsRequired;
    const newTotalConsumed = userBalance.totalConsumed + creditsRequired;

    await db
      .update(userCreditBalanceTable)
      .set({
        balance: newBalance,
        totalConsumed: newTotalConsumed,
        updatedAt: new Date(),
      })
      .where(eq(userCreditBalanceTable.id, userBalance.id));

    // 2. 创建积分交易记录
    const transactionDescription =
      description || `${actionType} 消费${creditsRequired}积分`;

    await db.insert(creditTransactionTable).values({
      amount: -creditsRequired, // 负数表示消费
      balanceAfter: newBalance,
      createdAt: new Date(),
      description: transactionDescription,
      id: createId(),
      metadata: JSON.stringify({
        actionType,
        uploadId,
      }),
      relatedUploadId: uploadId,
      type: "consumption",
      userId,
    });

    return {
      balance: newBalance,
      consumed: creditsRequired,
      success: true,
    };
  } catch (error) {
    console.error("消费积分失败:", error);
    throw error;
  }
}

/**
 * 创建积分充值记录
 * @param userId 用户ID
 * @param packageId 套餐ID
 * @returns 创建的充值记录和客户端密钥
 */
export async function createCreditRecharge(userId: string, packageId: string) {
  // 获取套餐信息
  const creditPackage = await db.query.creditPackageTable.findFirst({
    where: and(
      eq(creditPackageTable.id, packageId),
      eq(creditPackageTable.isActive, 1),
    ),
  });

  if (!creditPackage) {
    throw new Error("积分套餐不存在或已停用");
  }

  // 创建充值记录
  const rechargeId = createId();
  const recharge = await db
    .insert(creditRechargeTable)
    .values({
      amount: creditPackage.credits,
      createdAt: new Date(),
      currency: creditPackage.currency,
      id: rechargeId,
      price: creditPackage.price,
      status: "pending",
      updatedAt: new Date(),
      userId,
    })
    .returning();

  // 创建 Stripe PaymentIntent
  const paymentIntent = await stripe.paymentIntents.create({
    amount: creditPackage.price,
    currency: creditPackage.currency,
    metadata: {
      credits: creditPackage.credits.toString(),
      packageId,
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

  return {
    clientSecret: paymentIntent.client_secret,
    recharge: recharge[0],
  };
}

/**
 * 获取积分消费配置
 * @param actionType 操作类型
 * @returns 积分消费配置
 */
export async function getCreditConsumptionConfig(actionType: string) {
  const config = await db.query.creditConsumptionConfigTable.findFirst({
    where: and(
      eq(creditConsumptionConfigTable.actionType, actionType),
      eq(creditConsumptionConfigTable.isActive, 1),
    ),
  });

  return config;
}

/**
 * 获取所有积分套餐
 * @returns 积分套餐列表
 */
export async function getCreditPackages() {
  const packages = await db.query.creditPackageTable.findMany({
    orderBy: [sql`${creditPackageTable.sortOrder} ASC`],
    where: eq(creditPackageTable.isActive, 1),
  });

  return packages;
}

/**
 * 获取用户积分余额
 * @param userId 用户ID
 * @returns 用户积分余额信息
 */
export async function getUserCreditBalance(userId: string) {
  // 查询用户积分余额
  const balance = await db.query.userCreditBalanceTable.findFirst({
    where: eq(userCreditBalanceTable.userId, userId),
  });

  // 如果不存在，创建一个新的余额记录
  if (!balance) {
    const newBalance = await db
      .insert(userCreditBalanceTable)
      .values({
        balance: 0,
        createdAt: new Date(),
        id: createId(),
        totalConsumed: 0,
        totalRecharged: 0,
        updatedAt: new Date(),
        userId,
      })
      .returning();

    return newBalance[0];
  }

  return balance;
}

/**
 * 获取用户积分充值记录
 * @param userId 用户ID
 * @param limit 限制数量
 * @param offset 偏移量
 * @returns 用户积分充值记录
 */
export async function getUserCreditRecharges(
  userId: string,
  limit = 10,
  offset = 0,
) {
  const recharges = await db.query.creditRechargeTable.findMany({
    limit,
    offset,
    orderBy: [sql`${creditRechargeTable.createdAt} DESC`],
    where: eq(creditRechargeTable.userId, userId),
  });

  return recharges;
}

/**
 * 获取用户积分交易记录
 * @param userId 用户ID
 * @param limit 限制数量
 * @param offset 偏移量
 * @returns 用户积分交易记录
 */
export async function getUserCreditTransactions(
  userId: string,
  limit = 10,
  offset = 0,
) {
  const transactions = await db.query.creditTransactionTable.findMany({
    limit,
    offset,
    orderBy: [sql`${creditTransactionTable.createdAt} DESC`],
    where: eq(creditTransactionTable.userId, userId),
  });

  return transactions;
}

/**
 * 处理积分充值成功
 * @param rechargeId 充值记录ID
 * @param paymentIntentId 支付意图ID
 * @returns 处理结果
 */
export async function handleCreditRechargeSuccess(
  rechargeId: string,
  paymentIntentId: string,
) {
  // 获取充值记录
  const recharge = await db.query.creditRechargeTable.findFirst({
    where: and(
      eq(creditRechargeTable.id, rechargeId),
      eq(creditRechargeTable.paymentIntentId, paymentIntentId),
    ),
  });

  if (!recharge) {
    throw new Error("充值记录不存在");
  }

  // 如果已经处理过，直接返回
  if (recharge.status === "completed") {
    return { recharge, success: true };
  }

  // 开始数据库事务
  // 注意：这里使用了简化的事务处理，实际项目中应该使用数据库事务
  try {
    // 1. 更新充值记录状态
    await db
      .update(creditRechargeTable)
      .set({
        status: "completed",
        updatedAt: new Date(),
      })
      .where(eq(creditRechargeTable.id, rechargeId));

    // 2. 获取用户当前积分余额
    const userBalance = await getUserCreditBalance(recharge.userId);

    // 3. 更新用户积分余额
    const newBalance = userBalance.balance + recharge.amount;
    const newTotalRecharged = userBalance.totalRecharged + recharge.amount;

    await db
      .update(userCreditBalanceTable)
      .set({
        balance: newBalance,
        totalRecharged: newTotalRecharged,
        updatedAt: new Date(),
      })
      .where(eq(userCreditBalanceTable.id, userBalance.id));

    // 4. 创建积分交易记录
    await db.insert(creditTransactionTable).values({
      amount: recharge.amount,
      balanceAfter: newBalance,
      createdAt: new Date(),
      description: `充值${recharge.amount}积分`,
      id: createId(),
      metadata: JSON.stringify({
        currency: recharge.currency,
        paymentIntentId,
        price: recharge.price,
        rechargeId,
      }),
      relatedRechargeId: rechargeId,
      type: "recharge",
      userId: recharge.userId,
    });

    return { recharge, success: true };
  } catch (error) {
    console.error("处理积分充值失败:", error);
    throw error;
  }
}