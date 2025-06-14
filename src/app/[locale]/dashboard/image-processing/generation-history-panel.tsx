import type { Dispatch, SetStateAction } from "react";

import Image from "next/image";

import { Button } from "~/ui/primitives/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/ui/primitives/card";

import type { GeneratedImage } from "./page.client";

interface GenerationHistoryPanelProps {
  generatedImages: GeneratedImage[];
  selectedImage: GeneratedImage | null;
  setSelectedImage: Dispatch<SetStateAction<GeneratedImage | null>>;
  t: any;
}

export function GenerationHistoryPanel({
  generatedImages,
  selectedImage,
  setSelectedImage,
  t,
}: GenerationHistoryPanelProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("ImageProcessing.history")}</CardTitle>
        <CardDescription>
          {t("ImageProcessing.historyDescription")}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {generatedImages.length === 0 ? (
          <div
            className={`
              flex h-64 flex-col items-center justify-center text-center
            `}
          >
            <p className="text-muted-foreground">
              {t("ImageProcessing.noHistory")}
            </p>
            <p className="text-sm text-muted-foreground">
              {t("ImageProcessing.startProcessing")}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {selectedImage && (
              <div className="space-y-2">
                <p className="text-sm font-medium">
                  {t("ImageProcessing.selectedImage")}
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">
                      {t("ImageProcessing.original")}
                    </p>
                    <div
                      className={`
                        relative h-40 w-full overflow-hidden rounded-md
                      `}
                    >
                      <Image
                        alt={t("ImageProcessing.original")}
                        className="object-cover"
                        fill
                        src={selectedImage.originalUrl}
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">
                      {t("ImageProcessing.processed")}
                    </p>
                    <div
                      className={`
                        relative h-40 w-full overflow-hidden rounded-md
                      `}
                    >
                      <Image
                        alt={t("ImageProcessing.processed")}
                        className="object-cover"
                        fill
                        src={selectedImage.processedUrl}
                      />
                    </div>
                  </div>
                </div>
                <div className="flex justify-between">
                  <p className="text-xs text-muted-foreground">
                    {selectedImage.timestamp.toLocaleString()}
                  </p>
                  <p className="text-xs font-medium">
                    {selectedImage.type === "colorize"
                      ? t("ImageProcessing.colorize")
                      : t("ImageProcessing.restore")}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <Button
                    className="flex-1"
                    onClick={() => {
                      // 下载处理后的图片
                      window.open(selectedImage.processedUrl, "_blank");
                    }}
                    variant="outline"
                  >
                    {t("ImageProcessing.download")}
                  </Button>
                  <Button
                    className="flex-1"
                    onClick={() => {
                      // 分享处理后的图片（这里可以实现分享功能）
                      alert("分享功能待实现");
                    }}
                    variant="outline"
                  >
                    {t("ImageProcessing.share")}
                  </Button>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <p className="text-sm font-medium">
                {t("ImageProcessing.recentHistory")}
              </p>
              <div className="grid grid-cols-3 gap-2">
                {generatedImages.map((image) => (
                  <div
                    className={`cursor-pointer overflow-hidden rounded-md`}
                    key={image.id}
                    onClick={() => setSelectedImage(image)}
                  >
                    <div className="relative h-24 w-full">
                      <Image
                        alt={t("ImageProcessing.historyItem")}
                        className="object-cover"
                        fill
                        src={image.processedUrl}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
