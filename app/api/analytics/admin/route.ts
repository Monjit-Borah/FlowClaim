import { NextResponse } from "next/server";

import { requireUser } from "@/lib/auth";
import { getAdminAnalytics } from "@/lib/services/analytics-service";

export async function GET() {
  const user = await requireUser();
  return NextResponse.json(await getAdminAnalytics(user.companyId));
}
