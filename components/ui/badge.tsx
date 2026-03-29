import { cn } from "@/lib/utils";

export function Badge({
  children,
  tone = "default"
}: {
  children: React.ReactNode;
  tone?: "default" | "success" | "warning" | "danger";
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium",
        tone === "default" && "border-border bg-transparent text-muted",
        tone === "success" && "border-success bg-transparent text-success",
        tone === "warning" && "border-highlight bg-transparent text-highlight",
        tone === "danger" && "border-danger bg-transparent text-danger"
      )}
    >
      {children}
    </span>
  );
}
