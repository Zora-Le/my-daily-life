# 项目开发指南

## 技术栈

- Vite + React 19 + TypeScript
- Firebase Authentication + Firestore
- pnpm

## 常用命令

```bash
pnpm install
pnpm dev
pnpm build
pnpm preview
```

## 开发约定

- 组件使用 PascalCase，工具函数使用 camelCase。
- 业务组件位于 `src/components`，业务逻辑位于 `src/lib` 或 `src/hooks`。
- Firebase 配置仅通过 `VITE_FIREBASE_*` 环境变量读取，不提交 `.env.local`。
- 提交前至少执行与改动相关的检查，并确认 `pnpm build` 成功。
