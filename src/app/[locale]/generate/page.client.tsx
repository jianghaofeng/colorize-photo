"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { useState } from "react";

import { GenerationHistoryPanel } from "./generation-history-panel";
import { UploadProcessPanel } from "./upload-process-panel";

export interface GeneratedImage {
  id: string;
  originalUrl: string;
  processedUrl: string;
  timestamp: Date;
  type: "colorization" | "restore";
}

export function ImageProcessingPageClient() {
  const t = useTranslations();

  // 处理图片生成完成
  const handleImageGenerated = (newImage: GeneratedImage) => {
    // 这里可以添加一些全局的处理逻辑，比如通知等
    console.log('新图片生成完成:', newImage);
  };
  return (
    <div
      className={`min-h-screen`}
    >
      <div className="relative container mx-auto max-w-7xl px-4 py-8">
        {/* 主要内容区域 */}
        <motion.div
          animate={{ opacity: 1, y: 0 }}
          className={`
            grid min-h-[600px] gap-8
            lg:grid-cols-5
          `}
          initial={{ opacity: 0, y: 20 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          {/* 左侧：上传和处理面板 */}
          <div className="lg:col-span-2">
            <UploadProcessPanel
              onImageGenerated={handleImageGenerated}
              t={t}
            />
          </div>

          {/* 右侧：生成历史面板 */}
          <div className="lg:col-span-3">
            <GenerationHistoryPanel
              t={t}
            />
          </div>
        </motion.div>
      </div>
    </div>
  );
}
