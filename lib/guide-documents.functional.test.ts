import { describe, expect, mock, test } from "bun:test";
import type { ProductGuide } from "./product-guides";

mock.module("server-only", () => ({}));
mock.module("@/lib/db/client", () => ({ db: {} }));

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
      body: `## Start Here

Paragraph with **bold**, [link](https://example.com), and \`code\`.

- One
- Two

[[diagram title="Loop" subtitle="Operating control" steps="Review|Inspect risk;Close|Record decision"]]

[[chart title="Split" bars="Delivery|60|#38BDF8;People|40|nope"]]`,
    },
  ],
};

describe("guide document export flow", () => {
  test("resolves export format and filenames", async () => {
    const { getGuideExportFilename, resolveGuideExportFormat } = await import("./guide-documents");

    expect(resolveGuideExportFormat("markdown")).toBe("markdown");
    expect(resolveGuideExportFormat("pdf")).toBe("pdf");
    expect(resolveGuideExportFormat(null)).toBe("pdf");
    expect(getGuideExportFilename(guide, "markdown")).toBe("tech-lead-guide.md");
    expect(getGuideExportFilename(guide, "pdf")).toBe("tech-lead-guide.pdf");
  });

  test("parses markdown blocks used by document rendering", async () => {
    const { parseMarkdownBlocks } = await import("./guide-documents");

    const blocks = parseMarkdownBlocks(guide.chapters[0].body);

    expect(blocks.map((block) => block.type)).toEqual([
      "heading",
      "paragraph",
      "bullets",
      "diagram",
      "chart",
    ]);
    expect(blocks[1]).toMatchObject({
      type: "paragraph",
      text: "Paragraph with bold, link, and code.",
    });
    expect(blocks[4]).toMatchObject({
      type: "chart",
      bars: [
        { label: "Delivery", value: 60, color: "#38BDF8" },
        { label: "People", value: 40, color: "#A3E635" },
      ],
    });
  });

  test("renders markdown and pdf bytes for a complete guide without a server", async () => {
    const { renderGuideMarkdown, renderGuidePdf } = await import("./guide-documents");

    const markdown = renderGuideMarkdown(guide);
    expect(markdown).toContain("# Tech Lead Guide");
    expect(markdown).toContain("## Chapter 1: First Month");
    expect(markdown).toContain("[[diagram");

    const pdf = await renderGuidePdf(guide);
    expect(pdf.byteLength).toBeGreaterThan(1000);
    expect(new TextDecoder().decode(pdf.slice(0, 5))).toBe("%PDF-");
  });
});
