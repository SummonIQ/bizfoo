// @summoniq/bizfoo-client-sdk: a thin typed client for the public bizfoo storefront API.
//
// Anonymous reads are supported for listProducts() and getProduct(). A
// publicKey is only required for authenticated actions like createCheckout().

// ─── Shared types ─────────────────────────────────────────────────────

export type PriceInterval = "ONE_TIME" | "MONTH" | "YEAR";

export type BizfooPrice = {
  id: string;
  amount: number;
  currency: string;
  interval: PriceInterval;
  intervalCount: number;
  nickname: string | null;
  stripePriceId?: string | null;
};

export type BizfooServiceConfig = {
  kind: "app" | "bundle" | "service";
  includedInBundle?: boolean;
  entitlementKey?: string;
  accent?: string;
  platforms?: string[];
  serviceLevel?: "self_serve" | "managed" | "concierge";
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

export type BizfooHighlightStat = {
  value: string;
  label: string;
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

export type BizfooProduct = {
  id: string;
  slug: string;
  name: string;
  tagline: string | null;
  description: string | null;
  /** Long marketing description, shown on the product detail page. */
  longDescription?: string | null;
  category: string | null;
  badge: string | null;
  imageUrl: string | null;
  metadata?: Record<string, unknown> | null;
  serviceConfig?: BizfooServiceConfig | null;
  stack: string[];
  /** Slugs of related products in the same storefront. */
  relatedSlugs?: string[];
  /** Build stage from the product's BuildPlan in bizfoo. Defaults to IDEA. */
  stage: BizfooBuildStage;
  prices: BizfooPrice[];
  // Storefront content — only present on the per-product detail endpoint.
  codeSample?: BizfooCodeSample | null;
  features?: BizfooFeature[];
  integrations?: BizfooIntegration[];
  assets?: BizfooAsset[];
  howItWorks?: BizfooHowStep[];
  faqs?: BizfooFaq[];
  highlights?: BizfooHighlightStat[];
  setupSteps?: BizfooSetupStep[];
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

export type CheckoutItem = { priceId: string; quantity?: number };

export type CreateCheckoutInput = {
  items: CheckoutItem[];
  email?: string;
  successUrl?: string;
  cancelUrl?: string;
};

export type CreateCheckoutResponse = {
  url: string;
  sessionId: string;
  orderId: string;
};

// ─── Client ───────────────────────────────────────────────────────────

export type BizfooClientOptions = {
  /** Storefront slug (e.g. "summoniq"). */
  storefront: string;
  /** Public key — optional for anonymous reads, required for checkout. */
  publicKey?: string;
  /** Base URL override. Defaults to the bizfoo production URL. */
  baseUrl?: string;
  /** Custom fetch implementation (useful for Node < 18 or instrumentation). */
  fetch?: typeof fetch;
};

const DEFAULT_BASE_URL = "https://bizfoo.com";

export function createBizfooClient(options: BizfooClientOptions) {
  const baseUrl = (options.baseUrl ?? DEFAULT_BASE_URL).replace(/\/$/, "");
  const f = options.fetch ?? globalThis.fetch;

  async function request<T>(
    path: string,
    init: RequestInit = {},
    { requireAuth = false }: { requireAuth?: boolean } = {},
  ): Promise<T> {
    const headers = new Headers(init.headers);
    if (options.publicKey) {
      headers.set("authorization", `Bearer ${options.publicKey}`);
    } else if (requireAuth) {
      throw new BizfooError(
        401,
        "publicKey is required for this operation (pass it to createBizfooClient)",
      );
    }
    if (init.body && !headers.has("content-type")) {
      headers.set("content-type", "application/json");
    }
    const res = await f(`${baseUrl}${path}`, { ...init, headers });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new BizfooError(res.status, text || res.statusText);
    }
    return (await res.json()) as T;
  }

  return {
    listProducts(): Promise<ListProductsResponse> {
      return request(`/api/v1/storefronts/${options.storefront}/products`);
    },
    getProduct(productSlug: string): Promise<GetProductResponse> {
      return request(
        `/api/v1/storefronts/${options.storefront}/products/${productSlug}`,
      );
    },
    createCheckout(
      input: CreateCheckoutInput,
    ): Promise<CreateCheckoutResponse> {
      return request(
        `/api/v1/storefronts/${options.storefront}/checkout`,
        { method: "POST", body: JSON.stringify(input) },
        { requireAuth: true },
      );
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

// ─── Helpers ──────────────────────────────────────────────────────────

export function formatBizfooPrice(price: BizfooPrice) {
  const formatted = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: price.currency.toUpperCase(),
    maximumFractionDigits: 0,
  }).format(price.amount / 100);
  if (price.interval === "ONE_TIME") return formatted;
  return `${formatted}/${price.interval === "MONTH" ? "mo" : "yr"}`;
}
