import { requireRole } from "@/lib/auth";
import { listClaims } from "@/lib/services/claim-service";

import { EmployeeDashboard } from "@/components/dashboard/employee-dashboard";

export default async function EmployeeDashboardPage() {
  const user = await requireRole(["EMPLOYEE", "MANAGER", "ADMIN"]);
  const myClaims = await listClaims({ employeeId: user.id });

  return <EmployeeDashboard claims={myClaims} userName={user.name} />;
}
