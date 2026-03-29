import { ClaimStatus, NotificationType, PolicySeverity, WorkflowMode } from "@prisma/client";

import { hashPassword } from "@/lib/auth";
import { prisma } from "@/lib/db";

async function main() {
  await prisma.reimbursementPayment.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.fraudFlag.deleteMany();
  await prisma.approvalAction.deleteMany();
  await prisma.approvalRequest.deleteMany();
  await prisma.oCRExtraction.deleteMany();
  await prisma.expenseReceipt.deleteMany();
  await prisma.expenseLineItem.deleteMany();
  await prisma.expenseClaim.deleteMany();
  await prisma.approvalRule.deleteMany();
  await prisma.approvalWorkflowStep.deleteMany();
  await prisma.approvalWorkflowTemplate.deleteMany();
  await prisma.policyRule.deleteMany();
  await prisma.managerRelationship.deleteMany();
  await prisma.employeeProfile.deleteMany();
  await prisma.session.deleteMany();
  await prisma.user.deleteMany();
  await prisma.department.deleteMany();
  await prisma.costCenter.deleteMany();
  await prisma.exchangeRateSnapshot.deleteMany();
  await prisma.company.deleteMany();
  await prisma.role.deleteMany();

  const [adminRole, managerRole, employeeRole] = await Promise.all([
    prisma.role.create({ data: { key: "ADMIN", name: "Admin" } }),
    prisma.role.create({ data: { key: "MANAGER", name: "Manager" } }),
    prisma.role.create({ data: { key: "EMPLOYEE", name: "Employee" } })
  ]);

  const company = await prisma.company.create({
    data: {
      name: "Northstar Dynamics",
      country: "United States",
      baseCurrency: "USD",
      industry: "AI Infrastructure",
      size: "201-500",
      approvalPreference: "Hybrid intelligent routing",
      departments: {
        create: [{ name: "Operations" }, { name: "Sales" }, { name: "Finance" }, { name: "Product" }]
      },
      costCenters: {
        create: [
          { name: "Core Platform", code: "CP-101" },
          { name: "Revenue", code: "RV-204" },
          { name: "Corporate Finance", code: "FN-401" }
        ]
      }
    },
    include: { departments: true, costCenters: true }
  });

  const operations = company.departments.find((d) => d.name === "Operations")!;
  const sales = company.departments.find((d) => d.name === "Sales")!;
  const finance = company.departments.find((d) => d.name === "Finance")!;
  const corePlatform = company.costCenters.find((c) => c.code === "CP-101")!;
  const revenue = company.costCenters.find((c) => c.code === "RV-204")!;
  const corpFinance = company.costCenters.find((c) => c.code === "FN-401")!;

  const admin = await prisma.user.create({
    data: {
      companyId: company.id,
      roleId: adminRole.id,
      name: "Ariana Blake",
      email: "ariana@northstar.ai",
      passwordHash: hashPassword("password123"),
      employeeProfile: {
        create: {
          title: "Finance Systems Lead",
          country: "United States",
          departmentId: finance.id,
          costCenterId: corpFinance.id
        }
      }
    }
  });

  const manager1 = await prisma.user.create({
    data: {
      companyId: company.id,
      roleId: managerRole.id,
      name: "Marcus Lane",
      email: "marcus@northstar.ai",
      passwordHash: hashPassword("password123"),
      employeeProfile: {
        create: {
          title: "Operations Manager",
          country: "United States",
          departmentId: operations.id,
          costCenterId: corePlatform.id
        }
      }
    }
  });

  const manager2 = await prisma.user.create({
    data: {
      companyId: company.id,
      roleId: managerRole.id,
      name: "Priya Kapoor",
      email: "priya@northstar.ai",
      passwordHash: hashPassword("password123"),
      employeeProfile: {
        create: {
          title: "Regional Sales Manager",
          country: "India",
          departmentId: sales.id,
          costCenterId: revenue.id
        }
      }
    }
  });

  const nina = await prisma.user.create({
    data: {
      companyId: company.id,
      roleId: employeeRole.id,
      name: "Nina Chen",
      email: "nina@northstar.ai",
      passwordHash: hashPassword("password123"),
      employeeProfile: {
        create: {
          title: "Field Operations Lead",
          country: "United States",
          departmentId: operations.id,
          costCenterId: corePlatform.id,
          managerUserId: manager1.id
        }
      }
    }
  });

  const daniel = await prisma.user.create({
    data: {
      companyId: company.id,
      roleId: employeeRole.id,
      name: "Daniel Ross",
      email: "daniel@northstar.ai",
      passwordHash: hashPassword("password123"),
      employeeProfile: {
        create: {
          title: "Account Executive",
          country: "United Kingdom",
          departmentId: sales.id,
          costCenterId: revenue.id,
          managerUserId: manager2.id
        }
      }
    }
  });

  await prisma.managerRelationship.createMany({
    data: [
      { id: `${company.id}_${nina.id}`, companyId: company.id, employeeId: nina.id, managerId: manager1.id },
      { id: `${company.id}_${daniel.id}`, companyId: company.id, employeeId: daniel.id, managerId: manager2.id }
    ]
  });

  const under5k = await prisma.approvalWorkflowTemplate.create({
    data: {
      companyId: company.id,
      name: "Under 5k Fast Lane",
      description: "Manager only for low-risk claims under 5,000",
      trigger: "Amount < 5000",
      mode: WorkflowMode.SEQUENTIAL,
      steps: {
        create: [{ name: "Reporting Manager", approverType: "MANAGER", orderIndex: 0, mode: WorkflowMode.SEQUENTIAL, conditionChip: "Default manager approval" }]
      },
      rules: {
        create: [{ name: "Amount under 5k", expression: "amount < 5000", amountMax: 5000 }]
      }
    }
  });

  await prisma.approvalWorkflowTemplate.create({
    data: {
      companyId: company.id,
      name: "5k to 25k Finance Review",
      description: "Manager then finance review",
      trigger: "5001 <= Amount <= 25000",
      mode: WorkflowMode.SEQUENTIAL,
      steps: {
        create: [
          { name: "Reporting Manager", approverType: "MANAGER", orderIndex: 0, mode: WorkflowMode.SEQUENTIAL, conditionChip: "Step 1" },
          { name: "Finance", approverType: "FINANCE", orderIndex: 1, mode: WorkflowMode.SEQUENTIAL, conditionChip: "Threshold gate" }
        ]
      },
      rules: {
        create: [{ name: "Mid-value spend", expression: "amount >= 5001 && amount <= 25000", amountMin: 5001, amountMax: 25000 }]
      }
    }
  });

  await prisma.approvalWorkflowTemplate.create({
    data: {
      companyId: company.id,
      name: "International Travel",
      description: "Manager + finance + director",
      trigger: "International travel",
      mode: WorkflowMode.SEQUENTIAL,
      steps: {
        create: [
          { name: "Reporting Manager", approverType: "MANAGER", orderIndex: 0, mode: WorkflowMode.SEQUENTIAL, conditionChip: "Travel origin outside base country" },
          { name: "Finance", approverType: "FINANCE", orderIndex: 1, mode: WorkflowMode.SEQUENTIAL, conditionChip: "FX and tax review" },
          { name: "Director", approverType: "DIRECTOR", orderIndex: 2, mode: WorkflowMode.SEQUENTIAL, conditionChip: "International oversight" }
        ]
      },
      rules: {
        create: [{ name: "International travel", expression: "international === true", country: "INTERNATIONAL" }]
      }
    }
  });

  await prisma.policyRule.createMany({
    data: [
      { companyId: company.id, name: "Meals cap", description: "Meals above 120 require justification", severity: PolicySeverity.SOFT, category: "Meals", threshold: 120 },
      { companyId: company.id, name: "Hotel receipt required", description: "Hotels require a receipt", severity: PolicySeverity.HARD, category: "Hotel", requiresReceipt: true },
      { companyId: company.id, name: "Late submission", description: "Claims older than 30 days need justification", severity: PolicySeverity.SOFT },
      { companyId: company.id, name: "Weekend expense warning", description: "Weekend expenses are flagged for review", severity: PolicySeverity.SOFT },
      { companyId: company.id, name: "Travel finance threshold", description: "Travel above 2500 requires finance approval", severity: PolicySeverity.HARD, category: "Travel", threshold: 2500 }
    ]
  });

  const claim = await prisma.expenseClaim.create({
    data: {
      companyId: company.id,
      employeeId: nina.id,
      workflowTemplateId: under5k.id,
      category: "Travel",
      description: "Regional operations review in Austin",
      notes: "Flight plus airport transfers",
      merchant: "JetBlue",
      expenseDate: new Date("2026-03-10"),
      amount: 1420,
      currency: "USD",
      convertedAmount: 1420,
      companyCurrency: "USD",
      exchangeRate: 1,
      status: ClaimStatus.IN_PAYMENT_QUEUE,
      riskScore: 24,
      aiSummary: "Fully receipted domestic travel claim with matched itinerary timing and no policy blockers.",
      similarInsight: "Comparable claims have historically been approved.",
      lineItems: {
        create: [
          { label: "Airfare", amount: 1280 },
          { label: "Airport transfer", amount: 140 }
        ]
      },
      receipts: {
        create: {
          fileName: "seed-jetblue.png",
          fileUrl: "/uploads/seed-jetblue.png",
          mimeType: "image/png",
          ocrExtraction: {
            create: {
              merchant: "JetBlue",
              amount: 1420,
              tax: 83,
              date: new Date("2026-03-10"),
              currency: "USD",
              suggestedCategory: "Travel",
              confidence: 0.96,
              lowConfidenceKeys: [],
              lineItems: [
                { id: "line-1", label: "Airfare", amount: 1280 },
                { id: "line-2", label: "Transfer", amount: 140 }
              ]
            }
          }
        }
      }
    }
  });

  await prisma.reimbursementPayment.create({
    data: {
      claimId: claim.id,
      amount: 1420,
      currency: "USD",
      status: "QUEUED"
    }
  });

  await prisma.notification.createMany({
    data: [
      {
        companyId: company.id,
        userId: nina.id,
        type: NotificationType.APPROVED,
        title: "Claim approved",
        description: "Austin travel claim moved to payout queue."
      },
      {
        companyId: company.id,
        userId: admin.id,
        type: NotificationType.APPROVAL,
        title: "Review pending travel claims",
        description: "Finance review is waiting on one high-value travel expense."
      }
    ]
  });

  console.log("Seed complete");
  console.log({
    company: company.name,
    admin: admin.email,
    manager: manager1.email,
    employee: nina.email,
    password: "password123"
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
