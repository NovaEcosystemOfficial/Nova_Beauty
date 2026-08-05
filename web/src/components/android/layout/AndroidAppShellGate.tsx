"use client";

import { useEffect, useState, type ReactNode } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { AndroidAppShell } from "@/components/android/layout/AndroidAppShell";
import { isCapacitorNative } from "@/lib/native/capacitor-runtime";

type AndroidAppShellGateProps = {
  children: ReactNode;
};

export function AndroidAppShellGate({ children }: AndroidAppShellGateProps) {
  const [isNative, setIsNative] = useState(() => typeof window !== "undefined" && isCapacitorNative());

  useEffect(() => {
    if (isCapacitorNative()) {
      document.documentElement.dataset.platform = "android";
      setIsNative(true);
      return;
    }

    delete document.documentElement.dataset.platform;
    setIsNative(false);
  }, []);

  if (isNative) {
    return <AndroidAppShell>{children}</AndroidAppShell>;
  }

  return <AppShell>{children}</AppShell>;
}
