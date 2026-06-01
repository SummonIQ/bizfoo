import { GoogleGenAI } from "@google/genai";

export const GEMINI_API_KEY_ERROR =
  "GEMINI_API_KEY or GOOGLE_API_KEY is not set. Add one to your environment variables.";

export function getGeminiKey(): string {
  const key = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  if (!key) throw new Error(GEMINI_API_KEY_ERROR);
  return key;
}

export function getGeminiClient(): GoogleGenAI {
  return new GoogleGenAI({ apiKey: getGeminiKey() });
}

export const NANO_BANANA_MODELS = {
  flash: "gemini-3.1-flash-image-preview",
  pro: "gemini-3-pro-image-preview",
} as const;

export type NanoBananaModel = keyof typeof NANO_BANANA_MODELS;
