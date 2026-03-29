import { NextResponse } from "next/server";

import { runOcrFromUrl } from "@/lib/ocr";

export async function POST(request: Request) {
  const body = await request.json();
  return NextResponse.json(await runOcrFromUrl(body.fileUrl));
}
