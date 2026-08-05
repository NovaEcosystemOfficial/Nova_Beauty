"use client";

import type { ReactNode } from "react";
import { NotificationRuntime } from "@/components/notifications/NotificationRuntime";
import { AndroidBottomNavigation } from "@/components/android/layout/AndroidBottomNavigation";
import "@/styles/android-platform.css";

type AndroidAppShellProps = {
  children: ReactNode;
};

export function AndroidAppShell({ children }: AndroidAppShellProps) {
  return (
    <div className="android-shell min-h-dvh bg-beauty-background text-beauty-text">
      <main
        className="android-shell-main mx-auto w-full max-w-lg px-4"
        style={{
          paddingTop: "0.5rem",
          paddingBottom: "calc(4.75rem + max(env(safe-area-inset-bottom), 0px))"
        }}
      >
        {children}
      </main>
      <NotificationRuntime />
      <AndroidBottomNavigation />
    </div>
  );
}
