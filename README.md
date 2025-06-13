# Colorize Photo - AI照片上色应用

![Colorize Photo](https://zvcxdyuidlhzvmhsviwc.supabase.co/storage/v1/object/public/images/colorized-2.png)

## 项目概述

Colorize Photo是一个专业的照片上色和修复网站，使用先进的AI技术为黑白照片添加色彩，修复旧照片或损坏的照片，让珍贵的回忆重获新生。

## 主要功能

- **AI照片上色**：将黑白照片转换为逼真的彩色照片
- **多种滤镜效果**：提供多种滤镜和调色选项
- **照片修复**：修复旧照片或损坏的照片
- **国际化支持**：支持英文和中文界面
- **用户认证**：基于Supabase的用户认证系统
- **订阅计划**：基础、标准和高级订阅计划
- **支付集成**：集成Stripe支付系统

## 技术栈

- **前端框架**：Next.js 15.3.2
- **UI库**：React 19.1.0
- **样式**：Tailwind CSS 4.1.5
- **组件库**：Radix UI, shadcn/ui
- **状态管理**：React Hooks
- **国际化**：next-intl 4.1.0
- **认证**：Supabase Auth
- **数据库**：Supabase (PostgreSQL)
- **存储**：Supabase Storage
- **支付**：Stripe
- **表单处理**：@tanstack/react-form
- **表格**：@tanstack/react-table
- **轮播图**：embla-carousel-react
- **动画**：framer-motion, animejs
- **图标**：lucide-react
- **主题**：next-themes
- **类型检查**：TypeScript

## 快速开始

### 环境要求

- Node.js 18+
- Bun (推荐) 或 npm

### 安装步骤

1. 克隆仓库

```bash
git clone https://github.com/allen/colorize-photo.git
cd colorize-photo
```

2. 安装依赖

```bash
bun install
# 或
npm install
```

3. 环境配置

复制`.env.example`文件并重命名为`.env.local`，然后填写必要的环境变量：

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
```

4. 启动开发服务器

```bash
bun dev
# 或
npm run dev
```

5. 打开浏览器访问 [http://localhost:3000](http://localhost:3000)

### 数据库设置

```bash
bun db:push
# 或
npm run db:push
```

## 项目结构

```
├── messages/           # 国际化消息文件
├── public/             # 静态资源
├── src/
│   ├── api/            # API路由
│   ├── app/            # 应用页面
│   ├── hooks/          # 自定义Hooks
│   ├── i18n/           # 国际化配置
│   ├── lib/            # 工具库
│   └── ui/             # UI组件
│       ├── components/ # 业务组件
│       └── primitives/ # 基础UI组件
```

## 部署

项目可以部署到Vercel、Netlify或其他支持Next.js的平台。

```bash
bun build
# 或
npm run build
```

## 许可证

[MIT](LICENSE)
