const fs = require("node:fs");
const path = require("node:path");
const {
  site,
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
  return layout({
    title: "AI教程 | 凡人修AI",
    description: "凡人修AI教程系统，覆盖AI入门、Prompt工作流、Codex实战、AI工具箱和AI案例。",
    base: baseRoot,
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

function renderCodexZonePage(baseRoot = "../../../") {
  const requestTemplate = `请帮我处理一个具体的 AI 执行任务。

我的目标是：
我现在卡住的问题是：
我希望 Codex 帮我执行的是：
最终我希望得到的结果是：

这次允许你处理的范围是：
这次不要修改的内容是：
需要特别保留的内容是：

完成后请告诉我：

1. 你做了什么
2. 修改了哪些内容
3. 是否影响其他页面或文件
4. 是否有风险
5. 我应该如何验收

要求：

不要擅自扩大修改范围。
不要替我决定项目方向。
不要处理我没有授权的隐私、账号、密钥或客户资料。
如果发现风险，请先说明，不要直接继续。`;

  const executionCards = [
    ["内容执行", "写文章草稿、整理资料、生成结构化内容、更新内容文件。"],
    ["页面执行", "修改网页、调整模块、修复链接、优化展示效果。"],
    ["项目执行", "拆任务、改文件、跑检查、输出改动说明。"],
    ["工具雏形", "先做一个小功能、小页面、小工具原型，再由人验收。"]
  ];
  const canDoItems = [
    ["写一篇结构清楚的文章", "让 Codex 先把结构和初稿跑起来，人再判断观点和表达。"],
    ["整理一份资料或文档", "把散乱信息归类、提炼、转成更容易阅读的文档。"],
    ["生成一个网页或落地页", "先做出可查看的页面雏形，再由人检查定位和体验。"],
    ["修改一个已有页面", "针对一个明确问题调整模块、文案、链接或展示效果。"],
    ["做一个小工具雏形", "先把核心输入、输出和页面流程做出来，不急着做复杂系统。"],
    ["整理一个知识库目录", "把已有内容分组、排序，形成可继续补充的知识结构。"],
    ["拆一个项目执行计划", "把一个模糊目标拆成步骤、边界、检查点和下一步。"],
    ["检查一批文件或链接问题", "让 Codex 先找出异常，再由人判断哪些需要处理。"]
  ];
  const cannotItems = [
    "项目方向判断",
    "商业模式判断",
    "用户真实需求判断",
    "未经确认的上线发布",
    "涉及隐私、账号、密钥、客户资料的内容",
    "一次性大范围重构"
  ];
  const flowItems = [
    ["先说清目标", "先说明你想得到什么结果，不要只说“帮我优化一下”。"],
    ["再说清当前问题", "告诉 Codex 你卡在哪里，问题出现在哪个页面、文件或任务里。"],
    ["限定允许修改范围", "让执行范围变小，方便回看和验收。"],
    ["明确不能碰的内容", "保护正文、定位、隐私、账号和其他不该动的资产。"],
    ["让 Codex 执行", "把已经说清楚的需求交给 Codex 跑起来。"],
    ["看结果和页面体验", "不要只看输出说明，要回到真实页面或文件里检查。"],
    ["决定是否继续、提交或回退", "最后由人判断这个结果是否符合方向和边界。"]
  ];
  const articleItems = [
    [
      "普通人怎么用 Codex 参与一个真实项目",
      "先学会把一个具体问题说清楚，再让 Codex 执行，并由人完成验收。",
      `${baseRoot}tutorials/codex-real-project-guide/`
    ],
    [
      "凡人修AI项目协作流程：老张、小张、导师和 Codex 各负责什么",
      "看清项目负责人、执行伙伴、导师和 Codex 的分工，避免把方向判断完全交给工具。",
      `${baseRoot}tutorials/codex-project-collaboration/`
    ]
  ];

  return layout({
    title: "Codex专区 | 凡人修AI",
    description: "凡人修AI Codex专区，定位为普通人的 AI 执行中心，帮助普通人把内容、页面、资料、工具雏形和项目任务交给 Codex 执行。",
    base: baseRoot,
    bodyClass: "codex-zone-page",
    canonicalUrl: `${site.origin}/tutorials/category/codex/`,
    body: `<section class="codex-hero section-pad" aria-labelledby="codex-title">
      <div class="codex-hero-inner">
        <p class="page-hero-eyebrow">AI Execution Center</p>
        <h1 id="codex-title">普通人的 AI 执行中心</h1>
        <p>不用一上来学编程，也不用到处找工具。先学会把内容、页面、资料、工具雏形和项目任务交给 Codex 执行，再由人判断方向和验收结果。</p>
        <p><strong>Codex 负责执行，人负责判断。</strong></p>
        <div class="codex-hero-actions">
          <a class="btn btn-primary" href="#codex-can-do">查看哪些需求适合交给 Codex</a>
          <a class="btn btn-secondary" href="#codex-request-template">复制一段清楚需求</a>
        </div>
      </div>
    </section>

    <section class="codex-section section-pad" aria-labelledby="codex-role-title">
      <div class="codex-section-head">
        <span>Execution Layer</span>
        <h2 id="codex-role-title">Codex 不是编程炫技工具，而是普通人的 AI 执行层</h2>
        <p>普通人最常见的问题，不是没有想法，而是不知道怎么把想法落到页面、文件、资料和项目里。Codex 的价值，是把已经说清楚的需求，变成可以修改、可以保存、可以检查的结果。</p>
      </div>
      <div class="codex-card-grid">${executionCards
        .map(([title, description]) => `<article><h3>${escapeHtml(title)}</h3><p>${escapeHtml(description)}</p></article>`)
        .join("")}</div>
    </section>

    <section class="codex-section section-pad" id="codex-can-do" aria-labelledby="codex-can-do-title">
      <div class="codex-section-head">
        <span>Scenarios</span>
        <h2 id="codex-can-do-title">普通人哪些 AI 需求，可以先交给 Codex？</h2>
        <p>很多项目型 AI 需求，都可以先从 Codex 开始。不是让 Codex 替你判断，而是让 Codex 先把执行部分跑起来。</p>
      </div>
      <div class="codex-case-grid">${canDoItems
        .map(([title, description]) => `<article><h3>${escapeHtml(title)}</h3><p>${escapeHtml(description)}</p></article>`)
        .join("")}</div>
    </section>

    <section class="codex-section section-pad" aria-labelledby="codex-boundary-title">
      <div class="codex-section-head">
        <span>Boundary</span>
        <h2 id="codex-boundary-title">哪些事情不能直接甩给 Codex？</h2>
        <p>Codex 可以承担执行，但不能替你负责。方向、边界、隐私和上线判断，仍然要由人来掌握。</p>
      </div>
      <div class="codex-split">
        <article><h3>不要直接交出去</h3><ul>${cannotItems.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul></article>
        <article><h3>更稳的做法</h3><p>先把目标、范围和风险说清楚。涉及隐私、账号、密钥、客户资料和大范围改动时，先停下来判断，再决定是否让 Codex 执行。</p></article>
      </div>
    </section>

    <section class="codex-section section-pad" aria-labelledby="codex-order-title">
      <div class="codex-section-head">
        <span>Order</span>
        <h2 id="codex-order-title">普通人使用 Codex 的正确顺序</h2>
        <p>先判断，再执行；先限定边界，再让 Codex 动手。</p>
      </div>
      <ol class="codex-flow">${flowItems
        .map(
          ([title, description], index) => `<li><span>${String(index + 1).padStart(2, "0")}</span><div><h3>${escapeHtml(title)}</h3><p>${escapeHtml(description)}</p></div></li>`
        )
        .join("")}</ol>
    </section>

    <section class="codex-section section-pad" id="codex-request-template" aria-labelledby="codex-template-title">
      <div class="codex-section-head">
        <span>Template</span>
        <h2 id="codex-template-title">直接复制这段，给 Codex 一个清楚需求</h2>
        <p>这个模板可以直接复制给 Codex。提示词式表达只放在这里，正文里仍然先讲清方向和边界。</p>
      </div>
      ${renderStaticCopyBlock("可复制请求模板", requestTemplate)}
    </section>

    <section class="codex-section section-pad" aria-labelledby="codex-articles-title">
      <div class="codex-section-head">
        <span>Read First</span>
        <h2 id="codex-articles-title">从这两篇开始理解 Codex</h2>
        <p>101 和 102 是 Codex 专区的基础阅读入口。先学会说清需求，再看懂人和 Codex 如何分工。</p>
      </div>
      <div class="codex-article-grid">${articleItems
        .map(
          ([title, description, href]) => `<a class="codex-article-card" href="${escapeHtml(href)}"><h3>${escapeHtml(title)}</h3><p>${escapeHtml(description)}</p><span>开始阅读</span></a>`
        )
        .join("")}</div>
    </section>

    <section class="tutorial-next-actions codex-next-actions section-pad" aria-label="下一步行动">
      <h3>先把一个真实需求交给 Codex</h3>
      <p>不用一开始就做大项目。先选一个小任务：一篇文章、一个页面、一个资料整理、一个工具雏形，练会说清目标、限定边界、查看结果。</p>
      <div>
        <a class="tutorial-next-card" href="#codex-request-template"><strong>复制需求模板</strong><span>先把一个执行任务说清楚。</span></a>
        <a class="tutorial-next-card" href="/tutorials/codex-real-project-guide/"><strong>阅读 Codex 入门实战</strong><span>从一个真实项目小问题开始练。</span></a>
        <a class="tutorial-next-card" href="/tutorials/map/"><strong>回到内容地图</strong><span>看 001-051 的完整 AI 修炼路径。</span></a>
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
  return layout({
    title: `${name} | 凡人修AI`,
    description: `${name}分类文章，来自凡人修AI教程系统。`,
    base: baseRoot,
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
    body
  });
}

function writeSitemap(articles) {
  const published = articles.filter((article) => article.status === "published");
  const urls = [
    `${site.origin}/`,
    `${site.origin}/tutorials/`,
    `${site.origin}/tutorials/map/`,
    `${site.origin}/tutorials/category/codex/`,
    ...published.map((article) => `${site.origin}/tutorials/${article.slug}/`)
  ];
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((url) => `  <url><loc>${url}</loc></url>`).join("\n")}
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

function build() {
  const articles = readArticles();
  const publicArticles = articles.filter((article) => article.status === "published");
  validatePublishedArticles(articles);

  writeRootPages(publicArticles);
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
