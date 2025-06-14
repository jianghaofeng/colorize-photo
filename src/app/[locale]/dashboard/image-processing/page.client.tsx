"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";

import { useCurrentUserOrRedirect } from "~/lib/supabase-auth-client";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/ui/primitives/card";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "~/ui/primitives/resizable";
import { Skeleton } from "~/ui/primitives/skeleton";

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
  const { isPending } = useCurrentUserOrRedirect();
  const t = useTranslations();

  const [activeTab, setActiveTab] = useState<"colorization" | "restore">(
    "colorization"
  );
  const [selectedFilter, setSelectedFilter] = useState<string>("natural");
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [selectedImage, setSelectedImage] = useState<GeneratedImage | null>(
    null
  );

  // 处理图片上传完成
  const handleUploadComplete = ({
    fileUrl,
  }: {
    fileKey: string;
    fileUrl: string;
  }) => {
    setUploadedImageUrl(fileUrl);
  };

  // 处理图片上传错误
  const handleUploadError = (error: Error) => {
    console.error("上传错误:", error);
    // 这里可以添加错误提示
  };

  // handleProcessImage 已移动到 UploadProcessPanel 组件中

  // 如果正在加载，显示骨架屏
  if (isPending) {
    return (
      <div
        className={`
          container mx-auto grid max-w-7xl flex-1 items-start gap-4 p-4
          md:grid-cols-2 md:gap-8
        `}
      >
        <div className="grid gap-4">
          <Card>
            <CardHeader className="space-y-2">
              <Skeleton className="h-6 w-1/3" />
              <Skeleton className="h-4 w-1/2" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-64 w-full" />
            </CardContent>
            <CardFooter>
              <Skeleton className="h-10 w-28" />
            </CardFooter>
          </Card>
        </div>
        <div className="grid gap-4">
          <Card>
            <CardHeader className="space-y-2">
              <Skeleton className="h-6 w-1/3" />
              <Skeleton className="h-4 w-1/2" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-64 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <Card className="container mx-auto h-screen max-w-7xl">
      <CardHeader>
        <CardTitle>{t("ImageProcessing.title")}</CardTitle>
        <CardDescription>
          {activeTab === "colorization"
            ? t("ImageProcessing.colorizeDescription")
            : t("ImageProcessing.restoreDescription")}
        </CardDescription>
      </CardHeader>
      <CardContent className="h-full rounded-none p-0">
        <ResizablePanelGroup className="h-full" direction="horizontal">
          <ResizablePanel className="h-full" defaultSize={30} minSize={25}>
            {/* 左侧：输入表单 */}
            <div className="grid h-full gap-4">
              <UploadProcessPanel
                activeTab={activeTab}
                handleUploadComplete={handleUploadComplete}
                handleUploadError={handleUploadError}
                isProcessing={isProcessing}
                selectedFilter={selectedFilter}
                setActiveTab={setActiveTab}
                setSelectedFilter={setSelectedFilter}
                setUploadedImageUrl={setUploadedImageUrl}
                setIsProcessing={setIsProcessing}
                setGeneratedImages={setGeneratedImages}
                setSelectedImage={setSelectedImage}
                t={t}
                uploadedImageUrl={uploadedImageUrl}
              />
            </div>
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel defaultSize={70}>
            {/* 右侧：生成记录 */}
            <div className="grid gap-4">
              <GenerationHistoryPanel
                generatedImages={generatedImages}
                selectedImage={selectedImage}
                setSelectedImage={setSelectedImage}
                t={t}
              />
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </CardContent>
    </Card>
  );
}
