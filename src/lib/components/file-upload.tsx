import Image from "next/image";
import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";

import { cn } from "~/lib/utils";
import { Button } from "~/ui/button";
import { Card } from "~/ui/card";
import { Input } from "~/ui/input";
import { Spinner } from "~/ui/spinner";

interface FileUploadProps {
  accept?: Record<string, string[]>;
  className?: string;
  isUploading?: boolean;
  maxFiles?: number;
  maxSize?: number; // 单位: MB
  onUploadComplete?: (file: { fileKey: string; fileUrl: string }) => void;
  onUploadError?: (error: Error) => void;
}

export function FileUpload({
  accept = {
    "image/*": [".jpeg", ".jpg", ".png", ".webp"],
  },
  className,
  isUploading = false,
  maxFiles = 1,
  maxSize = 4, // 默认 4MB
  onUploadComplete,
  onUploadError,
}: FileUploadProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(isUploading);
  const [error, setError] = useState<null | string>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles?.length) {
      setFiles(acceptedFiles);
      setError(null);
    }
  }, []);

  const { getInputProps, getRootProps, isDragActive } = useDropzone({
    accept,
    maxFiles,
    maxSize: maxSize * 1024 * 1024, // 转换为字节
    onDrop,
  });

  const handleUpload = async () => {
    if (!files.length) {
      setError("请先选择要上传的文件");
      return;
    }

    try {
      setUploading(true);
      setError(null);

      // 这里需要调用后端 API 进行上传
      const formData = new FormData();
      formData.append("file", files[0]);

      const response = await fetch("/api/upload", {
        body: formData,
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("上传失败");
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      onUploadComplete?.(data);
      setFiles([]); // 清空文件列表
    } catch (err) {
      console.error("上传错误:", err);
      setError(err instanceof Error ? err.message : "上传过程中发生错误");
      onUploadError?.(err instanceof Error ? err : new Error("上传失败"));
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card className={cn("p-4", className)}>
      <div
        {...getRootProps()}
        className={cn(
          `
            flex cursor-pointer flex-col items-center justify-center rounded-lg
            border-2 border-dashed p-6 transition-colors
          `,
          isDragActive
            ? "border-primary bg-primary/5"
            : `
              border-muted-foreground/20
              hover:border-primary/50
            `
        )}
      >
        <Input {...getInputProps()} />

        {files.length > 0 ? (
          <div className="flex flex-col items-center gap-2">
            <div className="text-sm text-muted-foreground">
              已选择 {files.length} 个文件
            </div>
            {files[0].type.startsWith("image/") && (
              <div className="relative h-32 w-32 overflow-hidden rounded-md">
                <Image
                  alt="预览"
                  className="object-cover"
                  fill
                  src={URL.createObjectURL(files[0])}
                />
              </div>
            )}
            <div className="text-sm font-medium">
              {files[0].name} ({(files[0].size / 1024 / 1024).toFixed(2)}MB)
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <div className="text-4xl text-muted-foreground">📁</div>
            <div className="text-center">
              <p className="text-sm font-medium">
                {isDragActive ? "放开以上传" : "拖放文件或点击上传"}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                最大 {maxFiles} 个文件，每个不超过 {maxSize}MB
              </p>
            </div>
          </div>
        )}
      </div>

      {error && <div className="mt-2 text-sm text-destructive">{error}</div>}

      <div className="mt-4 flex justify-end">
        <Button
          className="relative"
          disabled={!files.length || uploading}
          onClick={handleUpload}
        >
          {uploading && <Spinner className="mr-2 h-4 w-4 animate-spin" />}
          {uploading ? "上传中..." : "上传"}
        </Button>
      </div>
    </Card>
  );
}
