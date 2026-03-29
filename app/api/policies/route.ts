import { NextResponse } from "next/server";

import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { listPolicyRules } from "@/lib/services/policy-engine";

export async function GET() {
  const user = await requireUser();
  return NextResponse.json(await listPolicyRules(user.companyId));
}

export async function POST(request: Request) {
  const user = await requireUser();
  const body = await request.json();
  const rule = await prisma.policyRule.create({
    data: {
      companyId: user.companyId,
      name: body.name,
      description: body.description,
      severity: body.severity,
      category: body.category,
      threshold: body.threshold,
      requiresReceipt: body.requiresReceipt ?? false,
      metadata: body.metadata ?? null
    }
  });
  return NextResponse.json(rule, { status: 201 });
}
