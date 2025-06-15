import type { InferSelectModel } from "drizzle-orm";

import type { userGenerateRecordsTable } from "./tables";

// 生成状态
export type GenerationStatus = 
  | "completed" 
  | "failed" 
  | "pending" 
  | "processing";

// 生成类型
export type GenerationType = 
  | "image_colorization" 
  | "image_enhancement" 
  | "image_restoration" 
  | "video_colorization" 
  | "video_enhancement" 
  | "video_restoration";

// 用户AI生成记录类型
export type UserGenerateRecord = InferSelectModel<typeof userGenerateRecordsTable>;