const site = {
  name: "凡人修AI",
  origin: "https://fanrenai.cn",
  description: "普通人的AI修行之路，帮助普通人从AI小白到AI高手。"
};

const assetVersion = "20260531-trust-pages";

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
      action: "开始第1天",
      href: "/tutorials/ai-basics-quick-start/"
    },
    {
      title: "我想提升效率",
      description: "学习Prompt、AI办公和工作流。",
      action: "提升效率",
      href: "/tutorials/prompt-workflow-basic/"
    },
    {
      title: "我想做出项目",
      description: "用Codex、Cursor、Claude Code完成作品。",
      action: "做第一个项目",
      href: "/tutorials/codex-first-project/"
    },
    {
      title: "我想探索变现",
      description: "学习AI副业、AI产品和AI创业案例。",
      action: "查看案例",
      href: "/tutorials/ai-case-side-project/"
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
      href: "tutorials/ai-basics-quick-start/"
    },
    {
      label: "效率提升任务",
      title: "用Prompt生成一份工作计划",
      description: "把一句模糊需求变成一份可执行计划。",
      result: "完成后：你会得到一份可执行的工作计划。",
      href: "tutorials/prompt-workflow-basic/"
    },
    {
      label: "项目实战任务",
      title: "用Codex做出第一个静态页面",
      description: "不懂代码，也能尝试让AI帮你完成一个页面。",
      result: "完成后：你会得到第一个AI生成的静态页面。",
      href: "tutorials/codex-first-project/"
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
            <p class="platform-lead">系统学习AI工具、Prompt工作流、Codex项目实战与AI变现案例。<br />从第1天开始，每天完成一个小任务，7天完成你的第一轮AI修炼。</p>
            <div class="platform-actions" aria-label="首页主要操作">
              ${renderButton({ href: "/tutorials/ai-basics-quick-start/", label: "开始第1天任务" })}
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
    body: `<section class="static-page trust-page about-page section-pad">
      <p class="eyebrow">创始故事</p>
      <h1>为什么创建凡人修AI？</h1>
      <p class="trust-lead">一个非技术背景创业者的AI转型记录。</p>

      <div class="trust-story">
        <article class="trust-story-main ds-card">
          <h2>为什么创建凡人修AI？</h2>
          <p>我不是技术出身，所以更懂普通人第一次面对AI时的无力感。</p>
          <p>看起来到处都是机会，但真正打开工具后，却不知道从哪里开始、该学什么、怎么用到自己的工作和项目里。</p>
          <p>过去十多年，我经历过百度SEM销售、团队管理、企业金融服务、创业增长和项目调整。这些经历让我更加相信：普通人不缺努力，缺的是一条能执行的学习路径。</p>
          <p>AI，尤其是Codex这类工具的出现，让我第一次真正看到：没有技术基础的人，也有机会借助AI完成内容、网站和项目搭建。</p>
          <p>凡人修AI，就是想把AI拆成普通人能完成的教程、任务、案例和路径。它不是工具导航站，也不是个人履历展示，而是普通人的AI学习与实践平台。</p>
        </article>

        <aside class="trust-principles ds-card" aria-label="凡人修AI坚持的方向">
          <h2>我是谁？</h2>
          <ul>
            <li>非技术背景，长期做销售、转化、运营和创业实践。</li>
            <li>经历过大厂一线业务、团队管理、创业增长和行业风险。</li>
            <li>更关注普通人能不能真正用上AI，而不是只收藏工具。</li>
          </ul>
          ${renderButton({ href: "/tutorials/map/", label: "查看AI修炼路径", variant: "secondary" })}
        </aside>
      </div>

      <div class="trust-timeline" aria-label="创始人经历时间线">
        <article><span>2014年</span><h2>百度SEM销售</h2><p>毕业后进入百度实习，做电话销售，主要业务是售卖百度SEM。</p></article>
        <article><span>2016年</span><h2>百度M岗位</h2><p>晋升百度M岗位，负责苏州区域SEM转化团队，带领约10人完成客户转化成交和百度SEM购买。</p></article>
        <article><span>2021年</span><h2>企业金融服务</h2><p>离开百度，进入企业金融服务领域，主要帮助企业对接银行贷款。</p></article>
        <article><span>2022年</span><h2>年创收600万左右</h2><p>在企业金融服务方向实现年创收600万左右，也进一步理解获客、转化、交付和风控。</p></article>
        <article><span>2024年</span><h2>创业压力与项目调整</h2><p>因为业务扩张、行业风控和团队管理等因素，公司最终解散，也承担了创业带来的现实压力。</p></article>
        <article><span>2024年后</span><h2>再次试错传统项目</h2><p>尝试过餐饮小吃方向的短期创业项目，但结果并不理想，也更清楚传统创业对普通人的风险越来越高。</p></article>
        <article><span>2025年</span><h2>认真接触AI</h2><p>开始认真接触AI，研究和试错了很多AI工具，也加入过AI项目会员，但没有直接推广别人的平台，而是持续观察、学习和实践。</p></article>
        <article><span>现在</span><h2>创建凡人修AI</h2><p>直到Codex出现，看到普通人即使没有技术基础，也有机会借助AI完成网站、内容和项目搭建。</p></article>
      </div>

      <section class="trust-mission ds-card" aria-labelledby="brand-title">
        <h2 id="brand-title">为什么是“凡人修AI”？</h2>
        <p>“凡人”代表普通人。“修”代表持续学习、实践、复盘和成长。“AI”不是遥远的技术概念，而是普通人可以拿来提升效率、解决问题、创造价值的新工具。</p>
        <p>凡人修AI想做的，不是把AI讲得高深，而是把AI拆成普通人能执行的教程、任务、案例和路径。</p>
      </section>

      <section class="trust-mission ds-card" aria-labelledby="help-title">
        <h2 id="help-title">凡人修AI想帮助谁？</h2>
        <ul>
          <li>刚开始接触AI，不知道从哪里学起的人。</li>
          <li>想用AI提升工作效率的人。</li>
          <li>想用AI做内容、做项目、做副业的人。</li>
          <li>没有技术背景，但希望借助AI完成作品的人。</li>
          <li>正在寻找第二增长曲线的普通创业者和职场人。</li>
        </ul>
      </section>

      <section class="trust-mission ds-card" aria-labelledby="belief-title">
        <h2 id="belief-title">我们相信什么？</h2>
        <ul>
          <li>普通人也可以学会AI。</li>
          <li>学AI不应该只停留在收藏工具。</li>
          <li>真正重要的是完成任务、做出作品、创造价值。</li>
          <li>AI学习应该有路径、有任务、有案例、有社区。</li>
          <li>凡人修AI会持续记录普通人学习AI、实践AI、转型AI的过程。</li>
        </ul>
      </section>

      <section class="trust-mission ds-card" aria-labelledby="ordinary-title">
        <h2 id="ordinary-title">给普通人的一句话</h2>
        <p>如果你和我一样，不是技术出身，也曾经对AI感到无从下手，那凡人修AI就是为你准备的。</p>
        <p>这里不追求炫技，也不把AI讲成遥远的概念。</p>
        <p>我们只关注一件事：让普通人真正学会AI、用上AI、做出自己的作品。</p>
      </section>

      <section class="trust-mission ds-card" aria-labelledby="about-cta-title">
        <h2 id="about-cta-title">一起开始修AI</h2>
        <p>从第1天任务开始，完成你的第一轮AI修炼。</p>
        <div class="hero-actions">
          ${renderButton({ href: "/tutorials/ai-basics-quick-start/", label: "开始第1天任务" })}
          ${renderButton({ href: "/tutorials/map/", label: "查看内容地图", variant: "secondary" })}
          ${renderButton({ href: "/community/", label: "加入社区", variant: "secondary" })}
        </div>
      </section>
    </section>`
  });
}

function renderCommunityPage() {
  return layout({
    title: "加入凡人修AI社区 | 凡人修AI",
    description: "加入凡人修AI社区，和更多普通人一起学习AI、实践AI、参与共学营、直播分享、项目实战和作品复盘。",
    base: "../",
    canonicalUrl: `${site.origin}/community/`,
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
          <div class="qr-placeholder" aria-label="微信群二维码占位区">微信群二维码占位区</div>
          <h2>微信群</h2>
          <p>后续放置凡人修AI微信群二维码。二维码过期时，将通过公众号或页面说明更新入群方式。</p>
        </article>
        <article class="qr-card ds-card">
          <div class="qr-placeholder" aria-label="公众号二维码占位区">公众号二维码占位区</div>
          <h2>微信公众号</h2>
          <p>后续放置公众号二维码，用于发布教程更新、活动通知、案例复盘和社群入口。</p>
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
