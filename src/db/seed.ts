import { createId } from '@paralleldrive/cuid2';

import { db } from './index';
import { creditConsumptionConfigTable } from './schema/credits/tables';

/**
 * 运行所有种子数据
 */
export async function runSeed() {
  try {
    await seedCreditConsumptionConfig();
    console.log('所有种子数据初始化完成');
  } catch (error) {
    console.error('种子数据初始化失败:', error);
    process.exit(1);
  }
}

/**
 * 初始化积分消耗配置
 */
export async function seedCreditConsumptionConfig() {
  console.log('开始初始化积分消耗配置...');

  const configs = [
    {
      actionType: 'colorize_image',
      createdAt: new Date(),
      creditsRequired: 1,
      description: '图像上色处理',
      id: createId(),
      isActive: 1,
      updatedAt: new Date(),
    },
    {
      actionType: 'enhance_image',
      createdAt: new Date(),
      creditsRequired: 1,
      description: '图像超分处理',
      id: createId(),
      isActive: 1,
      updatedAt: new Date(),
    },
    {
      actionType: 'process_image',
      createdAt: new Date(),
      creditsRequired: 1,
      description: '通用图像处理',
      id: createId(),
      isActive: 1,
      updatedAt: new Date(),
    },
  ];

  try {
    // 检查是否已存在配置
    const existingConfigs = await db.query.creditConsumptionConfigTable.findMany();

    if (existingConfigs.length === 0) {
      await db.insert(creditConsumptionConfigTable).values(configs);
      console.log('积分消耗配置初始化完成');
    } else {
      console.log('积分消耗配置已存在，跳过初始化');
    }
  } catch (error) {
    console.error('初始化积分消耗配置失败:', error);
    throw error;
  }
}

// 如果直接运行此文件
if (require.main === module) {
  runSeed().then(() => {
    console.log('种子数据运行完成');
    process.exit(0);
  });
}