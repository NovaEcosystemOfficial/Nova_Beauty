import DesktopHeader from "./DesktopHeader";
import DesktopSidebar from "./DesktopSidebar";
import DemoDashboard from "./DemoDashboard";
import ClientsWorkspace from "./ClientsWorkspace";
import AgendaWorkspace from "./AgendaWorkspace";
import ServicesWorkspace from "./ServicesWorkspace";
import InventoryWorkspace from "./InventoryWorkspace";
import SuppliersWorkspace from "./SuppliersWorkspace";
import StudioWorkspace from "./StudioWorkspace";
import SettingsWorkspace, { type SettingsDeepLink } from "./SettingsWorkspace";
import ReportsWorkspace from "./ReportsWorkspace";
import WorkspacePlaceholder from "./WorkspacePlaceholder";
import type { DesktopNavKey } from "./DesktopSidebar";

type DesktopShellProps = {
  active: DesktopNavKey;
  onNavigate: (key: DesktopNavKey) => void;
  onOpenAccount: () => void;
  onOpenNotificationCenter: () => void;
  settingsFocusToken: number;
  settingsFocusSection: SettingsDeepLink;
  pageTitle: string;
};

function MainContent({
  active,
  pageTitle,
  settingsFocusToken,
  settingsFocusSection
}: {
  active: DesktopNavKey;
  pageTitle: string;
  settingsFocusToken: number;
  settingsFocusSection: SettingsDeepLink;
}) {
  switch (active) {
    case "dashboard":
      return <DemoDashboard />;
    case "clients":
      return <ClientsWorkspace />;
    case "agenda":
      return <AgendaWorkspace />;
    case "services":
      return <ServicesWorkspace />;
    case "inventory":
      return <InventoryWorkspace />;
    case "suppliers":
      return <SuppliersWorkspace />;
    case "studio":
      return <StudioWorkspace />;
    case "reports":
      return <ReportsWorkspace />;
    case "settings":
      return (
        <SettingsWorkspace focusToken={settingsFocusToken} focusSection={settingsFocusSection} />
      );
    default:
      return (
        <WorkspacePlaceholder
          title={pageTitle}
          hint="Questo workspace arriverà nei prossimi sprint. La sidebar resta stabile."
        />
      );
  }
}

export default function DesktopShell({
  active,
  onNavigate,
  onOpenAccount,
  onOpenNotificationCenter,
  settingsFocusToken,
  settingsFocusSection,
  pageTitle
}: DesktopShellProps) {
  const isWorkspace =
    active === "clients" ||
    active === "agenda" ||
    active === "services" ||
    active === "inventory" ||
    active === "suppliers" ||
    active === "studio" ||
    active === "reports" ||
    active === "settings";

  return (
    <div className="nb-app">
      <DesktopSidebar active={active} onNavigate={onNavigate} />
      <div className="nb-mainColumn">
        <DesktopHeader
          pageTitle={pageTitle}
          active={active}
          onOpenAccount={onOpenAccount}
          onOpenNotificationCenter={onOpenNotificationCenter}
        />
        <main className={isWorkspace ? "nb-main nb-main--workspace" : "nb-main"}>
          <MainContent
            active={active}
            pageTitle={pageTitle}
            settingsFocusToken={settingsFocusToken}
            settingsFocusSection={settingsFocusSection}
          />
        </main>
      </div>
    </div>
  );
}
