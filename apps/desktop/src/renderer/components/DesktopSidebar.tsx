import {
  Boxes,
  Calendar,
  Home,
  BarChart3,
  Building2,
  ChevronRight,
  Scissors,
  Settings,
  Truck,
  Users
} from "lucide-react";
import clsx from "clsx";
import type { ComponentType } from "react";

export type DesktopNavKey =
  | "dashboard"
  | "agenda"
  | "clients"
  | "services"
  | "inventory"
  | "suppliers"
  | "studio"
  | "reports"
  | "settings";

const items: Array<{
  key: DesktopNavKey;
  label: string;
  icon: ComponentType<{ className?: string; "aria-hidden"?: boolean; strokeWidth?: number }>;
}> = [
  { key: "dashboard", label: "Dashboard", icon: Home },
  { key: "agenda", label: "Agenda", icon: Calendar },
  { key: "clients", label: "Clienti", icon: Users },
  { key: "services", label: "Servizi", icon: Scissors },
  { key: "inventory", label: "Magazzino", icon: Boxes },
  { key: "suppliers", label: "Fornitori", icon: Truck },
  { key: "studio", label: "Studio", icon: Building2 },
  { key: "reports", label: "Report", icon: BarChart3 },
  { key: "settings", label: "Impostazioni", icon: Settings }
];

type DesktopSidebarProps = {
  active: DesktopNavKey;
  onNavigate: (key: DesktopNavKey) => void;
};

export default function DesktopSidebar({ active, onNavigate }: DesktopSidebarProps) {
  const operational = items.slice(0, 6);
  const studio = items.slice(6);

  return (
    <aside className="nb-sidebar">
      <div className="nb-sidebarTop">
        <div className="nb-sidebarBrand" aria-label="NovaBeauty Desktop">
          <div className="nb-sidebarLogo" aria-hidden="true">
            <span>N</span>
          </div>
          <div className="nb-sidebarBrandText">
            <div className="nb-brandName">NovaBeauty</div>
            <div className="nb-brandSub">Gestionale studio</div>
          </div>
        </div>

        <nav className="nb-sidebarNav" aria-label="Navigazione principale">
          <p className="nb-navSectionLabel">Operatività</p>
          {operational.map((item) => {
            const Icon = item.icon;
            const isActive = item.key === active;

            return (
              <button
                key={item.key}
                type="button"
                className={clsx("nb-sidebarItem", isActive && "isActive")}
                onClick={() => onNavigate(item.key)}
              >
                <span className="nb-sidebarIconWrap">
                  <Icon className="nb-sidebarIcon" aria-hidden={true} strokeWidth={2.1} />
                </span>
                <span className="nb-sidebarLabel">{item.label}</span>
                {isActive ? <ChevronRight className="nb-sidebarChevron" aria-hidden={true} /> : null}
              </button>
            );
          })}

          <p className="nb-navSectionLabel">Studio</p>
          {studio.map((item) => {
            const Icon = item.icon;
            const isActive = item.key === active;

            return (
              <button
                key={item.key}
                type="button"
                className={clsx("nb-sidebarItem", isActive && "isActive")}
                onClick={() => onNavigate(item.key)}
              >
                <span className="nb-sidebarIconWrap">
                  <Icon className="nb-sidebarIcon" aria-hidden={true} strokeWidth={2.1} />
                </span>
                <span className="nb-sidebarLabel">{item.label}</span>
                {isActive ? <ChevronRight className="nb-sidebarChevron" aria-hidden={true} /> : null}
              </button>
            );
          })}
        </nav>
      </div>

      <div className="nb-sidebarUser">
        <div className="nb-sidebarUserAvatar" aria-hidden="true">
          F
        </div>
        <div className="nb-sidebarUserMeta">
          <div className="nb-sidebarUserName">Fabio</div>
          <div className="nb-sidebarUserRole">Titolare studio</div>
        </div>
        <span className="nb-sidebarUserStatus" aria-label="Online" />
      </div>
    </aside>
  );
}
