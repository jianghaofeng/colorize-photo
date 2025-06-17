import type { GetProp, UploadFile, UploadProps } from 'antd';
import type { useTranslations } from "next-intl";

import { PlusOutlined } from '@ant-design/icons';
import { Image, Upload } from 'antd';
import { AnimatePresence, motion } from "framer-motion";
import {
  Building,
  Camera,
  Cherry,
  Coins,
  Film,
  Heart,
  Rainbow,
  RefreshCcw,
  Snowflake,
  Sparkles,
  Sunrise,
  Upload as UploadIcon,
  Wand2,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { createClient } from "~/lib/supabase/client";
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
import { ToggleGroup, ToggleGroupItem } from "~/ui/primitives/toggle-group";

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

type FileType = Parameters<GetProp<UploadProps, 'beforeUpload'>>[0];

const getBase64 = (file: FileType): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });

export function UploadProcessPanel(props: UploadProcessPanelProps) {
  const { onImageGenerated, t } = props;

  // 内部状态管理
  const [activeTab, setActiveTab] = useState<"colorization" | "super_resolution">(
    "colorization"
  );
  const [selectedFilter, setSelectedFilter] = useState<string>("natural");
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [currentRecordId, setCurrentRecordId] = useState<null | string>(null);
  const [upscaleFactor, setUpscaleFactor] = useState<number>(1);
  const [creditBalance, setCreditBalance] = useState<number>(0);
  const [isLoadingCredits, setIsLoadingCredits] = useState<boolean>(true);

  // antd Upload 相关状态
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState('');

  // 处理antd Upload预览
  const handlePreview = async (file: UploadFile) => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj as FileType);
    }
    setPreviewImage(file.url || (file.preview as string));
    setPreviewOpen(true);
  };

  // 处理antd Upload变化
  const handleChange: UploadProps['onChange'] = ({ fileList: newFileList }) => {
    setFileList(newFileList);
    // 如果有文件且上传成功，设置URL
    if (newFileList.length > 0 && newFileList[0].status === 'done' && newFileList[0].response) {
      setUploadedImageUrl(newFileList[0].response.url);
    } else if (newFileList.length === 0) {
      setUploadedImageUrl('');
    }
  };

  // 自定义上传函数
  const customUpload = async (options: any) => {
    const { file, onError, onSuccess } = options;

    try {
      const supabase = createClient();
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;

      const { data, error } = await supabase.storage
        .from('images')
        .upload(fileName, file);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('images')
        .getPublicUrl(fileName);

      setUploadedImageUrl(publicUrl);
      onSuccess({ url: publicUrl }, file);
    } catch (error) {
      console.error('上传错误:', error);
      onError(error);
    }
  };

  // 清除文件
  const clearFiles = () => {
    setFileList([]);
    setUploadedImageUrl('');
  };

  // 获取用户积分余额
  useEffect(() => {
    const fetchCreditBalance = async () => {
      try {
        setIsLoadingCredits(true);
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (user) {
          const { data: balance, error } = await supabase
            .from('user_credit_balance')
            .select('balance')
            .eq('user_id', user.id)
            .single();

          if (error) {
            console.error('获取积分余额失败:', error);
            setCreditBalance(0);
          } else {
            setCreditBalance(balance?.balance || 0);
          }
        }
      } catch (error) {
        console.error('获取积分余额时出错:', error);
        setCreditBalance(0);
      } finally {
        setIsLoadingCredits(false);
      }
    };

    fetchCreditBalance();
  }, []);

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

            // 更新积分余额（减少1积分）
            setCreditBalance(prev => Math.max(0, prev - 1));

            // 清除上传的图片和缓存
            setUploadedImageUrl("");
            clearFiles();
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

    // 检查积分是否足够
    if (creditBalance < 1) {
      // 这里可以显示积分不足的提示或跳转到充值页面
      console.error('积分不足，无法处理图片');
      return;
    }

    setIsProcessing(true);
    try {
      const promptValue =
        activeTab === "colorization"
          ? `Colorize this black and white photo with ${selectedFilter} style`
          : `图像超分`;

      const parameters = {
        n: 1,
        ...(activeTab === "super_resolution" && { upscale_factor: upscaleFactor })
      };

      const response = await fetch("/api/image/process", {
        body: JSON.stringify({
          functionType: activeTab,
          imageUrl: uploadedImageUrl,
          parameters,
          prompt: promptValue
        }),
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
      });

      if (!response.ok) {
        const errorData: any = await response.json();
        if (errorData.code === 'INSUFFICIENT_CREDITS') {
          // 积分不足错误
          throw new Error('积分不足，请先充值积分');
        }
        throw new Error(errorData.error || "处理失败");
      }

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
              <UploadIcon className="h-6 w-6 text-primary" />
            </div>
            {t("ImageProcessing.uploadAndProcess")}
          </CardTitle>
        </CardHeader>

        <CardContent className="flex-1 space-y-6 p-6">
          {/* 积分余额显示 */}
          <div className={`
            rounded-xl bg-gradient-to-r from-primary/10 to-accent/10 p-4
          `}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Coins className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium">{t("ImageProcessing.creditBalance")}</span>
              </div>
              <div className="flex items-center gap-2">
                {isLoadingCredits ? (
                  <div className="h-4 w-8 animate-pulse rounded bg-muted" />
                ) : (
                  <span className={`
                    text-lg font-bold
                    ${creditBalance < 1 ? 'text-destructive' : 'text-primary'
                    }
                  `}>
                    {creditBalance}
                  </span>
                )}
              </div>
            </div>
            {creditBalance < 1 && (
              <div className="mt-2 text-xs text-destructive">
                {t("ImageProcessing.insufficientCredits")}
              </div>
            )}
          </div>

          {/* 文件上传区域 */}
          <div className="space-y-4">
            <Label className="text-sm font-medium">
              {t("ImageProcessing.uploadImage")}
            </Label>
            <div className="flex justify-start">
              <Upload
                accept="image/*"
                className="upload-large"
                customRequest={customUpload}
                disabled={isProcessing}
                fileList={fileList}
                listType="picture-card"
                maxCount={1}
                onChange={handleChange}
                onPreview={handlePreview}
                showUploadList={{
                  showDownloadIcon: false,
                  showPreviewIcon: true,
                  showRemoveIcon: true,
                }}
              >
                {fileList.length >= 1 ? null : (
                  <button
                    className={`
                      flex h-full w-full flex-col items-center justify-center
                      gap-2 transition-colors
                      hover:bg-primary/5
                    `}
                    style={{ background: 'none', border: 0 }}
                    type="button"
                  >
                    <PlusOutlined className="text-2xl text-gray-400" />
                    <div className="text-sm text-gray-600">{t("ImageProcessing.uploadImage")}</div>
                  </button>
                )}
              </Upload>
            </div>
            {previewImage && (
              <Image
                preview={{
                  afterOpenChange: (visible) => !visible && setPreviewImage(''),
                  onVisibleChange: (visible) => setPreviewOpen(visible),
                  visible: previewOpen,
                }}
                src={previewImage}
                wrapperStyle={{ display: 'none' }}
              />
            )}
          </div>

          {/* 标签页切换 */}
          <Tabs
            onValueChange={(value) => {
              if (isProcessing) return; // 处理中禁用切换
              const newTab = value as "colorization" | "super_resolution";
              setActiveTab(newTab);
              // 切换标签时设置默认滤镜
              const defaultFilter =
                newTab === "colorization" ? "natural" : "smart";
              setSelectedFilter(defaultFilter);
            }}
            value={activeTab}
          >
            <TabsList
              className={`
                grid w-full grid-cols-2 rounded-xl bg-muted/50 p-1
                ${isProcessing ? 'pointer-events-none opacity-50' : ''
                }
              `}
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
                value="super_resolution"
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
                      bg-background/50
                      ${isProcessing ? 'cursor-not-allowed opacity-50' : ''
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

            <TabsContent className="space-y-4" value="super_resolution">
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  {t("ImageProcessing.upscaleFactor")}
                </Label>
                <ToggleGroup
                  className="grid w-full grid-cols-4 gap-3"
                  disabled={isProcessing}
                  onValueChange={(value) => value && setUpscaleFactor(Number(value))}
                  type="single"
                  value={upscaleFactor.toString()}
                >
                  <ToggleGroupItem
                    className={`
                      group relative flex h-20 flex-col items-center
                      justify-center rounded-2xl border-2 border-border/30
                      bg-gradient-to-br from-background/80 to-background/60 p-4
                      shadow-sm transition-all duration-200
                      hover:scale-[1.02] hover:border-border/50
                      hover:from-background hover:to-background/90
                      hover:shadow-md
                      data-[state=on]:scale-[1.02]
                      data-[state=on]:border-primary/50
                      data-[state=on]:bg-gradient-to-br
                      data-[state=on]:from-primary data-[state=on]:to-primary/90
                      data-[state=on]:text-primary-foreground
                      data-[state=on]:shadow-lg
                      ${isProcessing ? 'cursor-not-allowed opacity-50' : `
                        cursor-pointer
                      `}
                    `}
                    value="1"
                  >
                    <span className={`
                      text-xl font-bold tracking-tight
                      group-data-[state=on]:text-primary-foreground
                    `}>1x</span>
                  </ToggleGroupItem>
                  <ToggleGroupItem
                    className={`
                      group relative flex h-20 flex-col items-center
                      justify-center rounded-2xl border-2 border-border/30
                      bg-gradient-to-br from-background/80 to-background/60 p-4
                      shadow-sm transition-all duration-200
                      hover:scale-[1.02] hover:border-border/50
                      hover:from-background hover:to-background/90
                      hover:shadow-md
                      data-[state=on]:scale-[1.02]
                      data-[state=on]:border-primary/50
                      data-[state=on]:bg-gradient-to-br
                      data-[state=on]:from-primary data-[state=on]:to-primary/90
                      data-[state=on]:text-primary-foreground
                      data-[state=on]:shadow-lg
                      ${isProcessing ? 'cursor-not-allowed opacity-50' : `
                        cursor-pointer
                      `}
                    `}
                    value="2"
                  >
                    <span className={`
                      text-xl font-bold tracking-tight
                      group-data-[state=on]:text-primary-foreground
                    `}>2x</span>
                    {/* <span className="text-xs text-muted-foreground group-data-[state=on]:text-primary-foreground/80 mt-0.5">{t("ImageProcessing.upscale2xDesc")}</span> */}
                  </ToggleGroupItem>
                  <ToggleGroupItem
                    className={`
                      group relative flex h-20 flex-col items-center
                      justify-center rounded-2xl border-2 border-border/30
                      bg-gradient-to-br from-background/80 to-background/60 p-4
                      shadow-sm transition-all duration-200
                      hover:scale-[1.02] hover:border-border/50
                      hover:from-background hover:to-background/90
                      hover:shadow-md
                      data-[state=on]:scale-[1.02]
                      data-[state=on]:border-primary/50
                      data-[state=on]:bg-gradient-to-br
                      data-[state=on]:from-primary data-[state=on]:to-primary/90
                      data-[state=on]:text-primary-foreground
                      data-[state=on]:shadow-lg
                      ${isProcessing ? 'cursor-not-allowed opacity-50' : `
                        cursor-pointer
                      `}
                    `}
                    value="3"
                  >
                    <span className={`
                      text-xl font-bold tracking-tight
                      group-data-[state=on]:text-primary-foreground
                    `}>3x</span>
                  </ToggleGroupItem>
                  <ToggleGroupItem
                    className={`
                      group relative flex h-20 flex-col items-center
                      justify-center rounded-2xl border-2 border-border/30
                      bg-gradient-to-br from-background/80 to-background/60 p-4
                      shadow-sm transition-all duration-200
                      hover:scale-[1.02] hover:border-border/50
                      hover:from-background hover:to-background/90
                      hover:shadow-md
                      data-[state=on]:scale-[1.02]
                      data-[state=on]:border-primary/50
                      data-[state=on]:bg-gradient-to-br
                      data-[state=on]:from-primary data-[state=on]:to-primary/90
                      data-[state=on]:text-primary-foreground
                      data-[state=on]:shadow-lg
                      ${isProcessing ? 'cursor-not-allowed opacity-50' : `
                        cursor-pointer
                      `}
                    `}
                    value="4"
                  >
                    <span className={`
                      text-xl font-bold tracking-tight
                      group-data-[state=on]:text-primary-foreground
                    `}>4x</span>
                  </ToggleGroupItem>
                </ToggleGroup>
              </div>
            </TabsContent>
          </Tabs>

          {/* 生成按钮 */}
          <div className="mt-6">
            <Button
              className={`
                w-full rounded-xl bg-gradient-to-r from-primary to-primary/80
                py-3 text-base font-medium shadow-lg transition-all
                hover:shadow-xl
                disabled:opacity-50
              `}
              disabled={!uploadedImageUrl || isProcessing || creditBalance < 1}
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
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
