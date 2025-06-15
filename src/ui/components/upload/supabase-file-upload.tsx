"use client";

import { Upload, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { forwardRef, useCallback, useEffect, useImperativeHandle, useState } from "react";
import { useDropzone } from "react-dropzone";

import { useSupabaseUpload } from "~/lib/hooks/use-supabase-upload";
import { cn } from "~/lib/utils";
import { Button } from "~/ui/primitives/button";
import { Progress } from "~/ui/primitives/progress";

// 添加ref接口用于暴露清除方法
export interface SupabaseFileUploadRef {
  clearFiles: () => void;
}

interface FileWithPreview extends File {
  errors: readonly import('react-dropzone').FileError[];
  fileKey?: string;
  fileUrl?: string;
  id?: string;
  preview?: string;
  progress?: number;
  status?: "done" | "error" | "uploading";
}

interface SupabaseFileUploadProps {
  accept?: Record<string, string[]>;
  bucketName?: string;
  className?: string;
  disabled?: boolean; // 是否禁用上传
  listType?: "picture-card" | "text"; // 列表类型
  maxCount?: number; // 最大文件数量
  maxSize?: number; // 单位: MB
  onUploadComplete?: (files: { fileKey: string; fileUrl: string }[]) => void;
  onUploadError?: (error: Error) => void;
  path?: string;
  // showPreview?: boolean; // 是否显示预览
}

export const SupabaseFileUpload = function SupabaseFileUpload({ accept = { "image/*": [".jpeg", ".jpg", ".png", ".webp"] }, bucketName = "images", className, disabled = false, listType = "picture-card", maxCount = 1, maxSize = 10, onUploadComplete, onUploadError, path = "uploads", ref }: SupabaseFileUploadProps & { ref?: React.RefObject<null | SupabaseFileUploadRef> }) {
  const [fileList, setFileList] = useState<FileWithPreview[]>([]);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewImage, setPreviewImage] = useState("");
  const [previewTitle, setPreviewTitle] = useState("");

  const t = useTranslations();

  // 将 MIME 类型从对象转换为数组
  const allowedMimeTypes = Object.keys(accept);

  const dropzoneProps = useSupabaseUpload({
    allowedMimeTypes,
    bucketName,
    maxFiles: maxCount,
    maxFileSize: maxSize * 1024 * 1024, // 转换为字节
    path,
    upsert: true,
  });

  // 生成唯一ID
  const generateId = () => Math.random().toString(36).substr(2, 9);

  // 上传处理
  const handleUpload = useCallback(async (file: FileWithPreview) => {
    try {
      // 模拟上传进度
      const progressInterval = setInterval(() => {
        setFileList((prev) =>
          prev.map((f) =>
            f.id === file.id
              ? { ...f, progress: Math.min((f.progress || 0) + 10, 90) }
              : f
          )
        );
      }, 100);

      // 使用现有的上传逻辑
      dropzoneProps.setFiles([file]);
      await dropzoneProps.onUpload();

      clearInterval(progressInterval);

      // 更新文件状态为完成
      setFileList((prev) =>
        prev.map((f) =>
          f.id === file.id ? { ...f, progress: 100, status: "done" } : f
        )
      );
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "上传失败";

      // 更新文件状态为错误
      setFileList((prev) =>
        prev.map((f) => (f.id === file.id ? { ...f, status: "error" } : f))
      );

      if (onUploadError) {
        onUploadError(new Error(errorMsg));
      }
    }
  }, [dropzoneProps, onUploadError]);

  // 文件选择处理
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        // 检查是否超过最大数量
        if (fileList.length + acceptedFiles.length > maxCount) {
          const errorMsg = `最多只能上传 ${maxCount} 张图片`;
          if (onUploadError) {
            onUploadError(new Error(errorMsg));
          }
          return;
        }

        const newFiles = acceptedFiles
          .map((file) => {
            // 检查文件大小
            if (file.size > maxSize * 1024 * 1024) {
              const errorMsg = `文件大小不能超过 ${maxSize}MB`;
              if (onUploadError) {
                onUploadError(new Error(errorMsg));
              }
              return null;
            }

            const fileWithPreview = file as FileWithPreview;
            fileWithPreview.errors = [];
            fileWithPreview.id = generateId();
            fileWithPreview.preview = URL.createObjectURL(file);
            fileWithPreview.status = "uploading";
            fileWithPreview.progress = 0;
            return fileWithPreview;
          })
          .filter(Boolean) as FileWithPreview[];

        if (newFiles.length > 0) {
          setFileList((prev) => [...prev, ...newFiles]);
          // 自动开始上传
          newFiles.forEach((file) => handleUpload(file));
        }
      }
    },
    [fileList.length, maxCount, maxSize, onUploadError, handleUpload]
  );

  const { getInputProps, getRootProps, isDragActive } = useDropzone({
    accept,
    disabled,
    maxFiles: maxCount,
    multiple: true,
    onDrop,
  });

  // 清除文件列表的方法
  const clearFiles = useCallback(() => {
    // 清理预览URL
    fileList.forEach((file) => {
      if (file.preview) {
        URL.revokeObjectURL(file.preview);
      }
    });
    setFileList([]);
  }, [fileList]);

  // 暴露方法给父组件
  useImperativeHandle(ref, () => ({
    clearFiles,
  }), [clearFiles]);



  // 监听上传成功事件
  useEffect(() => {
    if (dropzoneProps.isSuccess && dropzoneProps.successes.length > 0) {
      const successFiles = dropzoneProps.successes.map((fileName) => {
        const fileKey = `${path}/${fileName}`;
        const fileUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${bucketName}/${fileKey}`;
        return { fileKey, fileUrl };
      });

      // 更新文件列表中的 fileKey 和 fileUrl
      setFileList((prev) =>
        prev.map((file, index) => {
          if (index < successFiles.length) {
            return {
              ...file,
              fileKey: successFiles[index].fileKey,
              fileUrl: successFiles[index].fileUrl,
              progress: 100,
              status: "done" as const,
            };
          }
          return file;
        })
      );

      if (onUploadComplete) {
        onUploadComplete(successFiles);
      }
    }
  }, [
    dropzoneProps.isSuccess,
    dropzoneProps.successes,
    path,
    bucketName,
    onUploadComplete,
  ]);

  // 预览图片
  const handlePreview = (file: FileWithPreview) => {
    // 优先使用上传后的URL，如果没有则使用本地预览URL
    const imageUrl = file.fileUrl || file.preview || "";
    setPreviewImage(imageUrl);
    setPreviewTitle(file.name);
    setPreviewVisible(true);
  };

  // 删除文件
  const handleRemove = (file: FileWithPreview) => {
    setFileList((prev) => prev.filter((f) => f.id !== file.id));
    if (file.preview) {
      URL.revokeObjectURL(file.preview);
    }
  };

  // 清理预览URL
  useEffect(() => {
    return () => {
      fileList.forEach((file) => {
        if (file.preview) {
          URL.revokeObjectURL(file.preview);
        }
      });
    };
  }, [fileList]);

  // 上传按钮
  const uploadButton = (
    <div
      {...getRootProps()}
      className={cn(
        `
          flex aspect-[4/3] min-h-[200px] cursor-pointer flex-col items-center
          justify-center rounded-lg border-2 border-dashed border-gray-300
          bg-transparent p-6 transition-colors
          hover:border-gray-400
        `,
        isDragActive && "border-primary bg-primary/5",
        disabled && "cursor-not-allowed opacity-50"
      )}
    >
      <input {...getInputProps()} />
      <Upload className="mb-3 h-10 w-10 text-gray-400" />
      <div className="mb-1 text-lg font-semibold text-gray-700">
        {t("ImageProcessing.uploadImage")}
      </div>
      <div className="mb-1 text-sm text-gray-500">
        {t("ImageProcessing.uploadTip", {
          defaultValue: "点击或拖拽图片到此处",
        })}
      </div>
      <div className="text-xs text-gray-400">
        {t("ImageProcessing.uploadSupport", { maxSize })}
      </div>
    </div>
  );

  if (listType === "text") {
    // 文本列表样式（保持原有逻辑）
    return (
      <div className="space-y-4">
        <div
          {...getRootProps()}
          className={cn(
            `
              cursor-pointer rounded-lg border-2 border-dashed
              border-muted-foreground/25 p-8 text-center transition-colors
              hover:border-muted-foreground/50
            `,
            isDragActive && "border-primary bg-primary/5",
            disabled && "cursor-not-allowed opacity-50",
            className
          )}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center gap-2">
            <div className="text-sm">
              <span className="font-medium">点击上传</span>
              <span className="text-muted-foreground"> 或拖拽图片到此处</span>
            </div>
            <p className="text-xs text-muted-foreground">
              支持 JPG、PNG、WebP 格式，最大 {maxSize}MB
            </p>
          </div>
        </div>
      </div>
    );
  }

  // 照片墙样式
  return (
    <div className={cn("space-y-4", className)}>
      {/* 照片墙网格 */}
      <div
        className={cn(
          "grid gap-4",
          className?.includes("single-upload")
            ? "mx-auto max-w-md grid-cols-1"
            : `
              grid-cols-2
              sm:grid-cols-3
              md:grid-cols-4
            `
        )}
      >
        {/* 只显示一个上传区域或图片预览 */}
        {fileList.length === 0 ? (
          <div>{uploadButton}</div>
        ) : (
          fileList.map((file) => (
            <div className="group relative" key={file.id}>
              <div
                className={cn(
                  `
                    overflow-hidden rounded-lg border-2 border-gray-200
                    bg-gray-50
                  `,
                  className?.includes("single-upload")
                    ? "aspect-[4/3] min-h-[200px]"
                    : "aspect-square"
                )}
              >
                <img
                  alt={file.name}
                  className="h-full w-full cursor-pointer object-cover"
                  onClick={() => handlePreview(file)}
                  src={file.fileUrl || file.preview}
                />
                {/* 上传状态遮罩 */}
                {file.status === "uploading" && (
                  <div
                    className={`
                      bg-opacity-50 absolute inset-0 flex items-center
                      justify-center bg-black
                    `}
                  >
                    <div className="text-sm text-white">
                      <div className="mb-2">上传中...</div>
                      <Progress
                        className="h-1 w-16"
                        value={file.progress || 0}
                      />
                    </div>
                  </div>
                )}
              </div>
              {/* 删除按钮 */}
              <div
                className={`
                  absolute top-2 left-2 opacity-0 transition-opacity
                  group-hover:opacity-100
                `}
              >
                <Button
                  className="h-6 w-6 p-0"
                  onClick={() => handleRemove(file)}
                  size="sm"
                  variant="destructive"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* 预览模态框 */}
      {previewVisible && (
        <div
          className={`
            bg-opacity-75 fixed inset-0 z-50 flex items-center justify-center
            bg-black p-4
          `}
          onClick={() => setPreviewVisible(false)}
        >
          <div className="relative max-h-full max-w-4xl">
            <img
              alt={previewTitle}
              className="max-h-full max-w-full object-contain"
              src={previewImage}
            />
            <Button
              className="absolute top-4 right-4"
              onClick={() => setPreviewVisible(false)}
              size="sm"
              variant="secondary"
            >
              <X className="h-4 w-4" />
            </Button>
            {previewTitle && (
              <div
                className={`
                  bg-opacity-50 absolute bottom-4 left-4 rounded bg-black px-3
                  py-1 text-white
                `}
              >
                {previewTitle}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
