"use client";

import { Suspense, useRef } from "react";
import { SlidersHorizontal } from "lucide-react";
import { ClientsManager } from "@/components/clients/ClientsManager";
import { AndroidFab } from "@/components/android/shared/AndroidFab";
import { AndroidTopBar } from "@/components/android/layout/AndroidTopBar";
import { Skeleton } from "@/components/ui/Skeleton";

export function AndroidClientsPage() {
  const managerRef = useRef<HTMLDivElement>(null);

  function openNewClient() {
    const buttons = managerRef.current?.querySelectorAll<HTMLButtonElement>("button[type='button']");
    const newClientButton = Array.from(buttons ?? []).find((item) => item.textContent?.includes("Nuovo cliente"));
    newClientButton?.click();
  }

  return (
    <div className="space-y-3 pb-2">
      <AndroidTopBar
        title="Clienti"
        subtitle="Anagrafica studio"
        right={
          <button
            type="button"
            className="grid size-9 place-items-center rounded-full bg-beauty-elevated text-beauty-muted shadow-beauty-soft"
            aria-label="Filtri"
          >
            <SlidersHorizontal className="size-4" aria-hidden="true" />
          </button>
        }
      />

      <div ref={managerRef}>
        <Suspense fallback={<Skeleton className="h-40" />}>
          <ClientsManager androidChromeHidden />
        </Suspense>
      </div>

      <AndroidFab label="Nuovo cliente" onClick={openNewClient} />
    </div>
  );
}
