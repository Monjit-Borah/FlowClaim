import Tesseract from "tesseract.js";

import { env } from "@/lib/env";

const amountPattern = /(?:total|amount|balance)[^\d]{0,10}(\d+[.,]\d{2})/i;
const taxPattern = /(?:tax|vat)[^\d]{0,10}(\d+[.,]\d{2})/i;
const datePattern =
  /((?:\d{1,2}[\/.-]\d{1,2}[\/.-]\d{2,4})|(?:\d{4}[\/.-]\d{1,2}[\/.-]\d{1,2}))/i;

function parseFirstAmount(pattern: RegExp, text: string) {
  const match = text.match(pattern)?.[1];
  if (!match) return null;
  return Number(match.replace(",", "."));
}

function parseDate(text: string) {
  const match = text.match(datePattern)?.[1];
  if (!match) return null;
  const normalized = match.replace(/\./g, "-").replace(/\//g, "-");
  const date = new Date(normalized);
  return Number.isNaN(date.getTime()) ? null : date;
}

function suggestCategory(text: string) {
  const lower = text.toLowerCase();
  if (lower.includes("hotel") || lower.includes("lodging")) return "Hotel";
  if (lower.includes("flight") || lower.includes("uber") || lower.includes("taxi")) return "Travel";
  if (lower.includes("restaurant") || lower.includes("dinner") || lower.includes("cafe")) return "Meals";
  return "General";
}

function mapTextToExtraction(text: string, confidence: number) {
  const lines = text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  return {
    merchant: lines[0] ?? "Unknown merchant",
    amount: parseFirstAmount(amountPattern, text) ?? 0,
    tax: parseFirstAmount(taxPattern, text) ?? 0,
    date: parseDate(text),
    currency: "USD",
    suggestedCategory: suggestCategory(text),
    confidence: Number(confidence.toFixed(2)),
    lowConfidenceKeys: confidence < 0.75 ? ["amount", "date"] : [],
    rawText: text,
    lineItems: lines.slice(0, 6).map((line, index) => ({
      id: `ocr-line-${index + 1}`,
      label: line,
      amount: 0
    }))
  };
}

async function runExternalOcr(file: File) {
  if (!env.OCR_API_KEY) return null;

  const payload = new FormData();
  payload.append("apikey", env.OCR_API_KEY);
  payload.append("language", "eng");
  payload.append("isOverlayRequired", "false");
  payload.append("file", file);

  const response = await fetch("https://api.ocr.space/parse/image", {
    method: "POST",
    body: payload
  });

  if (!response.ok) {
    throw new Error("External OCR request failed.");
  }

  const result = (await response.json()) as {
    IsErroredOnProcessing?: boolean;
    ParsedResults?: Array<{ ParsedText?: string }>;
    OCRExitCode?: number;
    ErrorMessage?: string | string[];
  };

  if (result.IsErroredOnProcessing || !result.ParsedResults?.length) {
    const detail = Array.isArray(result.ErrorMessage) ? result.ErrorMessage.join(", ") : result.ErrorMessage;
    throw new Error(detail || "OCR provider could not read the receipt.");
  }

  const text = result.ParsedResults.map((entry) => entry.ParsedText ?? "").join("\n").trim();
  return mapTextToExtraction(text, 0.92);
}

async function runLocalOcr(input: string | File) {
  const result = await Tesseract.recognize(input as never, "eng");
  const text = result.data.text ?? "";
  return mapTextToExtraction(text, result.data.confidence / 100);
}

export async function runOcrFromFile(file: File, fallbackPath?: string) {
  if (env.OCR_API_KEY) {
    try {
      return await runExternalOcr(file);
    } catch {
      if (!fallbackPath) throw new Error("OCR processing failed.");
    }
  }

  return runLocalOcr(fallbackPath ?? file);
}

export async function runOcrFromUrl(fileUrl: string) {
  const absoluteUrl = fileUrl.startsWith("http")
    ? fileUrl
    : `${process.env.APP_URL ?? "http://localhost:3000"}${fileUrl}`;

  return runLocalOcr(absoluteUrl);
}
