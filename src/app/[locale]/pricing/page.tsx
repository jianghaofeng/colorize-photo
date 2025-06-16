import type { Metadata } from "next";

import { PricingPageClient } from "./page.client";

export async function generateMetadata(): Promise<Metadata> {

  return {
    description: "选择最适合您的积分套餐，享受专业的 AI 图像上色和超分辨率服务",
    title: "积分充值 - AI 图像处理",
  };
}

export default function PricingPage() {
  return <PricingPageClient />;
}
