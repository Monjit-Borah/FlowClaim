import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto grid min-h-screen max-w-[1800px] gap-6 px-4 py-6 lg:px-8 lg:py-8 app-shell-grid">
      <Sidebar />
      <div className="space-y-6">
        <Topbar />
        <main className="space-y-6">{children}</main>
      </div>
    </div>
  );
}
