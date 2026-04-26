# 有数 (Youshu) Web App - Technical Architecture & Development Plan

## 1. 产品设计概述 (Product Vision)
“有数” (Youshu) 是一款致力于帮助用户“心中有数”的个人数据可视化与追踪平台。用户可以记录习惯、财务、情绪等自定义指标，并通过直观的数据看板（Dashboard）掌控自己的生活状态。

## 2. 技术栈选择 (Tech Stack)
*   **前端框架**: Next.js 14 (App Router) + React 18
*   **语言**: TypeScript (严格模式)
*   **样式与 UI**: Tailwind CSS + shadcn/ui (Radix UI) + Framer Motion (动画)
*   **数据可视化**: Tremor (基于 Tailwind) 或 Recharts
*   **状态管理**: Zustand (全局状态) + React Query (服务端数据缓存与同步)
*   **后端与数据库**: Supabase (PostgreSQL + Row Level Security)
*   **身份认证**: Supabase Auth (OAuth + Magic Link)
*   **部署**: Vercel

## 3. 数据库模型设计 (Database Schema)
采用 PostgreSQL，核心表结构如下：

*   **`users`**: 用户基本信息
    *   `id` (UUID, PK), `email` (String), `avatar_url` (String), `created_at` (Timestamp)
*   **`metrics`**: 用户定义的追踪指标（例如：睡眠、支出、读书时间）
    *   `id` (UUID, PK), `user_id` (FK), `name` (String), `type` (Enum: number, boolean, currency), `unit` (String), `created_at` (Timestamp)
*   **`entries`**: 每日数据打卡记录
    *   `id` (UUID, PK), `metric_id` (FK), `user_id` (FK), `value` (Numeric/JSONB), `log_date` (Date), `notes` (Text)
*   **`dashboards`**: 用户自定义看板配置
    *   `id` (UUID, PK), `user_id` (FK), `layout_config` (JSONB)

## 4. 状态管理策略 (State Management)
*   **Server State (React Query)**: 处理所有与 Supabase 交互的异步数据（如获取图表数据、打卡记录），利用自动缓存、重试和后台验证保证数据新鲜度。
*   **Client State (Zustand)**: 处理 UI 交互状态，例如侧边栏折叠状态、当前选中的图表时间范围（本周/本月/今年）、深浅色主题切换。

## 5. 核心组件拆解 (Core Components)
1.  **`Layout / Sidebar Navigation`**: 全局导航，包含概览、详细指标列表、设置入口。
2.  **`Dashboard Widget`**: 动态卡片组件，接收 `metric_id` 和图表类型参数，渲染具体的数据趋势（折线图、柱状图或数字概览）。
3.  **`Quick Log Modal`**: 全局呼出的快速打卡弹窗，支持通过键盘快捷键 (`Cmd + K`) 快速输入今日数据。
4.  **`Data Table / Heatmap`**: 类似 GitHub 的活跃度热力图，用于直观展示习惯连续打卡记录。

## 6. 分步开发计划 (Step-by-step Development Plan)

### Phase 1: 基础设施与骨架 (Week 1)
*   [ ] 初始化 Next.js 项目，配置 Tailwind CSS 和 shadcn/ui。
*   [ ] 配置 Supabase 项目，创建数据库表结构与 RLS (行级安全策略)。
*   [ ] 实现基础布局（Layout）、导航栏和深浅色主题支持。

### Phase 2: 核心功能实现 (Week 2)
*   [ ] 集成 Supabase Auth，实现用户登录/注册界面。
*   [ ] 实现**指标管理 (Metrics Management)**：用户可以增删改查自己的数据指标。
*   [ ] 实现**打卡录入 (Data Entry)**：快速打卡组件和历史数据修改页面。

### Phase 3: 数据可视化与看板 (Week 3)
*   [ ] 引入 Tremor，开发多种数据图表组件（Trend图、Bar图、Heatmap）。
*   [ ] 实现首页的个人看板（Dashboard），支持汇总多项核心指标数据。
*   [ ] 优化 React Query 缓存策略，确保打卡后图表能乐观更新 (Optimistic Updates)。

### Phase 4: 细节打磨与部署 (Week 4)
*   [ ] 增加 PWA 支持，使用户可在手机桌面添加应用。
*   [ ] 添加 Framer Motion 动画过渡，提升交互顺滑感。
*   [ ] 最终检查响应式布局（Mobile-first）。
*   [ ] 部署至 Vercel，绑定自定义域名。

---
## GSTACK REVIEW REPORT
| Role | Status | Findings |
|---|---|---|
| CEO Review | 1 | "有数" addresses a real need for data ownership and personal awareness. Good scope for MVP. |
| Eng Review | 1 | Supabase + Next.js + React Query is a solid, scalable choice. RLS will keep user data secure. |
| Design Review | 1 | Clean and data-centric approach. Recommends minimal distractions on the Dashboard. |
| DX Review | 1 | Straightforward architecture, easy to onboard. |
| Codex | 1 | Plan structure is well formatted and ready for execution. |
