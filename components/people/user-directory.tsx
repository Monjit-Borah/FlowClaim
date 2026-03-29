import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

export function UserDirectory({
  users
}: {
  users: Array<{
    id: string;
    name: string;
    email: string;
    role: { key: string };
    employeeProfile?: { title?: string | null } | null;
    status: "ACTIVE" | "INACTIVE";
  }>;
}) {
  return (
    <Card className="overflow-hidden">
      <div className="grid grid-cols-[1.2fr_1fr_1fr_120px] gap-3 border-b border-border/60 px-6 py-4 text-xs uppercase tracking-[0.18em] text-muted">
        <span>Name</span>
        <span>Role</span>
        <span>Department</span>
        <span>Status</span>
      </div>
      <div className="divide-y divide-border/60">
        {users.map((user) => (
          <div key={user.id} className="grid grid-cols-[1.2fr_1fr_1fr_120px] gap-3 px-6 py-4 text-sm">
            <div>
              <p className="font-medium">{user.name}</p>
              <p className="text-muted">{user.email}</p>
            </div>
            <div>{user.role.key}</div>
            <div>{user.employeeProfile?.title ?? "Unassigned"}</div>
            <div>
              <Badge tone={user.status === "ACTIVE" ? "success" : "default"}>
                {user.status === "ACTIVE" ? "Active" : "Inactive"}
              </Badge>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
