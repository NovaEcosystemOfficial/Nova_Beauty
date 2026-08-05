"use client";

import { Suspense } from "react";
import { ClientsManager } from "@/components/clients/ClientsManager";
import { AndroidClientsPage } from "@/components/android/clients/AndroidClientsPage";
import { AndroidPageGate } from "@/components/android/shared/AndroidPageGate";
import { TopHeader } from "@/components/layout/TopHeader";
import { Skeleton } from "@/components/ui/Skeleton";

export default function ClientsPage() {
  return (
    <AndroidPageGate
      android={<AndroidClientsPage />}
    >
      <div className="space-y-6">
        <TopHeader title="Clienti" subtitle="Lista clienti dell'utente autenticato" />
        <Suspense fallback={<Skeleton className="h-40" />}>
          <ClientsManager />
        </Suspense>
      </div>
    </AndroidPageGate>
  );
}
