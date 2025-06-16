import { createId } from "@paralleldrive/cuid2";
import { eq } from 'drizzle-orm';

import type { CreditTransactionType } from '~/db/schema/credits/types';

import { db } from '~/db';
import {
  creditConsumptionConfigTable,
  creditTransactionTable,
  userCreditBalanceTable,
} from '~/db/schema/credits/tables';
import { uploadsTable } from '~/db/schema/uploads/tables';

/**
 * 添加奖励积分
 * @param userId 用户ID
 * @param amount 积分数量
 * @param description 描述
 * @returns 是否添加成功
 */
export async function addRewardCredits(
  userId: string,
  amount: number,
  description: string,
): Promise<boolean> {
  try {
    // 开始事务
    return await db.transaction(async (tx) => {
      // 获取用户积分余额
      const balance = await tx.query.userCreditBalanceTable.findFirst({
        where: eq(userCreditBalanceTable.userId, userId),
      });

      if (balance) {
        // 更新用户积分余额
        await tx
          .update(userCreditBalanceTable)
          .set({
            balance: balance.balance + amount,
            updatedAt: new Date(),
          })
          .where(eq(userCreditBalanceTable.userId, userId));
      } else {
        // 创建用户积分余额
        await tx.insert(userCreditBalanceTable).values({
          balance: amount,
          createdAt: new Date(),
          id: createId(),
          updatedAt: new Date(),
          userId,
        });
      }

      // 获取交易后余额
      const newBalance = balance ? balance.balance + amount : amount;

      // 创建积分交易记录
      await tx.insert(creditTransactionTable).values({
        amount,
        balanceAfter: newBalance,
        createdAt: new Date(),
        description,
        id: createId(),
        type: "bonus" as CreditTransactionType,
        userId,
      });

      return true;
    });
  } catch (error) {
    console.error('添加奖励积分时出错:', error);
    return false;
  }
}

/**
 * 检查用户是否有足够的积分进行操作
 * @param userId 用户ID
 * @param actionType 操作类型
 * @returns 是否有足够积分
 */
export async function checkSufficientCredits(
  userId: string,
  actionType: string,
): Promise<boolean> {
  try {
    // 获取操作所需积分
    const config = await db.query.creditConsumptionConfigTable.findFirst({
      where: eq(creditConsumptionConfigTable.actionType, actionType),
    });

    if (!config) {
      console.error(`未找到操作类型 ${actionType} 的积分消费配置`);
      return false;
    }

    // 获取用户积分余额
    const balance = await db.query.userCreditBalanceTable.findFirst({
      where: eq(userCreditBalanceTable.userId, userId),
    });

    // 如果用户没有积分记录或积分不足
    if (!balance || balance.balance < config.creditsRequired) {
      return false;
    }

    return true;
  } catch (error) {
    console.error('检查积分是否足够时出错:', error);
    return false;
  }
}

/**
 * 消费积分
 * @param userId 用户ID
 * @param actionType 操作类型
 * @param uploadId 上传ID（可选）
 * @returns 是否消费成功
 */
export async function consumeCredits(
  userId: string,
  actionType: string,
  uploadId?: string,
): Promise<boolean> {
  try {
    // 获取操作所需积分
    const config = await db.query.creditConsumptionConfigTable.findFirst({
      where: eq(creditConsumptionConfigTable.actionType, actionType),
    });

    if (!config) {
      console.error(`未找到操作类型 ${actionType} 的积分消费配置`);
      return false;
    }

    // 开始事务
    return await db.transaction(async (tx) => {
      // 获取用户积分余额
      const balance = await tx.query.userCreditBalanceTable.findFirst({
        where: eq(userCreditBalanceTable.userId, userId),
      });

      // 如果用户没有积分记录或积分不足
      if (!balance || balance.balance < config.creditsRequired) {
        return false;
      }

      // 更新用户积分余额
      await tx
        .update(userCreditBalanceTable)
        .set({
          balance: balance.balance - config.creditsRequired,
          updatedAt: new Date(),
        })
        .where(eq(userCreditBalanceTable.userId, userId));

      // 计算交易后余额
      const balanceAfter = balance.balance - config.creditsRequired;

      // 创建积分交易记录
      const transactionData: any = {
        amount: -config.creditsRequired,
        balanceAfter,
        createdAt: new Date(),
        description: config.description,
        id: createId(),
        type: "consumption" as CreditTransactionType,
        userId,
      };

      // 只有当 uploadId 存在时才设置 relatedUploadId
      if (uploadId) {
        transactionData.relatedUploadId = uploadId;
      }

      await tx.insert(creditTransactionTable).values(transactionData);

      // 如果有上传ID，更新上传记录的消费积分
      if (uploadId) {
        await tx
          .update(uploadsTable)
          .set({
            creditConsumed: config.creditsRequired,
            updatedAt: new Date(),
          })
          .where(eq(uploadsTable.id, uploadId));
      }

      return true;
    });
  } catch (error) {
    console.error('消费积分时出错:', error);
    return false;
  }
}