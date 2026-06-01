import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import {
  getGuideExportFilename,
  renderGuideMarkdown,
  renderGuidePdf,
  resolveGuideExportFormat,
} from "@/lib/guide-documents";
import { ensureOrganizationContext } from "@/lib/organization";
import { getProductGuide } from "@/lib/product-guides";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const auth = await ensureOrganizationContext();
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const product = await db.product.findFirst({
    where: {
      id,
      storefront: { organizationId: auth.organization.id },
    },
    select: { slug: true, metadata: true },
  });
  if (!product) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const guide = getProductGuide(product);
  if (!guide) {
    return NextResponse.json({ error: "Guide not found" }, { status: 404 });
  }

  const format = resolveGuideExportFormat(
    new URL(req.url).searchParams.get("format"),
  );

  if (format === "markdown") {
    return new NextResponse(renderGuideMarkdown(guide), {
      headers: {
        "content-type": "text/markdown; charset=utf-8",
        "content-disposition": `attachment; filename="${getGuideExportFilename(guide, "markdown")}"`,
      },
    });
  }

  const pdf = await renderGuidePdf(guide);
  return new NextResponse(Buffer.from(pdf), {
    headers: {
      "content-type": "application/pdf",
      "content-disposition": `inline; filename="${getGuideExportFilename(guide, "pdf")}"`,
      "cache-control": "no-store",
    },
  });
}
