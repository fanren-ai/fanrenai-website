declare module "next" {
  export namespace MetadataRoute {
    type RobotsRule = {
      userAgent?: string | string[];
      allow?: string | string[];
      disallow?: string | string[];
      crawlDelay?: number;
    };

    type Robots = {
      rules?: RobotsRule | RobotsRule[];
      sitemap?: string | string[];
      host?: string;
    };
  }
}

declare module "next/server" {
  export interface NextRequest extends Request {
    nextUrl?: URL;
  }

  export class NextResponse extends Response {
    constructor(body?: BodyInit | null, init?: ResponseInit);
    static next(): NextResponse;
  }
}

declare const process: {
  env: Record<string, string | undefined>;
};
