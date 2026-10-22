# My Daily Life

个人日常、进度、财务与奖励记录应用，使用 Vite、React、TypeScript 和 Firebase 构建。

## 本地开发

```bash
cp .env.example .env.local
pnpm install
pnpm dev
```

在 `.env.local` 中填写 Firebase Web 应用配置。

## 生产构建

```bash
pnpm build
pnpm preview
```

构建产物输出到 `dist`。

## Netlify

仓库已包含 `netlify.toml`。在 Netlify 后台配置 `.env.example` 中列出的环境变量后即可部署。
