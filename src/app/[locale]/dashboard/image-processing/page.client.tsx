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
      className={`
        min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100
        dark:from-slate-900 dark:via-slate-800 dark:to-indigo-900
      `}
    >
      {/* 背景装饰 */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className={`
            absolute -top-40 -right-40 h-80 w-80 rounded-full bg-gradient-to-br
            from-blue-400/20 to-purple-600/20 blur-3xl
          `}
        />
        <div
          className={`
            absolute -bottom-40 -left-40 h-80 w-80 rounded-full
            bg-gradient-to-tr from-pink-400/20 to-orange-600/20 blur-3xl
          `}
        />
        <div
          className={`
            absolute top-1/2 left-1/2 h-96 w-96 -translate-x-1/2
            -translate-y-1/2 transform rounded-full bg-gradient-to-r
            from-cyan-400/10 to-blue-600/10 blur-3xl
          `}
        />
      </div>

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
