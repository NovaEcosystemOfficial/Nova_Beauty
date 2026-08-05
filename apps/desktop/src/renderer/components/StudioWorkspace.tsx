import {
  Bell,
  Building2,
  Clock,
  CreditCard,
  DoorOpen,
  Gift,
  Mail,
  Phone,
  Plus,
  Settings,
  Star,
  UserPlus,
  Users
} from "lucide-react";
import clsx from "clsx";
import { useState, type ComponentType } from "react";

type StudioSection =
  | "info"
  | "team"
  | "cabine"
  | "orari"
  | "pagamenti"
  | "fidelity"
  | "notifiche"
  | "preferenze";

type OperatorStatus = "online" | "offline" | "ferie";
type CabinStatus = "libera" | "occupata" | "fuori_servizio";

type DemoOperator = {
  id: string;
  name: string;
  role: string;
  status: OperatorStatus;
  phone: string;
  email: string;
  startDate: string;
  cabin: string;
  services: string[];
  schedule: string;
  notes: string;
  initials: string;
  tone: "primary" | "mint" | "gold" | "lavender";
  appointmentsToday: number;
  monthRevenue: string;
  clientsServed: number;
  topService: string;
  hoursWorked: string;
  rating: string;
};

type DemoCabin = {
  id: string;
  name: string;
  operator: string;
  status: CabinStatus;
};

const MENU: Array<{
  id: StudioSection;
  label: string;
  icon: ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  hint?: string;
}> = [
  { id: "info", label: "Informazioni Studio", icon: Building2 },
  { id: "team", label: "Team", icon: Users },
  { id: "cabine", label: "Cabine", icon: DoorOpen },
  { id: "orari", label: "Orari", icon: Clock },
  { id: "pagamenti", label: "Pagamenti", icon: CreditCard },
  { id: "fidelity", label: "Fidelity", icon: Gift, hint: "Placeholder" },
  { id: "notifiche", label: "Notifiche", icon: Bell },
  { id: "preferenze", label: "Preferenze", icon: Settings }
];

const DEMO_OPERATORS: DemoOperator[] = [
  {
    id: "o1",
    name: "Fabio Nova",
    role: "Titolare / Estetista",
    status: "online",
    phone: "+39 340 000 1122",
    email: "fabio@novabeauty.it",
    startDate: "12 gen 2020",
    cabin: "Cabina 1",
    services: ["Viso", "PMU", "Massaggi", "Consulenze"],
    schedule: "Lun–Ven 09:00–19:00",
    notes: "Gestisce anche agenda e fornitori. Preferisce turni mattina.",
    initials: "FN",
    tone: "primary",
    appointmentsToday: 5,
    monthRevenue: "€4.820",
    clientsServed: 86,
    topService: "Pulizia viso deep",
    hoursWorked: "148 h",
    rating: "4.9"
  },
  {
    id: "o2",
    name: "Laura Bianchi",
    role: "Estetista",
    status: "online",
    phone: "+39 333 441 2098",
    email: "laura@novabeauty.it",
    startDate: "3 mar 2022",
    cabin: "Cabina 2",
    services: ["Epilazione", "Mani", "Piedi", "Corpo"],
    schedule: "Mar–Sab 10:00–18:30",
    notes: "Specializzata in epilazione e cura mani/piedi.",
    initials: "LB",
    tone: "mint",
    appointmentsToday: 4,
    monthRevenue: "€3.160",
    clientsServed: 72,
    topService: "Epilazione gambe",
    hoursWorked: "132 h",
    rating: "4.8"
  },
  {
    id: "o3",
    name: "Sara Conti",
    role: "Estetista junior",
    status: "offline",
    phone: "+39 348 990 4412",
    email: "sara@novabeauty.it",
    startDate: "15 set 2024",
    cabin: "Cabina 3",
    services: ["Viso", "Massaggi"],
    schedule: "Lun–Mer–Ven 09:30–17:00",
    notes: "In formazione su peeling avanzati.",
    initials: "SC",
    tone: "lavender",
    appointmentsToday: 0,
    monthRevenue: "€1.240",
    clientsServed: 28,
    topService: "Massaggio rilassante",
    hoursWorked: "64 h",
    rating: "4.6"
  },
  {
    id: "o4",
    name: "Elena Greco",
    role: "Reception / Assistente",
    status: "ferie",
    phone: "+39 347 221 0088",
    email: "elena@novabeauty.it",
    startDate: "8 giu 2023",
    cabin: "Reception",
    services: ["Accoglienza", "Cassa"],
    schedule: "Lun–Ven 08:45–13:00 / 15:00–19:00",
    notes: "In ferie fino al 12 agosto. Sostituita da Fabio in reception.",
    initials: "EG",
    tone: "gold",
    appointmentsToday: 0,
    monthRevenue: "—",
    clientsServed: 0,
    topService: "—",
    hoursWorked: "0 h",
    rating: "4.7"
  }
];

const DEMO_CABINS: DemoCabin[] = [
  { id: "c1", name: "Cabina 1", operator: "Fabio Nova", status: "occupata" },
  { id: "c2", name: "Cabina 2", operator: "Laura Bianchi", status: "libera" },
  { id: "c3", name: "Cabina 3", operator: "Sara Conti", status: "libera" },
  { id: "c4", name: "Cabina 4", operator: "Non assegnata", status: "fuori_servizio" },
  { id: "c5", name: "Reception", operator: "Elena Greco", status: "fuori_servizio" }
];

function statusLabel(s: OperatorStatus): string {
  switch (s) {
    case "online":
      return "Online";
    case "offline":
      return "Offline";
    case "ferie":
      return "Ferie";
  }
}

function cabinStatusLabel(s: CabinStatus): string {
  switch (s) {
    case "libera":
      return "Libera";
    case "occupata":
      return "Occupata";
    case "fuori_servizio":
      return "Fuori servizio";
  }
}

export default function StudioWorkspace() {
  const [section, setSection] = useState<StudioSection>("team");
  const [selectedOpId, setSelectedOpId] = useState(DEMO_OPERATORS[0].id);

  const selectedOp =
    DEMO_OPERATORS.find((o) => o.id === selectedOpId) ?? DEMO_OPERATORS[0];

  const showOperatorStats = section === "team";

  return (
    <div className="nb-studioWs" role="region" aria-label="Workspace Studio">
      {/* SINISTRA — menu */}
      <aside className="nb-stMenu">
        <div className="nb-stMenuHead">
          <Building2 className="nb-stMenuIcon" aria-hidden={true} />
          <div>
            <div className="nb-stMenuTitle">Studio</div>
            <div className="nb-stMenuSub">Centro di controllo · demo</div>
          </div>
        </div>
        <nav className="nb-stMenuList" aria-label="Menu Studio">
          {MENU.map((item) => {
            const Icon = item.icon;
            const isActive = section === item.id;
            return (
              <button
                key={item.id}
                type="button"
                className={clsx("nb-stMenuItem", isActive && "isActive")}
                onClick={() => setSection(item.id)}
              >
                <span className="nb-stMenuItemIconWrap">
                  <Icon className="nb-stMenuItemIcon" aria-hidden={true} />
                </span>
                <span className="nb-stMenuItemLabel">{item.label}</span>
                {item.hint ? <span className="nb-stMenuHint">{item.hint}</span> : null}
              </button>
            );
          })}
        </nav>
        <div className="nb-stMenuFoot">
          Filtri futuri per operatore su Agenda, Servizi, Magazzino e Report — UI ready.
        </div>
      </aside>

      {/* CENTRO */}
      <section className="nb-stMain" aria-label="Contenuto Studio">
        {section === "team" ? (
          <TeamSection
            selectedId={selectedOpId}
            onSelect={setSelectedOpId}
            selected={selectedOp}
          />
        ) : null}
        {section === "cabine" ? <CabinsSection /> : null}
        {section === "info" ? <InfoSection /> : null}
        {section === "orari" ? (
          <PlaceholderSection
            title="Orari di apertura"
            text="Configura orari settimanali, pause e giorni speciali. Placeholder UI."
          />
        ) : null}
        {section === "pagamenti" ? (
          <PlaceholderSection
            title="Pagamenti"
            text="Metodi accettati, POS, sconti e ricevute. Placeholder UI."
          />
        ) : null}
        {section === "fidelity" ? (
          <PlaceholderSection
            title="Fidelity"
            text="Programma punti e premi per clienti fedeli. In arrivo nei prossimi sprint."
            badge="Placeholder"
          />
        ) : null}
        {section === "notifiche" ? (
          <PlaceholderSection
            title="Notifiche"
            text="SMS, email e reminder appuntamenti. Solo layout demo."
          />
        ) : null}
        {section === "preferenze" ? (
          <PlaceholderSection
            title="Preferenze"
            text="Lingua, densità UI, backup e accessibilità. Placeholder UI."
          />
        ) : null}
      </section>

      {/* DESTRA */}
      <aside className="nb-stAside">
        {showOperatorStats ? (
          <OperatorStats operator={selectedOp} />
        ) : (
          <StudioAsideContext section={section} />
        )}
      </aside>
    </div>
  );
}

function TeamSection({
  selectedId,
  onSelect,
  selected
}: {
  selectedId: string;
  onSelect: (id: string) => void;
  selected: DemoOperator;
}) {
  return (
    <div className="nb-stTeam">
      <div className="nb-stTeamToolbar">
        <div>
          <h2 className="nb-stSectionTitle">Team</h2>
          <p className="nb-stSectionSub">
            {DEMO_OPERATORS.length} operatori · gestione multi-operatore ready
          </p>
        </div>
        <button type="button" className="nb-newBtn nb-stNewBtn" disabled>
          <UserPlus className="nb-newBtnIcon" aria-hidden={true} />
          Nuovo operatore
        </button>
      </div>

      <ul className="nb-stOpList" role="listbox" aria-label="Elenco operatori">
        {DEMO_OPERATORS.map((op) => {
          const isSelected = op.id === selectedId;
          return (
            <li key={op.id}>
              <button
                type="button"
                role="option"
                aria-selected={isSelected}
                className={clsx("nb-stOpRow", isSelected && "isSelected")}
                onClick={() => onSelect(op.id)}
              >
                <span className={clsx("nb-stOpAvatar", `tone-${op.tone}`)} aria-hidden={true}>
                  {op.initials}
                </span>
                <span className="nb-stOpBody">
                  <span className="nb-stOpTop">
                    <span className="nb-stOpName">{op.name}</span>
                    <span className={clsx("nb-stOpStatus", `is-${op.status}`)}>
                      {statusLabel(op.status)}
                    </span>
                  </span>
                  <span className="nb-stOpMeta">
                    {op.role} · {op.appointmentsToday} app. oggi
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      <div className="nb-stOpDetail" aria-label={`Scheda ${selected.name}`}>
        <div className="nb-stOpDetailHead">
          <div className={clsx("nb-stOpDetailAvatar", `tone-${selected.tone}`)} aria-hidden={true}>
            {selected.initials}
          </div>
          <div>
            <h3 className="nb-stOpDetailName">{selected.name}</h3>
            <p className="nb-stOpDetailRole">{selected.role}</p>
            <span className={clsx("nb-stOpStatus", `is-${selected.status}`)}>
              {statusLabel(selected.status)}
            </span>
          </div>
        </div>

        <div className="nb-stOpDetailGrid">
          <Field label="Telefono" value={selected.phone} />
          <Field label="Email" value={selected.email} />
          <Field label="Data ingresso" value={selected.startDate} />
          <Field label="Cabina assegnata" value={selected.cabin} />
          <Field label="Orario di lavoro" value={selected.schedule} />
          <Field label="Appuntamenti oggi" value={String(selected.appointmentsToday)} />
        </div>

        <div className="nb-stBlock">
          <div className="nb-stBlockLabel">Servizi abilitati</div>
          <div className="nb-stChips">
            {selected.services.map((s) => (
              <span key={s} className="nb-stChip">
                {s}
              </span>
            ))}
          </div>
        </div>

        <div className="nb-stBlock">
          <div className="nb-stBlockLabel">Note</div>
          <p className="nb-stBlockText">{selected.notes}</p>
        </div>

        <div className="nb-stFilterReady">
          Agenda · Servizi · Magazzino · Report potranno essere filtrati per questo operatore
          (solo UI).
        </div>

        <div className="nb-stOpContacts">
          <button type="button" className="nb-stContact" disabled>
            <Phone className="nb-stContactIcon" aria-hidden={true} />
            Chiama
          </button>
          <button type="button" className="nb-stContact" disabled>
            <Mail className="nb-stContactIcon" aria-hidden={true} />
            Email
          </button>
        </div>
      </div>
    </div>
  );
}

function OperatorStats({ operator }: { operator: DemoOperator }) {
  return (
    <div className="nb-stStatsPanel">
      <div className="nb-stStatsHead">
        <h3 className="nb-stStatsTitle">Statistiche operatore</h3>
        <p className="nb-stStatsSub">{operator.name}</p>
      </div>
      <div className="nb-stStatGrid">
        <Stat label="Appuntamenti oggi" value={String(operator.appointmentsToday)} />
        <Stat label="Incasso mese" value={operator.monthRevenue} strong />
        <Stat label="Clienti serviti" value={String(operator.clientsServed)} />
        <Stat label="Servizio più eseguito" value={operator.topService} compact />
        <Stat label="Ore lavorate" value={operator.hoursWorked} />
        <Stat label="Valutazione" value={operator.rating} accent />
      </div>
      <div className="nb-stRatingBox">
        <Star className="nb-stRatingIcon" aria-hidden={true} />
        <div>
          <div className="nb-stRatingTitle">Valutazione clienti</div>
          <div className="nb-stRatingSub">Placeholder · demo {operator.rating}/5</div>
        </div>
      </div>
      <p className="nb-stAsideHint">Demo UI — pronto per multi-operatore</p>
    </div>
  );
}

function CabinsSection() {
  return (
    <div className="nb-stCabins">
      <div className="nb-stTeamToolbar">
        <div>
          <h2 className="nb-stSectionTitle">Cabine</h2>
          <p className="nb-stSectionSub">Stato in tempo reale · placeholder UI</p>
        </div>
        <button type="button" className="nb-ghostBtn nb-stGhost" disabled>
          <Plus className="nb-ghostBtnIcon" aria-hidden={true} />
          Nuova cabina
        </button>
      </div>
      <div className="nb-stCabinGrid">
        {DEMO_CABINS.map((cabin) => (
          <article key={cabin.id} className={clsx("nb-stCabinCard", `is-${cabin.status}`)}>
            <div className="nb-stCabinTop">
              <DoorOpen className="nb-stCabinIcon" aria-hidden={true} />
              <span className={clsx("nb-stCabinStatus", `is-${cabin.status}`)}>
                {cabinStatusLabel(cabin.status)}
              </span>
            </div>
            <h3 className="nb-stCabinName">{cabin.name}</h3>
            <p className="nb-stCabinOp">Operatore · {cabin.operator}</p>
          </article>
        ))}
      </div>
    </div>
  );
}

function InfoSection() {
  return (
    <div className="nb-stInfo">
      <h2 className="nb-stSectionTitle">Informazioni Studio</h2>
      <p className="nb-stSectionSub">Identità del centro estetico · dati demo</p>
      <div className="nb-stOpDetailGrid nb-stInfoGrid">
        <Field label="Nome studio" value="NovaBeauty Studio" />
        <Field label="Titolare" value="Fabio Nova" />
        <Field label="Telefono" value="+39 02 1234 5678" />
        <Field label="Email" value="studio@novabeauty.it" />
        <Field label="Indirizzo" value="Via della Bellezza 12, Milano" />
        <Field label="Partita IVA" value="IT12345678901" />
        <Field label="Operatori" value={`${DEMO_OPERATORS.length} attivi`} />
        <Field label="Cabine" value={`${DEMO_CABINS.length} spazi`} />
      </div>
      <div className="nb-stFilterReady">
        Centro multi-operatore: la UI è pronta per filtrare Agenda e Report per studio / team.
      </div>
    </div>
  );
}

function PlaceholderSection({
  title,
  text,
  badge
}: {
  title: string;
  text: string;
  badge?: string;
}) {
  return (
    <div className="nb-stPlaceholder">
      <div className="nb-stPlaceholderInner">
        {badge ? <span className="nb-stPlaceholderBadge">{badge}</span> : null}
        <h2 className="nb-stSectionTitle">{title}</h2>
        <p className="nb-stPlaceholderText">{text}</p>
      </div>
    </div>
  );
}

function StudioAsideContext({ section }: { section: StudioSection }) {
  const copy: Record<StudioSection, { title: string; body: string }> = {
    info: {
      title: "Panoramica",
      body: "Dati anagrafici e identità dello studio. Collegabili al Core in futuro."
    },
    team: {
      title: "Team",
      body: "Statistiche operatore"
    },
    cabine: {
      title: "Cabine",
      body: "Libere 2 · Occupate 1 · Fuori servizio 2 (demo)."
    },
    orari: {
      title: "Orari",
      body: "Allinea disponibilità operatori e slot Agenda."
    },
    pagamenti: {
      title: "Pagamenti",
      body: "Metodi e report cassa per operatore (futuro)."
    },
    fidelity: {
      title: "Fidelity",
      body: "Modulo loyalty in roadmap."
    },
    notifiche: {
      title: "Notifiche",
      body: "Canali SMS / email / push — UI only."
    },
    preferenze: {
      title: "Preferenze",
      body: "Impostazioni applicative dello studio."
    }
  };

  const item = copy[section];

  return (
    <div className="nb-stStatsPanel">
      <div className="nb-stStatsHead">
        <h3 className="nb-stStatsTitle">{item.title}</h3>
        <p className="nb-stStatsSub">Contesto sezione</p>
      </div>
      <p className="nb-stAsideBody">{item.body}</p>
      <div className="nb-stQuickStats">
        <Stat label="Operatori" value={String(DEMO_OPERATORS.length)} />
        <Stat label="Cabine" value={String(DEMO_CABINS.length)} />
        <Stat label="Online ora" value="2" accent />
        <Stat label="In ferie" value="1" />
      </div>
      <p className="nb-stAsideHint">Centro di controllo attività · demo</p>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="nb-stField">
      <span className="nb-stFieldLabel">{label}</span>
      <span className="nb-stFieldValue">{value}</span>
    </div>
  );
}

function Stat({
  label,
  value,
  strong,
  compact,
  accent
}: {
  label: string;
  value: string;
  strong?: boolean;
  compact?: boolean;
  accent?: boolean;
}) {
  return (
    <div className={clsx("nb-stStat", accent && "accent")}>
      <span className="nb-stStatLabel">{label}</span>
      <span className={clsx("nb-stStatValue", strong && "strong", compact && "compact")}>
        {value}
      </span>
    </div>
  );
}
