/**
 * ServiceRepository — CRUD completo servizi su SQLite (Sprint 4).
 */
import {
  ServiceModel,
  type ServiceCreateInput,
  type ServiceData,
  type ServiceListQuery,
  type ServiceSort,
  type ServiceUpdateInput
} from "../models/Service";
import { createEntityId, nowIso, type SqlMap } from "../core/types";
import { BaseRepository } from "./BaseRepository";

export type {
  ServiceCreateInput,
  ServiceListQuery,
  ServiceSort,
  ServiceUpdateInput
} from "../models/Service";

export type ServiceSyncHooks = {
  onLocalCreated?: (service: ServiceModel) => void;
  onLocalUpdated?: (service: ServiceModel) => void;
  onLocalDeleted?: (id: string) => void;
};

export class ServiceRepositoryError extends Error {
  readonly code: string;

  constructor(code: string, message: string) {
    super(message);
    this.name = "ServiceRepositoryError";
    this.code = code;
  }
}

export class ServiceRepository extends BaseRepository {
  private syncHooks: ServiceSyncHooks = {};

  constructor() {
    super("services");
  }

  setSyncHooks(hooks: ServiceSyncHooks): void {
    this.syncHooks = { ...hooks };
  }

  list(query: ServiceListQuery = {}): ServiceModel[] {
    try {
      const sort = query.sort ?? "name_asc";
      const orderSql = this.orderClause(sort);
      let sql = `SELECT * FROM services WHERE 1=1`;
      const params: unknown[] = [];

      if (query.category && query.category !== "Tutti") {
        sql += ` AND category = ?`;
        params.push(query.category);
      }
      if (query.activeOnly) {
        sql += ` AND active = 1`;
      }
      if (query.inactiveOnly) {
        sql += ` AND active = 0`;
      }

      const search = query.search?.trim();
      if (search) {
        const like = `%${search.toLowerCase()}%`;
        sql += ` AND (
          LOWER(name) LIKE ? OR
          LOWER(category) LIKE ? OR
          LOWER(products) LIKE ? OR
          LOWER(meta_json) LIKE ?
        )`;
        params.push(like, like, like, like);
      }

      sql += ` ORDER BY ${orderSql}`;
      const rows = this.db().prepare(sql).all(...params) as SqlMap[];
      return rows.map((row) => ServiceModel.fromMap(row));
    } catch (error) {
      if (error instanceof ServiceRepositoryError) throw error;
      throw new ServiceRepositoryError(
        "LIST_FAILED",
        `Impossibile caricare i servizi: ${errorMessage(error)}`
      );
    }
  }

  findAll(sort: ServiceSort = "name_asc"): ServiceModel[] {
    return this.list({ sort });
  }

  findById(id: string): ServiceModel | null {
    try {
      const row = this.db().prepare(`SELECT * FROM services WHERE id = ?`).get(id) as
        | SqlMap
        | undefined;
      return row ? ServiceModel.fromMap(row) : null;
    } catch (error) {
      throw new ServiceRepositoryError(
        "GET_FAILED",
        `Impossibile recuperare il servizio: ${errorMessage(error)}`
      );
    }
  }

  create(input: ServiceCreateInput): ServiceModel {
    try {
      const name = (input.name ?? "").trim();
      if (!name) {
        throw new ServiceRepositoryError("NAME_REQUIRED", "Il nome del servizio è obbligatorio.");
      }
      const durationMin = Number(input.durationMin ?? 60);
      if (!Number.isFinite(durationMin) || durationMin <= 0) {
        throw new ServiceRepositoryError("INVALID_DURATION", "Durata non valida.");
      }
      const price = Number(input.price ?? 0);
      if (!Number.isFinite(price) || price < 0) {
        throw new ServiceRepositoryError("INVALID_PRICE", "Prezzo non valido.");
      }

      const now = nowIso();
      const model = new ServiceModel({
        id: input.id?.trim() || createEntityId(),
        createdAt: now,
        updatedAt: now,
        name,
        category: (input.category ?? "").trim() || "Viso",
        durationMin,
        price,
        products: (input.products ?? "").trim(),
        operatorsJson: input.operatorsJson?.trim() || "[]",
        color: (input.color ?? "").trim() || "#c48a97",
        active: input.active ?? true,
        metaJson: input.metaJson?.trim() || "{}"
      });

      this.db()
        .prepare(
          `INSERT INTO services (
            id, created_at, updated_at, name, category, duration_min, price,
            products, operators_json, color, active, meta_json
          ) VALUES (
            @id, @created_at, @updated_at, @name, @category, @duration_min, @price,
            @products, @operators_json, @color, @active, @meta_json
          )`
        )
        .run(model.toMap());

      this.syncHooks.onLocalCreated?.(model);
      return model;
    } catch (error) {
      if (error instanceof ServiceRepositoryError) throw error;
      throw new ServiceRepositoryError(
        "CREATE_FAILED",
        `Impossibile creare il servizio: ${errorMessage(error)}`
      );
    }
  }

  update(input: ServiceUpdateInput): ServiceModel {
    try {
      const existing = this.findById(input.id);
      if (!existing) {
        throw new ServiceRepositoryError("NOT_FOUND", "Servizio non trovato.");
      }

      const name = input.name !== undefined ? input.name.trim() : existing.name;
      if (!name) {
        throw new ServiceRepositoryError("NAME_REQUIRED", "Il nome del servizio è obbligatorio.");
      }

      let durationMin = existing.durationMin;
      if (input.durationMin !== undefined) {
        durationMin = Number(input.durationMin);
        if (!Number.isFinite(durationMin) || durationMin <= 0) {
          throw new ServiceRepositoryError("INVALID_DURATION", "Durata non valida.");
        }
      }

      let price = existing.price;
      if (input.price !== undefined) {
        price = Number(input.price);
        if (!Number.isFinite(price) || price < 0) {
          throw new ServiceRepositoryError("INVALID_PRICE", "Prezzo non valido.");
        }
      }

      const next = existing.copyWith({
        name,
        category:
          input.category !== undefined
            ? input.category.trim() || existing.category
            : existing.category,
        durationMin,
        price,
        products: input.products !== undefined ? input.products.trim() : existing.products,
        operatorsJson:
          input.operatorsJson !== undefined ? input.operatorsJson : existing.operatorsJson,
        color: input.color !== undefined ? input.color.trim() || existing.color : existing.color,
        active: input.active ?? existing.active,
        metaJson: input.metaJson !== undefined ? input.metaJson : existing.metaJson,
        updatedAt: nowIso()
      });

      this.persistUpdate(next);
      this.syncHooks.onLocalUpdated?.(next);
      return next;
    } catch (error) {
      if (error instanceof ServiceRepositoryError) throw error;
      throw new ServiceRepositoryError(
        "UPDATE_FAILED",
        `Impossibile aggiornare il servizio: ${errorMessage(error)}`
      );
    }
  }

  delete(id: string): void {
    try {
      const existing = this.findById(id);
      if (!existing) {
        throw new ServiceRepositoryError("NOT_FOUND", "Servizio non trovato.");
      }
      this.db().prepare(`DELETE FROM services WHERE id = ?`).run(id);
      this.syncHooks.onLocalDeleted?.(id);
    } catch (error) {
      if (error instanceof ServiceRepositoryError) throw error;
      throw new ServiceRepositoryError(
        "DELETE_FAILED",
        `Impossibile eliminare il servizio: ${errorMessage(error)}`
      );
    }
  }

  seedMany(rows: ServiceData[]): number {
    const insert = this.db().prepare(
      `INSERT OR IGNORE INTO services (
        id, created_at, updated_at, name, category, duration_min, price,
        products, operators_json, color, active, meta_json
      ) VALUES (
        @id, @created_at, @updated_at, @name, @category, @duration_min, @price,
        @products, @operators_json, @color, @active, @meta_json
      )`
    );
    const tx = this.db().transaction((items: ServiceData[]) => {
      let n = 0;
      for (const item of items) {
        const info = insert.run(new ServiceModel(item).toMap());
        n += info.changes;
      }
      return n;
    });
    return tx(rows);
  }

  private persistUpdate(model: ServiceModel): void {
    this.db()
      .prepare(
        `UPDATE services SET
          updated_at = @updated_at,
          name = @name,
          category = @category,
          duration_min = @duration_min,
          price = @price,
          products = @products,
          operators_json = @operators_json,
          color = @color,
          active = @active,
          meta_json = @meta_json
        WHERE id = @id`
      )
      .run(model.toMap());
  }

  private orderClause(sort: ServiceSort): string {
    switch (sort) {
      case "name_desc":
        return `LOWER(name) DESC`;
      case "price_asc":
        return `price ASC, LOWER(name) ASC`;
      case "price_desc":
        return `price DESC, LOWER(name) ASC`;
      case "duration_asc":
        return `duration_min ASC, LOWER(name) ASC`;
      case "duration_desc":
        return `duration_min DESC, LOWER(name) ASC`;
      case "category_asc":
        return `LOWER(category) ASC, LOWER(name) ASC`;
      case "updated_desc":
        return `updated_at DESC`;
      case "name_asc":
      default:
        return `LOWER(name) ASC`;
    }
  }
}

function errorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return String(error);
}
