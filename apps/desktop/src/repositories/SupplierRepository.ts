/**
 * SupplierRepository — CRUD fornitori su SQLite (B2).
 */
import {
  SupplierModel,
  type SupplierCreateInput,
  type SupplierData,
  type SupplierListQuery,
  type SupplierUpdateInput
} from "../models/Supplier";
import { createEntityId, nowIso, type SqlMap } from "../core/types";
import { BaseRepository } from "./BaseRepository";

export type SupplierSyncHooks = {
  onLocalCreated?: (supplier: SupplierModel) => void;
  onLocalUpdated?: (supplier: SupplierModel) => void;
  onLocalDeleted?: (id: string) => void;
};

export class SupplierRepositoryError extends Error {
  readonly code: string;

  constructor(code: string, message: string) {
    super(message);
    this.name = "SupplierRepositoryError";
    this.code = code;
  }
}

export class SupplierRepository extends BaseRepository {
  private syncHooks: SupplierSyncHooks = {};

  constructor() {
    super("suppliers");
  }

  setSyncHooks(hooks: SupplierSyncHooks): void {
    this.syncHooks = { ...hooks };
  }

  list(query: SupplierListQuery = {}): SupplierModel[] {
    try {
      let sql = `SELECT * FROM suppliers WHERE 1=1`;
      const params: unknown[] = [];

      if (query.status && query.status !== "tutti") {
        sql += ` AND status = ?`;
        params.push(query.status);
      }
      if (query.category && query.category !== "tutti") {
        sql += ` AND category = ?`;
        params.push(query.category);
      }
      const search = query.search?.trim();
      if (search) {
        const like = `%${search.toLowerCase()}%`;
        sql += ` AND (
          LOWER(name) LIKE ? OR
          LOWER(contact) LIKE ? OR
          LOWER(category) LIKE ? OR
          LOWER(email) LIKE ? OR
          LOWER(phone) LIKE ?
        )`;
        params.push(like, like, like, like, like);
      }
      sql += ` ORDER BY LOWER(name) ASC`;
      const rows = this.db().prepare(sql).all(...params) as SqlMap[];
      return rows.map((row) => SupplierModel.fromMap(row));
    } catch (error) {
      if (error instanceof SupplierRepositoryError) throw error;
      throw new SupplierRepositoryError(
        "LIST_FAILED",
        `Impossibile caricare i fornitori: ${errorMessage(error)}`
      );
    }
  }

  findById(id: string): SupplierModel | null {
    try {
      const row = this.db().prepare(`SELECT * FROM suppliers WHERE id = ?`).get(id) as
        | SqlMap
        | undefined;
      return row ? SupplierModel.fromMap(row) : null;
    } catch (error) {
      throw new SupplierRepositoryError(
        "GET_FAILED",
        `Impossibile recuperare il fornitore: ${errorMessage(error)}`
      );
    }
  }

  create(input: SupplierCreateInput): SupplierModel {
    try {
      const name = (input.name ?? "").trim();
      if (!name) {
        throw new SupplierRepositoryError("NAME_REQUIRED", "Il nome del fornitore è obbligatorio.");
      }
      const now = nowIso();
      const model = new SupplierModel({
        id: input.id?.trim() || createEntityId(),
        createdAt: now,
        updatedAt: now,
        name,
        category: (input.category ?? "").trim() || "Dermocosmesi",
        status: input.status === "disattivo" ? "disattivo" : "attivo",
        contact: (input.contact ?? "").trim(),
        phone: (input.phone ?? "").trim(),
        email: (input.email ?? "").trim(),
        notes: (input.notes ?? "").trim(),
        metaJson: input.metaJson?.trim() || "{}"
      });
      this.db()
        .prepare(
          `INSERT INTO suppliers (
            id, created_at, updated_at, name, category, status, contact, phone, email, notes, meta_json
          ) VALUES (
            @id, @created_at, @updated_at, @name, @category, @status, @contact, @phone, @email, @notes, @meta_json
          )`
        )
        .run(model.toMap());
      this.syncHooks.onLocalCreated?.(model);
      return model;
    } catch (error) {
      if (error instanceof SupplierRepositoryError) throw error;
      throw new SupplierRepositoryError(
        "CREATE_FAILED",
        `Impossibile creare il fornitore: ${errorMessage(error)}`
      );
    }
  }

  update(input: SupplierUpdateInput): SupplierModel {
    try {
      const existing = this.findById(input.id);
      if (!existing) {
        throw new SupplierRepositoryError("NOT_FOUND", "Fornitore non trovato.");
      }
      const name = input.name !== undefined ? input.name.trim() : existing.name;
      if (!name) {
        throw new SupplierRepositoryError("NAME_REQUIRED", "Il nome del fornitore è obbligatorio.");
      }
      const next = existing.copyWith({
        name,
        category:
          input.category !== undefined
            ? input.category.trim() || existing.category
            : existing.category,
        status: input.status ?? existing.status,
        contact: input.contact !== undefined ? input.contact.trim() : existing.contact,
        phone: input.phone !== undefined ? input.phone.trim() : existing.phone,
        email: input.email !== undefined ? input.email.trim() : existing.email,
        notes: input.notes !== undefined ? input.notes.trim() : existing.notes,
        metaJson: input.metaJson !== undefined ? input.metaJson : existing.metaJson,
        updatedAt: nowIso()
      });
      this.db()
        .prepare(
          `UPDATE suppliers SET
            updated_at = @updated_at,
            name = @name,
            category = @category,
            status = @status,
            contact = @contact,
            phone = @phone,
            email = @email,
            notes = @notes,
            meta_json = @meta_json
          WHERE id = @id`
        )
        .run(next.toMap());
      this.syncHooks.onLocalUpdated?.(next);
      return next;
    } catch (error) {
      if (error instanceof SupplierRepositoryError) throw error;
      throw new SupplierRepositoryError(
        "UPDATE_FAILED",
        `Impossibile aggiornare il fornitore: ${errorMessage(error)}`
      );
    }
  }

  delete(id: string): void {
    try {
      const existing = this.findById(id);
      if (!existing) {
        throw new SupplierRepositoryError("NOT_FOUND", "Fornitore non trovato.");
      }
      this.db().prepare(`DELETE FROM suppliers WHERE id = ?`).run(id);
      this.syncHooks.onLocalDeleted?.(id);
    } catch (error) {
      if (error instanceof SupplierRepositoryError) throw error;
      throw new SupplierRepositoryError(
        "DELETE_FAILED",
        `Impossibile eliminare il fornitore: ${errorMessage(error)}`
      );
    }
  }

  seedMany(rows: SupplierData[]): number {
    const insert = this.db().prepare(
      `INSERT OR IGNORE INTO suppliers (
        id, created_at, updated_at, name, category, status, contact, phone, email, notes, meta_json
      ) VALUES (
        @id, @created_at, @updated_at, @name, @category, @status, @contact, @phone, @email, @notes, @meta_json
      )`
    );
    const tx = this.db().transaction((items: SupplierData[]) => {
      let n = 0;
      for (const item of items) {
        n += insert.run(new SupplierModel(item).toMap()).changes;
      }
      return n;
    });
    return tx(rows);
  }
}

function errorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return String(error);
}
