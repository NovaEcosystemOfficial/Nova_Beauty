/**
 * ClientRepository — CRUD completo clienti su SQLite.
 *
 * Documentazione Sprint 2:
 * - create / update / delete / findById / list / search
 * - validazioni locali (nome obbligatorio, email, telefono unico)
 * - hook sync Firestore preparati ma non collegati
 *
 * Tutti gli errori SQLite vengono avvolti in `ClientRepositoryError`
 * per evitare crash nel main process / IPC.
 */

import {
  ClientModel,
  type ClientCreateInput,
  type ClientData,
  type ClientListQuery,
  type ClientSort,
  type ClientSyncStatus,
  type ClientUpdateInput
} from "../models/Client";
import { createEntityId, nowIso, type SqlMap } from "../core/types";
import { BaseRepository } from "./BaseRepository";

export type {
  ClientCreateInput,
  ClientListQuery,
  ClientSort,
  ClientUpdateInput
} from "../models/Client";

/**
 * Hook per futura sincronizzazione Firestore.
 * Non implementano rete: solo punti di estensione.
 */
export type ClientSyncHooks = {
  onLocalCreated?: (client: ClientModel) => void;
  onLocalUpdated?: (client: ClientModel) => void;
  onLocalDeleted?: (id: string) => void;
};

/** Errore di dominio repository (messaggio UI-friendly). */
export class ClientRepositoryError extends Error {
  readonly code: string;

  constructor(code: string, message: string) {
    super(message);
    this.name = "ClientRepositoryError";
    this.code = code;
  }
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function normalizePhone(phone: string): string {
  return phone.replace(/\D/g, "");
}

function validateEmail(email: string): void {
  const e = email.trim();
  if (!e) return;
  if (!EMAIL_RE.test(e)) {
    throw new ClientRepositoryError("INVALID_EMAIL", "Email non valida.");
  }
}

function validateRequiredName(firstName: string, _lastName: string): void {
  if (!firstName.trim()) {
    throw new ClientRepositoryError("NAME_REQUIRED", "Il nome è obbligatorio.");
  }
}

export class ClientRepository extends BaseRepository {
  private syncHooks: ClientSyncHooks = {};

  constructor() {
    super("clients");
  }

  /**
   * Registra hook sync cloud (Firestore).
   * Sprint 2: nessuno sync reale — solo predisposizione.
   */
  setSyncHooks(hooks: ClientSyncHooks): void {
    this.syncHooks = { ...hooks };
  }

  /**
   * Marker sync status senza push remoto.
   * Usato dalle future sprint cloud.
   */
  markSyncStatus(id: string, status: ClientSyncStatus): ClientModel {
    const existing = this.findById(id);
    if (!existing) {
      throw new ClientRepositoryError("NOT_FOUND", "Cliente non trovato.");
    }
    const next = existing.copyWith({ syncStatus: status, updatedAt: nowIso() });
    this.persistUpdate(next);
    return next;
  }

  /** Elenco clienti con ricerca e ordinamento. */
  list(query: ClientListQuery = {}): ClientModel[] {
    try {
      const sort = query.sort ?? "name_asc";
      const orderSql = this.orderClause(sort);
      let sql = `SELECT * FROM clients WHERE 1=1`;
      const params: unknown[] = [];

      if (query.status && query.status !== "tutti") {
        sql += ` AND status = ?`;
        params.push(query.status);
      }
      if (query.favoritesOnly) {
        sql += ` AND favorite = 1`;
      }

      const search = query.search?.trim();
      if (search) {
        const like = `%${search.toLowerCase()}%`;
        sql += ` AND (
          LOWER(first_name) LIKE ? OR
          LOWER(last_name) LIKE ? OR
          LOWER(name) LIKE ? OR
          LOWER(phone) LIKE ? OR
          LOWER(email) LIKE ?
        )`;
        params.push(like, like, like, like, like);
      }

      sql += ` ORDER BY ${orderSql}`;
      const rows = this.db().prepare(sql).all(...params) as SqlMap[];
      return rows.map((row) => ClientModel.fromMap(row));
    } catch (error) {
      if (error instanceof ClientRepositoryError) throw error;
      throw new ClientRepositoryError(
        "LIST_FAILED",
        `Impossibile caricare i clienti: ${errorMessage(error)}`
      );
    }
  }

  /** Alias documentato per lista completa. */
  findAll(sort: ClientSort = "name_asc"): ClientModel[] {
    return this.list({ sort });
  }

  findById(id: string): ClientModel | null {
    try {
      const row = this.db().prepare(`SELECT * FROM clients WHERE id = ?`).get(id) as
        | SqlMap
        | undefined;
      return row ? ClientModel.fromMap(row) : null;
    } catch (error) {
      throw new ClientRepositoryError(
        "GET_FAILED",
        `Impossibile recuperare il cliente: ${errorMessage(error)}`
      );
    }
  }

  /** Crea un nuovo cliente (validato). */
  create(input: ClientCreateInput): ClientModel {
    try {
      validateRequiredName(input.firstName, input.lastName);
      const phone = (input.phone ?? "").trim();
      const email = (input.email ?? "").trim();
      validateEmail(email);
      this.assertPhoneUnique(phone, null);

      const now = nowIso();
      const model = new ClientModel({
        id: createEntityId(),
        createdAt: now,
        updatedAt: now,
        firstName: input.firstName.trim(),
        lastName: input.lastName.trim(),
        name: ClientModel.displayName(input.firstName, input.lastName),
        phone,
        email,
        birthday: (input.birthday ?? "").trim(),
        notes: (input.notes ?? "").trim(),
        favorite: Boolean(input.favorite),
        status: input.status ?? "nuovo",
        profileJson: input.profileJson ?? "{}",
        syncStatus: "pending_push"
      });

      const map = model.toMap();
      this.db()
        .prepare(
          `INSERT INTO clients (
            id, created_at, updated_at, first_name, last_name, name,
            phone, email, birthday, notes, favorite, status, profile_json, sync_status
          ) VALUES (
            @id, @created_at, @updated_at, @first_name, @last_name, @name,
            @phone, @email, @birthday, @notes, @favorite, @status, @profile_json, @sync_status
          )`
        )
        .run(map);

      this.syncHooks.onLocalCreated?.(model);
      return model;
    } catch (error) {
      if (error instanceof ClientRepositoryError) throw error;
      throw new ClientRepositoryError(
        "CREATE_FAILED",
        `Impossibile creare il cliente: ${errorMessage(error)}`
      );
    }
  }

  /** Aggiorna un cliente esistente. */
  update(input: ClientUpdateInput): ClientModel {
    try {
      const existing = this.findById(input.id);
      if (!existing) {
        throw new ClientRepositoryError("NOT_FOUND", "Cliente non trovato.");
      }

      const firstName = input.firstName ?? existing.firstName;
      const lastName = input.lastName ?? existing.lastName;
      validateRequiredName(firstName, lastName);

      const phone = input.phone !== undefined ? input.phone.trim() : existing.phone;
      const email = input.email !== undefined ? input.email.trim() : existing.email;
      validateEmail(email);
      this.assertPhoneUnique(phone, existing.id);

      const next = existing.copyWith({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        name: ClientModel.displayName(firstName, lastName),
        phone,
        email,
        birthday: input.birthday !== undefined ? input.birthday.trim() : existing.birthday,
        notes: input.notes !== undefined ? input.notes.trim() : existing.notes,
        favorite: input.favorite ?? existing.favorite,
        status: input.status ?? existing.status,
        profileJson: input.profileJson ?? existing.profileJson,
        syncStatus: "pending_push",
        updatedAt: nowIso()
      });

      this.persistUpdate(next);
      this.syncHooks.onLocalUpdated?.(next);
      return next;
    } catch (error) {
      if (error instanceof ClientRepositoryError) throw error;
      throw new ClientRepositoryError(
        "UPDATE_FAILED",
        `Impossibile aggiornare il cliente: ${errorMessage(error)}`
      );
    }
  }

  /** Elimina un cliente per id. */
  delete(id: string): void {
    try {
      const existing = this.findById(id);
      if (!existing) {
        throw new ClientRepositoryError("NOT_FOUND", "Cliente non trovato.");
      }
      this.db().prepare(`DELETE FROM clients WHERE id = ?`).run(id);
      this.syncHooks.onLocalDeleted?.(id);
    } catch (error) {
      if (error instanceof ClientRepositoryError) throw error;
      throw new ClientRepositoryError(
        "DELETE_FAILED",
        `Impossibile eliminare il cliente: ${errorMessage(error)}`
      );
    }
  }

  /** Inserisce in blocco (seed demo) senza triggare sync hooks. */
  seedMany(rows: ClientData[]): number {
    const insert = this.db().prepare(
      `INSERT OR IGNORE INTO clients (
        id, created_at, updated_at, first_name, last_name, name,
        phone, email, birthday, notes, favorite, status, profile_json, sync_status
      ) VALUES (
        @id, @created_at, @updated_at, @first_name, @last_name, @name,
        @phone, @email, @birthday, @notes, @favorite, @status, @profile_json, @sync_status
      )`
    );
    const tx = this.db().transaction((items: ClientData[]) => {
      let n = 0;
      for (const item of items) {
        const model = new ClientModel(item);
        const info = insert.run(model.toMap());
        n += info.changes;
      }
      return n;
    });
    return tx(rows);
  }

  private persistUpdate(model: ClientModel): void {
    const map = model.toMap();
    this.db()
      .prepare(
        `UPDATE clients SET
          updated_at = @updated_at,
          first_name = @first_name,
          last_name = @last_name,
          name = @name,
          phone = @phone,
          email = @email,
          birthday = @birthday,
          notes = @notes,
          favorite = @favorite,
          status = @status,
          profile_json = @profile_json,
          sync_status = @sync_status
        WHERE id = @id`
      )
      .run(map);
  }

  private assertPhoneUnique(phone: string, excludeId: string | null): void {
    const digits = normalizePhone(phone);
    if (!digits) return;
    const rows = this.db().prepare(`SELECT id, phone FROM clients`).all() as Array<{
      id: string;
      phone: string;
    }>;
    const clash = rows.find(
      (r) => r.id !== excludeId && normalizePhone(r.phone) === digits && digits.length > 0
    );
    if (clash) {
      throw new ClientRepositoryError(
        "DUPLICATE_PHONE",
        "Esiste già un cliente con questo telefono."
      );
    }
  }

  private orderClause(sort: ClientSort): string {
    switch (sort) {
      case "name_desc":
        return `LOWER(last_name) DESC, LOWER(first_name) DESC`;
      case "created_desc":
        return `created_at DESC`;
      case "updated_desc":
        return `updated_at DESC`;
      case "name_asc":
      default:
        return `LOWER(last_name) ASC, LOWER(first_name) ASC`;
    }
  }
}

function errorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return String(error);
}
