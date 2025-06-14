import { relations } from "drizzle-orm";

import { userTable } from "../users/tables";
import { userGenerateRecordsTable } from "./tables";

// 用户AI生成记录表关系
export const userGenerateRecordsRelations = relations(
  userGenerateRecordsTable,
  ({ one }) => ({
    // 关联用户
    user: one(userTable, {
      fields: [userGenerateRecordsTable.userId],
      references: [userTable.id],
    }),
  }),
);