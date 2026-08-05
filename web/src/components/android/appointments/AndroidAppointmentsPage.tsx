"use client";

import { useRef } from "react";
import { AndroidTopBar } from "@/components/android/layout/AndroidTopBar";
import { AndroidFab } from "@/components/android/shared/AndroidFab";
import { AppointmentsManager } from "@/components/appointments/AppointmentsManager";

export function AndroidAppointmentsPage() {
  const managerRef = useRef<HTMLDivElement>(null);

  function openNewAppointment() {
    const buttons = managerRef.current?.querySelectorAll<HTMLButtonElement>("button[type='button']");
    const newButton = Array.from(buttons ?? []).find((item) => item.textContent?.includes("Nuovo appuntamento"));
    newButton?.click();
  }

  return (
    <div className="space-y-3 pb-2">
      <AndroidTopBar title="Agenda" subtitle="Appuntamenti dello studio" />

      <div ref={managerRef}>
        <AppointmentsManager androidChromeHidden />
      </div>

      <AndroidFab label="Nuovo appuntamento" onClick={openNewAppointment} />
    </div>
  );
}
