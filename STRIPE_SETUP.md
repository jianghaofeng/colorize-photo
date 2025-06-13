# Stripe 支付测试设置指南

本项目已集成 Stripe 支付功能，包含一个完整的支付测试页面。

## 🚀 快速开始

### 1. 安装依赖

确保已安装 Stripe 相关依赖：

```bash
bun add @stripe/stripe-js @stripe/react-stripe-js stripe
```

### 2. 配置环境变量

在 `.env` 文件中添加以下 Stripe 配置：

```env
# Stripe 配置
STRIPE_SECRET_KEY="sk_test_your_secret_key_here"
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_your_publishable_key_here"
STRIPE_WEBHOOK_SECRET="whsec_your_webhook_secret_here"
```

### 3. 获取 Stripe 密钥

1. 访问 [Stripe Dashboard](https://dashboard.stripe.com/)
2. 注册或登录账户
3. 在开发者 > API 密钥页面获取：
   - **可发布密钥** (pk_test_...): 用于前端
   - **秘密密钥** (sk_test_...): 用于后端

### 4. 启动开发服务器

```bash
bun dev
```

### 5. 访问支付测试页面

打开浏览器访问：`http://localhost:3001/payment-test`

## 🧪 测试卡号

使用以下测试卡号进行支付测试：

| 场景 | 卡号 | 结果 |
|------|------|------|
| 成功支付 | `4242 4242 4242 4242` | 支付成功 |
| 需要验证 | `4000 0025 0000 3155` | 需要 3D Secure 验证 |
| 被拒绝 | `4000 0000 0000 0002` | 卡被拒绝 |
| 余额不足 | `4000 0000 0000 9995` | 余额不足 |

**其他测试信息：**
- **过期日期**: 任何未来日期（如 12/34）
- **CVC**: 任何 3 位数字（如 123）
- **邮政编码**: 任何 5 位数字（如 12345）

## 📁 项目结构

```
src/
├── app/
│   ├── api/stripe/
│   │   └── create-payment-intent/
│   │       └── route.ts              # 创建支付意图 API
│   └── [locale]/
│       └── payment-test/
│           └── page.tsx              # 支付测试页面
├── ui/components/payment/
│   └── payment-form.tsx              # 支付表单组件
└── lib/
    └── stripe.ts                     # Stripe 客户端配置
```

## 🔧 功能特性

### 支付测试页面 (`/payment-test`)

- ✅ 自定义支付金额
- ✅ 实时支付状态反馈
- ✅ 测试卡信息展示
- ✅ 响应式设计
- ✅ 错误处理
- ✅ 支付成功/失败提示

### 支付表单组件

- ✅ Stripe Elements 集成
- ✅ 卡片信息验证
- ✅ 3D Secure 支持
- ✅ 加载状态指示
- ✅ 自定义样式

### API 路由

- ✅ 创建支付意图
- ✅ 金额验证
- ✅ 错误处理
- ✅ 安全配置

## 🛠️ 自定义配置

### 修改支付样式

在 `payment-test/page.tsx` 中修改 `appearance` 对象：

```typescript
const appearance = {
  theme: "stripe" as const,
  variables: {
    colorPrimary: "#0570de",      // 主色调
    colorBackground: "#ffffff",   // 背景色
    colorText: "#30313d",         // 文字颜色
    colorDanger: "#df1b41",       // 错误颜色
    fontFamily: "Ideal Sans, system-ui, sans-serif",
    spacingUnit: "2px",
    borderRadius: "4px",
  },
};
```

### 修改支付金额限制

在 `payment-test/page.tsx` 中修改最小金额：

```typescript
<Input
  type="number"
  min="0.5"          // 最小金额
  step="0.01"        // 步进值
  // ...
/>
```

## 🔒 安全注意事项

1. **永远不要在前端暴露秘密密钥**
2. **使用 HTTPS** 在生产环境中
3. **验证 Webhook 签名** 确保请求来自 Stripe
4. **设置适当的 CORS 策略**
5. **定期轮换 API 密钥**

## 📚 相关文档

- [Stripe 官方文档](https://stripe.com/docs)
- [Stripe React 文档](https://stripe.com/docs/stripe-js/react)
- [Next.js API 路由](https://nextjs.org/docs/api-routes/introduction)
- [Stripe 测试卡](https://stripe.com/docs/testing#cards)

## 🐛 常见问题

### Q: 支付页面显示空白？
A: 检查环境变量是否正确配置，特别是 `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`。

### Q: 支付失败但没有错误信息？
A: 检查浏览器控制台和网络请求，确认 API 路由正常工作。

### Q: 测试卡被拒绝？
A: 确保使用正确的测试卡号，并检查 Stripe 账户是否处于测试模式。

### Q: Webhook 不工作？
A: 确保 Webhook 端点 URL 正确，并验证 `STRIPE_WEBHOOK_SECRET` 配置。

---

🎉 现在你可以开始测试 Stripe 支付功能了！