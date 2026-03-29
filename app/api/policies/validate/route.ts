import { NextResponse } from "next/server";

import { requireUser } from "@/lib/auth";
import { validatePolicy } from "@/lib/services/policy-engine";

export async function POST(request: Request) {
  const body = await request.json();
  const user = await requireUser();
  return NextResponse.json(await validatePolicy({ ...body, companyId: user.companyId }));
}
