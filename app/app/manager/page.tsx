import { requireRole } from "@/lib/auth";
import { listApprovalDashboardClaims } from "@/lib/services/approval-service";

import { ManagerApprovalDashboard } from "@/components/dashboard/manager-approval-dashboard";

export default async function ManagerDashboardPage() {
  const user = await requireRole(["MANAGER", "ADMIN"]);
  const claims = await listApprovalDashboardClaims({
    userId: user.id,
    companyId: user.companyId,
    roleKey: user.role.key
  });

  return <ManagerApprovalDashboard claims={claims} managerName={user.name} />;
}
