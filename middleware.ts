import { NextResponse, type NextRequest } from "next/server";

import { SECURITY_HEADERS, setSecurityHeaders, shouldBlockRequest, shouldBypassMiddleware } from "./src/crawler-policy";

export function middleware(request: NextRequest): NextResponse {
  const pathname = request.nextUrl?.pathname || new URL(request.url).pathname;

  if (shouldBypassMiddleware(pathname)) {
    return NextResponse.next();
  }

  if (shouldBlockRequest(request.headers.get("user-agent"), pathname)) {
    return new NextResponse("Forbidden", {
      status: 403,
      headers: SECURITY_HEADERS
    });
  }

  const response = NextResponse.next();
  setSecurityHeaders(response.headers);
  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\.(?:avif|css|eot|gif|ico|jpeg|jpg|js|json|map|mjs|otf|png|svg|ttf|txt|webmanifest|webp|woff|woff2|xml)$).*)"
  ]
};
