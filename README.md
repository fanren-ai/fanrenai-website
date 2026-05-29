# 凡人修AI

静态品牌官网与本地 Markdown 教程系统。

## 内容结构

- `index.html`：官网首页
- `content/tutorials/*.md`：教程 Markdown 源文件
- `scripts/build-site.js`：静态页面生成脚本
- `scripts/design-system.js`：凡人修AI Design System，统一 Header、Footer、按钮、卡片、修炼等级和文章模板
- `scripts/seed-content-map.js`：内容地图 V1.0 种子脚本，可生成 60 篇 Markdown 占位稿
- `tutorials/`：生成后的教程列表、分类页、文章详情页
- `sitemap.xml`、`robots.txt`：SEO 文件

## 新增文章

在 `content/tutorials/` 新建 Markdown 文件，并添加 frontmatter：

```md
---
title: 文章标题
description: 文章摘要
category: ai-cognition
categoryName: AI基础认知
section: AI基础认知
order: 1
tags: AI入门,Prompt
date: 2026-05-29
author: 凡人修AI
level: 新手村
goal: 本篇教程希望读者完成的具体成长目标
duration: 20分钟
practice: 实战任务一|实战任务二|实战任务三
related: other-article-slug,another-article-slug
---

# 文章标题

正文内容。
```

支持的分类：

- `ai-cognition`：AI基础认知
- `ai-tool-intro`：AI工具入门
- `ai-tool-choice`：AI工具选择
- `prompt-engineering`：Prompt工程
- `ai-office`：AI办公
- `ai-workflow`：AI工作流
- `codex`：Codex专区
- `cursor`：Cursor专区
- `claude-code`：Claude Code专区
- `ai-side-hustle`：AI副业
- `ai-product`：AI产品
- `ai-startup`：AI创业

详情页模板会自动读取这些修炼字段：

- `level`：修炼等级，如 `新手村`、`炼气期`、`筑基期`、`金丹期`
- `section`：内容地图栏目
- `order`：内容地图序号
- `goal`：修炼目标
- `duration`：修炼时长
- `practice`：实战任务，用 `|` 分隔
- `related`：相关教程的文章 slug，用英文逗号分隔

## Design System

全站页面通过 `scripts/design-system.js` 输出统一组件：

- `renderHeader` / `renderFooter`：全站导航与页脚
- `renderButton`：统一按钮
- `renderArticleCard`：统一教程卡片
- `renderLevelBadge`：统一修炼等级
- `renderArticlePage`：统一教程详情页模板
- `renderHomePage`：统一品牌首页

颜色、圆角、容器、卡片和等级视觉 token 位于 `styles.css` 顶部 `:root`。

## 内容地图 V1.0

生成 60 篇内容地图占位稿：

```bash
node scripts/seed-content-map.js
```

生成后的内容地图页面位于：

```text
tutorials/map/index.html
```

## 生成静态页面

```bash
node scripts/build-site.js
```

如果本机允许 npm 脚本，也可以运行：

```bash
npm run build
```
