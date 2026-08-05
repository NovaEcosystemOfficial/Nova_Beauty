import {
  AlertTriangle,
  Archive,
  Bell,
  Cake,
  CalendarClock,
  CalendarDays,
  CalendarX2,
  CheckCircle2,
  Clock3,
  HardDrive,
  Mail,
  Moon,
  Package,
  PackageX,
  ShieldAlert,
  Smartphone,
  Sparkles,
  TrendingUp,
  UserCheck,
  UserMinus,
  UserPlus,
  UserRound,
  UserX,
  Volume2,
  WifiOff
} from "lucide-react";
import clsx from "clsx";
import { useMemo, useState, type ComponentType, type ReactNode } from "react";
import { useDemoWorkflow } from "../demo/DemoWorkflowContext";
import ComingSoonToggle, { COMING_SOON_MESSAGE } from "./ui/ComingSoonToggle";

type NotifItem = {
  id: string;
  title: string;
  description: string;
  icon: ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  defaultOn?: boolean;
  comingSoon?: boolean;
};

type TimelineItem = {
  id: string;
  time: string;
  text: string;
  tone: "mint" | "rose" | "gold" | "lavender" | "slate";
  icon: ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
};

const BUSINESS: NotifItem[] = [
  {
    id: "b1",
    title: "Nuovo appuntamento",
    description: "Quando viene prenotato uno slot in agenda.",
    icon: CalendarDays,
    defaultOn: true
  },
  {
    id: "b2",
    title: "Appuntamento modificato",
    description: "Cambi di orario, cabina o operatore.",
    icon: CalendarClock,
    defaultOn: true
  },
  {
    id: "b3",
    title: "Appuntamento annullato",
    description: "Cancellazioni da cliente o da studio.",
    icon: CalendarX2,
    defaultOn: true
  },
  {
    id: "b4",
    title: "Cliente arrivato",
    description: "Check-in in reception o da Staff.",
    icon: UserCheck,
    defaultOn: true
  },
  {
    id: "b5",
    title: "Cliente assente",
    description: "No-show oltre la soglia configurata.",
    icon: UserX,
    defaultOn: true
  },
  {
    id: "b6",
    title: "Cliente VIP",
    description: "Arrivo o prenotazione di clienti VIP.",
    icon: Sparkles,
    defaultOn: true
  },
  {
    id: "b7",
    title: "Compleanno cliente",
    description: "Promemoria compleanni del giorno.",
    icon: Cake,
    defaultOn: true
  },
  {
    id: "b8",
    title: "Cliente inattivo da oltre 60 giorni",
    description: "Opportunità di ricontatto automatico.",
    icon: UserMinus,
    defaultOn: false
  }
];

const STAFF: NotifItem[] = [
  {
    id: "s1",
    title: "Nuovo operatore",
    description: "Inviti accettati e accessi attivati.",
    icon: UserPlus,
    defaultOn: true
  },
  {
    id: "s2",
    title: "Cambio turno",
    description: "Modifiche agli orari del team.",
    icon: Clock3,
    defaultOn: true
  },
  {
    id: "s3",
    title: "Richiesta ferie",
    description: "Nuove richieste da approvare.",
    icon: CalendarDays,
    defaultOn: true
  },
  {
    id: "s4",
    title: "Operatore in ritardo",
    description: "Ritardo rispetto all’inizio turno.",
    icon: AlertTriangle,
    defaultOn: true
  },
  {
    id: "s5",
    title: "Operatore offline",
    description: "Disconnessione prolungata da Staff.",
    icon: WifiOff,
    defaultOn: false
  },
  {
    id: "s6",
    title: "Accesso da nuovo dispositivo",
    description: "Login da device non riconosciuto.",
    icon: ShieldAlert,
    defaultOn: true
  }
];

const INVENTORY: NotifItem[] = [
  {
    id: "i1",
    title: "Prodotto sotto scorta",
    description: "Quantità sotto la soglia minima.",
    icon: Package,
    defaultOn: true
  },
  {
    id: "i2",
    title: "Lotto in scadenza",
    description: "Lotti in scadenza entro 30 giorni.",
    icon: Archive,
    defaultOn: true
  },
  {
    id: "i3",
    title: "Ordine consigliato",
    description: "Suggerimenti di riordino automatico.",
    icon: TrendingUp,
    defaultOn: true
  },
  {
    id: "i4",
    title: "Articolo esaurito",
    description: "Stock a zero in magazzino.",
    icon: PackageX,
    defaultOn: true
  }
];

const SMART_ALERTS = [
  "Agenda quasi piena",
  "Giornata con pochi appuntamenti",
  "Fatturato sopra media",
  "Troppi no-show",
  "Cabina inutilizzata"
];

const DESKTOP_CHANNELS: NotifItem[] = [
  { id: "d1", title: "Toast Windows", description: "Avvisi desktop in tempo reale.", icon: Bell, defaultOn: true },
  { id: "d2", title: "Badge", description: "Contatore sulla campanella.", icon: Bell, defaultOn: true },
  { id: "d3", title: "Suono", description: "Feedback audio per eventi critici.", icon: Volume2, defaultOn: false }
];

const EMAIL_CHANNELS: NotifItem[] = [
  { id: "e1", title: "Report giornaliero", description: "Riepilogo ogni sera.", icon: Mail, defaultOn: true },
  { id: "e2", title: "Report settimanale", description: "Sintesi del centro ogni lunedì.", icon: Mail, defaultOn: true },
  { id: "e3", title: "Report mensile", description: "Andamento e insight del mese.", icon: Mail, defaultOn: false }
];

const STAFF_CHANNELS: NotifItem[] = [
  {
    id: "p1",
    title: "Push Notification",
    description: "Avvisi su NovaBeauty Staff.",
    icon: Smartphone,
    defaultOn: false,
    comingSoon: true
  },
  {
    id: "p2",
    title: "Badge",
    description: "Badge app mobile.",
    icon: Smartphone,
    defaultOn: false,
    comingSoon: true
  },
  {
    id: "p3",
    title: "Vibrazione",
    description: "Haptic feedback su smartphone.",
    icon: Smartphone,
    defaultOn: false,
    comingSoon: true
  }
];

const TIMELINE: TimelineItem[] = [
  {
    id: "t1",
    time: "20:14",
    text: "Laura ha iniziato il trattamento.",
    tone: "mint",
    icon: UserRound
  },
  {
    id: "t2",
    time: "20:09",
    text: "Nuovo appuntamento.",
    tone: "rose",
    icon: CalendarDays
  },
  {
    id: "t3",
    time: "19:58",
    text: "Backup completato.",
    tone: "lavender",
    icon: HardDrive
  },
  {
    id: "t4",
    time: "19:42",
    text: "Prodotto sotto scorta.",
    tone: "gold",
    icon: Package
  },
  {
    id: "t5",
    time: "19:11",
    text: "Marco Rossi ha effettuato il login.",
    tone: "slate",
    icon: UserPlus
  },
  {
    id: "t6",
    time: "18:56",
    text: "Cliente VIP arrivato.",
    tone: "rose",
    icon: Sparkles
  }
];

export default function NotificationCenter() {
  const { pushToast } = useDemoWorkflow();
  const allItems = useMemo(
    () => [...BUSINESS, ...STAFF, ...INVENTORY, ...DESKTOP_CHANNELS, ...EMAIL_CHANNELS, ...STAFF_CHANNELS],
    []
  );

  const [enabled, setEnabled] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(
      allItems.map((i) => [i.id, i.comingSoon ? false : Boolean(i.defaultOn)])
    )
  );
  const [smartOn, setSmartOn] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(SMART_ALERTS.map((a) => [a, a !== "Cabina inutilizzata"]))
  );
  const [quietOn, setQuietOn] = useState(true);
  const [quietFrom, setQuietFrom] = useState("22:00");
  const [quietTo, setQuietTo] = useState("08:00");
  const [quietWeekend, setQuietWeekend] = useState(true);
  const [quietHoliday, setQuietHoliday] = useState(true);
  const [quietTreatment, setQuietTreatment] = useState(false);

  const informComingSoon = () => {
    pushToast(COMING_SOON_MESSAGE);
  };

  const toggle = (id: string) => {
    const item = allItems.find((i) => i.id === id);
    if (item?.comingSoon) {
      informComingSoon();
      return;
    }
    setEnabled((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="nb-nc" role="region" aria-label="Notification Center">
      <header className="nb-ncHead">
        <div className="nb-ncHeadIcon" aria-hidden={true}>
          <Bell />
        </div>
        <div>
          <h2 className="nb-ncTitle">Notification Center</h2>
          <p className="nb-ncSub">Controlla tutti gli avvisi del tuo centro estetico.</p>
        </div>
      </header>

      <article className="nb-ncStatus">
        <div className="nb-ncStatusMain">
          <span className="nb-ncStatusPill">
            <span className="nb-ncStatusDot" aria-hidden={true} />
            Sistema operativo
          </span>
          <p className="nb-ncStatusSync">Ultima sincronizzazione 2 minuti fa</p>
        </div>
        <div className="nb-ncStatusStats">
          <div>
            <strong>26</strong>
            <span>notifiche oggi</span>
          </div>
          <div>
            <strong>0</strong>
            <span>errori critici</span>
          </div>
          <div>
            <CheckCircle2 className="nb-ncStatusOk" aria-hidden={true} />
            <span>Canali attivi</span>
          </div>
        </div>
      </article>

      <div className="nb-ncGrid">
        <NotifSection title="Business" caption="Eventi operativi del centro">
          {BUSINESS.map((item) => (
            <NotifRow
              key={item.id}
              item={item}
              on={Boolean(enabled[item.id])}
              onToggle={() => toggle(item.id)}
            />
          ))}
        </NotifSection>

        <NotifSection title="Staff" caption="Team, turni e accessi">
          {STAFF.map((item) => (
            <NotifRow
              key={item.id}
              item={item}
              on={Boolean(enabled[item.id])}
              onToggle={() => toggle(item.id)}
            />
          ))}
        </NotifSection>

        <NotifSection title="Magazzino" caption="Scorta, lotti e riordini">
          {INVENTORY.map((item) => (
            <NotifRow
              key={item.id}
              item={item}
              on={Boolean(enabled[item.id])}
              onToggle={() => toggle(item.id)}
            />
          ))}
        </NotifSection>

        <article className="nb-ncSmart">
          <div className="nb-ncSmartTop">
            <div>
              <h3 className="nb-ncSectionTitle">Smart Alerts</h3>
              <p className="nb-ncSectionCap">
                NovaBeauty monitora automaticamente l&apos;attività del centro.
              </p>
            </div>
            <span className="nb-ncAiBadge">
              <Sparkles className="nb-ncAiIcon" aria-hidden={true} />
              Future AI
            </span>
          </div>
          <ul className="nb-ncSmartList">
            {SMART_ALERTS.map((alert) => (
              <li key={alert}>
                <span className="nb-ncSmartDot" aria-hidden={true} />
                <span className="nb-ncSmartLabel">{alert}</span>
                <button
                  type="button"
                  className={clsx("nb-ncToggle", smartOn[alert] && "isOn")}
                  aria-pressed={Boolean(smartOn[alert])}
                  onClick={() => setSmartOn((p) => ({ ...p, [alert]: !p[alert] }))}
                >
                  <span className="nb-ncToggleKnob" />
                </button>
              </li>
            ))}
          </ul>
        </article>

        <article className="nb-ncChannels">
          <h3 className="nb-ncSectionTitle">Canali</h3>
          <p className="nb-ncSectionCap">Dove e come ricevere gli avvisi</p>

          <ChannelGroup title="Desktop">
            {DESKTOP_CHANNELS.map((item) => (
              <NotifRow
                key={item.id}
                item={item}
                on={Boolean(enabled[item.id])}
                onToggle={() => toggle(item.id)}
                compact
              />
            ))}
          </ChannelGroup>

          <ChannelGroup title="Email">
            {EMAIL_CHANNELS.map((item) => (
              <NotifRow
                key={item.id}
                item={item}
                on={Boolean(enabled[item.id])}
                onToggle={() => toggle(item.id)}
                compact
              />
            ))}
          </ChannelGroup>

          <ChannelGroup title="NovaBeauty Staff">
            {STAFF_CHANNELS.map((item) => (
              <NotifRow
                key={item.id}
                item={item}
                on={false}
                onToggle={() => toggle(item.id)}
                onComingSoon={informComingSoon}
                compact
              />
            ))}
          </ChannelGroup>
        </article>

        <article className="nb-ncQuiet">
          <div className="nb-ncQuietTop">
            <div className="nb-ncQuietIcon" aria-hidden={true}>
              <Moon />
            </div>
            <div>
              <h3 className="nb-ncSectionTitle">Orari silenziosi</h3>
              <p className="nb-ncSectionCap">Sospendi gli avvisi non critici</p>
            </div>
            <button
              type="button"
              className={clsx("nb-ncToggle", quietOn && "isOn")}
              aria-pressed={quietOn}
              onClick={() => setQuietOn((v) => !v)}
            >
              <span className="nb-ncToggleKnob" />
              <span className="nb-ncToggleLabel">{quietOn ? "ON" : "OFF"}</span>
            </button>
          </div>

          {quietOn ? (
            <>
              <div className="nb-ncQuietTimes">
                <label>
                  <span>Dalle</span>
                  <input type="time" value={quietFrom} onChange={(e) => setQuietFrom(e.target.value)} />
                </label>
                <span className="nb-ncQuietArrow" aria-hidden={true}>
                  ↓
                </span>
                <label>
                  <span>Alle</span>
                  <input type="time" value={quietTo} onChange={(e) => setQuietTo(e.target.value)} />
                </label>
              </div>
              <div className="nb-ncQuietChecks">
                <QuietCheck
                  label="Weekend"
                  checked={quietWeekend}
                  onChange={setQuietWeekend}
                />
                <QuietCheck
                  label="Festivi"
                  checked={quietHoliday}
                  onChange={setQuietHoliday}
                />
                <QuietCheck
                  label="Durante trattamento"
                  checked={quietTreatment}
                  onChange={setQuietTreatment}
                />
              </div>
            </>
          ) : (
            <p className="nb-ncQuietOff">Modalità silenziosa disattivata · demo</p>
          )}
        </article>

        <article className="nb-ncTimelineCard">
          <div className="nb-ncTimelineHead">
            <h3 className="nb-ncSectionTitle">Cronologia</h3>
            <p className="nb-ncSectionCap">Ultime attività del centro</p>
          </div>
          <ol className="nb-ncTimeline">
            {TIMELINE.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.id} className="nb-ncTimelineItem">
                  <span className="nb-ncTimelineTime">{item.time}</span>
                  <span className={clsx("nb-ncTimelineIcon", `tone-${item.tone}`)}>
                    <Icon aria-hidden={true} />
                  </span>
                  <span className="nb-ncTimelineText">{item.text}</span>
                </li>
              );
            })}
          </ol>
        </article>
      </div>
    </div>
  );
}

function NotifSection({
  title,
  caption,
  children
}: {
  title: string;
  caption: string;
  children: ReactNode;
}) {
  return (
    <section className="nb-ncSection">
      <div className="nb-ncSectionHead">
        <h3 className="nb-ncSectionTitle">{title}</h3>
        <p className="nb-ncSectionCap">{caption}</p>
      </div>
      <div className="nb-ncList">{children}</div>
    </section>
  );
}

function ChannelGroup({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="nb-ncChannelGroup">
      <h4 className="nb-ncChannelTitle">{title}</h4>
      <div className="nb-ncList">{children}</div>
    </div>
  );
}

function NotifRow({
  item,
  on,
  onToggle,
  onComingSoon,
  compact
}: {
  item: NotifItem;
  on: boolean;
  onToggle: () => void;
  onComingSoon?: () => void;
  compact?: boolean;
}) {
  const Icon = item.icon;
  const soon = Boolean(item.comingSoon);

  return (
    <div className={clsx("nb-ncRow", compact && "isCompact", soon && "isSoon")}>
      <span className="nb-ncRowIcon">
        <Icon aria-hidden={true} />
      </span>
      <div className="nb-ncRowBody">
        <div className="nb-ncRowTitle">
          {item.title}
          {soon ? (
            <span className="nb-ncSoon" title={COMING_SOON_MESSAGE}>
              Coming Soon
            </span>
          ) : null}
        </div>
        <p className="nb-ncRowDesc">{item.description}</p>
      </div>
      {soon ? (
        <ComingSoonToggle
          label={item.title}
          onInform={() => onComingSoon?.() ?? onToggle()}
        />
      ) : (
        <button
          type="button"
          className={clsx("nb-ncToggle", on && "isOn")}
          aria-pressed={on}
          aria-label={item.title}
          onClick={onToggle}
        >
          <span className="nb-ncToggleKnob" />
        </button>
      )}
    </div>
  );
}

function QuietCheck({
  label,
  checked,
  onChange
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="nb-ncQuietCheck">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span>{label}</span>
    </label>
  );
}
