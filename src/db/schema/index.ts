export * from "./payments/relations";
export * from "./payments/tables";
export * from "./payments/types";

export * from "./uploads/relations";
// 从tables中导出表定义，但不包括relations
export { uploadsTable } from "./uploads/tables";
export * from "./uploads/types";

// 积分系统
export * from "./credits/relations";
export * from "./credits/tables";
export * from "./credits/types";

// AI生成记录系统
export * from "./generations/relations";
export * from "./generations/tables";
export * from "./generations/types";

// relations
// export * from "./users/relations";

// schema
export * from "./users/tables";
// types
