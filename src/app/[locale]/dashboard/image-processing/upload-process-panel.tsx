import type { useTranslations } from "next-intl";

import { AnimatePresence, motion } from "framer-motion";
import {
  Building,
  Camera,
  Cherry,
  Film,
  Heart,
  Rainbow,
  RefreshCcw,
  Snowflake,
  Sparkles,
  Sunrise,
  Upload,
  Wand2,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { createClient } from "~/lib/supabase/client";
import { SupabaseFileUpload, type SupabaseFileUploadRef } from "~/ui/components/upload/supabase-file-upload";
import { Button } from "~/ui/primitives/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/ui/primitives/card";
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
  onImageGenerated: (image: any) => void;
  t: ReturnType<typeof useTranslations>;
}

// 获取着色预设（国际化）
const getColorizationPresets = (t: any) => [
  {
    description: t("ImageProcessing.presets.natural.description"),
    icon: <Sunrise className="h-4 w-4 text-orange-500" />,
    label: t("ImageProcessing.presets.natural.label"),
    value: "natural",
  },
  {
    description: t("ImageProcessing.presets.warm.description"),
    icon: <Heart className="h-4 w-4 text-red-500" />,
    label: t("ImageProcessing.presets.warm.label"),
    value: "warm",
  },
  {
    description: t("ImageProcessing.presets.cool.description"),
    icon: <Snowflake className="h-4 w-4 text-blue-500" />,
    label: t("ImageProcessing.presets.cool.label"),
    value: "cool",
  },
  {
    description: t("ImageProcessing.presets.vibrant.description"),
    icon: <Rainbow className="h-4 w-4 text-purple-500" />,
    label: t("ImageProcessing.presets.vibrant.label"),
    value: "vibrant",
  },
  {
    description: t("ImageProcessing.presets.vintage.description"),
    icon: <Film className="h-4 w-4 text-amber-600" />,
    label: t("ImageProcessing.presets.vintage.label"),
    value: "vintage",
  },
  {
    description: t("ImageProcessing.presets.soft.description"),
    icon: <Cherry className="h-4 w-4 text-pink-500" />,
    label: t("ImageProcessing.presets.soft.label"),
    value: "soft",
  },
];

// 获取修复预设（国际化）
const getRestorePresets = (t: any) => [
  {
    description: t("ImageProcessing.presets.smart.description"),
    icon: <Sparkles className="h-4 w-4 text-yellow-500" />,
    label: t("ImageProcessing.presets.smart.label"),
    value: "smart",
  },
  {
    description: t("ImageProcessing.presets.denoise.description"),
    icon: <RefreshCcw className="h-4 w-4 text-green-500" />,
    label: t("ImageProcessing.presets.denoise.label"),
    value: "denoise",
  },
  {
    description: t("ImageProcessing.presets.detail.description"),
    icon: <Building className="h-4 w-4 text-blue-600" />,
    label: t("ImageProcessing.presets.detail.label"),
    value: "detail",
  },
  {
    description: t("ImageProcessing.presets.professional.description"),
    icon: <Camera className="h-4 w-4 text-purple-600" />,
    label: t("ImageProcessing.presets.professional.label"),
    value: "professional",
  },
];

export function UploadProcessPanel(props: UploadProcessPanelProps) {
  const { onImageGenerated, t } = props;

  // 文件上传组件的引用
  const fileUploadRef = useRef<SupabaseFileUploadRef>(null);

  // 内部状态管理
  const [activeTab, setActiveTab] = useState<"colorization" | "restore">(
    "colorization"
  );
  const [selectedFilter, setSelectedFilter] = useState<string>("natural");
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [currentRecordId, setCurrentRecordId] = useState<null | string>(null);

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

  // 使用Supabase realtime监控记录状态
  useEffect(() => {
    if (!currentRecordId) return;

    console.log('开始监控记录ID:', currentRecordId);
    const supabase = createClient();

    const channel = supabase.realtime
      .channel('user_generate_records_changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          filter: `id=eq.${currentRecordId}`,
          schema: 'public',
          table: 'user_generate_records',
        },
        (payload) => {
          console.log('收到Realtime更新:', payload);
          const record = payload.new as any;

          if (record.status === 'completed' && record.output_url) {
            // 生成成功
            console.log('图片处理完成:', record);
            const newImage = {
              id: record.id,
              originalUrl: record.input_url,
              processedUrl: record.output_url,
              timestamp: new Date(record.completed_at),
              type: record.type,
            };

            onImageGenerated(newImage);
            setIsProcessing(false);
            setCurrentRecordId(null);
            
            // 清除上传的图片和缓存
            setUploadedImageUrl("");
            if (fileUploadRef.current) {
              fileUploadRef.current.clearFiles();
            }
          } else if (record.status === 'failed') {
            // 生成失败
            console.error('图片处理失败:', record.error_message);
            setIsProcessing(false);
            setCurrentRecordId(null);
          }
        }
      )
      .subscribe((status) => {
        console.log('Realtime订阅状态:', status);
      });

    return () => {
      console.log('清理Realtime订阅');
      supabase.removeChannel(channel);
    };
  }, [currentRecordId, onImageGenerated]);

  // 处理图片处理
  const handleProcessImage = async () => {
    if (!uploadedImageUrl) return;

    setIsProcessing(true);
    try {
      const promptValue =
        activeTab === "colorization"
          ? `Colorize this black and white photo with ${selectedFilter} style`
          : `Restore this old or damaged photo using ${selectedFilter} technique`;

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
        throw new Error("处理失败");
      }

      const result = (await response.json()) as { id: string; task_id: string };

      // 设置记录ID以开始监控
      setCurrentRecordId(result.id);
    } catch (error) {
      console.error("处理错误:", error);
      setIsProcessing(false);
    }
  };

  // 渲染选择预设
  const renderSelectPreset = (preset: any) => (
    <div className="flex items-center gap-3 p-2">
      <div
        className={`
          rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 p-2
        `}
      >
        {preset.icon}
      </div>
      <div className="flex-1">
        <div className="text-left text-sm font-medium">{preset.label}</div>
        <div className="text-xs text-muted-foreground">
          {preset.description}
        </div>
      </div>
    </div>
  );

  // 渲染选择值
  const renderSelectValue = () => {
    const presets =
      activeTab === "colorization"
        ? getColorizationPresets(t)
        : getRestorePresets(t);
    const selectedPreset = presets.find((p) => p.value === selectedFilter);
    return selectedPreset
      ? renderSelectPreset(selectedPreset)
      : t("ImageProcessing.selectFilterPlaceholder");
  };

  return (
    <motion.div
      animate={{ opacity: 1, y: 0 }}
      className="h-full"
      initial={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.5 }}
    >
      <Card
        className={`
          flex h-full flex-col overflow-hidden rounded-2xl border
          border-border/20 bg-gradient-to-br from-background/80
          via-background/60 to-accent/10 p-0 shadow-2xl backdrop-blur-xl
        `}
      >
        <CardHeader
          className={`
            border-b border-border/10 bg-gradient-to-r from-accent/5
            to-primary/5 p-6
          `}
        >
          <CardTitle className={`flex items-center gap-3 text-xl font-bold`}>
            <div
              className={`
                rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 p-2
              `}
            >
              <Upload className="h-6 w-6 text-primary" />
            </div>
            {t("ImageProcessing.uploadAndProcess")}
          </CardTitle>
        </CardHeader>

        <CardContent className="flex-1 space-y-6 p-6">
          {/* 文件上传区域 */}
          <div className="space-y-4">
            <Label className="text-sm font-medium">
              {t("ImageProcessing.uploadImage")}
            </Label>
            <div
              className={`
                rounded-xl border-2 border-dashed border-border/20 bg-muted/20
                p-6
              `}
            >
              <SupabaseFileUpload
                ref={fileUploadRef}
                accept={{ "image/*": [".jpeg", ".jpg", ".png", ".webp"] }}
                bucketName="images"
                className="single-upload"
                disabled={isProcessing}
                maxCount={1}
                maxSize={10} // 10MB
                onUploadComplete={(files) => {
                  if (files && files.length > 0) {
                    handleUploadComplete(files[0]);
                  }
                }}
                onUploadError={handleUploadError}
              />
            </div>
          </div>

          {/* 标签页切换 */}
          <Tabs
            onValueChange={(value) => {
              if (isProcessing) return; // 处理中禁用切换
              const newTab = value as "colorization" | "restore";
              setActiveTab(newTab);
              // 切换标签时设置默认滤镜
              const defaultFilter =
                newTab === "colorization" ? "natural" : "smart";
              setSelectedFilter(defaultFilter);
            }}
            value={activeTab}
          >
            <TabsList
              className={`grid w-full grid-cols-2 rounded-xl bg-muted/50 p-1 ${
                isProcessing ? 'pointer-events-none opacity-50' : ''
              }`}
            >
              <TabsTrigger
                className={`
                  rounded-lg
                  data-[state=active]:bg-background
                  data-[state=active]:shadow-sm
                `}
                value="colorization"
              >
                <Sparkles className="mr-2 h-4 w-4" />
                {t("ImageProcessing.colorization")}
              </TabsTrigger>
              <TabsTrigger
                className={`
                  rounded-lg
                  data-[state=active]:bg-background
                  data-[state=active]:shadow-sm
                `}
                value="restore"
              >
                <Wand2 className="mr-2 h-4 w-4" />
                {t("ImageProcessing.restore")}
              </TabsTrigger>
            </TabsList>

            <TabsContent className="space-y-4" value="colorization">
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  {t("ImageProcessing.selectColorStyle")}
                </Label>
                <Select
                  disabled={isProcessing}
                  onValueChange={setSelectedFilter}
                  value={selectedFilter}
                >
                  <SelectTrigger
                    className={`
                      h-auto min-h-[60px] w-full rounded-xl border-border/20
                      bg-background/50 ${
                        isProcessing ? 'opacity-50 cursor-not-allowed' : ''
                      }
                    `}
                  >
                    <SelectValue>{renderSelectValue()}</SelectValue>
                  </SelectTrigger>
                  <SelectContent
                    className={`
                      rounded-xl border-border/20 bg-background/95
                      backdrop-blur-xl
                    `}
                  >
                    {getColorizationPresets(t).map((preset) => (
                      <SelectItem
                        className="rounded-lg"
                        key={preset.value}
                        value={preset.value}
                      >
                        {renderSelectPreset(preset)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </TabsContent>

            <TabsContent className="space-y-4" value="restore">
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  {t("ImageProcessing.selectRestoreMode")}
                </Label>
                <Select
                  disabled={isProcessing}
                  onValueChange={setSelectedFilter}
                  value={selectedFilter}
                >
                  <SelectTrigger
                    className={`
                      h-auto min-h-[60px] w-full rounded-xl border-border/20
                      bg-background/50 ${
                        isProcessing ? 'opacity-50 cursor-not-allowed' : ''
                      }
                    `}
                  >
                    <SelectValue>{renderSelectValue()}</SelectValue>
                  </SelectTrigger>
                  <SelectContent
                    className={`
                      rounded-xl border-border/20 bg-background/95
                      backdrop-blur-xl
                    `}
                  >
                    {getRestorePresets(t).map((preset) => (
                      <SelectItem
                        className="rounded-lg"
                        key={preset.value}
                        value={preset.value}
                      >
                        {renderSelectPreset(preset)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>

        <CardFooter
          className={`
            border-t border-border/10 bg-gradient-to-r from-accent/5
            to-primary/5 p-6
          `}
        >
          <Button
            className={`
              w-full rounded-xl bg-gradient-to-r from-primary to-primary/80 py-3
              text-base font-medium shadow-lg transition-all
              hover:shadow-xl
              disabled:opacity-50
            `}
            disabled={!uploadedImageUrl || isProcessing || !selectedFilter}
            onClick={handleProcessImage}
          >
            <AnimatePresence mode="wait">
              {isProcessing ? (
                <motion.div
                  animate={{ opacity: 1 }}
                  className="flex items-center gap-2"
                  exit={{ opacity: 0 }}
                  initial={{ opacity: 0 }}
                  key="processing"
                >
                  <RefreshCcw className="h-4 w-4 animate-spin" />
                  {t("ImageProcessing.processing")}
                </motion.div>
              ) : (
                <motion.div
                  animate={{ opacity: 1 }}
                  className="flex items-center gap-2"
                  exit={{ opacity: 0 }}
                  initial={{ opacity: 0 }}
                  key="process"
                >
                  <Sparkles className="h-4 w-4" />
                  {activeTab === "colorization"
                    ? t("ImageProcessing.startColorization")
                    : t("ImageProcessing.startRestore")}
                </motion.div>
              )}
            </AnimatePresence>
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
