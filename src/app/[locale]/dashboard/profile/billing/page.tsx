"use client";

import {
  Calendar,
  CreditCard,
  Download,
  Eye,
  FileText,
  Plus,
  Receipt,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { PaymentForm } from "~/ui/components/payments/payment-form";
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
import { Separator } from "~/ui/primitives/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/ui/primitives/tabs";

interface Invoice {
  amount: number;
  date: string;
  description: string;
  id: string;
  status: "paid" | "pending" | "overdue";
}

interface PaymentMethod {
  brand: string;
  expiryMonth: number;
  expiryYear: number;
  id: string;
  isDefault: boolean;
  last4: string;
  type: "card" | "paypal" | "bank";
}

interface Subscription {
  amount: number;
  id: string;
  name: string;
  nextBilling: string;
  status: "active" | "cancelled" | "expired";
}

export default function BillingPage() {
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [selectedAmount, setSelectedAmount] = useState(0);
  
  const [invoices] = useState<Invoice[]>([
    {
      amount: 29.99,
      date: "2024-03-01",
      description: "专业版月费",
      id: "inv_001",
      status: "paid",
    },
    {
      amount: 19.99,
      date: "2024-02-01",
      description: "积分充值",
      id: "inv_002",
      status: "paid",
    },
    {
      amount: 29.99,
      date: "2024-01-01",
      description: "专业版月费",
      id: "inv_003",
      status: "paid",
    },
    {
      amount: 49.99,
      date: "2023-12-15",
      description: "年度订阅",
      id: "inv_004",
      status: "overdue",
    },
  ]);

  const [paymentMethods] = useState<PaymentMethod[]>([
    {
      brand: "Visa",
      expiryMonth: 12,
      expiryYear: 2025,
      id: "pm_001",
      isDefault: true,
      last4: "4242",
      type: "card",
    },
    {
      brand: "Mastercard",
      expiryMonth: 8,
      expiryYear: 2026,
      id: "pm_002",
      isDefault: false,
      last4: "8888",
      type: "card",
    },
  ]);

  const [subscriptions] = useState<Subscription[]>([
    {
      amount: 29.99,
      id: "sub_001",
      name: "专业版订阅",
      nextBilling: "2024-04-01",
      status: "active",
    },
  ]);

  const handlePayment = (amount: number) => {
    setSelectedAmount(amount);
    setIsPaymentDialogOpen(true);
  };

  const handlePaymentSuccess = () => {
    setIsPaymentDialogOpen(false);
    toast.success("支付成功！");
  };

  const handlePaymentError = (error: string) => {
    toast.error(error);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
        return <Badge className="bg-green-100 text-green-800">已支付</Badge>;
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800">待支付</Badge>;
      case "overdue":
        return <Badge className="bg-red-100 text-red-800">逾期</Badge>;
      case "active":
        return <Badge className="bg-green-100 text-green-800">活跃</Badge>;
      case "cancelled":
        return <Badge className="bg-gray-100 text-gray-800">已取消</Badge>;
      case "expired":
        return <Badge className="bg-red-100 text-red-800">已过期</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-gray-900/50">
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              账单管理
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              查看您的账单历史和管理支付方式
            </p>
          </div>
          <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => handlePayment(19.99)}>
                <Plus className="mr-2 h-4 w-4" />
                充值积分
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>充值积分</DialogTitle>
                <DialogDescription>
                  选择充值金额并完成支付
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setSelectedAmount(9.99)}
                    className={selectedAmount === 9.99 ? "ring-2 ring-blue-500" : ""}
                  >
                    $9.99
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setSelectedAmount(19.99)}
                    className={selectedAmount === 19.99 ? "ring-2 ring-blue-500" : ""}
                  >
                    $19.99
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setSelectedAmount(49.99)}
                    className={selectedAmount === 49.99 ? "ring-2 ring-blue-500" : ""}
                  >
                    $49.99
                  </Button>
                </div>
                {selectedAmount > 0 && (
                  <PaymentForm
                    amount={selectedAmount}
                    onSuccess={handlePaymentSuccess}
                    onError={handlePaymentError}
                  />
                )}
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">概览</TabsTrigger>
            <TabsTrigger value="invoices">账单历史</TabsTrigger>
            <TabsTrigger value="payments">支付方式</TabsTrigger>
            <TabsTrigger value="subscriptions">订阅管理</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Billing Overview */}
            <div className="grid gap-6 md:grid-cols-3">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    本月消费
                  </CardTitle>
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">$29.99</div>
                  <p className="text-xs text-muted-foreground">
                    比上月减少 12%
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    待支付金额
                  </CardTitle>
                  <Receipt className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">$0.00</div>
                  <p className="text-xs text-muted-foreground">
                    所有账单已结清
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    下次扣费
                  </CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">4月1日</div>
                  <p className="text-xs text-muted-foreground">
                    专业版订阅续费
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Invoices */}
            <Card>
              <CardHeader>
                <CardTitle>最近账单</CardTitle>
                <CardDescription>
                  查看您最近的账单记录
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {invoices.slice(0, 3).map((invoice) => (
                    <div
                      key={invoice.id}
                      className="flex items-center justify-between rounded-lg border p-4"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800">
                          <FileText className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                        </div>
                        <div>
                          <p className="font-medium">{invoice.description}</p>
                          <p className="text-sm text-gray-500">
                            {new Date(invoice.date).toLocaleDateString('zh-CN')}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <span className="font-medium">${invoice.amount}</span>
                        {getStatusBadge(invoice.status)}
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
                <Button variant="outline" className="w-full mt-4">
                  查看所有账单
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="invoices" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>账单历史</CardTitle>
                <CardDescription>
                  查看和下载您的所有账单记录
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {invoices.map((invoice) => (
                    <div
                      key={invoice.id}
                      className="flex items-center justify-between rounded-lg border p-4"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800">
                          <FileText className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                        </div>
                        <div>
                          <p className="font-medium">{invoice.description}</p>
                          <p className="text-sm text-gray-500">
                            账单号: {invoice.id}
                          </p>
                          <p className="text-sm text-gray-500">
                            {new Date(invoice.date).toLocaleDateString('zh-CN')}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <span className="font-medium">${invoice.amount}</span>
                        {getStatusBadge(invoice.status)}
                        <div className="flex space-x-2">
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Download className="h-4 w-4" />
                          </Button>
                          {invoice.status === "overdue" && (
                            <Button
                              size="sm"
                              onClick={() => handlePayment(invoice.amount)}
                            >
                              立即支付
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payments" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>支付方式</CardTitle>
                <CardDescription>
                  管理您的支付方式和默认支付选项
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {paymentMethods.map((method) => (
                    <div
                      key={method.id}
                      className="flex items-center justify-between rounded-lg border p-4"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800">
                          <CreditCard className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                        </div>
                        <div>
                          <p className="font-medium">
                            {method.brand} •••• {method.last4}
                          </p>
                          <p className="text-sm text-gray-500">
                            过期时间: {method.expiryMonth}/{method.expiryYear}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        {method.isDefault && (
                          <Badge variant="secondary">默认</Badge>
                        )}
                        <Button variant="outline" size="sm">
                          编辑
                        </Button>
                        <Button variant="ghost" size="sm">
                          删除
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
                <Button variant="outline" className="w-full mt-4">
                  <Plus className="mr-2 h-4 w-4" />
                  添加新的支付方式
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="subscriptions" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>订阅管理</CardTitle>
                <CardDescription>
                  管理您的订阅服务和自动续费设置
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {subscriptions.map((subscription) => (
                    <div
                      key={subscription.id}
                      className="flex items-center justify-between rounded-lg border p-4"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/20">
                          <div className="h-2 w-2 rounded-full bg-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium">{subscription.name}</p>
                          <p className="text-sm text-gray-500">
                            下次扣费: {new Date(subscription.nextBilling).toLocaleDateString('zh-CN')}
                          </p>
                          <p className="text-sm text-gray-500">
                            ${subscription.amount}/月
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        {getStatusBadge(subscription.status)}
                        <Button variant="outline" size="sm">
                          管理
                        </Button>
                        <Button variant="ghost" size="sm">
                          取消
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
                <Separator className="my-6" />
                <div className="rounded-lg bg-blue-50 dark:bg-blue-900/20 p-4">
                  <h4 className="font-medium text-blue-900 dark:text-blue-100">
                    升级到年度订阅
                  </h4>
                  <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                    年度订阅可节省 20% 费用，享受更多专业功能
                  </p>
                  <Button className="mt-3" size="sm">
                    立即升级
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}