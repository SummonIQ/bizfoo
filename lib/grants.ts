// Helpers for issuing + reading + redeeming delivery grants. Used by the
// Stripe webhook (auto-issuance), the dashboard (manual reissue), and the
// public API (`/api/v1/grants/[token]/redeem`).

import { db } from "@/lib/db/client";
import { sendEmail, grantEmailHtml } from "@/lib/email";
import { signedDownloadUrl } from "@/lib/blob";
import { getGuideGrantDownloadUrl, syncGuideProductArtifacts } from "@/lib/guide-documents";
import { ghInviteCollaborator } from "@/lib/github";
import { getProductDisplayInfo, getProductGuide } from "@/lib/product-guides";
import type { DeliveryMethod, GrantStatus } from "../generated/prisma/client";

export type IssueGrantInput = {
  orderId: string;
  deliverableId: string;
  email: string;
};

const ACCESS_BASE =
  process.env.NEXT_PUBLIC_STOREFRONT_ACCESS_BASE ??
  "https://summoniq.com/store/access";

export async function issueGrant(input: IssueGrantInput) {
  const deliverable = await db.deliverable.findUnique({
    where: { id: input.deliverableId },
    include: { delivery: true, product: { select: { name: true } } },
  });
  if (!deliverable) throw new Error("Deliverable not found");

  // If a grant already exists for this (order, deliverable, email) reuse it.
  const existing = await db.deliveryGrant.findFirst({
    where: {
      orderId: input.orderId,
      deliverableId: input.deliverableId,
      email: input.email,
    },
  });
  if (existing) return existing;

  const cfg = deliverable.delivery;
  const ttl = cfg?.ttlMinutes ?? 1440;
  const expiresAt = ttl > 0 ? new Date(Date.now() + ttl * 60 * 1000) : null;

  const grant = await db.deliveryGrant.create({
    data: {
      orderId: input.orderId,
      deliverableId: input.deliverableId,
      email: input.email,
      status: "ACTIVE",
      expiresAt,
      maxRedeems: cfg?.maxRedeems ?? null,
    },
  });

  // Fire-and-forget email. Errors are logged but not thrown so a flaky
  // Resend call doesn't block grant creation (the access URL still works
  // from the success page).
  if (input.email && process.env.RESEND_API_KEY) {
    const accessUrl = `${ACCESS_BASE}/${grant.token}`;
    sendEmail({
      to: input.email,
      subject:
        cfg?.emailSubject ??
        `Your ${deliverable.product.name} delivery is ready`,
      html: grantEmailHtml({
        productName: deliverable.product.name,
        deliverableTitle: deliverable.title,
        accessUrl,
        expiresAt,
        customBody: cfg?.emailBody ?? null,
      }),
      text: `Your purchase is ready.\n\n${cfg?.emailBody ?? ""}\n\nAccess: ${accessUrl}${expiresAt ? `\nExpires: ${expiresAt.toISOString()}` : ""}`,
    }).catch((err) => {
      console.error("[grant email] send failed", err);
    });
  }

  return grant;
}

/** Issue grants for every deliverable on every product in an order. */
export async function issueGrantsForOrder(orderId: string) {
  const order = await db.order.findUnique({
    where: { id: orderId },
    include: {
      items: {
        include: {
          product: {
            include: {
              deliverables: { where: { status: { not: "ARCHIVED" } } },
            },
          },
        },
      },
    },
  });
  if (!order) return [];

  const created: Awaited<ReturnType<typeof issueGrant>>[] = [];
  for (const item of order.items) {
    const guide = getProductGuide(item.product);
    const deliverables = guide
      ? [
          await syncGuideProductArtifacts({
            productId: item.product.id,
            guide,
          }),
        ]
      : item.product.deliverables;

    for (const d of deliverables) {
      const g = await issueGrant({
        orderId: order.id,
        deliverableId: d.id,
        email: order.email,
      });
      created.push(g);
    }
  }
  return created;
}

export type SetupInputPayload = {
  id: string;
  key: string;
  label: string;
  description: string | null;
  inputType: string;
  placeholder: string | null;
  helpUrl: string | null;
  required: boolean;
  choices: string[];
};

export type SetupStepPayload = {
  id: string;
  title: string;
  description: string | null;
  category: string | null;
  required: boolean;
  helpUrl: string | null;
  inputs: SetupInputPayload[];
};

export type GrantPayload = {
  token: string;
  status: GrantStatus;
  method: DeliveryMethod;
  product: { name: string; slug: string };
  deliverable: { title: string; type: string };
  expiresAt: string | null;
  redeemCount: number;
  maxRedeems: number | null;
  // Method-specific payload returned to the storefront/buyer:
  emailSubject: string | null;
  emailBody: string | null;
  /**
   * The actual access URL — only set when redeeming actually grants access.
   * For DIRECT_DOWNLOAD bizfoo issues a temporary URL that is meant to be
   * proxied behind the storefront's auth.
   */
  url: string | null;
  repo: { owner: string; name: string } | null;
  /** Post-purchase setup checklist for the buyer. */
  setupSteps: SetupStepPayload[];
};

export async function loadGrant(token: string): Promise<GrantPayload | null> {
  const grant = await db.deliveryGrant.findUnique({
    where: { token },
    include: {
      deliverable: {
        include: {
          delivery: true,
          product: {
            select: {
              name: true,
              slug: true,
              metadata: true,
              setupSteps: {
                orderBy: { position: "asc" },
                include: { inputs: { orderBy: { position: "asc" } } },
              },
            },
          },
        },
      },
    },
  });
  if (!grant) return null;

  // Auto-expire if past expiry
  let status = grant.status;
  if (status === "ACTIVE" && grant.expiresAt && grant.expiresAt < new Date()) {
    status = "EXPIRED";
    await db.deliveryGrant.update({
      where: { id: grant.id },
      data: { status: "EXPIRED" },
    });
  }

  const cfg = grant.deliverable.delivery;
  const guide = getProductGuide(grant.deliverable.product);
  const display = getProductDisplayInfo(grant.deliverable.product);
  return {
    token: grant.token,
    status,
    method: cfg?.method ?? "EXTERNAL_LINK",
    product: {
      name: display.title,
      slug: display.slug,
    },
    deliverable: {
      title: grant.deliverable.title,
      type: grant.deliverable.type,
    },
    expiresAt: grant.expiresAt?.toISOString() ?? null,
    redeemCount: grant.redeemCount,
    maxRedeems: grant.maxRedeems,
    emailSubject: cfg?.emailSubject ?? null,
    emailBody: cfg?.emailBody ?? null,
    url: cfg?.method === "EXTERNAL_LINK" ? cfg?.externalUrl ?? null : null,
    repo:
      cfg?.method === "GITHUB_INVITE" && cfg.repoOwner && cfg.repoName
        ? { owner: cfg.repoOwner, name: cfg.repoName }
        : null,
    setupSteps: guide
      ? []
      : grant.deliverable.product.setupSteps.map((s) => ({
          id: s.id,
          title: s.title,
          description: s.description,
          category: s.category,
          required: s.required,
          helpUrl: s.helpUrl,
          inputs: s.inputs.map((inp) => ({
            id: inp.id,
            key: inp.key,
            label: inp.label,
            description: inp.description,
            inputType: inp.inputType,
            placeholder: inp.placeholder,
            helpUrl: inp.helpUrl,
            required: inp.required,
            choices: inp.choices,
          })),
        })),
  };
}

/** Records a redemption + returns the actionable URL (or null if N/A). */
export async function redeemGrant(token: string): Promise<{
  url: string | null;
  status: GrantStatus;
  reason?: string;
}> {
  const grant = await db.deliveryGrant.findUnique({
    where: { token },
    include: {
      deliverable: {
        include: {
          delivery: true,
          product: {
            select: {
              slug: true,
              metadata: true,
            },
          },
        },
      },
    },
  });
  if (!grant) return { url: null, status: "REVOKED", reason: "Not found" };

  if (grant.status === "EXPIRED" || (grant.expiresAt && grant.expiresAt < new Date())) {
    if (grant.status !== "EXPIRED") {
      await db.deliveryGrant.update({
        where: { id: grant.id },
        data: { status: "EXPIRED" },
      });
    }
    return { url: null, status: "EXPIRED", reason: "Grant expired" };
  }
  if (grant.status === "REVOKED") {
    return { url: null, status: "REVOKED", reason: "Grant revoked" };
  }
  if (
    grant.maxRedeems != null &&
    grant.redeemCount >= grant.maxRedeems
  ) {
    return { url: null, status: "REDEEMED", reason: "Redeem limit reached" };
  }

  const cfg = grant.deliverable.delivery;
  const guide = getProductGuide(grant.deliverable.product);
  let url: string | null = null;
  if (cfg?.method === "EXTERNAL_LINK") {
    url = cfg.externalUrl;
  } else if (cfg?.method === "EMAIL_LINK" || cfg?.method === "DIRECT_DOWNLOAD") {
    if (guide && cfg.method === "DIRECT_DOWNLOAD") {
      url = getGuideGrantDownloadUrl(token, "pdf");
    } else if (cfg.assetUrl) {
      // Sign Vercel Blob URLs with a TTL matching the grant config; for
      // any other host this returns the URL as-is.
      url = await signedDownloadUrl({
        assetUrl: cfg.assetUrl,
        ttlSeconds: Math.min((cfg.ttlMinutes || 60) * 60, 7 * 24 * 60 * 60),
      });
    }
  } else if (cfg?.method === "GITHUB_INVITE") {
    // GH invites need a username — handled by `redeemGitHubInvite` below.
    return {
      url: null,
      status: grant.status,
      reason: "Use the GitHub invite endpoint to claim this grant",
    };
  }

  const newCount = grant.redeemCount + 1;
  const reachedMax =
    grant.maxRedeems != null && newCount >= grant.maxRedeems;

  await db.deliveryGrant.update({
    where: { id: grant.id },
    data: {
      redeemCount: newCount,
      redeemedAt: grant.redeemedAt ?? new Date(),
      status: reachedMax ? "REDEEMED" : "ACTIVE",
    },
  });

  return {
    url,
    status: reachedMax ? "REDEEMED" : "ACTIVE",
  };
}

/**
 * Claim a GITHUB_INVITE grant by sending a collaborator invite to the given
 * GitHub username. Stores the username on the grant and returns the
 * resulting invite URL.
 */
export async function redeemGitHubInvite(
  token: string,
  githubLogin: string,
): Promise<{ url: string | null; status: GrantStatus; reason?: string }> {
  const grant = await db.deliveryGrant.findUnique({
    where: { token },
    include: { deliverable: { include: { delivery: true } } },
  });
  if (!grant) return { url: null, status: "REVOKED", reason: "Not found" };
  if (grant.status === "EXPIRED" || (grant.expiresAt && grant.expiresAt < new Date())) {
    return { url: null, status: "EXPIRED", reason: "Grant expired" };
  }
  if (grant.status === "REVOKED") {
    return { url: null, status: "REVOKED", reason: "Grant revoked" };
  }

  const cfg = grant.deliverable.delivery;
  if (cfg?.method !== "GITHUB_INVITE" || !cfg.repoOwner || !cfg.repoName) {
    return { url: null, status: grant.status, reason: "Not a GitHub grant" };
  }
  if (!githubLogin || !/^[a-z\d](?:[a-z\d]|-(?=[a-z\d])){0,38}$/i.test(githubLogin)) {
    return { url: null, status: grant.status, reason: "Invalid GitHub username" };
  }

  let inviteUrl: string;
  try {
    const res = await ghInviteCollaborator({
      owner: cfg.repoOwner,
      repo: cfg.repoName,
      username: githubLogin,
      permission: "pull",
    });
    inviteUrl = res.html_url;
  } catch (err) {
    const msg = err instanceof Error ? err.message : "GitHub invite failed";
    return { url: null, status: grant.status, reason: msg };
  }

  await db.deliveryGrant.update({
    where: { id: grant.id },
    data: {
      githubLogin,
      redeemCount: grant.redeemCount + 1,
      redeemedAt: grant.redeemedAt ?? new Date(),
      status: "REDEEMED",
    },
  });

  return { url: inviteUrl, status: "REDEEMED" };
}
