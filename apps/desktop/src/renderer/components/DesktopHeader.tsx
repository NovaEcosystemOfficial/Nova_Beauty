import {
  ArrowDownUp,
  Bell,
  CalendarPlus,
  ChevronRight,
  Copy,
  Download,
  PackagePlus,
  Plus,
  Scissors,
  Search,
  Truck,
  Upload,
  UserPlus,
  UserRound,
  Users
} from "lucide-react";
import type { DesktopNavKey } from "./DesktopSidebar";

type DesktopHeaderProps = {
  pageTitle: string;
  active: DesktopNavKey;
};

export default function DesktopHeader({ pageTitle, active }: DesktopHeaderProps) {
  const isClients = active === "clients";
  const isAgenda = active === "agenda";
  const isServices = active === "services";
  const isInventory = active === "inventory";
  const isSuppliers = active === "suppliers";
  const isStudio = active === "studio";
  const isSettings = active === "settings";

  return (
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
                          ? "Ricerca globale team, cabine, preferenze…"
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
            <button type="button" className="nb-newBtn" disabled aria-label="Nuovo Cliente">
              <UserPlus className="nb-newBtnIcon" aria-hidden={true} />
              Nuovo Cliente
            </button>
          </>
        ) : isAgenda ? (
          <button type="button" className="nb-newBtn" disabled aria-label="Nuovo appuntamento">
            <CalendarPlus className="nb-newBtnIcon" aria-hidden={true} />
            Nuovo appuntamento
          </button>
        ) : isServices ? (
          <>
            <button type="button" className="nb-ghostBtn" disabled aria-label="Importa servizi">
              <Upload className="nb-ghostBtnIcon" aria-hidden={true} />
              Importa
            </button>
            <button type="button" className="nb-ghostBtn" disabled aria-label="Esporta servizi">
              <Download className="nb-ghostBtnIcon" aria-hidden={true} />
              Esporta
            </button>
            <button type="button" className="nb-ghostBtn" disabled aria-label="Duplica servizio">
              <Copy className="nb-ghostBtnIcon" aria-hidden={true} />
              Duplica
            </button>
            <button type="button" className="nb-newBtn" disabled aria-label="Nuovo servizio">
              <Scissors className="nb-newBtnIcon" aria-hidden={true} />
              Nuovo servizio
            </button>
          </>
        ) : isInventory ? (
          <>
            <button type="button" className="nb-ghostBtn" disabled aria-label="Importa prodotti">
              <Upload className="nb-ghostBtnIcon" aria-hidden={true} />
              Importa
            </button>
            <button type="button" className="nb-ghostBtn" disabled aria-label="Esporta prodotti">
              <Download className="nb-ghostBtnIcon" aria-hidden={true} />
              Esporta
            </button>
            <button type="button" className="nb-ghostBtn" disabled aria-label="Movimento magazzino">
              <ArrowDownUp className="nb-ghostBtnIcon" aria-hidden={true} />
              Movimento
            </button>
            <button type="button" className="nb-newBtn" disabled aria-label="Nuovo prodotto">
              <PackagePlus className="nb-newBtnIcon" aria-hidden={true} />
              Nuovo prodotto
            </button>
          </>
        ) : isSuppliers ? (
          <button type="button" className="nb-newBtn" disabled aria-label="Nuovo fornitore">
            <Truck className="nb-newBtnIcon" aria-hidden={true} />
            Nuovo fornitore
          </button>
        ) : isStudio ? (
          <button type="button" className="nb-newBtn" disabled aria-label="Nuovo operatore">
            <Users className="nb-newBtnIcon" aria-hidden={true} />
            Nuovo operatore
          </button>
        ) : (
          <button type="button" className="nb-newBtn" aria-label="Nuovo">
            <Plus className="nb-newBtnIcon" aria-hidden={true} />
            Nuovo
          </button>
        )}

        <button type="button" className="nb-iconBtn" aria-label="Notifiche">
          <Bell className="nb-icon" aria-hidden={true} />
          <span className="nb-badge" aria-hidden={true}>
            3
          </span>
        </button>

        <button type="button" className="nb-profile" aria-label="Profilo utente">
          <span className="nb-avatar" aria-hidden={true}>
            <UserRound className="nb-avatarIcon" aria-hidden={true} />
          </span>
        </button>
      </div>
    </header>
  );
}
