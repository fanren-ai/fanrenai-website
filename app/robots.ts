import type { MetadataRoute } from "next";

import {
  ALLOWED_SEARCH_CRAWLERS,
  BLOCKED_ROBOTS_CRAWLERS,
  DEFAULT_SITE_URL,
  PROTECTED_ROBOT_PATHS,
  normalizeSiteUrl
} from "../src/crawler-policy";

export default function robots(): MetadataRoute.Robots {
  const siteUrl = normalizeSiteUrl(process.env.NEXT_PUBLIC_SITE_URL || DEFAULT_SITE_URL);

  return {
    rules: [
      {
        userAgent: [...ALLOWED_SEARCH_CRAWLERS],
        allow: "/",
        disallow: [...PROTECTED_ROBOT_PATHS]
      },
      {
        userAgent: [...BLOCKED_ROBOTS_CRAWLERS],
        disallow: "/"
      },
      {
        userAgent: "*",
        allow: "/",
        disallow: [...PROTECTED_ROBOT_PATHS]
      }
    ],
    sitemap: `${siteUrl}/sitemap.xml`
  };
}
