import { NextResponse } from "next/server";

import { evaluateApprovalRule } from "@/lib/services/workflow-engine";

export async function POST(request: Request) {
  const body = await request.json();
  return NextResponse.json(evaluateApprovalRule(body));
}
