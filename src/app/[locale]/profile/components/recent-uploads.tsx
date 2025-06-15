"use client";

import { Card } from "~/ui/primitives/card";

export function RecentUploads() {
  const uploads = [
    {
      date: "28 Sep 2024",
      icon: "pdf",
      id: 1,
      name: "Project-pitch.pdf",
      size: "4.7 MB",
      time: "3:20 PM",
    },
    {
      date: "1 Oct 2024",
      icon: "doc",
      id: 2,
      name: "Report-v1.docx",
      size: "2.3 MB",
      time: "12:00 PM",
    },
    {
      date: "17 Oct 2024",
      icon: "js",
      id: 3,
      name: "Framework-App.js",
      size: "0.8 MB",
      time: "6:46 PM",
    },
    {
      date: "4 Nov 2024",
      icon: "ai",
      id: 4,
      name: "Mobile-logo.ai",
      size: "0.2 MB",
      time: "11:30 AM",
    },
  ];

  const getFileIcon = (type: string) => {
    switch (type) {
      case "ai":
        return (
          <div
            className={`
            flex size-8 items-center justify-center rounded-md bg-yellow-100
            text-yellow-600
            dark:bg-yellow-900/30 dark:text-yellow-400
          `}
          >
            <svg
              aria-hidden="true"
              className="size-4"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <title>AI文件</title>
              <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 14h-2V9h2v8zm4 0h-2v-6h2v6z" />
            </svg>
          </div>
        );
      case "doc":
        return (
          <div
            className={`
            flex size-8 items-center justify-center rounded-md bg-blue-100
            text-blue-600
            dark:bg-blue-900/30 dark:text-blue-400
          `}
          >
            <svg
              aria-hidden="true"
              className="size-4"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <title>文档文件</title>
              <path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" />
            </svg>
          </div>
        );
      case "js":
        return (
          <div
            className={`
            flex size-8 items-center justify-center rounded-md bg-orange-100
            text-orange-600
            dark:bg-orange-900/30 dark:text-orange-400
          `}
          >
            <svg
              aria-hidden="true"
              className="size-4"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <title>JavaScript文件</title>
              <path d="M3 3h18v18H3V3zm16.5 15c0 .83-.67 1.5-1.5 1.5s-1.5-.67-1.5-1.5.67-1.5 1.5-1.5 1.5.67 1.5 1.5zm-9-2c0 1.1.9 2 2 2s2-.9 2-2v-4h-2v4c0 .28-.22.5-.5.5s-.5-.22-.5-.5V9h-2v7h-2V9H6v7c0 1.1.9 2 2 2s2-.9 2-2z" />
            </svg>
          </div>
        );
      case "pdf":
        return (
          <div
            className={`
            flex size-8 items-center justify-center rounded-md bg-red-100
            text-red-600
            dark:bg-red-900/30 dark:text-red-400
          `}
          >
            <svg
              aria-hidden="true"
              className="size-4"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <title>PDF文件</title>
              <path d="M8 16h8v2H8zm0-4h8v2H8zm6-10H6c-1.1 0-2 .9-2 2v16c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm4 18H6V4h7v5h5v11z" />
            </svg>
          </div>
        );
      default:
        return (
          <div
            className={`
            flex size-8 items-center justify-center rounded-md bg-gray-100
            text-gray-600
            dark:bg-gray-800 dark:text-gray-400
          `}
          >
            <svg
              aria-hidden="true"
              className="size-4"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <title>未知文件</title>
              <path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm-2 16c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm1-4h-2V8h2v6z" />
            </svg>
          </div>
        );
    }
  };

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold">最近上传</h3>
        <button
          className={`
            text-sm text-muted-foreground
            hover:text-primary
          `}
          type="button"
        >
          查看全部
        </button>
      </div>

      <div className="mt-4 space-y-4">
        {uploads.map((file) => (
          <div className="flex items-center justify-between" key={file.id}>
            <div className="flex items-center gap-3">
              {getFileIcon(file.icon)}
              <div>
                <p className="font-medium">{file.name}</p>
                <p className="text-xs text-muted-foreground">
                  {file.size} | {file.date} {file.time}
                </p>
              </div>
            </div>
            <button
              className={`
                rounded-full p-1 text-muted-foreground
                hover:bg-muted/50
              `}
              type="button"
            >
              <svg
                aria-hidden="true"
                className="size-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <title>更多选项</title>
                <circle cx="12" cy="5" r="1" />
                <circle cx="12" cy="12" r="1" />
                <circle cx="12" cy="19" r="1" />
              </svg>
            </button>
          </div>
        ))}
      </div>
    </Card>
  );
}
