import { integer, pgEnum, pgTable, text, timestamp } from "drizzle-orm/pg-core";

import { userTable } from "../users/tables";

// AI生成类型枚举
export const generationTypeEnum = pgEnum("generation_type", [
    "colorization", // 图像上色
    "restoration", // 图像修复
]);

// AI生成状态枚举
export const generationStatusEnum = pgEnum("generation_status", [
    "pending", // 等待处理
    "processing", // 处理中
    "completed", // 已完成
    "failed", // 失败
]);

// 用户AI生成记录表
export const userGenerateRecordsTable = pgTable("user_generate_records", {
    completedAt: timestamp("completed_at"), // 完成时间
    // 时间戳
    createdAt: timestamp("created_at").defaultNow().notNull(),
    // 积分消耗
    creditConsumed: integer("credit_consumed").notNull(), // 消耗的积分
    errorMessage: text("error_message"), // 错误信息

    // 基本信息
    id: text("id").primaryKey(),
    // 输入和输出
    inputUrl: text("input_url").notNull(), // 输入文件URL

    outputUrl: text("output_url"), // 输出文件URL（处理完成后才有）
    // 处理参数和结果
    parameters: text("parameters"), // 处理参数（JSON字符串）
    resultMetadata: text("result_metadata"), // 结果元数据（JSON字符串）

    status: generationStatusEnum("status").notNull(), // 生成状态
    transactionId: text("transaction_id"), // 关联的积分交易ID

    type: generationTypeEnum("type").notNull(), // 生成类型
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
    userId: text("user_id")
        .notNull()
        .references(() => userTable.id, { onDelete: "cascade" }),
});