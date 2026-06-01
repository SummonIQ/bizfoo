import { db } from "@/lib/db/client";

export async function getStorefrontByPublicKey(req: Request) {
  const auth = req.headers.get("authorization") ?? "";
  const key = auth.startsWith("Bearer ") ? auth.slice(7) : null;
  if (!key) return null;
  const storefront = await db.storefront.findUnique({
    where: { publicKey: key },
  });
  if (!storefront || !storefront.active) return null;
  return storefront;
}

export async function getStorefrontBySecretKey(req: Request) {
  const auth = req.headers.get("authorization") ?? "";
  const key = auth.startsWith("Bearer ") ? auth.slice(7) : null;
  if (!key) return null;
  const storefront = await db.storefront.findFirst({
    where: { secretKey: key },
  });
  if (!storefront || !storefront.active) return null;
  return storefront;
}

export function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "authorization, content-type",
  };
}
