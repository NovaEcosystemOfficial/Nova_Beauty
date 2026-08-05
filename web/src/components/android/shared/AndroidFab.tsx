"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { androidHapticLight } from "@/lib/native/android-haptics";

type AndroidFabProps = {
  label: string;
  onClick?: () => void;
  href?: string;
  className?: string;
};

export function AndroidFab({ label, onClick, href, className }: AndroidFabProps) {
  const content = (
    <>
      <Plus className="size-5" aria-hidden="true" />
      <span>{label}</span>
    </>
  );

  const classes = cn(
    "fixed z-30 inline-flex h-12 items-center gap-2 rounded-full bg-beauty-primary px-4 text-[13px] font-semibold text-white shadow-beauty-floating transition active:scale-[0.98]",
    className
  );

  const style = {
    right: "1rem",
    bottom: "calc(4.5rem + max(env(safe-area-inset-bottom), 0px))"
  } as const;

  if (href) {
    return (
      <Link href={href} className={classes} style={style} onClick={() => void androidHapticLight()}>
        {content}
      </Link>
    );
  }

  return (
    <button type="button" className={classes} style={style} onClick={() => { void androidHapticLight(); onClick?.(); }}>
      {content}
    </button>
  );
}
