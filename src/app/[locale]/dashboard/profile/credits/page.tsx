"use client";

import {
  ArrowDown,
  ArrowUp,
  Calendar,
  Clock,
  Coins,
  Gift,
  History,
  Plus,
  Star,
  TrendingUp,
  Zap,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Badge } from "~/ui/primitives/badge";
import { Button } from "~/ui/primitives/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/ui/primitives/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/ui/primitives/dialog";
import { Progress } from "~/ui/primitives/progress";
import { Separator } from "~/ui/primitives/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/ui/primitives/tabs";

interface CreditTransaction {
  amount: number;
  date: string;
  description: string;
  id: string;
  type: "earned" | "spent" | "purchased" | "bonus";
}

interface CreditPackage {
  bonus: number;
  credits: number;
  id: string;
  popular?: boolean;
  price: number;
  title: string;
}

interface Achievement {
  description: string;
  icon: string;
  id: string;
  progress: number;
  reward: number;
  target: number;
  title: string;
  unlocked: boolean;
}

export default function CreditsPage() {
  const [isRechargeDialogOpen, setIsRechargeDialogOpen] = useState(false);
  const [currentCredits] = useState(1250);
  const [totalEarned] = useState(3420);
  const [totalSpent] = useState(2170);
  
  const [transactions] = useState<CreditTransaction[]>([
    {
      amount: 100,
      date: "2024-03-15T10:30:00Z",
      description: "图像色彩化处理",
      id: "tx_001",
      type: "spent",
    },
    {
      amount: 500,
      date: "2024-03-14T15:20:00Z",
      description: "积分充值",
      id: "tx_002",
      type: "purchased",
    },
    {
      amount: 50,
      date: "2024-03-13T09:15:00Z",
      description: "每日签到奖励",
      id: "tx_003",
      type: "earned",
    },
    {
      amount: 200,
      date: "2024-03-12T14:45:00Z",
      description: "推荐好友奖励",
      id: "tx_004",
      type: "bonus",
    },
    {
      amount: 75,
      date: "2024-03-11T11:30:00Z",
      description: "图像修复处理",
      id: "tx_005",
      type: "spent",
    },
    {
      amount: 25,
      date: "2024-03-10T16:20:00Z",
      description: "完成新手任务",
      id: "tx_006",
      type: "earned",
    },
  ]);

  const [creditPackages] = useState<CreditPackage[]>([
    {
      bonus: 0,
      credits: 500,
      id: "pkg_001",
      price: 9.99,
      title: "基础套餐",
    },
    {
      bonus: 100,
      credits: 1000,
      id: "pkg_002",
      popular: true,
      price: 19.99,
      title: "热门套餐",
    },
    {
      bonus: 300,
      credits: 2500,
      id: "pkg_003",
      price: 49.99,
      title: "超值套餐",
    },
    {
      bonus: 800,
      credits: 5000,
      id: "pkg_004",
      price: 99.99,
      title: "专业套餐",
    },
  ]);

  const [achievements] = useState<Achievement[]>([
    {
      description: "完成首次图像处理",
      icon: "🎯",
      id: "ach_001",
      progress: 1,
      reward: 100,
      target: 1,
      title: "初次体验",
      unlocked: true,
    },
    {
      description: "累计处理10张图像",
      icon: "📸",
      id: "ach_002",
      progress: 7,
      reward: 200,
      target: 10,
      title: "图像达人",
      unlocked: false,
    },
    {
      description: "连续签到7天",
      icon: "📅",
      id: "ach_003",
      progress: 5,
      reward: 150,
      target: 7,
      title: "坚持不懈",
      unlocked: false,
    },
    {
      description: "推荐3位好友注册",
      icon: "👥",
      id: "ach_004",
      progress: 1,
      reward: 300,
      target: 3,
      title: "分享达人",
      unlocked: false,
    },
  ]);

  const handlePurchaseCredits = (packageId: string) => {
    const pkg = creditPackages.find(p => p.id === packageId);
    if (pkg) {
      toast.success(`成功购买 ${pkg.credits + pkg.bonus} 积分！`);
      setIsRechargeDialogOpen(false);
    }
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case "earned":
        return <ArrowUp className="h-4 w-4 text-green-600" />;
      case "spent":
        return <ArrowDown className="h-4 w-4 text-red-600" />;
      case "purchased":
        return <Plus className="h-4 w-4 text-blue-600" />;
      case "bonus":
        return <Gift className="h-4 w-4 text-purple-600" />;
      default:
        return <Coins className="h-4 w-4 text-gray-600" />;
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case "earned":
      case "bonus":
        return "text-green-600";
      case "spent":
        return "text-red-600";
      case "purchased":
        return "text-blue-600";
      default:
        return "text-gray-600";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-CN', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-gray-900/50">
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              积分系统
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              管理您的积分余额和使用记录
            </p>
          </div>
          <Dialog open={isRechargeDialogOpen} onOpenChange={setIsRechargeDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                充值积分
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl">
              <DialogHeader>
                <DialogTitle>积分充值</DialogTitle>
                <DialogDescription>
                  选择适合您的积分套餐
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 md:grid-cols-2">
                {creditPackages.map((pkg) => (
                  <Card
                    key={pkg.id}
                    className={`cursor-pointer transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50 ${
                      pkg.popular ? "ring-2 ring-blue-500" : ""
                    }`}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{pkg.title}</CardTitle>
                        {pkg.popular && (
                          <Badge className="bg-blue-500 text-white">热门</Badge>
                        )}
                      </div>
                      <CardDescription className="text-2xl font-bold text-gray-900 dark:text-white">
                        ${pkg.price}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">基础积分</span>
                          <span className="font-medium">{pkg.credits}</span>
                        </div>
                        {pkg.bonus > 0 && (
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-green-600">奖励积分</span>
                            <span className="font-medium text-green-600">+{pkg.bonus}</span>
                          </div>
                        )}
                        <Separator />
                        <div className="flex items-center justify-between">
                          <span className="font-medium">总计</span>
                          <span className="text-lg font-bold">
                            {pkg.credits + pkg.bonus}
                          </span>
                        </div>
                      </div>
                      <Button
                        className="w-full mt-4"
                        onClick={() => handlePurchaseCredits(pkg.id)}
                      >
                        立即购买
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">概览</TabsTrigger>
            <TabsTrigger value="history">使用记录</TabsTrigger>
            <TabsTrigger value="earn">赚取积分</TabsTrigger>
            <TabsTrigger value="achievements">成就系统</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Credit Overview */}
            <div className="grid gap-6 md:grid-cols-3">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    当前余额
                  </CardTitle>
                  <Coins className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">
                    {currentCredits.toLocaleString()}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    可处理约 {Math.floor(currentCredits / 50)} 张图像
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    累计获得
                  </CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {totalEarned.toLocaleString()}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    包含充值和奖励积分
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    累计消费
                  </CardTitle>
                  <Zap className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-600">
                    {totalSpent.toLocaleString()}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    用于图像处理服务
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Usage Statistics */}
            <Card>
              <CardHeader>
                <CardTitle>积分使用统计</CardTitle>
                <CardDescription>
                  查看您的积分使用趋势和分布
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between text-sm">
                      <span>图像色彩化</span>
                      <span>60%</span>
                    </div>
                    <Progress value={60} className="mt-1" />
                  </div>
                  <div>
                    <div className="flex items-center justify-between text-sm">
                      <span>图像修复</span>
                      <span>25%</span>
                    </div>
                    <Progress value={25} className="mt-1" />
                  </div>
                  <div>
                    <div className="flex items-center justify-between text-sm">
                      <span>高级功能</span>
                      <span>15%</span>
                    </div>
                    <Progress value={15} className="mt-1" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <div className="grid gap-4 md:grid-cols-2">
              <Card className="cursor-pointer transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50">
                <CardContent className="flex items-center p-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/20">
                    <Plus className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <h3 className="font-medium">快速充值</h3>
                    <p className="text-sm text-gray-500">立即购买积分套餐</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="cursor-pointer transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50">
                <CardContent className="flex items-center p-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/20">
                    <Gift className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <h3 className="font-medium">每日签到</h3>
                    <p className="text-sm text-gray-500">获得免费积分奖励</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="history" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <History className="mr-2 h-5 w-5" />
                  积分使用记录
                </CardTitle>
                <CardDescription>
                  查看您的积分获得和消费历史
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {transactions.map((transaction) => (
                    <div
                      key={transaction.id}
                      className="flex items-center justify-between rounded-lg border p-4"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800">
                          {getTransactionIcon(transaction.type)}
                        </div>
                        <div>
                          <p className="font-medium">{transaction.description}</p>
                          <p className="text-sm text-gray-500">
                            {formatDate(transaction.date)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <span className={`font-medium ${
                          transaction.type === "spent" ? "" : "+"
                        }${getTransactionColor(transaction.type)}`}>
                          {transaction.type === "spent" ? "-" : "+"}{transaction.amount}
                        </span>
                        <Badge variant="outline">
                          {transaction.type === "earned" ? "获得" :
                           transaction.type === "spent" ? "消费" :
                           transaction.type === "purchased" ? "充值" : "奖励"}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
                <Button variant="outline" className="w-full mt-4">
                  加载更多记录
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="earn" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Star className="mr-2 h-5 w-5" />
                  赚取积分
                </CardTitle>
                <CardDescription>
                  通过完成任务和活动获得免费积分
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  <Card className="cursor-pointer transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/20">
                            <Calendar className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <h3 className="font-medium">每日签到</h3>
                            <p className="text-sm text-gray-500">每天获得 10-50 积分</p>
                          </div>
                        </div>
                        <Button size="sm">签到</Button>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="cursor-pointer transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/20">
                            <Gift className="h-5 w-5 text-green-600" />
                          </div>
                          <div>
                            <h3 className="font-medium">推荐好友</h3>
                            <p className="text-sm text-gray-500">每位好友注册获得 200 积分</p>
                          </div>
                        </div>
                        <Button size="sm" variant="outline">邀请</Button>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="cursor-pointer transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900/20">
                            <Star className="h-5 w-5 text-purple-600" />
                          </div>
                          <div>
                            <h3 className="font-medium">评价反馈</h3>
                            <p className="text-sm text-gray-500">分享使用体验获得 100 积分</p>
                          </div>
                        </div>
                        <Button size="sm" variant="outline">评价</Button>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="cursor-pointer transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100 dark:bg-orange-900/20">
                            <Clock className="h-5 w-5 text-orange-600" />
                          </div>
                          <div>
                            <h3 className="font-medium">限时活动</h3>
                            <p className="text-sm text-gray-500">参与活动获得额外积分</p>
                          </div>
                        </div>
                        <Button size="sm" variant="outline">参与</Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="achievements" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Star className="mr-2 h-5 w-5" />
                  成就系统
                </CardTitle>
                <CardDescription>
                  完成成就解锁积分奖励
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  {achievements.map((achievement) => (
                    <Card
                      key={achievement.id}
                      className={`transition-colors ${
                        achievement.unlocked
                          ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
                          : "hover:bg-gray-50 dark:hover:bg-gray-800/50"
                      }`}
                    >
                      <CardContent className="p-6">
                        <div className="flex items-start space-x-4">
                          <div className={`text-2xl ${
                            achievement.unlocked ? "" : "grayscale"
                          }`}>
                            {achievement.icon}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <h3 className="font-medium">{achievement.title}</h3>
                              {achievement.unlocked && (
                                <Badge className="bg-green-500 text-white">已完成</Badge>
                              )}
                            </div>
                            <p className="text-sm text-gray-500 mt-1">
                              {achievement.description}
                            </p>
                            <div className="mt-3">
                              <div className="flex items-center justify-between text-sm">
                                <span>进度</span>
                                <span>
                                  {achievement.progress}/{achievement.target}
                                </span>
                              </div>
                              <Progress
                                value={(achievement.progress / achievement.target) * 100}
                                className="mt-1"
                              />
                            </div>
                            <div className="mt-3 flex items-center justify-between">
                              <span className="text-sm text-gray-500">奖励</span>
                              <span className="font-medium text-blue-600">
                                +{achievement.reward} 积分
                              </span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}