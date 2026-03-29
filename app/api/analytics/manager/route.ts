import { NextResponse } from "next/server";

import { requireUser } from "@/lib/auth";
import { getManagerAnalytics } from "@/lib/services/analytics-service";

export async function GET() {
  const user = await requireUser();
  return NextResponse.json(await getManagerAnalytics(user.companyId, user.id));
}
