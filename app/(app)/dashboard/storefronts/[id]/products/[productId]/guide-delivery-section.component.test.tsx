import { describe, expect, test } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";

import { GuideDeliverySection } from "./guide-delivery-section";

describe("GuideDeliverySection component", () => {
  test("renders buyer-only PDF and markdown export actions for guide products", () => {
    const html = renderToStaticMarkup(
      <GuideDeliverySection productId="prod_123" deliverableTitle="Tech Lead Guide PDF" />,
    );

    expect(html).toContain("Document delivery");
    expect(html).toContain("buyers only");
    expect(html).toContain("direct download");
    expect(html).toContain("Tech Lead Guide PDF");
    expect(html).toContain("/api/products/prod_123/guide/export?format=pdf");
    expect(html).toContain("/api/products/prod_123/guide/export?format=markdown");
    expect(html).toContain("Source of truth");
  });
});
