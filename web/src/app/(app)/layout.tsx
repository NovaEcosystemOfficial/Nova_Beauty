import { PrivateRoute } from "@/components/auth/PrivateRoute";
import { AndroidAppShellGate } from "@/components/android/layout/AndroidAppShellGate";

export default function MainAppLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <PrivateRoute>
      <AndroidAppShellGate>{children}</AndroidAppShellGate>
    </PrivateRoute>
  );
}
