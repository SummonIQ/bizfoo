import { describe, expect, mock, test } from "bun:test";
import type { ProductGuide } from "@/lib/product-guides";

const guide: ProductGuide = {
  slug: "tech-lead-guide",
  title: "Tech Lead Guide",
  subtitle: "A practical operating guide.",
  sampleChapterCount: 1,
  chapters: [
    {
      id: "first",
      title: "First Month",
      minutes: 20,
      summary: "Learn the system before changing it.",
      sample: "Sample content",
      body: "## Start Here\n\nBuild context before changing process.",
    },
  ],
};

const productFindFirst = mock(async () => ({
  slug: "tech-lead-guide",
  metadata: { guide },
}));

mock.module("server-only", () => ({}));
mock.module("@/lib/db/client", () => ({
  db: {
    product: {
      findFirst: productFindFirst,
    },
  },
}));
mock.module("@/lib/organization", () => ({
  ensureOrganizationContext: mock(async () => ({
    organization: { id: "org_123" },
  })),
}));

describe("guide export route", () => {
  test("returns a buyer-facing markdown document for an organization product", async () => {
    const { GET } = await import("./route");

    const response = await GET(
      new Request("http://localhost/api/products/prod_123/guide/export?format=markdown") as never,
      { params: Promise.resolve({ id: "prod_123" }) },
    );

    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toBe("text/markdown; charset=utf-8");
    expect(response.headers.get("content-disposition")).toBe(
      'attachment; filename="tech-lead-guide.md"',
    );
    expect(await response.text()).toContain("## Chapter 1: First Month");
    expect(productFindFirst).toHaveBeenCalledWith({
      where: {
        id: "prod_123",
        storefront: { organizationId: "org_123" },
      },
      select: { slug: true, metadata: true },
    });
  });
});
