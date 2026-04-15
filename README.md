<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# 医疗设备运行维护巡检系统（Vite + Vercel Functions + Neon）

本项目包含：
- 前端：Vite + React Router
- 后端：Vercel Serverless Functions（`/api`）
- 数据库：Neon Postgres（Prisma 管理）
- 鉴权：JWT（HttpOnly Cookie）+ RBAC 权限

## 本地运行（含数据库/权限）

**前置条件**：Node.js 18+（建议 20+）

1) 安装依赖

```bash
npm install
```

2) 配置环境变量

- 复制 `.env.example` 为 `.env`
- 填入：
  - `DATABASE_URL`（Neon 的连接串）
  - `JWT_SECRET`（任意长随机字符串）

> `.env` 已被 `.gitignore` 忽略，不会上传到 GitHub。

3) 初始化数据库（首次执行）

```bash
npx prisma generate
npx prisma db push
```

4) 启动

```bash
npm run dev
```

5) 创建第一个账号（自动成为管理员 admin）

向 `POST /api/auth/register` 发送 JSON：

```json
{ "username": "admin", "password": "admin123", "department": "医工处" }
```

## Vercel 部署

1) 推送到 GitHub（不要提交 `.env`）
2) Vercel 导入仓库，Root Directory 选择本目录
3) 配置环境变量（Vercel Project Settings → Environment Variables）：
   - `DATABASE_URL`
   - `JWT_SECRET`
4) 部署后前端同域调用 `/api/*` 访问数据库
