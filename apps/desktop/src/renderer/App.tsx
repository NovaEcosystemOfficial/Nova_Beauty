import { useMemo, useState } from "react";
import DesktopShell from "./components/DesktopShell";
import type { DesktopNavKey } from "./components/DesktopSidebar";
import { DemoWorkflowProvider } from "./demo/DemoWorkflowContext";
import ToastHost from "./components/ui/ToastHost";
import NewAppointmentDrawer from "./components/ui/NewAppointmentDrawer";
import AppointmentDetailDrawer from "./components/ui/AppointmentDetailDrawer";
import CompleteAppointmentDialog from "./components/ui/CompleteAppointmentDialog";

export default function App() {
  const [active, setActive] = useState<DesktopNavKey>("dashboard");

  const navTitle = useMemo(() => {
    switch (active) {
      case "dashboard":
        return "Dashboard";
      case "agenda":
        return "Agenda";
      case "clients":
        return "Clienti";
      case "services":
        return "Servizi";
      case "inventory":
        return "Magazzino";
      case "suppliers":
        return "Fornitori";
      case "studio":
        return "Studio";
      case "reports":
        return "Report";
      case "settings":
        return "Impostazioni";
      default:
        return "NovaBeauty Desktop";
    }
  }, [active]);

  return (
    <DemoWorkflowProvider>
      <DesktopShell active={active} onNavigate={setActive} pageTitle={navTitle} />
      <NewAppointmentDrawer />
      <AppointmentDetailDrawer />
      <CompleteAppointmentDialog />
      <ToastHost />
    </DemoWorkflowProvider>
  );
}
