"use client";

import {
  BarChart3,
  CreditCard,
  FileImage,
  LayoutDashboard,
  LogOut,
  Settings,
  Shield,
  User
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { useCurrentUserOrRedirect } from "~/lib/supabase-auth-client";
import { twoFactor } from "~/lib/supabase-mfa";
import { CreditRecharges } from "~/ui/components/payment/credit-recharges";
import { Alert, AlertDescription, AlertTitle } from "~/ui/primitives/alert";
import { Badge } from "~/ui/primitives/badge";
import { Button } from "~/ui/primitives/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "~/ui/primitives/card";
import { Input } from "~/ui/primitives/input";
import { Label } from "~/ui/primitives/label";
import { Menubar, MenubarContent, MenubarItem, MenubarMenu, MenubarTrigger } from "~/ui/primitives/menubar";
import { Skeleton } from "~/ui/primitives/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/ui/primitives/tabs";

export function UserCenterClient() {
  const { isPending, user } = useCurrentUserOrRedirect();
  const router = useRouter();

  // 状态管理
  const [activeSection, setActiveSection] = useState("dashboard");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [showQrCode, setShowQrCode] = useState(false);
  const [qrCodeData, setQrCodeData] = useState("");
  const [secret, setSecret] = useState("");
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [billingError, setBillingError] = useState("");
  const [billingLoading, setBillingLoading] = useState(true);

  // 模拟订阅数据
  const hasActiveSubscription = subscriptions.some((sub) => sub.status === "active");

  // 模拟获取订阅数据
  useEffect(() => {
    // 模拟API调用延迟
    const timer = setTimeout(() => {
      // 这里可以添加实际获取订阅数据的API调用
      // 模拟数据
      // setSubscriptions([]);
      setBillingLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, [activeSection]);

  // 处理登出
  const handleLogout = async () => {
    try {
      const { error } = await fetch("/api/auth/logout", {
        method: "POST",
      }).then((res) => res.json());

      if (error) {
        console.error("Logout error:", error);
        return;
      }

      router.push("/auth/login");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  // 处理启用双因素认证
  const handleEnableTwoFactor = () => {
    if (!password) {
      setError("Password is required");
      return;
    }

    setError("");
    setLoading(true);

    twoFactor
      .enable({
        password,
      })
      .then((result) => {
        if ("data" in result && result.data) {
          const uri = result.data.totpURI;
          setQrCodeData(uri);

          if (typeof uri === "string" && uri.includes("secret=")) {
            const secretMatch = uri.split("secret=")[1];
            if (secretMatch) {
              const extractedSecret = secretMatch.split("&")[0];
              if (extractedSecret) {
                setSecret(extractedSecret);
              }
            }
          }

          setShowQrCode(true);
          setMessage("Scan the QR code with your authenticator app");
        } else {
          setError(
            "Failed to enable two-factor authentication. Unexpected response format.",
          );
        }
      })
      .catch((err: unknown) => {
        setError(
          "Failed to enable two-factor authentication. Please try again.",
        );
        console.error(err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  // 处理禁用双因素认证
  const handleDisableTwoFactor = () => {
    if (!password) {
      setError("Password is required");
      return;
    }

    setError("");
    setLoading(true);

    twoFactor
      .disable({
        password,
      })
      .then(() => {
        setMessage("Two-factor authentication has been disabled");
        setShowQrCode(false);
      })
      .catch((err: unknown) => {
        setError(
          "Failed to disable two-factor authentication. Please try again.",
        );
        console.error(err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  if (isPending) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Loading...</h1>
        </div>
      </div>
    );
  }

  const menuItems = [
    { icon: <LayoutDashboard className="mr-2 h-5 w-5" />, id: "dashboard", label: "Dashboard" },
    { icon: <User className="mr-2 h-5 w-5" />, id: "profile", label: "Profile" },
    { icon: <BarChart3 className="mr-2 h-5 w-5" />, id: "stats", label: "Statistics" },
    { icon: <CreditCard className="mr-2 h-5 w-5" />, id: "billing", label: "Billing" },
    { icon: <Settings className="mr-2 h-5 w-5" />, id: "settings", label: "Settings" },
    { icon: <FileImage className="mr-2 h-5 w-5" />, id: "images", label: "My Images" },
  ];

  return (
    <div className={`
      flex min-h-screen bg-gradient-to-b from-muted/50 via-muted/25
      to-background
    `}>
      {/* 左侧菜单 */}
      <div className={`
        hidden w-64 border-r bg-card p-4
        md:block
      `}>
        <div className="mb-8">
          <h2 className="text-2xl font-bold tracking-tight">User Center</h2>
          <p className="text-sm text-muted-foreground">Manage your account and settings</p>
        </div>

        <nav className="space-y-1">
          {menuItems.map((item) => (
            <Button
              className="w-full justify-start"
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              variant={activeSection === item.id ? "default" : "ghost"}
            >
              {item.icon}
              {item.label}
            </Button>
          ))}

          <Button
            className={`
              w-full justify-start text-destructive
              hover:bg-destructive/10 hover:text-destructive
            `}
            onClick={handleLogout}
            variant="ghost"
          >
            <LogOut className="mr-2 h-5 w-5" />
            Logout
          </Button>
        </nav>
      </div>

      {/* 移动端菜单 */}
      <div className={`
        w-full border-b bg-card p-4
        md:hidden
      `}>
        <Menubar className="w-full justify-between">
          <MenubarMenu>
            <MenubarTrigger className="font-bold">User Center</MenubarTrigger>
            <MenubarContent>
              {menuItems.map((item) => (
                <MenubarItem key={item.id} onClick={() => setActiveSection(item.id)}>
                  <div className="flex items-center">
                    {item.icon}
                    {item.label}
                  </div>
                </MenubarItem>
              ))}
              <MenubarItem className="text-destructive" onClick={handleLogout}>
                <div className="flex items-center">
                  <LogOut className="mr-2 h-5 w-5" />
                  Logout
                </div>
              </MenubarItem>
            </MenubarContent>
          </MenubarMenu>
        </Menubar>
      </div>

      {/* 右侧内容区 */}
      <div className="flex-1 overflow-auto p-6">
        {/* Dashboard 内容 */}
        {activeSection === "dashboard" && (
          <div className="space-y-6">
            <h1 className="text-3xl font-bold">Welcome, {user?.email}</h1>

            <div className={`
              grid gap-6
              md:grid-cols-2
              lg:grid-cols-3
            `}>
              <Card>
                <CardHeader>
                  <CardTitle>Account Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>Email: {user?.email}</p>
                  <p>Status: Active</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Credits</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">250</p>
                  <p className="text-sm text-muted-foreground">Available credits</p>
                </CardContent>
                <CardFooter>
                  <Button onClick={() => setActiveSection("billing")} variant="outline">Buy More</Button>
                </CardFooter>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">No recent activity</p>
                </CardContent>
                <CardFooter>
                  <Button onClick={() => setActiveSection("images")} variant="outline">View All</Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        )}

        {/* Profile 内容 */}
        {activeSection === "profile" && (
          <div className="space-y-6">
            <div className="space-y-0.5">
              <h2 className="text-2xl font-bold tracking-tight">Profile</h2>
              <p className="text-muted-foreground">
                Manage your profile and security settings.
              </p>
            </div>

            <Tabs className="space-y-4" defaultValue="general">
              <TabsList>
                <TabsTrigger className="flex items-center gap-2" value="general">
                  <User className="h-4 w-4" />
                  General
                </TabsTrigger>
                <TabsTrigger className="flex items-center gap-2" value="security">
                  <Shield className="h-4 w-4" />
                  Security
                </TabsTrigger>
              </TabsList>

              <TabsContent className="space-y-4" value="general">
                <Card>
                  <CardHeader>
                    <CardTitle>Profile Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-2">
                      <Label htmlFor="name">Name</Label>
                      <Input
                        defaultValue={user?.email || ""}
                        id="name"
                        placeholder="Enter your name"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        defaultValue={user?.email || ""}
                        id="email"
                        placeholder="Enter your email"
                        type="email"
                      />
                    </div>
                    <Button>Save Changes</Button>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent className="space-y-4" value="security">
                {error && (
                  <div
                    className={`
                      rounded-md bg-destructive/10 p-4 text-sm text-destructive
                    `}
                  >
                    {error}
                  </div>
                )}

                {message && (
                  <div className={`
                    rounded-md bg-green-50 p-4 text-sm text-green-700
                  `}>
                    {message}
                  </div>
                )}

                {showQrCode && qrCodeData && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Scan QR Code</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex flex-col items-center">
                        <img
                          alt="QR Code for Two-Factor Authentication"
                          className="h-48 w-48"
                          src={qrCodeData}
                        />
                        <p className={`
                          mt-4 text-center text-sm text-muted-foreground
                        `}>
                          Scan this QR code with your authenticator app (Google
                          Authenticator, Authy, etc.)
                        </p>
                        {secret && (
                          <div className="mt-6 w-full">
                            <p className="text-sm font-medium">Manual entry code:</p>
                            <p className={`
                              mt-1 rounded-md bg-muted p-2 text-center font-mono
                              select-all
                            `}>
                              {secret}
                            </p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}

                <Card>
                  <CardHeader>
                    <CardTitle>Change Password</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-2">
                      <Label htmlFor="current-password">Current Password</Label>
                      <Input
                        id="current-password"
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter your current password"
                        type="password"
                        value={password}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="new-password">New Password</Label>
                      <Input
                        id="new-password"
                        placeholder="Enter your new password"
                        type="password"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="confirm-password">Confirm Password</Label>
                      <Input
                        id="confirm-password"
                        placeholder="Confirm your new password"
                        type="password"
                      />
                    </div>
                    <Button>Update Password</Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Two-Factor Authentication</CardTitle>
                    <CardDescription>
                      Add an extra layer of security to your account
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-2">
                      <Label htmlFor="mfa-password">
                        Enter your password to {showQrCode ? "disable" : "enable"} 2FA
                      </Label>
                      <Input
                        id="mfa-password"
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter your password"
                        type="password"
                        value={password}
                      />
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button
                      disabled={loading}
                      onClick={
                        showQrCode ? handleDisableTwoFactor : handleEnableTwoFactor
                      }
                      variant={showQrCode ? "destructive" : "default"}
                    >
                      {loading
                        ? "Processing..."
                        : showQrCode
                          ? "Disable 2FA"
                          : "Enable 2FA"}
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        )}

        {/* Stats 内容 */}
        {activeSection === "stats" && (
          <div className="space-y-6">
            <h1 className="text-3xl font-bold">Statistics</h1>

            <div className={`
              grid gap-6
              md:grid-cols-2
              lg:grid-cols-3
            `}>
              <Card>
                <CardHeader>
                  <CardTitle>Images Processed</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-4xl font-bold">24</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Credits Used</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-4xl font-bold">120</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Account Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline">Active</Badge>
                    <Badge variant="outline">MFA Enabled</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Usage History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`
                  flex h-[200px] w-full items-center justify-center bg-muted
                `}>
                  <p className="text-muted-foreground">Usage chart will be displayed here</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Billing 内容 */}
        {activeSection === "billing" && (
          <div className="space-y-6">
            <h1 className="text-3xl font-bold">Billing</h1>

            {billingError && (
              <Alert className="mb-6" variant="destructive">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{billingError}</AlertDescription>
              </Alert>
            )}

            {billingLoading ? (
              <Card>
                <CardHeader>
                  <Skeleton className="h-8 w-1/3" />
                  <Skeleton className="h-4 w-2/3" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-20 w-full" />
                </CardContent>
                <CardFooter>
                  <Skeleton className="h-10 w-full" />
                </CardFooter>
              </Card>
            ) : (
              <>
                {/* Subscription Status */}
                <Card>
                  <CardHeader>
                    <CardTitle>Subscription Status</CardTitle>
                    <CardDescription>
                      Your current subscription plan and status
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {subscriptions.length > 0 ? (
                      <div className="space-y-4">
                        {subscriptions.map((subscription) => (
                          <div
                            className={`
                              flex items-center justify-between rounded-lg
                              border p-4
                            `}
                            key={subscription.id}
                          >
                            <div>
                              <h3 className="font-medium">{subscription.productId}</h3>
                              <p className="text-sm text-muted-foreground">
                                ID: {subscription.subscriptionId}
                              </p>
                            </div>
                            <Badge
                              variant={
                                subscription.status === "active" ? "default" : "outline"
                              }
                            >
                              {subscription.status}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground">
                        You don't have any active subscriptions.
                      </p>
                    )}
                  </CardContent>
                  <CardFooter>
                    {hasActiveSubscription && (
                      <Button
                        onClick={() => router.push("/auth/customer-portal")}
                        variant="outline"
                      >
                        Manage Subscription
                      </Button>
                    )}
                  </CardFooter>
                </Card>

                {/* 积分充值记录 */}
                <div className="mt-6">
                  <CreditRecharges />
                </div>

                {/* Payment Plans */}
                {!hasActiveSubscription && (
                  <div className={`
                    mt-6 grid gap-6
                    md:grid-cols-2
                  `}>
                    <Card>
                      <CardHeader>
                        <CardTitle>Pro Plan</CardTitle>
                        <CardDescription>
                          Get access to all premium features and priority support.
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-3xl font-bold">$9.99<span className={`
                          text-sm font-normal
                        `}>/month</span></p>
                        <ul className="mt-4 space-y-2 text-sm">
                          <li>✓ Unlimited image processing</li>
                          <li>✓ Priority support</li>
                          <li>✓ Advanced editing tools</li>
                        </ul>
                      </CardContent>
                      <CardFooter>
                        <Button className="w-full">Subscribe to Pro</Button>
                      </CardFooter>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Premium Plan</CardTitle>
                        <CardDescription>
                          Everything in Pro plus exclusive content and early access to new features.
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-3xl font-bold">$19.99<span className={`
                          text-sm font-normal
                        `}>/month</span></p>
                        <ul className="mt-4 space-y-2 text-sm">
                          <li>✓ All Pro features</li>
                          <li>✓ Exclusive content</li>
                          <li>✓ Early access to new features</li>
                          <li>✓ Dedicated support</li>
                        </ul>
                      </CardContent>
                      <CardFooter>
                        <Button className="w-full">Subscribe to Premium</Button>
                      </CardFooter>
                    </Card>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Settings 内容 */}
        {activeSection === "settings" && (
          <div className="space-y-6">
            <div className="space-y-0.5">
              <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
              <p className="text-muted-foreground">
                Manage your application settings and preferences.
              </p>
            </div>

            <Tabs className="space-y-4" defaultValue="preferences">
              <TabsList>
                <TabsTrigger value="preferences">Preferences</TabsTrigger>
                <TabsTrigger value="notifications">Notifications</TabsTrigger>
                <TabsTrigger value="appearance">Appearance</TabsTrigger>
              </TabsList>

              <TabsContent className="space-y-4" value="preferences">
                <Card>
                  <CardHeader>
                    <CardTitle>Language</CardTitle>
                    <CardDescription>
                      Choose your preferred language for the application.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-2">
                      <Label htmlFor="language">Language</Label>
                      <select
                        className={`
                          flex h-9 w-full rounded-md border border-input
                          bg-transparent px-3 py-1 text-sm shadow-sm
                          transition-colors
                          file:border-0 file:bg-transparent file:text-sm
                          file:font-medium
                          placeholder:text-muted-foreground
                          focus-visible:ring-1 focus-visible:ring-ring
                          focus-visible:outline-none
                          disabled:cursor-not-allowed disabled:opacity-50
                        `}
                        id="language"
                      >
                        <option value="en">English</option>
                        <option value="zh">中文</option>
                        <option value="es">Español</option>
                        <option value="fr">Français</option>
                      </select>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button>Save Changes</Button>
                  </CardFooter>
                </Card>
              </TabsContent>

              <TabsContent className="space-y-4" value="notifications">
                <Card>
                  <CardHeader>
                    <CardTitle>Notification Preferences</CardTitle>
                    <CardDescription>
                      Choose how you want to receive notifications.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <input className="h-4 w-4 rounded border-gray-300" id="email-notifications" type="checkbox" />
                      <Label htmlFor="email-notifications">Email Notifications</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input className="h-4 w-4 rounded border-gray-300" id="marketing-emails" type="checkbox" />
                      <Label htmlFor="marketing-emails">Marketing Emails</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input className="h-4 w-4 rounded border-gray-300" id="update-notifications" type="checkbox" />
                      <Label htmlFor="update-notifications">Product Updates</Label>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button>Save Preferences</Button>
                  </CardFooter>
                </Card>
              </TabsContent>

              <TabsContent className="space-y-4" value="appearance">
                <Card>
                  <CardHeader>
                    <CardTitle>Theme Settings</CardTitle>
                    <CardDescription>
                      Customize the appearance of the application.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-2">
                      <Label htmlFor="theme">Theme</Label>
                      <select
                        className={`
                          flex h-9 w-full rounded-md border border-input
                          bg-transparent px-3 py-1 text-sm shadow-sm
                          transition-colors
                          file:border-0 file:bg-transparent file:text-sm
                          file:font-medium
                          placeholder:text-muted-foreground
                          focus-visible:ring-1 focus-visible:ring-ring
                          focus-visible:outline-none
                          disabled:cursor-not-allowed disabled:opacity-50
                        `}
                        id="theme"
                      >
                        <option value="light">Light</option>
                        <option value="dark">Dark</option>
                        <option value="system">System</option>
                      </select>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button>Save Theme</Button>
                  </CardFooter>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        )}

        {/* Images 内容 */}
        {activeSection === "images" && (
          <div className="space-y-6">
            <h1 className="text-3xl font-bold">My Images</h1>

            <div className={`
              grid grid-cols-1 gap-6
              md:grid-cols-2
              lg:grid-cols-3
            `}>
              {/* 图片占位符 */}
              {Array.from({ length: 6 }).map((_, index) => (
                <Card key={index}>
                  <div className={`
                    relative aspect-square overflow-hidden rounded-t-lg bg-muted
                  `}>
                    <div className={`
                      absolute inset-0 flex items-center justify-center
                      text-muted-foreground
                    `}>
                      Image Preview
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <p className="font-medium">Image {index + 1}</p>
                    <p className="text-sm text-muted-foreground">Processed on {new Date().toLocaleDateString()}</p>
                  </CardContent>
                  <CardFooter className="flex justify-between p-4 pt-0">
                    <Button size="sm" variant="outline">View</Button>
                    <Button size="sm" variant="outline">Download</Button>
                  </CardFooter>
                </Card>
              ))}
            </div>

            <div className="flex justify-center">
              <Button variant="outline">Load More</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}