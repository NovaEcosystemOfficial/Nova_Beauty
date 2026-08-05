import { useEffect, useMemo, useState } from "react";
import DesktopShell from "./components/DesktopShell";
import type { DesktopNavKey } from "./components/DesktopSidebar";
import type { SettingsDeepLink } from "./components/SettingsWorkspace";
import { DemoWorkflowProvider, useDemoWorkflow } from "./demo/DemoWorkflowContext";
import { ThemeProvider } from "./theme/ThemeProvider";
import ToastHost from "./components/ui/ToastHost";
import NewAppointmentDrawer from "./components/ui/NewAppointmentDrawer";
import AppointmentDetailDrawer from "./components/ui/AppointmentDetailDrawer";
import CompleteAppointmentDialog from "./components/ui/CompleteAppointmentDialog";
import NewClientWizard from "./components/ui/NewClientWizard";

function NavRequestBridge({
  setActive
}: {
  setActive: (key: DesktopNavKey) => void;
}) {
  const { navRequest } = useDemoWorkflow();

  useEffect(() => {
    if (navRequest) setActive(navRequest.key);
  }, [navRequest, setActive]);

  return null;
}

function AppShell() {
  const [active, setActive] = useState<DesktopNavKey>("dashboard");
  const [settingsFocus, setSettingsFocus] = useState<{
    token: number;
    section: SettingsDeepLink;
  }>({ token: 0, section: "centro" });

  const openSettingsSection = (section: SettingsDeepLink) => {
    setSettingsFocus((prev) => ({ token: prev.token + 1, section }));
    setActive("settings");
  };

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
    <>
      <NavRequestBridge setActive={setActive} />
      <DesktopShell
        active={active}
        onNavigate={setActive}
        onOpenAccount={() => openSettingsSection("centro")}
        onOpenNotificationCenter={() => openSettingsSection("notifiche")}
        settingsFocusToken={settingsFocus.token}
        settingsFocusSection={settingsFocus.section}
        pageTitle={navTitle}
      />
      <NewAppointmentDrawer />
      <AppointmentDetailDrawer />
      <CompleteAppointmentDialog />
      <NewClientWizard />
      <ToastHost />
    </>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <DemoWorkflowProvider>
        <AppShell />
      </DemoWorkflowProvider>
    </ThemeProvider>
  );
}
