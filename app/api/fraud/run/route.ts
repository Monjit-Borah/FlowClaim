import { NextResponse } from "next/server";

import { requireUser } from "@/lib/auth";
import { runFraudChecks } from "@/lib/services/fraud-engine";

export async function POST(request: Request) {
  const body = await request.json();
  const user = await requireUser();
  return NextResponse.json(await runFraudChecks({ ...body, companyId: user.companyId }));
}
