import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

const toneClass = {
  neutral: "text-foreground",
  success: "text-success",
  warning: "text-warning",
  destructive: "text-destructive",
  info: "text-info",
  primary: "text-primary",
} as const;

export function StatCard({
  label,
  value,
  hint,
  tone = "neutral",
  icon,
}: {
  label: string;
  value: ReactNode;
  hint?: string;
  tone?: keyof typeof toneClass;
  icon?: ReactNode;
}) {
  return (
    <div className="surface p-4">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
        {icon}
      </div>
      <p className={cn("num mt-2 font-display text-2xl font-semibold", toneClass[tone])}>{value}</p>
      {hint ? <p className="mt-1 text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}
