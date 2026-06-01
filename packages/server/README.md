# @summoniq/bizfoo-server-sdk

Server-side TypeScript client for the [bizfoo](https://bizfoo.com) storefront API.

## Install

```sh
npm i @summoniq/bizfoo-server-sdk
```

## Usage

```ts
import { createBizfooServerClient } from "@summoniq/bizfoo-server-sdk";

const bizfoo = createBizfooServerClient({
  storefront: "summoniq",
  apiKey: process.env.BIZFOO_PUBLIC_KEY,
});

const { products } = await bizfoo.listProducts();
const { product } = await bizfoo.getProduct("tech-lead-guide");
const guide = await bizfoo.getPurchasedGuide("tech-lead-guide", "buyer@example.com");
```

## What you get

- Typed storefront product and guide responses.
- Server-oriented request controls (`cache`, `next`, and custom fetch).
- `BizfooError` with a `status` code for error handling.

## Defaults

- `baseUrl` defaults to `https://bizfoo.com`.
- `apiKey` is optional for public reads and required for purchased guide access.
- `fetch` defaults to `globalThis.fetch`.

## License

MIT
