"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Calendar, Home, PanelsTopLeft, Scissors, Users } from "lucide-react";
import { NotificationBadge } from "@/components/notifications/NotificationBadge";
import { mainNavigation } from "@/lib/constants/navigation";
import { isStudioSectionPath } from "@/lib/constants/routes";
import { cn } from "@/lib/utils/cn";

const icons = {
  home: Home,
  clients: Users,
  appointments: Calendar,
  services: Scissors,
  studio: PanelsTopLeft
};

export function AndroidBottomNavigation() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-beauty-border/70 bg-beauty-surface/96 shadow-[0_-4px_24px_rgba(36,24,28,0.06)] backdrop-blur-xl">
      <div
        className="mx-auto flex h-[58px] max-w-lg items-stretch justify-between px-1"
        style={{ paddingBottom: "max(env(safe-area-inset-bottom), 0px)" }}
      >
        {mainNavigation.map((item) => {
          const Icon = icons[item.icon];
          const isActive = item.icon === "studio" ? isStudioSectionPath(pathname) : pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-xl px-1 py-1 text-[10px] font-medium transition active:scale-[0.97]",
                isActive ? "text-beauty-primary" : "text-beauty-muted"
              )}
            >
              <span
                className={cn(
                  "relative grid size-7 place-items-center rounded-full transition",
                  isActive ? "bg-beauty-primary/14" : "bg-transparent"
                )}
              >
                <Icon aria-hidden="true" className="size-[18px]" strokeWidth={isActive ? 2.25 : 2} />
                {item.icon === "studio" ? <NotificationBadge /> : null}
              </span>
              <span className="truncate leading-none">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
