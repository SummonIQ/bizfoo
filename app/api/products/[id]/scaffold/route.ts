import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { ensureOrganizationContext } from "@/lib/organization";
import { ghCreateRepo, ghPutFile } from "@/lib/github";

export async function POST(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const auth = await ensureOrganizationContext();
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await context.params;
  const product = await db.product.findFirst({
    where: { id, storefront: { organizationId: auth.organization.id } },
    include: { buildPlan: true },
  });
  if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const repoName = `bizfoo-${product.slug}`;

  let repo;
  try {
    repo = await ghCreateRepo({
      name: repoName,
      description: product.tagline ?? `${product.name} — bizfoo product`,
      private: true,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 502 });
  }

  // Seed README + spec from build plan if present
  const plan = product.buildPlan;
  const readme = `# ${product.name}\n\n${product.tagline ?? ""}\n\n${product.description ?? ""}\n`;
  const spec =
    `# Spec — ${product.name}\n\n` +
    `## Problem\n${plan?.problem ?? "_TBD_"}\n\n` +
    `## Audience\n${plan?.audience ?? "_TBD_"}\n\n` +
    `## Outcome\n${plan?.outcome ?? "_TBD_"}\n\n` +
    `## In scope\n${plan?.scope ?? "_TBD_"}\n\n` +
    `## Out of scope\n${plan?.outOfScope ?? "_TBD_"}\n\n` +
    `## Tech notes\n${plan?.techNotes ?? "_TBD_"}\n`;

  try {
    await ghPutFile({
      owner: repo.owner.login,
      repo: repo.name,
      path: "README.md",
      content: readme,
      message: "chore: README from bizfoo",
    });
    await ghPutFile({
      owner: repo.owner.login,
      repo: repo.name,
      path: "docs/SPEC.md",
      content: spec,
      message: "chore: SPEC from bizfoo",
    });
  } catch {
    // Non-fatal; the repo is created either way.
  }

  // Persist on build plan + create a deliverable entry
  await db.buildPlan.upsert({
    where: { productId: id },
    create: {
      productId: id,
      stage: "SCAFFOLDED",
      repoUrl: repo.html_url,
      scaffoldedAt: new Date(),
    },
    update: {
      stage: "SCAFFOLDED",
      repoUrl: repo.html_url,
      scaffoldedAt: new Date(),
    },
  });

  // Create a Source Repo deliverable if there isn't one already
  const existing = await db.deliverable.findUnique({
    where: { productId_slug: { productId: id, slug: "repo" } },
  });
  if (!existing) {
    const last = await db.deliverable.findFirst({
      where: { productId: id },
      orderBy: { position: "desc" },
    });
    await db.deliverable.create({
      data: {
        productId: id,
        title: "Source repository",
        slug: "repo",
        type: "REPO",
        status: "IN_PROGRESS",
        access: "BUYERS_ONLY",
        url: repo.html_url,
        position: (last?.position ?? -1) + 1,
      },
    });
  } else if (!existing.url) {
    await db.deliverable.update({
      where: { id: existing.id },
      data: { url: repo.html_url, status: "IN_PROGRESS" },
    });
  }

  return NextResponse.json({ url: repo.html_url, fullName: repo.full_name });
}
