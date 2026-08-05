import {
  ArrowDownUp,
  Bell,
  CalendarPlus,
  ChevronRight,
  Download,
  LogOut,
  Search,
  Settings2,
  Upload,
  UserPlus,
  UserRound
} from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import type { DesktopNavKey } from "./DesktopSidebar";
import { useDemoWorkflow } from "../demo/DemoWorkflowContext";

type DesktopHeaderProps = {
  pageTitle: string;
  active: DesktopNavKey;
  onOpenAccount: () => void;
  onOpenNotificationCenter: () => void;
};

type HeaderNotification = {
  id: string;
  text: string;
  time: string;
  unread: boolean;
};

const HEADER_NOTIFICATIONS: HeaderNotification[] = [
  { id: "n1", text: "Laura ha iniziato il trattamento", time: "20:14", unread: true },
  { id: "n2", text: "Nuovo appuntamento", time: "20:09", unread: true },
  { id: "n3", text: "Backup completato", time: "19:58", unread: true },
  { id: "n4", text: "Prodotto sotto scorta", time: "19:42", unread: false },
  { id: "n5", text: "Marco Rossi ha effettuato il login", time: "19:11", unread: false }
];

export default function DesktopHeader({
  pageTitle,
  active,
  onOpenAccount,
  onOpenNotificationCenter
}: DesktopHeaderProps) {
  const { openNewAppointment, openNewClientWizard } = useDemoWorkflow();
  const [menuOpen, setMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const menuId = useId();
  const notifId = useId();

  const isClients = active === "clients";
  const isAgenda = active === "agenda";
  const isServices = active === "services";
  const isInventory = active === "inventory";
  const isSuppliers = active === "suppliers";
  const isStudio = active === "studio";
  const isReports = active === "reports";
  const isSettings = active === "settings";

  const unreadCount = HEADER_NOTIFICATIONS.filter((n) => n.unread).length;

  useEffect(() => {
    if (!menuOpen && !notifOpen) return;
    const onPointer = (e: MouseEvent) => {
      const t = e.target as Node;
      if (menuOpen && !menuRef.current?.contains(t)) setMenuOpen(false);
      if (notifOpen && !notifRef.current?.contains(t)) setNotifOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMenuOpen(false);
        setNotifOpen(false);
        if (!logoutOpen) return;
        setLogoutOpen(false);
      }
    };
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [menuOpen, notifOpen, logoutOpen]);

  const confirmLogout = () => {
    setLogoutOpen(false);
    window.close();
  };

  return (
    <>
      <header className="nb-header">
        <div className="nb-headerLeft">
          <nav className="nb-breadcrumb" aria-label="Breadcrumb">
            <span className="nb-breadcrumbRoot">NovaBeauty</span>
            <ChevronRight className="nb-breadcrumbSep" aria-hidden={true} />
            <span className="nb-breadcrumbCurrent">{pageTitle}</span>
          </nav>
          <h1 className="nb-headerH1">{pageTitle}</h1>
          <p className="nb-headerClock">Mercoledì 5 agosto 2026 · 15:44</p>
        </div>

        <div className="nb-headerCenter">
          <div className="nb-searchBox" role="search">
            <Search className="nb-searchIcon" aria-hidden={true} />
            <input
              className="nb-searchInput"
              placeholder={
                isClients
                  ? "Ricerca globale clienti, note, trattamenti…"
                  : isAgenda
                    ? "Ricerca globale appuntamenti e clienti…"
                    : isServices
                      ? "Ricerca globale servizi e categorie…"
                      : isInventory
                        ? "Ricerca globale prodotti, codici, fornitori…"
                        : isSuppliers
                          ? "Ricerca globale fornitori, referenti, cataloghi…"
                          : isStudio
                            ? "Ricerca globale team, cabine, orari…"
                            : isReports
                              ? "Ricerca report, KPI, insight…"
                              : isSettings
                                ? "Ricerca impostazioni, licenza, account…"
                                : "Cerca clienti, appuntamenti, servizi…"
              }
              disabled
              value=""
              readOnly
            />
            <kbd className="nb-searchKbd">⌘K</kbd>
          </div>
        </div>

        <div className="nb-headerRight">
          {isClients ? (
            <>
              <button type="button" className="nb-ghostBtn" disabled aria-label="Importa clienti">
                <Upload className="nb-ghostBtnIcon" aria-hidden={true} />
                Importa
              </button>
              <button type="button" className="nb-ghostBtn" disabled aria-label="Esporta clienti">
                <Download className="nb-ghostBtnIcon" aria-hidden={true} />
                Esporta
              </button>
            <button
              type="button"
              className="nb-newBtn"
              aria-label="Nuovo Cliente"
              onClick={() => openNewClientWizard()}
            >
              <UserPlus className="nb-newBtnIcon" aria-hidden={true} />
              Nuovo Cliente
            </button>
            </>
          ) : null}

          {isAgenda ? (
            <button
              type="button"
              className="nb-newBtn"
              aria-label="Nuovo appuntamento"
              onClick={() => openNewAppointment()}
            >
              <CalendarPlus className="nb-newBtnIcon" aria-hidden={true} />
              Nuovo appuntamento
            </button>
          ) : null}

          <div className="nb-notifWrap" ref={notifRef}>
            <button
              type="button"
              className="nb-iconBtn"
              aria-label="Notifiche"
              aria-haspopup="dialog"
              aria-expanded={notifOpen}
              aria-controls={notifId}
              onClick={() => {
                setMenuOpen(false);
                setNotifOpen((v) => !v);
              }}
            >
              <Bell className="nb-icon" aria-hidden={true} />
              {unreadCount > 0 ? (
                <span className="nb-badge" aria-hidden={true}>
                  {unreadCount}
                </span>
              ) : null}
            </button>

            {notifOpen ? (
              <div
                className="nb-notifPopover"
                id={notifId}
                role="dialog"
                aria-label="Notifiche"
              >
                <div className="nb-notifPopoverHead">
                  <div className="nb-notifPopoverTitleRow">
                    <Bell className="nb-notifPopoverBell" aria-hidden={true} />
                    <h2 className="nb-notifPopoverTitle">Notifiche</h2>
                  </div>
                  <p className="nb-notifPopoverSub">Ultime notifiche</p>
                </div>

                {HEADER_NOTIFICATIONS.length > 0 ? (
                  <ul className="nb-notifPopoverList">
                    {HEADER_NOTIFICATIONS.map((n) => (
                      <li key={n.id} className={n.unread ? "isUnread" : undefined}>
                        <span className="nb-notifPopoverDot" aria-hidden={true} />
                        <div className="nb-notifPopoverBody">
                          <span className="nb-notifPopoverText">{n.text}</span>
                          <time className="nb-notifPopoverTime">{n.time}</time>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="nb-notifPopoverEmpty">Nessuna nuova notifica</p>
                )}

                <div className="nb-notifPopoverFoot">
                  <button
                    type="button"
                    className="nb-notifPopoverCta"
                    onClick={() => {
                      setNotifOpen(false);
                      onOpenNotificationCenter();
                    }}
                  >
                    Apri Notification Center
                  </button>
                </div>
              </div>
            ) : null}
          </div>

          <div className="nb-profileWrap" ref={menuRef}>
            <button
              type="button"
              className="nb-profile"
              aria-label="Profilo utente"
              aria-haspopup="menu"
              aria-expanded={menuOpen}
              aria-controls={menuId}
              onClick={() => {
                setNotifOpen(false);
                setMenuOpen((v) => !v);
              }}
            >
              <span className="nb-avatar" aria-hidden={true}>
                <UserRound className="nb-avatarIcon" aria-hidden={true} />
              </span>
            </button>

            {menuOpen ? (
              <div className="nb-profileMenu" id={menuId} role="menu" aria-label="Menu account">
                <button
                  type="button"
                  className="nb-profileMenuItem"
                  role="menuitem"
                  onClick={() => {
                    setMenuOpen(false);
                    onOpenAccount();
                  }}
                >
                  <Settings2 className="nb-profileMenuIcon" aria-hidden={true} />
                  Gestione account
                </button>
                <div className="nb-profileMenuSep" role="separator" />
                <button
                  type="button"
                  className="nb-profileMenuItem nb-profileMenuItem--danger"
                  role="menuitem"
                  onClick={() => {
                    setMenuOpen(false);
                    setLogoutOpen(true);
                  }}
                >
                  <LogOut className="nb-profileMenuIcon" aria-hidden={true} />
                  Logout
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </header>

      {logoutOpen ? (
        <div className="nb-dialogRoot isOpen" role="presentation">
          <button
            type="button"
            className="nb-dialogBackdrop"
            aria-label="Annulla"
            onClick={() => setLogoutOpen(false)}
          />
          <div
            className="nb-dialogCard"
            role="dialog"
            aria-modal="true"
            aria-labelledby="nb-logout-title"
          >
            <h2 className="nb-dialogTitle" id="nb-logout-title">
              Vuoi uscire da NovaBeauty?
            </h2>
            <div className="nb-dialogActions" style={{ marginTop: 18 }}>
              <button type="button" className="nb-ghostBtn" onClick={() => setLogoutOpen(false)}>
                Annulla
              </button>
              <button type="button" className="nb-newBtn" onClick={confirmLogout}>
                Esci
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
