---
id: "003"
title: "实验003：30天公开构建正式启动"
date: "2025-05-04"
day: 3
tags: ["Next.js 16", "DeepSeek API", "氛围编程", "Tailwind v4"]
---

今天完成了晓斌AI实验室的主站框架搭建。

## 技术栈最终决定

**Next.js 16 + Tailwind v4 + DeepSeek API**。放弃了 Framer 方案，原因是想要 Claude Code 全程辅助，Framer 的无代码特性反而成了障碍。

## 今天踩的坑

- **Next.js 16 是 canary 版本**，有 AGENTS.md 文档提示，API 与 v14/15 有差异——比如 `params` 现在是 Promise
- **Tailwind v4 不再需要 tailwind.config.js**，改用 CSS 中的 `@theme` 指令配置颜色变量
- **DeepSeek 的 API 密钥格式**是 `sk-xxxx`，不是 Anthropic 的 `sk-ant-xxxx`，导致初始配置时一度以为密钥无效

## 最大的发现

现有的 `E:\person\` 项目虽然是 Vite，但里面的 UI 组件设计（暗色主题、Indigo 配色）完全可以移植。节省了大量设计决策时间。

## 明天计划

完善提示词画廊，测试 Remix 功能的流式响应，开始写投研助手的 System Prompt。

> **今日心得**：氛围编程真的很爽，但前提是你要能读懂 AI 生成的代码，否则出了 Bug 根本不知道从哪下手。基础知识还是要扎实的。
