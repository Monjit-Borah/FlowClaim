import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { listUsers } from "@/lib/services/user-service";
import { CreateUserPanel } from "@/components/people/create-user-panel";
import { SectionHeading } from "@/components/shared/section-heading";
import { UserDirectory } from "@/components/people/user-directory";

export default async function AdminUsersPage() {
  const user = await requireRole(["ADMIN"]);
  const [users, departments, costCenters, managers] = await Promise.all([
    listUsers(user.companyId),
    prisma.department.findMany({
      where: { companyId: user.companyId },
      orderBy: { name: "asc" }
    }),
    prisma.costCenter.findMany({
      where: { companyId: user.companyId },
      orderBy: { name: "asc" }
    }),
    prisma.user.findMany({
      where: {
        companyId: user.companyId,
        role: {
          key: {
            in: ["ADMIN", "MANAGER"]
          }
        }
      },
      orderBy: { name: "asc" }
    })
  ]);
  return (
    <div className="space-y-6">
      <SectionHeading
        eyebrow="People management"
        title="Users, roles, departments, and cost centers"
        description="Searchable employee directory with role assignment and activation states."
      />
      <CreateUserPanel
        departments={departments.map((department) => ({ id: department.id, label: department.name }))}
        costCenters={costCenters.map((costCenter) => ({
          id: costCenter.id,
          label: `${costCenter.name} (${costCenter.code})`
        }))}
        managers={managers.map((manager) => ({ id: manager.id, label: `${manager.name} · ${manager.email}` }))}
      />
      <UserDirectory users={users} />
    </div>
  );
}
