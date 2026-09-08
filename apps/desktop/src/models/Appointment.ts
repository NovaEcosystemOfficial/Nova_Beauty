/**
 * Model Appuntamento — tabella `appointments`.
 *
 * Sprint 3: campi dominio (cliente, operatore, servizio, titolo, data, orari, stato)
 * + campi denormalizzati UI demo (nomi, cabina, prezzo, dayOffset…).
 *
 * Stato dominio: prenotato | confermato | completato | annullato.
 * UI Agenda usa `da_confermare` come etichetta di `prenotato` (nessuna regressione CSS).
 */
import { createEntityId, nowIso, readNumber, readString, type SqlMap } from "../core/types";
import type { EntityTimestamps } from "./BaseEntity";

/** Stati persistiti in SQLite (Sprint 3). */
export type AppointmentStatus = "prenotato" | "confermato" | "completato" | "annullato";

/** Stato sync locale → cloud (Firestore futuro). */
export type AppointmentSyncStatus = "local" | "pending_push" | "synced" | "conflict";

export type AppointmentData = EntityTimestamps & {
  clientId: string;
  clientName: string;
  serviceId: string;
  serviceName: string;
  operatorId: string;
  operatorName: string;
  /** Titolo appuntamento (default = nome servizio). */
  title: string;
  cabin: string;
  /** Data calendario YYYY-MM-DD. */
  dateIso: string;
  /** Etichetta data UI (es. "Mer 5 ago 2026"). */
  dateLabel: string;
  /** Ora inizio HH:MM. */
  startTime: string;
  /** Ora fine HH:MM. */
  endTime: string;
  /** Alias UI di startTime. */
  timeLabel: string;
  durationMin: number;
  /** Offset giorni rispetto alla data base demo (UI agenda). */
  dayOffset: number;
  /** Minuti dall’apertura studio (08:00) per layout timeline. */
  startMin: number;
  price: number;
  phone: string;
  email: string;
  status: AppointmentStatus;
  notes: string;
  history: string;
  lastTreatment: string;
  syncStatus: AppointmentSyncStatus;
};

/** Ordinamenti lista appuntamenti. */
export type AppointmentSort =
  | "date_asc"
  | "date_desc"
  | "time_asc"
  | "time_desc"
  | "client_asc"
  | "operator_asc";

/** Query lista / ricerca. */
export type AppointmentListQuery = {
  search?: string;
  clientId?: string;
  operatorId?: string;
  /** Filtro per nome operatore (UI). */
  operatorName?: string;
  dateIso?: string;
  status?: AppointmentStatus | "tutti";
  sort?: AppointmentSort;
};

export type AppointmentCreateInput = {
  clientId: string;
  clientName?: string;
  serviceId?: string;
  serviceName?: string;
  operatorId?: string;
  operatorName?: string;
  title?: string;
  cabin?: string;
  dateIso?: string;
  dateLabel: string;
  startTime: string;
  endTime?: string;
  timeLabel?: string;
  durationMin?: number;
  dayOffset?: number;
  startMin?: number;
  price?: number;
  phone?: string;
  email?: string;
  status?: AppointmentStatus;
  notes?: string;
  history?: string;
  lastTreatment?: string;
};

export type AppointmentUpdateInput = Partial<AppointmentCreateInput> & {
  id: string;
};

/** Mappa stato UI Agenda ↔ dominio SQLite. */
export function uiStatusToDomain(
  status: string
): AppointmentStatus {
  if (status === "da_confermare" || status === "previsto" || status === "prenotato") {
    return "prenotato";
  }
  if (status === "confermato" || status === "completato" || status === "annullato") {
    return status;
  }
  return "prenotato";
}

/** Dominio → etichetta/CSS UI (da_confermare per prenotato). */
export function domainStatusToUi(
  status: string
): "da_confermare" | "confermato" | "completato" | "annullato" {
  const domain = uiStatusToDomain(status);
  if (domain === "prenotato") return "da_confermare";
  return domain;
}

/** Parse "HH:MM" → minuti da mezzanotte. */
export function parseClockToMinutes(time: string): number {
  const m = /^(\d{1,2}):(\d{2})$/.exec(time.trim());
  if (!m) return 0;
  return Number(m[1]) * 60 + Number(m[2]);
}

/** Minuti da mezzanotte → "HH:MM". */
export function minutesToClock(total: number): string {
  const h = Math.floor(total / 60) % 24;
  const m = ((total % 60) + 60) % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

/** startMin UI (da 08:00) → HH:MM. */
export function startMinToClock(startMin: number, dayStartHour = 8): string {
  return minutesToClock(dayStartHour * 60 + startMin);
}

/** HH:MM → startMin UI (da 08:00). */
export function clockToStartMin(time: string, dayStartHour = 8): number {
  return parseClockToMinutes(time) - dayStartHour * 60;
}

export function computeEndTime(startTime: string, durationMin: number): string {
  return minutesToClock(parseClockToMinutes(startTime) + Math.max(0, durationMin));
}

export class AppointmentModel {
  readonly id: string;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly clientId: string;
  readonly clientName: string;
  readonly serviceId: string;
  readonly serviceName: string;
  readonly operatorId: string;
  readonly operatorName: string;
  readonly title: string;
  readonly cabin: string;
  readonly dateIso: string;
  readonly dateLabel: string;
  readonly startTime: string;
  readonly endTime: string;
  readonly timeLabel: string;
  readonly durationMin: number;
  readonly dayOffset: number;
  readonly startMin: number;
  readonly price: number;
  readonly phone: string;
  readonly email: string;
  readonly status: AppointmentStatus;
  readonly notes: string;
  readonly history: string;
  readonly lastTreatment: string;
  readonly syncStatus: AppointmentSyncStatus;

  constructor(data: AppointmentData) {
    this.id = data.id;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
    this.clientId = data.clientId;
    this.clientName = data.clientName;
    this.serviceId = data.serviceId;
    this.serviceName = data.serviceName;
    this.operatorId = data.operatorId;
    this.operatorName = data.operatorName;
    this.title = data.title || data.serviceName;
    this.cabin = data.cabin;
    this.dateIso = data.dateIso;
    this.dateLabel = data.dateLabel;
    this.startTime = data.startTime || data.timeLabel;
    this.endTime = data.endTime || computeEndTime(this.startTime, data.durationMin);
    this.timeLabel = data.timeLabel || this.startTime;
    this.durationMin = data.durationMin;
    this.dayOffset = data.dayOffset;
    this.startMin = data.startMin;
    this.price = data.price;
    this.phone = data.phone;
    this.email = data.email;
    this.status = data.status;
    this.notes = data.notes;
    this.history = data.history;
    this.lastTreatment = data.lastTreatment;
    this.syncStatus = data.syncStatus;
  }

  static fromMap(map: SqlMap): AppointmentModel {
    const timeLabel = readString(map, "time_label", readString(map, "timeLabel"));
    const startTime = readString(map, "start_time", readString(map, "startTime", timeLabel));
    const durationMin = readNumber(map, "duration_min", readNumber(map, "durationMin", 60));
    const endTime = readString(
      map,
      "end_time",
      readString(map, "endTime", computeEndTime(startTime || "08:00", durationMin))
    );
    const startMinRaw = readNumber(map, "start_min", readNumber(map, "startMin", -1));
    const startMin =
      startMinRaw >= 0 ? startMinRaw : clockToStartMin(startTime || timeLabel || "08:00");

    return new AppointmentModel({
      id: readString(map, "id") || createEntityId(),
      createdAt: readString(map, "created_at", readString(map, "createdAt", nowIso())),
      updatedAt: readString(map, "updated_at", readString(map, "updatedAt", nowIso())),
      clientId: readString(map, "client_id", readString(map, "clientId")),
      clientName: readString(map, "client_name", readString(map, "clientName")),
      serviceId: readString(map, "service_id", readString(map, "serviceId")),
      serviceName: readString(map, "service_name", readString(map, "serviceName")),
      operatorId: readString(map, "operator_id", readString(map, "operatorId")),
      operatorName: readString(map, "operator_name", readString(map, "operatorName")),
      title: readString(map, "title", readString(map, "service_name", readString(map, "serviceName"))),
      cabin: readString(map, "cabin"),
      dateIso: readString(map, "date_iso", readString(map, "dateIso")),
      dateLabel: readString(map, "date_label", readString(map, "dateLabel")),
      startTime: startTime || timeLabel,
      endTime,
      timeLabel: timeLabel || startTime,
      durationMin,
      dayOffset: readNumber(map, "day_offset", readNumber(map, "dayOffset", 0)),
      startMin,
      price: readNumber(map, "price", 0),
      phone: readString(map, "phone"),
      email: readString(map, "email"),
      status: uiStatusToDomain(readString(map, "status", "prenotato")),
      notes: readString(map, "notes"),
      history: readString(map, "history"),
      lastTreatment: readString(map, "last_treatment", readString(map, "lastTreatment")),
      syncStatus: normalizeSync(readString(map, "sync_status", readString(map, "syncStatus", "local")))
    });
  }

  toMap(): SqlMap {
    return {
      id: this.id,
      created_at: this.createdAt,
      updated_at: this.updatedAt,
      client_id: this.clientId,
      client_name: this.clientName,
      service_id: this.serviceId,
      service_name: this.serviceName,
      operator_id: this.operatorId,
      operator_name: this.operatorName,
      title: this.title,
      cabin: this.cabin,
      date_iso: this.dateIso,
      date_label: this.dateLabel,
      start_time: this.startTime,
      end_time: this.endTime,
      time_label: this.timeLabel,
      duration_min: this.durationMin,
      day_offset: this.dayOffset,
      start_min: this.startMin,
      price: this.price,
      phone: this.phone,
      email: this.email,
      status: this.status,
      notes: this.notes,
      history: this.history,
      last_treatment: this.lastTreatment,
      sync_status: this.syncStatus
    };
  }

  toDto(): AppointmentData {
    return {
      id: this.id,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      clientId: this.clientId,
      clientName: this.clientName,
      serviceId: this.serviceId,
      serviceName: this.serviceName,
      operatorId: this.operatorId,
      operatorName: this.operatorName,
      title: this.title,
      cabin: this.cabin,
      dateIso: this.dateIso,
      dateLabel: this.dateLabel,
      startTime: this.startTime,
      endTime: this.endTime,
      timeLabel: this.timeLabel,
      durationMin: this.durationMin,
      dayOffset: this.dayOffset,
      startMin: this.startMin,
      price: this.price,
      phone: this.phone,
      email: this.email,
      status: this.status,
      notes: this.notes,
      history: this.history,
      lastTreatment: this.lastTreatment,
      syncStatus: this.syncStatus
    };
  }

  copyWith(patch: Partial<AppointmentData>): AppointmentModel {
    return new AppointmentModel({
      id: patch.id ?? this.id,
      createdAt: patch.createdAt ?? this.createdAt,
      updatedAt: patch.updatedAt ?? nowIso(),
      clientId: patch.clientId ?? this.clientId,
      clientName: patch.clientName ?? this.clientName,
      serviceId: patch.serviceId ?? this.serviceId,
      serviceName: patch.serviceName ?? this.serviceName,
      operatorId: patch.operatorId ?? this.operatorId,
      operatorName: patch.operatorName ?? this.operatorName,
      title: patch.title ?? this.title,
      cabin: patch.cabin ?? this.cabin,
      dateIso: patch.dateIso ?? this.dateIso,
      dateLabel: patch.dateLabel ?? this.dateLabel,
      startTime: patch.startTime ?? this.startTime,
      endTime: patch.endTime ?? this.endTime,
      timeLabel: patch.timeLabel ?? this.timeLabel,
      durationMin: patch.durationMin ?? this.durationMin,
      dayOffset: patch.dayOffset ?? this.dayOffset,
      startMin: patch.startMin ?? this.startMin,
      price: patch.price ?? this.price,
      phone: patch.phone ?? this.phone,
      email: patch.email ?? this.email,
      status: patch.status ?? this.status,
      notes: patch.notes ?? this.notes,
      history: patch.history ?? this.history,
      lastTreatment: patch.lastTreatment ?? this.lastTreatment,
      syncStatus: patch.syncStatus ?? this.syncStatus
    });
  }
}

function normalizeSync(raw: string): AppointmentSyncStatus {
  if (raw === "pending_push" || raw === "synced" || raw === "conflict") return raw;
  return "local";
}
