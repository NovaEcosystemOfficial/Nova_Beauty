"use client";

import { useEffect, useState, type ReactNode } from "react";
import { isCapacitorNative } from "@/lib/native/capacitor-runtime";

type AndroidPageGateProps = {
  android: ReactNode;
  children: ReactNode;
};

export function AndroidPageGate({ android, children }: AndroidPageGateProps) {
  const [isNative, setIsNative] = useState(() => typeof window !== "undefined" && isCapacitorNative());

  useEffect(() => {
    setIsNative(isCapacitorNative());
  }, []);

  if (isNative) {
    return android;
  }

  return children;
}
