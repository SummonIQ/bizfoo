import "server-only";

import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from "pdf-lib";
import { db } from "@/lib/db/client";
import type { ProductGuide } from "@/lib/product-guides";

export type GuideExportFormat = "pdf" | "markdown";

export const GUIDE_PDF_DELIVERABLE_SLUG = "guide-pdf";

function stripInlineMarkdown(text: string) {
  return text
    .replace(/\[(.*?)\]\((.*?)\)/g, "$1")
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/[_*]{1,3}([^*_]+)[_*]{1,3}/g, "$1")
    .trim();
}

type MarkdownBlock =
  | { type: "heading"; level: 2 | 3; text: string }
  | { type: "paragraph"; text: string }
  | { type: "blockquote"; text: string }
  | { type: "bullets"; items: string[] }
  | { type: "numbered"; items: string[] }
  | { type: "image"; alt: string; src: string }
  | { type: "diagram"; title: string; subtitle: string; steps: { label: string; detail: string }[] }
  | { type: "chart"; title: string; subtitle: string; bars: { label: string; value: number; color: string }[] };

function parseShortcodeAttributes(source: string) {
  const attrs: Record<string, string> = {};
  for (const match of source.matchAll(/([a-z]+)="([^"]*)"/g)) {
    attrs[match[1]] = match[2];
  }
  return attrs;
}

function normalizeHexColor(value: string | undefined) {
  const normalized = value?.trim().toUpperCase() ?? "";
  return /^#[0-9A-F]{6}$/.test(normalized) ? normalized : "#A3E635";
}

function hexToRgb(color: string) {
  const normalized = normalizeHexColor(color);
  const red = Number.parseInt(normalized.slice(1, 3), 16) / 255;
  const green = Number.parseInt(normalized.slice(3, 5), 16) / 255;
  const blue = Number.parseInt(normalized.slice(5, 7), 16) / 255;
  return rgb(red, green, blue);
}

function parseVisualShortcode(block: string): MarkdownBlock | null {
  const match = block.match(/^\[\[(diagram|chart)\s+([\s\S]+)\]\]$/);
  if (!match) return null;

  const kind = match[1];
  const attrs = parseShortcodeAttributes(match[2]);
  const title = attrs.title?.trim();
  if (!title) return null;
  const subtitle = attrs.subtitle?.trim() ?? "";

  if (kind === "diagram") {
    const steps = (attrs.steps ?? "")
      .split(";")
      .map((entry) => entry.trim())
      .filter(Boolean)
      .map((entry) => {
        const [label, detail] = entry.split("|");
        return {
          label: stripInlineMarkdown(label ?? ""),
          detail: stripInlineMarkdown(detail ?? ""),
        };
      })
      .filter((step) => step.label && step.detail);

    return steps.length > 0
      ? { type: "diagram", title: stripInlineMarkdown(title), subtitle: stripInlineMarkdown(subtitle), steps }
      : null;
  }

  const bars = (attrs.bars ?? "")
    .split(";")
    .map((entry) => entry.trim())
    .filter(Boolean)
    .map((entry) => {
      const [label, rawValue, color] = entry.split("|");
      return {
        label: stripInlineMarkdown(label ?? ""),
        value: Number(rawValue?.trim()),
        color: normalizeHexColor(color),
      };
    })
    .filter((bar) => bar.label && Number.isFinite(bar.value) && bar.value > 0);

  return bars.length > 0
    ? { type: "chart", title: stripInlineMarkdown(title), subtitle: stripInlineMarkdown(subtitle), bars }
    : null;
}

function parseImageBlock(block: string): MarkdownBlock | null {
  const match = block.match(/^!\[([^\]]*)\]\(([^)]+)\)$/);
  if (!match) return null;

  const alt = stripInlineMarkdown(match[1] ?? "");
  const src = match[2]?.trim() ?? "";
  if (!src) return null;
  return { type: "image", alt, src };
}

export function parseMarkdownBlocks(markdown: string): MarkdownBlock[] {
  return markdown
    .trim()
    .split(/\n\s*\n/)
    .map((block) => block.trim())
    .filter(Boolean)
    .map((block): MarkdownBlock => {
      const visual = parseVisualShortcode(block);
      if (visual) return visual;

      const image = parseImageBlock(block);
      if (image) return image;

      const lines = block
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter(Boolean);

      if (lines.every((line) => line.startsWith("- "))) {
        return {
          type: "bullets",
          items: lines.map((line) => stripInlineMarkdown(line.slice(2))),
        };
      }

      if (lines.every((line) => /^\d+\.\s+/.test(line))) {
        return {
          type: "numbered",
          items: lines.map((line) => stripInlineMarkdown(line.replace(/^\d+\.\s+/, ""))),
        };
      }

      if (lines.every((line) => line.startsWith("> "))) {
        return {
          type: "blockquote",
          text: stripInlineMarkdown(lines.map((line) => line.slice(2)).join(" ")),
        };
      }

      if (lines.length === 1 && lines[0].startsWith("### ")) {
        return { type: "heading", level: 3, text: stripInlineMarkdown(lines[0].slice(4)) };
      }

      if (lines.length === 1 && lines[0].startsWith("## ")) {
        return { type: "heading", level: 2, text: stripInlineMarkdown(lines[0].slice(3)) };
      }

      return {
        type: "paragraph",
        text: stripInlineMarkdown(lines.join(" ")),
      };
    });
}

export function resolveGuideExportFormat(value: string | null): GuideExportFormat {
  return value === "markdown" ? "markdown" : "pdf";
}

export function getGuideExportFilename(
  guide: ProductGuide,
  format: GuideExportFormat,
) {
  return `${guide.slug}.${format === "pdf" ? "pdf" : "md"}`;
}

export function renderGuideMarkdown(guide: ProductGuide) {
  const lines: string[] = [`# ${guide.title}`, "", guide.subtitle, ""];

  for (const [index, chapter] of guide.chapters.entries()) {
    lines.push(`## Chapter ${index + 1}: ${chapter.title}`);
    lines.push("");
    lines.push(`${chapter.minutes} min`);
    lines.push("");
    lines.push(chapter.summary);
    lines.push("");
    lines.push(chapter.body.trim());
    lines.push("");
  }

  return `${lines.join("\n").trim()}\n`;
}

function wrapText(text: string, font: PDFFont, size: number, maxWidth: number) {
  const words = text.split(/\s+/).filter(Boolean);
  if (words.length === 0) return [""];

  const lines: string[] = [];
  let current = words[0];

  for (const word of words.slice(1)) {
    const next = `${current} ${word}`;
    if (font.widthOfTextAtSize(next, size) <= maxWidth) {
      current = next;
      continue;
    }
    lines.push(current);
    current = word;
  }

  lines.push(current);
  return lines;
}

type PdfCursor = {
  page: PDFPage;
  y: number;
};

export async function renderGuidePdf(guide: ProductGuide) {
  const pdf = await PDFDocument.create();
  const regular = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const italic = await pdf.embedFont(StandardFonts.HelveticaOblique);
  const mono = await pdf.embedFont(StandardFonts.Courier);

  const pageSize = { width: 612, height: 792 };
  const marginX = 54;
  const marginY = 56;
  const contentWidth = pageSize.width - marginX * 2;
  const accent = rgb(0.58, 0.77, 0.24);
  const body = rgb(0.12, 0.12, 0.14);
  const muted = rgb(0.42, 0.44, 0.48);

  const newCursor = (): PdfCursor => ({
    page: pdf.addPage([pageSize.width, pageSize.height]),
    y: pageSize.height - marginY,
  });

  let cursor = newCursor();

  function ensureSpace(height: number) {
    if (cursor.y - height < marginY) {
      cursor = newCursor();
    }
  }

  function drawLines(
    lines: string[],
    {
      font,
      size,
      color = body,
      indent = 0,
      gap = 1.35,
      after = 0,
    }: {
      font: PDFFont;
      size: number;
      color?: ReturnType<typeof rgb>;
      indent?: number;
      gap?: number;
      after?: number;
    },
  ) {
    const lineHeight = size * gap;
    ensureSpace(lines.length * lineHeight + after);

    for (const line of lines) {
      cursor.page.drawText(line, {
        x: marginX + indent,
        y: cursor.y - size,
        size,
        font,
        color,
      });
      cursor.y -= lineHeight;
    }

    cursor.y -= after;
  }

  function drawParagraph(
    text: string,
    {
      font = regular,
      size = 12,
      color = body,
      indent = 0,
      after = 8,
    }: {
      font?: PDFFont;
      size?: number;
      color?: ReturnType<typeof rgb>;
      indent?: number;
      after?: number;
    } = {},
  ) {
    const lines = wrapText(text, font, size, contentWidth - indent);
    drawLines(lines, { font, size, color, indent, after });
  }

  function drawDiagramBlock(block: Extract<MarkdownBlock, { type: "diagram" }>) {
    drawParagraph(block.title, {
      font: bold,
      size: 13,
      after: block.subtitle ? 4 : 8,
    });

    if (block.subtitle) {
      drawParagraph(block.subtitle, {
        size: 10,
        color: muted,
        after: 8,
      });
    }

    for (const [index, step] of block.steps.entries()) {
      const labelLines = wrapText(step.label, bold, 11, contentWidth - 44);
      const detailLines = wrapText(step.detail, regular, 10, contentWidth - 44);
      const cardHeight = 24 + labelLines.length * 14 + detailLines.length * 12;

      ensureSpace(cardHeight + (index < block.steps.length - 1 ? 18 : 8));

      const cardY = cursor.y - cardHeight;
      cursor.page.drawRectangle({
        x: marginX + 12,
        y: cardY,
        width: contentWidth - 24,
        height: cardHeight,
        borderColor: accent,
        borderWidth: 1,
        color: rgb(0.97, 0.98, 0.95),
      });

      cursor.page.drawText(`STEP ${index + 1}`, {
        x: marginX + 24,
        y: cursor.y - 14,
        size: 8,
        font: mono,
        color: muted,
      });

      let textY = cursor.y - 30;
      for (const line of labelLines) {
        cursor.page.drawText(line, {
          x: marginX + 24,
          y: textY,
          size: 11,
          font: bold,
          color: body,
        });
        textY -= 14;
      }

      for (const line of detailLines) {
        cursor.page.drawText(line, {
          x: marginX + 24,
          y: textY,
          size: 10,
          font: regular,
          color: muted,
        });
        textY -= 12;
      }

      cursor.y = cardY - 8;

      if (index < block.steps.length - 1) {
        cursor.page.drawLine({
          start: { x: marginX + contentWidth / 2, y: cursor.y + 4 },
          end: { x: marginX + contentWidth / 2, y: cursor.y - 6 },
          thickness: 1.25,
          color: accent,
        });
        cursor.y -= 12;
      }
    }
  }

  function drawChartBlock(block: Extract<MarkdownBlock, { type: "chart" }>) {
    drawParagraph(block.title, {
      font: bold,
      size: 13,
      after: block.subtitle ? 4 : 8,
    });

    if (block.subtitle) {
      drawParagraph(block.subtitle, {
        size: 10,
        color: muted,
        after: 10,
      });
    }

    const maxValue = Math.max(...block.bars.map((bar) => bar.value), 1);
    const trackWidth = contentWidth - 140;

    for (const bar of block.bars) {
      ensureSpace(28);

      cursor.page.drawText(bar.label, {
        x: marginX,
        y: cursor.y - 10,
        size: 10,
        font: regular,
        color: body,
      });

      cursor.page.drawText(String(bar.value), {
        x: marginX + contentWidth - 28,
        y: cursor.y - 10,
        size: 10,
        font: mono,
        color: muted,
      });

      const trackX = marginX + 104;
      const trackY = cursor.y - 16;
      cursor.page.drawRectangle({
        x: trackX,
        y: trackY,
        width: trackWidth,
        height: 8,
        color: rgb(0.9, 0.92, 0.95),
      });
      cursor.page.drawRectangle({
        x: trackX,
        y: trackY,
        width: Math.max(18, (bar.value / maxValue) * trackWidth),
        height: 8,
        color: hexToRgb(bar.color),
      });

      cursor.y -= 24;
    }

    cursor.y -= 4;
  }

  async function drawImageBlock(block: Extract<MarkdownBlock, { type: "image" }>) {
    try {
      let bytes: Uint8Array;
      let mimeType = "image/png";

      if (block.src.startsWith("data:")) {
        const match = block.src.match(/^data:([^;]+);base64,(.+)$/);
        if (!match) throw new Error("Invalid data URL");
        mimeType = match[1];
        bytes = Uint8Array.from(Buffer.from(match[2], "base64"));
      } else {
        const response = await fetch(block.src);
        if (!response.ok) throw new Error(`Image fetch failed: ${response.status}`);
        mimeType = response.headers.get("content-type") ?? mimeType;
        bytes = new Uint8Array(await response.arrayBuffer());
      }

      const image = mimeType.includes("png")
        ? await pdf.embedPng(bytes)
        : mimeType.includes("jpeg") || mimeType.includes("jpg")
          ? await pdf.embedJpg(bytes)
          : null;

      if (!image) {
        drawParagraph(block.alt ? `Image: ${block.alt}` : "Image", {
          font: italic,
          size: 11,
          color: muted,
          after: 10,
        });
        return;
      }

      const maxWidth = contentWidth;
      const maxHeight = 280;
      const scale = Math.min(maxWidth / image.width, maxHeight / image.height, 1);
      const width = image.width * scale;
      const height = image.height * scale;

      ensureSpace(height + (block.alt ? 24 : 10));

      cursor.page.drawImage(image, {
        x: marginX,
        y: cursor.y - height,
        width,
        height,
      });

      cursor.y -= height + 8;

      if (block.alt) {
        drawParagraph(block.alt, {
          size: 10,
          color: muted,
          after: 10,
        });
      }
    } catch {
      drawParagraph(block.alt ? `Image: ${block.alt}` : "Image", {
        font: italic,
        size: 11,
        color: muted,
        after: 10,
      });
    }
  }

  drawParagraph(guide.title, {
    font: bold,
    size: 28,
    color: accent,
    after: 10,
  });
  drawParagraph(guide.subtitle, {
    size: 13,
    color: muted,
    after: 18,
  });
  drawParagraph(`${guide.chapters.length} chapters`, {
    font: mono,
    size: 10,
    color: muted,
    after: 18,
  });

  for (const [index, chapter] of guide.chapters.entries()) {
    drawParagraph(`Chapter ${index + 1}`, {
      font: mono,
      size: 10,
      color: accent,
      after: 6,
    });
    drawParagraph(chapter.title, {
      font: bold,
      size: 20,
      after: 6,
    });
    drawParagraph(`${chapter.minutes} min`, {
      font: mono,
      size: 10,
      color: muted,
      after: 8,
    });
    drawParagraph(chapter.summary, {
      size: 12,
      color: muted,
      after: 12,
    });

    for (const block of parseMarkdownBlocks(chapter.body)) {
      if (block.type === "heading") {
        drawParagraph(block.text, {
          font: bold,
          size: block.level === 2 ? 14 : 12,
          after: 6,
        });
        continue;
      }

      if (block.type === "blockquote") {
        ensureSpace(32);
        cursor.page.drawRectangle({
          x: marginX,
          y: cursor.y - 24,
          width: 2,
          height: 24,
          color: accent,
        });
        drawParagraph(block.text, {
          font: italic,
          size: 11,
          color: muted,
          indent: 14,
          after: 10,
        });
        continue;
      }

      if (block.type === "bullets") {
        for (const item of block.items) {
          const bulletText = `- ${item}`;
          const wrapped = wrapText(bulletText, regular, 11, contentWidth - 10);
          drawLines(wrapped, {
            font: regular,
            size: 11,
            indent: 10,
            after: 2,
          });
        }
        cursor.y -= 6;
        continue;
      }

      if (block.type === "numbered") {
        for (const [itemIndex, item] of block.items.entries()) {
          const numberText = `${itemIndex + 1}. ${item}`;
          const wrapped = wrapText(numberText, regular, 11, contentWidth - 10);
          drawLines(wrapped, {
            font: regular,
            size: 11,
            indent: 10,
            after: 2,
          });
        }
        cursor.y -= 6;
        continue;
      }

      if (block.type === "diagram") {
        drawDiagramBlock(block);
        cursor.y -= 8;
        continue;
      }

      if (block.type === "chart") {
        drawChartBlock(block);
        cursor.y -= 8;
        continue;
      }

      if (block.type === "image") {
        await drawImageBlock(block);
        continue;
      }

      drawParagraph(block.text, {
        size: 11,
        after: 8,
      });
    }
    cursor.y -= 12;
  }

  return pdf.save();
}

export function getGuideGrantDownloadUrl(token: string, format: GuideExportFormat = "pdf") {
  const baseUrl = (process.env.NEXT_PUBLIC_APP_URL ?? process.env.BETTER_AUTH_URL ?? "").replace(
    /\/$/,
    "",
  );
  const path = `/api/v1/grants/${token}/document?format=${format}`;
  return baseUrl ? `${baseUrl}${path}` : path;
}

export async function syncGuideProductArtifacts({
  productId,
  guide,
}: {
  productId: string;
  guide: ProductGuide;
}) {
  await db.setupStep.deleteMany({ where: { productId } });

  await db.deliverable.updateMany({
    where: {
      productId,
      OR: [{ type: "REPO" }, { slug: "repo" }],
      status: { not: "ARCHIVED" },
    },
    data: { status: "ARCHIVED" },
  });

  const previewUrl = `/api/products/${productId}/guide/export?format=pdf`;
  const desiredTitle = `${guide.title} PDF`;
  const existing = await db.deliverable.findUnique({
    where: {
      productId_slug: {
        productId,
        slug: GUIDE_PDF_DELIVERABLE_SLUG,
      },
    },
    include: { delivery: true },
  });

  const deliverable =
    existing == null
      ? await db.deliverable.create({
          data: {
            productId,
            title: desiredTitle,
            slug: GUIDE_PDF_DELIVERABLE_SLUG,
            type: "DOC",
            status: "READY",
            access: "BUYERS_ONLY",
            url: previewUrl,
            notes: "Auto-generated from the guide content in Bizfoo.",
            position: 0,
          },
        })
      : existing.title !== desiredTitle ||
          existing.type !== "DOC" ||
          existing.status !== "READY" ||
          existing.access !== "BUYERS_ONLY" ||
          existing.url !== previewUrl ||
          existing.notes !== "Auto-generated from the guide content in Bizfoo."
        ? await db.deliverable.update({
            where: { id: existing.id },
            data: {
              title: desiredTitle,
              type: "DOC",
              status: "READY",
              access: "BUYERS_ONLY",
              url: previewUrl,
              notes: "Auto-generated from the guide content in Bizfoo.",
            },
          })
        : existing;

  const deliveryData = {
    method: "DIRECT_DOWNLOAD" as const,
    assetUrl: null,
    ttlMinutes: 0,
    maxRedeems: null,
    repoOwner: null,
    repoName: null,
    externalUrl: null,
    emailSubject: null,
    emailBody: null,
  };

  if (!existing?.delivery) {
    await db.deliveryConfig.create({
      data: {
        deliverableId: deliverable.id,
        ...deliveryData,
      },
    });
  } else {
    const needsDeliveryUpdate =
      existing.delivery.method !== deliveryData.method ||
      existing.delivery.assetUrl !== deliveryData.assetUrl ||
      existing.delivery.ttlMinutes !== deliveryData.ttlMinutes ||
      existing.delivery.maxRedeems !== deliveryData.maxRedeems ||
      existing.delivery.repoOwner !== deliveryData.repoOwner ||
      existing.delivery.repoName !== deliveryData.repoName ||
      existing.delivery.externalUrl !== deliveryData.externalUrl ||
      existing.delivery.emailSubject !== deliveryData.emailSubject ||
      existing.delivery.emailBody !== deliveryData.emailBody;

    if (needsDeliveryUpdate) {
      await db.deliveryConfig.update({
        where: { deliverableId: deliverable.id },
        data: deliveryData,
      });
    }
  }

  return {
    id: deliverable.id,
    title: desiredTitle,
    url: previewUrl,
  };
}
