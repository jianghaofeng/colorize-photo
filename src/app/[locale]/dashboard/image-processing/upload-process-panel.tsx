import type { useTranslations } from "next-intl";
import type { ReactNode } from "react";

import { id } from "date-fns/locale";
import { Building, ImageIcon, RefreshCcw } from "lucide-react";
import {
  Camera,
  Cherry,
  Film,
  Flower2,
  Heart,
  Leaf,
  Rainbow,
  Snowflake,
  Sunrise,
} from "lucide-react";
import Image from "next/image";
import React from "react";

import { SupabaseFileUpload } from "~/lib/components/supabase-file-upload";
import { Button } from "~/ui/primitives/button";
import { Card, CardContent, CardFooter } from "~/ui/primitives/card";
import { Label } from "~/ui/primitives/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/ui/primitives/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/ui/primitives/tabs";

export interface UploadProcessPanelProps {
  activeTab: "colorization" | "restore";
  handleUploadComplete: (params: { fileKey: string; fileUrl: string }) => void;
  handleUploadError: (error: Error) => void;
  isProcessing: boolean;
  selectedFilter: string;
  setActiveTab: (tab: "colorization" | "restore") => void;
  setGeneratedImages: (callback: (prev: any[]) => any[]) => void;
  setIsProcessing: (isProcessing: boolean) => void;
  setSelectedFilter: (filter: string) => void;
  setSelectedImage: (image: any) => void;
  setUploadedImageUrl: (url: string) => void;
  t: ReturnType<typeof useTranslations>;
  uploadedImageUrl: string;
}

const getColorizationPresets = (t: ReturnType<typeof useTranslations>) => [
  {
    color: "text-green-500",
    description: t("ImageProcessing.presets.natural.description"),
    icon: <Leaf className="h-10 w-10" />,
    id: 1,
    label: t("ImageProcessing.presets.natural.label"),
    value: t("ImageProcessing.presets.natural.value"),
  },
  {
    color: "text-orange-500",
    description: t("ImageProcessing.presets.warm.description"),
    icon: <Sunrise className="h-10 w-10" />,
    id: 2,
    label: t("ImageProcessing.presets.warm.label"),
    value: t("ImageProcessing.presets.warm.value"),
  },
  {
    color: "text-blue-500",
    description: t("ImageProcessing.presets.cool.description"),
    icon: <Snowflake className="h-10 w-10" />,
    id: 3,
    label: t("ImageProcessing.presets.cool.label"),
    value: t("ImageProcessing.presets.cool.value"),
  },
  {
    color: "text-amber-600",
    description: t("ImageProcessing.presets.vintage.description"),
    icon: <Camera className="h-10 w-10" />,
    id: 4,
    label: t("ImageProcessing.presets.vintage.label"),
    value: t("ImageProcessing.presets.vintage.value"),
  },
  {
    color:
      "text-rainbow bg-gradient-to-r from-red-500 via-yellow-500 to-blue-500 bg-clip-text text-transparent",
    description: t("ImageProcessing.presets.vibrant.description"),
    icon: <Rainbow className="h-10 w-10" />,
    id: 5,
    label: t("ImageProcessing.presets.vibrant.label"),
    value: t("ImageProcessing.presets.vibrant.value"),
  },
  {
    color: "text-pink-400",
    description: t("ImageProcessing.presets.soft.description"),
    icon: <Flower2 className="h-10 w-10" />,
    id: 6,
    label: t("ImageProcessing.presets.soft.label"),
    value: t("ImageProcessing.presets.soft.value"),
  },
  {
    color: "text-purple-600",
    description: t("ImageProcessing.presets.cinematic.description"),
    icon: <Film className="h-10 w-10" />,
    id: 7,
    label: t("ImageProcessing.presets.cinematic.label"),
    value: t("ImageProcessing.presets.cinematic.value"),
  },
  {
    color: "text-rose-400",
    description: t("ImageProcessing.presets.japanese.description"),
    icon: <Cherry className="h-10 w-10" />,
    id: 8,
    label: t("ImageProcessing.presets.japanese.label"),
    value: t("ImageProcessing.presets.japanese.value"),
  },
  {
    color: "text-pink-500",
    description: t("ImageProcessing.presets.korean.description"),
    icon: <Heart className="h-10 w-10" />,
    id: 9,
    label: t("ImageProcessing.presets.korean.label"),
    value: t("ImageProcessing.presets.korean.value"),
  },
  {
    color: "text-stone-600",
    description: t("ImageProcessing.presets.historical.description"),
    icon: <Building className="h-10 w-10" />,
    id: 10,
    label: t("ImageProcessing.presets.historical.label"),
    value: t("ImageProcessing.presets.historical.value"),
  },
];

export function UploadProcessPanel(props: UploadProcessPanelProps) {
  const {
    activeTab,
    handleUploadComplete,
    handleUploadError,
    isProcessing,
    selectedFilter,
    setActiveTab,
    setGeneratedImages,
    setIsProcessing,
    setSelectedFilter,
    setSelectedImage,
    t,
    uploadedImageUrl,
  } = props;

  // 处理图片处理
  const handleProcessImage = async () => {
    if (!uploadedImageUrl) {
      // 显示错误提示：请先上传图片
      return;
    }

    setIsProcessing(true);

    try {
      // 获取实际的 prompt 值
      let promptValue = selectedFilter;

      if (activeTab === "colorization") {
        // 对于着色功能，根据 id 查找对应的 value
        const preset = getColorizationPresets(t).find(p => p.id.toString() === selectedFilter);
        if (preset) {
          promptValue = preset.value;
        }
      } else if (activeTab === "restore") {
        // 对于恢复功能，将 id 映射回强度值
        const intensityMap: Record<string, string> = {
          "1": "light",
          "2": "medium",
          "3": "strong"
        };
        promptValue = intensityMap[selectedFilter] || "medium";
      }

      // 调用后端API进行图片处理
      const response = await fetch("/api/image/process", {
        body: JSON.stringify({
          functionType: activeTab,
          imageUrl: uploadedImageUrl,
          prompt: promptValue,
        }),
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
      });

      if (!response.ok) {
        const errorData: any = await response.json();
        throw new Error(errorData.error || "图像处理失败");
      }

    } catch (error) {
      console.error("处理图片时出错:", error);
      // 显示错误提示
    } finally {
      setIsProcessing(false);
    }
  };

  // 图标尺寸
  const iconSizeClass = "h-8 w-8";

  // 图标在左，右侧为标题和描述两行
  const renderSelectPreset = (preset: any) => (
    <div className="flex w-full items-center gap-4">
      <span
        className={`
          flex shrink-0 items-center justify-center
          ${iconSizeClass}
        `}
      >
        {
          preset.icon
        }
      </span>
      <span className="flex min-w-0 flex-col items-start">
        <span className="truncate leading-tight font-medium">
          {preset.label}
        </span>
        <span className="truncate text-xs leading-tight text-muted-foreground">
          {preset.description}
        </span>
      </span>
    </div>
  );


  // 自定义 SelectValue 渲染
  const renderSelectValue = (selected: string): ReactNode => {
    const preset = getColorizationPresets(t).find((p) => p.id.toString() === selected);
    if (!preset) return null;
    return renderSelectPreset(preset);
  };


  return (
    <Card className="flex h-full flex-col rounded-none">
      <CardContent className="space-y-4">
        <Tabs
          className="w-full"
          defaultValue="colorization"
          onValueChange={(value: string) =>
            setActiveTab(value as "colorization" | "restore")
          }
          value={activeTab}
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger className="flex items-center gap-2" value="colorization">
              <ImageIcon className="h-4 w-4" />
              {t("ImageProcessing.colorize")}
            </TabsTrigger>
            <TabsTrigger className="items-center= flex gap-2" value="restore">
              <RefreshCcw className="h-4 w-4" />
              {t("ImageProcessing.restore")}
            </TabsTrigger>
          </TabsList>

          <TabsContent className="h-full min-h-0 flex-1" value="colorization">
            <div className={`flex min-h-0 flex-1 flex-col space-y-4 py-4`}>
              <SupabaseFileUpload
                bucketName="images"
                isUploading={isProcessing}
                maxFiles={1}
                maxSize={10} // 10MB
                onUploadComplete={handleUploadComplete}
                onUploadError={handleUploadError}
                path="colorization"
              />

              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  {t("ImageProcessing.selectFilter")}
                </Label>
                <Select
                  defaultValue=""
                  onValueChange={setSelectedFilter}
                  value={selectedFilter || ""}
                >
                  <SelectTrigger className="h-20 w-full gap-4">
                    <SelectValue
                      placeholder={t("ImageProcessing.selectFilterPlaceholder")}
                    >
                      {
                        renderSelectValue(
                          selectedFilter
                        ) as unknown as ReactNode
                      }
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {getColorizationPresets(t).map((preset) => (
                      <SelectItem
                        className={preset.color}
                        key={preset.id}
                        value={preset.id.toString()}
                      >
                        {renderSelectPreset(preset)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="restore">
            <div className="space-y-4 py-4">
              <SupabaseFileUpload
                bucketName="images"
                isUploading={isProcessing}
                maxFiles={1}
                maxSize={10} // 10MB
                onUploadComplete={handleUploadComplete}
                onUploadError={handleUploadError}
                path="restore"
              />

              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  {t("ImageProcessing.restoreIntensity")}
                </Label>
                <Select
                  defaultValue="2"
                  onValueChange={setSelectedFilter}
                  value={selectedFilter}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue
                      placeholder={t(
                        "ImageProcessing.selectIntensityPlaceholder"
                      )}
                    />
                  </SelectTrigger>
                  <SelectContent className="h-20">
                    <SelectItem key="1" value="1">
                      {t("ImageProcessing.intensityLight")}
                    </SelectItem>
                    <SelectItem key="2" value="2">
                      {t("ImageProcessing.intensityMedium")}
                    </SelectItem>
                    <SelectItem key="3" value="3">
                      {t("ImageProcessing.intensityStrong")}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {uploadedImageUrl && (
          <div className="mt-4">
            <p className="mb-2 text-sm font-medium">
              {t("ImageProcessing.preview")}
            </p>
            <div className={`relative h-64 w-full overflow-hidden rounded-md`}>
              <Image
                alt={t("ImageProcessing.uploadedImage")}
                className="object-contain"
                fill
                src={uploadedImageUrl}
              />
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button
          className="w-full"
          disabled={!uploadedImageUrl || isProcessing}
          onClick={handleProcessImage}
        >
          {isProcessing
            ? t("ImageProcessing.processing")
            : activeTab === "colorization"
              ? t("ImageProcessing.colorizeButton")
              : t("ImageProcessing.restoreButton")}
        </Button>
      </CardFooter>
    </Card>
  );
}
