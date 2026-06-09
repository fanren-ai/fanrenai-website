import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

import {
  ALLOWED_SEARCH_CRAWLERS,
  BLOCKED_ROBOTS_CRAWLERS,
  DEFAULT_SITE_URL,
  PROTECTED_ROBOT_PATHS,
  SECURITY_HEADERS,
  buildRobotsTxt,
  isAllowedSearchCrawler,
  shouldBlockRequest,
  shouldBypassMiddleware
} from "../src/crawler-policy.ts";

test("robots policy keeps search engines indexable while protecting private paths", () => {
  const robots = buildRobotsTxt();

  assert.match(robots, new RegExp(`Sitemap: ${DEFAULT_SITE_URL}/sitemap\\.xml`));

  for (const crawler of ALLOWED_SEARCH_CRAWLERS) {
    assert.match(robots, new RegExp(`User-agent: ${crawler}\\nAllow: /`));
  }

  for (const protectedPath of PROTECTED_ROBOT_PATHS) {
    assert.match(robots, new RegExp(`Disallow: ${protectedPath}`));
  }

  for (const crawler of BLOCKED_ROBOTS_CRAWLERS) {
    assert.match(robots, new RegExp(`User-agent: ${crawler}\\nDisallow: /`));
  }
});

test("robots policy uses NEXT_PUBLIC_SITE_URL-style values without double slashes", () => {
  const robots = buildRobotsTxt("https://example.com/");

  assert.match(robots, /Sitemap: https:\/\/example\.com\/sitemap\.xml/);
  assert.doesNotMatch(robots, /example\.com\/\/sitemap/);
});

test("middleware policy allows major search crawlers and normal browsers", () => {
  const articlePath = "/tutorials/011-prompt-workflow-basic/";

  assert.equal(isAllowedSearchCrawler("Googlebot/2.1 (+http://www.google.com/bot.html)"), true);
  assert.equal(isAllowedSearchCrawler("Mozilla/5.0 AppleWebKit Baiduspider"), true);
  assert.equal(isAllowedSearchCrawler("Sogou web spider/4.0"), true);
  assert.equal(isAllowedSearchCrawler("360Spider"), true);
  assert.equal(shouldBlockRequest("Googlebot/2.1", articlePath), false);
  assert.equal(shouldBlockRequest("bingbot/2.0", articlePath), false);
  assert.equal(shouldBlockRequest("Mozilla/5.0 Safari/537.36", articlePath), false);
});

test("middleware policy blocks AI crawlers, SEO crawlers, scrapers, and command-line clients", () => {
  const articlePath = "/tutorials/011-prompt-workflow-basic/";
  const blockedAgents = [
    "GPTBot/1.2",
    "ClaudeBot/1.0",
    "CCBot/2.0",
    "Bytespider",
    "PerplexityBot",
    "Amazonbot",
    "AhrefsBot",
    "SemrushBot",
    "MJ12bot",
    "DotBot",
    "curl/8.7.1",
    "Wget/1.21",
    "python-requests/2.31.0",
    "Scrapy/2.11",
    "Go-http-client/1.1"
  ];

  for (const userAgent of blockedAgents) {
    assert.equal(shouldBlockRequest(userAgent, articlePath), true, userAgent);
  }
});

test("middleware policy skips static assets and public SEO files", () => {
  const blockedAgent = "GPTBot/1.2";
  const publicPaths = [
    "/favicon.ico",
    "/robots.txt",
    "/sitemap.xml",
    "/_next/static/chunk.js",
    "/assets/brand/fanrenai-logo-mark.png",
    "/styles.css",
    "/script.js"
  ];

  for (const pathname of publicPaths) {
    assert.equal(shouldBypassMiddleware(pathname), true, pathname);
    assert.equal(shouldBlockRequest(blockedAgent, pathname), false, pathname);
  }

  assert.equal(shouldBypassMiddleware("/tutorials/011-prompt-workflow-basic/"), false);
});

test("security headers are defined for middleware responses", () => {
  assert.equal(SECURITY_HEADERS["X-Content-Type-Options"], "nosniff");
  assert.equal(SECURITY_HEADERS["Referrer-Policy"], "strict-origin-when-cross-origin");
});

test("static deployment applies the same security headers to page responses", () => {
  const vercelConfig = JSON.parse(fs.readFileSync(new URL("../vercel.json", import.meta.url), "utf8"));
  const globalHeaders = vercelConfig.headers.find((item) => item.source === "/(.*)");
  assert.ok(globalHeaders, "missing global Vercel headers for static page responses");

  const headers = new Map(globalHeaders.headers.map((item) => [item.key, item.value]));

  assert.equal(headers.get("X-Content-Type-Options"), SECURITY_HEADERS["X-Content-Type-Options"]);
  assert.equal(headers.get("Referrer-Policy"), SECURITY_HEADERS["Referrer-Policy"]);
});
