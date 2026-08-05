import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils/cn";

type AndroidMetricCardProps = {
  label: string;
  value: string;
  icon: LucideIcon;
  tone?: "primary" | "mint" | "gold" | "lavender";
  className?: string;
};

const toneClasses = {
  primary: "bg-beauty-primary/10 text-beauty-primary",
  mint: "bg-beauty-mint/15 text-beauty-mint",
  gold: "bg-beauty-gold/15 text-beauty-gold",
  lavender: "bg-beauty-lavender/15 text-beauty-lavender"
};

export function AndroidMetricCard({ label, value, icon: Icon, tone = "primary", className }: AndroidMetricCardProps) {
  return (
    <div className={cn("rounded-2xl border border-beauty-border/60 bg-beauty-elevated/80 p-3 shadow-beauty-soft", className)}>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-beauty-muted">{label}</p>
          <p className="mt-1 truncate text-[20px] font-bold leading-none text-beauty-text">{value}</p>
        </div>
        <span className={cn("grid size-8 shrink-0 place-items-center rounded-full", toneClasses[tone])}>
          <Icon className="size-4" aria-hidden="true" />
        </span>
      </div>
    </div>
  );
}
