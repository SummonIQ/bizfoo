// @summoniq/bizfoo-server-sdk: a server-side typed client for the bizfoo
// storefront API.

export type PriceInterval = "ONE_TIME" | "MONTH" | "YEAR";

export type BizfooPrice = {
  id: string;
  amount: number;
  currency: string;
  interval: PriceInterval;
  intervalCount: number;
  nickname: string | null;
};

export type BizfooBuildStage =
  | "IDEA"
  | "SPEC"
  | "SCAFFOLDED"
  | "IN_DEV"
  | "ALPHA"
  | "BETA"
  | "RELEASED";

export type BizfooFeature = {
  icon: string | null;
  title: string;
  desc: string;
};

export type BizfooIntegration = {
  name: string;
  purpose: string;
  required: boolean;
};

export type BizfooAsset = {
  label: string;
  detail: string;
};

export type BizfooHowStep = {
  title: string;
  desc: string;
};

export type BizfooFaq = {
  q: string;
  a: string;
};

export type BizfooHighlight = {
  value: string;
  label: string;
};

export type BizfooDependency = {
  name: string;
  purpose: string | null;
  version: string | null;
  category: string | null;
  required: boolean;
  homepageUrl: string | null;
};

export type BizfooCodeSample = {
  lang: string;
  filename?: string;
  code: string;
};

export type BizfooSetupInputType =
  | "TEXT"
  | "SECRET"
  | "URL"
  | "EMAIL"
  | "COLOR"
  | "BOOLEAN"
  | "CHOICE"
  | "FILE"
  | "INTEGRATION";

export type BizfooSetupInput = {
  id: string;
  key: string;
  label: string;
  description: string | null;
  inputType: BizfooSetupInputType;
  placeholder: string | null;
  helpUrl: string | null;
  required: boolean;
  choices: string[];
};

export type BizfooSetupStep = {
  id: string;
  title: string;
  description: string | null;
  category: string | null;
  required: boolean;
  helpUrl: string | null;
  inputs: BizfooSetupInput[];
};

export type BizfooGuideWaypoint = {
  id: string;
  label: string;
};

export type BizfooGuideChapter = {
  id: string;
  title: string;
  minutes: number;
  summary: string;
  sample: string;
  body?: string;
  waypoints?: BizfooGuideWaypoint[];
};

export type BizfooGuide = {
  slug: string;
  title: string;
  subtitle: string;
  sampleChapterCount: number;
  chapters: BizfooGuideChapter[];
};

export type BizfooProduct = {
  id: string;
  slug: string;
  name: string;
  tagline: string | null;
  description: string | null;
  longDescription?: string | null;
  category: string | null;
  badge: string | null;
  imageUrl: string | null;
  stack: string[];
  relatedSlugs?: string[];
  demoUrl?: string | null;
  stage: BizfooBuildStage;
  prices: BizfooPrice[];
  codeSample?: BizfooCodeSample | null;
  features?: BizfooFeature[];
  integrations?: BizfooIntegration[];
  assets?: BizfooAsset[];
  howItWorks?: BizfooHowStep[];
  faqs?: BizfooFaq[];
  highlights?: BizfooHighlight[];
  dependencies?: BizfooDependency[];
  setupSteps?: BizfooSetupStep[];
  guide?: BizfooGuide | null;
};

export type BizfooStorefront = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  currency: string;
};

export type ListProductsResponse = {
  storefront: BizfooStorefront;
  products: BizfooProduct[];
};

export type GetProductResponse = {
  product: BizfooProduct;
};

export type GetPurchasedGuideResponse = {
  guide: BizfooGuide;
};

export type NextFetchConfig = {
  revalidate?: number | false;
  tags?: string[];
};

export type BizfooServerRequestInit = RequestInit & {
  next?: NextFetchConfig;
};

export type BizfooServerClientOptions = {
  storefront: string;
  apiKey?: string;
  baseUrl?: string;
  fetch?: typeof fetch;
  requestInit?: BizfooServerRequestInit;
};

const DEFAULT_BASE_URL = "https://bizfoo.com";

export function createBizfooServerClient(options: BizfooServerClientOptions) {
  const baseUrl = (options.baseUrl ?? DEFAULT_BASE_URL).replace(/\/$/, "");
  const f = options.fetch ?? globalThis.fetch;

  async function request<T>(
    path: string,
    init: BizfooServerRequestInit = {},
    { requireAuth = false }: { requireAuth?: boolean } = {},
  ): Promise<T> {
    const headers = new Headers(options.requestInit?.headers);
    new Headers(init.headers).forEach((value, key) => headers.set(key, value));

    if (options.apiKey) {
      headers.set("authorization", `Bearer ${options.apiKey}`);
    } else if (requireAuth) {
      throw new BizfooError(
        401,
        "apiKey is required for this operation (pass it to createBizfooServerClient)",
      );
    }

    if (init.body && !headers.has("content-type")) {
      headers.set("content-type", "application/json");
    }

    const res = await f(`${baseUrl}${path}`, {
      ...options.requestInit,
      ...init,
      headers,
      next: init.next ?? options.requestInit?.next,
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new BizfooError(res.status, text || res.statusText);
    }

    return (await res.json()) as T;
  }

  return {
    listProducts(
      init?: BizfooServerRequestInit,
    ): Promise<ListProductsResponse> {
      return request(`/api/v1/storefronts/${options.storefront}/products`, init);
    },

    getProduct(
      productSlug: string,
      init?: BizfooServerRequestInit,
    ): Promise<GetProductResponse> {
      return request(
        `/api/v1/storefronts/${options.storefront}/products/${productSlug}`,
        init,
      );
    },

    async getPurchasedGuide(
      productSlug: string,
      email: string,
      init?: BizfooServerRequestInit,
    ): Promise<BizfooGuide> {
      const params = new URLSearchParams({ email });
      const res = await request<GetPurchasedGuideResponse>(
        `/api/v1/storefronts/${options.storefront}/products/${productSlug}/guide?${params.toString()}`,
        init,
        { requireAuth: true },
      );
      return res.guide;
    },
  };
}

export class BizfooError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = "BizfooError";
  }
}
