import { NextResponse } from "next/server";

import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { listWorkflowTemplates } from "@/lib/services/workflow-engine";

export async function GET() {
  const user = await requireUser();
  return NextResponse.json(await listWorkflowTemplates(user.companyId));
}

export async function POST(request: Request) {
  const user = await requireUser();
  const body = await request.json();
  const workflow = await prisma.approvalWorkflowTemplate.create({
    data: {
      companyId: user.companyId,
      name: body.name,
      description: body.description,
      trigger: body.trigger,
      mode: body.mode,
      steps: {
        create: (body.steps ?? []).map((step: any, index: number) => ({
          name: step.name,
          approverType: step.approverType,
          specificUserId: step.specificUserId,
          orderIndex: index,
          mode: step.mode,
          minApprovalPercent: step.minApprovalPercent,
          overrideAutoApprove: step.overrideAutoApprove ?? false,
          conditionChip: step.conditionChip
        }))
      },
      rules: {
        create: (body.rules ?? []).map((rule: any) => ({
          name: rule.name,
          expression: rule.expression,
          threshold: rule.threshold,
          category: rule.category,
          amountMin: rule.amountMin,
          amountMax: rule.amountMax,
          country: rule.country,
          specificApprover: rule.specificApprover,
          requiresFinance: rule.requiresFinance ?? false
        }))
      }
    },
    include: { steps: true, rules: true }
  });
  return NextResponse.json(workflow, { status: 201 });
}
