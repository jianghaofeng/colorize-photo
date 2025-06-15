"use client";

import { Card } from "~/ui/primitives/card";

import { MediaUploads } from "../components/media-uploads";
import { ProfileHeader } from "../components/profile-header";

export default function ProfileDashboardPage() {
  return (
    <div className="container py-10">
      <div className="mx-auto max-w-4xl">
        {/* 个人资料头部 */}
        <ProfileHeader />

        {/* 统计卡片 */}
        <div
          className={`
          mt-8 grid gap-6
          md:grid-cols-2
          lg:grid-cols-4
        `}
        >
          <Card className="p-4">
            <h3 className="text-sm font-medium text-muted-foreground">
              总上传
            </h3>
            <p className="mt-2 text-2xl font-bold">1,284</p>
            <div className="mt-2 flex items-center text-xs">
              <span className="text-green-500">+12.5%</span>
              <span className="ml-1 text-muted-foreground">较上月</span>
            </div>
          </Card>

          <Card className="p-4">
            <h3 className="text-sm font-medium text-muted-foreground">
              已完成项目
            </h3>
            <p className="mt-2 text-2xl font-bold">42</p>
            <div className="mt-2 flex items-center text-xs">
              <span className="text-green-500">+8.2%</span>
              <span className="ml-1 text-muted-foreground">较上月</span>
            </div>
          </Card>

          <Card className="p-4">
            <h3 className="text-sm font-medium text-muted-foreground">
              活跃客户
            </h3>
            <p className="mt-2 text-2xl font-bold">16</p>
            <div className="mt-2 flex items-center text-xs">
              <span className="text-red-500">-2.0%</span>
              <span className="ml-1 text-muted-foreground">较上月</span>
            </div>
          </Card>

          <Card className="p-4">
            <h3 className="text-sm font-medium text-muted-foreground">
              平均评分
            </h3>
            <p className="mt-2 text-2xl font-bold">4.8</p>
            <div className="mt-2 flex items-center text-xs">
              <span className="text-green-500">+0.3</span>
              <span className="ml-1 text-muted-foreground">较上月</span>
            </div>
          </Card>
        </div>

        {/* 媒体上传图表 */}
        <div className="mt-8">
          <MediaUploads />
        </div>

        {/* 辅助信息卡片 */}
        <div
          className={`
          mt-8 grid gap-6
          md:grid-cols-2
        `}
        >
          {/* 贡献者 */}
          <Card className="p-4">
            <h3 className="mb-4 text-lg font-medium">贡献者</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`
                    flex size-10 items-center justify-center rounded-full
                    bg-blue-100 text-blue-600
                    dark:bg-blue-900/30 dark:text-blue-400
                  `}
                  >
                    TH
                  </div>
                  <div>
                    <p className="font-medium">Tyler Hero</p>
                    <p className="text-xs text-muted-foreground">6 贡献者</p>
                  </div>
                </div>
                <button
                  className={`
                    rounded-md border border-input bg-background px-2 py-1
                    text-xs
                  `}
                  type="button"
                >
                  查看
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`
                    flex size-10 items-center justify-center rounded-full
                    bg-purple-100 text-purple-600
                    dark:bg-purple-900/30 dark:text-purple-400
                  `}
                  >
                    EH
                  </div>
                  <div>
                    <p className="font-medium">Esther Howard</p>
                    <p className="text-xs text-muted-foreground">29 贡献者</p>
                  </div>
                </div>
                <button
                  className={`
                    rounded-md border border-input bg-background px-2 py-1
                    text-xs
                  `}
                  type="button"
                >
                  查看
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`
                    flex size-10 items-center justify-center rounded-full
                    bg-green-100 text-green-600
                    dark:bg-green-900/30 dark:text-green-400
                  `}
                  >
                    CF
                  </div>
                  <div>
                    <p className="font-medium">Cody Fisher</p>
                    <p className="text-xs text-muted-foreground">34 贡献者</p>
                  </div>
                </div>
                <button
                  className={`
                    rounded-md border border-input bg-background px-2 py-1
                    text-xs
                  `}
                  type="button"
                >
                  查看
                </button>
              </div>
            </div>
            <div className="mt-4 text-center">
              <button
                className={`
                  text-sm text-primary
                  hover:underline
                `}
                type="button"
              >
                查看所有贡献者
              </button>
            </div>
          </Card>

          {/* 辅助信息 */}
          <Card className="p-4">
            <h3 className="mb-4 text-lg font-medium">辅助</h3>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <div className="flex items-center">
                  <div className="size-3 rounded-full bg-blue-500" />
                  <span className="ml-2 text-sm">ERP</span>
                </div>
                <div className="mt-1 h-2 w-full rounded-full bg-muted">
                  <div className="h-full w-[35%] rounded-full bg-blue-500" />
                </div>
              </div>
              <div className="flex-1">
                <div className="flex items-center">
                  <div className="size-3 rounded-full bg-red-500" />
                  <span className="ml-2 text-sm">HRM</span>
                </div>
                <div className="mt-1 h-2 w-full rounded-full bg-muted">
                  <div className="h-full w-[25%] rounded-full bg-red-500" />
                </div>
              </div>
            </div>

            <div className="mt-4 flex items-center gap-4">
              <div className="flex-1">
                <div className="flex items-center">
                  <div className="size-3 rounded-full bg-green-500" />
                  <span className="ml-2 text-sm">DMS</span>
                </div>
                <div className="mt-1 h-2 w-full rounded-full bg-muted">
                  <div className="h-full w-[20%] rounded-full bg-green-500" />
                </div>
              </div>
              <div className="flex-1">
                <div className="flex items-center">
                  <div className="size-3 rounded-full bg-purple-500" />
                  <span className="ml-2 text-sm">CRM</span>
                </div>
                <div className="mt-1 h-2 w-full rounded-full bg-muted">
                  <div className="h-full w-[15%] rounded-full bg-purple-500" />
                </div>
              </div>
            </div>

            <div className="mt-4 flex items-center">
              <div className="flex-1">
                <div className="flex items-center">
                  <div className="size-3 rounded-full bg-orange-500" />
                  <span className="ml-2 text-sm">DAM</span>
                </div>
                <div className="mt-1 h-2 w-full rounded-full bg-muted">
                  <div className="h-full w-[5%] rounded-full bg-orange-500" />
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
