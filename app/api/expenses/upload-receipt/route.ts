import { NextResponse } from "next/server";
import { ClaimStatus } from "@prisma/client";

import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { runOcrFromFile } from "@/lib/ocr";
import { saveUploadedFile } from "@/lib/uploads";

export async function POST(request: Request) {
  try {
    const user = await requireUser();
    const formData = await request.formData();
    const file = formData.get("receipt");
    const claimId = String(formData.get("claimId") ?? "");

    if (!(file instanceof File) || !claimId) {
      return NextResponse.json({ message: "Receipt and claimId are required." }, { status: 400 });
    }

    const uploaded = await saveUploadedFile(file);

    const receipt = await prisma.expenseReceipt.create({
      data: {
        claimId,
        fileName: uploaded.fileName,
        fileUrl: uploaded.fileUrl,
        mimeType: uploaded.mimeType,
        size: uploaded.size
      }
    });

    await prisma.expenseClaim.update({
      where: { id: claimId },
      data: { status: ClaimStatus.OCR_PROCESSING }
    });

    const ocr = await runOcrFromFile(file, uploaded.filePath);
    if (!ocr) {
      throw new Error("OCR processing did not return any extracted data.");
    }

    const extraction = await prisma.oCRExtraction.create({
      data: {
        receiptId: receipt.id,
        merchant: ocr.merchant,
        amount: ocr.amount,
        tax: ocr.tax,
        date: ocr.date ?? undefined,
        currency: ocr.currency,
        suggestedCategory: ocr.suggestedCategory,
        confidence: ocr.confidence,
        lowConfidenceKeys: ocr.lowConfidenceKeys,
        rawText: ocr.rawText,
        lineItems: ocr.lineItems
      }
    });

    await prisma.expenseClaim.update({
      where: { id: claimId },
      data: {
        merchant: ocr.merchant || undefined,
        category: ocr.suggestedCategory || undefined,
        amount: ocr.amount || undefined,
        status: ClaimStatus.READY_FOR_REVIEW
      }
    });

    return NextResponse.json({ receipt, extraction, uploadedBy: user.id });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Receipt upload or OCR failed.";
    return NextResponse.json({ message }, { status: 500 });
  }
}
