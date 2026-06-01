# @summoniq/bizfoo-client-sdk

TypeScript client for the [bizfoo](https://bizfoo.com) public storefront API.

## Install

```sh
npm i @summoniq/bizfoo-client-sdk
```

## Usage

```ts
import { createBizfooClient } from "@summoniq/bizfoo-client-sdk";

const bizfoo = createBizfooClient({
  storefront: "your-storefront-slug",
});

// Anonymous read — no key required
const { products } = await bizfoo.listProducts();
const { product } = await bizfoo.getProduct("nextjs-saas-starter");

// Checkout — requires a public key
const authed = createBizfooClient({
  storefront: "your-storefront-slug",
  publicKey: process.env.BIZFOO_PUBLIC_KEY,
});

const { url } = await authed.createCheckout({
  items: [{ priceId: "price_abc" }],
  email: "buyer@example.com",
  successUrl: "https://your-store.com/success?order={ORDER_ID}",
  cancelUrl: "https://your-store.com/cancel",
});
```

## What you get

- Typed `BizfooProduct`, `BizfooPrice`, `BizfooStorefront`, etc.
- Full storefront content types: features, integrations, assets, how-it-works
  steps, FAQs, highlight stats, code samples, and post-purchase setup steps.
- `BizfooError` with a `status` code for error handling.
- `formatBizfooPrice(price)` helper.

## Defaults

- `baseUrl` defaults to `https://bizfoo.com`.
- `publicKey` is optional for anonymous reads; required for checkout.
- `fetch` defaults to `globalThis.fetch` (works on Node ≥ 18 and browsers).

## License

MIT
