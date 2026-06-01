// Generates PDF + EPUB exports of a purchased SummonIQ guide and
// uploads them to Vercel Blob. Updates / creates the Deliverable +
// DeliveryConfig rows so buyers can download from the bizfoo grant page.
//
// Usage (with summoniq dev server already running at SOURCE_BASE_URL):
//   bun run scripts/generate-guide-exports.ts overemployed-guide
//
// Env requirements:
//   DATABASE_URL                   — points at bizfoo's Postgres
//   BLOB_READ_WRITE_TOKEN          — Vercel Blob write token
//   SOURCE_BASE_URL                — defaults to http://localhost:10120
//
// The script assumes summoniq runs in dev mode at SOURCE_BASE_URL so the
// hosted reader at /account/purchases/guides/<slug> is reachable without
// auth (the page bypasses auth in dev).

import { config as loadEnv } from "dotenv";
import { put } from "@vercel/blob";
import puppeteer from "puppeteer";
import { EPub } from "epub-gen-memory";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";

loadEnv({ path: ".env.local" });
loadEnv({ path: ".env" });

const SOURCE_BASE_URL = process.env.SOURCE_BASE_URL ?? "http://localhost:10120";
const STOREFRONT_SLUG = "summoniq";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
  ssl: { rejectUnauthorized: false },
});
const db = new PrismaClient({ adapter });

type ChapterFetch = {
  id: string;
  title: string;
  summary: string;
  body: string;
  minutes: number;
};

type GuideFetch = {
  slug: string;
  title: string;
  subtitle: string;
  chapters: ChapterFetch[];
};

async function fetchGuideContent(slug: string): Promise<GuideFetch> {
  // Pull the structured guide content from summoniq's local API.
  // (Falls back to the bizfoo getPurchasedGuide path in production, but
  //  for export generation we read directly from the dev server.)
  const res = await fetch(`${SOURCE_BASE_URL}/api/store/guide/${slug}`);
  if (!res.ok) {
    throw new Error(
      `Failed to fetch guide ${slug} from ${SOURCE_BASE_URL}: ${res.status}`,
    );
  }
  return (await res.json()) as GuideFetch;
}

async function generatePdf(slug: string): Promise<Buffer> {
  console.log("  → Launching headless Chromium...");
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox"],
  });
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 820, height: 1180 });
    await page.emulateMediaType("print");
    const url = `${SOURCE_BASE_URL}/account/purchases/guides/${slug}?print=1`;
    console.log(`  → Navigating to ${url}`);
    await page.goto(url, { waitUntil: "networkidle0", timeout: 60_000 });

    // Force a clean typographic document. The page itself already renders
    // in `compact` mode under ?print=1 (no sidebar, no decorative hero),
    // but we strip remaining backgrounds, rings, and shadows so the PDF
    // doesn't carry rasterized panel chrome that bloats file size.
    await page.addStyleTag({
      content: `
        html, body {
          background: #ffffff !important;
          color: #111111 !important;
        }
        *, *::before, *::after {
          background: transparent !important;
          background-image: none !important;
          box-shadow: none !important;
          text-shadow: none !important;
          filter: none !important;
          backdrop-filter: none !important;
          border-color: #d4d4d8 !important;
        }
        a, a * { color: #1d4ed8 !important; }
        h1, h2, h3, h4 { page-break-after: avoid; }
        section, blockquote, ul, ol, table { page-break-inside: avoid; }
        img, svg { max-width: 100%; height: auto; }
      `,
    });

    console.log("  → Rendering PDF...");
    const pdf = await page.pdf({
      format: "A4",
      printBackground: false,
      margin: { top: "18mm", right: "16mm", bottom: "18mm", left: "16mm" },
      displayHeaderFooter: true,
      headerTemplate: `<div style="font-size:9px; color:#666; width:100%; text-align:center; padding: 0 16mm;"></div>`,
      footerTemplate: `<div style="font-size:9px; color:#666; width:100%; text-align:center; padding: 0 16mm;">
        <span class="title"></span> · page <span class="pageNumber"></span> / <span class="totalPages"></span>
      </div>`,
    });
    return Buffer.from(pdf);
  } finally {
    await browser.close();
  }
}

function stripWidgets(markdown: string): string {
  // Convert [[widget ...]] blocks into a readable plain-text equivalent
  // so EPUB readers don't render the raw widget syntax. The PDF path
  // renders widgets through the GuideReader, so this transformation
  // is only used for the EPUB export.
  return markdown
    // Replace [[callout ... title="X" text="Y"]] with > X — Y
    .replace(
      /\[\[callout[^\]]*?title="([^"]*)"[^\]]*?text="([^"]*)"[^\]]*?\]\]/g,
      "\n> **$1** — $2\n",
    )
    // [[diagram title="X" subtitle="Y" steps="A|B;C|D"]] → "X — Y" then numbered bullets
    .replace(
      /\[\[diagram[^\]]*?title="([^"]*)"(?:[^\]]*?subtitle="([^"]*)")?(?:[^\]]*?steps="([^"]*)")?[^\]]*?\]\]/g,
      (_match, title: string, subtitle: string | undefined, steps: string | undefined) => {
        const lines = [`\n**${title}**${subtitle ? ` — ${subtitle}` : ""}\n`];
        if (steps) {
          for (const item of steps.split(";")) {
            const [head, tail] = item.split("|");
            lines.push(`- **${head.trim()}** — ${(tail ?? "").trim()}`);
          }
        }
        return lines.join("\n") + "\n";
      },
    )
    // [[chart ... bars="A|N|color|desc;B|N|color|desc"]] → bullets
    .replace(
      /\[\[chart[^\]]*?title="([^"]*)"(?:[^\]]*?subtitle="([^"]*)")?(?:[^\]]*?bars="([^"]*)")?[^\]]*?\]\]/g,
      (_match, title, subtitle, bars) => {
        const lines = [`\n**${title}**${subtitle ? ` — ${subtitle}` : ""}\n`];
        if (bars) {
          for (const item of bars.split(";")) {
            const [head, value, _color, tail] = item.split("|");
            lines.push(
              `- ${head.trim()} (${(value ?? "").trim()}): ${(tail ?? "").trim()}`,
            );
          }
        }
        return lines.join("\n") + "\n";
      },
    )
    // [[stats ... items="V|L|D;V|L|D"]]
    .replace(
      /\[\[stats[^\]]*?title="([^"]*)"(?:[^\]]*?subtitle="([^"]*)")?(?:[^\]]*?items="([^"]*)")?[^\]]*?\]\]/g,
      (_match, title, subtitle, items) => {
        const lines = [`\n**${title}**${subtitle ? ` — ${subtitle}` : ""}\n`];
        if (items) {
          for (const item of items.split(";")) {
            const [value, label, detail] = item.split("|");
            lines.push(
              `- **${(value ?? "").trim()}** ${(label ?? "").trim()} — ${(detail ?? "").trim()}`,
            );
          }
        }
        return lines.join("\n") + "\n";
      },
    )
    // [[compare ... good="A;B" bad="A;B"]]
    .replace(
      /\[\[compare[^\]]*?title="([^"]*)"(?:[^\]]*?subtitle="([^"]*)")?(?:[^\]]*?good="([^"]*)")?(?:[^\]]*?bad="([^"]*)")?[^\]]*?\]\]/g,
      (_match, title, subtitle, good, bad) => {
        const lines = [`\n**${title}**${subtitle ? ` — ${subtitle}` : ""}\n`];
        if (good) {
          lines.push("\n_Do:_");
          for (const g of good.split(";")) lines.push(`- ${g.trim()}`);
        }
        if (bad) {
          lines.push("\n_Avoid:_");
          for (const b of bad.split(";")) lines.push(`- ${b.trim()}`);
        }
        return lines.join("\n") + "\n";
      },
    )
    // [[checklist title="X" items="head|tail;head|tail"]]
    .replace(
      /\[\[checklist[^\]]*?title="([^"]*)"(?:[^\]]*?subtitle="([^"]*)")?(?:[^\]]*?items="([^"]*)")?[^\]]*?\]\]/g,
      (_match, title, subtitle, items) => {
        const lines = [`\n**${title}**${subtitle ? ` — ${subtitle}` : ""}\n`];
        if (items) {
          for (const item of items.split(";")) {
            const [head, tail] = item.split("|");
            lines.push(`- [ ] **${(head ?? "").trim()}** — ${(tail ?? "").trim()}`);
          }
        }
        return lines.join("\n") + "\n";
      },
    )
    // [[do items="A;B;C"]] and [[dont items="..."]]
    .replace(
      /\[\[do[^\]]*?items="([^"]*)"[^\]]*?\]\]/g,
      (_match, items) => {
        const lines = ["\n_Do:_"];
        for (const i of items.split(";")) lines.push(`- ${i.trim()}`);
        return lines.join("\n") + "\n";
      },
    )
    .replace(
      /\[\[dont[^\]]*?title="([^"]*)"(?:[^\]]*?items="([^"]*)")?[^\]]*?\]\]/g,
      (_match, title, items) => {
        const lines = [`\n**${title}** _(avoid)_\n`];
        if (items) {
          for (const i of items.split(";")) lines.push(`- ${i.trim()}`);
        }
        return lines.join("\n") + "\n";
      },
    )
    // [[quote text="X" context="Y"]]
    .replace(
      /\[\[quote[^\]]*?text="([^"]*)"(?:[^\]]*?context="([^"]*)")?[^\]]*?\]\]/g,
      (_match, text, context) =>
        `\n> ${text}\n${context ? `> — _${context}_\n` : ""}`,
    )
    // [[illustration ... caption="X"]]
    .replace(
      /\[\[illustration[^\]]*?caption="([^"]*)"[^\]]*?\]\]/g,
      "\n_$1_\n",
    )
    // [[dialogue ... title="X"]] — strip cleanly, the lines syntax is verbose
    .replace(/\[\[dialogue[^\]]*?title="([^"]*)"[^\]]*?\]\]/g, "\n**$1**\n")
    // Anything still in widget brackets we couldn't parse — drop quietly.
    .replace(/\[\[[a-z]+[^\]]*?\]\]/g, "");
}

function markdownToBasicHtml(markdown: string): string {
  // Minimal markdown → HTML conversion sufficient for EPUB. epub-gen-memory
  // doesn't render markdown itself, so we convert h2/h3/paragraphs/lists.
  const lines = markdown.split("\n");
  const out: string[] = [];
  let inList = false;
  let inQuote = false;

  const closeList = () => {
    if (inList) {
      out.push("</ul>");
      inList = false;
    }
  };
  const closeQuote = () => {
    if (inQuote) {
      out.push("</blockquote>");
      inQuote = false;
    }
  };

  for (const raw of lines) {
    const line = raw.trimEnd();
    if (!line.trim()) {
      closeList();
      closeQuote();
      continue;
    }
    if (line.startsWith("## ")) {
      closeList();
      closeQuote();
      out.push(`<h2>${escapeHtml(line.slice(3))}</h2>`);
    } else if (line.startsWith("### ")) {
      closeList();
      closeQuote();
      out.push(`<h3>${escapeHtml(line.slice(4))}</h3>`);
    } else if (line.startsWith("- ")) {
      closeQuote();
      if (!inList) {
        out.push("<ul>");
        inList = true;
      }
      out.push(`<li>${inlineMarkdown(line.slice(2))}</li>`);
    } else if (line.startsWith("> ")) {
      closeList();
      if (!inQuote) {
        out.push("<blockquote>");
        inQuote = true;
      }
      out.push(`<p>${inlineMarkdown(line.slice(2))}</p>`);
    } else {
      closeList();
      closeQuote();
      out.push(`<p>${inlineMarkdown(line)}</p>`);
    }
  }
  closeList();
  closeQuote();
  return out.join("\n");
}

function inlineMarkdown(text: string): string {
  // Apply **bold**, *italic*, and inline `code`, and escape everything else.
  return escapeHtml(text)
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/\*([^*]+)\*/g, "<em>$1</em>")
    .replace(/`([^`]+)`/g, "<code>$1</code>");
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

async function generateEpub(guide: GuideFetch): Promise<Buffer> {
  const chapters = guide.chapters.map((chapter) => ({
    title: chapter.title,
    content: markdownToBasicHtml(stripWidgets(chapter.body)),
  }));

  const epub = new EPub(
    {
      title: guide.title,
      author: ["SummonIQ"],
      description: guide.subtitle,
      lang: "en",
      tocTitle: "Contents",
      appendChapterTitles: true,
      css: `
        body { font-family: Georgia, "Times New Roman", serif; line-height: 1.6; color: #1a1a1a; }
        h2 { font-size: 1.6em; margin-top: 1.6em; }
        h3 { font-size: 1.2em; margin-top: 1.4em; }
        ul { margin-left: 1.2em; }
        li { margin-bottom: 0.4em; }
        blockquote { border-left: 4px solid #ccc; margin: 1em 0; padding: 0.4em 1em; color: #444; }
        code { background: #f4f4f4; padding: 0.1em 0.3em; border-radius: 3px; }
      `,
    },
    chapters,
  );
  return await epub.genEpub();
}

async function uploadAsset(
  fileName: string,
  body: Buffer,
  contentType: string,
): Promise<string> {
  const blob = await put(fileName, body, {
    access: "public",
    contentType,
    addRandomSuffix: false,
    allowOverwrite: true,
  });
  return blob.url;
}

async function upsertDeliverable(
  productId: string,
  slug: string,
  title: string,
  type: "DOC" | "FILE",
  position: number,
  assetUrl: string,
): Promise<string> {
  const existing = await db.deliverable.findUnique({
    where: { productId_slug: { productId, slug } },
    include: { delivery: true },
  });
  const deliverable = existing
    ? await db.deliverable.update({
        where: { id: existing.id },
        data: { title, type, status: "READY", access: "BUYERS_ONLY", url: assetUrl, position },
      })
    : await db.deliverable.create({
        data: {
          productId,
          slug,
          title,
          type,
          status: "READY",
          access: "BUYERS_ONLY",
          url: assetUrl,
          position,
        },
      });
  await db.deliveryConfig.upsert({
    where: { deliverableId: deliverable.id },
    create: {
      deliverableId: deliverable.id,
      method: "DIRECT_DOWNLOAD",
      assetUrl,
      ttlMinutes: 1440,
      maxRedeems: null,
    },
    update: {
      method: "DIRECT_DOWNLOAD",
      assetUrl,
      ttlMinutes: 1440,
      maxRedeems: null,
    },
  });
  return deliverable.id;
}

async function main() {
  const slug = process.argv[2] ?? "overemployed-guide";

  console.log(`Generating exports for guide: ${slug}`);
  console.log(`  Source: ${SOURCE_BASE_URL}`);

  console.log("\n1. Fetching guide content...");
  const guide = await fetchGuideContent(slug);
  console.log(`   ✓ Got ${guide.chapters.length} chapters: ${guide.title}`);

  console.log("\n2. Generating PDF...");
  const pdfBuffer = await generatePdf(slug);
  console.log(`   ✓ ${(pdfBuffer.length / 1024).toFixed(1)} KB`);

  console.log("\n3. Generating EPUB...");
  const epubBuffer = await generateEpub(guide);
  console.log(`   ✓ ${(epubBuffer.length / 1024).toFixed(1)} KB`);

  console.log("\n4. Uploading to Vercel Blob...");
  const pdfUrl = await uploadAsset(
    `guides/${slug}/${slug}.pdf`,
    pdfBuffer,
    "application/pdf",
  );
  console.log(`   ✓ PDF: ${pdfUrl}`);
  const epubUrl = await uploadAsset(
    `guides/${slug}/${slug}.epub`,
    epubBuffer,
    "application/epub+zip",
  );
  console.log(`   ✓ EPUB: ${epubUrl}`);

  console.log("\n5. Updating Deliverable records in bizfoo...");
  const storefront = await db.storefront.findUnique({
    where: { slug: STOREFRONT_SLUG },
  });
  if (!storefront) throw new Error(`Storefront ${STOREFRONT_SLUG} not found`);
  const product = await db.product.findUnique({
    where: { storefrontId_slug: { storefrontId: storefront.id, slug } },
  });
  if (!product) throw new Error(`Product ${slug} not found`);

  await upsertDeliverable(product.id, "pdf-download", `${guide.title} — PDF`, "FILE", 1, pdfUrl);
  console.log("   ✓ PDF deliverable upserted");
  await upsertDeliverable(product.id, "epub-download", `${guide.title} — EPUB`, "FILE", 2, epubUrl);
  console.log("   ✓ EPUB deliverable upserted");

  console.log("\nDone.");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
