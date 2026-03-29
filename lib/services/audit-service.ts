import { prisma } from "@/lib/db";

export async function listAuditLogs(companyId: string) {
  return prisma.auditLog.findMany({
    where: { companyId },
    include: { actor: true },
    orderBy: { createdAt: "desc" }
  });
}

export async function createAuditLog(input: {
  companyId: string;
  actorId?: string | null;
  action: string;
  target: string;
  detail: string;
}) {
  return prisma.auditLog.create({
    data: input
  });
}
