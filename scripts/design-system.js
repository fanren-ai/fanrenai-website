const site = {
  name: "凡人修AI",
  origin: "https://fanrenai.cn",
  description: "普通人的AI修行之路，帮助普通人从AI小白到AI高手。"
};

const assetVersion = "20260531-theme-wipe-layer";

const categories = {
  "ai-cognition": "AI基础认知",
  "ai-tool-intro": "AI工具入门",
  "ai-tool-choice": "AI工具选择",
  "prompt-engineering": "Prompt工程",
  "ai-office": "AI办公",
  "ai-workflow": "AI工作流",
  codex: "Codex专区",
  cursor: "Cursor专区",
  "claude-code": "Claude Code专区",
  "ai-side-hustle": "AI副业",
  "ai-product": "AI产品",
  "ai-startup": "AI创业"
};

const cultivationLevels = {
  新手村: {
    order: "01",
    alias: "识器",
    description: "认识AI，学会使用工具。"
  },
  炼气期: {
    order: "02",
    alias: "修心",
    description: "掌握Prompt和工作流。"
  },
  筑基期: {
    order: "03",
    alias: "练手",
    description: "用Codex做出第一个项目。"
  },
  结丹期: {
    order: "04",
    alias: "结丹",
    description: "用AI做副业、做产品、做公司。"
  }
};

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function homeHref(base, anchor, isHome) {
  return isHome ? `#${anchor}` : `${base}index.html#${anchor}`;
}

function renderLevelBadge(level = "新手村") {
  const detail = cultivationLevels[level] || { order: "00", alias: level, description: "" };
  return `<span class="level-badge" title="${escapeHtml(detail.description)}">${escapeHtml(detail.order)} · ${escapeHtml(level)}</span>`;
}

function renderButton({ href, label, variant = "primary" }) {
  return `<a class="btn btn-${escapeHtml(variant)}" href="${escapeHtml(href)}">${escapeHtml(label)}</a>`;
}

function renderHeader({ base = "", variant = "default" } = {}) {
  const isHome = variant === "home";
  const items = [
    ["首页", isHome ? "#top" : `${base}index.html`],
    ["AI教程", `${base}tutorials/`],
    ["内容地图", `${base}tutorials/map/`],
    ["Codex专区", `${base}tutorials/category/codex/`],
    ["AI工具箱", `${base}tutorials/category/ai-tool-choice/`]
  ];

  return `<header class="site-header" id="top">
      <nav class="nav-shell" aria-label="主导航">
        <a class="brand" href="${isHome ? "#top" : `${base}index.html`}" aria-label="凡人修AI 首页">
          <span class="brand-mark">AI</span>
          <span>凡人修AI</span>
        </a>
        <button class="nav-toggle" type="button" aria-expanded="false" aria-controls="site-menu">
          <span></span><span></span><span></span>
        </button>
        <div class="nav-menu" id="site-menu">
          ${items.map(([label, href]) => `<a href="${href}">${label}</a>`).join("")}
          <button class="theme-toggle" type="button" aria-label="切换深色模式" aria-pressed="false" title="切换深色模式" data-theme-toggle>
            <svg class="theme-toggle-icon" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M9 21h6" />
              <path d="M10 17h4" />
              <path d="M8.4 14.7a6 6 0 1 1 7.2 0c-.8.6-1.3 1.3-1.5 2.3H9.9c-.2-1-.7-1.7-1.5-2.3Z" />
              <path d="M12 2v2" />
              <path d="M4.9 4.9l1.4 1.4" />
              <path d="M19.1 4.9l-1.4 1.4" />
            </svg>
          </button>
          <a class="nav-cta" href="${base}community/">加入社区</a>
        </div>
      </nav>
    </header>`;
}

function renderFooter(base = "") {
  return `<footer class="site-footer">
      <p>凡人修AI © 2026</p>
      <p><a href="${base}about/">关于</a> · <a href="${base}community/">社区</a> · 普通人的AI学习与实践平台</p>
    </footer>`;
}

function layout({ title, description, base = "", body, extraHead = "", bodyClass = "", headerVariant = "default", canonicalUrl = "" }) {
  const safeTitle = escapeHtml(title);
  const safeDescription = escapeHtml(description || site.description);
  const canonical = canonicalUrl ? `<link rel="canonical" href="${escapeHtml(canonicalUrl)}" />` : "";
  return `<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="description" content="${safeDescription}" />
    <meta property="og:site_name" content="${site.name}" />
    <meta property="og:title" content="${safeTitle}" />
    <meta property="og:description" content="${safeDescription}" />
    <meta name="twitter:card" content="summary_large_image" />
    ${canonical}
    ${extraHead}
    <title>${safeTitle}</title>
    <script>
      (function () {
        try {
          var storedTheme = localStorage.getItem("fanrenai-theme");
          var prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
          var theme = storedTheme || (prefersDark ? "dark" : "light");
          document.documentElement.dataset.theme = theme;
          document.documentElement.style.colorScheme = theme;
        } catch (error) {
          document.documentElement.dataset.theme = "light";
          document.documentElement.style.colorScheme = "light";
        }
      })();
    </script>
    <link rel="stylesheet" href="${base}styles.css?v=${assetVersion}" />
  </head>
  <body${bodyClass ? ` class="${escapeHtml(bodyClass)}"` : ""}>
    ${renderHeader({ base, variant: headerVariant })}
    <main>${body}</main>
    ${renderFooter(base)}
    <script src="${base}script.js"></script>
  </body>
</html>`;
}

function renderCategoryChips(base) {
  return Object.entries(categories)
    .map(([slug, name]) => `<a href="${base}tutorials/category/${slug}/">${escapeHtml(name)}</a>`)
    .join("");
}

function renderArticleCard(article, base = "../") {
  return `<article class="tutorial-card ds-card">
    <a href="${base}tutorials/${article.slug}/">
      <div class="tutorial-card-top">
        <span class="tutorial-category">${escapeHtml(article.categoryName)}</span>
        ${renderLevelBadge(article.level)}
      </div>
      <h3>${escapeHtml(article.title)}</h3>
      <p>${escapeHtml(article.description)}</p>
      <div class="tutorial-meta">
        ${article.order ? `<span>第${String(article.order).padStart(2, "0")}课</span>` : ""}
        <span>${escapeHtml(article.date)}</span>
        <span>${escapeHtml(article.duration || `${article.minutes}分钟`)}</span>
      </div>
    </a>
  </article>`;
}

function renderPracticeTasks(article) {
  const tasks = article.practiceTasks.length
    ? article.practiceTasks
    : [
        "用自己的真实场景复述本篇方法。",
        "完成一次AI对话或项目实践，并记录结果。",
        "把可复用的Prompt、流程或检查清单保存下来。"
      ];

  return tasks.map((task, index) => `<li><span>${String(index + 1).padStart(2, "0")}</span>${escapeHtml(task)}</li>`).join("");
}

function renderRelatedCards(related) {
  return related
    .map(
      (item) => `<a class="lesson-related-card" href="../${item.slug}/">
        <span>${escapeHtml(item.categoryName)}</span>
        <strong>${escapeHtml(item.title)}</strong>
        <p>${escapeHtml(item.description)}</p>
      </a>`
    )
    .join("");
}

function renderHomeLatestCards(articles = []) {
  const latest = [...articles]
    .filter((article) => article.status === "published")
    .sort((a, b) => {
      const dateCompare = b.date.localeCompare(a.date);
      if (dateCompare) return dateCompare;
      return (b.order || 0) - (a.order || 0);
    })
    .slice(0, 3);

  if (!latest.length) {
    return `<p class="platform-empty">最新内容正在整理中。</p>`;
  }

  return latest
    .map(
      (article) => `<a class="platform-latest-card" href="tutorials/${article.slug}/">
        <h3>${escapeHtml(article.title)}</h3>
        <span>${escapeHtml(article.level)} · ${escapeHtml(article.categoryName)}</span>
        <p>${escapeHtml(article.description)}</p>
        <strong>阅读全文</strong>
      </a>`
    )
    .join("");
}

function renderArticlePage(article, related) {
  const isPublished = article.status === "published";
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.description,
    author: { "@type": "Organization", name: article.author },
    datePublished: article.date,
    mainEntityOfPage: `${site.origin}/tutorials/${article.slug}/`
  };
  const seoHead = isPublished
    ? `<meta property="article:published_time" content="${article.date}" />
    <script type="application/ld+json">${JSON.stringify(jsonLd)}</script>`
    : '<meta name="robots" content="noindex,nofollow" />';
  const duration = article.duration || `${article.minutes}分钟`;

  return layout({
    title: `${article.title} | 凡人修AI`,
    description: article.description,
    base: "../../",
    canonicalUrl: isPublished ? `${site.origin}/tutorials/${article.slug}/` : "",
    extraHead: seoHead,
    body: `<article class="lesson-shell">
      <header class="lesson-hero section-pad">
        <a class="back-link" href="../">返回修炼手册</a>
        <div class="lesson-hero-grid">
          <div>
            <p class="eyebrow">${escapeHtml(article.categoryName)}</p>
            <h1>${escapeHtml(article.title)}</h1>
            <p>${escapeHtml(article.description)}</p>
          </div>
          <aside class="lesson-rank-card" aria-label="本篇修炼信息">
            <span>修炼等级</span>
            <strong>${escapeHtml(article.level)}</strong>
            <p>${escapeHtml(article.goal)}</p>
          </aside>
        </div>
        <div class="lesson-meta-grid">
          <div>
            <span>修炼等级</span>
            <strong>${escapeHtml(article.level)}</strong>
          </div>
          <div>
            <span>修炼目标</span>
            <strong>${escapeHtml(article.goal)}</strong>
          </div>
          <div>
            <span>修炼时长</span>
            <strong>${escapeHtml(duration)}</strong>
          </div>
        </div>
      </header>

      <div class="lesson-body section-pad">
        <aside class="lesson-sidebar" aria-label="修炼摘要">
          <div>
            <span>本篇目标</span>
            <p>${escapeHtml(article.goal)}</p>
          </div>
          <div>
            <span>建议节奏</span>
            <p>${escapeHtml(duration)}读完，立刻完成文末实战任务。</p>
          </div>
          <div>
            <span>所属路径</span>
            <p>${escapeHtml(article.categoryName)} · ${escapeHtml(article.level)}</p>
          </div>
        </aside>
        <div class="article-content">${article.html}</div>
      </div>

      <section class="lesson-practice section-pad" aria-labelledby="practice-title">
        <div>
          <p class="eyebrow">Practice</p>
          <h2 id="practice-title">实战任务</h2>
          <p>修炼不是看完就结束。本篇读完后，请把下面任务变成一次真实输出。</p>
        </div>
        <ol>${renderPracticeTasks(article)}</ol>
      </section>

      <section class="lesson-related section-pad" aria-labelledby="related-title">
        <div class="lesson-section-title">
          <p class="eyebrow">Next</p>
          <h2 id="related-title">相关教程</h2>
        </div>
        <div class="lesson-related-grid">${renderRelatedCards(related)}</div>
      </section>

      <section class="lesson-join section-pad" aria-labelledby="join-title">
        <div>
          <p class="eyebrow">Community</p>
          <h2 id="join-title">加入凡人修AI道友群</h2>
          <p>把你的实战任务、踩坑记录和作品发出来，和一群普通人一起复盘、迭代、成长。</p>
        </div>
        ${renderButton({ href: "../../index.html#community", label: "加入道友群" })}
      </section>
    </article>`
  });
}

function renderHomePage(articles = []) {
  const startItems = [
    {
      title: "我是AI小白",
      description: "先认识AI工具，学会基本使用。",
      href: "tutorials/map/"
    },
    {
      title: "我想提升效率",
      description: "学习Prompt、AI办公和工作流。",
      href: "tutorials/map/"
    },
    {
      title: "我想做出项目",
      description: "用Codex、Cursor、Claude Code完成作品。",
      href: "tutorials/category/codex/"
    },
    {
      title: "我想探索变现",
      description: "学习AI副业、AI产品和AI创业案例。",
      href: "tutorials/map/"
    }
  ];
  const columns = [
    ["AI教程", "从基础认知到实战方法，建立系统AI能力。", "tutorials/"],
    ["Codex专区", "学习如何用Codex开发网页、工具和项目。", "tutorials/category/codex/"],
    ["Prompt工作流", "把一次提问变成稳定、可复用的工作流程。", "tutorials/map/"],
    ["AI工具箱", "整理高频AI工具，服务真实工作场景。", "tutorials/category/ai-tool-choice/"],
    ["AI案例", "拆解普通人如何用AI解决问题、提高效率。", "tutorials/map/"],
    ["AI创业", "探索AI副业、AI产品和一人公司模式。", "tutorials/map/"]
  ];
  const dailyTasks = [
    {
      label: "AI小白任务",
      title: "让AI帮你写一段自我介绍",
      description: "学会向AI清楚表达身份、目标和场景。",
      href: "tutorials/ai-basics-quick-start/"
    },
    {
      label: "效率提升任务",
      title: "用Prompt生成一份工作计划",
      description: "把一句模糊需求变成一份可执行计划。",
      href: "tutorials/prompt-workflow-basic/"
    },
    {
      label: "项目实战任务",
      title: "用Codex做出第一个静态页面",
      description: "不懂代码，也能尝试让AI帮你完成一个页面。",
      href: "tutorials/codex-first-project/"
    }
  ];
  const sevenDayRoute = [
    "认识AI，搞懂AI能帮你做什么",
    "学会提问，写出第一个Prompt",
    "用AI完成一份真实工作内容",
    "整理你的AI工具箱",
    "学习Codex，理解AI如何帮你做项目",
    "完成一个小作品",
    "复盘并加入社区继续修炼"
  ];

  return layout({
    title: "凡人修AI | 普通人的AI学习与实践平台",
    description: "凡人修AI，面向普通人的AI学习与实践平台，帮助普通人系统学习AI、实践AI、用AI创造价值。",
    base: "",
    bodyClass: "platform-home",
    headerVariant: "home",
    canonicalUrl: `${site.origin}/`,
    body: `<section class="platform-hero" aria-labelledby="home-title">
        <div class="platform-hero-grid">
          <div class="platform-hero-copy">
            <p class="platform-kicker">普通人的AI学习与实践平台</p>
            <h1 id="home-title">凡人修AI</h1>
            <p class="platform-subtitle">从AI小白到AI实战者</p>
            <p class="platform-lead">系统学习AI工具、Prompt工作流、Codex项目实战与AI变现案例。<br />不是收藏工具，而是完成一条可执行的AI成长路径。</p>
            <div class="platform-actions" aria-label="首页主要操作">
              ${renderButton({ href: "tutorials/", label: "开始学习" })}
              ${renderButton({ href: "tutorials/map/", label: "查看内容地图", variant: "secondary" })}
              ${renderButton({ href: "community/", label: "加入社区", variant: "ghost" })}
            </div>
            <div class="platform-tags" aria-label="核心内容标签">
              <span>AI教程</span>
              <span>Codex实战</span>
              <span>Prompt工作流</span>
              <span>AI创业案例</span>
            </div>
          </div>
          <aside class="platform-hero-panel" aria-label="学习入口">
            <h2>今天从哪里开始？</h2>
            <div class="platform-start-list">
              ${startItems
                .map(
                  (item, index) => `<a class="platform-start-item" href="${item.href}">
                <span>${String(index + 1).padStart(2, "0")}</span>
                <strong>${escapeHtml(item.title)}</strong>
                <p>${escapeHtml(item.description)}</p>
              </a>`
                )
                .join("")}
            </div>
          </aside>
        </div>
      </section>

      <section class="platform-section" id="system" aria-labelledby="system-title">
        <div class="platform-section-head">
          <h2 id="system-title">AI修炼体系</h2>
          <p>从认识工具，到完成项目，再到创造价值。</p>
        </div>
        <div class="platform-stage-grid">
          ${Object.entries(cultivationLevels)
            .map(
              ([level, detail]) => `<article>
            <span>${escapeHtml(detail.order)}</span>
            <h3>${escapeHtml(level)}</h3>
            <p>${escapeHtml(detail.description)}</p>
          </article>`
            )
            .join("")}
        </div>
      </section>

      <section class="platform-section platform-daily" aria-labelledby="daily-title">
        <div class="platform-section-head">
          <h2 id="daily-title">今日修炼任务</h2>
          <p>不用一次学完AI，先完成一个10分钟的小任务。</p>
        </div>
        <div class="platform-task-grid">
          ${dailyTasks
            .map(
              (task) => `<article class="platform-task-card">
            <span>${escapeHtml(task.label)}</span>
            <h3>${escapeHtml(task.title)}</h3>
            <p>${escapeHtml(task.description)}</p>
            ${renderButton({ href: task.href, label: "开始任务", variant: "secondary" })}
          </article>`
            )
            .join("")}
        </div>
      </section>

      <section class="platform-section platform-route" aria-labelledby="route-title">
        <div class="platform-section-head">
          <h2 id="route-title">7天AI入门路线</h2>
          <p>每天完成一个小任务，从认识AI到做出第一个作品。</p>
        </div>
        <div class="platform-route-card">
          <ol>
            ${sevenDayRoute
              .map(
                (item, index) => `<li>
              <span>第${index + 1}天</span>
              <strong>${escapeHtml(item)}</strong>
            </li>`
              )
              .join("")}
          </ol>
          ${renderButton({ href: "tutorials/map/", label: "查看完整内容地图", variant: "secondary" })}
        </div>
      </section>

      <section class="platform-section" id="codex" aria-labelledby="columns-title">
        <div class="platform-section-head">
          <h2 id="columns-title">你可以在这里修炼什么？</h2>
          <p>围绕普通人的学习和实践场景组织内容，不做工具堆砌，也不做空泛口号。</p>
        </div>
        <div class="platform-column-grid">
          ${columns
            .map(
              ([title, description, href]) => `<a href="${href}">
            <h3>${escapeHtml(title)}</h3>
            <p>${escapeHtml(description)}</p>
          </a>`
            )
            .join("")}
        </div>
      </section>

      <section class="platform-section" aria-labelledby="latest-title">
        <div class="platform-section-head">
          <h2 id="latest-title">最新修炼内容</h2>
          <p>从这些内容开始，完成你的第一轮AI修炼。</p>
        </div>
        <div class="platform-latest-grid">
          ${renderHomeLatestCards(articles)}
        </div>
      </section>

      <section class="platform-section platform-founder" aria-labelledby="founder-title">
        <div>
          <h2 id="founder-title">为什么创建凡人修AI？</h2>
          <p>凡人修AI由一名从百度SEM、创业经历中转型AI实践者发起。<br />我们不把AI讲成遥远的技术概念，而是把它拆成普通人能执行的教程、任务和案例。<br />目标是帮助更多普通人真正学会AI、用上AI、做出作品。</p>
        </div>
        ${renderButton({ href: "about/", label: "了解创始故事", variant: "secondary" })}
      </section>

      <section class="platform-section platform-cta" id="community" aria-labelledby="community-title">
        <div>
          <h2 id="community-title">加入凡人修AI社区</h2>
          <p>和更多普通人一起学习AI、实践AI、用AI创造价值。</p>
        </div>
        ${renderButton({ href: "community/", label: "加入社区" })}
      </section>`
  });
}

function renderAboutPage() {
  return layout({
    title: "关于凡人修AI | 为什么创建凡人修AI",
    description: "为什么创建凡人修AI：创始人故事、百度经历、创业经历、AI转型经历与凡人修AI使命。",
    base: "../",
    canonicalUrl: `${site.origin}/about/`,
    body: `<section class="static-page section-pad">
      <p class="eyebrow">About</p>
      <h1>为什么创建凡人修AI</h1>
      <p>凡人修AI是一份面向普通人的AI修行手册。这里会持续记录一个普通人如何学习AI、实战AI、用AI创造价值。</p>
      <div class="static-page-grid">
        <article class="ds-card"><span>01</span><h2>创始人故事</h2><p>预留：从普通学习者到AI实践者的真实路径。</p></article>
        <article class="ds-card"><span>02</span><h2>百度经历</h2><p>预留：在大厂环境中对技术、产品与增长的观察。</p></article>
        <article class="ds-card"><span>03</span><h2>创业经历</h2><p>预留：从想法、产品、获客到交付的实战复盘。</p></article>
        <article class="ds-card"><span>04</span><h2>AI转型经历</h2><p>预留：如何把AI从工具变成个人能力系统。</p></article>
        <article class="ds-card"><span>05</span><h2>凡人修AI使命</h2><p>帮助普通人从AI小白到AI高手，学习AI、使用AI、靠AI创造价值。</p></article>
      </div>
    </section>`
  });
}

function renderCommunityPage() {
  return layout({
    title: "加入道友群 | 凡人修AI",
    description: "加入凡人修AI道友群，关注微信公众号，参与未来活动，和普通人一起学习AI、实战AI。",
    base: "../",
    canonicalUrl: `${site.origin}/community/`,
    body: `<section class="static-page section-pad">
      <p class="eyebrow">Community</p>
      <h1>加入道友群</h1>
      <p>这里不是围观大神的地方，而是一群普通人一起学习AI、实战AI、复盘AI的修行场。</p>
      <div class="static-page-grid">
        <article class="ds-card"><span>01</span><h2>加入道友群</h2><p>预留：微信群二维码、入群说明、社群规则。</p></article>
        <article class="ds-card"><span>02</span><h2>微信公众号</h2><p>预留：公众号二维码、更新频率、内容栏目。</p></article>
        <article class="ds-card"><span>03</span><h2>未来活动</h2><p>预留：共学营、直播分享、项目实战、作品复盘。</p></article>
      </div>
    </section>`
  });
}

function render404Page() {
  return layout({
    title: "此处灵气不足 | 凡人修AI",
    description: "你访问的页面可能已经失传。",
    base: "",
    extraHead: '<meta name="robots" content="noindex" />',
    body: `<section class="not-found section-pad">
      <p class="eyebrow">404</p>
      <h1>此处灵气不足</h1>
      <p>你访问的页面可能已经失传</p>
      <div class="v2-hero-actions">
        ${renderButton({ href: "index.html", label: "返回首页" })}
        ${renderButton({ href: "tutorials/", label: "进入教程", variant: "secondary" })}
      </div>
    </section>`
  });
}

module.exports = {
  site,
  categories,
  cultivationLevels,
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
};
