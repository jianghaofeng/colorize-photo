"use client";

import { Card } from "~/ui/primitives/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/ui/primitives/tabs";

export function ProfileTabs() {
  return (
    <Tabs className="w-full" defaultValue="works">
      <TabsList className="w-full justify-start border-b bg-transparent p-0">
        <TabsTrigger
          className={`
            rounded-none border-0 border-b-2 border-transparent bg-transparent
            px-4 py-2
            data-[state=active]:border-primary
            data-[state=active]:bg-transparent data-[state=active]:shadow-none
          `}
          value="works"
        >
          作品
        </TabsTrigger>
        <TabsTrigger
          className={`
            rounded-none border-0 border-b-2 border-transparent bg-transparent
            px-4 py-2
            data-[state=active]:border-primary
            data-[state=active]:bg-transparent data-[state=active]:shadow-none
          `}
          value="billing"
        >
          账单
        </TabsTrigger>
        <TabsTrigger
          className={`
            rounded-none border-0 border-b-2 border-transparent bg-transparent
            px-4 py-2
            data-[state=active]:border-primary
            data-[state=active]:bg-transparent data-[state=active]:shadow-none
          `}
          value="settings"
        >
          设置
        </TabsTrigger>
      </TabsList>

      <TabsContent className="mt-6" value="works">
        <div
          className={`
          grid gap-6
          md:grid-cols-2
          lg:grid-cols-3
        `}
        >
          {Array.from({ length: 6 }).map((_, i) => (
            <Card className="overflow-hidden" key={i}>
              <div className="aspect-video bg-muted/30" />
              <div className="p-4">
                <h3 className="font-medium">项目 {i + 1}</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  设计项目描述
                </p>
              </div>
            </Card>
          ))}
        </div>
      </TabsContent>

      <TabsContent className="mt-6" value="billing">
        <Card className="p-6">
          <h2 className="text-xl font-semibold">账单信息</h2>
          <div className="mt-4 space-y-4">
            <div className="flex justify-between border-b pb-2">
              <span className="text-muted-foreground">本月消费</span>
              <span className="font-medium">¥1,299.00</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-muted-foreground">上月消费</span>
              <span className="font-medium">¥899.00</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-muted-foreground">年度总计</span>
              <span className="font-medium">¥12,499.00</span>
            </div>
          </div>
        </Card>
      </TabsContent>

      <TabsContent className="mt-6" value="settings">
        <Card className="p-6">
          <h2 className="text-xl font-semibold">账户设置</h2>
          <div className="mt-4 space-y-4">
            <div>
              <label
                className="block text-sm font-medium text-muted-foreground"
                htmlFor="displayName"
              >
                显示名称
              </label>
              <input
                className={`
                  mt-1 w-full rounded-md border border-input bg-background px-3
                  py-2
                `}
                defaultValue="Jenny Klabber"
                id="displayName"
                type="text"
              />
            </div>
            <div>
              <label
                className="block text-sm font-medium text-muted-foreground"
                htmlFor="email"
              >
                电子邮件
              </label>
              <input
                className={`
                  mt-1 w-full rounded-md border border-input bg-background px-3
                  py-2
                `}
                defaultValue="jenny@kteam.com"
                id="email"
                type="email"
              />
            </div>
            <div>
              <label
                className="block text-sm font-medium text-muted-foreground"
                htmlFor="bio"
              >
                简介
              </label>
              <textarea
                className={`
                  mt-1 w-full rounded-md border border-input bg-background px-3
                  py-2
                `}
                defaultValue="资深项目经理，专注于设计系统和用户体验。"
                id="bio"
                rows={4}
              />
            </div>
            <div className="flex justify-end">
              <button
                className={`
                  rounded-md bg-primary px-4 py-2 text-sm font-medium
                  text-primary-foreground
                `}
                type="button"
              >
                保存更改
              </button>
            </div>
          </div>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
