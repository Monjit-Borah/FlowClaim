import { Card } from "@/components/ui/card";

export function OrgChart({
  managers
}: {
  managers: Array<{
    id: string;
    name: string;
    employeeProfile?: { title?: string | null } | null;
    managedProfiles?: Array<{ user: { id: string; name: string; employeeProfile?: { title?: string | null } | null } }>;
  }>;
}) {
  return (
    <Card className="p-6">
      <p className="text-sm text-muted">Reporting structure</p>
      <h3 className="mt-1 text-2xl font-semibold">Employee-manager mapping</h3>
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        {managers.map((manager) => (
          <div key={manager.id} className="rounded-[26px] border border-border/70 bg-white/70 p-5">
            <p className="font-medium">{manager.name}</p>
            <p className="text-sm text-muted">{manager.employeeProfile?.title ?? "Manager"}</p>
            <div className="mt-4 space-y-2">
              {(manager.managedProfiles ?? []).map((profile) => (
                  <div key={profile.user.id} className="rounded-2xl bg-panel px-4 py-3">
                    <p className="font-medium">{profile.user.name}</p>
                    <p className="text-sm text-muted">{profile.user.employeeProfile?.title ?? "Employee"}</p>
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
