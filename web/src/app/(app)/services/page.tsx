import { TopHeader } from "@/components/layout/TopHeader";
import { ServicesManager } from "@/components/services/ServicesManager";
import { AndroidServicesPage } from "@/components/android/services/AndroidServicesPage";
import { AndroidPageGate } from "@/components/android/shared/AndroidPageGate";

export default function ServicesPage() {
  return (
    <AndroidPageGate android={<AndroidServicesPage />}>
      <div className="space-y-6">
        <TopHeader title="Servizi" subtitle="Catalogo trattamenti" />
        <ServicesManager />
      </div>
    </AndroidPageGate>
  );
}
