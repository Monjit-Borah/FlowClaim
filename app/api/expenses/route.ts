import { NextResponse } from "next/server";

import { requireUser } from "@/lib/auth";
import { createDraftClaim, listClaims } from "@/lib/services/claim-service";

export async function GET() {
  const user = await requireUser();
  const filters =
    user.role.key === "EMPLOYEE"
      ? { employeeId: user.id }
      : user.role.key === "MANAGER"
        ? { managerId: user.id }
        : { companyId: user.companyId };
  return NextResponse.json(await listClaims(filters));
}

export async function POST(request: Request) {
  const user = await requireUser();
  const body = await request.json();
  return NextResponse.json(
    await createDraftClaim({
      ...body,
      companyId: user.companyId,
      employeeId: user.id
    }),
    { status: 201 }
  );
}
