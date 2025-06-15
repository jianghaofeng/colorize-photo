"use client";

import { Card } from "~/ui/primitives/card";

export default function ProfileAboutPage() {
  return (
    <div className="container py-6">
      <div className="mx-auto max-w-4xl">
        <h2 className="mb-4 text-xl font-semibold">关于</h2>

        <div
          className={`
            grid gap-6
            md:grid-cols-3
          `}
        >
          {/* 基本信息 */}
          <Card className="p-5">
            <h3 className="mb-4 font-medium">基本信息</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">年龄</span>
                <span className="text-sm font-medium">32</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">城市</span>
                <span className="text-sm font-medium">Amsterdam</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">省份</span>
                <span className="text-sm font-medium">North Holland</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">国家</span>
                <span className="text-sm font-medium">Netherlands</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">邮编</span>
                <span className="text-sm font-medium">1082 NL</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">电话</span>
                <span className="text-sm font-medium">+31 6 1234 56 78</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">邮箱</span>
                <span className="text-sm font-medium">jenny@ktstudio.com</span>
              </div>
            </div>
          </Card>

          {/* 工作经历 */}
          <Card
            className={`
              p-5
              md:col-span-2
            `}
          >
            <h3 className="mb-4 font-medium">工作经历</h3>
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div
                    className={`
                      flex size-10 items-center justify-center rounded-md
                      bg-blue-100 text-blue-600
                      dark:bg-blue-900/30 dark:text-blue-400
                    `}
                  >
                    <svg
                      aria-hidden="true"
                      className="size-6"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <title>Esprito Studios 图标</title>
                      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                    </svg>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium">Esprito Studios</h4>
                  <p className="text-sm text-muted-foreground">高级项目经理</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    2019 - 至今
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div
                    className={`
                      flex size-10 items-center justify-center rounded-md
                      bg-purple-100 text-purple-600
                      dark:bg-purple-900/30 dark:text-purple-400
                    `}
                  >
                    <svg
                      aria-hidden="true"
                      className="size-6"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <title>Cento Plus 图标</title>
                      <path d="M5 3h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2zm0 2v14h14V5H5z" />
                      <path d="M8 10h8v6H8v-6z" />
                    </svg>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium">Cento Plus</h4>
                  <p className="text-sm text-muted-foreground">
                    CRM 产品负责人
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    2012 - 2019
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div
                    className={`
                      flex size-10 items-center justify-center rounded-md
                      bg-green-100 text-green-600
                      dark:bg-green-900/30 dark:text-green-400
                    `}
                  >
                    <svg
                      aria-hidden="true"
                      className="size-6"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <title>Perrier Technologies 图标</title>
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
                      <path d="M12 17l5-5h-3V8h-4v4H7l5 5z" />
                    </svg>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium">Perrier Technologies</h4>
                  <p className="text-sm text-muted-foreground">UX 研究员</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    2010 - 2012
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* 技能 */}
          <Card
            className={`
              p-5
              md:col-span-3
            `}
          >
            <h3 className="mb-4 font-medium">技能</h3>
            <div className="flex flex-wrap gap-2">
              <span
                className={`rounded-md bg-muted px-2.5 py-1 text-xs font-medium`}
              >
                Web 设计
              </span>
              <span
                className={`rounded-md bg-muted px-2.5 py-1 text-xs font-medium`}
              >
                代码审查
              </span>
              <span
                className={`rounded-md bg-muted px-2.5 py-1 text-xs font-medium`}
              >
                Figma
              </span>
              <span
                className={`rounded-md bg-muted px-2.5 py-1 text-xs font-medium`}
              >
                产品开发
              </span>
              <span
                className={`rounded-md bg-muted px-2.5 py-1 text-xs font-medium`}
              >
                Webflow
              </span>
              <span
                className={`rounded-md bg-muted px-2.5 py-1 text-xs font-medium`}
              >
                AI
              </span>
              <span
                className={`rounded-md bg-muted px-2.5 py-1 text-xs font-medium`}
              >
                noCode
              </span>
              <span
                className={`rounded-md bg-muted px-2.5 py-1 text-xs font-medium`}
              >
                管理
              </span>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
