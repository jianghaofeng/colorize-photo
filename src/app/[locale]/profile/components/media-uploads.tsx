"use client";

import { Card } from "~/ui/primitives/card";

export function MediaUploads() {
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">媒体上传</h3>
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

      <div className="mt-4 h-[200px]">
        {/* 模拟图表 */}
        <div className="relative h-full w-full">
          {/* Y轴标签 */}
          <div
            className={`
              absolute top-0 -left-10 flex h-full flex-col justify-between
              text-xs text-muted-foreground
            `}
          >
            <span>$100K</span>
            <span>$80K</span>
            <span>$60K</span>
            <span>$40K</span>
            <span>$20K</span>
            <span>$0K</span>
          </div>

          {/* 图表网格线 */}
          <div className="absolute inset-0 flex flex-col justify-between">
            {Array.from({ length: 6 }).map((_, i) => (
              <div className="h-px w-full bg-border/30" key={i} />
            ))}
          </div>

          {/* 图表曲线 */}
          <div className="absolute inset-0 flex items-end">
            <svg
              aria-hidden="true"
              className="h-full w-full"
              preserveAspectRatio="none"
              viewBox="0 0 300 200"
            >
              <title>媒体上传统计图表</title>
              {/* 曲线下方的渐变填充 */}
              <defs>
                <linearGradient
                  id="chartGradient"
                  x1="0%"
                  x2="0%"
                  y1="0%"
                  y2="100%"
                >
                  <stop
                    offset="0%"
                    stopColor="rgb(59, 130, 246)"
                    stopOpacity="0.2"
                  />
                  <stop
                    offset="100%"
                    stopColor="rgb(59, 130, 246)"
                    stopOpacity="0.05"
                  />
                </linearGradient>
              </defs>

              {/* 填充区域 */}
              <path
                d="M0,160 C20,140 40,180 60,120 C80,60 100,100 120,70 C140,40 160,20 180,40 C200,60 220,100 240,80 C260,60 280,100 300,80 L300,200 L0,200 Z"
                fill="url(#chartGradient)"
              />

              {/* 曲线 */}
              <path
                d="M0,160 C20,140 40,180 60,120 C80,60 100,100 120,70 C140,40 160,20 180,40 C200,60 220,100 240,80 C260,60 280,100 300,80"
                fill="none"
                stroke="rgb(59, 130, 246)"
                strokeWidth="2"
              />
            </svg>
          </div>

          {/* X轴标签 */}
          <div
            className={`
              absolute -bottom-6 flex w-full justify-between text-xs
              text-muted-foreground
            `}
          >
            <span>Jan</span>
            <span>Feb</span>
            <span>Mar</span>
            <span>Apr</span>
            <span>May</span>
            <span>Jun</span>
            <span>Jul</span>
            <span>Aug</span>
            <span>Sep</span>
            <span>Oct</span>
            <span>Nov</span>
            <span>Dec</span>
          </div>
        </div>
      </div>
    </Card>
  );
}
