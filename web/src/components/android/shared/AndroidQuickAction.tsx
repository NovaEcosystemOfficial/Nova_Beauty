"use client";

import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { androidHapticLight } from "@/lib/native/android-haptics";

type AndroidQuickActionProps = {
  label: string;
  href: string;
  icon: LucideIcon;
  tone?: "primary" | "mint" | "gold" | "lavender";
};

const toneClasses = {
  primary: "bg-beauty-primary/10 text-beauty-primary",
  mint: "bg-beauty-mint/15 text-beauty-mint",
  gold: "bg-beauty-gold/15 text-beauty-gold",
  lavender: "bg-beauty-lavender/15 text-beauty-lavender"
};

export function AndroidQuickAction({ label, href, icon: Icon, tone = "primary" }: AndroidQuickActionProps) {
  return (
    <Link
      href={href}
      onClick={() => void androidHapticLight()}
      className="flex min-h-[72px] flex-col items-center justify-center gap-1.5 rounded-2xl border border-beauty-border/60 bg-beauty-elevated/75 px-2 py-3 text-center shadow-beauty-soft transition active:scale-[0.98]"
    >
      <span className={cn("grid size-8 place-items-center rounded-full", toneClasses[tone])}>
        <Icon className="size-4" aria-hidden="true" />
      </span>
      <span className="text-[11px] font-semibold leading-tight text-beauty-text">{label}</span>
    </Link>
  );
}
