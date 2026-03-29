import { NextResponse } from "next/server";

import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const user = await requireUser();
  return NextResponse.json(
    await prisma.fraudFlag.findMany({
      where: { claim: { companyId: user.companyId } },
      include: { claim: true },
      orderBy: { score: "desc" }
    })
  );
}
