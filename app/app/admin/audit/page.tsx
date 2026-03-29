import { requireRole } from "@/lib/auth";
import { listAuditLogs } from "@/lib/services/audit-service";
import { AuditList } from "@/components/shared/audit-list";
import { SectionHeading } from "@/components/shared/section-heading";

export default async function AuditLogsPage() {
  const user = await requireRole(["ADMIN"]);
  const auditLogs = await listAuditLogs(user.companyId);
  return (
    <div className="space-y-6">
      <SectionHeading
        eyebrow="Audit trail"
        title="Company actions, overrides, and system events"
        description="Track who changed what, when it happened, and how the decision moved through the system."
      />
      <AuditList
        auditLogs={auditLogs.map((entry) => ({
          id: entry.id,
          action: entry.action,
          target: entry.target,
          timestamp: entry.createdAt.toISOString(),
          actor: entry.actor?.name ?? "System",
          detail: entry.detail
        }))}
      />
    </div>
  );
}
