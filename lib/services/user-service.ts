import { hashPassword } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function listUsers(companyId: string) {
  return prisma.user.findMany({
    where: { companyId },
    include: {
      role: true,
      employeeProfile: {
        include: {
          department: true,
          costCenter: true,
          manager: true
        }
      }
    },
    orderBy: { createdAt: "asc" }
  });
}

export async function updateUserRole(userId: string, roleKey: string) {
  const role = await prisma.role.findUniqueOrThrow({ where: { key: roleKey } });
  return prisma.user.update({
    where: { id: userId },
    data: { roleId: role.id },
    include: { role: true }
  });
}

export async function createUser(input: {
  companyId: string;
  name: string;
  email: string;
  password: string;
  roleKey: string;
  departmentId?: string;
  costCenterId?: string;
  title?: string;
  country?: string;
  managerId?: string;
}) {
  const role = await prisma.role.findUniqueOrThrow({ where: { key: input.roleKey } });

  const user = await prisma.user.create({
    data: {
      companyId: input.companyId,
      roleId: role.id,
      name: input.name,
      email: input.email.toLowerCase(),
      passwordHash: hashPassword(input.password),
      employeeProfile: {
        create: {
          departmentId: input.departmentId,
          costCenterId: input.costCenterId,
          title: input.title,
          country: input.country,
          managerUserId: input.managerId
        }
      }
    },
    include: {
      role: true,
      employeeProfile: true
    }
  });

  if (input.managerId) {
    await prisma.managerRelationship.upsert({
      where: { id: `${input.companyId}_${user.id}` },
      update: { managerId: input.managerId },
      create: {
        id: `${input.companyId}_${user.id}`,
        companyId: input.companyId,
        employeeId: user.id,
        managerId: input.managerId
      }
    });
  }

  return user;
}

export async function assignManager(employeeId: string, managerId: string, companyId: string) {
  await prisma.employeeProfile.update({
    where: { userId: employeeId },
    data: { managerUserId: managerId }
  });

  return prisma.managerRelationship.upsert({
    where: { id: `${companyId}_${employeeId}` },
    update: { managerId },
    create: {
      id: `${companyId}_${employeeId}`,
      companyId,
      employeeId,
      managerId
    }
  });
}
