const site = {
  name: "凡人修AI",
  origin: "https://fanrenai.cn",
  description: "普通人的AI修行之路，帮助普通人从AI小白到AI高手。"
};

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
    description: "建立AI常识，找到第一个真实使用场景。"
  },
  炼气期: {
    order: "02",
    alias: "修心",
    description: "学会Prompt、表达目标，并沉淀基础工作流。"
  },
  筑基期: {
    order: "03",
    alias: "练手",
    description: "用Codex、Cursor、Claude Code把想法做成项目。"
  },
  金丹期: {
    order: "04",
    alias: "结丹",
    description: "用AI做副业、做产品、做公司内部提效。"
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
    ["修炼体系", homeHref(base, "system", isHome)],
    ["成长路径", homeHref(base, "path", isHome)],
    ["内容地图", `${base}tutorials/map/`],
    ["关于", `${base}about/`],
    ["Codex专区", homeHref(base, "codex", isHome)]
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
          <a class="nav-cta" href="${base}community/">加入道友群</a>
        </div>
      </nav>
    </header>`;
}

function renderFooter(base = "") {
  return `<footer class="site-footer">
      <p>凡人修AI © 2026</p>
      <p><a href="${base}about/">关于</a> · <a href="${base}community/">道友群</a> · 普通人的AI修行之路</p>
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
    <link rel="stylesheet" href="${base}styles.css" />
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

function renderHomePage() {
  return layout({
    title: "凡人修AI | 普通人的AI修行之路",
    description: "凡人修AI，普通人的AI修行之路。围绕修炼体系、成长路径、社群文化和Codex实战，帮助普通人学习AI、使用AI、靠AI创造价值。",
    base: "",
    bodyClass: "home-v2",
    headerVariant: "home",
    canonicalUrl: `${site.origin}/`,
    body: `<section class="v2-hero">
        <div class="v2-hero-inner">
          <div class="v2-hero-copy">
            <p class="v2-kicker">普通人的AI成长社区</p>
            <h1>凡人修AI</h1>
            <p class="v2-hero-subtitle">普通人的AI修炼手册</p>
            <p class="v2-hero-lead">不是工具导航站，也不是企业官网。<br />这里记录普通人如何从不会用AI，<br />到用AI解决问题、做出作品、创造价值。</p>
            <div class="v2-hero-actions" aria-label="首页主要操作">
              ${renderButton({ href: "#system", label: "开始修炼" })}
              ${renderButton({ href: "tutorials/", label: "查看AI教程", variant: "secondary" })}
              ${renderButton({ href: "community/", label: "加入道友群", variant: "ghost" })}
            </div>
            <div class="v2-hero-status" aria-label="已上线内容">
              <span>已上线：</span>
              <a href="#system">AI修炼体系</a>
              <a href="#codex">Codex专区</a>
              <a href="tutorials/map/">内容地图</a>
              <a href="community/">道友群</a>
            </div>
          </div>
          <aside class="v2-founder-card" aria-label="创始人转型路径">
            <p class="v2-card-kicker">Founder Story</p>
            <h2>从百度SEM到AI布道师</h2>
            <ol>
              <li><span>2014</span><strong>百度SEM销售</strong></li>
              <li><span>2016</span><strong>百度M岗位</strong></li>
              <li><span>2023</span><strong>助贷创业营收600万</strong></li>
              <li><span>2025</span><strong>接触AI与Codex</strong></li>
              <li><span>现在</span><strong>创建凡人修AI</strong></li>
            </ol>
            ${renderButton({ href: "about/", label: "了解老张的AI转型故事", variant: "secondary" })}
          </aside>
        </div>
      </section>

      <section class="v2-section v2-system" id="system">
        <div class="v2-section-heading">
          <p class="v2-kicker">Cultivation Path</p>
          <h2>AI修炼路径</h2>
          <p>先建立认知，再训练表达和工作流，最后用项目和收入验证能力。</p>
        </div>
        <div class="v2-system-grid">
          <article>
            <span>01</span>
            <h3>新手村：认识AI</h3>
            <p>理解AI能做什么、不能做什么，找到第一个真实使用场景。</p>
          </article>
          <article>
            <span>02</span>
            <h3>炼气期：掌握Prompt和工作流</h3>
            <p>把问题说清楚，把一次提问沉淀成稳定、可复用的流程。</p>
          </article>
          <article>
            <span>03</span>
            <h3>筑基期：使用Codex做项目</h3>
            <p>用AI编程工具把想法做成页面、工具和可展示的作品。</p>
          </article>
          <article>
            <span>04</span>
            <h3>金丹期：用AI创造收入</h3>
            <p>从副业、产品和服务出发，让AI能力变成真实价值。</p>
          </article>
        </div>
      </section>

      <section class="v2-section v2-path" id="path">
        <div class="v2-section-heading split">
          <div>
            <p class="v2-kicker">Path</p>
            <h2>从AI小白到能独立交付</h2>
          </div>
          <p>这条路不靠天赋，靠持续练习和一次次可见的成果。每一阶段都对应明确的学习重点和作品目标。</p>
        </div>
        <div class="v2-path-list">
          ${Object.entries(cultivationLevels)
            .map(
              ([level, detail]) => `<article>
            <span>${escapeHtml(detail.order)}</span>
            <div>
              <h3>${escapeHtml(level)}</h3>
              <p>${escapeHtml(detail.description)}</p>
            </div>
          </article>`
            )
            .join("")}
        </div>
      </section>

      <section class="v2-section v2-culture" id="culture">
        <div class="v2-culture-copy">
          <p class="v2-kicker">Community</p>
          <h2>不是围观大神，是一起修行</h2>
          <p>凡人修AI的社群文化很简单：不迷信神话，不制造焦虑，不把工具收藏当成成长。大家带着自己的工作、生活和副业问题进来，用AI做出真实改进。</p>
        </div>
        <div class="v2-culture-principles" aria-label="社群文化">
          <p>每天一个真实问题</p>
          <p>每周一次作品复盘</p>
          <p>每月沉淀一套方法</p>
        </div>
      </section>

      <section class="v2-section v2-founder" id="founder">
        <div class="v2-founder-note">
          <p class="v2-kicker">Founder Story</p>
          <h2>从一个普通人的学习笔记开始</h2>
          <p>凡人修AI的起点不是“我要做一个大平台”，而是一个更朴素的问题：如果一个普通人今天才开始接触AI，他该怎么学，怎么练，怎么把AI真正用到自己的工作和人生里？</p>
          <p>所以这里保留教程、实战、踩坑、复盘和社群。它更像一份持续更新的修行手册：不替你许诺捷径，只陪你把每一步走扎实。</p>
        </div>
      </section>

      <section class="v2-section v2-codex" id="codex">
        <div class="v2-section-heading split">
          <div>
            <p class="v2-kicker">Codex</p>
            <h2>Codex实战专区</h2>
          </div>
          <p>把AI编程从“看起来很神”拆成普通人能操作的流程：提需求、读结果、改页面、跑检查、沉淀项目。</p>
        </div>
        <div class="v2-codex-grid">
          <a href="tutorials/category/codex/"><span>安装教程</span><strong>从环境准备到第一次运行</strong></a>
          <a href="tutorials/category/codex/"><span>常见报错</span><strong>把踩坑整理成可查手册</strong></a>
          <a href="tutorials/category/codex/"><span>项目实战</span><strong>从首页、文章系统到自动化工具</strong></a>
          <a href="tutorials/category/codex/"><span>AI编程入门</span><strong>不会写代码，也能学会协作</strong></a>
        </div>
      </section>

      <section class="v2-section v2-community" id="community">
        <div class="v2-community-inner">
          <p class="v2-kicker">Join</p>
          <h2>加入凡人修AI道友群</h2>
          <p>和一群普通人一起学习AI、实战AI、复盘AI，用AI创造看得见的价值。</p>
          ${renderButton({ href: "community/", label: "立即加入" })}
        </div>
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
