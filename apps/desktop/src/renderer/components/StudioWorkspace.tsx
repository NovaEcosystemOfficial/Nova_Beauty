import {
  Building2,
  Clock,
  CreditCard,
  DoorOpen,
  Gift,
  ImageIcon,
  Mail,
  Pencil,
  Phone,
  Plus,
  Star,
  UserPlus,
  Users
} from "lucide-react";
import clsx from "clsx";
import { useEffect, useMemo, useRef, useState, type ChangeEvent, type ComponentType, type Dispatch, type SetStateAction } from "react";
import { useDemoWorkflow } from "../demo/DemoWorkflowContext";

type StudioSection = "info" | "team" | "cabine" | "orari" | "pagamenti" | "fidelity";

type OperatorStatus = "online" | "offline" | "ferie";
type CabinStatus = "libera" | "occupata" | "fuori_servizio";
type OperatorTone = "primary" | "mint" | "gold" | "lavender";

type AgendaSlot = {
  time: string;
  client: string;
  service: string;
};

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
  tone: OperatorTone;
  appointmentsToday: number;
  monthRevenue: string;
  clientsServed: number;
  topService: string;
  hoursWorked: string;
  rating: string;
  todayAgenda: AgendaSlot[];
  followedClients: string[];
  servicesDoneMonth: number;
};

type DemoCabin = {
  id: string;
  name: string;
  operator: string;
  status: CabinStatus;
  client: string;
  treatment: string;
  startTime: string;
  endTime: string;
  remaining: string;
};

type StudioProfile = {
  businessName: string;
  legalName: string;
  vat: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  social: string;
  description: string;
};

type WeekDayKey = "lun" | "mar" | "mer" | "gio" | "ven" | "sab" | "dom";

type DayHours = {
  key: WeekDayKey;
  label: string;
  open: boolean;
  from: string;
  to: string;
};

const MENU: Array<{
  id: StudioSection;
  label: string;
  icon: ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
}> = [
  { id: "info", label: "Informazioni Studio", icon: Building2 },
  { id: "team", label: "Team", icon: Users },
  { id: "cabine", label: "Cabine", icon: DoorOpen },
  { id: "orari", label: "Orari", icon: Clock },
  { id: "pagamenti", label: "Pagamenti", icon: CreditCard },
  { id: "fidelity", label: "Fidelity", icon: Gift }
];

const INITIAL_OPERATORS: DemoOperator[] = [
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
    rating: "4.9",
    todayAgenda: [
      { time: "09:30", client: "Giulia Rossi", service: "Pulizia viso deep" },
      { time: "11:00", client: "Marco Bianchi", service: "Consulenza PMU" },
      { time: "14:00", client: "Elena Verdi", service: "Massaggio rilassante" },
      { time: "16:00", client: "Sara Neri", service: "Peeling enzimatico" },
      { time: "18:00", client: "Anna Greco", service: "Trattamento idratante" }
    ],
    followedClients: ["Giulia Rossi", "Elena Verdi", "Sara Neri", "Lucia Ferri"],
    servicesDoneMonth: 112
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
    rating: "4.8",
    todayAgenda: [
      { time: "10:00", client: "Chiara Moretti", service: "Epilazione gambe" },
      { time: "11:30", client: "Paola Ricci", service: "Manicure spa" },
      { time: "15:00", client: "Marta Conti", service: "Pedicure" },
      { time: "17:00", client: "Irene Gallo", service: "Trattamento corpo" }
    ],
    followedClients: ["Chiara Moretti", "Paola Ricci", "Marta Conti"],
    servicesDoneMonth: 98
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
    rating: "4.6",
    todayAgenda: [],
    followedClients: ["Valentina Russo", "Francesca Villa"],
    servicesDoneMonth: 34
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
    rating: "4.7",
    todayAgenda: [],
    followedClients: [],
    servicesDoneMonth: 0
  }
];

const INITIAL_CABINS: DemoCabin[] = [
  {
    id: "c1",
    name: "Cabina 1",
    operator: "Fabio Nova",
    status: "occupata",
    client: "Giulia Rossi",
    treatment: "Pulizia viso deep",
    startTime: "09:30",
    endTime: "10:30",
    remaining: "18 min"
  },
  {
    id: "c2",
    name: "Cabina 2",
    operator: "Laura Bianchi",
    status: "libera",
    client: "—",
    treatment: "—",
    startTime: "—",
    endTime: "—",
    remaining: "—"
  },
  {
    id: "c3",
    name: "Cabina 3",
    operator: "Sara Conti",
    status: "libera",
    client: "—",
    treatment: "—",
    startTime: "—",
    endTime: "—",
    remaining: "—"
  },
  {
    id: "c4",
    name: "Cabina 4",
    operator: "Non assegnata",
    status: "fuori_servizio",
    client: "—",
    treatment: "—",
    startTime: "—",
    endTime: "—",
    remaining: "—"
  },
  {
    id: "c5",
    name: "Reception",
    operator: "Elena Greco",
    status: "fuori_servizio",
    client: "—",
    treatment: "—",
    startTime: "—",
    endTime: "—",
    remaining: "—"
  }
];

const INITIAL_HOURS: DayHours[] = [
  { key: "lun", label: "Lunedì", open: true, from: "09:00", to: "19:00" },
  { key: "mar", label: "Martedì", open: true, from: "09:00", to: "19:00" },
  { key: "mer", label: "Mercoledì", open: true, from: "09:00", to: "19:00" },
  { key: "gio", label: "Giovedì", open: true, from: "09:00", to: "19:00" },
  { key: "ven", label: "Venerdì", open: true, from: "09:00", to: "19:00" },
  { key: "sab", label: "Sabato", open: true, from: "09:00", to: "14:00" },
  { key: "dom", label: "Domenica", open: false, from: "09:00", to: "13:00" }
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

function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "OP";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
}

function displayCabinStatus(s: CabinStatus): string {
  if (s === "fuori_servizio") return "Fuori servizio";
  return s === "occupata" ? "Occupata" : "Libera";
}

export default function StudioWorkspace() {
  const { studioName, studioLogoUrl, setStudioName, setStudioLogoUrl, pushToast } =
    useDemoWorkflow();

  const [section, setSection] = useState<StudioSection>("team");
  const [operators, setOperators] = useState(INITIAL_OPERATORS);
  const [cabins, setCabins] = useState(INITIAL_CABINS);
  const [selectedOpId, setSelectedOpId] = useState(INITIAL_OPERATORS[0].id);
  const [selectedCabinId, setSelectedCabinId] = useState(INITIAL_CABINS[0].id);

  const [profile, setProfile] = useState<StudioProfile>({
    businessName: studioName,
    legalName: "NovaBeauty S.r.l.",
    vat: "IT12345678901",
    address: "Via della Bellezza 12, Milano",
    phone: "+39 02 1234 5678",
    email: "studio@novabeauty.it",
    website: "https://novabeauty.it",
    social: "@novabeauty",
    description: "Centro estetico specialty viso, corpo e wellness a Milano."
  });

  const [editStudioOpen, setEditStudioOpen] = useState(false);
  const [newOpOpen, setNewOpOpen] = useState(false);
  const [newCabinOpen, setNewCabinOpen] = useState(false);

  const [weekHours, setWeekHours] = useState(INITIAL_HOURS);
  const [lunchEnabled, setLunchEnabled] = useState(true);
  const [lunchFrom, setLunchFrom] = useState("13:00");
  const [lunchTo, setLunchTo] = useState("14:30");
  const [holidays, setHolidays] = useState("1 gen · 25 apr · 1 mag · 2 giu · 15 ago · 1 nov · 8/25/26 dic");
  const [closures, setClosures] = useState("15–18 ago 2026 · ristrutturazione cabina 4");
  const [vacations, setVacations] = useState("Elena Greco · 1–12 ago 2026");
  const [agendaSync, setAgendaSync] = useState(true);

  const [payMethods, setPayMethods] = useState({
    cash: true,
    card: true,
    transfer: true,
    satispay: false,
    voucher: true
  });
  const [vatRate, setVatRate] = useState("22");
  const [defaultPay, setDefaultPay] = useState("card");
  const [docs, setDocs] = useState({
    receipt: true,
    invoice: true,
    fiscal: false
  });

  const [pointsEnabled, setPointsEnabled] = useState(true);
  const [euroPerPoint, setEuroPerPoint] = useState("10");
  const [pointsPerEuro, setPointsPerEuro] = useState("1");
  const [threshold, setThreshold] = useState("100");
  const [bonusSignup, setBonusSignup] = useState("50");
  const [rewards, setRewards] = useState(
    "100 pt · sconto €5\n250 pt · trattamento viso\n500 pt · pacchetto corpo"
  );

  useEffect(() => {
    setProfile((p) => ({ ...p, businessName: studioName }));
  }, [studioName]);

  const selectedOp = operators.find((o) => o.id === selectedOpId) ?? operators[0];
  const selectedCabin = cabins.find((c) => c.id === selectedCabinId) ?? cabins[0];

  const cabinSummary = useMemo(() => {
    const libera = cabins.filter((c) => c.status === "libera").length;
    const occupata = cabins.filter((c) => c.status === "occupata").length;
    const fuori = cabins.filter((c) => c.status === "fuori_servizio").length;
    return { libera, occupata, fuori };
  }, [cabins]);

  const onlineCount = operators.filter((o) => o.status === "online").length;
  const ferieCount = operators.filter((o) => o.status === "ferie").length;

  return (
    <div className="nb-studioWs" role="region" aria-label="Workspace Studio">
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
              </button>
            );
          })}
        </nav>
        <div className="nb-stMenuFoot">
          Filtri futuri per operatore su Agenda, Servizi, Magazzino e Report — UI ready.
        </div>
      </aside>

      <section className="nb-stMain" aria-label="Contenuto Studio">
        {section === "team" && selectedOp ? (
          <TeamSection
            operators={operators}
            selectedId={selectedOpId}
            onSelect={setSelectedOpId}
            selected={selectedOp}
            onNew={() => setNewOpOpen(true)}
            pushToast={pushToast}
          />
        ) : null}
        {section === "cabine" && selectedCabin ? (
          <CabinsSection
            cabins={cabins}
            selectedId={selectedCabinId}
            onSelect={setSelectedCabinId}
            selected={selectedCabin}
            onNew={() => setNewCabinOpen(true)}
          />
        ) : null}
        {section === "info" ? (
          <InfoSection
            profile={profile}
            logoUrl={studioLogoUrl}
            operatorsCount={operators.length}
            cabinsCount={cabins.length}
            onEdit={() => setEditStudioOpen(true)}
          />
        ) : null}
        {section === "orari" ? (
          <HoursSection
            weekHours={weekHours}
            setWeekHours={setWeekHours}
            lunchEnabled={lunchEnabled}
            setLunchEnabled={setLunchEnabled}
            lunchFrom={lunchFrom}
            setLunchFrom={setLunchFrom}
            lunchTo={lunchTo}
            setLunchTo={setLunchTo}
            holidays={holidays}
            setHolidays={setHolidays}
            closures={closures}
            setClosures={setClosures}
            vacations={vacations}
            setVacations={setVacations}
            agendaSync={agendaSync}
            setAgendaSync={setAgendaSync}
            onSave={() => pushToast("Orari salvati · sincronizzati con Agenda")}
          />
        ) : null}
        {section === "pagamenti" ? (
          <PaymentsSection
            payMethods={payMethods}
            setPayMethods={setPayMethods}
            vatRate={vatRate}
            setVatRate={setVatRate}
            defaultPay={defaultPay}
            setDefaultPay={setDefaultPay}
            docs={docs}
            setDocs={setDocs}
            onSave={() => pushToast("Configurazione pagamenti salvata")}
          />
        ) : null}
        {section === "fidelity" ? (
          <FidelitySection
            pointsEnabled={pointsEnabled}
            setPointsEnabled={setPointsEnabled}
            euroPerPoint={euroPerPoint}
            setEuroPerPoint={setEuroPerPoint}
            pointsPerEuro={pointsPerEuro}
            setPointsPerEuro={setPointsPerEuro}
            threshold={threshold}
            setThreshold={setThreshold}
            bonusSignup={bonusSignup}
            setBonusSignup={setBonusSignup}
            rewards={rewards}
            setRewards={setRewards}
            onSave={() => pushToast("Programma fidelity salvato")}
          />
        ) : null}
      </section>

      <aside className="nb-stAside">
        {section === "team" && selectedOp ? (
          <OperatorStats operator={selectedOp} />
        ) : section === "cabine" && selectedCabin ? (
          <CabinAside cabin={selectedCabin} summary={cabinSummary} />
        ) : (
          <StudioAsideContext
            section={section}
            operatorsCount={operators.length}
            cabinsCount={cabins.length}
            onlineCount={onlineCount}
            ferieCount={ferieCount}
            cabinSummary={cabinSummary}
            agendaSync={agendaSync}
            pointsEnabled={pointsEnabled}
          />
        )}
      </aside>

      {editStudioOpen ? (
        <EditStudioDialog
          profile={profile}
          logoUrl={studioLogoUrl}
          onClose={() => setEditStudioOpen(false)}
          onSave={(next, logo) => {
            setProfile(next);
            setStudioName(next.businessName.trim() || studioName);
            setStudioLogoUrl(logo);
            setEditStudioOpen(false);
            pushToast("Informazioni studio aggiornate");
          }}
        />
      ) : null}

      {newOpOpen ? (
        <NewOperatorDialog
          onClose={() => setNewOpOpen(false)}
          onSave={(op) => {
            setOperators((prev) => [op, ...prev]);
            setSelectedOpId(op.id);
            setNewOpOpen(false);
            pushToast(`Operatore creato · ${op.name}`);
          }}
        />
      ) : null}

      {newCabinOpen ? (
        <NewCabinDialog
          onClose={() => setNewCabinOpen(false)}
          onSave={(cabin) => {
            setCabins((prev) => [...prev, cabin]);
            setSelectedCabinId(cabin.id);
            setNewCabinOpen(false);
            pushToast(`Cabina creata · ${cabin.name}`);
          }}
        />
      ) : null}
    </div>
  );
}

function TeamSection({
  operators,
  selectedId,
  onSelect,
  selected,
  onNew,
  pushToast
}: {
  operators: DemoOperator[];
  selectedId: string;
  onSelect: (id: string) => void;
  selected: DemoOperator;
  onNew: () => void;
  pushToast: (msg: string) => void;
}) {
  return (
    <div className="nb-stTeam">
      <div className="nb-stTeamToolbar">
        <div>
          <h2 className="nb-stSectionTitle">Team</h2>
          <p className="nb-stSectionSub">
            {operators.length} operatori · gestione multi-operatore ready
          </p>
        </div>
        <button type="button" className="nb-newBtn nb-stNewBtn" onClick={onNew}>
          <UserPlus className="nb-newBtnIcon" aria-hidden={true} />
          Nuovo operatore
        </button>
      </div>

      <ul className="nb-stOpList" role="listbox" aria-label="Elenco operatori">
        {operators.map((op) => {
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
          <button
            type="button"
            className="nb-stContact"
            onClick={() => {
              if (!selected.phone.trim()) {
                pushToast("Nessun telefono configurato");
                return;
              }
              window.open(`tel:${selected.phone.replace(/\s+/g, "")}`, "_self");
            }}
          >
            <Phone className="nb-stContactIcon" aria-hidden={true} />
            Chiama
          </button>
          <button
            type="button"
            className="nb-stContact"
            onClick={() => {
              if (!selected.email.trim()) {
                pushToast("Nessuna email configurata");
                return;
              }
              window.open(`mailto:${selected.email}`, "_blank", "noopener,noreferrer");
            }}
          >
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
        <h3 className="nb-stStatsTitle">Scheda operatore</h3>
        <p className="nb-stStatsSub">{operator.name}</p>
      </div>

      <div className="nb-stAsideBlock">
        <div className="nb-stAsideBlockTitle">Dati personali</div>
        <div className="nb-stAsideDl">
          <div>
            <span>Ruolo</span>
            <strong>{operator.role}</strong>
          </div>
          <div>
            <span>Telefono</span>
            <strong>{operator.phone}</strong>
          </div>
          <div>
            <span>Email</span>
            <strong>{operator.email}</strong>
          </div>
          <div>
            <span>Cabina</span>
            <strong>{operator.cabin}</strong>
          </div>
        </div>
      </div>

      <div className="nb-stAsideBlock">
        <div className="nb-stAsideBlockTitle">Agenda odierna</div>
        {operator.todayAgenda.length === 0 ? (
          <p className="nb-stAsideEmpty">Nessun appuntamento oggi</p>
        ) : (
          <ul className="nb-stAgendaList">
            {operator.todayAgenda.map((slot) => (
              <li key={`${slot.time}-${slot.client}`}>
                <span className="nb-stAgendaTime">{slot.time}</span>
                <span>
                  <strong>{slot.client}</strong>
                  <em>{slot.service}</em>
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="nb-stStatGrid">
        <Stat label="Clienti seguiti" value={String(operator.followedClients.length || operator.clientsServed)} />
        <Stat label="Servizi eseguiti" value={String(operator.servicesDoneMonth)} />
        <Stat label="Ore lavorate" value={operator.hoursWorked} />
        <Stat label="Incasso" value={operator.monthRevenue} strong />
        <Stat label="Recensione media" value={`${operator.rating}/5`} accent />
        <Stat label="Top servizio" value={operator.topService} compact />
      </div>

      {operator.followedClients.length > 0 ? (
        <div className="nb-stAsideBlock">
          <div className="nb-stAsideBlockTitle">Clienti seguiti</div>
          <div className="nb-stChips">
            {operator.followedClients.map((c) => (
              <span key={c} className="nb-stChip">
                {c}
              </span>
            ))}
          </div>
        </div>
      ) : null}

      <div className="nb-stRatingBox">
        <Star className="nb-stRatingIcon" aria-hidden={true} />
        <div>
          <div className="nb-stRatingTitle">Recensione media</div>
          <div className="nb-stRatingSub">{operator.rating}/5 · feedback clienti demo</div>
        </div>
      </div>
      <p className="nb-stAsideHint">Scheda aggiornata alla selezione · demo</p>
    </div>
  );
}

function CabinsSection({
  cabins,
  selectedId,
  onSelect,
  selected,
  onNew
}: {
  cabins: DemoCabin[];
  selectedId: string;
  onSelect: (id: string) => void;
  selected: DemoCabin;
  onNew: () => void;
}) {
  return (
    <div className="nb-stCabins">
      <div className="nb-stTeamToolbar">
        <div>
          <h2 className="nb-stSectionTitle">Cabine</h2>
          <p className="nb-stSectionSub">Stato in tempo reale · seleziona per il dettaglio</p>
        </div>
        <button type="button" className="nb-ghostBtn nb-stGhost" onClick={onNew}>
          <Plus className="nb-ghostBtnIcon" aria-hidden={true} />
          Nuova cabina
        </button>
      </div>
      <div className="nb-stCabinGrid">
        {cabins.map((cabin) => {
          const isSelected = cabin.id === selectedId;
          return (
            <button
              key={cabin.id}
              type="button"
              className={clsx("nb-stCabinCard", `is-${cabin.status}`, isSelected && "isSelected")}
              onClick={() => onSelect(cabin.id)}
            >
              <div className="nb-stCabinTop">
                <DoorOpen className="nb-stCabinIcon" aria-hidden={true} />
                <span className={clsx("nb-stCabinStatus", `is-${cabin.status}`)}>
                  {cabinStatusLabel(cabin.status)}
                </span>
              </div>
              <h3 className="nb-stCabinName">{cabin.name}</h3>
              <p className="nb-stCabinOp">Operatore · {cabin.operator}</p>
            </button>
          );
        })}
      </div>

      <div className="nb-stOpDetail" aria-label={`Dettaglio ${selected.name}`}>
        <h3 className="nb-stOpDetailName">{selected.name}</h3>
        <div className="nb-stOpDetailGrid">
          <Field label="Stato" value={displayCabinStatus(selected.status)} />
          <Field label="Operatore assegnato" value={selected.operator} />
          <Field label="Cliente corrente" value={selected.client} />
          <Field label="Trattamento in corso" value={selected.treatment} />
          <Field label="Ora inizio" value={selected.startTime} />
          <Field label="Ora fine prevista" value={selected.endTime} />
          <Field label="Tempo rimanente" value={selected.remaining} />
          <Field
            label="Disponibilità"
            value={selected.status === "libera" ? "Pronta per nuovo slot" : "In uso / non disponibile"}
          />
        </div>
      </div>
    </div>
  );
}

function CabinAside({
  cabin,
  summary
}: {
  cabin: DemoCabin;
  summary: { libera: number; occupata: number; fuori: number };
}) {
  return (
    <div className="nb-stStatsPanel">
      <div className="nb-stStatsHead">
        <h3 className="nb-stStatsTitle">{cabin.name}</h3>
        <p className="nb-stStatsSub">{cabinStatusLabel(cabin.status)}</p>
      </div>
      <div className="nb-stStatGrid">
        <Stat label="Operatore" value={cabin.operator} compact />
        <Stat label="Cliente" value={cabin.client} compact />
        <Stat label="Trattamento" value={cabin.treatment} compact />
        <Stat label="Rimanente" value={cabin.remaining} />
        <Stat label="Inizio" value={cabin.startTime} />
        <Stat label="Fine" value={cabin.endTime} />
      </div>
      <div className="nb-stQuickStats">
        <Stat label="Libere" value={String(summary.libera)} accent />
        <Stat label="Occupate" value={String(summary.occupata)} />
        <Stat label="Fuori servizio" value={String(summary.fuori)} />
      </div>
      <p className="nb-stAsideHint">Dettaglio cabina · demo live</p>
    </div>
  );
}

function InfoSection({
  profile,
  logoUrl,
  operatorsCount,
  cabinsCount,
  onEdit
}: {
  profile: StudioProfile;
  logoUrl: string | null;
  operatorsCount: number;
  cabinsCount: number;
  onEdit: () => void;
}) {
  return (
    <div className="nb-stInfo">
      <div className="nb-stTeamToolbar">
        <div>
          <h2 className="nb-stSectionTitle">Informazioni Studio</h2>
          <p className="nb-stSectionSub">Identità del centro estetico · dati demo</p>
        </div>
        <button type="button" className="nb-newBtn nb-stNewBtn" onClick={onEdit}>
          <Pencil className="nb-newBtnIcon" aria-hidden={true} />
          Modifica Studio
        </button>
      </div>

      <div className="nb-stInfoLogoRow">
        <div className={clsx("nb-stInfoLogo", logoUrl && "hasImage")}>
          {logoUrl ? (
            <img src={logoUrl} alt="" className="nb-stInfoLogoImg" />
          ) : (
            <span>{initialsFromName(profile.businessName)}</span>
          )}
        </div>
        <div>
          <div className="nb-stInfoBiz">{profile.businessName}</div>
          <div className="nb-stInfoLegal">{profile.legalName}</div>
        </div>
      </div>

      <div className="nb-stOpDetailGrid nb-stInfoGrid">
        <Field label="Nome attività" value={profile.businessName} />
        <Field label="Ragione sociale" value={profile.legalName} />
        <Field label="Telefono" value={profile.phone} />
        <Field label="Email" value={profile.email} />
        <Field label="Indirizzo" value={profile.address} />
        <Field label="Partita IVA" value={profile.vat} />
        <Field label="Sito web" value={profile.website.replace(/^https?:\/\//, "")} />
        <Field label="Social" value={profile.social} />
        <Field label="Operatori" value={`${operatorsCount} attivi`} />
        <Field label="Cabine" value={`${cabinsCount} spazi`} />
      </div>

      <div className="nb-stBlock">
        <div className="nb-stBlockLabel">Descrizione</div>
        <p className="nb-stBlockText">{profile.description}</p>
      </div>

      <div className="nb-stFilterReady">
        Centro multi-operatore: la UI è pronta per filtrare Agenda e Report per studio / team.
      </div>
    </div>
  );
}

function HoursSection({
  weekHours,
  setWeekHours,
  lunchEnabled,
  setLunchEnabled,
  lunchFrom,
  setLunchFrom,
  lunchTo,
  setLunchTo,
  holidays,
  setHolidays,
  closures,
  setClosures,
  vacations,
  setVacations,
  agendaSync,
  setAgendaSync,
  onSave
}: {
  weekHours: DayHours[];
  setWeekHours: (v: DayHours[] | ((p: DayHours[]) => DayHours[])) => void;
  lunchEnabled: boolean;
  setLunchEnabled: (v: boolean) => void;
  lunchFrom: string;
  setLunchFrom: (v: string) => void;
  lunchTo: string;
  setLunchTo: (v: string) => void;
  holidays: string;
  setHolidays: (v: string) => void;
  closures: string;
  setClosures: (v: string) => void;
  vacations: string;
  setVacations: (v: string) => void;
  agendaSync: boolean;
  setAgendaSync: (v: boolean) => void;
  onSave: () => void;
}) {
  return (
    <div className="nb-stConfig">
      <div className="nb-stTeamToolbar">
        <div>
          <h2 className="nb-stSectionTitle">Orari di apertura</h2>
          <p className="nb-stSectionSub">Settimana, pause, festività e sync Agenda</p>
        </div>
        <button type="button" className="nb-newBtn nb-stNewBtn" onClick={onSave}>
          Salva orari
        </button>
      </div>

      <div className="nb-stConfigCard">
        <div className="nb-stConfigCardTitle">Orari settimanali</div>
        <div className="nb-stHoursList">
          {weekHours.map((day) => (
            <div key={day.key} className="nb-stHoursRow">
              <label className="nb-stCheck">
                <input
                  type="checkbox"
                  checked={day.open}
                  onChange={(e) =>
                    setWeekHours((prev) =>
                      prev.map((d) => (d.key === day.key ? { ...d, open: e.target.checked } : d))
                    )
                  }
                />
                <span>{day.label}</span>
              </label>
              <input
                className="nb-drawerInput nb-stTimeInput"
                type="time"
                value={day.from}
                disabled={!day.open}
                onChange={(e) =>
                  setWeekHours((prev) =>
                    prev.map((d) => (d.key === day.key ? { ...d, from: e.target.value } : d))
                  )
                }
              />
              <span className="nb-stTimeSep">–</span>
              <input
                className="nb-drawerInput nb-stTimeInput"
                type="time"
                value={day.to}
                disabled={!day.open}
                onChange={(e) =>
                  setWeekHours((prev) =>
                    prev.map((d) => (d.key === day.key ? { ...d, to: e.target.value } : d))
                  )
                }
              />
            </div>
          ))}
        </div>
      </div>

      <div className="nb-stConfigCard">
        <div className="nb-stConfigCardTitle">Pausa pranzo</div>
        <label className="nb-stCheck">
          <input
            type="checkbox"
            checked={lunchEnabled}
            onChange={(e) => setLunchEnabled(e.target.checked)}
          />
          <span>Attiva pausa pranzo</span>
        </label>
        <div className="nb-stHoursRow compact">
          <input
            className="nb-drawerInput nb-stTimeInput"
            type="time"
            value={lunchFrom}
            disabled={!lunchEnabled}
            onChange={(e) => setLunchFrom(e.target.value)}
          />
          <span className="nb-stTimeSep">–</span>
          <input
            className="nb-drawerInput nb-stTimeInput"
            type="time"
            value={lunchTo}
            disabled={!lunchEnabled}
            onChange={(e) => setLunchTo(e.target.value)}
          />
        </div>
      </div>

      <div className="nb-stConfigGrid">
        <label className="nb-drawerField">
          <span className="nb-drawerFieldLabel">Festività</span>
          <textarea
            className="nb-drawerTextarea"
            rows={3}
            value={holidays}
            onChange={(e) => setHolidays(e.target.value)}
          />
        </label>
        <label className="nb-drawerField">
          <span className="nb-drawerFieldLabel">Chiusure straordinarie</span>
          <textarea
            className="nb-drawerTextarea"
            rows={3}
            value={closures}
            onChange={(e) => setClosures(e.target.value)}
          />
        </label>
        <label className="nb-drawerField">
          <span className="nb-drawerFieldLabel">Ferie team</span>
          <textarea
            className="nb-drawerTextarea"
            rows={3}
            value={vacations}
            onChange={(e) => setVacations(e.target.value)}
          />
        </label>
        <div className="nb-stConfigCard">
          <div className="nb-stConfigCardTitle">Sincronizzazione Agenda</div>
          <label className="nb-stCheck">
            <input
              type="checkbox"
              checked={agendaSync}
              onChange={(e) => setAgendaSync(e.target.checked)}
            />
            <span>Propaga orari e chiusure agli slot Agenda</span>
          </label>
          <p className="nb-stConfigHint">
            {agendaSync
              ? "Attiva · gli slot fuori orario saranno bloccati in Agenda."
              : "Disattiva · Agenda non riceve aggiornamenti orari."}
          </p>
        </div>
      </div>
    </div>
  );
}

function PaymentsSection({
  payMethods,
  setPayMethods,
  vatRate,
  setVatRate,
  defaultPay,
  setDefaultPay,
  docs,
  setDocs,
  onSave
}: {
  payMethods: { cash: boolean; card: boolean; transfer: boolean; satispay: boolean; voucher: boolean };
  setPayMethods: Dispatch<
    SetStateAction<{
      cash: boolean;
      card: boolean;
      transfer: boolean;
      satispay: boolean;
      voucher: boolean;
    }>
  >;
  vatRate: string;
  setVatRate: (v: string) => void;
  defaultPay: string;
  setDefaultPay: (v: string) => void;
  docs: { receipt: boolean; invoice: boolean; fiscal: boolean };
  setDocs: Dispatch<SetStateAction<{ receipt: boolean; invoice: boolean; fiscal: boolean }>>;
  onSave: () => void;
}) {
  const methods: Array<{ key: keyof typeof payMethods; label: string }> = [
    { key: "cash", label: "Contanti" },
    { key: "card", label: "Carta / POS" },
    { key: "transfer", label: "Bonifico" },
    { key: "satispay", label: "Satispay" },
    { key: "voucher", label: "Voucher / gift card" }
  ];

  return (
    <div className="nb-stConfig">
      <div className="nb-stTeamToolbar">
        <div>
          <h2 className="nb-stSectionTitle">Pagamenti</h2>
          <p className="nb-stSectionSub">Metodi, IVA e documenti fiscali</p>
        </div>
        <button type="button" className="nb-newBtn nb-stNewBtn" onClick={onSave}>
          Salva pagamenti
        </button>
      </div>

      <div className="nb-stConfigCard">
        <div className="nb-stConfigCardTitle">Metodi accettati</div>
        <div className="nb-stCheckGrid">
          {methods.map((m) => (
            <label key={m.key} className="nb-stCheck">
              <input
                type="checkbox"
                checked={payMethods[m.key]}
                onChange={(e) =>
                  setPayMethods((prev) => ({ ...prev, [m.key]: e.target.checked }))
                }
              />
              <span>{m.label}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="nb-stConfigGrid">
        <label className="nb-drawerField">
          <span className="nb-drawerFieldLabel">Aliquota IVA (%)</span>
          <select
            className="nb-drawerSelect"
            value={vatRate}
            onChange={(e) => setVatRate(e.target.value)}
          >
            <option value="22">22%</option>
            <option value="10">10%</option>
            <option value="4">4%</option>
            <option value="0">0% · esente</option>
          </select>
        </label>
        <label className="nb-drawerField">
          <span className="nb-drawerFieldLabel">Metodo predefinito</span>
          <select
            className="nb-drawerSelect"
            value={defaultPay}
            onChange={(e) => setDefaultPay(e.target.value)}
          >
            {methods.map((m) => (
              <option key={m.key} value={m.key} disabled={!payMethods[m.key]}>
                {m.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="nb-stConfigCard">
        <div className="nb-stConfigCardTitle">Ricevute, fatture e scontrini</div>
        <div className="nb-stCheckGrid">
          <label className="nb-stCheck">
            <input
              type="checkbox"
              checked={docs.receipt}
              onChange={(e) => setDocs((p) => ({ ...p, receipt: e.target.checked }))}
            />
            <span>Emetti ricevuta</span>
          </label>
          <label className="nb-stCheck">
            <input
              type="checkbox"
              checked={docs.invoice}
              onChange={(e) => setDocs((p) => ({ ...p, invoice: e.target.checked }))}
            />
            <span>Fattura elettronica</span>
          </label>
          <label className="nb-stCheck">
            <input
              type="checkbox"
              checked={docs.fiscal}
              onChange={(e) => setDocs((p) => ({ ...p, fiscal: e.target.checked }))}
            />
            <span>Scontrino fiscale / RT</span>
          </label>
        </div>
      </div>
    </div>
  );
}

function FidelitySection({
  pointsEnabled,
  setPointsEnabled,
  euroPerPoint,
  setEuroPerPoint,
  pointsPerEuro,
  setPointsPerEuro,
  threshold,
  setThreshold,
  bonusSignup,
  setBonusSignup,
  rewards,
  setRewards,
  onSave
}: {
  pointsEnabled: boolean;
  setPointsEnabled: (v: boolean) => void;
  euroPerPoint: string;
  setEuroPerPoint: (v: string) => void;
  pointsPerEuro: string;
  setPointsPerEuro: (v: string) => void;
  threshold: string;
  setThreshold: (v: string) => void;
  bonusSignup: string;
  setBonusSignup: (v: string) => void;
  rewards: string;
  setRewards: (v: string) => void;
  onSave: () => void;
}) {
  return (
    <div className="nb-stConfig">
      <div className="nb-stTeamToolbar">
        <div>
          <h2 className="nb-stSectionTitle">Fidelity</h2>
          <p className="nb-stSectionSub">Punti, premi, soglie e bonus</p>
        </div>
        <button type="button" className="nb-newBtn nb-stNewBtn" onClick={onSave}>
          Salva fidelity
        </button>
      </div>

      <div className="nb-stConfigCard">
        <div className="nb-stConfigCardTitle">Configurazione punti</div>
        <label className="nb-stCheck">
          <input
            type="checkbox"
            checked={pointsEnabled}
            onChange={(e) => setPointsEnabled(e.target.checked)}
          />
          <span>Programma punti attivo</span>
        </label>
        <div className="nb-stConfigGrid">
          <label className="nb-drawerField">
            <span className="nb-drawerFieldLabel">Euro per 1 punto</span>
            <input
              className="nb-drawerInput"
              value={euroPerPoint}
              disabled={!pointsEnabled}
              onChange={(e) => setEuroPerPoint(e.target.value)}
            />
          </label>
          <label className="nb-drawerField">
            <span className="nb-drawerFieldLabel">Punti per euro speso</span>
            <input
              className="nb-drawerInput"
              value={pointsPerEuro}
              disabled={!pointsEnabled}
              onChange={(e) => setPointsPerEuro(e.target.value)}
            />
          </label>
          <label className="nb-drawerField">
            <span className="nb-drawerFieldLabel">Soglia riscatto (pt)</span>
            <input
              className="nb-drawerInput"
              value={threshold}
              disabled={!pointsEnabled}
              onChange={(e) => setThreshold(e.target.value)}
            />
          </label>
          <label className="nb-drawerField">
            <span className="nb-drawerFieldLabel">Bonus iscrizione (pt)</span>
            <input
              className="nb-drawerInput"
              value={bonusSignup}
              disabled={!pointsEnabled}
              onChange={(e) => setBonusSignup(e.target.value)}
            />
          </label>
        </div>
      </div>

      <label className="nb-drawerField">
        <span className="nb-drawerFieldLabel">Premi riscattabili</span>
        <textarea
          className="nb-drawerTextarea"
          rows={5}
          value={rewards}
          disabled={!pointsEnabled}
          onChange={(e) => setRewards(e.target.value)}
          placeholder="Elenco premi · un premio per riga"
        />
      </label>
    </div>
  );
}

function StudioAsideContext({
  section,
  operatorsCount,
  cabinsCount,
  onlineCount,
  ferieCount,
  cabinSummary,
  agendaSync,
  pointsEnabled
}: {
  section: StudioSection;
  operatorsCount: number;
  cabinsCount: number;
  onlineCount: number;
  ferieCount: number;
  cabinSummary: { libera: number; occupata: number; fuori: number };
  agendaSync: boolean;
  pointsEnabled: boolean;
}) {
  const copy: Record<StudioSection, { title: string; body: string }> = {
    info: {
      title: "Panoramica",
      body: "Dati anagrafici e identità dello studio. Modificabili dal pulsante Modifica Studio."
    },
    team: {
      title: "Team",
      body: "Statistiche operatore"
    },
    cabine: {
      title: "Cabine",
      body: `Libere ${cabinSummary.libera} · Occupate ${cabinSummary.occupata} · Fuori servizio ${cabinSummary.fuori}.`
    },
    orari: {
      title: "Orari",
      body: agendaSync
        ? "Sincronizzazione Agenda attiva · slot allineati agli orari."
        : "Sincronizzazione Agenda disattiva."
    },
    pagamenti: {
      title: "Pagamenti",
      body: "Metodi, IVA e documenti fiscali del centro."
    },
    fidelity: {
      title: "Fidelity",
      body: pointsEnabled
        ? "Programma punti attivo · premi e soglie configurabili."
        : "Programma punti disattivato."
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
        <Stat label="Operatori" value={String(operatorsCount)} />
        <Stat label="Cabine" value={String(cabinsCount)} />
        <Stat label="Online ora" value={String(onlineCount)} accent />
        <Stat label="In ferie" value={String(ferieCount)} />
      </div>
      <p className="nb-stAsideHint">Centro di controllo attività · demo</p>
    </div>
  );
}

function EditStudioDialog({
  profile,
  logoUrl,
  onClose,
  onSave
}: {
  profile: StudioProfile;
  logoUrl: string | null;
  onClose: () => void;
  onSave: (profile: StudioProfile, logo: string | null) => void;
}) {
  const [draft, setDraft] = useState(profile);
  const [logo, setLogo] = useState(logoUrl);
  const fileRef = useRef<HTMLInputElement>(null);

  const onPickLogo = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = () => setLogo(String(reader.result));
    reader.readAsDataURL(file);
  };

  return (
    <div className="nb-dialogRoot isOpen" role="presentation">
      <button type="button" className="nb-dialogBackdrop" aria-label="Chiudi" onClick={onClose} />
      <div
        className="nb-dialogCard nb-stEditDialog"
        role="dialog"
        aria-modal="true"
        aria-label="Modifica Studio"
      >
        <h2 className="nb-dialogTitle">Modifica Studio</h2>
        <p className="nb-dialogSub">Identità e contatti del centro</p>

        <div className="nb-stEditForm">
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="nb-stHiddenFile"
            onChange={onPickLogo}
          />
          <button
            type="button"
            className={clsx("nb-stLogoPick", logo && "hasImage")}
            onClick={() => fileRef.current?.click()}
          >
            {logo ? (
              <img src={logo} alt="" className="nb-stLogoPickImg" />
            ) : (
              <>
                <ImageIcon className="nb-stLogoPickIcon" aria-hidden={true} />
                <span>Carica logo</span>
              </>
            )}
          </button>

          {(
            [
              ["businessName", "Nome attività"],
              ["legalName", "Ragione sociale"],
              ["vat", "Partita IVA"],
              ["address", "Indirizzo"],
              ["phone", "Telefono"],
              ["email", "Email"],
              ["website", "Sito web"],
              ["social", "Social"]
            ] as Array<[keyof StudioProfile, string]>
          ).map(([key, label]) => (
            <label key={key} className="nb-drawerField">
              <span className="nb-drawerFieldLabel">{label}</span>
              <input
                className="nb-drawerInput"
                value={draft[key]}
                onChange={(e) => setDraft((d) => ({ ...d, [key]: e.target.value }))}
              />
            </label>
          ))}

          <label className="nb-drawerField">
            <span className="nb-drawerFieldLabel">Descrizione</span>
            <textarea
              className="nb-drawerTextarea"
              rows={3}
              value={draft.description}
              onChange={(e) => setDraft((d) => ({ ...d, description: e.target.value }))}
            />
          </label>
        </div>

        <div className="nb-dialogActions">
          <button type="button" className="nb-ghostBtn" onClick={onClose}>
            Annulla
          </button>
          <button type="button" className="nb-newBtn" onClick={() => onSave(draft, logo)}>
            Salva
          </button>
        </div>
      </div>
    </div>
  );
}

function NewOperatorDialog({
  onClose,
  onSave
}: {
  onClose: () => void;
  onSave: (op: DemoOperator) => void;
}) {
  const [name, setName] = useState("");
  const [role, setRole] = useState("Estetista");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [cabin, setCabin] = useState("Cabina 1");
  const [services, setServices] = useState("Viso, Corpo");

  return (
    <div className="nb-dialogRoot isOpen" role="presentation">
      <button type="button" className="nb-dialogBackdrop" aria-label="Chiudi" onClick={onClose} />
      <div className="nb-dialogCard nb-stEditDialog" role="dialog" aria-modal="true" aria-label="Nuovo operatore">
        <h2 className="nb-dialogTitle">Nuovo operatore</h2>
        <p className="nb-dialogSub">Anagrafica team · demo</p>
        <div className="nb-stEditForm">
          <label className="nb-drawerField">
            <span className="nb-drawerFieldLabel">Nome</span>
            <input className="nb-drawerInput" value={name} onChange={(e) => setName(e.target.value)} />
          </label>
          <label className="nb-drawerField">
            <span className="nb-drawerFieldLabel">Ruolo</span>
            <input className="nb-drawerInput" value={role} onChange={(e) => setRole(e.target.value)} />
          </label>
          <label className="nb-drawerField">
            <span className="nb-drawerFieldLabel">Telefono</span>
            <input className="nb-drawerInput" value={phone} onChange={(e) => setPhone(e.target.value)} />
          </label>
          <label className="nb-drawerField">
            <span className="nb-drawerFieldLabel">Email</span>
            <input className="nb-drawerInput" value={email} onChange={(e) => setEmail(e.target.value)} />
          </label>
          <label className="nb-drawerField">
            <span className="nb-drawerFieldLabel">Cabina</span>
            <input className="nb-drawerInput" value={cabin} onChange={(e) => setCabin(e.target.value)} />
          </label>
          <label className="nb-drawerField">
            <span className="nb-drawerFieldLabel">Servizi (separati da virgola)</span>
            <input
              className="nb-drawerInput"
              value={services}
              onChange={(e) => setServices(e.target.value)}
            />
          </label>
        </div>
        <div className="nb-dialogActions">
          <button type="button" className="nb-ghostBtn" onClick={onClose}>
            Annulla
          </button>
          <button
            type="button"
            className="nb-newBtn"
            onClick={() => {
              const trimmed = name.trim();
              if (!trimmed) return;
              const tones: OperatorTone[] = ["primary", "mint", "gold", "lavender"];
              onSave({
                id: `o-${Date.now()}`,
                name: trimmed,
                role: role.trim() || "Estetista",
                status: "offline",
                phone: phone.trim() || "—",
                email: email.trim() || "—",
                startDate: "6 ago 2026",
                cabin: cabin.trim() || "—",
                services: services
                  .split(",")
                  .map((s) => s.trim())
                  .filter(Boolean),
                schedule: "Da definire",
                notes: "Nuovo operatore · demo",
                initials: initialsFromName(trimmed),
                tone: tones[Math.floor(Math.random() * tones.length)],
                appointmentsToday: 0,
                monthRevenue: "€0",
                clientsServed: 0,
                topService: "—",
                hoursWorked: "0 h",
                rating: "—",
                todayAgenda: [],
                followedClients: [],
                servicesDoneMonth: 0
              });
            }}
          >
            Crea operatore
          </button>
        </div>
      </div>
    </div>
  );
}

function NewCabinDialog({
  onClose,
  onSave
}: {
  onClose: () => void;
  onSave: (cabin: DemoCabin) => void;
}) {
  const [name, setName] = useState("");
  const [operator, setOperator] = useState("Non assegnata");

  return (
    <div className="nb-dialogRoot isOpen" role="presentation">
      <button type="button" className="nb-dialogBackdrop" aria-label="Chiudi" onClick={onClose} />
      <div className="nb-dialogCard" role="dialog" aria-modal="true" aria-label="Nuova cabina">
        <h2 className="nb-dialogTitle">Nuova cabina</h2>
        <p className="nb-dialogSub">Aggiungi uno spazio trattamento</p>
        <div className="nb-stEditForm">
          <label className="nb-drawerField">
            <span className="nb-drawerFieldLabel">Nome cabina</span>
            <input className="nb-drawerInput" value={name} onChange={(e) => setName(e.target.value)} />
          </label>
          <label className="nb-drawerField">
            <span className="nb-drawerFieldLabel">Operatore assegnato</span>
            <input
              className="nb-drawerInput"
              value={operator}
              onChange={(e) => setOperator(e.target.value)}
            />
          </label>
        </div>
        <div className="nb-dialogActions">
          <button type="button" className="nb-ghostBtn" onClick={onClose}>
            Annulla
          </button>
          <button
            type="button"
            className="nb-newBtn"
            onClick={() => {
              const trimmed = name.trim();
              if (!trimmed) return;
              onSave({
                id: `c-${Date.now()}`,
                name: trimmed,
                operator: operator.trim() || "Non assegnata",
                status: "libera",
                client: "—",
                treatment: "—",
                startTime: "—",
                endTime: "—",
                remaining: "—"
              });
            }}
          >
            Crea cabina
          </button>
        </div>
      </div>
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
