import { cn } from "@/lib/utils";

export function SectionHeading({
  eyebrow,
  title,
  description,
  action,
  className
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex items-start justify-between gap-4", className)}>
      <div className="space-y-2">
        {eyebrow ? <span className="eyebrow">{eyebrow}</span> : null}
        <div className="space-y-1">
          <h2 className="text-2xl tracking-tight text-foreground">{title}</h2>
          {description ? <p className="max-w-2xl text-sm text-muted">{description}</p> : null}
        </div>
      </div>
      {action}
    </div>
  );
}
