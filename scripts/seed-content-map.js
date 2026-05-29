const fs = require("node:fs");
const path = require("node:path");

const root = process.cwd();
const contentDir = path.join(root, "content", "tutorials");

const stageGoals = {
  新手村: "让完全不会AI的人迈出第一步。",
  炼气期: "利用AI提升工作效率。",
  筑基期: "学会使用AI开发产品。",
  金丹期: "利用AI创造收入。"
};

const sectionCategory = {
  AI基础认知: "ai-cognition",
  AI工具入门: "ai-tool-intro",
  AI工具选择: "ai-tool-choice",
  Prompt工程: "prompt-engineering",
  AI办公: "ai-office",
  AI工作流: "ai-workflow",
  Codex专区: "codex",
  Cursor专区: "cursor",
  "Claude Code专区": "claude-code",
  AI副业: "ai-side-hustle",
  AI产品: "ai-product",
  AI创业: "ai-startup"
};

const contentMap = [
  {
    level: "新手村",
    sections: [
      {
        name: "AI基础认知",
        items: [
          ["什么是AI", "what-is-ai"],
          ["AI的发展历史", "ai-history"],
          ["AI会取代人类工作吗", "will-ai-replace-jobs"],
          ["普通人为什么必须学习AI", "why-ordinary-people-need-ai"],
          ["AI时代最大的机会是什么", "biggest-ai-opportunities"]
        ]
      },
      {
        name: "AI工具入门",
        items: [
          ["ChatGPT入门指南", "chatgpt-beginner-guide"],
          ["DeepSeek入门指南", "deepseek-beginner-guide"],
          ["Claude入门指南", "claude-beginner-guide"],
          ["Kimi入门指南", "kimi-beginner-guide"],
          ["豆包入门指南", "doubao-beginner-guide"]
        ]
      },
      {
        name: "AI工具选择",
        items: [
          ["ChatGPT vs Claude", "chatgpt-vs-claude"],
          ["DeepSeek vs ChatGPT", "deepseek-vs-chatgpt"],
          ["新手必备AI工具推荐", "beginner-ai-tools"],
          ["免费AI工具推荐", "free-ai-tools"],
          ["AI学习路线图", "ai-learning-roadmap"]
        ]
      }
    ]
  },
  {
    level: "炼气期",
    sections: [
      {
        name: "Prompt工程",
        items: [
          ["什么是Prompt", "what-is-prompt"],
          ["Prompt基础结构", "prompt-basic-structure"],
          ["Prompt进阶技巧", "advanced-prompt-techniques"],
          ["提示词万能框架", "universal-prompt-framework"],
          ["高质量Prompt案例", "high-quality-prompt-examples"]
        ]
      },
      {
        name: "AI办公",
        items: [
          ["AI写文章", "ai-writing-articles"],
          ["AI写PPT", "ai-writing-ppt"],
          ["AI写周报", "ai-writing-weekly-report"],
          ["AI做数据分析", "ai-data-analysis"],
          ["AI辅助办公全流程", "ai-office-workflow"]
        ]
      },
      {
        name: "AI工作流",
        items: [
          ["什么是AI工作流", "what-is-ai-workflow"],
          ["工作流设计思路", "workflow-design-thinking"],
          ["MCP是什么", "what-is-mcp"],
          ["MCP入门教程", "mcp-beginner-guide"],
          ["AI自动化案例", "ai-automation-cases"]
        ]
      }
    ]
  },
  {
    level: "筑基期",
    sections: [
      {
        name: "Codex专区",
        items: [
          ["什么是Codex", "what-is-codex"],
          ["Codex安装教程", "codex-install-guide"],
          ["Codex配置教程", "codex-config-guide"],
          ["Codex第一个项目", "codex-first-project-guide"],
          ["Codex常见报错", "codex-common-errors"],
          ["Codex开发网站实战", "codex-build-website"],
          ["Codex开发工具实战", "codex-build-tool"],
          ["Codex最佳实践", "codex-best-practices"],
          ["Codex进阶技巧", "codex-advanced-techniques"],
          ["Codex完整学习路线", "codex-learning-roadmap"]
        ]
      },
      {
        name: "Cursor专区",
        items: [
          ["Cursor入门教程", "cursor-beginner-guide"],
          ["Cursor工作流", "cursor-workflow"],
          ["Cursor开发网站实战", "cursor-build-website"],
          ["Cursor与Codex对比", "cursor-vs-codex"]
        ]
      },
      {
        name: "Claude Code专区",
        items: [
          ["Claude Code入门", "claude-code-beginner-guide"],
          ["Claude Code实战", "claude-code-practice"],
          ["Claude Code与Codex对比", "claude-code-vs-codex"]
        ]
      }
    ]
  },
  {
    level: "金丹期",
    sections: [
      {
        name: "AI副业",
        items: [
          ["AI副业方向盘点", "ai-side-hustle-ideas"],
          ["AI自媒体实战", "ai-media-practice"],
          ["AI知识付费实战", "ai-knowledge-commerce"]
        ]
      },
      {
        name: "AI产品",
        items: [
          ["AI产品从0到1", "ai-product-from-zero-to-one"],
          ["AI工具站如何搭建", "build-ai-tool-directory"],
          ["AI SaaS项目拆解", "ai-saas-breakdown"],
          ["AI产品案例分析", "ai-product-case-study"]
        ]
      },
      {
        name: "AI创业",
        items: [
          ["AI创业路线图", "ai-startup-roadmap"],
          ["一人AI公司模式", "one-person-ai-company"],
          ["AI公司如何获客", "ai-company-customer-acquisition"],
          ["AI服务如何定价", "ai-service-pricing"],
          ["AI创业避坑指南", "ai-startup-pitfalls"],
          ["凡人修AI创业日志", "fanren-xiu-ai-startup-log"]
        ]
      }
    ]
  }
];

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function pad(value) {
  return String(value).padStart(3, "0");
}

function flattenMap() {
  let order = 1;
  return contentMap.flatMap((stage) =>
    stage.sections.flatMap((section) =>
      section.items.map(([title, slug]) => ({
        title,
        slug: `${pad(order)}-${slug}`,
        order: order++,
        level: stage.level,
        stageGoal: stageGoals[stage.level],
        section: section.name,
        category: sectionCategory[section.name],
        categoryName: section.name
      }))
    )
  );
}

function buildMarkdown(item, related) {
  const duration = item.level === "新手村" ? "15分钟" : item.level === "炼气期" ? "25分钟" : item.level === "筑基期" ? "35分钟" : "30分钟";
  const goal = `完成「${item.title}」这一课，掌握${item.section}中的一个关键动作。`;
  const practice = [
    `用自己的话复述「${item.title}」的核心结论`,
    "结合一个真实工作或学习场景做一次AI练习",
    "把本课方法整理成一条可复用的提示词或行动清单"
  ].join("|");

  return `---
title: ${item.title}
description: ${item.stageGoal}
category: ${item.category}
categoryName: ${item.categoryName}
section: ${item.section}
order: ${item.order}
level: ${item.level}
goal: ${goal}
duration: ${duration}
practice: ${practice}
related: ${related.join(",")}
tags: ${item.level},${item.section},凡人修AI
date: 2026-05-29
author: 凡人修AI
status: planned
---

# ${item.title}

> 本文是「凡人修AI 内容地图 V1.0」中的第 ${item.order} 课，属于 **${item.level} / ${item.section}**。

## 本篇修炼目标

${goal}

## 适合谁学习

- 刚开始系统学习AI的普通人
- 希望按阶段补齐AI能力的人
- 想把AI学习变成真实产出的人

## 正文提纲

1. 先理解这个主题解决什么问题
2. 再看普通人最容易踩的坑
3. 最后完成一个可以复用的小练习

## 实战提醒

这篇文章当前是内容地图占位稿。后续会补充完整案例、操作步骤、截图说明和可复制模板。
`;
}

function seed() {
  ensureDir(contentDir);
  const items = flattenMap();
  let created = 0;
  let skipped = 0;

  items.forEach((item, index) => {
    const related = [items[index - 1], items[index + 1]]
      .filter(Boolean)
      .map((relatedItem) => relatedItem.slug);
    const filePath = path.join(contentDir, `${item.slug}.md`);

    if (fs.existsSync(filePath)) {
      skipped += 1;
      return;
    }

    fs.writeFileSync(filePath, buildMarkdown(item, related), "utf8");
    created += 1;
  });

  console.log(`Content map seed complete. Created ${created}, skipped ${skipped}.`);
}

seed();
