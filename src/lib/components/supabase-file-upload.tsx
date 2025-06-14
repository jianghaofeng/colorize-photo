"use client";

import { useEffect, useState } from "react";

import { useSupabaseUpload } from "~/hooks/use-supabase-upload";
import { Dropzone, DropzoneContent, DropzoneEmptyState } from "~/ui/components/dropzone";

interface SupabaseFileUploadProps {
  accept?: Record<string, string[]>;
  className?: string;
  isUploading?: boolean;
  maxFiles?: number;
  maxSize?: number; // 单位: MB
  onUploadComplete?: (file: { fileKey: string; fileUrl: string }) => void;
  onUploadError?: (error: Error) => void;
  bucketName?: string;
  path?: string;
}

export function SupabaseFileUpload({
  accept = {
    "image/*": [".jpeg", ".jpg", ".png", ".webp"],
  },
  className,
  isUploading = false,
  maxFiles = 1,
  maxSize = 10, // 默认 10MB
  onUploadComplete,
  onUploadError,
  bucketName = "images",
  path = "uploads",
}: SupabaseFileUploadProps) {
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  
  // 将 MIME 类型从对象转换为数组
  const allowedMimeTypes = Object.keys(accept);
  
  const dropzoneProps = useSupabaseUpload({
    allowedMimeTypes,
    bucketName,
    maxFiles,
    maxFileSize: maxSize * 1024 * 1024, // 转换为字节
    path,
    upsert: true,
  });
  
  // 监听上传成功事件
  useEffect(() => {
    if (dropzoneProps.isSuccess && dropzoneProps.files.length > 0 && !uploadedUrl) {
      // 构建文件URL
      const fileName = dropzoneProps.files[0].name;
      const fileKey = `${path}/${fileName}`;
      const fileUrl = `https://${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${bucketName}/${fileKey}`;
      
      setUploadedUrl(fileUrl);
      
      if (onUploadComplete) {
        onUploadComplete({
          fileKey,
          fileUrl,
        });
      }
    }
  }, [dropzoneProps.isSuccess, dropzoneProps.files, uploadedUrl, path, bucketName, onUploadComplete]);
  
  // 处理错误
  useEffect(() => {
    if (dropzoneProps.errors.length > 0 && onUploadError) {
      const error = new Error(dropzoneProps.errors[0].message);
      onUploadError(error);
    }
  }, [dropzoneProps.errors, onUploadError]);
  
  return (
    <Dropzone {...dropzoneProps} className={className}>
      <DropzoneEmptyState />
      <DropzoneContent />
    </Dropzone>
  );
}