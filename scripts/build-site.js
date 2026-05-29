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
  let inCode = false;

  function inline(value) {
    return escapeHtml(value)
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      .replace(/`(.+?)`/g, "<code>$1</code>");
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
    html.push(`<pre><code>${escapeHtml(code.join("\n"))}</code></pre>`);
    code = [];
  }

  lines.forEach((line) => {
    if (line.startsWith("```")) {
      if (inCode) {
        flushCode();
        inCode = false;
      } else {
        flushParagraph();
        flushList();
        inCode = true;
      }
      return;
    }

    if (inCode) {
      code.push(line);
      return;
    }

    if (!line.trim()) {
      flushParagraph();
      flushList();
      return;
    }

    const heading = line.match(/^(#{1,3})\s+(.+)$/);
    if (heading) {
      flushParagraph();
      flushList();
      const level = heading[1].length;
      html.push(`<h${level}>${inline(heading[2])}</h${level}>`);
      return;
    }

    const quote = line.match(/^>\s+(.+)$/);
    if (quote) {
      flushParagraph();
      flushList();
      html.push(`<blockquote><p>${inline(quote[1])}</p></blockquote>`);
      return;
    }

    const bullet = line.match(/^-\s+(.+)$/);
    if (bullet) {
      flushParagraph();
      list.push(bullet[1]);
      return;
    }

    const ordered = line.match(/^\d+\.\s+(.+)$/);
    if (ordered) {
      flushParagraph();
      list.push(ordered[1]);
      return;
    }

    paragraph.push(line.trim());
  });

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

function renderTutorialIndex(articles, current = 1, total = 1, baseRoot = "../") {
  const cards = articles.map((article) => renderArticleCard(article, baseRoot)).join("\n");
  const chips = renderCategoryChips(baseRoot);
  return layout({
    title: "AI教程 | 凡人修AI",
    description: "凡人修AI教程系统，覆盖AI入门、Prompt工作流、Codex实战、AI工具箱和AI案例。",
    base: baseRoot,
    body: `<section class="tutorial-hero section-pad">
      <p class="eyebrow">Tutorials</p>
      <h1>AI教程</h1>
      <p>用本地Markdown管理内容，按分类沉淀普通人的AI修炼手册。</p>
      <div class="tutorial-hero-actions">
        ${renderButton({ href: `${baseRoot}tutorials/map/`, label: "查看内容地图" })}
      </div>
      <div class="category-chips">${chips}</div>
    </section>
    <section class="tutorial-layout section-pad">
      <aside class="tutorial-sidebar">
        <h2>教程分类</h2>
        <nav>${chips}</nav>
      </aside>
      <div>
        <div class="tutorial-list">${cards}</div>
        ${pagination(current, total, (page) => (page === 1 ? `${baseRoot}tutorials/` : `${baseRoot}tutorials/page/${page}/`))}
      </div>
    </section>`
  });
}

function renderCategoryPage(slug, pageArticles, totalArticles, current = 1, total = 1, baseRoot = "../../../") {
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

function renderContentMapPage(articles) {
  const levels = ["新手村", "炼气期", "筑基期", "金丹期"];
  const grouped = levels
    .map((level) => {
      const levelArticles = articles.filter((article) => article.level === level && article.order);
      const sections = [...new Set(levelArticles.map((article) => article.section))];
      return { level, sections, articles: levelArticles };
    })
    .filter((group) => group.articles.length);

  const body = `<section class="content-map-hero section-pad">
      <p class="eyebrow">Content Map V1.0</p>
      <h1>凡人修AI内容地图</h1>
      <p>四个修炼阶段，十二个内容栏目，六十篇核心教程。先搭骨架，再逐篇打磨成普通人的AI修行手册。</p>
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
                    const statusLabel = article.status === "published" ? "已发布" : article.status === "writing" ? "撰写中" : "待完善";
                    const inner = `<span>${String(article.order).padStart(2, "0")}</span>
                  <strong>${escapeHtml(article.title)}</strong>
                  <em>${statusLabel}</em>`;
                    return article.status === "published"
                      ? `<li><a href="../${article.slug}/">${inner}</a></li>`
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
    description: "凡人修AI内容地图 V1.0，覆盖新手村、炼气期、筑基期、金丹期四个AI修炼阶段。",
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
    ...published.map((article) => `${site.origin}/tutorials/${article.slug}/`)
  ];
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((url) => `  <url><loc>${url}</loc></url>`).join("\n")}
</urlset>`;
  fs.writeFileSync(path.join(root, "sitemap.xml"), xml);
}

function writeRobots() {
  fs.writeFileSync(
    path.join(root, "robots.txt"),
    `User-agent: *
Allow: /
Sitemap: ${site.origin}/sitemap.xml
`
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

function writeRootPages() {
  fs.writeFileSync(path.join(root, "index.html"), renderHomePage());
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

  writeRootPages();
  cleanGeneratedDir();

  const tutorialPages = paginate(publicArticles);
  tutorialPages.forEach((pageArticles, index) => {
    const page = index + 1;
    const dir = page === 1 ? outputDir : path.join(outputDir, "page", String(page));
    ensureDir(dir);
    const baseRoot = page === 1 ? "../" : "../../../";
    fs.writeFileSync(path.join(dir, "index.html"), renderTutorialIndex(pageArticles, page, tutorialPages.length, baseRoot));
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
