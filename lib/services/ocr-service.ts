import { OCRExtraction } from "@/lib/types";

export function simulateOCR(fileName: string): OCRExtraction {
  if (fileName.toLowerCase().includes("dinner")) {
    return {
      merchant: "The Lighterman",
      amount: 138,
      tax: 17,
      date: "2026-03-15",
      currency: "GBP",
      suggestedCategory: "Meals",
      confidence: 0.89,
      lineItems: [
        { id: "ocr_li_1", label: "Food & beverage", amount: 121 },
        { id: "ocr_li_2", label: "Service charge", amount: 17 }
      ],
      lowConfidenceFields: ["tax"]
    };
  }

  return {
    merchant: "Aero Transit",
    amount: 420,
    tax: 28,
    date: "2026-03-28",
    currency: "USD",
    suggestedCategory: "Travel",
    confidence: 0.94,
    lineItems: [
      { id: "ocr_li_3", label: "Transport fare", amount: 392 },
      { id: "ocr_li_4", label: "Tax", amount: 28 }
    ],
    lowConfidenceFields: []
  };
}
