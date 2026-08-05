import { StudioHome } from "@/components/studio/StudioHome";
import { AndroidStudioPage } from "@/components/android/studio/AndroidStudioPage";
import { AndroidPageGate } from "@/components/android/shared/AndroidPageGate";

export default function StudioPage() {
  return (
    <AndroidPageGate android={<AndroidStudioPage />}>
      <StudioHome />
    </AndroidPageGate>
  );
}
