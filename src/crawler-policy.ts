export const DEFAULT_SITE_URL = "https://www.fanrenai.cn";

export const ALLOWED_SEARCH_CRAWLERS = [
  "Googlebot",
  "Bingbot",
  "Baiduspider",
  "Sogou",
  "360Spider"
] as const;

export const BLOCKED_ROBOTS_CRAWLERS = [
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
] as const;

export const PROTECTED_ROBOT_PATHS = ["/api/", "/admin/", "/private/", "/_next/"] as const;

export const SECURITY_HEADERS = {
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin"
} as const;

const ALLOWED_SEARCH_CRAWLER_PATTERNS: ReadonlyArray<RegExp> = [
  /\bGooglebot\b/i,
  /\bBingbot\b/i,
  /\bBaiduspider\b/i,
  /\bSogou\b/i,
  /\b360Spider\b/i
];

const BLOCKED_CRAWLER_PATTERNS: ReadonlyArray<RegExp> = [
  /\bGPTBot\b/i,
  /\bClaudeBot\b/i,
  /\bClaude-Web\b/i,
  /\bCCBot\b/i,
  /\bBytespider\b/i,
  /\bPerplexityBot\b/i,
  /\bPerplexity-User\b/i,
  /\bAmazonbot\b/i,
  /\bAhrefsBot\b/i,
  /\bSemrushBot\b/i,
  /\bMJ12bot\b/i,
  /\bDotBot\b/i,
  /\bDataForSeoBot\b/i,
  /\bPetalBot\b/i,
  /\bBLEXBot\b/i,
  /\bBarkrowler\b/i,
  /\bMegaIndex\b/i,
  /\bSeekportBot\b/i,
  /\bserpstatbot\b/i,
  /\bScreaming Frog SEO Spider\b/i
];

const BLOCKED_CLIENT_PATTERNS: ReadonlyArray<RegExp> = [
  /\bcurl\b/i,
  /\bWget\b/i,
  /\bpython-requests\b/i,
  /\bScrapy\b/i,
  /\bGo-http-client\b/i,
  /\bhttpx\b/i,
  /\baiohttp\b/i,
  /\blibwww-perl\b/i,
  /\bHTTrack\b/i,
  /\bApache-HttpClient\b/i
];

const PUBLIC_FILE_PATHS = new Set([
  "/favicon.ico",
  "/robots.txt",
  "/sitemap.xml",
  "/sitemap-index.xml"
]);

const STATIC_PATH_PREFIXES = ["/_next/", "/assets/"] as const;
const STATIC_FILE_EXTENSION_PATTERN =
  /\.(?:avif|css|eot|gif|ico|jpeg|jpg|js|json|map|mjs|otf|png|svg|ttf|txt|webmanifest|webp|woff|woff2|xml)$/i;

function hasMatch(value: string, patterns: ReadonlyArray<RegExp>): boolean {
  return patterns.some((pattern) => pattern.test(value));
}

function normalizeUserAgent(userAgent: string | null | undefined): string {
  return String(userAgent || "").trim();
}

function normalizePathname(pathname: string | null | undefined): string {
  const value = String(pathname || "/").trim() || "/";

  try {
    return new URL(value, "https://local.fanrenai.cn").pathname || "/";
  } catch {
    return value.split(/[?#]/, 1)[0] || "/";
  }
}

export function normalizeSiteUrl(siteUrl: string | null | undefined = DEFAULT_SITE_URL): string {
  const value = String(siteUrl || DEFAULT_SITE_URL).trim() || DEFAULT_SITE_URL;
  return value.replace(/\/+$/, "");
}

export function isAllowedSearchCrawler(userAgent: string | null | undefined): boolean {
  const ua = normalizeUserAgent(userAgent);
  return Boolean(ua) && hasMatch(ua, ALLOWED_SEARCH_CRAWLER_PATTERNS);
}

export function isBlockedCrawlerUserAgent(userAgent: string | null | undefined): boolean {
  const ua = normalizeUserAgent(userAgent);
  return Boolean(ua) && hasMatch(ua, [...BLOCKED_CRAWLER_PATTERNS, ...BLOCKED_CLIENT_PATTERNS]);
}

export function shouldBypassMiddleware(pathname: string | null | undefined): boolean {
  const normalizedPathname = normalizePathname(pathname);

  if (PUBLIC_FILE_PATHS.has(normalizedPathname)) {
    return true;
  }

  if (STATIC_PATH_PREFIXES.some((prefix) => normalizedPathname.startsWith(prefix))) {
    return true;
  }

  return STATIC_FILE_EXTENSION_PATTERN.test(normalizedPathname);
}

export function shouldBlockRequest(userAgent: string | null | undefined, pathname: string | null | undefined): boolean {
  if (shouldBypassMiddleware(pathname)) {
    return false;
  }

  const ua = normalizeUserAgent(userAgent);
  if (!ua) {
    return false;
  }

  if (isAllowedSearchCrawler(ua) && !isBlockedCrawlerUserAgent(ua)) {
    return false;
  }

  return isBlockedCrawlerUserAgent(ua);
}

export function setSecurityHeaders(headers: Headers): Headers {
  Object.entries(SECURITY_HEADERS).forEach(([name, value]) => {
    headers.set(name, value);
  });

  return headers;
}

export function buildRobotsTxt(siteUrl: string | null | undefined = DEFAULT_SITE_URL): string {
  const allowSections = ALLOWED_SEARCH_CRAWLERS.map((crawler) =>
    [`User-agent: ${crawler}`, "Allow: /", ...PROTECTED_ROBOT_PATHS.map((item) => `Disallow: ${item}`)].join("\n")
  );

  const blockSections = BLOCKED_ROBOTS_CRAWLERS.map((crawler) => [`User-agent: ${crawler}`, "Disallow: /"].join("\n"));

  const defaultSection = ["User-agent: *", "Allow: /", ...PROTECTED_ROBOT_PATHS.map((item) => `Disallow: ${item}`)].join(
    "\n"
  );

  return `${[...allowSections, ...blockSections, defaultSection].join("\n\n")}\n\nSitemap: ${normalizeSiteUrl(
    siteUrl
  )}/sitemap.xml\n`;
}
