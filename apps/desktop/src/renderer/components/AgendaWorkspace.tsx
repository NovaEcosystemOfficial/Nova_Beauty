import {
  CalendarPlus,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  Mail,
  MessageSquare,
  Pencil,
  Phone,
  Search,
  Trash2,
  User
} from "lucide-react";
import clsx from "clsx";
import { useMemo, useState } from "react";
import {
  useDemoWorkflow,
  type ApptStatus,
  type WorkflowAppointment
} from "../demo/DemoWorkflowContext";

type AgendaView = "giorno" | "settimana";
type DemoAppointment = WorkflowAppointment;

const DAY_START = 8 * 60;
const DAY_END = 20 * 60;
const SLOT_MIN = 30;
const SLOT_PX = 44;

const STATUS_LABEL: Record<ApptStatus, string> = {
  confermato: "Confermato",
  da_confermare: "Da confermare",
  completato: "Completato",
  annullato: "Annullato"
};

const WEEK_DAYS = [
  { offset: 0, label: "Mer 5", full: "Mercoledì 5" },
  { offset: 1, label: "Gio 6", full: "Giovedì 6" },
  { offset: 2, label: "Ven 7", full: "Venerdì 7" },
  { offset: 3, label: "Sab 8", full: "Sabato 8" },
  { offset: 4, label: "Dom 9", full: "Domenica 9" },
  { offset: 5, label: "Lun 10", full: "Lunedì 10" },
  { offset: 6, label: "Mar 11", full: "Martedì 11" }
];

function formatTime(minFromMidnight: number): string {
  const h = Math.floor(minFromMidnight / 60);
  const m = minFromMidnight % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

function apptStartClock(startMin: number): string {
  return formatTime(DAY_START + startMin);
}

function apptEndClock(startMin: number, durationMin: number): string {
  return formatTime(DAY_START + startMin + durationMin);
}

function buildSlots(): string[] {
  const slots: string[] = [];
  for (let t = DAY_START; t < DAY_END; t += SLOT_MIN) {
    slots.push(formatTime(t));
  }
  return slots;
}

const TIME_SLOTS = buildSlots();
const GRID_HEIGHT = ((DAY_END - DAY_START) / SLOT_MIN) * SLOT_PX;

function statusClass(status: ApptStatus): string {
  return `is-${status}`;
}

export default function AgendaWorkspace() {
  const {
    appointments: allAppointments,
    openAppointmentDetail,
    openCompleteDialog,
    detailApptId,
    revenueCompleted,
    appointmentsToday
  } = useDemoWorkflow();

  const [view, setView] = useState<AgendaView>("giorno");
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"tutti" | ApptStatus>("tutti");
  const [operatorFilter, setOperatorFilter] = useState("tutti");
  const [serviceFilter, setServiceFilter] = useState("tutti");
  const [selectedId, setSelectedId] = useState<string | null>("a1");
  const [dateLabel] = useState("Mercoledì 5 agosto 2026");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return allAppointments.filter((a) => {
      if (statusFilter !== "tutti" && a.status !== statusFilter) return false;
      if (operatorFilter !== "tutti" && a.operator !== operatorFilter) return false;
      if (serviceFilter !== "tutti" && a.service !== serviceFilter) return false;
      if (view === "giorno" && a.dayOffset !== 0) return false;
      if (!q) return true;
      return (
        a.client.toLowerCase().includes(q) ||
        a.service.toLowerCase().includes(q) ||
        a.phone.toLowerCase().includes(q)
      );
    });
  }, [allAppointments, query, statusFilter, operatorFilter, serviceFilter, view]);

  const selected =
    filtered.find((a) => a.id === (detailApptId ?? selectedId)) ??
    filtered.find((a) => a.id === selectedId) ??
    filtered[0] ??
    null;

  const todayStats = useMemo(() => {
    const today = allAppointments.filter((a) => a.dayOffset === 0);
    const confirmed = today.filter((a) => a.status === "confermato").length;
    const pending = today.filter((a) => a.status === "da_confermare").length;
    const cancelled = today.filter((a) => a.status === "annullato").length;
    const expected = today
      .filter((a) => a.status !== "annullato")
      .reduce((s, a) => s + a.price, 0);
    return {
      count: appointmentsToday,
      confirmed,
      pending,
      cancelled,
      expected: `€${expected}`,
      done: `€${revenueCompleted}`
    };
  }, [allAppointments, appointmentsToday, revenueCompleted]);

  const handleSelect = (id: string) => {
    setSelectedId(id);
    openAppointmentDetail(id);
  };

  return (
    <div className="nb-agendaWs" role="region" aria-label="Workspace Agenda">
      {/* Toolbar superiore agenda */}
      <div className="nb-agToolbar">
        <div className="nb-agSearch">
          <Search className="nb-agSearchIcon" aria-hidden={true} />
          <input
            className="nb-agSearchInput"
            placeholder="Cerca appuntamenti o clienti…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Cerca appuntamenti"
          />
        </div>

        <div className="nb-agDateNav" aria-label="Selettore data">
          <button type="button" className="nb-agIconBtn" disabled aria-label="Giorno precedente">
            <ChevronLeft className="nb-agIcon" aria-hidden={true} />
          </button>
          <button type="button" className="nb-agDateBtn" disabled>
            <Clock className="nb-agDateIcon" aria-hidden={true} />
            {dateLabel}
          </button>
          <button type="button" className="nb-agIconBtn" disabled aria-label="Giorno successivo">
            <ChevronRight className="nb-agIcon" aria-hidden={true} />
          </button>
          <button type="button" className="nb-agTodayBtn" disabled>
            Oggi
          </button>
        </div>

        <div className="nb-agViewToggle" role="group" aria-label="Vista calendario">
          <button
            type="button"
            className={clsx("nb-agViewBtn", view === "giorno" && "isActive")}
            onClick={() => setView("giorno")}
          >
            Giorno
          </button>
          <button
            type="button"
            className={clsx("nb-agViewBtn", view === "settimana" && "isActive")}
            onClick={() => setView("settimana")}
          >
            Settimana
          </button>
        </div>

        <div className="nb-agFilters">
          <label className="nb-agSelectWrap">
            <span className="nb-agSelectLabel">Stato</span>
            <select
              className="nb-agSelect"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as "tutti" | ApptStatus)}
            >
              <option value="tutti">Tutti</option>
              <option value="confermato">Confermato</option>
              <option value="da_confermare">Da confermare</option>
              <option value="completato">Completato</option>
              <option value="annullato">Annullato</option>
            </select>
          </label>

          <label className="nb-agSelectWrap">
            <span className="nb-agSelectLabel">Operatore</span>
            <select
              className="nb-agSelect"
              value={operatorFilter}
              onChange={(e) => setOperatorFilter(e.target.value)}
            >
              <option value="tutti">Tutti</option>
              <option value="Fabio">Fabio</option>
              <option value="Laura">Laura</option>
            </select>
          </label>

          <label className="nb-agSelectWrap">
            <span className="nb-agSelectLabel">Servizio</span>
            <select
              className="nb-agSelect"
              value={serviceFilter}
              onChange={(e) => setServiceFilter(e.target.value)}
            >
              <option value="tutti">Tutti</option>
              <option value="Pulizia viso deep">Pulizia viso</option>
              <option value="Massaggio rilassante">Massaggio</option>
              <option value="Epilazione gambe">Epilazione</option>
              <option value="Trucco permanente">PMU</option>
            </select>
          </label>
        </div>
      </div>

      <div className="nb-agBody">
        {/* Calendario centrale */}
        <section className="nb-agCalendar" aria-label="Griglia agenda">
          {view === "giorno" ? (
            <DayGrid
              appointments={filtered}
              selectedId={selected?.id ?? null}
              onSelect={handleSelect}
            />
          ) : (
            <WeekGrid
              appointments={filtered}
              selectedId={selected?.id ?? null}
              onSelect={handleSelect}
            />
          )}
        </section>

        {/* Pannello destro */}
        <aside className="nb-agAside">
          <div className="nb-agInspector">
            {selected ? (
              <AppointmentInspector
                appointment={selected}
                onOpenDetail={() => openAppointmentDetail(selected.id)}
                onComplete={() => {
                  openAppointmentDetail(selected.id);
                  openCompleteDialog();
                }}
              />
            ) : (
              <div className="nb-agInspectorEmpty">
                <p>Seleziona un appuntamento nella griglia</p>
              </div>
            )}
          </div>

          <div className="nb-agMiniDash" aria-label="Riepilogo giornaliero">
            <div className="nb-agMiniDashTitle">Riepilogo oggi</div>
            <div className="nb-agMiniDashGrid">
              <MiniStat label="Appuntamenti" value={String(todayStats.count)} />
              <MiniStat label="Incasso previsto" value={todayStats.expected} />
              <MiniStat label="Incasso completato" value={todayStats.done} />
              <MiniStat label="Confermati" value={String(todayStats.confirmed)} tone="mint" />
              <MiniStat label="Da confermare" value={String(todayStats.pending)} tone="gold" />
              <MiniStat label="Annullati" value={String(todayStats.cancelled)} tone="danger" />
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function MiniStat({
  label,
  value,
  tone
}: {
  label: string;
  value: string;
  tone?: "mint" | "gold" | "danger";
}) {
  return (
    <div className={clsx("nb-agMiniStat", tone && `tone-${tone}`)}>
      <span className="nb-agMiniStatLabel">{label}</span>
      <span className="nb-agMiniStatValue">{value}</span>
    </div>
  );
}

function AppointmentCard({
  appt,
  selected,
  onSelect,
  compact
}: {
  appt: DemoAppointment;
  selected: boolean;
  onSelect: (id: string) => void;
  compact?: boolean;
}) {
  const start = apptStartClock(appt.startMin);
  const end = apptEndClock(appt.startMin, appt.durationMin);

  return (
    <button
      type="button"
      className={clsx(
        "nb-agAppt",
        statusClass(appt.status),
        selected && "isSelected",
        compact && "isCompact",
        appt.isNew && "isAppear",
        appt.justCompleted && "isJustDone"
      )}
      style={{
        top: (appt.startMin / SLOT_MIN) * SLOT_PX,
        height: Math.max((appt.durationMin / SLOT_MIN) * SLOT_PX - 4, 28)
      }}
      onClick={() => onSelect(appt.id)}
      data-draggable="true"
      data-appt-id={appt.id}
      aria-pressed={selected}
      title={`${appt.client} · ${start}–${end}`}
    >
      <span className="nb-agApptGrip" aria-hidden={true} />
      <span className="nb-agApptBody">
        <span className="nb-agApptClient">{appt.client}</span>
        {!compact ? <span className="nb-agApptService">{appt.service}</span> : null}
        <span className="nb-agApptMeta">
          <span>
            {start}–{end}
          </span>
          <span className={clsx("nb-agApptStatus", statusClass(appt.status))}>
            {STATUS_LABEL[appt.status]}
          </span>
        </span>
      </span>
    </button>
  );
}

function DayGrid({
  appointments,
  selectedId,
  onSelect
}: {
  appointments: DemoAppointment[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="nb-agDay">
      <div className="nb-agDayHead">
        <div className="nb-agTimeGutterHead" />
        <div className="nb-agDayHeadLabel">
          <span className="nb-agDayHeadTitle">Cabina / Studio</span>
          <span className="nb-agDayHeadSub">Vista giorno · demo</span>
        </div>
      </div>
      <div className="nb-agDayScroll">
        <div className="nb-agDayGrid" style={{ height: GRID_HEIGHT }}>
          <div className="nb-agTimeGutter" aria-hidden={true}>
            {TIME_SLOTS.map((slot) => (
              <div key={slot} className="nb-agTimeSlot" style={{ height: SLOT_PX }}>
                {slot.endsWith(":00") ? <span>{slot}</span> : null}
              </div>
            ))}
          </div>
          <div
            className="nb-agLane"
            data-drop-zone="true"
            style={{ height: GRID_HEIGHT }}
          >
            {TIME_SLOTS.map((slot) => (
              <div
                key={slot}
                className={clsx("nb-agLaneRow", slot.endsWith(":00") && "isHour")}
                style={{ height: SLOT_PX }}
              />
            ))}
            {appointments.map((appt) => (
              <AppointmentCard
                key={appt.id}
                appt={appt}
                selected={appt.id === selectedId}
                onSelect={onSelect}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function WeekGrid({
  appointments,
  selectedId,
  onSelect
}: {
  appointments: DemoAppointment[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="nb-agWeek">
      <div className="nb-agWeekHead">
        <div className="nb-agTimeGutterHead" />
        {WEEK_DAYS.map((d) => (
          <div key={d.offset} className={clsx("nb-agWeekDayHead", d.offset === 0 && "isToday")}>
            <span className="nb-agWeekDayLabel">{d.label}</span>
            <span className="nb-agWeekDayFull">{d.full}</span>
          </div>
        ))}
      </div>
      <div className="nb-agWeekScroll">
        <div className="nb-agWeekGrid" style={{ height: GRID_HEIGHT }}>
          <div className="nb-agTimeGutter" aria-hidden={true}>
            {TIME_SLOTS.map((slot) => (
              <div key={slot} className="nb-agTimeSlot" style={{ height: SLOT_PX }}>
                {slot.endsWith(":00") ? <span>{slot}</span> : null}
              </div>
            ))}
          </div>
          {WEEK_DAYS.map((d) => (
            <div
              key={d.offset}
              className="nb-agLane nb-agWeekLane"
              data-drop-zone="true"
              data-day-offset={d.offset}
              style={{ height: GRID_HEIGHT }}
            >
              {TIME_SLOTS.map((slot) => (
                <div
                  key={slot}
                  className={clsx("nb-agLaneRow", slot.endsWith(":00") && "isHour")}
                  style={{ height: SLOT_PX }}
                />
              ))}
              {appointments
                .filter((a) => a.dayOffset === d.offset)
                .map((appt) => (
                  <AppointmentCard
                    key={appt.id}
                    appt={appt}
                    selected={appt.id === selectedId}
                    onSelect={onSelect}
                    compact
                  />
                ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function AppointmentInspector({
  appointment,
  onOpenDetail,
  onComplete
}: {
  appointment: DemoAppointment;
  onOpenDetail: () => void;
  onComplete: () => void;
}) {
  const start = apptStartClock(appointment.startMin);
  const end = apptEndClock(appointment.startMin, appointment.durationMin);

  return (
    <>
      <div className="nb-agInspHead">
        <div className="nb-agInspAvatar" aria-hidden={true}>
          {appointment.client
            .split(" ")
            .slice(0, 2)
            .map((p) => p[0])
            .join("")}
        </div>
        <div className="nb-agInspTitleBlock">
          <h2 className="nb-agInspName">{appointment.client}</h2>
          <p className="nb-agInspService">{appointment.service}</p>
          <span className={clsx("nb-agApptStatus", statusClass(appointment.status))}>
            {STATUS_LABEL[appointment.status]}
          </span>
        </div>
      </div>

      <div className="nb-agInspFields">
        <Field label="Data" value={appointment.dateLabel} />
        <Field label="Ora" value={`${start} – ${end}`} />
        <Field label="Operatore" value={appointment.operator} />
        <Field label="Cabina" value={appointment.cabin} />
        <Field label="Telefono" value={appointment.phone} />
        <Field label="Email" value={appointment.email} />
      </div>

      <div className="nb-agInspBlock">
        <div className="nb-agInspBlockLabel">Note</div>
        <p className="nb-agInspBlockText">{appointment.notes}</p>
      </div>

      <div className="nb-agInspBlock">
        <div className="nb-agInspBlockLabel">Storico</div>
        <p className="nb-agInspBlockText">{appointment.history}</p>
      </div>

      <div className="nb-agInspContacts">
        <button type="button" className="nb-agContactBtn" disabled>
          <Phone className="nb-agContactIcon" aria-hidden={true} />
          Telefono
        </button>
        <button type="button" className="nb-agContactBtn" disabled>
          <MessageSquare className="nb-agContactIcon" aria-hidden={true} />
          WhatsApp
        </button>
        <button type="button" className="nb-agContactBtn" disabled>
          <Mail className="nb-agContactIcon" aria-hidden={true} />
          Email
        </button>
      </div>

      <div className="nb-agInspActions">
        <button type="button" className="nb-agActionBtn" onClick={onOpenDetail}>
          <Pencil className="nb-agActionIcon" aria-hidden={true} />
          Scheda
        </button>
        <button
          type="button"
          className="nb-agActionBtn mint"
          disabled={appointment.status === "completato"}
          onClick={onComplete}
        >
          <Check className="nb-agActionIcon" aria-hidden={true} />
          Completa
        </button>
        <button type="button" className="nb-agActionBtn danger" disabled>
          <Trash2 className="nb-agActionIcon" aria-hidden={true} />
          Elimina
        </button>
        <button type="button" className="nb-agActionBtn primary" disabled>
          <CalendarPlus className="nb-agActionIcon" aria-hidden={true} />
          Nuovo appuntamento
        </button>
      </div>

      <div className="nb-agInspHint">
        <User className="nb-agInspHintIcon" aria-hidden={true} />
        Workflow demo — click card apre drawer destro
      </div>
    </>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="nb-agField">
      <span className="nb-agFieldLabel">{label}</span>
      <span className="nb-agFieldValue">{value}</span>
    </div>
  );
}
