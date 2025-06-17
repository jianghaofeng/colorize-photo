"use client";

import { Card, Image } from "antd";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertCircle,
  CheckCircle,
  Clock,
  Download,
  Eye,
  History,
  ImageIcon,
  Loader2,
  MoreHorizontal,
  Share2,
  Sparkles
} from "lucide-react";
import { useEffect, useState } from "react";

import { createClient } from "~/lib/supabase/client";
import { Badge } from "~/ui/primitives/badge";
import { Button } from "~/ui/primitives/button";
// 移除自定义Card组件导入，使用Ant Design的Card
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/ui/primitives/dropdown-menu";
import { ScrollArea } from "~/ui/primitives/scroll-area";
import { Skeleton } from "~/ui/primitives/skeleton";

interface GenerationHistoryPanelProps {
  t: any;
}

// 数据库记录类型
interface UserGenerateRecord {
  completedAt: null | string;
  createdAt: string;
  creditConsumed: number;
  errorMessage: null | string;
  id: string;
  inputUrl: string;
  outputUrl: null | string;
  parameters: null | string;
  resultMetadata: null | string;
  status: "completed" | "failed" | "pending" | "processing";
  transactionId: null | string;
  type: "colorization" | "super_resolution";
  updatedAt: string;
  userId: string;
}

// 获取状态对应的图标和颜色
const getStatusDisplay = (status: string) => {
  switch (status) {
    case "completed":
      return {
        bgColor: "bg-green-500/10",
        color: "text-green-500",
        icon: CheckCircle,
        label: "已完成",
      };
    case "failed":
      return {
        bgColor: "bg-red-500/10",
        color: "text-red-500",
        icon: AlertCircle,
        label: "失败",
      };
    case "pending":
      return {
        bgColor: "bg-yellow-500/10",
        color: "text-yellow-500",
        icon: Clock,
        label: "等待中",
      };
    case "processing":
      return {
        bgColor: "bg-blue-500/10",
        color: "text-blue-500",
        icon: Loader2,
        label: "处理中",
      };
    default:
      return {
        bgColor: "bg-gray-500/10",
        color: "text-gray-500",
        icon: Clock,
        label: "未知",
      };
  }
};

export function GenerationHistoryPanel({
  t,
}: GenerationHistoryPanelProps) {
  const [records, setRecords] = useState<UserGenerateRecord[]>([]);
  const [loading, setLoading] = useState(true);
  // const [selectedImage, setSelectedImage] = useState<null | UserGenerateRecord>(null);

  // 获取当前用户的生成记录
  useEffect(() => {
    const fetchRecords = async () => {
      try {
        const supabase = createClient();

        // 获取当前用户
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();
        if (authError || !user) {
          console.error("获取用户信息失败:", authError);
          return;
        }

        // 获取用户的生成记录
        const { data, error } = await supabase
          .from("user_generate_records")
          .select(`
            id,
            user_id,
            type,
            status,
            input_url,
            output_url,
            parameters,
            result_metadata,
            credit_consumed,
            transaction_id,
            error_message,
            created_at,
            updated_at,
            completed_at
          `)
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(20);

        if (error) {
          console.error("获取生成记录失败:", error);
        } else {
          console.log("获取到的记录:", data);
          // 转换字段名从snake_case到camelCase
          const transformedData = (data || []).map(record => ({
            completedAt: record.completed_at,
            createdAt: record.created_at,
            creditConsumed: record.credit_consumed,
            errorMessage: record.error_message,
            id: record.id,
            inputUrl: record.input_url,
            outputUrl: record.output_url,
            parameters: record.parameters,
            resultMetadata: record.result_metadata,
            status: record.status,
            transactionId: record.transaction_id,
            type: record.type,
            updatedAt: record.updated_at,
            userId: record.user_id
          }));
          setRecords(transformedData);
          setLoading(false)
        }
      } catch (error) {
        console.error("获取记录时发生错误:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecords();
  }, []);

  // 设置Realtime订阅
  useEffect(() => {
    const supabase = createClient();

    const getCurrentUserId = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      return user?.id;
    };

    const setupRealtimeSubscription = async () => {
      const userId = await getCurrentUserId();
      if (!userId) return;

      console.log("设置Realtime订阅，用户ID:", userId);

      const channel = supabase.realtime
        .channel("user_generate_records_history")
        .on(
          "postgres_changes",
          {
            event: "*",
            filter: `user_id=eq.${userId}`,
            schema: "public",
            table: "user_generate_records",
          },
          (payload) => {
            console.log("收到Realtime更新:", payload);

            // 转换数据库记录格式
            const transformRecord = (dbRecord: any): UserGenerateRecord => ({
              completedAt: dbRecord.completed_at,
              createdAt: dbRecord.created_at,
              creditConsumed: dbRecord.credit_consumed,
              errorMessage: dbRecord.error_message,
              id: dbRecord.id,
              inputUrl: dbRecord.input_url,
              outputUrl: dbRecord.output_url,
              parameters: dbRecord.parameters,
              resultMetadata: dbRecord.result_metadata,
              status: dbRecord.status,
              transactionId: dbRecord.transaction_id,
              type: dbRecord.type,
              updatedAt: dbRecord.updated_at,
              userId: dbRecord.user_id
            });

            if (payload.eventType === "INSERT") {
              const newRecord = transformRecord(payload.new);
              setRecords((prev) => [newRecord, ...prev.slice(0, 19)]); // 保持最多20条记录
            } else if (payload.eventType === "UPDATE") {
              const updatedRecord = transformRecord(payload.new);
              setRecords((prev) =>
                prev.map((record) =>
                  record.id === updatedRecord.id ? updatedRecord : record,
                ),
              );
            } else if (payload.eventType === "DELETE") {
              const deletedRecord = payload.old as any;
              setRecords((prev) =>
                prev.filter((record) => record.id !== deletedRecord.id),
              );
            }
          },
        )
        .subscribe((status) => {
          console.log("Realtime订阅状态:", status);
        });

      return () => {
        console.log("清理Realtime订阅");
        supabase.removeChannel(channel);
      };
    };

    const cleanup = setupRealtimeSubscription();

    return () => {
      cleanup.then((fn) => fn?.());
    };
  }, []);


  return (
    <motion.div
      animate={{ opacity: 1, y: 0 }}
      className="h-full"
      initial={{ opacity: 0, y: 20 }}
      transition={{ delay: 0.2, duration: 0.5 }}
    >
      <Card
        className={`
          flex h-full flex-col overflow-hidden rounded-2xl border
          border-border/40 bg-gradient-to-br from-background/80
          via-background/60 to-accent/10 p-0 shadow-2xl backdrop-blur-xl
          dark:border-border/20
        `}
        styles={{
          body: { flex: 1, padding: '4px' },
          header: {
            background: 'linear-gradient(to right, rgba(var(--accent), 0.05), rgba(var(--primary), 0.05))',
            borderBottom: '1px solid rgba(var(--border), 0.1)',
            padding: '24px'
          }

        }}
        title={
          <div className="flex items-center gap-3 text-xl font-bold">
            <div
              className={`
                rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 p-2
              `}
            >
              <History className="h-6 w-6 text-primary" />
            </div>
            {t("ImageProcessing.history")}
            <Badge className="ml-auto" variant="outline">
              <Clock className="mr-1 h-3 w-3" />
              {records.length}
            </Badge>
          </div>
        }
      >
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              animate={{ opacity: 1, scale: 1 }}
              className={`
                flex h-full flex-col items-center justify-center space-y-6
                text-center
              `}
              exit={{ opacity: 0, scale: 0.9 }}
              initial={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.4 }}
            >
              <div className="relative">
                <div
                  className={`
                    flex h-24 w-24 items-center justify-center rounded-2xl
                    bg-gradient-to-br from-accent/20 to-accent/10
                    text-muted-foreground shadow-lg
                  `}
                >
                  <ImageIcon className="h-12 w-12" />
                </div>
                <div
                  className={`
                    absolute -top-2 -right-2 rounded-full bg-gradient-to-r
                    from-primary/20 to-accent/20 p-2
                  `}
                >
                  <Sparkles className="h-4 w-4 text-primary" />
                </div>
              </div>
              <div className="space-y-3">
                <h3 className="text-xl font-bold text-foreground">
                  {t("ImageProcessing.noHistory")}
                </h3>
                <p className="max-w-sm text-muted-foreground/80">
                  {t("ImageProcessing.startProcessing")}
                </p>
              </div>
            </motion.div>
          ) : (
            <motion.div
              animate={{ opacity: 1, y: 0 }}
              className="flex h-full flex-col space-y-6"
              initial={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.5 }}
            >
              {/* 数据库记录列表 */}
              <div className="h-0 flex-1">
                {/* 显示所有记录，使用Card组件结构 */}
                <ScrollArea className="h-200">
                  <div className="space-y-2 pr-2">
                    {records.map((record, index) => {
                      const statusDisplay = getStatusDisplay(record.status);
                      const StatusIcon = statusDisplay.icon;
                      const isCompleted = record.status === "completed" && record.outputUrl;

                      return (
                        <motion.div
                          animate={{ opacity: 1, y: 0 }}
                          className="group"
                          initial={{ opacity: 0, y: 20 }}
                          key={record.id}
                          transition={{ delay: index * 0.05 }}
                        >
                          <Card
                            className={`
                              border border-border/30 py-0 transition-all
                              duration-200
                              hover:border-border/50 hover:shadow-md
                              dark:border-border/10 dark:hover:border-border/20
                            `}
                            styles={{
                              body: { padding: '0' },
                              header: { padding: '12px' }
                            }}
                            title={
                              <div className={`
                                flex items-center justify-between
                              `}>
                                <div className="flex flex-col gap-2">
                                  <Badge variant="outline">
                                    {record.type === "colorization" ? "上色" : "修复"}
                                  </Badge>
                                  <div className={`
                                    text-sm text-muted-foreground
                                  `}>
                                    {new Date(record.createdAt).toLocaleString()}
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <StatusIcon
                                    className={`
                                      h-4 w-4
                                      ${record.status === "processing" ? `
                                        animate-spin
                                      ` : ""
                                      }
                                      ${statusDisplay.color}
                                    `}
                                  />
                                  <span className="text-sm font-medium">
                                    {statusDisplay.label}
                                  </span>
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button
                                        className="flex-1"
                                        size="sm"
                                        variant="outline"
                                      >
                                        <MoreHorizontal className="h-4 w-4" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      <DropdownMenuItem
                                        disabled={!isCompleted}
                                        onClick={() => {
                                          if (record.outputUrl) {
                                            const link = document.createElement('a');
                                            link.href = record.outputUrl;
                                            link.download = `processed-${record.id}.jpg`;
                                            link.click();
                                          }
                                        }}
                                      >
                                        <Download className="mr-2 h-4 w-4" />
                                        {isCompleted ? '下载' : '等待完成'}
                                      </DropdownMenuItem>
                                      <DropdownMenuItem
                                        disabled={!isCompleted}
                                        onClick={() => {
                                          if (record.outputUrl) {
                                            if (navigator.share) {
                                              navigator.share({
                                                title: '处理后的图片',
                                                url: record.outputUrl
                                              });
                                            } else {
                                              navigator.clipboard.writeText(record.outputUrl);
                                            }
                                          }
                                        }}
                                      >
                                        <Share2 className="mr-2 h-4 w-4" />
                                        {isCompleted ? '分享' : '等待完成'}
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </div>
                              </div>
                            }
                          >
                            <div
                              className={`
                                grid h-full grid-cols-2 gap-0 overflow-hidden
                                rounded-xl
                              `}
                            >
                              <div className="relative h-full w-full">
                                <div
                                  className={`
                                    absolute top-2 left-2 z-10 rounded
                                    bg-black/70 px-2 py-1 text-xs font-semibold
                                    text-white
                                  `}
                                >
                                  {t("Home.before")}
                                </div>
                                <Image
                                  alt={`Before`}
                                  className="object-cover"
                                  src={record.inputUrl}
                                />
                              </div>
                              <div className="relative h-full w-full">
                                <div
                                  className={`
                                    absolute top-2 z-10 rounded bg-black/70 px-2
                                    py-1 text-xs font-semibold text-white
                                  `}
                                >
                                  {t("Home.after")}
                                </div>
                                {isCompleted ? (
                                  <Image
                                    alt={`${record.outputUrl} After`}
                                    className="object-cover"
                                    src={record.outputUrl!}
                                  />
                                ) : (
                                  <div className={`
                                    flex h-full w-full items-center
                                    justify-center bg-muted/30
                                  `}>
                                    <div className={`
                                      flex flex-col items-center gap-2
                                      text-center
                                    `}>
                                      <StatusIcon
                                        className={`
                                          h-8 w-8
                                          ${record.status === "processing" ? `
                                            animate-spin
                                          ` : ""}
                                          ${statusDisplay.color}
                                        `}
                                      />
                                      <span className={`
                                        text-xs text-muted-foreground
                                      `}>
                                        {statusDisplay.label}
                                      </span>
                                      {record.status === "failed" && record.errorMessage && (
                                        <span className={`
                                          max-w-20 truncate text-xs text-red-500
                                        `}>
                                          {record.errorMessage}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                )}

                              </div>
                            </div>
                          </Card>
                        </motion.div>
                      );
                    })}
                  </div>
                </ScrollArea>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </motion.div>
  );
}
