import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { OrgChart } from "@/components/people/org-chart";
import { SectionHeading } from "@/components/shared/section-heading";

export default async function ManagerMappingPage() {
  const user = await requireRole(["ADMIN"]);
  const managers = await prisma.user.findMany({
    where: { companyId: user.companyId, role: { key: "MANAGER" } },
    include: {
      employeeProfile: true,
      managedProfiles: {
        include: {
          user: {
            include: {
              employeeProfile: true
            }
          }
        }
      }
    }
  });
  return (
    <div className="space-y-6">
      <SectionHeading
        eyebrow="Hierarchy"
        title="Employee-manager mapping"
        description="Visualize reporting lines and rebalance approvals with a clean org hierarchy view."
      />
      <OrgChart managers={managers} />
    </div>
  );
}
