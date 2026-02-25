# 湘潭交运集团数字化指挥中心

> 湘潭交通运输集团旗下分站营收、客流与项目进度实时监控大屏，基于 Vite + React + Tailwind CSS + ECharts + Supabase 构建，支持毫秒级数据联动响应。

## 🌐 线上访问

**正式地址**：[https://shujudaping.vercel.app](https://shujudaping.vercel.app)

## 📌 项目背景

湘潭交运集团下辖湘潭客运分公司、易俗河汽车站、湘乡汽车站、韶山汽车站及公交集团等五大运营节点，核心战略项目包括：

- **候车厅升级改造工程**：约 2000 平米，作为集团品质服务的核心工程
- **包车业务推广计划**：月度营收专项指标追踪
- **校园合伙人计划**：校际定制客运业务拓展进度管理
- **抖音数字化营销**：全平台短视频营销流量与互动量追踪

本大屏为集团管理层提供实时数据支撑，用于日常营收决策与项目进度管控。

## 🚀 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

参照 `.env.example` 创建本地 `.env` 文件：

```bash
cp .env.example .env
```

编辑 `.env`，填入你的 Supabase 配置：

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_KEY=your_supabase_anon_key
```

### 3. 本地启动

```bash
npm run dev
```

在浏览器打开 `http://localhost:5173` 即可预览大屏。

## 🗃️ 数据库结构

`company_metrics` 表核心字段：

| 字段 | 类型 | 说明 |
|------|------|------|
| `branch_name` | text | 分站名称 |
| `daily_revenue` | numeric | 日营收（元） |
| `passenger_flow` | integer | 今日客流量（人次） |
| `charter_revenue` | numeric | 包车业务专项营收（元） |
| `social_engagement` | integer | 短视频营销互动量 |
| `project_progress` | integer | 项目进度 0–100 |
| `safety_days` | integer | 安全运行天数 |

## 🛠️ 技术栈

- **前端**：Vite + React 19 + TypeScript
- **样式**：Tailwind CSS v4 + 赛博朋克深蓝主题
- **图表**：Apache ECharts（双轴混合图 / 仪表盘）
- **后端**：Supabase（PostgreSQL + Realtime WALRUS）
- **部署**：Vercel（自动 CI/CD）

## 🔒 安全说明

`.env` 已加入 `.gitignore`，所有敏感 Key 不会随代码上传至 GitHub。请勿将真实 Key 提交至版本库。
