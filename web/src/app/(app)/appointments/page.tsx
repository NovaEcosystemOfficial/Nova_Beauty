import { AppointmentsManager } from "@/components/appointments/AppointmentsManager";
import { AndroidAppointmentsPage } from "@/components/android/appointments/AndroidAppointmentsPage";
import { AndroidPageGate } from "@/components/android/shared/AndroidPageGate";
import { TopHeader } from "@/components/layout/TopHeader";

export default function AppointmentsPage() {
  return (
    <AndroidPageGate android={<AndroidAppointmentsPage />}>
      <div className="space-y-6">
        <TopHeader title="Appuntamenti" subtitle="Agenda ordinata per data" />
        <AppointmentsManager />
      </div>
    </AndroidPageGate>
  );
}
