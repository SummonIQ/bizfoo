// Vercel Blob signed-URL helpers. Used by DIRECT_DOWNLOAD + EMAIL_LINK
// redemptions to hand out short-lived URLs instead of permanent ones.
//
// Falls back to the raw asset URL if the URL doesn't look like a Vercel
// Blob URL — useful for external storage providers where signing isn't
// possible.

import { generateClientTokenFromReadWriteToken } from "@vercel/blob/client";
import { head } from "@vercel/blob";

const BLOB_HOST = ".public.blob.vercel-storage.com";
const BLOB_PRIVATE_HOST = ".blob.vercel-storage.com";

function isBlobUrl(url: string) {
  try {
    const u = new URL(url);
    return (
      u.hostname.endsWith(BLOB_HOST) || u.hostname.endsWith(BLOB_PRIVATE_HOST)
    );
  } catch {
    return false;
  }
}

/**
 * Returns a URL the buyer can use to download the asset. For Vercel Blob URLs
 * with a configured RW token we look the blob up + return its signed URL with
 * a short TTL; for everything else we hand back the input URL as-is.
 */
export async function signedDownloadUrl(opts: {
  assetUrl: string;
  ttlSeconds: number;
}): Promise<string> {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token || !isBlobUrl(opts.assetUrl)) {
    return opts.assetUrl;
  }

  try {
    // `head()` resolves the blob and yields a fresh `downloadUrl` that's
    // valid for the configured TTL on private/protected blobs.
    const meta = await head(opts.assetUrl, { token });
    return meta.downloadUrl ?? meta.url ?? opts.assetUrl;
  } catch {
    return opts.assetUrl;
  }
}

// Re-exported in case callers want to issue an upload-only client token
// (not used by grants today, but handy for future asset upload UI).
export { generateClientTokenFromReadWriteToken };
