# English Grammar Master - Vercel Deployment Guide

本项目是一个基于 Vite + React 的单页应用 (SPA)，可以轻松部署到 Vercel。

## 部署步骤

1. **导出代码**：
   - 在 AI Studio 中点击 **Settings** -> **Export to GitHub**。
   - 或者下载 ZIP 并上传到您的 GitHub 仓库。

2. **在 Vercel 中导入**：
   - 登录 [Vercel](https://vercel.com)。
   - 点击 **New Project**。
   - 选择您的 GitHub 仓库。

3. **配置环境变量**：
   - 在 Vercel 的项目设置中，添加以下环境变量：
     - `GEMINI_API_KEY`: 您的 Google AI API Key（如果应用中有使用 AI 功能）。

4. **构建设置**：
   - Framework Preset: `Vite`
   - Build Command: `npm run build`
   - Output Directory: `dist`

5. **点击 Deploy**。

## 本地开发

```bash
npm install
npm run dev
```
