import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { renderArticlePage } = require("../scripts/design-system.js");

const sampleArticle = {
  slug: "099-copy-protection-sample",
  title: "轻量防复制测试文章",
  description: "用于确认正文仍然在 HTML 中，且只对正文区域做轻度防复制。",
  categoryName: "Prompt工程",
  status: "published",
  author: "凡人修AI",
  date: "2026-06-09",
  level: "炼气期",
  goal: "确认 SEO 与正文复制保护可以共存。",
  duration: "3分钟",
  practiceTasks: ["保留正文 HTML", "允许代码区复制"],
  html: `<h2>正文标题</h2>
<p>这是一段应当保留在 HTML 中的原创正文。</p>
<div class="copy-block">
  <div class="copy-block-header"><span>可复制提示词</span><button type="button" data-copy-button>复制</button></div>
  <pre><code>请基于我的场景生成一个 Prompt。</code></pre>
</div>`
};

test("published article keeps visible body HTML and SEO metadata indexable", () => {
  const html = renderArticlePage(sampleArticle, []);

  assert.match(html, /<div class="article-content"[^>]*>/);
  assert.match(html, /这是一段应当保留在 HTML 中的原创正文。/);
  assert.match(html, /<script type="application\/ld\+json">/);
  assert.match(html, /<link rel="canonical" href="https:\/\/www\.fanrenai\.cn\/tutorials\/099-copy-protection-sample\/" \/>/);
  assert.doesNotMatch(html, /<meta name="robots" content="(?:noindex|nosnippet|noindex,nofollow)"/);
});

test("article body has copy protection hooks and a copyright notice", () => {
  const html = renderArticlePage(sampleArticle, []);

  assert.match(html, /data-copy-protected="article"/);
  assert.match(html, /本文由凡人修AI原创整理，转载请注明来源。/);
});

test("copy protection styles disable selection only on article body and restore copyable regions", () => {
  const css = fs.readFileSync(new URL("../styles.css", import.meta.url), "utf8");

  assert.match(css, /\.article-content\[data-copy-protected="article"\]\s*\{[^}]*user-select:\s*none;/s);
  assert.match(css, /\.article-content\[data-copy-protected="article"\]\s+(?:code|pre)[^{]*\{[^}]*user-select:\s*text;/s);
  assert.match(css, /\.article-content\[data-copy-protected="article"\]\s+\.copy-block[^{]*\{[^}]*user-select:\s*text;/s);
});

test("copy protection script blocks only protected article copy attempts and shows a gentle tip", () => {
  const js = fs.readFileSync(new URL("../script.js", import.meta.url), "utf8");

  assert.match(js, /内容受保护，如需完整模板请关注公众号「凡人修AI」获取。/);
  assert.match(js, /data-copy-protected="article"/);
  assert.match(js, /contextmenu/);
  assert.match(js, /keydown/);
  assert.match(js, /metaKey/);
  assert.match(js, /ctrlKey/);
  assert.match(js, /copy/);
  assert.match(js, /code, pre, input, textarea/);
  assert.match(js, /\[data-copy-unlocked="true"\]/);
});
