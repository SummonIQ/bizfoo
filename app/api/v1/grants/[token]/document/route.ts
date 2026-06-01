import { NextRequest, NextResponse } from "next/server";
import { corsHeaders } from "@/lib/api-auth";
import { db } from "@/lib/db/client";
import {
  getGuideExportFilename,
  renderGuidePdf,
  resolveGuideExportFormat,
} from "@/lib/guide-documents";
import { getProductGuide } from "@/lib/product-guides";

export async function OPTIONS() {
  return new Response(null, { headers: corsHeaders() });
}

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ token: string }> },
) {
  const { token } = await context.params;
  const headers = corsHeaders();

  const grant = await db.deliveryGrant.findUnique({
    where: { token },
    include: {
      deliverable: {
        include: {
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
  if (!grant) {
    return NextResponse.json({ error: "Not found" }, { status: 404, headers });
  }

  if (
    grant.status === "REVOKED" ||
    grant.status === "EXPIRED" ||
    (grant.expiresAt && grant.expiresAt < new Date())
  ) {
    return NextResponse.json(
      { error: "Grant expired" },
      { status: 410, headers },
    );
  }

  const guide = getProductGuide(grant.deliverable.product);
  if (!guide) {
    return NextResponse.json(
      { error: "Guide not found" },
      { status: 404, headers },
    );
  }

  const format = resolveGuideExportFormat(
    new URL(req.url).searchParams.get("format"),
  );

  if (format === "markdown") {
    return NextResponse.json(
      { error: "Unsupported format for this delivery link" },
      { status: 400, headers },
    );
  }

  const pdf = await renderGuidePdf(guide);
  return new NextResponse(Buffer.from(pdf), {
    headers: {
      ...headers,
      "content-type": "application/pdf",
      "content-disposition": `attachment; filename="${getGuideExportFilename(guide, "pdf")}"`,
      "cache-control": "private, no-store",
    },
  });
}
