import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

type AndroidSectionTitleProps = {
  title: string;
  action?: ReactNode;
  className?: string;
};

export function AndroidSectionTitle({ title, action, className }: AndroidSectionTitleProps) {
  return (
    <div className={cn("flex items-center justify-between gap-2", className)}>
      <h2 className="text-[13px] font-bold uppercase tracking-[0.1em] text-beauty-muted">{title}</h2>
      {action}
    </div>
  );
}
