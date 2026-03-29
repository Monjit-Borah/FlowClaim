import { NextResponse } from "next/server";

import { requireUser } from "@/lib/auth";
import { getEmployeeAnalytics } from "@/lib/services/analytics-service";

export async function GET() {
  const user = await requireUser();
  return NextResponse.json(await getEmployeeAnalytics(user.companyId, user.id));
}
