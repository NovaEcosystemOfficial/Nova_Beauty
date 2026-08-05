"use client";

import { useRef } from "react";
import { AndroidTopBar } from "@/components/android/layout/AndroidTopBar";
import { AndroidFab } from "@/components/android/shared/AndroidFab";
import { ServicesManager } from "@/components/services/ServicesManager";

export function AndroidServicesPage() {
  const managerRef = useRef<HTMLDivElement>(null);

  function openNewService() {
    const buttons = managerRef.current?.querySelectorAll<HTMLButtonElement>("button[type='button']");
    const newButton = Array.from(buttons ?? []).find((item) => item.textContent?.includes("Nuovo servizio"));
    newButton?.click();
  }

  return (
    <div className="space-y-3 pb-2">
      <AndroidTopBar title="Servizi" subtitle="Catalogo trattamenti" />

      <div ref={managerRef}>
        <ServicesManager androidChromeHidden />
      </div>

      <AndroidFab label="Nuovo servizio" onClick={openNewService} />
    </div>
  );
}
