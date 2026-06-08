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

function renderTutorialIndex(articles, current = 1, total = 1, baseRoot = "../") {
  const cards = articles.map((article) => renderArticleCard(article, baseRoot)).join("\n");
  const listContent = cards || "<p>内容正在按照新标准重写中</p>";
  const chips = renderCategoryChips(baseRoot);
  return layout({
    title: "AI教程 | 凡人修AI",
    description: "凡人修AI教程系统，覆盖AI入门、Prompt工作流、Codex实战、AI工具箱和AI案例。",
    base: baseRoot,
    body: `<section class="tutorial-hero section-pad">
      <p class="eyebrow">Tutorials</p>
      <h1>AI教程</h1>
      <p>从认识 AI、学会工具，到完成项目，一步步走完普通人的 AI 修炼路径。</p>
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
        <div class="tutorial-list">${listContent}</div>
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

const contentMapLevels = [
  { level: "新手村", sections: ["AI基础认知", "AI工具入门", "AI工具选择"] },
  { level: "炼气期", sections: ["Prompt与工作流", "Prompt工程", "AI办公", "AI工作流", "AI写作与内容创作"] },
  { level: "筑基期", sections: ["AI项目实战", "Codex专区", "Cursor专区", "Claude Code专区"] },
  { level: "结丹期", sections: ["AI副业", "AI产品", "AI创业"] }
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
    description: "凡人修AI内容地图 V1.0，覆盖新手村、炼气期、筑基期、结丹期四个AI修炼阶段。",
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
