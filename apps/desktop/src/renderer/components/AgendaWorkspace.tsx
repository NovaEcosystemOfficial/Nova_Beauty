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
import type { AppointmentSort } from "../../models/Appointment";
import {
  useDemoWorkflow,
  type AppointmentEditDraft,
  type ApptStatus,
  type WorkflowAppointment
} from "../demo/DemoWorkflowContext";
import ClientSheetDrawer from "./ui/ClientSheetDrawer";

type AgendaView = "giorno" | "settimana";
type DemoAppointment = WorkflowAppointment;

const SORT_OPTIONS: Array<{ key: AppointmentSort; label: string }> = [
  { key: "date_asc", label: "Data" },
  { key: "time_asc", label: "Ora" },
  { key: "client_asc", label: "Cliente" },
  { key: "operator_asc", label: "Operatore" }
];

const DAY_START = 8 * 60;
const DAY_END = 20 * 60;
const SLOT_MIN = 30;
const SLOT_PX = 44;
const BASE_DATE = new Date(2026, 7, 5); // mercoledì 5 agosto 2026

const STATUS_LABEL: Record<ApptStatus, string> = {
  confermato: "Confermato",
  da_confermare: "Da confermare",
  completato: "Completato",
  annullato: "Annullato"
};

const IT_WEEKDAYS = [
  "Domenica",
  "Lunedì",
  "Martedì",
  "Mercoledì",
  "Giovedì",
  "Venerdì",
  "Sabato"
];
const IT_WEEKDAYS_SHORT = ["Dom", "Lun", "Mar", "Mer", "Gio", "Ven", "Sab"];
const IT_MONTHS = [
  "gennaio",
  "febbraio",
  "marzo",
  "aprile",
  "maggio",
  "giugno",
  "luglio",
  "agosto",
  "settembre",
  "ottobre",
  "novembre",
  "dicembre"
];

function addDays(base: Date, offset: number): Date {
  const d = new Date(base);
  d.setDate(d.getDate() + offset);
  return d;
}

function formatFullDate(d: Date): string {
  return `${IT_WEEKDAYS[d.getDay()]} ${d.getDate()} ${IT_MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

function formatShortDay(d: Date): string {
  return `${IT_WEEKDAYS_SHORT[d.getDay()]} ${d.getDate()}`;
}

function formatDayFull(d: Date): string {
  return `${IT_WEEKDAYS[d.getDay()]} ${d.getDate()}`;
}

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

function phoneDigits(phone: string): string {
  return phone.replace(/\D/g, "");
}

function waLink(phone: string): string {
  const digits = phoneDigits(phone);
  return `https://wa.me/${digits}`;
}

function telLink(phone: string): string {
  return `tel:+${phoneDigits(phone)}`;
}

const TIME_SLOTS = buildSlots();
const GRID_HEIGHT = ((DAY_END - DAY_START) / SLOT_MIN) * SLOT_PX;

function statusClass(status: ApptStatus): string {
  return `is-${status}`;
}

export default function AgendaWorkspace() {
  const {
    appointments: allAppointments,
    openCompleteDialog,
    openNewAppointment,
    openAppointmentDetail,
    getClient,
    deleteAppointment,
    updateAppointment,
    reloadAppointments
  } = useDemoWorkflow();

  const [view, setView] = useState<AgendaView>("giorno");
  const [focusOffset, setFocusOffset] = useState(0);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"tutti" | ApptStatus>("tutti");
  const [operatorFilter, setOperatorFilter] = useState("tutti");
  const [serviceFilter, setServiceFilter] = useState("tutti");
  const [sort, setSort] = useState<AppointmentSort>("date_asc");
  const [selectedId, setSelectedId] = useState<string | null>("a1");
  const [clientSheetId, setClientSheetId] = useState<string | null>(null);
  const [calendarKey, setCalendarKey] = useState(0);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editDraft, setEditDraft] = useState<AppointmentEditDraft | null>(null);
  const [busy, setBusy] = useState(false);

  const focusDate = useMemo(() => addDays(BASE_DATE, focusOffset), [focusOffset]);
  const dateLabel = formatFullDate(focusDate);
  const weekStart = Math.floor(focusOffset / 7) * 7;

  const weekDays = useMemo(
    () =>
      Array.from({ length: 7 }, (_, i) => {
        const offset = weekStart + i;
        const date = addDays(BASE_DATE, offset);
        return {
          offset,
          label: formatShortDay(date),
          full: formatDayFull(date),
          isToday: offset === 0,
          isFocus: offset === focusOffset
        };
      }),
    [weekStart, focusOffset]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = allAppointments.filter((a) => {
      if (statusFilter !== "tutti" && a.status !== statusFilter) return false;
      if (operatorFilter !== "tutti" && a.operator !== operatorFilter) return false;
      if (serviceFilter !== "tutti" && a.service !== serviceFilter) return false;
      if (view === "giorno" && a.dayOffset !== focusOffset) return false;
      if (view === "settimana") {
        if (a.dayOffset < weekStart || a.dayOffset > weekStart + 6) return false;
      }
      if (!q) return true;
      return (
        a.client.toLowerCase().includes(q) ||
        a.operator.toLowerCase().includes(q) ||
        a.dateLabel.toLowerCase().includes(q) ||
        a.status.toLowerCase().includes(q) ||
        a.service.toLowerCase().includes(q) ||
        a.phone.toLowerCase().includes(q)
      );
    });

    const sorted = [...list];
    sorted.sort((a, b) => {
      switch (sort) {
        case "time_asc":
          return a.startMin - b.startMin || a.dayOffset - b.dayOffset;
        case "client_asc":
          return a.client.localeCompare(b.client, "it") || a.startMin - b.startMin;
        case "operator_asc":
          return a.operator.localeCompare(b.operator, "it") || a.startMin - b.startMin;
        case "date_desc":
          return b.dayOffset - a.dayOffset || b.startMin - a.startMin;
        case "date_asc":
        default:
          return a.dayOffset - b.dayOffset || a.startMin - b.startMin;
      }
    });
    return sorted;
  }, [
    allAppointments,
    query,
    statusFilter,
    operatorFilter,
    serviceFilter,
    view,
    focusOffset,
    weekStart,
    sort
  ]);

  const selected =
    filtered.find((a) => a.id === selectedId) ??
    allAppointments.find((a) => a.id === selectedId && a.dayOffset === focusOffset) ??
    filtered[0] ??
    null;

  const dayStats = useMemo(() => {
    const day = allAppointments.filter((a) => a.dayOffset === focusOffset);
    const confirmed = day.filter((a) => a.status === "confermato").length;
    const pending = day.filter((a) => a.status === "da_confermare").length;
    const completed = day.filter((a) => a.status === "completato").length;
    const cancelled = day.filter((a) => a.status === "annullato").length;
    const expected = day
      .filter((a) => a.status !== "annullato")
      .reduce((s, a) => s + a.price, 0);
    const done = day
      .filter((a) => a.status === "completato")
      .reduce((s, a) => s + a.price, 0);
    return {
      count: day.filter((a) => a.status !== "annullato").length,
      confirmed,
      pending,
      completed,
      cancelled,
      expected: `€${expected}`,
      done: `€${done}`
    };
  }, [allAppointments, focusOffset]);

  const shiftDate = (delta: number) => {
    setFocusOffset((v) => v + delta);
    setCalendarKey((k) => k + 1);
  };

  const goToday = () => {
    setFocusOffset(0);
    setCalendarKey((k) => k + 1);
  };

  const changeView = (next: AgendaView) => {
    setView(next);
    setCalendarKey((k) => k + 1);
  };

  const handleSelect = (id: string) => {
    setSelectedId(id);
  };

  const openEdit = () => {
    if (!selected) return;
    setEditDraft({
      clientId: selected.clientId,
      client: selected.client,
      phone: selected.phone,
      email: selected.email,
      operator: selected.operator,
      cabin: selected.cabin,
      service: selected.service,
      dateLabel: selected.dateLabel,
      timeLabel: selected.timeLabel,
      durationMin: selected.durationMin,
      price: selected.price,
      notes: selected.notes,
      status: selected.status,
      dayOffset: selected.dayOffset
    });
    setEditOpen(true);
  };

  const saveEdit = async () => {
    if (!selected || !editDraft || busy) return;
    setBusy(true);
    const ok = await updateAppointment(selected.id, editDraft);
    setBusy(false);
    if (ok) setEditOpen(false);
  };

  const confirmDelete = async () => {
    if (!selected || busy) return;
    setBusy(true);
    const id = selected.id;
    const ok = await deleteAppointment(id);
    setBusy(false);
    if (ok) {
      setDeleteOpen(false);
      setSelectedId(null);
    }
  };

  const onSortChange = (next: AppointmentSort) => {
    setSort(next);
    void reloadAppointments({ sort: next });
  };

  const sheetClient = clientSheetId ? getClient(clientSheetId) ?? null : null;

  return (
    <div className="nb-agendaWs" role="region" aria-label="Workspace Agenda">
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
          <button
            type="button"
            className="nb-agIconBtn"
            aria-label={view === "settimana" ? "Settimana precedente" : "Giorno precedente"}
            onClick={() => shiftDate(view === "settimana" ? -7 : -1)}
          >
            <ChevronLeft className="nb-agIcon" aria-hidden={true} />
          </button>
          <button type="button" className="nb-agDateBtn" onClick={goToday} title="Torna a oggi">
            <Clock className="nb-agDateIcon" aria-hidden={true} />
            <span key={dateLabel} className="nb-agDateLabel">
              {dateLabel}
            </span>
          </button>
          <button
            type="button"
            className="nb-agIconBtn"
            aria-label={view === "settimana" ? "Settimana successiva" : "Giorno successivo"}
            onClick={() => shiftDate(view === "settimana" ? 7 : 1)}
          >
            <ChevronRight className="nb-agIcon" aria-hidden={true} />
          </button>
          <button
            type="button"
            className={clsx("nb-agTodayBtn", focusOffset === 0 && "isActive")}
            onClick={goToday}
          >
            Oggi
          </button>
        </div>

        <div className="nb-agViewToggle" role="group" aria-label="Vista calendario">
          <button
            type="button"
            className={clsx("nb-agViewBtn", view === "giorno" && "isActive")}
            onClick={() => changeView("giorno")}
          >
            Giorno
          </button>
          <button
            type="button"
            className={clsx("nb-agViewBtn", view === "settimana" && "isActive")}
            onClick={() => changeView("settimana")}
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

          <label className="nb-agSelectWrap">
            <span className="nb-agSelectLabel">Ordina</span>
            <select
              className="nb-agSelect"
              value={sort}
              onChange={(e) => onSortChange(e.target.value as AppointmentSort)}
              aria-label="Ordina appuntamenti"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.key} value={opt.key}>
                  {opt.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      <div className="nb-agBody">
        <section className="nb-agCalendar" aria-label="Griglia agenda">
          <div key={`${view}-${calendarKey}`} className="nb-agCalendarPane">
            {view === "giorno" ? (
              <DayGrid
                appointments={filtered}
                selectedId={selected?.id ?? null}
                onSelect={handleSelect}
                dateLabel={dateLabel}
                isToday={focusOffset === 0}
              />
            ) : (
              <WeekGrid
                appointments={filtered}
                selectedId={selected?.id ?? null}
                onSelect={handleSelect}
                weekDays={weekDays}
                onSelectDay={(offset) => {
                  setFocusOffset(offset);
                  setView("giorno");
                  setCalendarKey((k) => k + 1);
                }}
              />
            )}
          </div>
        </section>

        <aside className="nb-agAside">
          <div className="nb-agInspector">
            {selected ? (
              <AppointmentInspector
                appointment={selected}
                onOpenClientSheet={() => setClientSheetId(selected.clientId)}
                onComplete={() => {
                  openAppointmentDetail(selected.id);
                  openCompleteDialog();
                }}
                onNewAppointment={() => openNewAppointment(selected.clientId)}
                onEdit={openEdit}
                onDelete={() => setDeleteOpen(true)}
              />
            ) : (
              <div className="nb-agInspectorEmpty">
                <p>Seleziona un appuntamento nella griglia</p>
              </div>
            )}
          </div>

          <div className="nb-agMiniDash" aria-label="Riepilogo giornaliero">
            <div className="nb-agMiniDashTitle">
              {focusOffset === 0 ? "Riepilogo oggi" : "Riepilogo giorno"}
            </div>
            <div className="nb-agMiniDashGrid" key={`stats-${focusOffset}-${dayStats.completed}`}>
              <MiniStat label="Appuntamenti" value={String(dayStats.count)} />
              <MiniStat label="Incasso previsto" value={dayStats.expected} />
              <MiniStat label="Incasso completato" value={dayStats.done} />
              <MiniStat label="Confermati" value={String(dayStats.confirmed)} tone="mint" />
              <MiniStat label="Da confermare" value={String(dayStats.pending)} tone="gold" />
              <MiniStat label="Annullati" value={String(dayStats.cancelled)} tone="danger" />
            </div>
          </div>
        </aside>
      </div>

      <ClientSheetDrawer
        open={Boolean(clientSheetId)}
        client={sheetClient}
        appointments={allAppointments}
        onClose={() => setClientSheetId(null)}
      />

      {editOpen && editDraft && selected ? (
        <div className="nb-dialogRoot isOpen" role="presentation">
          <button
            type="button"
            className="nb-dialogBackdrop"
            aria-label="Annulla"
            onClick={() => setEditOpen(false)}
          />
          <div
            className="nb-dialogCard"
            role="dialog"
            aria-modal="true"
            aria-label="Modifica appuntamento"
          >
            <h2 className="nb-dialogTitle">Modifica appuntamento</h2>
            <p className="nb-dialogSub">{selected.client}</p>
            <div className="nb-drawerForm">
              <label className="nb-drawerField">
                <span className="nb-drawerFieldLabel">Ora</span>
                <input
                  className="nb-drawerInput"
                  value={editDraft.timeLabel}
                  onChange={(e) => setEditDraft({ ...editDraft, timeLabel: e.target.value })}
                />
              </label>
              <label className="nb-drawerField">
                <span className="nb-drawerFieldLabel">Operatore</span>
                <select
                  className="nb-drawerInput"
                  value={editDraft.operator}
                  onChange={(e) => setEditDraft({ ...editDraft, operator: e.target.value })}
                >
                  <option value="Fabio">Fabio</option>
                  <option value="Laura">Laura</option>
                </select>
              </label>
              <label className="nb-drawerField">
                <span className="nb-drawerFieldLabel">Cabina</span>
                <input
                  className="nb-drawerInput"
                  value={editDraft.cabin}
                  onChange={(e) => setEditDraft({ ...editDraft, cabin: e.target.value })}
                />
              </label>
              <label className="nb-drawerField">
                <span className="nb-drawerFieldLabel">Stato</span>
                <select
                  className="nb-drawerInput"
                  value={editDraft.status}
                  onChange={(e) =>
                    setEditDraft({ ...editDraft, status: e.target.value as ApptStatus })
                  }
                >
                  <option value="confermato">Confermato</option>
                  <option value="da_confermare">Da confermare</option>
                  <option value="completato">Completato</option>
                  <option value="annullato">Annullato</option>
                </select>
              </label>
              <label className="nb-drawerField">
                <span className="nb-drawerFieldLabel">Note</span>
                <textarea
                  className="nb-drawerInput"
                  rows={3}
                  value={editDraft.notes}
                  onChange={(e) => setEditDraft({ ...editDraft, notes: e.target.value })}
                />
              </label>
            </div>
            <div className="nb-dialogActions">
              <button type="button" className="nb-ghostBtn" onClick={() => setEditOpen(false)}>
                Annulla
              </button>
              <button
                type="button"
                className="nb-newBtn"
                disabled={busy}
                onClick={() => void saveEdit()}
              >
                Salva
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {deleteOpen && selected ? (
        <div className="nb-dialogRoot isOpen" role="presentation">
          <button
            type="button"
            className="nb-dialogBackdrop"
            aria-label="Annulla"
            onClick={() => setDeleteOpen(false)}
          />
          <div
            className="nb-dialogCard"
            role="dialog"
            aria-modal="true"
            aria-label="Elimina appuntamento"
          >
            <h2 className="nb-dialogTitle">Eliminare l&apos;appuntamento?</h2>
            <p className="nb-dialogSub">
              “{selected.client} · {selected.timeLabel}” verrà rimosso dal database locale.
            </p>
            <div className="nb-dialogActions">
              <button type="button" className="nb-ghostBtn" onClick={() => setDeleteOpen(false)}>
                Annulla
              </button>
              <button
                type="button"
                className="nb-newBtn"
                disabled={busy}
                onClick={() => void confirmDelete()}
              >
                Elimina
              </button>
            </div>
          </div>
        </div>
      ) : null}
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
          <span
            key={`${appt.id}-${appt.status}`}
            className={clsx(
              "nb-agApptStatus",
              statusClass(appt.status),
              appt.justCompleted && "isFlip"
            )}
          >
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
  onSelect,
  dateLabel,
  isToday
}: {
  appointments: DemoAppointment[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  dateLabel: string;
  isToday: boolean;
}) {
  return (
    <div className="nb-agDay">
      <div className="nb-agDayHead">
        <div className="nb-agTimeGutterHead" />
        <div className="nb-agDayHeadLabel">
          <span className="nb-agDayHeadTitle">{dateLabel}</span>
          <span className="nb-agDayHeadSub">
            {isToday ? "Vista giorno · oggi" : "Vista giorno"}
          </span>
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
          <div className="nb-agLane" data-drop-zone="true" style={{ height: GRID_HEIGHT }}>
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
  onSelect,
  weekDays,
  onSelectDay
}: {
  appointments: DemoAppointment[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  weekDays: Array<{
    offset: number;
    label: string;
    full: string;
    isToday: boolean;
    isFocus: boolean;
  }>;
  onSelectDay: (offset: number) => void;
}) {
  return (
    <div className="nb-agWeek">
      <div className="nb-agWeekHead">
        <div className="nb-agTimeGutterHead" />
        {weekDays.map((d) => (
          <button
            key={d.offset}
            type="button"
            className={clsx(
              "nb-agWeekDayHead",
              d.isToday && "isToday",
              d.isFocus && "isFocus"
            )}
            onClick={() => onSelectDay(d.offset)}
          >
            <span className="nb-agWeekDayLabel">{d.label}</span>
            <span className="nb-agWeekDayFull">{d.full}</span>
          </button>
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
          {weekDays.map((d) => (
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
  onOpenClientSheet,
  onComplete,
  onNewAppointment,
  onEdit,
  onDelete
}: {
  appointment: DemoAppointment;
  onOpenClientSheet: () => void;
  onComplete: () => void;
  onNewAppointment: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const start = apptStartClock(appointment.startMin);
  const end = apptEndClock(appointment.startMin, appointment.durationMin);
  const [completePulse, setCompletePulse] = useState(false);

  const handleComplete = () => {
    setCompletePulse(true);
    window.setTimeout(() => setCompletePulse(false), 420);
    onComplete();
  };

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
          <span
            key={`${appointment.id}-${appointment.status}`}
            className={clsx(
              "nb-agApptStatus",
              statusClass(appointment.status),
              (appointment.justCompleted || completePulse) && "isFlip"
            )}
          >
            {STATUS_LABEL[appointment.status]}
          </span>
        </div>
      </div>

      <div className="nb-agInspFields">
        <Field label="Data" value={appointment.dateLabel} />
        <Field label="Ora" value={`${start} – ${end}`} />
        <Field label="Operatore" value={appointment.operator} />
        <Field label="Cabina" value={appointment.cabin} />
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
        <a
          className="nb-agContactBtn"
          href={telLink(appointment.phone)}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Chiama ${appointment.client}`}
        >
          <Phone className="nb-agContactIcon" aria-hidden={true} />
          Telefono
        </a>
        <a
          className="nb-agContactBtn"
          href={waLink(appointment.phone)}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`WhatsApp ${appointment.client}`}
        >
          <MessageSquare className="nb-agContactIcon" aria-hidden={true} />
          WhatsApp
        </a>
        <a
          className="nb-agContactBtn"
          href={`mailto:${appointment.email}`}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Email ${appointment.client}`}
        >
          <Mail className="nb-agContactIcon" aria-hidden={true} />
          Email
        </a>
      </div>

      <div className="nb-agInspActions">
        <button type="button" className="nb-agActionBtn" onClick={onOpenClientSheet}>
          <Pencil className="nb-agActionIcon" aria-hidden={true} />
          Scheda
        </button>
        <button
          type="button"
          className={clsx("nb-agActionBtn mint", completePulse && "isPulseClick")}
          disabled={appointment.status === "completato" || appointment.status === "annullato"}
          onClick={handleComplete}
        >
          <Check className="nb-agActionIcon" aria-hidden={true} />
          Completa
        </button>
        <button type="button" className="nb-agActionBtn" onClick={onEdit}>
          <Pencil className="nb-agActionIcon" aria-hidden={true} />
          Modifica
        </button>
        <button type="button" className="nb-agActionBtn danger" onClick={onDelete}>
          <Trash2 className="nb-agActionIcon" aria-hidden={true} />
          Elimina
        </button>
        <button type="button" className="nb-agActionBtn primary" onClick={onNewAppointment}>
          <CalendarPlus className="nb-agActionIcon" aria-hidden={true} />
          Nuovo appuntamento
        </button>
      </div>

      <div className="nb-agInspHint">
        <User className="nb-agInspHintIcon" aria-hidden={true} />
        Seleziona una card per ispezionare l&apos;appuntamento
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
