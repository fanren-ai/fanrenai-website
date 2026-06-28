const fs = require("node:fs");
const path = require("node:path");
const {
  site,
  breadcrumbJsonLd,
  categories,
  escapeHtml,
  layout,
  renderArticleCard,
  renderArticlePage,
  renderAboutPage,
  renderButton,
  renderCategoryChips,
  renderCommunityPage,
  render404Page,
  renderHomePage,
  renderLevelBadge
} = require("./design-system");

const root = process.cwd();
const contentDir = path.join(root, "content", "tutorials");
const outputDir = path.join(root, "tutorials");
const toolsOutputDir = path.join(root, "tools");
const executeOutputDir = path.join(root, "execute");
const pageSize = 12;
const validStatuses = new Set(["planned", "writing", "published"]);
const protectedRobotPaths = ["/api/", "/admin/", "/private/", "/_next/"];
const allowedSearchCrawlers = ["Googlebot", "Bingbot", "Baiduspider", "Sogou", "360Spider"];
const blockedRobotsCrawlers = [
  "GPTBot",
  "ClaudeBot",
  "CCBot",
  "Bytespider",
  "PerplexityBot",
  "Amazonbot",
  "AhrefsBot",
  "SemrushBot",
  "MJ12bot",
  "DotBot",
  "DataForSeoBot",
  "PetalBot",
  "BLEXBot",
  "Barkrowler",
  "MegaIndex",
  "SeekportBot",
  "serpstatbot",
  "Screaming Frog SEO Spider"
];

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function cleanGeneratedDir() {
  fs.rmSync(outputDir, { recursive: true, force: true });
  ensureDir(outputDir);
}

function cleanToolsDir() {
  fs.rmSync(toolsOutputDir, { recursive: true, force: true });
  ensureDir(toolsOutputDir);
}

function slugify(value) {
  return String(value)
    .trim()
    .toLowerCase()
    .replace(/\.md$/, "")
    .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function parseFrontmatter(source) {
  if (!source.startsWith("---")) {
    return { meta: {}, body: source };
  }

  const end = source.indexOf("\n---", 3);
  if (end === -1) {
    return { meta: {}, body: source };
  }

  const raw = source.slice(3, end).trim();
  const body = source.slice(end + 4).trim();
  const meta = {};

  raw.split(/\r?\n/).forEach((line) => {
    const index = line.indexOf(":");
    if (index === -1) return;
    const key = line.slice(0, index).trim();
    const value = line.slice(index + 1).trim();
    meta[key] = value.replace(/^["']|["']$/g, "");
  });

  return { meta, body };
}

function markdownToHtml(markdown) {
  const lines = markdown.replace(/\r\n/g, "\n").split("\n");
  const html = [];
  let paragraph = [];
  let list = [];
  let code = [];
  let codeLanguage = "";
  let inCode = false;

  function inline(value) {
    return escapeHtml(value)
      .replace(/\[([^\]]+?)\]\(([^)\s]+?)\)/g, (_, label, href) => {
        const safeHref = href.trim();
        const isExternal = /^https?:\/\//.test(safeHref);
        const allowedHref = /^(https?:\/\/|mailto:|tel:|#|\/|\.\.?\/)/.test(safeHref) ? safeHref : "#";
        const target = isExternal ? ' target="_blank" rel="noopener noreferrer"' : "";
        return `<a href="${escapeHtml(allowedHref)}"${target}>${label}</a>`;
      })
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      .replace(/`(.+?)`/g, "<code>$1</code>");
  }

  function getBlockValue(blockLines, key, fallback = "") {
    const prefix = `${key}:`;
    const line = blockLines.find((item) => item.startsWith(prefix));
    return line ? line.slice(prefix.length).trim() : fallback;
  }

  function getBlockItems(blockLines) {
    return blockLines.filter((item) => item.trim() && !/^[a-zA-Z]+:/.test(item));
  }

  function splitCells(line) {
    return line.split("|").map((item) => item.trim()).filter(Boolean);
  }

  function renderTutorialBlock(type, blockLines) {
    const title = getBlockValue(blockLines, "title");

    if (type === "tutorial-flow") {
      const items = getBlockItems(blockLines);
      return `<section class="tutorial-visual-card tutorial-flow" aria-label="${escapeHtml(title)}">
        <header>
          <span>Flow</span>
          <h3>${escapeHtml(title || "第1天只做三件事")}</h3>
        </header>
        <ol>${items
          .map((item, index) => {
            const [name, description = ""] = splitCells(item);
            return `<li>
              <span>${String(index + 1).padStart(2, "0")}</span>
              <strong>${escapeHtml(name)}</strong>
              <p>${escapeHtml(description)}</p>
            </li>`;
          })
          .join("")}</ol>
      </section>`;
    }

    if (type === "tutorial-formula") {
      const items = getBlockItems(blockLines).flatMap(splitCells);
      return `<section class="tutorial-visual-card tutorial-formula" aria-label="${escapeHtml(title)}">
        <header>
          <span>Formula</span>
          <h3>${escapeHtml(title || "普通人向AI提问的基础公式")}</h3>
        </header>
        <div class="tutorial-formula-row">${items
          .map((item, index) => `${index ? "<b>+</b>" : ""}<span>${escapeHtml(item)}</span>`)
          .join("")}</div>
        <p>把这五项说清楚，AI才更容易给出接近真实需求的结果。</p>
      </section>`;
    }

    if (type === "tutorial-task-card") {
      const target = getBlockValue(blockLines, "target", "让AI帮你写一段自我介绍");
      const scenes = splitCells(getBlockValue(blockLines, "scenes"));
      const includes = splitCells(getBlockValue(blockLines, "includes"));
      const standards = splitCells(getBlockValue(blockLines, "standard"));
      return `<section class="tutorial-visual-card tutorial-task-card" aria-label="${escapeHtml(title)}">
        <header>
          <span>Task</span>
          <h3>${escapeHtml(title || "今日修炼任务")}</h3>
        </header>
        <div class="tutorial-task-grid">
          <div>
            <span>任务目标</span>
            <strong>${escapeHtml(target)}</strong>
          </div>
          <div>
            <span>${includes.length ? "页面包含什么" : "使用场景"}</span>
            <ul>${(includes.length ? includes : scenes).map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
          </div>
          <div>
            <span>完成标准</span>
            <ul>${standards.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
          </div>
        </div>
      </section>`;
    }

    if (type === "tutorial-role-split") {
      const you = splitCells(getBlockValue(blockLines, "you"));
      const codex = splitCells(getBlockValue(blockLines, "codex"));
      return `<section class="tutorial-visual-card tutorial-role-split" aria-label="${escapeHtml(title)}">
        <header>
          <span>Roles</span>
          <h3>${escapeHtml(title || "你和 Codex 各自负责什么？")}</h3>
        </header>
        <div class="tutorial-role-grid">
          <div>
            <strong>你负责：</strong>
            <ul>${you.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
          </div>
          <div>
            <strong>Codex 负责：</strong>
            <ul>${codex.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
          </div>
        </div>
      </section>`;
    }

    if (type === "tutorial-compare-table") {
      const items = getBlockItems(blockLines);
      return `<section class="tutorial-visual-card tutorial-compare-table" aria-label="${escapeHtml(title)}">
        <header>
          <span>Compare</span>
          <h3>${escapeHtml(title || "常见错误对照表")}</h3>
        </header>
        <table>
          <thead><tr><th>错误做法</th><th>更好的做法</th></tr></thead>
          <tbody>${items
            .map((item) => {
              const [wrong, better = ""] = splitCells(item);
              return `<tr><td>${escapeHtml(wrong)}</td><td>${escapeHtml(better)}</td></tr>`;
            })
            .join("")}</tbody>
        </table>
      </section>`;
    }

    if (type === "tutorial-next-actions") {
      const items = getBlockItems(blockLines);
      return `<section class="tutorial-next-actions" aria-label="${escapeHtml(title || "下一步行动")}">
        ${title ? `<h3>${escapeHtml(title)}</h3>` : ""}
        <div>${items
          .map((item) => {
            const [label, href = "#", description = ""] = splitCells(item);
            const allowedHref = /^(https?:\/\/|#|\/|\.\.?\/)/.test(href) ? href : "#";
            return `<a class="tutorial-next-card" href="${escapeHtml(allowedHref)}">
              <strong>${escapeHtml(label)}</strong>
              <span>${escapeHtml(description)}</span>
            </a>`;
          })
          .join("")}</div>
      </section>`;
    }

    return "";
  }

  function flushParagraph() {
    if (!paragraph.length) return;
    html.push(`<p>${inline(paragraph.join(" "))}</p>`);
    paragraph = [];
  }

  function flushList() {
    if (!list.length) return;
    html.push(`<ul>${list.map((item) => `<li>${inline(item)}</li>`).join("")}</ul>`);
    list = [];
  }

  function flushCode() {
    const className = codeLanguage ? ` class="language-${escapeHtml(codeLanguage)}"` : "";
    const label = codeLanguage === "prompt" ? "可复制提示词" : "可复制内容";
    html.push(`<div class="copy-block">
      <div class="copy-block-header">
        <span>${label}</span>
        <button class="copy-button" type="button" data-copy-button aria-label="复制这段内容">复制</button>
      </div>
      <pre><code${className}>${escapeHtml(code.join("\n"))}</code></pre>
    </div>`);
    code = [];
    codeLanguage = "";
  }

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    const fence = line.match(/^```(\w+)?/);
    if (fence) {
      if (inCode) {
        flushCode();
        inCode = false;
      } else {
        flushParagraph();
        flushList();
        codeLanguage = fence[1] || "";
        inCode = true;
      }
      continue;
    }

    if (inCode) {
      code.push(line);
      continue;
    }

    const tutorialBlock = line.match(/^:::(tutorial-[a-z-]+)$/);
    if (tutorialBlock) {
      flushParagraph();
      flushList();
      const blockLines = [];
      index += 1;
      while (index < lines.length && lines[index].trim() !== ":::") {
        blockLines.push(lines[index].trim());
        index += 1;
      }
      const rendered = renderTutorialBlock(tutorialBlock[1], blockLines);
      if (rendered) html.push(rendered);
      continue;
    }

    const image = line.match(/^!\[([^\]]*)\]\((\S+)(?:\s+"([^"]+)")?\)$/);
    if (image) {
      flushParagraph();
      flushList();
      const [, alt, src, caption] = image;
      html.push(`<figure class="article-figure">
        <img src="${escapeHtml(src)}" alt="${escapeHtml(alt)}" loading="lazy" decoding="async" />
        ${caption ? `<figcaption>${inline(caption)}</figcaption>` : ""}
      </figure>`);
      continue;
    }

    if (!line.trim()) {
      flushParagraph();
      flushList();
      continue;
    }

    const heading = line.match(/^(#{1,3})\s+(.+)$/);
    if (heading) {
      flushParagraph();
      flushList();
      const level = heading[1].length;
      html.push(`<h${level}>${inline(heading[2])}</h${level}>`);
      continue;
    }

    const quote = line.match(/^>\s+(.+)$/);
    if (quote) {
      flushParagraph();
      flushList();
      html.push(`<blockquote><p>${inline(quote[1])}</p></blockquote>`);
      continue;
    }

    const bullet = line.match(/^-\s+(.+)$/);
    if (bullet) {
      flushParagraph();
      list.push(bullet[1]);
      continue;
    }

    const ordered = line.match(/^\d+\.\s+(.+)$/);
    if (ordered) {
      flushParagraph();
      list.push(ordered[1]);
      continue;
    }

    paragraph.push(line.trim());
  }

  flushParagraph();
  flushList();
  if (inCode) flushCode();
  return html.join("\n");
}

function readingMinutes(text) {
  const count = text.replace(/\s/g, "").length;
  return Math.max(1, Math.ceil(count / 500));
}

function splitList(value = "") {
  return String(value)
    .split(/[|,，;；]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function xmlEscape(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function latestDate(articles, fallback = "2026-06-14") {
  const dates = articles.map((article) => article.updated || article.date).filter(Boolean);
  dates.sort();
  return dates.length ? dates[dates.length - 1] : fallback;
}

function tutorialPageUrl(page) {
  return page === 1 ? `${site.origin}/tutorials/` : `${site.origin}/tutorials/page/${page}/`;
}

function categoryPageUrl(slug, page) {
  return page === 1 ? `${site.origin}/tutorials/category/${slug}/` : `${site.origin}/tutorials/category/${slug}/page/${page}/`;
}

function itemListJsonLd(name, articles, positionOffset = 0) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name,
    itemListElement: articles.map((article, index) => ({
      "@type": "ListItem",
      position: positionOffset + index + 1,
      url: `${site.origin}/tutorials/${article.slug}/`,
      name: article.title
    }))
  };
}

function readArticles() {
  ensureDir(contentDir);
  return fs
    .readdirSync(contentDir)
    .filter((file) => file.endsWith(".md"))
    .map((file) => {
      const source = fs.readFileSync(path.join(contentDir, file), "utf8");
      const { meta, body } = parseFrontmatter(source);
      const slug = meta.slug || slugify(file);
      const category = meta.category || "ai-basics";
      const status = meta.status || "published";
      if (!validStatuses.has(status)) {
        throw new Error(`Invalid status "${status}" in ${file}. Use planned, writing, or published.`);
      }

      return {
        slug,
        title: meta.title || slug,
        description: meta.description || "",
        category,
        categoryName: meta.categoryName || categories[category] || category,
        tags: splitList(meta.tags),
        date: meta.date || "2026-05-29",
        updated: meta.updated || meta.modified || meta.date || "2026-05-29",
        author: meta.author || site.name,
        cover: meta.cover || "",
        order: Number(meta.order || meta.mapOrder || 0),
        section: meta.section || meta.categoryName || categories[category] || category,
        status,
        level: meta.level || meta.cultivationLevel || categories[category] || "新手村",
        goal: meta.goal || meta.cultivationGoal || meta.description || "完成本篇修炼，形成一个可复用的AI实践动作。",
        duration: meta.duration || meta.cultivationDuration || "",
        practiceTasks: splitList(meta.practice || meta.tasks || meta.practiceTasks),
        relatedSlugs: splitList(meta.related || meta.relatedTutorials),
        body,
        html: markdownToHtml(body),
        minutes: readingMinutes(body)
      };
    })
    .sort((a, b) => {
      if (a.order && b.order && a.order !== b.order) return a.order - b.order;
      if (a.order && !b.order) return -1;
      if (!a.order && b.order) return 1;
      return b.date.localeCompare(a.date);
    });
}

function paginate(items) {
  const pages = [];
  for (let index = 0; index < items.length; index += pageSize) {
    pages.push(items.slice(index, index + pageSize));
  }
  return pages.length ? pages : [[]];
}

function pagination(current, total, hrefForPage) {
  if (total <= 1) return "";
  const links = Array.from({ length: total }, (_, index) => {
    const page = index + 1;
    const active = page === current ? " is-active" : "";
    return `<a class="${active}" href="${hrefForPage(page)}">${page}</a>`;
  }).join("");
  return `<nav class="pagination" aria-label="文章分页">${links}</nav>`;
}

function renderStaticCopyBlock(label, text) {
  return `<div class="copy-block">
    <div class="copy-block-header">
      <span>${escapeHtml(label)}</span>
      <button class="copy-button" type="button" data-copy-button aria-label="复制这段内容">复制</button>
    </div>
    <pre><code>${escapeHtml(text.trim())}</code></pre>
  </div>`;
}

function renderTutorialIndex(articles, current = 1, total = 1, baseRoot = "../", totalArticles = articles.length) {
  const cards = articles.map((article) => renderArticleCard(article, baseRoot)).join("\n");
  const listContent = cards || "<p>内容正在按照新标准重写中</p>";
  const chips = renderCategoryChips(baseRoot);
  const canonicalUrl = tutorialPageUrl(current);
  const pageTitle = current === 1 ? "AI教程 | 凡人修AI" : `AI教程第${current}页 | 凡人修AI`;
  const pageDescription =
    current === 1
      ? "凡人修AI教程系统，覆盖AI入门、Prompt工作流、Codex实战、AI工具箱和AI案例。"
      : `凡人修AI教程第${current}页，继续阅读普通人学AI、Prompt工作流、Codex实战和AI应用教程。`;
  return layout({
    title: pageTitle,
    description: pageDescription,
    base: baseRoot,
    canonicalUrl,
    prevUrl: current > 1 ? tutorialPageUrl(current - 1) : "",
    nextUrl: current < total ? tutorialPageUrl(current + 1) : "",
    keywords: ["AI教程", "普通人学AI", "Prompt工作流", "Codex实战", "AI工具箱"],
    structuredData: [
      itemListJsonLd("凡人修AI教程列表", articles, (current - 1) * pageSize),
      breadcrumbJsonLd([
        { name: "首页", url: `${site.origin}/` },
        { name: "AI教程", url: `${site.origin}/tutorials/` }
      ])
    ],
    body: `<section class="tutorial-hero page-hero page-hero--learning section-pad">
      <div class="page-hero-main">
        <p class="page-hero-eyebrow">AI Tutorials</p>
        <h1 class="page-hero-title">凡人修AI教程</h1>
        <p class="page-hero-description">从看懂 AI、学会工具，到把 AI 放进真实工作和内容创作里，一步一步修炼。</p>
      </div>
    </section>
    <section class="tutorial-layout section-pad">
      <aside class="tutorial-sidebar">
        <h2>教程分类</h2>
        <nav>${chips}</nav>
      </aside>
      <div>
        <div class="tutorial-list">${listContent}</div>
        ${pagination(current, total, (page) => (page === 1 ? `${baseRoot}tutorials/` : `${baseRoot}tutorials/page/${page}/`))}
      </div>
    </section>`
  });
}

const codexAutomationTracks = [
  {
    slug: "basic",
    label: "Basic",
    title: "入门最后一公里",
    scenario: "Codex能做什么、安装准备、第一次打开文件夹、第一次执行任务、常见报错。",
    articles: [
      ["C001", "Codex能做什么：普通人的 AI 员工边界", "规划中"],
      ["C002", "安装准备：账号、环境和文件夹怎么先放好", "规划中"],
      ["C003", "第一次打开文件夹：让 Codex 看懂你的资料", "规划中"],
      ["C004", "第一次执行任务：从改一个文档开始", "规划中"],
      ["C005", "常见报错：看不懂提示时先检查什么", "规划中"],
      ["C006", "第一次复盘：怎么判断 Codex 做得好不好", "规划中"]
    ]
  },
  {
    slug: "office",
    label: "Office",
    title: "办公自动化",
    scenario: "让 Codex 帮你处理表格、文档、周报、会议纪要和资料整理。",
    articles: [
      ["O001", "用 Codex 整理一份杂乱文档", "规划中"],
      ["O002", "用 Codex 生成周报初稿", "规划中"],
      ["O003", "用 Codex 拆解 Excel 表格分析任务", "规划中"],
      ["O004", "用 Codex 整理会议纪要和行动项", "规划中"],
      ["O005", "用 Codex 生成 PPT 大纲和页面说明", "规划中"],
      ["O006", "用 Codex 批量整理文件命名和目录", "规划中"],
      ["O007", "用 Codex 检查文档里的遗漏和冲突", "规划中"],
      ["O008", "用 Codex 搭建个人办公自动化清单", "规划中"]
    ]
  },
  {
    slug: "media",
    label: "Media",
    title: "自媒体提效",
    scenario: "让 Codex 帮你整理选题、改写内容、生成发布素材和维护内容库。",
    articles: [
      ["M001", "用 Codex 整理一周选题池", "规划中"],
      ["M002", "用 Codex 把长文拆成小红书笔记", "规划中"],
      ["M003", "用 Codex 生成短视频口播提纲", "规划中"],
      ["M004", "用 Codex 整理公众号文章结构", "规划中"],
      ["M005", "用 Codex 建一个个人素材库目录", "规划中"],
      ["M006", "用 Codex 检查内容是否像模板", "规划中"],
      ["M007", "用 Codex 生成多平台发布检查表", "规划中"],
      ["M008", "用 Codex 做一次内容复盘", "规划中"]
    ]
  },
  {
    slug: "sales",
    label: "Sales",
    title: "销售/私域/客服提效",
    scenario: "让 Codex 帮你整理客户资料、常见问题、回复话术、跟进表和复盘记录。",
    articles: [
      ["S001", "用 Codex 整理客户常见问题", "规划中"],
      ["S002", "用 Codex 生成基础回复话术", "规划中"],
      ["S003", "用 Codex 分类客户异议", "规划中"],
      ["S004", "用 Codex 整理私域跟进表", "规划中"],
      ["S005", "用 Codex 检查话术边界和风险", "规划中"],
      ["S006", "用 Codex 做一次销售沟通复盘", "规划中"]
    ]
  },
  {
    slug: "project",
    label: "Project",
    title: "AI副业/项目实战",
    scenario: "让 Codex 帮你拆项目、做工具雏形、整理交付物，并完成一次项目协作闭环。",
    articles: [
      ["P001", "用 Codex 拆一个 AI 副业小项目", "规划中"],
      ["P002", "用 Codex 做一个静态工具页雏形", "规划中"],
      ["P003", "用 Codex 整理项目交付清单", "规划中"],
      ["P004", "用 Codex 检查页面、链接和 sitemap", "规划中"],
      ["P005", "用 Codex 写项目验收报告", "规划中"],
      ["P006", "用 Codex 完成一次项目复盘", "规划中"]
    ],
    existing: [
      ["101", "普通人怎么用 Codex 参与一个真实项目", "已发布", "/tutorials/codex-real-project-guide/"],
      ["102", "凡人修AI项目协作流程：老张、小张、导师和 Codex 各负责什么", "已发布", "/tutorials/codex-project-collaboration/"]
    ]
  }
];

function renderCodexAutomationArticleList(track, baseRoot = "../../../") {
  const planned = track.articles
    .map(
      ([code, title, status]) => `<article><span>${escapeHtml(code)}</span><h3>${escapeHtml(title)}</h3><p>${escapeHtml(track.title)}</p><em>${escapeHtml(status)}</em></article>`
    )
    .join("");
  const existing = (track.existing || [])
    .map(
      ([code, title, status, href]) => `<a class="codex-existing-card" href="${escapeHtml(href.startsWith("/") ? href : `${baseRoot}${href}`)}"><span>${escapeHtml(code)}</span><h3>${escapeHtml(title)}</h3><p>${escapeHtml(track.title)}</p><em>${escapeHtml(status)}</em></a>`
    )
    .join("");
  return `${existing}${planned}`;
}

function renderCodexZonePage(baseRoot = "../../../") {
  const codexDemandTypes = [
    ["内容和文档", "文章草稿、资料整理、会议纪要、知识库目录，可以先让 Codex 生成可检查的第一版。"],
    ["页面和展示", "已有页面不舒服、入口不清楚、模块需要调整时，先把目标和范围说清楚。"],
    ["工具雏形", "小表单、小清单、小页面，不急着做复杂系统，先让 Codex 跑出静态 MVP。"],
    ["客户资料整理", "常见问题、回复话术、私域跟进表，可以让 Codex 先分类、合并和生成初稿。"],
    ["自媒体提效", "选题池、平台改写、发布检查、复盘表，可以先交给 Codex 做执行层。"],
    ["项目收口", "检查链接、构建结果、改动说明和验收清单，让 Codex 帮你把尾巴理顺。"]
  ];
  const codexOrder = [
    ["01", "先说清目标", "不要只说“帮我优化一下”，而要说清你想得到什么结果。"],
    ["02", "说明当前问题", "把哪里卡住、哪里不舒服、哪些内容不能动讲出来。"],
    ["03", "限定执行范围", "告诉 Codex 这次只处理哪个页面、文件、资料或任务。"],
    ["04", "先用拆解器生成任务", "把模糊需求整理成一段能复制给 Codex 的清楚提示词。"],
    ["05", "看结果再验收", "构建通过只是基础，最终还要看页面、内容和体验是否真的合适。"]
  ];
  const codexBoundaries = [
    ["项目方向", "Codex 可以帮你执行，但不能替你决定这个项目值不值得做。"],
    ["商业判断", "收入、成交、客户结果、市场需求，都不能直接交给 Codex 下结论。"],
    ["隐私和账号", "账号、密钥、客户资料、内部数据，不要随手丢给工具处理。"],
    ["大范围重构", "一次性改太多页面、文件或逻辑，很容易让风险失控。"]
  ];

  return layout({
    title: "Codex专区 | 凡人修AI",
    description: "凡人修AI Codex专区，定位为普通人的 AI 执行中心，帮助普通人把清楚需求交给 Codex 执行。",
    base: baseRoot,
    bodyClass: "codex-zone-page",
    canonicalUrl: `${site.origin}/tutorials/category/codex/`,
    keywords: ["Codex教程", "Codex专区", "AI项目实战", "普通人学Codex", "AI执行中心"],
    structuredData: [
      breadcrumbJsonLd([
        { name: "首页", url: `${site.origin}/` },
        { name: "AI教程", url: `${site.origin}/tutorials/` },
        { name: "Codex专区", url: `${site.origin}/tutorials/category/codex/` }
      ]),
      {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        name: "Codex专区",
        description: "普通人的 AI 执行中心，帮助普通人把清楚需求交给 Codex 执行。",
        url: `${site.origin}/tutorials/category/codex/`,
        isPartOf: { "@id": `${site.origin}/#website` }
      }
    ],
    body: `<section class="codex-hero section-pad" aria-labelledby="codex-title">
      <div class="codex-hero-inner">
        <p class="page-hero-eyebrow">AI Execution Center</p>
        <h1 id="codex-title">普通人的 AI 执行中心</h1>
        <p>不用一上来学编程，也不用到处找工具。先把内容、页面、资料、工具雏形和项目任务交给 Codex 执行，再由人判断方向和验收结果。</p>
        <p><strong>Codex 负责执行，人负责判断和验收。</strong></p>
        <div class="codex-hero-actions">
          <a class="btn btn-primary" href="/tools/ai-task-planner/">使用 AI需求任务拆解器</a>
          <a class="btn btn-secondary" href="/tutorials/codex-real-project-guide/">阅读 Codex 入门实战</a>
        </div>
      </div>
    </section>

    <section class="codex-section section-pad" aria-labelledby="codex-demands-title">
      <div class="codex-section-head">
        <span>What To Delegate</span>
        <h2 id="codex-demands-title">普通人哪些 AI 需求适合先交给 Codex</h2>
        <p>Codex 不是替你想方向，而是帮你把已经说清楚的需求落成文件、页面、内容、清单和工具雏形。适合交给它的，通常是执行层任务。</p>
      </div>
      <div class="codex-scenario-grid">${codexDemandTypes
        .map(([title, description]) => `<article class="codex-scenario-card"><h3>${escapeHtml(title)}</h3><p>${escapeHtml(description)}</p></article>`)
        .join("")}</div>
    </section>

    <section class="codex-section section-pad" aria-labelledby="codex-order-title">
      <div class="codex-section-head">
        <span>How To Use</span>
        <h2 id="codex-order-title">使用 Codex 的正确顺序</h2>
        <p>先判断，再执行；先限定边界，再让 Codex 动手。普通人用 Codex，最怕的不是不会写代码，而是需求太模糊、范围太大、验收太随意。</p>
      </div>
      <div class="codex-progress-grid">${codexOrder
        .map(([index, title, description]) => `<article><span>${escapeHtml(index)}</span><strong>${escapeHtml(title)}</strong><p>${escapeHtml(description)}</p></article>`)
        .join("")}</div>
    </section>

    <section class="codex-section section-pad" aria-labelledby="codex-boundaries-title">
      <div class="codex-section-head">
        <span>Boundaries</span>
        <h2 id="codex-boundaries-title">哪些事情不能直接甩给 Codex</h2>
        <p>Codex 可以承担很多执行工作，但不能替你负责。方向、边界、隐私、上线和提交，都需要人来判断。</p>
      </div>
      <div class="codex-card-grid">${codexBoundaries
        .map(([title, description]) => `<article><h3>${escapeHtml(title)}</h3><p>${escapeHtml(description)}</p></article>`)
        .join("")}</div>
    </section>

    <section class="codex-section section-pad" aria-labelledby="codex-planner-title">
      <div class="codex-section-head">
        <span>Task Planner</span>
        <h2 id="codex-planner-title">直接使用 AI需求任务拆解器</h2>
        <p>如果你现在只有一个模糊想法，先不要直接丢给 Codex。用拆解器把目标、范围、禁止内容和验收方式整理成一段清楚任务，再交给 Codex 执行。</p>
      </div>
      <div class="codex-split"><article><h3>适合先用它的情况</h3><p>你想写文章、整理资料、改页面、做小工具、检查链接、整理客户问题，但还说不清要让 Codex 具体做什么。</p></article><article><h3>它会帮你生成什么</h3><p>一段可以复制给 Codex 的任务提示词，加上风险提醒和人工验收清单。</p></article></div>
      <div class="codex-section-cta">
        <a class="btn btn-primary" href="/tools/ai-task-planner/">打开 AI需求任务拆解器</a>
      </div>
    </section>

    <section class="codex-section section-pad" aria-labelledby="codex-articles-title">
      <div class="codex-section-head">
        <span>Read Next</span>
        <h2 id="codex-articles-title">从 101 / 102 开始理解 Codex</h2>
        <p>先用这两篇理解基本协作方式：人怎么提需求、怎么限定边界、Codex 怎么执行、最后怎么验收。</p>
      </div>
      <div class="codex-article-grid">${(codexAutomationTracks.find((track) => track.slug === "project").existing || [])
        .map(
          ([code, title, status, href]) => `<a class="codex-article-card" href="${escapeHtml(href)}"><h3>${escapeHtml(title)}</h3><p>${escapeHtml(code)} · ${escapeHtml(status)} · 理解普通人如何把真实需求交给 Codex 执行。</p><span>开始阅读</span></a>`
        )
        .join("")}</div>
    </section>`
  });
}

function renderCodexRoadmapPage() {
  const baseRoot = "../../../../";
  return layout({
    title: "Codex自动化学习路线图 | 凡人修AI",
    description: "凡人修AI Codex自动化学习路线图，覆盖入门、办公、自媒体、销售私域和项目实战。",
    base: baseRoot,
    bodyClass: "codex-zone-page codex-roadmap-page",
    canonicalUrl: `${site.origin}/tutorials/category/codex/roadmap/`,
    keywords: ["Codex学习路线", "Codex自动化", "AI办公自动化", "AI项目实战"],
    structuredData: [
      breadcrumbJsonLd([
        { name: "首页", url: `${site.origin}/` },
        { name: "AI教程", url: `${site.origin}/tutorials/` },
        { name: "Codex专区", url: `${site.origin}/tutorials/category/codex/` },
        { name: "Codex自动化学习路线图", url: `${site.origin}/tutorials/category/codex/roadmap/` }
      ])
    ],
    body: `<section class="codex-hero section-pad" aria-labelledby="codex-roadmap-title">
      <div class="codex-hero-inner">
        <p class="page-hero-eyebrow">Codex Automation Roadmap</p>
        <h1 id="codex-roadmap-title">Codex 自动化学习路线图</h1>
        <p>这条路线不把普通人带进复杂代码细节，而是先教你把 Codex 用成自己的 AI 员工：处理文档、表格、内容、客户资料和项目任务。</p>
        <p><strong>从一个小任务开始，让 Codex 执行，人来验收。</strong></p>
        <div class="codex-hero-actions">
          <a class="btn btn-primary" href="#automation-tracks">查看五个目录</a>
          <a class="btn btn-secondary" href="${baseRoot}tutorials/category/codex/">回到 Codex 专区</a>
        </div>
      </div>
    </section>

    <section class="codex-section section-pad" id="automation-tracks" aria-labelledby="automation-tracks-title">
      <div class="codex-section-head">
        <span>Tracks</span>
        <h2 id="automation-tracks-title">五个自动化实战目录</h2>
        <p>先从 Basic 补齐入门最后一公里，再根据自己的工作场景进入办公、自媒体、销售私域或 AI 副业项目。</p>
      </div>
      <div class="codex-track-grid">${codexAutomationTracks
        .map(
          (track) => `<a class="codex-track-card" href="${baseRoot}tutorials/category/codex/${track.slug}/"><span>codex/${escapeHtml(track.slug)}</span><h3>${escapeHtml(track.title)}</h3><p>${escapeHtml(track.scenario)}</p></a>`
        )
        .join("")}</div>
    </section>

    <section class="codex-section section-pad" aria-labelledby="automation-articles-title">
      <div class="codex-section-head">
        <span>First Batch</span>
        <h2 id="automation-articles-title">首批文章规划</h2>
        <p>这里展示每个目录下的第一批教程规划。101、102 继续保留，并归到 AI副业/项目实战。</p>
      </div>
      <div class="codex-track-list">${codexAutomationTracks
        .map(
          (track) => `<article><div class="codex-track-list-head"><span>codex/${escapeHtml(track.slug)}</span><h3>${escapeHtml(track.title)}</h3></div><div class="codex-planned-list">${renderCodexAutomationArticleList(track, baseRoot)}</div></article>`
        )
        .join("")}</div>
    </section>`
  });
}

function renderCodexTrackPage(track) {
  const baseRoot = "../../../../";
  return layout({
    title: `${track.title} | Codex专区 | 凡人修AI`,
    description: `${track.title}目录，属于凡人修AI Codex普通人自动化实战教程。`,
    base: baseRoot,
    bodyClass: "codex-zone-page codex-track-page",
    canonicalUrl: `${site.origin}/tutorials/category/codex/${track.slug}/`,
    keywords: [track.title, "Codex教程", "Codex自动化", "普通人学AI"],
    structuredData: [
      breadcrumbJsonLd([
        { name: "首页", url: `${site.origin}/` },
        { name: "AI教程", url: `${site.origin}/tutorials/` },
        { name: "Codex专区", url: `${site.origin}/tutorials/category/codex/` },
        { name: track.title, url: `${site.origin}/tutorials/category/codex/${track.slug}/` }
      ])
    ],
    body: `<section class="codex-hero section-pad" aria-labelledby="codex-track-title">
      <div class="codex-hero-inner">
        <p class="page-hero-eyebrow">codex/${escapeHtml(track.slug)}</p>
        <h1 id="codex-track-title">${escapeHtml(track.title)}</h1>
        <p>${escapeHtml(track.scenario)}</p>
        <p><strong>这些条目是首批教程规划，后续会逐篇补成可以照着练的自动化实战文章。</strong></p>
        <div class="codex-hero-actions">
          <a class="btn btn-primary" href="${baseRoot}tutorials/category/codex/roadmap/">查看完整路线图</a>
          <a class="btn btn-secondary" href="${baseRoot}tutorials/category/codex/">回到 Codex 专区</a>
        </div>
      </div>
    </section>

    <section class="codex-section section-pad" aria-labelledby="codex-track-list-title">
      <div class="codex-section-head">
        <span>${escapeHtml(track.label)}</span>
        <h2 id="codex-track-list-title">首批文章目录</h2>
        <p>先把目录搭好，后续再补正文。当前已经发布的 101、102 会继续保留在项目实战目录里。</p>
      </div>
      <div class="codex-planned-list codex-planned-list--wide">${renderCodexAutomationArticleList(track, baseRoot)}</div>
    </section>`
  });
}

function renderAiTaskPlannerPage() {
  const taskTypes = [
    "写文章或内容",
    "整理资料或文档",
    "生成网页或落地页",
    "修改已有页面",
    "做一个小工具雏形",
    "拆项目执行计划",
    "检查文件或链接问题",
    "其他"
  ];

  return layout({
    title: "AI需求任务拆解器 | 凡人修AI",
    description: "把模糊的 AI 需求整理成 Codex 能执行、能检查、能验收的清楚任务。",
    base: "../../",
    bodyClass: "tool-page ai-task-planner-page",
    canonicalUrl: `${site.origin}/tools/ai-task-planner/`,
    keywords: ["AI需求拆解", "Codex提示词", "AI任务拆解", "AI项目执行"],
    structuredData: [
      breadcrumbJsonLd([
        { name: "首页", url: `${site.origin}/` },
        { name: "AI需求任务拆解器", url: `${site.origin}/tools/ai-task-planner/` }
      ]),
      {
        "@context": "https://schema.org",
        "@type": "WebApplication",
        name: "AI需求任务拆解器",
        description: "把模糊的 AI 需求整理成 Codex 能执行、能检查、能验收的清楚任务。",
        url: `${site.origin}/tools/ai-task-planner/`,
        applicationCategory: "ProductivityApplication",
        operatingSystem: "Web"
      }
    ],
    body: `<section class="tool-hero section-pad" aria-labelledby="task-planner-title">
      <div class="tool-hero-inner">
        <p class="page-hero-eyebrow">AI Task Planner</p>
        <h1 id="task-planner-title">把你的 AI 需求，拆成 Codex 能执行的任务</h1>
        <p>很多普通人不是没有想法，而是不知道怎么把想法说成一个 AI 可以执行、可以检查、可以验收的任务。这个工具帮你先把目标、范围、边界和验收方式说清楚，再交给 Codex 执行。</p>
        <p><strong>Codex 负责执行，人负责判断和验收。</strong></p>
        <div class="codex-hero-actions">
          <a class="btn btn-primary" href="#task-planner-form">开始拆解任务</a>
        </div>
      </div>
    </section>

    <section class="tool-shell section-pad">
      <section class="tool-panel" id="task-planner-form" aria-labelledby="task-form-title">
        <div class="tool-section-head">
          <span>Step 01</span>
          <h2 id="task-form-title">先把你的需求说清楚</h2>
          <p>可以先粗略填写。没写的地方，生成结果会提醒你后续补充。</p>
        </div>
        <form class="task-planner-form" data-ai-task-planner-form>
          <label>
            <span>我想完成什么？</span>
            <textarea name="goal" rows="3" placeholder="例如：我想把一篇公众号文章整理成网页版本 / 我想修改网站首页的入口 / 我想做一个小工具雏形"></textarea>
          </label>
          <label>
            <span>这是哪类任务？</span>
            <select name="type">
              ${taskTypes.map((type) => `<option value="${escapeHtml(type)}">${escapeHtml(type)}</option>`).join("")}
            </select>
          </label>
          <label>
            <span>我现在卡在哪里？</span>
            <textarea name="stuck" rows="3" placeholder="例如：我不知道怎么组织结构 / 页面效果不舒服 / 不知道该让 Codex 改哪里 / 怕它乱改"></textarea>
          </label>
          <label>
            <span>我希望最终得到什么结果？</span>
            <textarea name="result" rows="3" placeholder="例如：生成一个清楚的页面结构 / 输出一份可复制的文章文件 / 修改指定页面但不影响其他页面"></textarea>
          </label>
          <label>
            <span>这次允许 AI 处理什么？</span>
            <textarea name="allowed" rows="3" placeholder="例如：只允许处理这个页面 / 只允许整理这份资料 / 只允许生成新文件，不改已有内容"></textarea>
          </label>
          <label>
            <span>这次不能碰什么？</span>
            <textarea name="forbidden" rows="3" placeholder="例如：不要改已有文章标题 / 不要修改首页 / 不要处理账号、密钥、客户隐私资料"></textarea>
          </label>
          <label>
            <span>完成后我怎么验收？</span>
            <textarea name="acceptance" rows="3" placeholder="例如：页面能正常打开 / 文案逻辑清楚 / 链接可点击 / 移动端不横向滚动 / 我最终人工确认"></textarea>
          </label>
          <button class="btn btn-primary task-planner-submit" type="submit">生成 Codex 任务</button>
        </form>
      </section>

      <section class="tool-output" data-task-planner-output hidden aria-live="polite">
        <div class="tool-section-head">
          <span>Step 02</span>
          <h2>生成结果</h2>
          <p>复制第一块内容给 Codex，再用风险提醒和验收清单守住边界。</p>
        </div>
        <article class="tool-result-card">
          <h3>给 Codex 的任务提示词</h3>
          <div class="copy-block">
            <div class="copy-block-header">
              <span>可复制任务提示词</span>
              <button class="copy-button" type="button" data-copy-button data-copy-success-label="已复制，可以交给 Codex 了。" aria-label="复制给 Codex">复制给 Codex</button>
            </div>
            <pre><code data-task-planner-prompt></code></pre>
          </div>
        </article>
        <div class="tool-output-grid">
          <article class="tool-result-card">
            <h3>风险提醒</h3>
            <ul>
              <li>不要把项目方向完全交给 Codex</li>
              <li>不要一次让 Codex 改太大范围</li>
              <li>不要提交未经人工检查的结果</li>
              <li>不要输入账号、密钥、客户资料等敏感信息</li>
              <li>构建通过不等于体验通过，最终还要人工验收</li>
            </ul>
          </article>
          <article class="tool-result-card">
            <h3>人工验收清单</h3>
            <ul>
              <li>结果是否符合最初目标</li>
              <li>是否只处理了允许范围</li>
              <li>是否碰了禁止内容</li>
              <li>页面或文件是否能正常使用</li>
              <li>移动端是否正常</li>
              <li>是否需要继续修改、提交或回退</li>
            </ul>
          </article>
        </div>
      </section>
    </section>

    <section class="tutorial-next-actions tool-next-actions section-pad" aria-label="下一步行动">
      <h3>继续让需求变清楚</h3>
      <div>
        <a class="tutorial-next-card" href="/tutorials/category/codex/"><strong>回到 Codex 专区</strong><span>继续理解普通人的 AI 执行中心。</span></a>
        <a class="tutorial-next-card" href="/tutorials/codex-real-project-guide/"><strong>阅读：普通人怎么用 Codex 参与一个真实项目</strong><span>先学会把一个具体问题交给 Codex。</span></a>
        <a class="tutorial-next-card" href="/tutorials/map/"><strong>查看内容地图</strong><span>回到完整 AI 修炼路径。</span></a>
      </div>
    </section>`
  });
}

function renderExecuteCenterPage() {
  const target = `${site.origin}/tutorials/category/codex/`;
  return layout({
    title: "正在前往 Codex专区 | 凡人修AI",
    description: "AI执行中心已并入 Codex专区。",
    base: "../",
    extraHead: `<meta name="robots" content="noindex,follow" />
    <meta http-equiv="refresh" content="0; url=/tutorials/category/codex/" />`,
    bodyClass: "execute-redirect-page codex-zone-page",
    canonicalUrl: target,
    body: `<section class="codex-hero execute-hero section-pad" aria-labelledby="execute-title">
      <div class="codex-hero-inner">
        <p class="page-hero-eyebrow">AI Execution Center</p>
        <h1 id="execute-title">正在前往 Codex专区</h1>
        <p>普通人的 AI 执行中心已经并入 Codex专区。旧入口会自动跳转到新的统一入口。</p>
        <p><strong>Codex 负责执行，人负责判断和验收。</strong></p>
        <div class="codex-hero-actions">
          <a class="btn btn-primary" href="/tutorials/category/codex/">进入 Codex专区</a>
          <a class="btn btn-secondary" href="/tools/ai-task-planner/">使用 AI需求任务拆解器</a>
        </div>
      </div>
    </section>`
  });
}

function renderCategoryPage(slug, pageArticles, totalArticles, current = 1, total = 1, baseRoot = "../../../") {
  if (slug === "codex") {
    return renderCodexZonePage(baseRoot);
  }

  const name = categories[slug] || slug;
  const cards = pageArticles.map((article) => renderArticleCard(article, baseRoot)).join("\n");
  const canonicalUrl = categoryPageUrl(slug, current);
  const pageTitle = current === 1 ? `${name} | 凡人修AI` : `${name}第${current}页 | 凡人修AI`;
  const pageDescription =
    current === 1
      ? `${name}分类文章，来自凡人修AI教程系统。`
      : `${name}分类文章第${current}页，来自凡人修AI教程系统。`;
  return layout({
    title: pageTitle,
    description: pageDescription,
    base: baseRoot,
    canonicalUrl,
    prevUrl: current > 1 ? categoryPageUrl(slug, current - 1) : "",
    nextUrl: current < total ? categoryPageUrl(slug, current + 1) : "",
    keywords: [name, "凡人修AI", "AI教程", "普通人学AI"],
    structuredData: [
      itemListJsonLd(`${name}教程列表`, pageArticles, (current - 1) * pageSize),
      breadcrumbJsonLd([
        { name: "首页", url: `${site.origin}/` },
        { name: "AI教程", url: `${site.origin}/tutorials/` },
        { name, url: `${site.origin}/tutorials/category/${slug}/` }
      ])
    ],
    body: `<section class="tutorial-hero section-pad compact">
      <p class="eyebrow">Category</p>
      <h1>${escapeHtml(name)}</h1>
      <p>共 ${totalArticles} 篇文章，持续更新。</p>
    </section>
    <section class="section-pad">
      <div class="tutorial-list wide">${cards || "<p>这个分类还没有文章。</p>"}</div>
      ${pagination(current, total, (page) =>
        page === 1 ? `${baseRoot}tutorials/category/${slug}/` : `${baseRoot}tutorials/category/${slug}/page/${page}/`
      )}
    </section>`
  });
}

function getRelatedArticles(article, articles) {
  const related = [];
  const used = new Set([article.slug]);

  article.relatedSlugs.forEach((slug) => {
    const item = articles.find((candidate) => candidate.slug === slug);
    if (item && !used.has(item.slug)) {
      related.push(item);
      used.add(item.slug);
    }
  });

  articles
    .filter((candidate) => candidate.category === article.category && !used.has(candidate.slug))
    .forEach((item) => {
      if (related.length < 3) {
        related.push(item);
        used.add(item.slug);
      }
    });

  articles
    .filter((candidate) => !used.has(candidate.slug))
    .forEach((item) => {
      if (related.length < 3) {
        related.push(item);
        used.add(item.slug);
      }
    });

  return related;
}

const contentMapLevels = [
  { level: "新手村", sections: ["AI基础认知", "AI工具入门"] },
  { level: "炼气期", sections: ["Prompt与工作流", "AI办公提效", "AI写作与内容创作"] },
  { level: "结丹期", sections: ["AI自媒体与个人IP", "AI商业与变现"] }
];

const contentMapPathCards = [
  ["01", "新手村", "建立认知，完成工具入门"],
  ["02", "炼气期", "练习 Prompt、办公和内容创作"],
  ["03", "结丹期", "进入个人 IP、商业变现和项目避坑"]
];

function getContentMapLevel(article) {
  const matched = contentMapLevels.find((group) => group.sections.includes(article.section));
  return matched ? matched.level : article.level;
}

function renderContentMapPage(articles) {
  const levels = contentMapLevels.map((group) => group.level);
  const grouped = levels
    .map((level) => {
      const levelArticles = articles.filter((article) => getContentMapLevel(article) === level && article.order);
      const sections = [...new Set(levelArticles.map((article) => article.section))];
      return { level, sections, articles: levelArticles };
    })
    .filter((group) => group.articles.length);

  const body = `<section class="content-map-hero page-hero page-hero--learning section-pad">
      <div class="page-hero-main">
        <p class="page-hero-eyebrow">Content Map</p>
        <h1 class="page-hero-title">凡人修AI内容地图</h1>
        <p class="page-hero-description">从新手村到结丹期，按路径看懂 AI、练会工具、用进真实任务。</p>
      </div>
    </section>
    <section class="map-path-band section-pad" aria-label="修炼路径概览">
      <div class="map-path-overview">
        ${contentMapPathCards
          .map(
            ([order, title, description]) => `<div>
          <span>${order}</span>
          <strong>${title}</strong>
          <p>${description}</p>
        </div>`
          )
          .join("")}
      </div>
    </section>
    <section class="content-map-shell section-pad">
      ${grouped
        .map(
          (group) => `<article class="map-level">
        <header>
          ${renderLevelBadge(group.level)}
          <h2>${escapeHtml(group.level)}</h2>
          <p>${group.articles.length} 篇教程</p>
        </header>
        ${group.sections
          .map((section) => {
            const items = group.articles.filter((article) => article.section === section);
            return `<div class="map-section">
            <h3>${escapeHtml(section)}</h3>
            <ol>
              ${items
                .map(
                  (article) => {
                    const statusLabel = article.status === "published" ? "已发布" : article.status === "writing" ? "撰写中" : "规划中";
                    const inner = `<span>${String(article.order).padStart(2, "0")}</span>
                  <strong>${escapeHtml(article.title)}</strong>
                  <em>${statusLabel}</em>`;
                    return article.status === "published"
                      ? `<li><a href="../${article.slug}/index.html">${inner}</a></li>`
                      : `<li><div class="map-disabled">${inner}</div></li>`;
                  }
                )
                .join("")}
            </ol>
          </div>`;
          })
          .join("")}
      </article>`
        )
        .join("")}
    </section>`;

  return layout({
    title: "内容地图 V1.0 | 凡人修AI",
    description: "凡人修AI内容地图 V1.0，覆盖新手村、炼气期、结丹期三段AI修炼路径。",
    base: "../../",
    canonicalUrl: `${site.origin}/tutorials/map/`,
    keywords: ["凡人修AI内容地图", "AI学习路线", "普通人学AI", "AI教程"],
    structuredData: [
      itemListJsonLd("凡人修AI内容地图", articles.filter((article) => article.status === "published" && article.order), 0),
      breadcrumbJsonLd([
        { name: "首页", url: `${site.origin}/` },
        { name: "AI教程", url: `${site.origin}/tutorials/` },
        { name: "内容地图", url: `${site.origin}/tutorials/map/` }
      ])
    ],
    body
  });
}

function writeSitemap(articles) {
  const published = articles.filter((article) => article.status === "published");
  const siteLastmod = latestDate(published);
  const urls = [
    { loc: `${site.origin}/`, lastmod: siteLastmod, changefreq: "daily", priority: "1.0" },
    { loc: `${site.origin}/tutorials/`, lastmod: siteLastmod, changefreq: "daily", priority: "0.9" },
    { loc: `${site.origin}/tutorials/map/`, lastmod: siteLastmod, changefreq: "weekly", priority: "0.9" },
    { loc: `${site.origin}/about/`, lastmod: siteLastmod, changefreq: "monthly", priority: "0.6" },
    { loc: `${site.origin}/community/`, lastmod: siteLastmod, changefreq: "weekly", priority: "0.7" },
    { loc: `${site.origin}/tools/ai-task-planner/`, lastmod: siteLastmod, changefreq: "weekly", priority: "0.8" }
  ];

  paginate(published).forEach((_, index) => {
    const page = index + 1;
    if (page > 1) {
      urls.push({ loc: tutorialPageUrl(page), lastmod: siteLastmod, changefreq: "weekly", priority: "0.6" });
    }
  });

  Object.keys(categories).forEach((slug) => {
    const categoryArticles = published.filter((article) => article.category === slug);
    if (!categoryArticles.length && slug !== "codex") return;
    const categoryLastmod = latestDate(categoryArticles, siteLastmod);
    paginate(categoryArticles).forEach((_, index) => {
      const page = index + 1;
      urls.push({
        loc: categoryPageUrl(slug, page),
        lastmod: categoryLastmod,
        changefreq: "weekly",
        priority: page === 1 ? "0.8" : "0.5"
      });
    });
  });

  urls.push(
    { loc: `${site.origin}/tutorials/category/codex/roadmap/`, lastmod: siteLastmod, changefreq: "weekly", priority: "0.7" },
    ...codexAutomationTracks.map((track) => ({
      loc: `${site.origin}/tutorials/category/codex/${track.slug}/`,
      lastmod: siteLastmod,
      changefreq: "weekly",
      priority: "0.6"
    })),
    ...published.map((article) => ({
      loc: `${site.origin}/tutorials/${article.slug}/`,
      lastmod: article.updated || article.date,
      changefreq: "monthly",
      priority: "0.75"
    }))
  );

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (url) => `  <url>
    <loc>${xmlEscape(url.loc)}</loc>
    <lastmod>${xmlEscape(url.lastmod)}</lastmod>
    <changefreq>${xmlEscape(url.changefreq)}</changefreq>
    <priority>${xmlEscape(url.priority)}</priority>
  </url>`
  )
  .join("\n")}
</urlset>`;
  fs.writeFileSync(path.join(root, "sitemap.xml"), xml);
}

function writeRobots() {
  const allowSections = allowedSearchCrawlers.map((crawler) =>
    [`User-agent: ${crawler}`, "Allow: /", ...protectedRobotPaths.map((item) => `Disallow: ${item}`)].join("\n")
  );
  const blockSections = blockedRobotsCrawlers.map((crawler) => [`User-agent: ${crawler}`, "Disallow: /"].join("\n"));
  const defaultSection = [
    "User-agent: *",
    "Allow: /",
    ...protectedRobotPaths.map((item) => `Disallow: ${item}`)
  ].join("\n");

  fs.writeFileSync(
    path.join(root, "robots.txt"),
    `${[...allowSections, ...blockSections, defaultSection].join("\n\n")}\n\nSitemap: ${site.origin}/sitemap.xml\n`
  );
}

function writeSearchIndex(articles) {
  const index = articles
    .filter((article) => article.status === "published")
    .map((article) => ({
      title: article.title,
      description: article.description,
      category: article.categoryName,
      level: article.level,
      section: article.section,
      order: article.order,
      status: article.status,
      tags: article.tags,
      url: `/tutorials/${article.slug}/`
    }));
  fs.writeFileSync(path.join(outputDir, "search-index.json"), JSON.stringify(index, null, 2));
}

function visibleTextFromHtml(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/g, " ")
    .replace(/<style[\s\S]*?<\/style>/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function validatePublishedArticles(articles) {
  const forbiddenVisible = [/D:\//, /\/Users\//, /\/var\/www\//, /\/tutorials\/[\w-]+\//, /\/community\//, /占位图/, /待完善/, /图片待生成/];

  articles
    .filter((article) => article.status === "published")
    .forEach((article) => {
      const screenshotCount = (article.html.match(/<figure class="article-figure">/g) || []).length;
      const visualModuleCount = (article.html.match(/<section class="tutorial-visual-card/g) || []).length;
      const copyBlockCount = (article.html.match(/<div class="copy-block">/g) || []).length;
      const structuredBlockCount = screenshotCount + visualModuleCount + copyBlockCount;
      if (structuredBlockCount < 3) {
        throw new Error(`Published article "${article.slug}" must include at least 3 CSS visual modules, copy blocks, or necessary screenshots. Found ${structuredBlockCount}.`);
      }

      const visibleText = visibleTextFromHtml(article.html);
      const matched = forbiddenVisible.find((pattern) => pattern.test(visibleText));
      if (matched) {
        throw new Error(`Published article "${article.slug}" contains forbidden visible text matching ${matched}.`);
      }
    });
}

function writeRootPages(publicArticles) {
  fs.writeFileSync(path.join(root, "index.html"), renderHomePage(publicArticles));
  fs.writeFileSync(path.join(root, "404.html"), render404Page());

  const aboutDir = path.join(root, "about");
  const communityDir = path.join(root, "community");
  ensureDir(aboutDir);
  ensureDir(communityDir);
  fs.writeFileSync(path.join(aboutDir, "index.html"), renderAboutPage());
  fs.writeFileSync(path.join(communityDir, "index.html"), renderCommunityPage());
}

function writeToolPages() {
  cleanToolsDir();
  const plannerDir = path.join(toolsOutputDir, "ai-task-planner");
  ensureDir(plannerDir);
  fs.writeFileSync(path.join(plannerDir, "index.html"), renderAiTaskPlannerPage());
}

function writeExecutePage() {
  ensureDir(executeOutputDir);
  fs.writeFileSync(path.join(executeOutputDir, "index.html"), renderExecuteCenterPage());
}

function build() {
  const articles = readArticles();
  const publicArticles = articles.filter((article) => article.status === "published");
  validatePublishedArticles(articles);

  writeRootPages(publicArticles);
  writeToolPages();
  writeExecutePage();
  cleanGeneratedDir();

  const tutorialPages = paginate(publicArticles);
  tutorialPages.forEach((pageArticles, index) => {
    const page = index + 1;
    const dir = page === 1 ? outputDir : path.join(outputDir, "page", String(page));
    ensureDir(dir);
    const baseRoot = page === 1 ? "../" : "../../../";
    fs.writeFileSync(path.join(dir, "index.html"), renderTutorialIndex(pageArticles, page, tutorialPages.length, baseRoot, publicArticles.length));
  });

  Object.keys(categories).forEach((slug) => {
    const categoryArticles = publicArticles.filter((article) => article.category === slug);
    const categoryPages = paginate(categoryArticles);
    categoryPages.forEach((pageArticles, index) => {
      const page = index + 1;
      const dir = page === 1 ? path.join(outputDir, "category", slug) : path.join(outputDir, "category", slug, "page", String(page));
      ensureDir(dir);
      const baseRoot = page === 1 ? "../../../" : "../../../../../";
      fs.writeFileSync(path.join(dir, "index.html"), renderCategoryPage(slug, pageArticles, categoryArticles.length, page, categoryPages.length, baseRoot));
    });
  });

  const codexRoadmapDir = path.join(outputDir, "category", "codex", "roadmap");
  ensureDir(codexRoadmapDir);
  fs.writeFileSync(path.join(codexRoadmapDir, "index.html"), renderCodexRoadmapPage());

  codexAutomationTracks.forEach((track) => {
    const codexTrackDir = path.join(outputDir, "category", "codex", track.slug);
    ensureDir(codexTrackDir);
    fs.writeFileSync(path.join(codexTrackDir, "index.html"), renderCodexTrackPage(track));
  });

  const mapDir = path.join(outputDir, "map");
  ensureDir(mapDir);
  fs.writeFileSync(path.join(mapDir, "index.html"), renderContentMapPage(articles));

  articles.forEach((article) => {
    const relatedSource = article.status === "published" ? publicArticles : articles;
    const dir = path.join(outputDir, article.slug);
    ensureDir(dir);
    fs.writeFileSync(path.join(dir, "index.html"), renderArticlePage(article, getRelatedArticles(article, relatedSource)));
  });

  writeSearchIndex(articles);
  writeSitemap(articles);
  writeRobots();
  console.log(`Generated homepage, ${publicArticles.length} public articles, and ${articles.length - publicArticles.length} internal drafts.`);
}

build();
