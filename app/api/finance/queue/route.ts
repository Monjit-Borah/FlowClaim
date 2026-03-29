import { NextResponse } from "next/server";

import { requireUser } from "@/lib/auth";
import { getPaymentQueue } from "@/lib/services/finance-service";

export async function GET() {
  const user = await requireUser();
  return NextResponse.json(await getPaymentQueue(user.companyId));
}
