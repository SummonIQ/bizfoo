import { randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { z } from "zod";
import {
  GEMINI_API_KEY_ERROR,
  NANO_BANANA_MODELS,
  getGeminiClient,
} from "@/lib/gemini/client";
import { ensureOrganizationContext } from "@/lib/organization";

export const maxDuration = 120;

const BodySchema = z.object({
  prompt: z.string().min(1).max(2000),
  style: z.string().min(1).max(200),
  aspectRatio: z.enum(["portrait", "square", "landscape"]).default("landscape"),
  quality: z.enum(["flash", "pro"]).default("flash"),
});

function buildIllustrationPrompt(style: string, aspectRatio: "portrait" | "square" | "landscape") {
  return [
    "Create a clean editorial illustration for a practical guide or handbook.",
    "No text overlays, captions, borders, or device frames.",
    "Keep the composition useful, legible, and book-ready rather than cinematic.",
    `Style direction: ${style}.`,
    `Aspect ratio hint: ${aspectRatio}.`,
  ].join(" ");
}

function fileExtensionForMimeType(mimeType: string) {
  if (mimeType.includes("jpeg")) return "jpg";
  if (mimeType.includes("webp")) return "webp";
  return "png";
}

export async function POST(req: NextRequest) {
  const auth = await ensureOrganizationContext();
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: z.infer<typeof BodySchema>;
  try {
    body = BodySchema.parse(await req.json());
  } catch (error) {
    return NextResponse.json({ error: "Invalid request body", details: error }, { status: 400 });
  }

  if (!process.env.GEMINI_API_KEY && !process.env.GOOGLE_API_KEY) {
    return NextResponse.json({ error: GEMINI_API_KEY_ERROR }, { status: 500 });
  }

  try {
    const ai = getGeminiClient();
    const response = await ai.models.generateContent({
      model: NANO_BANANA_MODELS[body.quality],
      contents: [
        {
          text: `${buildIllustrationPrompt(body.style, body.aspectRatio)}\n\nPrompt: ${body.prompt}`,
        },
      ],
    });

    let imageBase64: string | null = null;
    let mimeType = "image/png";

    for (const part of response.candidates?.[0]?.content?.parts ?? []) {
      if (part.inlineData?.data) {
        imageBase64 = part.inlineData.data;
        mimeType = part.inlineData.mimeType ?? mimeType;
        break;
      }
    }

    if (!imageBase64) {
      return NextResponse.json({ error: "No illustration returned from Nano Banana." }, { status: 502 });
    }

    const dataUrl = `data:${mimeType};base64,${imageBase64}`;
    let imageUrl = dataUrl;
    const token = process.env.BLOB_READ_WRITE_TOKEN;

    if (token) {
      const blob = await put(
        `guides/illustrations/${randomUUID()}.${fileExtensionForMimeType(mimeType)}`,
        Buffer.from(imageBase64, "base64"),
        {
          access: "public",
          contentType: mimeType,
          token,
        },
      );
      imageUrl = blob.url;
    }

    return NextResponse.json({
      imageUrl,
      mimeType,
      provider: "nano-banana",
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message ?? "Illustration generation failed" },
      { status: 500 },
    );
  }
}
