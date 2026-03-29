import { NextResponse } from "next/server";

import { requireUser } from "@/lib/auth";
import { getPendingApprovals } from "@/lib/services/approval-service";

export async function GET() {
  const user = await requireUser();
  return NextResponse.json(await getPendingApprovals(user.id));
}
