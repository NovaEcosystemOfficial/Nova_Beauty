import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

type AndroidTopBarProps = {
  title: string;
  subtitle?: string;
  left?: ReactNode;
  right?: ReactNode;
  compact?: boolean;
  className?: string;
};

export function AndroidTopBar({ title, subtitle, left, right, compact = false, className }: AndroidTopBarProps) {
  return (
    <header
      className={cn("flex items-center justify-between gap-3", compact ? "min-h-11" : "min-h-12", className)}
      style={{ paddingTop: "max(env(safe-area-inset-top), 0px)" }}
    >
      <div className="flex min-w-0 flex-1 items-center gap-2">
        {left ? <div className="shrink-0">{left}</div> : null}
        <div className="min-w-0">
          <h1 className="truncate text-[18px] font-bold leading-tight text-beauty-text">{title}</h1>
          {subtitle ? <p className="truncate text-[12px] text-beauty-muted">{subtitle}</p> : null}
        </div>
      </div>
      {right ? <div className="flex shrink-0 items-center gap-1">{right}</div> : null}
    </header>
  );
}
