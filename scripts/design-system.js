const siteOrigin = "https://www.fanrenai.cn";
const site = {
  name: "凡人修AI",
  origin: siteOrigin,
  description: "普通人的AI修行之路，帮助普通人从AI小白到AI高手。",
  logo: `${siteOrigin}/assets/brand/fanrenai-logo-mark-256.png`,
  socialImage: `${siteOrigin}/assets/hero-v2-ai-cultivation.png`
};

const assetVersion = "20260614-codex-zone";

const categories = {
  "ai-cognition": "AI基础认知",
  "ai-tool-intro": "AI工具入门",
  "ai-tool-choice": "AI工具选择",
  "prompt-engineering": "Prompt与工作流",
  "ai-office": "AI办公提效",
  "ai-workflow": "AI工作流",
  "ai-project-practice": "AI项目实战",
  "ai-writing-content": "AI写作与内容创作",
  "ai-self-media-personal-ip": "AI自媒体与个人IP",
  "ai-business-monetization": "AI商业与变现",
  codex: "Codex专区",
  cursor: "Cursor专区",
  "claude-code": "Claude Code专区",
  "ai-side-hustle": "AI副业",
  "ai-product": "AI产品",
  "ai-startup": "AI创业"
};

const tutorialEntryCategorySlugs = [
  "ai-cognition",
  "ai-tool-intro",
  "prompt-engineering",
  "ai-office",
  "ai-writing-content",
  "ai-self-media-personal-ip",
  "ai-business-monetization"
];

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

function normalizeAbsoluteUrl(value = "") {
  if (!value) return "";
  if (/^https?:\/\//.test(value)) return value;
  if (value.startsWith("/")) return `${site.origin}${value}`;
  return `${site.origin}/${value.replace(/^\.?\//, "")}`;
}

function safeJsonLd(value) {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

function renderJsonLd(data) {
  const blocks = Array.isArray(data) ? data : [data];
  return blocks
    .filter(Boolean)
    .map((block) => `<script type="application/ld+json">${safeJsonLd(block)}</script>`)
    .join("\n    ");
}

function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${site.origin}/#organization`,
    name: site.name,
    url: site.origin,
    logo: {
      "@type": "ImageObject",
      url: site.logo
    }
  };
}

function webSiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${site.origin}/#website`,
    name: site.name,
    url: site.origin,
    description: site.description,
    publisher: {
      "@id": `${site.origin}/#organization`
    },
    inLanguage: "zh-CN"
  };
}

function breadcrumbJsonLd(items = []) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url
    }))
  };
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
    ["AI教程", `${base}tutorials/index.html`],
    ["内容地图", `${base}tutorials/map/index.html`],
    ["Codex专区", `${base}tutorials/category/codex/index.html`],
    ["AI工具箱", "https://tools.fanrenai.cn/"]
  ];

  return `<header class="site-header" id="top">
      <nav class="nav-shell" aria-label="主导航">
        <a class="brand" href="${isHome ? "#top" : `${base}index.html`}" aria-label="凡人修AI 首页">
          <img class="brand-logo" src="${base}assets/brand/fanrenai-logo-mark-256.png" alt="" width="40" height="40" loading="eager" decoding="async" />
          <span>凡人修AI</span>
        </a>
        <button class="nav-toggle" type="button" aria-expanded="false" aria-controls="site-menu">
          <span></span><span></span><span></span>
        </button>
        <div class="nav-menu" id="site-menu">
          ${items.map(([label, href]) => `<a href="${href}">${label}</a>`).join("")}
          <a class="nav-cta" href="${base}community/index.html">加入社区</a>
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

function layout({
  title,
  description,
  base = "",
  body,
  extraHead = "",
  bodyClass = "",
  headerVariant = "default",
  canonicalUrl = "",
  ogType = "website",
  socialImage = site.socialImage,
  keywords = [],
  prevUrl = "",
  nextUrl = "",
  structuredData = []
}) {
  const safeTitle = escapeHtml(title);
  const safeDescription = escapeHtml(description || site.description);
  const safeImage = escapeHtml(normalizeAbsoluteUrl(socialImage) || site.socialImage);
  const ogUrl = canonicalUrl || site.origin;
  const canonical = canonicalUrl ? `<link rel="canonical" href="${escapeHtml(canonicalUrl)}" />` : "";
  const keywordContent = Array.isArray(keywords) ? keywords.filter(Boolean).join(",") : keywords;
  const keywordMeta = keywordContent ? `<meta name="keywords" content="${escapeHtml(keywordContent)}" />` : "";
  const paginationLinks = `${prevUrl ? `<link rel="prev" href="${escapeHtml(prevUrl)}" />` : ""}
    ${nextUrl ? `<link rel="next" href="${escapeHtml(nextUrl)}" />` : ""}`;
  const jsonLd = renderJsonLd([organizationJsonLd(), webSiteJsonLd(), ...[].concat(structuredData || [])]);
  return `<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="description" content="${safeDescription}" />
    ${keywordMeta}
    <meta name="theme-color" content="#111827" />
    <meta property="og:locale" content="zh_CN" />
    <meta property="og:type" content="${escapeHtml(ogType)}" />
    <meta property="og:site_name" content="${escapeHtml(site.name)}" />
    <meta property="og:title" content="${safeTitle}" />
    <meta property="og:description" content="${safeDescription}" />
    <meta property="og:url" content="${escapeHtml(ogUrl)}" />
    <meta property="og:image" content="${safeImage}" />
    <meta property="og:image:alt" content="${escapeHtml(site.name)}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${safeTitle}" />
    <meta name="twitter:description" content="${safeDescription}" />
    <meta name="twitter:image" content="${safeImage}" />
    ${canonical}
    ${paginationLinks}
    ${extraHead}
    ${jsonLd}
    <title>${safeTitle}</title>
    <link rel="icon" type="image/png" href="${base}assets/brand/fanrenai-logo-mark-256.png" />
    <link rel="apple-touch-icon" href="${base}assets/brand/fanrenai-logo-mark-256.png" />
    <link rel="stylesheet" href="${base}styles.css?v=${assetVersion}" />
  </head>
  <body${bodyClass ? ` class="${escapeHtml(bodyClass)}"` : ""}>
    ${renderHeader({ base, variant: headerVariant })}
    <main>${body}</main>
    ${renderFooter(base)}
    <script src="${base}script.js?v=${assetVersion}"></script>
  </body>
</html>`;
}

function renderCategoryChips(base) {
  return tutorialEntryCategorySlugs
    .map((slug) => [slug, categories[slug]])
    .filter(([, name]) => name)
    .map(([slug, name]) => `<a href="${base}tutorials/category/${slug}/">${escapeHtml(name)}</a>`)
    .join("");
}

function renderArticleCard(article, base = "../") {
  return `<article class="tutorial-card ds-card">
    <a href="${base}tutorials/${article.slug}/index.html">
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
      (item) => `<a class="lesson-related-card" href="../${item.slug}/index.html">
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
    return `<p class="platform-empty">新内容正在重新整理中</p>`;
  }

  return latest
    .map(
      (article) => `<a class="platform-latest-card" href="tutorials/${article.slug}/index.html">
        <h3>${escapeHtml(article.title)}</h3>
        <span>${escapeHtml(article.level)} · ${escapeHtml(article.categoryName)}</span>
        <p>${escapeHtml(article.description)}</p>
        <strong>阅读全文</strong>
      </a>`
    )
    .join("");
}

function renderArticlePage(article, related = []) {
  const isPublished = article.status === "published";
  const articleUrl = `${site.origin}/tutorials/${article.slug}/`;
  const articleImage = normalizeAbsoluteUrl(article.cover) || site.socialImage;
  const wordCount = article.body ? article.body.replace(/\s/g, "").length : 0;
  const durationMinutes = Number((article.duration || "").match(/\d+/)?.[0] || article.minutes || 1);
  const articleTags = article.tags || [];
  const categoryName = article.categoryName || article.section || "AI教程";
  const categorySlug = article.category || "ai-cognition";
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "@id": `${articleUrl}#article`,
    headline: article.title,
    description: article.description,
    image: articleImage,
    url: articleUrl,
    inLanguage: "zh-CN",
    isPartOf: { "@id": `${site.origin}/#website` },
    author: { "@type": "Organization", name: article.author || site.name },
    publisher: { "@id": `${site.origin}/#organization` },
    datePublished: article.date,
    dateModified: article.updated || article.date,
    articleSection: categoryName,
    keywords: articleTags,
    wordCount,
    timeRequired: `PT${durationMinutes}M`,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": articleUrl
    }
  };
  const seoHead = isPublished
    ? `<meta property="article:published_time" content="${article.date}" />
    <meta property="article:modified_time" content="${escapeHtml(article.updated || article.date)}" />
    <meta property="article:section" content="${escapeHtml(categoryName)}" />
    ${articleTags.map((tag) => `<meta property="article:tag" content="${escapeHtml(tag)}" />`).join("\n    ")}`
    : '<meta name="robots" content="noindex,nofollow" />';
  const duration = article.duration || `${article.minutes}分钟`;

  return layout({
    title: `${article.title} | 凡人修AI`,
    description: article.description,
    base: "../../",
    canonicalUrl: isPublished ? `${site.origin}/tutorials/${article.slug}/` : "",
    ogType: "article",
    socialImage: articleImage,
    keywords: articleTags,
    extraHead: seoHead,
    structuredData: isPublished
      ? [
          jsonLd,
          breadcrumbJsonLd([
            { name: "首页", url: `${site.origin}/` },
            { name: "AI教程", url: `${site.origin}/tutorials/` },
            { name: categoryName, url: `${site.origin}/tutorials/category/${categorySlug}/` },
            { name: article.title, url: articleUrl }
          ])
        ]
      : [],
    body: `<div class="reading-progress" aria-hidden="true"><span></span></div>
    <article class="lesson-shell">
      <header class="lesson-hero section-pad">
        <div class="lesson-hero-inner">
          <a class="back-link" href="../">返回修炼手册</a>
          <div class="lesson-meta-pills" aria-label="文章信息">
            <span class="lesson-pill">${escapeHtml(article.categoryName)}</span>
            <span class="lesson-pill">${escapeHtml(article.level)}</span>
            <span class="lesson-pill">${escapeHtml(duration)}</span>
          </div>
          <h1>${escapeHtml(article.title)}</h1>
          <p class="lesson-description">${escapeHtml(article.description)}</p>
          <div class="lesson-goal-strip">
            <span>本篇目标</span>
            <strong>${escapeHtml(article.goal)}</strong>
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
        <div class="article-content" data-copy-protected="article">${article.html}
          <footer class="article-copyright">本文由凡人修AI原创整理，转载请注明来源。</footer>
        </div>
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
      description: "从第一篇开始，先看懂AI是什么、普通人该怎么用。",
      action: "从001开始",
      href: "/tutorials/001-what-is-ai/"
    },
    {
      title: "我想学会提问",
      description: "进入Prompt与工作流，练习把任务说清楚。",
      action: "学习Prompt",
      href: "/tutorials/011-prompt-workflow-basic/"
    },
    {
      title: "我想提升效率",
      description: "从AI办公开始，把AI用进真实工作任务。",
      action: "提升效率",
      href: "/tutorials/016-ai-ppt-outline/"
    },
    {
      title: "我想探索变现",
      description: "先看普通人的AI赚钱逻辑，再判断适合自己的方向。",
      action: "查看变现路径",
      href: "/tutorials/042-ai-make-money-for-ordinary-people/"
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
      result: "完成后：你会得到一份可直接使用的AI自我介绍。",
      href: "tutorials/"
    },
    {
      label: "效率提升任务",
      title: "用Prompt生成一份工作计划",
      description: "把一句模糊需求变成一份可执行计划。",
      result: "完成后：你会得到一份可执行的工作计划。",
      href: "tutorials/map/"
    },
    {
      label: "项目实战任务",
      title: "用Codex做出第一个静态页面",
      description: "不懂代码，也能尝试让AI帮你完成一个页面。",
      result: "完成后：你会得到第一个AI生成的静态页面。",
      href: "tutorials/map/"
    }
  ];
  const sevenDayRoute = [
    ["认识AI", "知道AI能帮你做什么"],
    ["学会Prompt", "写出第一个可复用提示词"],
    ["AI办公", "完成一份真实工作内容"],
    ["整理工具箱", "建立自己的AI工具清单"],
    ["认识Codex", "理解AI如何帮你做项目"],
    ["完成作品", "做出第一个小作品"],
    ["复盘入群", "进入社区继续修炼"]
  ];
  const latestItems = [...articles]
    .filter((article) => article.status === "published")
    .sort((a, b) => {
      const dateCompare = b.date.localeCompare(a.date);
      if (dateCompare) return dateCompare;
      return (b.order || 0) - (a.order || 0);
    })
    .slice(0, 6);

  return layout({
    title: "凡人修AI | 普通人的AI学习与实践平台",
    description: "凡人修AI，面向普通人的AI学习与实践平台，帮助普通人系统学习AI、实践AI、用AI创造价值。",
    base: "",
    bodyClass: "platform-home",
    headerVariant: "home",
    canonicalUrl: `${site.origin}/`,
    keywords: ["AI教程", "普通人学AI", "Prompt工作流", "Codex实战", "AI副业", "AI办公"],
    structuredData: [
      {
        "@context": "https://schema.org",
        "@type": "ItemList",
        name: "凡人修AI最新教程",
        itemListElement: latestItems.map((article, index) => ({
          "@type": "ListItem",
          position: index + 1,
          url: `${site.origin}/tutorials/${article.slug}/`,
          name: article.title
        }))
      }
    ],
    body: `<section class="platform-hero" aria-labelledby="home-title">
        <div class="platform-hero-grid">
          <div class="platform-hero-copy">
            <p class="platform-kicker">普通人的AI学习与实践平台</p>
            <h1 id="home-title">凡人修AI</h1>
            <p class="platform-subtitle">从AI小白到AI实战者</p>
            <p class="platform-lead">系统学习AI工具、Prompt工作流、Codex项目实战与AI变现案例。<br />从第1天开始，每天完成一个小任务，7天完成你的第一轮AI修炼。</p>
            <div class="platform-actions" aria-label="首页主要操作">
              ${renderButton({ href: "/tutorials/", label: "查看教程列表" })}
              ${renderButton({ href: "/tutorials/map/", label: "查看内容地图", variant: "secondary" })}
              ${renderButton({ href: "/community/", label: "加入社区", variant: "secondary" })}
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
                <span class="platform-start-index">${String(index + 1).padStart(2, "0")}</span>
                <span class="platform-start-content">
                  <strong class="platform-start-title">${escapeHtml(item.title)}</strong>
                  <span class="platform-start-desc">${escapeHtml(item.description)}</span>
                </span>
                <span class="platform-start-action">${escapeHtml(item.action)}<span class="platform-start-arrow" aria-hidden="true">→</span></span>
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
            <p class="platform-task-result">${escapeHtml(task.result)}</p>
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
              <strong>${escapeHtml(item[0])}</strong>
              <em>成果：${escapeHtml(item[1])}</em>
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
    title: "为什么创建凡人修AI？| 一个非技术背景创业者的AI转型记录",
    description: "为什么创建凡人修AI：一个非技术背景创业者，从百度SEM销售、团队管理、企业金融服务和创业实践，到转型AI实践者的真实记录。",
    base: "../",
    canonicalUrl: `${site.origin}/about/`,
    keywords: ["凡人修AI", "AI转型", "普通人学AI", "AI创业"],
    structuredData: [
      breadcrumbJsonLd([
        { name: "首页", url: `${site.origin}/` },
        { name: "关于凡人修AI", url: `${site.origin}/about/` }
      ])
    ],
    body: `<div class="about-page">
      <section class="about-hero">
        <p class="eyebrow">创始故事</p>
        <h1>为什么创建凡人修AI？</h1>
        <p class="about-subtitle">一个非技术背景创业者的AI转型记录。</p>
        <p class="about-intro">我不是技术出身，所以更懂普通人第一次面对 AI 时的无力感。看起来到处都是机会，但真正打开工具后，却不知道从哪里开始、该学什么、怎么用到自己的工作和项目里。</p>
        <div class="about-trust-summary" aria-label="创始人经历摘要">
          <span><strong>10年+</strong>互联网销售与转化经验</span>
          <span><strong>600万+</strong>企业金融服务创收经历</span>
          <span><strong>0技术背景</strong>用AI从零搭建凡人修AI</span>
        </div>
      </section>

      <section class="about-section about-story-card" aria-labelledby="about-origin-title">
        <h2 id="about-origin-title">我为什么做凡人修AI？</h2>
        <p>过去十多年，我经历过百度SEM销售、团队管理、企业金融服务、创业增长、行业风险和项目调整。</p>
        <p>这些经历让我更加相信：普通人不缺努力，缺的是一条能执行的学习路径。</p>
        <p>AI，尤其是 Codex 这类工具的出现，让我第一次真正看到：没有技术基础的人，也有机会借助AI完成内容、网站和项目搭建。</p>
        <p>凡人修AI，就是想把AI拆成普通人能完成的教程、任务、案例和路径。</p>
      </section>

      <section class="about-section" aria-labelledby="about-timeline-title">
        <h2 id="about-timeline-title">我的真实经历</h2>
        <div class="about-timeline">
          <article class="about-timeline-item"><span>2014年</span><div><h3>百度SEM销售</h3><p>毕业后进入百度实习，做电话销售，主要业务是售卖百度SEM。</p><p class="about-insight">这段经历让我理解了流量、客户需求和转化。</p></div></article>
          <article class="about-timeline-item"><span>2016年</span><div><h3>百度M岗位</h3><p>晋升百度M岗位，负责苏州区域SEM转化团队，带领约10人完成客户转化成交和百度SEM购买。</p><p class="about-insight">这段经历让我开始理解团队管理和成交系统。</p></div></article>
          <article class="about-timeline-item"><span>2021年</span><div><h3>企业金融服务</h3><p>离开百度，进入企业金融服务领域，主要帮助企业对接银行贷款。</p><p class="about-insight">这段经历让我更接近中小企业真实经营问题。</p></div></article>
          <article class="about-timeline-item"><span>2022年</span><div><h3>年创收600万左右</h3><p>在企业金融服务方向实现年创收600万左右，也进一步理解获客、转化、交付和风控。</p><p class="about-insight">这段经历让我理解了获客、成交、交付和风控。</p></div></article>
          <article class="about-timeline-item"><span>2024年</span><div><h3>创业压力与项目调整</h3><p>因为业务扩张、行业风控和团队管理等因素，公司最终解散，也承担了创业带来的现实压力。</p><p class="about-insight">这段经历让我意识到，普通人创业不能只靠蛮力和经验。</p></div></article>
          <article class="about-timeline-item"><span>2024年后</span><div><h3>再次试错传统项目</h3><p>尝试过餐饮小吃方向的短期创业项目，但结果并不理想，也进一步意识到传统创业对普通人的风险越来越高。</p><p class="about-insight">这段经历让我更重视低成本试错和可复用能力。</p></div></article>
          <article class="about-timeline-item"><span>2025年</span><div><h3>认真接触AI</h3><p>开始认真接触AI，研究和试错了很多AI工具，也加入过AI项目会员，但没有直接推广别人的平台，而是持续观察、学习和实践。</p><p class="about-insight">这段经历让我开始重新思考普通人的第二增长曲线。</p></div></article>
          <article class="about-timeline-item"><span>现在</span><div><h3>创建凡人修AI</h3><p>直到 Codex 出现，我看到普通人即使没有技术基础，也有机会借助AI完成网站、内容和项目搭建，于是创建凡人修AI。</p><p class="about-insight">这不是一次简单建站，而是一次用AI重建能力的长期实践。</p></div></article>
        </div>
      </section>

      <section class="about-section" aria-labelledby="about-brand-title">
        <h2 id="about-brand-title">为什么是“凡人修AI”？</h2>
        <p>“凡人”代表普通人。</p>
        <p>“修”代表持续学习、实践、复盘和成长。</p>
        <p>“AI”不是遥远的技术概念，而是普通人可以拿来提升效率、解决问题、创造价值的新工具。</p>
        <p>凡人修AI想做的，不是把AI讲得高深，而是把AI拆成普通人能执行的教程、任务、案例和路径。</p>
      </section>

      <section class="about-section about-not-do" aria-labelledby="about-not-do-title">
        <h2 id="about-not-do-title">凡人修AI不做什么？</h2>
        <div class="about-not-do-grid">
          <div>
            <h3>我们不做</h3>
            <ul>
              <li>不做单纯工具导航。</li>
              <li>不把AI讲成高深概念。</li>
              <li>不鼓励盲目追热点。</li>
              <li>不承诺一夜暴富。</li>
              <li>不让普通人停留在收藏工具。</li>
            </ul>
          </div>
          <div>
            <h3>我们更关注</h3>
            <ul>
              <li>能不能完成任务。</li>
              <li>能不能做出作品。</li>
              <li>能不能提升效率。</li>
              <li>能不能创造真实价值。</li>
            </ul>
          </div>
        </div>
      </section>

      <section class="about-section" aria-labelledby="about-help-title">
        <h2 id="about-help-title">凡人修AI想帮助谁？</h2>
        <div class="about-belief-grid">
          <article>刚开始接触AI，不知道从哪里学起的人</article>
          <article>想用AI提升工作效率的人</article>
          <article>想用AI做内容、做项目、做副业的人</article>
          <article>没有技术背景，但希望借助AI完成作品的人</article>
          <article>正在寻找第二增长曲线的普通创业者和职场人</article>
        </div>
      </section>

      <section class="about-section" aria-labelledby="about-belief-title">
        <h2 id="about-belief-title">我们相信什么？</h2>
        <div class="about-belief-grid about-belief-grid-soft">
          <article>普通人也可以学会AI</article>
          <article>学AI不应该只停留在收藏工具</article>
          <article>真正重要的是完成任务、做出作品、创造价值</article>
          <article>AI学习应该有路径、有任务、有案例、有社区</article>
          <article>凡人修AI会持续记录普通人学习AI、实践AI、转型AI的过程</article>
        </div>
      </section>

      <section class="about-quote" aria-labelledby="about-quote-title">
        <h2 id="about-quote-title">给普通人的一句话</h2>
        <p>如果你和我一样，不是技术出身，也曾经对AI感到无从下手，那凡人修AI就是为你准备的。</p>
        <p>这里不追求炫技，也不把AI讲成遥远的概念。</p>
        <p>我们更关心的是：今天能不能完成一个任务，这一周能不能做出一个作品，未来能不能用AI创造真正的价值。</p>
      </section>

      <section class="about-cta" aria-labelledby="about-cta-title">
        <h2 id="about-cta-title">一起开始修AI</h2>
        <p>从第1天任务开始，完成你的第一轮AI修炼。</p>
        <div class="hero-actions">
          ${renderButton({ href: "/tutorials/", label: "查看教程列表" })}
          ${renderButton({ href: "/tutorials/map/", label: "查看内容地图", variant: "secondary" })}
          ${renderButton({ href: "/community/", label: "加入社区", variant: "secondary" })}
        </div>
      </section>
    </div>`
  });
}

function renderCommunityPage() {
  return layout({
    title: "加入凡人修AI社区 | 凡人修AI",
    description: "加入凡人修AI社区，和更多普通人一起学习AI、实践AI、参与共学营、直播分享、项目实战和作品复盘。",
    base: "../",
    canonicalUrl: `${site.origin}/community/`,
    keywords: ["凡人修AI社区", "AI学习社群", "AI共学", "Codex实战"],
    structuredData: [
      breadcrumbJsonLd([
        { name: "首页", url: `${site.origin}/` },
        { name: "凡人修AI社区", url: `${site.origin}/community/` }
      ])
    ],
    body: `<section class="static-page trust-page community-page section-pad">
      <p class="eyebrow">社区</p>
      <h1>加入凡人修AI社区</h1>
      <p class="trust-lead">这里不是围观大神的地方，而是一群普通人一起学习AI、实践AI、复盘AI的成长社区。</p>

      <div class="community-layout">
        <article class="community-info ds-card">
          <h2>适合加入的人</h2>
          <ul>
            <li>刚开始接触AI，希望有人带着入门的普通用户。</li>
            <li>想用AI提升工作效率，但不知道从哪里开始的人。</li>
            <li>想学习Prompt、Codex、Cursor、Claude Code等AI实践工具的人。</li>
            <li>想尝试AI副业、AI产品或一人公司模式的人。</li>
            <li>愿意分享过程、复盘结果、持续行动的人。</li>
          </ul>
        </article>

        <article class="community-info ds-card">
          <h2>入群可以获得什么</h2>
          <ul>
            <li>凡人修AI教程更新提醒和学习路线。</li>
            <li>AI工具、Prompt工作流、Codex项目实战经验。</li>
            <li>普通人AI应用案例和避坑复盘。</li>
            <li>阶段性共学任务、作品展示和互相反馈。</li>
          </ul>
        </article>
      </div>

      <div class="qr-grid">
        <article class="qr-card ds-card">
          <div class="qr-image-wrap">
            <img class="qr-image" src="../assets/qrcodes/wechat-group-latest.png" alt="凡人修AI社区二维码" width="280" height="280" loading="lazy" decoding="async" />
          </div>
          <h2>扫码加入凡人修AI社区</h2>
          <p class="qr-meta">群聊：凡人修AI②群</p>
          <p class="qr-note">扫码加入社区，和一群普通人一起学习AI、实践AI、用AI创造价值。</p>
        </article>
        <article class="qr-card ds-card">
          <div class="qr-image-wrap">
            <img class="qr-image" src="../assets/qrcodes/wechat-official-latest.jpg" alt="凡人修AI公众号二维码" width="280" height="280" loading="lazy" decoding="async" />
          </div>
          <h2>关注凡人修AI公众号</h2>
          <p class="qr-meta">获取AI教程、项目实战、转型记录和社群动态。</p>
          <p class="qr-note">关注公众号，持续获取凡人修AI最新内容。</p>
        </article>
      </div>

      <div class="community-rules ds-card">
        <h2>社群规则</h2>
        <ol>
          <li>聚焦AI学习、实践、项目和真实案例，少发无关内容。</li>
          <li>鼓励提问，但提问时尽量说明背景、目标和你已经尝试过的方法。</li>
          <li>欢迎分享作品、过程和复盘，不鼓励只转发焦虑型信息。</li>
          <li>禁止广告刷屏、灰产项目、夸大收益和虚假承诺。</li>
          <li>尊重每个阶段的学习者，普通人也可以慢慢把AI用起来。</li>
        </ol>
      </div>

      <section class="future-events" aria-labelledby="events-title">
        <h2 id="events-title">未来活动</h2>
        <div class="future-events-grid">
          <article class="ds-card"><span>01</span><h3>共学营</h3><p>围绕AI入门、Prompt工作流、Codex实战组织阶段性共学。</p></article>
          <article class="ds-card"><span>02</span><h3>直播分享</h3><p>分享工具更新、实战案例、踩坑经验和普通人的AI转型路径。</p></article>
          <article class="ds-card"><span>03</span><h3>项目实战</h3><p>从静态页面、工具站到小产品，带着大家完成可展示的作品。</p></article>
          <article class="ds-card"><span>04</span><h3>作品复盘</h3><p>复盘成员作品，讨论如何优化需求、页面、内容、转化和交付。</p></article>
        </div>
      </section>
    </section>`
  });
}

function render404Page() {
  return layout({
    title: "此处灵气不足 | 凡人修AI",
    description: "你访问的页面可能已经失传。",
    base: "",
    extraHead: `<meta name="robots" content="noindex" />
    <script>
      (function () {
        var match = window.location.pathname.match(/^\\/(\\d{3}-[a-z0-9-]+)\\/?$/);
        if (match) {
          window.location.replace("/tutorials/" + match[1] + "/");
        }
      })();
    </script>`,
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
  breadcrumbJsonLd,
  escapeHtml,
  layout,
  normalizeAbsoluteUrl,
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
