"use client";

import {
  Bell,
  Eye,
  EyeOff,
  Globe,
  Lock,
  Palette,
  Save,
  Shield,
  User
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "~/ui/primitives/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/ui/primitives/card";
import { Input } from "~/ui/primitives/input";
import { Label } from "~/ui/primitives/label";
import { Separator } from "~/ui/primitives/separator";
import { Switch } from "~/ui/primitives/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/ui/primitives/tabs";
import { Textarea } from "~/ui/primitives/textarea";

export default function SettingsPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [settings, setSettings] = useState({
    bio: "热爱摄影和图像处理的创意工作者，专注于AI图像修复和色彩化技术。",
    email: "jenny@example.com",
    emailNotifications: true,
    fullName: "Jenny Klabber",
    language: "zh-CN",
    location: "Amsterdam, Netherlands",
    phone: "+31 6 1234 56 78",
    pushNotifications: false,
    theme: "system",
    twoFactorEnabled: false,
    username: "jenny_klabber",
    website: "https://jenny-portfolio.com",
  });

  const handleSave = async () => {
    setIsLoading(true);
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success("设置已保存");
    } catch (error) {
      toast.error("保存失败，请重试");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (key: string, value: string | boolean) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-gray-900/50">
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            个人设置
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            管理您的账户设置和偏好
          </p>
        </div>

        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profile">个人资料</TabsTrigger>
            <TabsTrigger value="account">账户安全</TabsTrigger>
            <TabsTrigger value="notifications">通知设置</TabsTrigger>
            <TabsTrigger value="preferences">偏好设置</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="mr-2 h-5 w-5" />
                  基本信息
                </CardTitle>
                <CardDescription>
                  更新您的个人资料信息
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">全名</Label>
                    <Input
                      id="fullName"
                      value={settings.fullName}
                      onChange={(e) => handleInputChange("fullName", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="username">用户名</Label>
                    <Input
                      id="username"
                      value={settings.username}
                      onChange={(e) => handleInputChange("username", e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">邮箱地址</Label>
                  <Input
                    id="email"
                    type="email"
                    value={settings.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                  />
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="phone">电话号码</Label>
                    <Input
                      id="phone"
                      value={settings.phone}
                      onChange={(e) => handleInputChange("phone", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location">位置</Label>
                    <Input
                      id="location"
                      value={settings.location}
                      onChange={(e) => handleInputChange("location", e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="website">个人网站</Label>
                  <Input
                    id="website"
                    type="url"
                    value={settings.website}
                    onChange={(e) => handleInputChange("website", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bio">个人简介</Label>
                  <Textarea
                    id="bio"
                    rows={4}
                    value={settings.bio}
                    onChange={(e) => handleInputChange("bio", e.target.value)}
                    placeholder="介绍一下您自己..."
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="account" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Lock className="mr-2 h-5 w-5" />
                  密码安全
                </CardTitle>
                <CardDescription>
                  管理您的密码和账户安全设置
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">当前密码</Label>
                  <div className="relative">
                    <Input
                      id="currentPassword"
                      type={showPassword ? "text" : "password"}
                      placeholder="输入当前密码"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newPassword">新密码</Label>
                  <Input
                    id="newPassword"
                    type={showPassword ? "text" : "password"}
                    placeholder="输入新密码"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">确认新密码</Label>
                  <Input
                    id="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    placeholder="再次输入新密码"
                  />
                </div>
                <Button variant="outline" className="w-full">
                  更新密码
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="mr-2 h-5 w-5" />
                  双重认证
                </CardTitle>
                <CardDescription>
                  为您的账户添加额外的安全保护
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">启用双重认证</p>
                    <p className="text-sm text-gray-500">
                      使用手机应用程序进行身份验证
                    </p>
                  </div>
                  <Switch
                    checked={settings.twoFactorEnabled}
                    onCheckedChange={(checked) => handleInputChange("twoFactorEnabled", checked)}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Bell className="mr-2 h-5 w-5" />
                  通知偏好
                </CardTitle>
                <CardDescription>
                  选择您希望接收的通知类型
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">邮件通知</p>
                    <p className="text-sm text-gray-500">
                      接收重要更新和活动通知
                    </p>
                  </div>
                  <Switch
                    checked={settings.emailNotifications}
                    onCheckedChange={(checked) => handleInputChange("emailNotifications", checked)}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">推送通知</p>
                    <p className="text-sm text-gray-500">
                      在浏览器中接收即时通知
                    </p>
                  </div>
                  <Switch
                    checked={settings.pushNotifications}
                    onCheckedChange={(checked) => handleInputChange("pushNotifications", checked)}
                  />
                </div>
                <Separator />
                <div className="space-y-4">
                  <h4 className="font-medium">通知类型</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">项目更新</span>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">团队邀请</span>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">系统维护</span>
                      <Switch />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">营销推广</span>
                      <Switch />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="preferences" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Palette className="mr-2 h-5 w-5" />
                  界面偏好
                </CardTitle>
                <CardDescription>
                  自定义您的使用体验
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>主题模式</Label>
                  <div className="grid grid-cols-3 gap-3">
                    <Button
                      variant={settings.theme === "light" ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleInputChange("theme", "light")}
                    >
                      浅色
                    </Button>
                    <Button
                      variant={settings.theme === "dark" ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleInputChange("theme", "dark")}
                    >
                      深色
                    </Button>
                    <Button
                      variant={settings.theme === "system" ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleInputChange("theme", "system")}
                    >
                      跟随系统
                    </Button>
                  </div>
                </div>
                <Separator />
                <div className="space-y-2">
                  <Label htmlFor="language">语言设置</Label>
                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      variant={settings.language === "zh-CN" ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleInputChange("language", "zh-CN")}
                    >
                      <Globe className="mr-2 h-4 w-4" />
                      中文
                    </Button>
                    <Button
                      variant={settings.language === "en-US" ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleInputChange("language", "en-US")}
                    >
                      <Globe className="mr-2 h-4 w-4" />
                      English
                    </Button>
                  </div>
                </div>
                <Separator />
                <div className="space-y-4">
                  <h4 className="font-medium">其他偏好</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">自动保存草稿</span>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">显示处理进度</span>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">启用快捷键</span>
                      <Switch defaultChecked />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Save Button */}
        <div className="mt-8 flex justify-end">
          <Button onClick={handleSave} disabled={isLoading}>
            {isLoading ? (
              <div className="flex items-center">
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                保存中...
              </div>
            ) : (
              <div className="flex items-center">
                <Save className="mr-2 h-4 w-4" />
                保存设置
              </div>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}