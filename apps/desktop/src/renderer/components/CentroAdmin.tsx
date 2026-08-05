import {
  Bell,
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  Crown,
  DoorOpen,
  Mail,
  Pencil,
  Phone,
  Shield,
  Smartphone,
  UserMinus,
  UserPlus,
  Users,
  X
} from "lucide-react";
import clsx from "clsx";
import { useMemo, useState, type ReactNode } from "react";
import { useDemoWorkflow } from "../demo/DemoWorkflowContext";

type OperatorStatus = "attivo" | "offline" | "invito" | "disattivo";
type Tone = "primary" | "mint" | "gold" | "lavender";
type PermAction = "visualizza" | "crea" | "modifica" | "elimina" | "esporta";

type TeamMember = {
  id: string;
  name: string;
  role: string;
  cabin: string;
  status: OperatorStatus;
  statusLabel: string;
  agenda: string;
  smartAlerts: boolean;
  lastAccess: string;
  initials: string;
  tone: Tone;
  email: string;
  phone: string;
};

type StaffDevice = {
  id: string;
  name: string;
  state: "online" | "offline" | "invited";
  lines: string[];
};

type PermissionItem = {
  id: string;
  label: string;
  hint?: string;
  group: string;
};

type ModulePerms = Record<PermAction, boolean>;
type OperatorPermMap = Record<string, ModulePerms>;

const PERM_MODULES = [
  { id: "dashboard", label: "Dashboard" },
  { id: "agenda", label: "Agenda" },
  { id: "clienti", label: "Clienti" },
  { id: "servizi", label: "Servizi" },
  { id: "magazzino", label: "Magazzino" },
  { id: "fornitori", label: "Fornitori" },
  { id: "report", label: "Report" },
  { id: "studio", label: "Studio" },
  { id: "centro", label: "Centro" }
] as const;

const PERM_ACTIONS: Array<{ id: PermAction; label: string }> = [
  { id: "visualizza", label: "Visualizza" },
  { id: "crea", label: "Crea" },
  { id: "modifica", label: "Modifica" },
  { id: "elimina", label: "Elimina" },
  { id: "esporta", label: "Esporta" }
];

function defaultModulePerms(full = false): ModulePerms {
  return {
    visualizza: true,
    crea: full,
    modifica: full,
    elimina: false,
    esporta: full
  };
}

function defaultOperatorPerms(): OperatorPermMap {
  return Object.fromEntries(
    PERM_MODULES.map((m) => [
      m.id,
      defaultModulePerms(m.id !== "centro" && m.id !== "report")
    ])
  );
}

function statusLabelOf(status: OperatorStatus): string {
  switch (status) {
    case "attivo":
      return "Attivo";
    case "offline":
      return "Offline";
    case "invito":
      return "Invito inviato";
    case "disattivo":
      return "Disattivato";
  }
}

function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "OP";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
}

/** Dati demo condivisibili in futuro con NovaBeauty Staff (PWA). */
const STUDIO = {
  name: "NovaBeauty Milano Centro",
  owner: "Fabio Nova",
  license: "Community Edition",
  openedAt: "12 gennaio 2020",
  operators: 3,
  cabins: 3,
  clients: 248,
  services: 32,
  logoInitials: "NB"
};

const OWNER = {
  name: "Fabio Nova",
  role: "Titolare / Estetista",
  email: "fabio@novabeauty.it",
  phone: "+39 340 000 1122",
  initials: "FN",
  powers: [
    "modificare permessi",
    "invitare operatori",
    "eliminare operatori",
    "gestire licenza",
    "configurare Atlas",
    "configurare Nova Hub"
  ]
};

const TEAM: TeamMember[] = [
  {
    id: "t1",
    name: "Laura Bianchi",
    role: "Estetista senior",
    cabin: "Cabina 2",
    status: "attivo",
    statusLabel: "Attivo",
    agenda: "Oggi · 6 appuntamenti",
    smartAlerts: true,
    lastAccess: "Oggi · 17:42",
    initials: "LB",
    tone: "mint",
    email: "laura@novabeauty.it",
    phone: "+39 333 221 0099"
  },
  {
    id: "t2",
    name: "Giulia Verdi",
    role: "Estetista",
    cabin: "Cabina 3",
    status: "offline",
    statusLabel: "Offline",
    agenda: "Domani · 4 slot",
    smartAlerts: false,
    lastAccess: "Ieri · 19:05",
    initials: "GV",
    tone: "lavender",
    email: "giulia@novabeauty.it",
    phone: "+39 348 990 1122"
  },
  {
    id: "t3",
    name: "Marco Rossi",
    role: "Operatore junior",
    cabin: "Non assegnata",
    status: "invito",
    statusLabel: "Invito inviato",
    agenda: "—",
    smartAlerts: false,
    lastAccess: "Mai",
    initials: "MR",
    tone: "gold",
    email: "marco@email.it",
    phone: "+39 320 554 7788"
  }
];

const STAFF_DEVICES: StaffDevice[] = [
  {
    id: "s1",
    name: "Laura",
    state: "online",
    lines: ["App installata", "Smart Alerts attivi", "Ultima sincronizzazione · 2 min fa"]
  },
  {
    id: "s2",
    name: "Giulia",
    state: "offline",
    lines: ["App installata", "Offline"]
  },
  {
    id: "s3",
    name: "Marco",
    state: "invited",
    lines: ["Invito inviato"]
  }
];

const PERMISSIONS: PermissionItem[] = [
  { id: "agenda", label: "Agenda", group: "Operatività" },
  { id: "agenda_own", label: "Solo mia agenda", group: "Operatività", hint: "Vede solo i propri slot" },
  { id: "clienti", label: "Clienti", group: "Operatività" },
  { id: "clienti_own", label: "Solo miei clienti", group: "Operatività" },
  { id: "clienti_new", label: "Nuovi clienti", group: "Operatività" },
  { id: "servizi", label: "Servizi", group: "Operatività" },
  { id: "magazzino", label: "Magazzino", group: "Magazzino" },
  { id: "scarico", label: "Scarico prodotti", group: "Magazzino" },
  { id: "report", label: "Report", group: "Business" },
  { id: "incassi", label: "Incassi", group: "Business" },
  { id: "pagamenti", label: "Pagamenti", group: "Business" },
  { id: "cabine", label: "Cabine", group: "Studio" },
  { id: "operatori", label: "Operatori", group: "Studio" },
  { id: "studio", label: "Studio", group: "Studio" },
  { id: "nova_hub", label: "Nova Hub", group: "Ecosistema" },
  { id: "atlas", label: "Atlas", group: "Ecosistema" },
  { id: "impostazioni", label: "Impostazioni", group: "Ecosistema" }
];

const SMART_ALERTS = [
  "Nuovo appuntamento",
  "Cliente arrivato",
  "Appuntamento annullato",
  "Cambio cabina",
  "Nuovo messaggio",
  "Fine turno",
  "Promemoria"
];

const WIZARD_STEPS = [
  "Informazioni",
  "Ruolo",
  "Permessi",
  "Cabina",
  "Servizi",
  "Invito"
] as const;

const ROLES = ["Estetista", "Estetista senior", "Reception", "Junior"];
const CABINS = ["Cabina 1", "Cabina 2", "Cabina 3", "Non assegnata"];
const SERVICES = ["Viso", "Corpo", "Massaggi", "Epilazione", "Mani", "Piedi"];

export default function CentroAdmin() {
  const { studioName, studioLogoUrl, pushToast } = useDemoWorkflow();
  const [team, setTeam] = useState(TEAM);
  const [wizardOpen, setWizardOpen] = useState(false);
  const [permTarget, setPermTarget] = useState(TEAM[0].name);
  const [permState, setPermState] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(PERMISSIONS.map((p) => [p.id, !p.id.includes("own") && p.id !== "nova_hub"]))
  );
  const [modulePermsByOp, setModulePermsByOp] = useState<Record<string, OperatorPermMap>>(() =>
    Object.fromEntries(TEAM.map((m) => [m.id, defaultOperatorPerms()]))
  );
  const [alertsByOperator, setAlertsByOperator] = useState<Record<string, Record<string, boolean>>>(
    () =>
      Object.fromEntries(
        TEAM.map((m) => [
          m.id,
          Object.fromEntries(SMART_ALERTS.map((a) => [a, m.smartAlerts && a !== "Nuovo messaggio"]))
        ])
      )
  );
  const [selectedAlertsOp, setSelectedAlertsOp] = useState(TEAM[0].id);

  const [editId, setEditId] = useState<string | null>(null);
  const [permsPanelId, setPermsPanelId] = useState<string | null>(null);
  const [deactivateId, setDeactivateId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<{
    name: string;
    role: string;
    phone: string;
    email: string;
    cabin: string;
    status: "attivo" | "offline";
  } | null>(null);
  const [permsDraft, setPermsDraft] = useState<OperatorPermMap | null>(null);

  const editingMember = team.find((m) => m.id === editId) ?? null;
  const permsMember = team.find((m) => m.id === permsPanelId) ?? null;
  const deactivateMember = team.find((m) => m.id === deactivateId) ?? null;

  const activeTeam = team.filter((m) => m.status !== "disattivo");

  const permGroups = useMemo(() => {
    const map = new Map<string, PermissionItem[]>();
    for (const p of PERMISSIONS) {
      const list = map.get(p.group) ?? [];
      list.push(p);
      map.set(p.group, list);
    }
    return [...map.entries()];
  }, []);

  const openEdit = (m: TeamMember) => {
    setEditId(m.id);
    setEditDraft({
      name: m.name,
      role: m.role,
      phone: m.phone,
      email: m.email,
      cabin: m.cabin,
      status: m.status === "offline" ? "offline" : "attivo"
    });
  };

  const openPerms = (m: TeamMember) => {
    setPermTarget(m.name);
    setPermsPanelId(m.id);
    setPermsDraft(
      structuredClone(modulePermsByOp[m.id] ?? defaultOperatorPerms())
    );
  };

  const saveEdit = () => {
    if (!editId || !editDraft) return;
    if (!editDraft.name.trim()) {
      pushToast("Inserisci il nome operatore");
      return;
    }
    const nextStatus = editDraft.status;
    setTeam((prev) =>
      prev.map((m) => {
        if (m.id !== editId) return m;
        if (m.status === "disattivo") return m;
        return {
          ...m,
          name: editDraft.name.trim(),
          role: editDraft.role.trim() || m.role,
          phone: editDraft.phone.trim(),
          email: editDraft.email.trim(),
          cabin: editDraft.cabin,
          status: nextStatus,
          statusLabel: statusLabelOf(nextStatus),
          initials: initialsFromName(editDraft.name.trim())
        };
      })
    );
    setPermTarget(editDraft.name.trim());
    setEditId(null);
    setEditDraft(null);
    pushToast("Operatore aggiornato");
  };

  const savePerms = () => {
    if (!permsPanelId || !permsDraft) return;
    setModulePermsByOp((prev) => ({ ...prev, [permsPanelId]: permsDraft }));
    setPermsPanelId(null);
    setPermsDraft(null);
    pushToast("Permessi salvati");
  };

  const confirmDeactivate = () => {
    if (!deactivateId) return;
    setTeam((prev) =>
      prev.map((m) =>
        m.id === deactivateId
          ? {
              ...m,
              status: "disattivo",
              statusLabel: "Disattivato",
              smartAlerts: false,
              agenda: "Accesso rimosso · storico conservato",
              lastAccess: m.lastAccess
            }
          : m
      )
    );
    setAlertsByOperator((prev) => ({
      ...prev,
      [deactivateId]: Object.fromEntries(SMART_ALERTS.map((a) => [a, false]))
    }));
    const name = deactivateMember?.name ?? "Operatore";
    setDeactivateId(null);
    pushToast(`${name} disattivato · storico mantenuto`);
  };

  return (
    <div className="nb-centro" role="region" aria-label="Amministrazione Centro">
      <header className="nb-centroHead">
        <div>
          <div className="nb-centroEyebrow">Amministrazione</div>
          <h2 className="nb-centroTitle">Il tuo Centro</h2>
          <p className="nb-centroSub">
            Identità del centro estetico, proprietario, team e accessi NovaBeauty Staff.
            Struttura pronta per la sync futura con la PWA.
          </p>
        </div>
        <button
          type="button"
          className="nb-newBtn nb-centroInviteBtn"
          onClick={() => setWizardOpen(true)}
        >
          <UserPlus className="nb-newBtnIcon" aria-hidden={true} />
          Invita operatore
        </button>
      </header>

      {/* 1 · Il tuo Studio */}
      <section className="nb-centroSection" aria-labelledby="centro-studio">
        <SectionLabel id="centro-studio" title="Il tuo Studio" />
        <article className="nb-centroStudioCard">
          <div className="nb-centroStudioLogo" aria-hidden={true}>
            {studioLogoUrl ? (
              <img className="nb-centroStudioLogoImg" src={studioLogoUrl} alt="" />
            ) : (
              STUDIO.logoInitials
            )}
          </div>
          <div className="nb-centroStudioMain">
            <div className="nb-centroStudioTop">
              <div>
                <h3 className="nb-centroStudioName">{studioName}</h3>
                <p className="nb-centroStudioOwner">Titolare · {STUDIO.owner}</p>
              </div>
              <button type="button" className="nb-centroGhostBtn" disabled>
                <Pencil className="nb-centroBtnIcon" aria-hidden={true} />
                Modifica Studio
              </button>
            </div>
            <div className="nb-centroStudioMeta">
              <Meta label="Licenza" value={STUDIO.license} />
              <Meta label="Data apertura" value={STUDIO.openedAt} />
              <Meta label="Operatori" value={String(activeTeam.length)} />
              <Meta label="Cabine" value={String(STUDIO.cabins)} />
              <Meta label="Clienti" value={String(STUDIO.clients)} />
              <Meta label="Servizi" value={String(STUDIO.services)} />
            </div>
          </div>
        </article>
      </section>

      {/* 2 · Proprietario */}
      <section className="nb-centroSection" aria-labelledby="centro-owner">
        <SectionLabel
          id="centro-owner"
          title="Proprietario"
          caption="Figura separata dal Team · unica autorità amministrativa"
        />
        <article className="nb-centroOwnerCard">
          <div className="nb-centroOwnerIdentity">
            <div className="nb-centroOwnerAvatar" aria-hidden={true}>
              {OWNER.initials}
            </div>
            <div>
              <div className="nb-centroOwnerBadge">
                <Crown className="nb-centroOwnerBadgeIcon" aria-hidden={true} />
                Proprietario
              </div>
              <h3 className="nb-centroOwnerName">{OWNER.name}</h3>
              <p className="nb-centroOwnerRole">{OWNER.role}</p>
              <div className="nb-centroOwnerContacts">
                <span>
                  <Mail className="nb-centroBtnIcon" aria-hidden={true} />
                  {OWNER.email}
                </span>
                <span>
                  <Phone className="nb-centroBtnIcon" aria-hidden={true} />
                  {OWNER.phone}
                </span>
              </div>
            </div>
          </div>
          <div className="nb-centroOwnerPowers">
            <div className="nb-centroOwnerPowersTitle">Autorizzazioni esclusive</div>
            <ul>
              {OWNER.powers.map((p) => (
                <li key={p}>
                  <Check className="nb-centroCheck" aria-hidden={true} />
                  {p}
                </li>
              ))}
            </ul>
          </div>
        </article>
      </section>

      {/* 3 · Team */}
      <section className="nb-centroSection" aria-labelledby="centro-team">
        <SectionLabel
          id="centro-team"
          title="Team"
          caption="Operatori del centro · dati predisposti per NovaBeauty Staff"
        />
        <div className="nb-centroTeamGrid">
          {team.map((m) => (
            <article key={m.id} className="nb-centroTeamCard">
              <div className="nb-centroTeamTop">
                <div className={clsx("nb-centroTeamAvatar", `tone-${m.tone}`)} aria-hidden={true}>
                  {m.initials}
                </div>
                <span className={clsx("nb-centroTeamStatus", `is-${m.status}`)}>
                  {m.statusLabel}
                </span>
              </div>
              <h3 className="nb-centroTeamName">{m.name}</h3>
              <p className="nb-centroTeamRole">{m.role}</p>
              <div className="nb-centroTeamFacts">
                <Fact label="Cabina" value={m.cabin} />
                <Fact label="Agenda" value={m.agenda} />
                <Fact
                  label="Smart Alerts"
                  value={m.smartAlerts ? "Attivi" : "Disattivati"}
                />
                <Fact label="Ultimo accesso" value={m.lastAccess} />
              </div>
              <div className="nb-centroTeamActions">
                <button
                  type="button"
                  className="nb-centroGhostBtn"
                  disabled={m.status === "disattivo"}
                  onClick={() => openEdit(m)}
                >
                  <Pencil className="nb-centroBtnIcon" aria-hidden={true} />
                  Modifica
                </button>
                <button
                  type="button"
                  className="nb-centroGhostBtn"
                  disabled={m.status === "disattivo"}
                  onClick={() => openPerms(m)}
                >
                  <Shield className="nb-centroBtnIcon" aria-hidden={true} />
                  Permessi
                </button>
                <button
                  type="button"
                  className="nb-centroGhostBtn danger"
                  disabled={m.status === "disattivo"}
                  onClick={() => setDeactivateId(m.id)}
                >
                  <UserMinus className="nb-centroBtnIcon" aria-hidden={true} />
                  Disattiva
                </button>
              </div>
            </article>
          ))}
        </div>
        <button
          type="button"
          className="nb-centroInviteWide"
          onClick={() => setWizardOpen(true)}
        >
          <UserPlus className="nb-centroBtnIcon" aria-hidden={true} />
          Invita
        </button>
      </section>

      {/* 4 · Wizard host */}
      {wizardOpen ? <InviteWizard onClose={() => setWizardOpen(false)} /> : null}

      {/* 5 · Permessi */}
      <section className="nb-centroSection" aria-labelledby="centro-perms">
        <SectionLabel
          id="centro-perms"
          title="Permessi"
          caption={`Solo il Proprietario può modificarli · profilo: ${permTarget}`}
        />
        <article className="nb-centroPermsCard">
          <div className="nb-centroPermsToolbar">
            <label className="nb-centroFilter">
              <span>Operatore</span>
              <select
                value={permTarget}
                onChange={(e) => setPermTarget(e.target.value)}
              >
                {team.map((m) => (
                  <option key={m.id} value={m.name}>
                    {m.name}
                    {m.status === "disattivo" ? " (disattivato)" : ""}
                  </option>
                ))}
              </select>
            </label>
            <button
              type="button"
              className="nb-centroGhostBtn"
              onClick={() => {
                const m = team.find((t) => t.name === permTarget);
                if (m && m.status !== "disattivo") openPerms(m);
                else if (m?.status === "disattivo") pushToast("Operatore disattivato");
              }}
            >
              <Shield className="nb-centroBtnIcon" aria-hidden={true} />
              Gestione Permessi
            </button>
          </div>
          <div className="nb-centroPermsGroups">
            {permGroups.map(([group, items]) => (
              <div key={group} className="nb-centroPermsGroup">
                <h4 className="nb-centroPermsGroupTitle">{group}</h4>
                <div className="nb-centroPermsList">
                  {items.map((p) => (
                    <label key={p.id} className="nb-centroPermRow">
                      <input
                        type="checkbox"
                        checked={Boolean(permState[p.id])}
                        onChange={(e) =>
                          setPermState((prev) => ({ ...prev, [p.id]: e.target.checked }))
                        }
                      />
                      <span>
                        <span className="nb-centroPermLabel">{p.label}</span>
                        {p.hint ? <span className="nb-centroPermHint">{p.hint}</span> : null}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </article>
      </section>

      {/* 6 · NovaBeauty Staff */}
      <section className="nb-centroSection" aria-labelledby="centro-staff">
        <SectionLabel id="centro-staff" title="NovaBeauty Staff" />
        <article className="nb-centroStaffCard">
          <div className="nb-centroStaffIntro">
            <div className="nb-centroStaffIcon" aria-hidden={true}>
              <Smartphone />
            </div>
            <div>
              <h3 className="nb-centroStaffTitle">NovaBeauty Staff</h3>
              <p className="nb-centroStaffText">
                Ogni operatore può installare NovaBeauty Staff sul proprio smartphone. Desktop
                gestisce accessi e sync futura con la PWA.
              </p>
            </div>
            <button type="button" className="nb-centroGhostBtn" disabled>
              Gestisci Accessi
            </button>
          </div>
          <div className="nb-centroStaffGrid">
            {STAFF_DEVICES.map((d) => (
              <div key={d.id} className={clsx("nb-centroStaffPerson", `is-${d.state}`)}>
                <div className="nb-centroStaffPersonName">{d.name}</div>
                <ul>
                  {d.lines.map((line) => (
                    <li key={line}>
                      <span className="nb-centroStaffDot" aria-hidden={true} />
                      {line}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </article>
      </section>

      {/* 7 · Smart Alerts */}
      <section className="nb-centroSection" aria-labelledby="centro-alerts">
        <SectionLabel
          id="centro-alerts"
          title="Smart Alerts"
          caption="Attiva / disattiva per ogni operatore"
        />
        <article className="nb-centroAlertsCard">
          <div className="nb-centroAlertsTabs" role="tablist" aria-label="Operatori">
            {team.map((m) => (
              <button
                key={m.id}
                type="button"
                role="tab"
                aria-selected={selectedAlertsOp === m.id}
                className={clsx("nb-centroAlertsTab", selectedAlertsOp === m.id && "isActive")}
                onClick={() => setSelectedAlertsOp(m.id)}
              >
                <Bell className="nb-centroBtnIcon" aria-hidden={true} />
                {m.name.split(" ")[0]}
              </button>
            ))}
          </div>
          <div className="nb-centroAlertsList">
            {SMART_ALERTS.map((alert) => {
              const on = Boolean(alertsByOperator[selectedAlertsOp]?.[alert]);
              return (
                <label key={alert} className="nb-centroAlertRow">
                  <span>{alert}</span>
                  <button
                    type="button"
                    className={clsx("nb-centroToggle", on && "isOn")}
                    aria-pressed={on}
                    disabled={team.find((t) => t.id === selectedAlertsOp)?.status === "disattivo"}
                    onClick={() =>
                      setAlertsByOperator((prev) => ({
                        ...prev,
                        [selectedAlertsOp]: {
                          ...prev[selectedAlertsOp],
                          [alert]: !on
                        }
                      }))
                    }
                  >
                    <span className="nb-centroToggleKnob" />
                    <span className="nb-centroToggleLabel">{on ? "Attivo" : "Off"}</span>
                  </button>
                </label>
              );
            })}
          </div>
        </article>
      </section>

      {/* 8 · Licenza Studio */}
      <section className="nb-centroSection nb-centroSection--last" aria-labelledby="centro-lic">
        <SectionLabel id="centro-lic" title="Licenza Studio" caption="Community · Pro · Founder" />
        <div className="nb-centroLicGrid">
          <LicPlan name="Community" active note="Piano attuale" operators="1–3" />
          <LicPlan name="Pro" note="Multi-operatore" operators="Illimitati" />
          <LicPlan name="Founder" note="Licenza permanente" operators="Illimitati" />
        </div>
        <article className="nb-centroLicStats">
          <Meta label="Numero operatori" value={`${activeTeam.length} attivi`} />
          <Meta label="Dispositivi collegati" value="2 Staff · 1 Desktop" />
          <Meta label="Ultimo backup" value="Oggi · 06:00" />
          <Meta label="Sincronizzazione" value="Pronto · PWA Staff" />
        </article>
      </section>

      {editId && editDraft && editingMember ? (
        <div className="nb-centroWizardRoot" role="dialog" aria-modal="true" aria-label="Modifica operatore">
          <button
            type="button"
            className="nb-centroWizardBackdrop"
            aria-label="Chiudi"
            onClick={() => {
              setEditId(null);
              setEditDraft(null);
            }}
          />
          <div className="nb-centroWizardPanel">
            <header className="nb-centroWizardHead">
              <div>
                <div className="nb-centroEyebrow">Modifica operatore</div>
                <h3 className="nb-centroWizardTitle">{editingMember.name}</h3>
              </div>
              <button
                type="button"
                className="nb-centroWizardClose"
                onClick={() => {
                  setEditId(null);
                  setEditDraft(null);
                }}
                aria-label="Chiudi"
              >
                <X className="nb-centroBtnIcon" aria-hidden={true} />
              </button>
            </header>
            <div className="nb-centroWizardBody">
              <div className="nb-centroWizardForm">
                <Field label="Nome">
                  <input
                    value={editDraft.name}
                    onChange={(e) => setEditDraft((d) => (d ? { ...d, name: e.target.value } : d))}
                  />
                </Field>
                <Field label="Ruolo">
                  <select
                    value={editDraft.role}
                    onChange={(e) => setEditDraft((d) => (d ? { ...d, role: e.target.value } : d))}
                  >
                    {[editDraft.role, ...ROLES.filter((r) => r !== editDraft.role)].map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Telefono">
                  <input
                    value={editDraft.phone}
                    onChange={(e) => setEditDraft((d) => (d ? { ...d, phone: e.target.value } : d))}
                  />
                </Field>
                <Field label="Email">
                  <input
                    type="email"
                    value={editDraft.email}
                    onChange={(e) => setEditDraft((d) => (d ? { ...d, email: e.target.value } : d))}
                  />
                </Field>
                <Field label="Cabina assegnata">
                  <select
                    value={editDraft.cabin}
                    onChange={(e) => setEditDraft((d) => (d ? { ...d, cabin: e.target.value } : d))}
                  >
                    {[editDraft.cabin, ...CABINS.filter((c) => c !== editDraft.cabin)].map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Stato">
                  <select
                    value={editDraft.status}
                    onChange={(e) =>
                      setEditDraft((d) =>
                        d ? { ...d, status: e.target.value as "attivo" | "offline" } : d
                      )
                    }
                  >
                    <option value="attivo">Attivo</option>
                    <option value="offline">Offline</option>
                  </select>
                </Field>
              </div>
            </div>
            <footer className="nb-centroWizardFoot">
              <button
                type="button"
                className="nb-centroGhostBtn"
                onClick={() => {
                  setEditId(null);
                  setEditDraft(null);
                }}
              >
                Annulla
              </button>
              <button type="button" className="nb-newBtn" onClick={saveEdit}>
                Salva
              </button>
            </footer>
          </div>
        </div>
      ) : null}

      {permsPanelId && permsDraft && permsMember ? (
        <div
          className="nb-centroWizardRoot"
          role="dialog"
          aria-modal="true"
          aria-label="Gestione Permessi"
        >
          <button
            type="button"
            className="nb-centroWizardBackdrop"
            aria-label="Chiudi"
            onClick={() => {
              setPermsPanelId(null);
              setPermsDraft(null);
            }}
          />
          <div className="nb-centroWizardPanel nb-centroPermPanel">
            <header className="nb-centroWizardHead">
              <div>
                <div className="nb-centroEyebrow">Gestione Permessi</div>
                <h3 className="nb-centroWizardTitle">{permsMember.name}</h3>
                <p className="nb-centroSectionCap">
                  Solo il Proprietario può assegnare o revocare i permessi per modulo.
                </p>
              </div>
              <button
                type="button"
                className="nb-centroWizardClose"
                onClick={() => {
                  setPermsPanelId(null);
                  setPermsDraft(null);
                }}
                aria-label="Chiudi"
              >
                <X className="nb-centroBtnIcon" aria-hidden={true} />
              </button>
            </header>
            <div className="nb-centroWizardBody">
              <div className="nb-centroPermMatrixWrap">
                <table className="nb-centroPermMatrix">
                  <thead>
                    <tr>
                      <th>Modulo</th>
                      {PERM_ACTIONS.map((a) => (
                        <th key={a.id}>{a.label}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {PERM_MODULES.map((mod) => (
                      <tr key={mod.id}>
                        <td>{mod.label}</td>
                        {PERM_ACTIONS.map((a) => (
                          <td key={a.id}>
                            <input
                              type="checkbox"
                              aria-label={`${mod.label} · ${a.label}`}
                              checked={Boolean(permsDraft[mod.id]?.[a.id])}
                              onChange={(e) =>
                                setPermsDraft((prev) => {
                                  if (!prev) return prev;
                                  return {
                                    ...prev,
                                    [mod.id]: {
                                      ...prev[mod.id],
                                      [a.id]: e.target.checked
                                    }
                                  };
                                })
                              }
                            />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <footer className="nb-centroWizardFoot">
              <button
                type="button"
                className="nb-centroGhostBtn"
                onClick={() => {
                  setPermsPanelId(null);
                  setPermsDraft(null);
                }}
              >
                Annulla
              </button>
              <button type="button" className="nb-newBtn" onClick={savePerms}>
                Salva permessi
              </button>
            </footer>
          </div>
        </div>
      ) : null}

      {deactivateId && deactivateMember ? (
        <div className="nb-dialogRoot isOpen" role="presentation">
          <button
            type="button"
            className="nb-dialogBackdrop"
            aria-label="Annulla"
            onClick={() => setDeactivateId(null)}
          />
          <div className="nb-dialogCard" role="dialog" aria-modal="true" aria-label="Disattiva operatore">
            <h2 className="nb-dialogTitle">Disattivare l&apos;operatore?</h2>
            <p className="nb-dialogSub">
              “{deactivateMember.name}” perderà l&apos;accesso all&apos;app. Lo storico appuntamenti e
              attività resterà conservato.
            </p>
            <div className="nb-dialogActions">
              <button type="button" className="nb-ghostBtn" onClick={() => setDeactivateId(null)}>
                Annulla
              </button>
              <button type="button" className="nb-newBtn nb-ivConfirmDanger" onClick={confirmDeactivate}>
                Disattiva
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function InviteWizard({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState(ROLES[0]);
  const [cabin, setCabin] = useState(CABINS[0]);
  const [services, setServices] = useState<string[]>(["Viso"]);

  const last = step === WIZARD_STEPS.length - 1;

  return (
    <div className="nb-centroWizardRoot" role="dialog" aria-modal="true" aria-label="Nuovo operatore">
      <button type="button" className="nb-centroWizardBackdrop" aria-label="Chiudi" onClick={onClose} />
      <div className="nb-centroWizardPanel">
        <header className="nb-centroWizardHead">
          <div>
            <div className="nb-centroEyebrow">Nuovo operatore</div>
            <h3 className="nb-centroWizardTitle">
              Step {step + 1} · {WIZARD_STEPS[step]}
            </h3>
          </div>
          <button type="button" className="nb-centroWizardClose" onClick={onClose} aria-label="Chiudi">
            <X className="nb-centroBtnIcon" aria-hidden={true} />
          </button>
        </header>

        <div className="nb-centroWizardSteps" aria-hidden={true}>
          {WIZARD_STEPS.map((label, i) => (
            <div key={label} className={clsx("nb-centroWizardStep", i <= step && "isOn")}>
              <span>{i + 1}</span>
              <em>{label}</em>
            </div>
          ))}
        </div>

        <div className="nb-centroWizardBody">
          {step === 0 ? (
            <div className="nb-centroWizardForm">
              <Field label="Nome completo">
                <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nome e cognome" />
              </Field>
              <Field label="Email">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="operatore@…"
                />
              </Field>
              <Field label="Telefono">
                <input placeholder="+39 …" />
              </Field>
            </div>
          ) : null}

          {step === 1 ? (
            <div className="nb-centroWizardChips">
              {ROLES.map((r) => (
                <button
                  key={r}
                  type="button"
                  className={clsx("nb-centroChip", role === r && "isOn")}
                  onClick={() => setRole(r)}
                >
                  {r}
                </button>
              ))}
            </div>
          ) : null}

          {step === 2 ? (
            <p className="nb-centroWizardNote">
              I permessi dettagliati si configurano dopo l&apos;invito nella sezione Permessi.
              Qui assegniamo un profilo base demo: <strong>{role}</strong>.
            </p>
          ) : null}

          {step === 3 ? (
            <div className="nb-centroWizardChips">
              {CABINS.map((c) => (
                <button
                  key={c}
                  type="button"
                  className={clsx("nb-centroChip", cabin === c && "isOn")}
                  onClick={() => setCabin(c)}
                >
                  <DoorOpen className="nb-centroBtnIcon" aria-hidden={true} />
                  {c}
                </button>
              ))}
            </div>
          ) : null}

          {step === 4 ? (
            <div className="nb-centroWizardChips">
              {SERVICES.map((s) => {
                const on = services.includes(s);
                return (
                  <button
                    key={s}
                    type="button"
                    className={clsx("nb-centroChip", on && "isOn")}
                    onClick={() =>
                      setServices((prev) =>
                        on ? prev.filter((x) => x !== s) : [...prev, s]
                      )
                    }
                  >
                    {s}
                  </button>
                );
              })}
            </div>
          ) : null}

          {step === 5 ? (
            <div className="nb-centroWizardInvite">
              <CalendarDays className="nb-centroWizardInviteIcon" aria-hidden={true} />
              <p>
                Invito demo a <strong>{email || "email@…"}</strong> per accedere a NovaBeauty Staff
                e all&apos;agenda del centro.
              </p>
              <ul>
                <li>
                  <Check className="nb-centroCheck" aria-hidden={true} /> Ruolo · {role}
                </li>
                <li>
                  <Check className="nb-centroCheck" aria-hidden={true} /> Cabina · {cabin}
                </li>
                <li>
                  <Check className="nb-centroCheck" aria-hidden={true} />{" "}
                  Servizi · {services.join(", ") || "—"}
                </li>
              </ul>
            </div>
          ) : null}
        </div>

        <footer className="nb-centroWizardFoot">
          <button
            type="button"
            className="nb-centroGhostBtn"
            disabled={step === 0}
            onClick={() => setStep((s) => Math.max(0, s - 1))}
          >
            <ChevronLeft className="nb-centroBtnIcon" aria-hidden={true} />
            Indietro
          </button>
          {last ? (
            <button type="button" className="nb-newBtn" onClick={onClose}>
              Invia invito
            </button>
          ) : (
            <button
              type="button"
              className="nb-newBtn"
              onClick={() => setStep((s) => Math.min(WIZARD_STEPS.length - 1, s + 1))}
            >
              Continua
              <ChevronRight className="nb-newBtnIcon" aria-hidden={true} />
            </button>
          )}
        </footer>
      </div>
    </div>
  );
}

function SectionLabel({
  id,
  title,
  caption
}: {
  id: string;
  title: string;
  caption?: string;
}) {
  return (
    <div className="nb-centroSectionHead">
      <h3 id={id} className="nb-centroSectionTitle">
        {title}
      </h3>
      {caption ? <p className="nb-centroSectionCap">{caption}</p> : null}
    </div>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div className="nb-centroMeta">
      <span className="nb-centroMetaLabel">{label}</span>
      <span className="nb-centroMetaValue">{value}</span>
    </div>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="nb-centroFact">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="nb-centroField">
      <span>{label}</span>
      {children}
    </label>
  );
}

function LicPlan({
  name,
  note,
  operators,
  active
}: {
  name: string;
  note: string;
  operators: string;
  active?: boolean;
}) {
  return (
    <article className={clsx("nb-centroLicPlan", active && "isActive")}>
      <div className="nb-centroLicPlanName">{name}</div>
      <div className="nb-centroLicPlanNote">{note}</div>
      <div className="nb-centroLicPlanOps">
        <Users className="nb-centroBtnIcon" aria-hidden={true} />
        {operators}
      </div>
      {active ? <span className="nb-centroLicPlanBadge">Attuale</span> : null}
    </article>
  );
}
