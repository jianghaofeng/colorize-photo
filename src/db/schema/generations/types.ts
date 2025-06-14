import type { InferSelectModel } from "drizzle-orm";

import type { userGenerateRecordsTable } from "./tables";

// 用户AI生成记录类型
export type UserGenerateRecord = InferSelectModel<typeof userGenerateRecordsTable>;

// 生成类型
export type GenerationType = 
  | "image_colorization" 
  | "image_restoration" 
  | "image_enhancement" 
  | "video_colorization" 
  | "video_restoration" 
  | "video_enhancement";

// 生成状态
export type GenerationStatus = 
  | "pending" 
  | "processing" 
  | "completed" 
  | "failed";