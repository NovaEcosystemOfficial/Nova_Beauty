import { DashboardHome } from "@/components/dashboard/DashboardHome";
import { AndroidDashboardHome } from "@/components/android/home/AndroidDashboardHome";
import { AndroidPageGate } from "@/components/android/shared/AndroidPageGate";

export default function DashboardPage() {
  return (
    <AndroidPageGate android={<AndroidDashboardHome />}>
      <DashboardHome />
    </AndroidPageGate>
  );
}
