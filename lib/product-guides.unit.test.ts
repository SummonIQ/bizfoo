import { describe, expect, test } from "bun:test";

import {
  getProductDisplayInfo,
  getProductGuide,
  guideSchema,
  toPublicProductGuide,
  type ProductGuide,
} from "./product-guides";

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
      summary: "Learn the system.",
      sample: "Sample content",
      body: "Private body content",
    },
  ],
};

describe("product guide metadata", () => {
  test("validates guide metadata and rejects impossible sample counts", () => {
    expect(guideSchema.safeParse(guide).success).toBe(true);

    const parsed = guideSchema.safeParse({
      ...guide,
      sampleChapterCount: 2,
    });

    expect(parsed.success).toBe(false);
    if (!parsed.success) {
      expect(parsed.error.issues[0]?.path).toEqual(["sampleChapterCount"]);
    }
  });

  test("reads valid product guide metadata and falls back for invalid metadata", () => {
    expect(getProductGuide({ slug: "tech-lead-guide", metadata: { guide } })).toEqual(guide);
    expect(getProductGuide({ slug: "tech-lead-guide", metadata: { guide: { ...guide, chapters: [] } } })).toBeNull();
  });

  test("public guide payload removes private chapter bodies", () => {
    const publicGuide = toPublicProductGuide(guide);

    expect(publicGuide.chapters[0]).toMatchObject({
      id: "first",
      title: "First Month",
      sample: "Sample content",
    });
    expect("body" in publicGuide.chapters[0]).toBe(false);
  });

  test("display info uses guide metadata when present", () => {
    expect(
      getProductDisplayInfo({
        slug: "database-slug",
        name: "Database Name",
        metadata: { guide },
      }),
    ).toEqual({
      title: "Tech Lead Guide",
      slug: "tech-lead-guide",
    });
  });
});
