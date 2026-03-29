import Tesseract from "tesseract.js";

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

export async function runOcrFromUrl(fileUrl: string) {
  const absoluteUrl = fileUrl.startsWith("http")
    ? fileUrl
    : `${process.env.APP_URL ?? "http://localhost:3000"}${fileUrl}`;

  const result = await Tesseract.recognize(absoluteUrl, "eng");
  const text = result.data.text ?? "";
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
    confidence: Number((result.data.confidence / 100).toFixed(2)),
    lowConfidenceKeys: result.data.confidence < 75 ? ["amount", "date"] : [],
    rawText: text,
    lineItems: lines.slice(0, 6).map((line, index) => ({
      id: `ocr-line-${index + 1}`,
      label: line,
      amount: 0
    }))
  };
}
