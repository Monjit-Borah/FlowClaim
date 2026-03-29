import { NextResponse } from "next/server";

import { requireUser } from "@/lib/auth";
import { getCompany, updateCompany } from "@/lib/services/company-service";

export async function GET() {
  const user = await requireUser();
  const company = await getCompany(user.companyId);
  return NextResponse.json(company);
}

export async function PATCH(request: Request) {
  const user = await requireUser();
  const body = await request.json();
  const company = await updateCompany(user.companyId, body);
  return NextResponse.json(company);
}
