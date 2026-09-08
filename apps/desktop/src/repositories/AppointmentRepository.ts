/**
 * AppointmentRepository — CRUD completo appuntamenti su SQLite.
 *
 * Documentazione Sprint 3:
 * - create / update / delete / findById / list / search
 * - validazioni: cliente, data, ora obbligatori; no overlap stesso operatore
 * - stati dominio: prenotato | confermato | completato | annullato
 * - hook sync Firestore predisposti (nessuna rete)
 *
 * Errori avvolti in `AppointmentRepositoryError` (no crash main/IPC).
 */

import {
  AppointmentModel,
  clockToStartMin,
  computeEndTime,
  parseClockToMinutes,
  uiStatusToDomain,
  type AppointmentCreateInput,
  type AppointmentData,
  type AppointmentListQuery,
  type AppointmentSort,
  type AppointmentStatus,
  type AppointmentSyncStatus,
  type AppointmentUpdateInput
} from "../models/Appointment";
import { createEntityId, nowIso, type SqlMap } from "../core/types";
import { BaseRepository } from "./BaseRepository";

export type {
  AppointmentCreateInput,
  AppointmentListQuery,
  AppointmentSort,
  AppointmentUpdateInput
} from "../models/Appointment";

/** Hook per futura sincronizzazione Firestore. */
export type AppointmentSyncHooks = {
  onLocalCreated?: (appointment: AppointmentModel) => void;
  onLocalUpdated?: (appointment: AppointmentModel) => void;
  onLocalDeleted?: (id: string) => void;
};

export class AppointmentRepositoryError extends Error {
  readonly code: string;

  constructor(code: string, message: string) {
    super(message);
    this.name = "AppointmentRepositoryError";
    this.code = code;
  }
}

const TIME_RE = /^\d{1,2}:\d{2}$/;

export class AppointmentRepository extends BaseRepository {
  private syncHooks: AppointmentSyncHooks = {};

  constructor() {
    super("appointments");
  }

  /** Registra hook sync cloud (Firestore). Nessun sync reale in Sprint 3. */
  setSyncHooks(hooks: AppointmentSyncHooks): void {
    this.syncHooks = { ...hooks };
  }

  markSyncStatus(id: string, status: AppointmentSyncStatus): AppointmentModel {
    const existing = this.findById(id);
    if (!existing) {
      throw new AppointmentRepositoryError("NOT_FOUND", "Appuntamento non trovato.");
    }
    const next = existing.copyWith({ syncStatus: status, updatedAt: nowIso() });
    this.persistUpdate(next);
    return next;
  }

  /** Elenco con ricerca (cliente/operatore/data/stato) e ordinamento. */
  list(query: AppointmentListQuery = {}): AppointmentModel[] {
    try {
      const sort = query.sort ?? "date_asc";
      let sql = `SELECT * FROM appointments WHERE 1=1`;
      const params: unknown[] = [];

      if (query.clientId) {
        sql += ` AND client_id = ?`;
        params.push(query.clientId);
      }
      if (query.operatorId) {
        sql += ` AND operator_id = ?`;
        params.push(query.operatorId);
      }
      if (query.operatorName) {
        sql += ` AND LOWER(operator_name) = LOWER(?)`;
        params.push(query.operatorName.trim());
      }
      if (query.dateIso) {
        sql += ` AND date_iso = ?`;
        params.push(query.dateIso);
      }
      if (query.status && query.status !== "tutti") {
        sql += ` AND status = ?`;
        params.push(uiStatusToDomain(query.status));
      }

      const search = query.search?.trim();
      if (search) {
        const like = `%${search.toLowerCase()}%`;
        sql += ` AND (
          LOWER(client_name) LIKE ? OR
          LOWER(operator_name) LIKE ? OR
          LOWER(date_label) LIKE ? OR
          LOWER(date_iso) LIKE ? OR
          LOWER(status) LIKE ? OR
          LOWER(service_name) LIKE ? OR
          LOWER(title) LIKE ? OR
          LOWER(phone) LIKE ?
        )`;
        params.push(like, like, like, like, like, like, like, like);
      }

      sql += ` ORDER BY ${this.orderClause(sort)}`;
      const rows = this.db().prepare(sql).all(...params) as SqlMap[];
      return rows.map((row) => AppointmentModel.fromMap(row));
    } catch (error) {
      if (error instanceof AppointmentRepositoryError) throw error;
      throw new AppointmentRepositoryError(
        "LIST_FAILED",
        `Impossibile caricare gli appuntamenti: ${errorMessage(error)}`
      );
    }
  }

  findAll(sort: AppointmentSort = "date_asc"): AppointmentModel[] {
    return this.list({ sort });
  }

  findById(id: string): AppointmentModel | null {
    try {
      const row = this.db().prepare(`SELECT * FROM appointments WHERE id = ?`).get(id) as
        | SqlMap
        | undefined;
      return row ? AppointmentModel.fromMap(row) : null;
    } catch (error) {
      throw new AppointmentRepositoryError(
        "GET_FAILED",
        `Impossibile recuperare l'appuntamento: ${errorMessage(error)}`
      );
    }
  }

  /**
   * Alias documentato di `create` (INSERT su SQLite).
   * Usato dal flusso UI «Nuovo appuntamento».
   */
  insert(input: AppointmentCreateInput): AppointmentModel {
    return this.create(input);
  }

  /** Crea appuntamento (validato, no overlap operatore) → INSERT SQLite. */
  create(input: AppointmentCreateInput): AppointmentModel {
    try {
      const normalized = this.normalizeInput(input, null);
      this.assertNoOverlap(normalized, null);

      const now = nowIso();
      const model = new AppointmentModel({
        id: createEntityId(),
        createdAt: now,
        updatedAt: now,
        ...normalized,
        syncStatus: "pending_push"
      });

      const insertTx = this.db().transaction(() => {
        const info = this.db()
          .prepare(
            `INSERT INTO appointments (
              id, created_at, updated_at,
              client_id, client_name, service_id, service_name,
              operator_id, operator_name, title, cabin,
              date_iso, date_label, start_time, end_time, time_label,
              duration_min, day_offset, start_min, price, phone, email,
              status, notes, history, last_treatment, sync_status
            ) VALUES (
              @id, @created_at, @updated_at,
              @client_id, @client_name, @service_id, @service_name,
              @operator_id, @operator_name, @title, @cabin,
              @date_iso, @date_label, @start_time, @end_time, @time_label,
              @duration_min, @day_offset, @start_min, @price, @phone, @email,
              @status, @notes, @history, @last_treatment, @sync_status
            )`
          )
          .run(model.toMap());
        if (!info.changes || info.changes < 1) {
          throw new AppointmentRepositoryError(
            "INSERT_FAILED",
            "L'INSERT non ha scritto alcuna riga su SQLite."
          );
        }
      });
      insertTx();

      // Flush WAL → file principale (stesso DB usato in lettura).
      try {
        this.db().pragma("wal_checkpoint(PASSIVE)");
      } catch {
        /* ignore */
      }

      const verify = this.findById(model.id);
      if (!verify) {
        throw new AppointmentRepositoryError(
          "INSERT_VERIFY_FAILED",
          "Appuntamento inserito ma non leggibile dal database."
        );
      }

      this.syncHooks.onLocalCreated?.(verify);
      return verify;
    } catch (error) {
      if (error instanceof AppointmentRepositoryError) throw error;
      throw new AppointmentRepositoryError(
        "CREATE_FAILED",
        `Impossibile creare l'appuntamento: ${errorMessage(error)}`
      );
    }
  }

  /** Aggiorna appuntamento esistente. */
  update(input: AppointmentUpdateInput): AppointmentModel {
    try {
      const existing = this.findById(input.id);
      if (!existing) {
        throw new AppointmentRepositoryError("NOT_FOUND", "Appuntamento non trovato.");
      }

      const merged: AppointmentCreateInput = {
        clientId: input.clientId ?? existing.clientId,
        clientName: input.clientName ?? existing.clientName,
        serviceId: input.serviceId ?? existing.serviceId,
        serviceName: input.serviceName ?? existing.serviceName,
        operatorId: input.operatorId ?? existing.operatorId,
        operatorName: input.operatorName ?? existing.operatorName,
        title: input.title ?? existing.title,
        cabin: input.cabin ?? existing.cabin,
        dateIso: input.dateIso ?? existing.dateIso,
        dateLabel: input.dateLabel ?? existing.dateLabel,
        startTime: input.startTime ?? existing.startTime,
        endTime: input.endTime ?? existing.endTime,
        timeLabel: input.timeLabel ?? existing.timeLabel,
        durationMin: input.durationMin ?? existing.durationMin,
        dayOffset: input.dayOffset ?? existing.dayOffset,
        startMin: input.startMin ?? existing.startMin,
        price: input.price ?? existing.price,
        phone: input.phone ?? existing.phone,
        email: input.email ?? existing.email,
        status: input.status ?? existing.status,
        notes: input.notes ?? existing.notes,
        history: input.history ?? existing.history,
        lastTreatment: input.lastTreatment ?? existing.lastTreatment
      };

      const normalized = this.normalizeInput(merged, existing.id);
      this.assertNoOverlap(normalized, existing.id);

      const next = existing.copyWith({
        ...normalized,
        syncStatus: "pending_push",
        updatedAt: nowIso()
      });

      this.persistUpdate(next);
      this.syncHooks.onLocalUpdated?.(next);
      return next;
    } catch (error) {
      if (error instanceof AppointmentRepositoryError) throw error;
      throw new AppointmentRepositoryError(
        "UPDATE_FAILED",
        `Impossibile aggiornare l'appuntamento: ${errorMessage(error)}`
      );
    }
  }

  /** Elimina appuntamento. */
  delete(id: string): void {
    try {
      const existing = this.findById(id);
      if (!existing) {
        throw new AppointmentRepositoryError("NOT_FOUND", "Appuntamento non trovato.");
      }
      this.db().prepare(`DELETE FROM appointments WHERE id = ?`).run(id);
      this.syncHooks.onLocalDeleted?.(id);
    } catch (error) {
      if (error instanceof AppointmentRepositoryError) throw error;
      throw new AppointmentRepositoryError(
        "DELETE_FAILED",
        `Impossibile eliminare l'appuntamento: ${errorMessage(error)}`
      );
    }
  }

  /** Seed demo senza triggare sync hooks. */
  seedMany(rows: AppointmentData[]): number {
    const insert = this.db().prepare(
      `INSERT OR IGNORE INTO appointments (
        id, created_at, updated_at,
        client_id, client_name, service_id, service_name,
        operator_id, operator_name, title, cabin,
        date_iso, date_label, start_time, end_time, time_label,
        duration_min, day_offset, start_min, price, phone, email,
        status, notes, history, last_treatment, sync_status
      ) VALUES (
        @id, @created_at, @updated_at,
        @client_id, @client_name, @service_id, @service_name,
        @operator_id, @operator_name, @title, @cabin,
        @date_iso, @date_label, @start_time, @end_time, @time_label,
        @duration_min, @day_offset, @start_min, @price, @phone, @email,
        @status, @notes, @history, @last_treatment, @sync_status
      )`
    );
    const tx = this.db().transaction((items: AppointmentData[]) => {
      let n = 0;
      for (const item of items) {
        const info = insert.run(new AppointmentModel(item).toMap());
        n += info.changes;
      }
      return n;
    });
    return tx(rows);
  }

  private persistUpdate(model: AppointmentModel): void {
    this.db()
      .prepare(
        `UPDATE appointments SET
          updated_at = @updated_at,
          client_id = @client_id,
          client_name = @client_name,
          service_id = @service_id,
          service_name = @service_name,
          operator_id = @operator_id,
          operator_name = @operator_name,
          title = @title,
          cabin = @cabin,
          date_iso = @date_iso,
          date_label = @date_label,
          start_time = @start_time,
          end_time = @end_time,
          time_label = @time_label,
          duration_min = @duration_min,
          day_offset = @day_offset,
          start_min = @start_min,
          price = @price,
          phone = @phone,
          email = @email,
          status = @status,
          notes = @notes,
          history = @history,
          last_treatment = @last_treatment,
          sync_status = @sync_status
        WHERE id = @id`
      )
      .run(model.toMap());
  }

  private normalizeInput(
    input: AppointmentCreateInput,
    _excludeId: string | null
  ): Omit<AppointmentData, "id" | "createdAt" | "updatedAt" | "syncStatus"> {
    const clientId = (input.clientId ?? "").trim();
    if (!clientId) {
      throw new AppointmentRepositoryError("CLIENT_REQUIRED", "Il cliente è obbligatorio.");
    }

    const dateLabel = (input.dateLabel ?? "").trim();
    const dateIso = (input.dateIso ?? "").trim() || inferDateIsoFromLabel(dateLabel);
    if (!dateLabel && !dateIso) {
      throw new AppointmentRepositoryError("DATE_REQUIRED", "La data è obbligatoria.");
    }
    if (!dateIso) {
      throw new AppointmentRepositoryError("DATE_REQUIRED", "La data è obbligatoria.");
    }

    const startTime = (input.startTime || input.timeLabel || "").trim();
    if (!startTime || !TIME_RE.test(startTime)) {
      throw new AppointmentRepositoryError("TIME_REQUIRED", "L'ora di inizio è obbligatoria.");
    }

    const durationMin = Math.max(5, Number(input.durationMin ?? 60) || 60);
    const endTime = (input.endTime ?? "").trim() || computeEndTime(startTime, durationMin);
    if (!TIME_RE.test(endTime)) {
      throw new AppointmentRepositoryError("TIME_REQUIRED", "L'ora di fine non è valida.");
    }
    if (parseClockToMinutes(endTime) <= parseClockToMinutes(startTime)) {
      throw new AppointmentRepositoryError(
        "INVALID_RANGE",
        "L'ora di fine deve essere successiva all'inizio."
      );
    }

    const serviceName = (input.serviceName ?? "").trim();
    const title = (input.title ?? serviceName).trim() || "Appuntamento";
    const operatorName = (input.operatorName ?? "").trim();
    const operatorId =
      (input.operatorId ?? "").trim() || operatorIdFromName(operatorName);
    const status = uiStatusToDomain(input.status ?? "confermato");
    const startMin =
      input.startMin !== undefined && input.startMin >= 0
        ? input.startMin
        : clockToStartMin(startTime);

    return {
      clientId,
      clientName: (input.clientName ?? "").trim(),
      serviceId: (input.serviceId ?? "").trim(),
      serviceName,
      operatorId,
      operatorName,
      title,
      cabin: (input.cabin ?? "").trim(),
      dateIso,
      dateLabel: dateLabel || dateIso,
      startTime,
      endTime,
      timeLabel: (input.timeLabel ?? startTime).trim(),
      durationMin,
      dayOffset: Number(input.dayOffset ?? 0) || 0,
      startMin,
      price: Number(input.price ?? 0) || 0,
      phone: (input.phone ?? "").trim(),
      email: (input.email ?? "").trim(),
      status,
      notes: (input.notes ?? "").trim(),
      history: (input.history ?? "").trim(),
      lastTreatment: (input.lastTreatment ?? "").trim()
    };
  }

  /**
   * Nessuna sovrapposizione dello stesso operatore nello stesso orario.
   * Appuntamenti annullati esclusi dal controllo.
   */
  private assertNoOverlap(
    data: Omit<AppointmentData, "id" | "createdAt" | "updatedAt" | "syncStatus">,
    excludeId: string | null
  ): void {
    if (!data.operatorId && !data.operatorName) return;
    if (data.status === "annullato") return;

    const rows = this.db()
      .prepare(
        `SELECT id, operator_id, operator_name, date_iso, start_time, end_time, status
         FROM appointments
         WHERE date_iso = ? AND status != 'annullato'`
      )
      .all(data.dateIso) as Array<{
      id: string;
      operator_id: string;
      operator_name: string;
      date_iso: string;
      start_time: string;
      end_time: string;
      status: string;
    }>;

    const start = parseClockToMinutes(data.startTime);
    const end = parseClockToMinutes(data.endTime);

    const clash = rows.find((row) => {
      if (excludeId && row.id === excludeId) return false;
      const sameOp =
        (data.operatorId && row.operator_id && data.operatorId === row.operator_id) ||
        (data.operatorName &&
          row.operator_name &&
          data.operatorName.toLowerCase() === row.operator_name.toLowerCase());
      if (!sameOp) return false;
      const otherStart = parseClockToMinutes(row.start_time);
      const otherEnd = parseClockToMinutes(row.end_time);
      return start < otherEnd && end > otherStart;
    });

    if (clash) {
      throw new AppointmentRepositoryError(
        "OVERLAP",
        "L'operatore ha già un appuntamento in questo orario."
      );
    }
  }

  private orderClause(sort: AppointmentSort): string {
    switch (sort) {
      case "date_desc":
        return `date_iso DESC, start_time DESC`;
      case "time_asc":
        return `start_time ASC, date_iso ASC`;
      case "time_desc":
        return `start_time DESC, date_iso DESC`;
      case "client_asc":
        return `LOWER(client_name) ASC, date_iso ASC, start_time ASC`;
      case "operator_asc":
        return `LOWER(operator_name) ASC, date_iso ASC, start_time ASC`;
      case "date_asc":
      default:
        return `date_iso ASC, start_time ASC`;
    }
  }
}

function operatorIdFromName(name: string): string {
  const n = name.trim().toLowerCase();
  if (n === "fabio") return "op-fabio";
  if (n === "laura") return "op-laura";
  if (!n) return "";
  return `op-${n.replace(/\s+/g, "-")}`;
}

function inferDateIsoFromLabel(label: string): string {
  // Demo labels: "Mer 5 ago 2026", "Gio 6 ago 2026", "Ven 7 ago 2026"
  const m = /(\d{1,2})\s+ago\s+(\d{4})/i.exec(label);
  if (m) {
    return `${m[2]}-08-${String(Number(m[1])).padStart(2, "0")}`;
  }
  const iso = /^(\d{4}-\d{2}-\d{2})/.exec(label.trim());
  return iso ? iso[1] : "";
}

function errorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return String(error);
}
