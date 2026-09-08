/**
 * InventoryRepository — CRUD prodotti e movimenti magazzino (B1).
 */
import {
  InventoryMovementModel,
  type InventoryMovementCreateInput,
  type InventoryMovementData
} from "../models/InventoryMovement";
import {
  ProductModel,
  type InventoryMoveInput,
  type ProductCreateInput,
  type ProductData,
  type ProductListQuery,
  type ProductUpdateInput
} from "../models/Product";
import { createEntityId, nowIso, type SqlMap } from "../core/types";
import { BaseRepository } from "./BaseRepository";

export type InventorySyncHooks = {
  onLocalCreated?: (product: ProductModel) => void;
  onLocalUpdated?: (product: ProductModel) => void;
  onLocalDeleted?: (id: string) => void;
};

export class InventoryRepositoryError extends Error {
  readonly code: string;

  constructor(code: string, message: string) {
    super(message);
    this.name = "InventoryRepositoryError";
    this.code = code;
  }
}

export class InventoryRepository extends BaseRepository {
  private syncHooks: InventorySyncHooks = {};

  constructor() {
    super("products");
  }

  setSyncHooks(hooks: InventorySyncHooks): void {
    this.syncHooks = { ...hooks };
  }

  listProducts(query: ProductListQuery = {}): ProductModel[] {
    try {
      let sql = `SELECT * FROM products WHERE 1=1`;
      const params: unknown[] = [];

      if (query.category && query.category !== "Tutti") {
        sql += ` AND category_name = ?`;
        params.push(query.category);
      }

      const search = query.search?.trim();
      if (search) {
        const like = `%${search.toLowerCase()}%`;
        sql += ` AND (
          LOWER(name) LIKE ? OR
          LOWER(code) LIKE ? OR
          LOWER(supplier) LIKE ? OR
          LOWER(meta_json) LIKE ?
        )`;
        params.push(like, like, like, like);
      }

      sql += ` ORDER BY LOWER(name) ASC`;
      const rows = this.db().prepare(sql).all(...params) as SqlMap[];
      return rows.map((row) => ProductModel.fromMap(row));
    } catch (error) {
      if (error instanceof InventoryRepositoryError) throw error;
      throw new InventoryRepositoryError(
        "LIST_FAILED",
        `Impossibile caricare i prodotti: ${errorMessage(error)}`
      );
    }
  }

  findAllProducts(): ProductModel[] {
    return this.listProducts();
  }

  findProductById(id: string): ProductModel | null {
    try {
      const row = this.db().prepare(`SELECT * FROM products WHERE id = ?`).get(id) as
        | SqlMap
        | undefined;
      return row ? ProductModel.fromMap(row) : null;
    } catch (error) {
      throw new InventoryRepositoryError(
        "GET_FAILED",
        `Impossibile recuperare il prodotto: ${errorMessage(error)}`
      );
    }
  }

  findAllMovements(): InventoryMovementModel[] {
    try {
      const rows = this.db()
        .prepare(`SELECT * FROM inventory_movements ORDER BY created_at DESC`)
        .all() as SqlMap[];
      return rows.map((row) => InventoryMovementModel.fromMap(row));
    } catch (error) {
      throw new InventoryRepositoryError(
        "MOVEMENTS_FAILED",
        `Impossibile caricare i movimenti: ${errorMessage(error)}`
      );
    }
  }

  createProduct(input: ProductCreateInput): ProductModel {
    try {
      const name = (input.name ?? "").trim();
      if (!name) {
        throw new InventoryRepositoryError("NAME_REQUIRED", "Il nome del prodotto è obbligatorio.");
      }
      const quantity = Number(input.quantity ?? 0);
      const minQuantity = Number(input.minQuantity ?? 0);
      const price = Number(input.price ?? 0);
      if (!Number.isFinite(quantity) || quantity < 0) {
        throw new InventoryRepositoryError("INVALID_QTY", "Quantità non valida.");
      }
      if (!Number.isFinite(minQuantity) || minQuantity < 0) {
        throw new InventoryRepositoryError("INVALID_MIN", "Soglia minima non valida.");
      }
      if (!Number.isFinite(price) || price < 0) {
        throw new InventoryRepositoryError("INVALID_PRICE", "Prezzo non valido.");
      }

      const now = nowIso();
      const model = new ProductModel({
        id: input.id?.trim() || createEntityId(),
        createdAt: now,
        updatedAt: now,
        code: (input.code ?? "").trim() || `PR-${Date.now().toString().slice(-6)}`,
        name,
        categoryId: (input.categoryId ?? "").trim(),
        categoryName: (input.categoryName ?? "").trim() || "Creme",
        supplier: (input.supplier ?? "").trim(),
        quantity,
        minQuantity,
        unit: (input.unit ?? "").trim() || "pz",
        price,
        expiry: (input.expiry ?? "").trim(),
        photoUrl: (input.photoUrl ?? "").trim(),
        metaJson: input.metaJson?.trim() || "{}"
      });

      this.db()
        .prepare(
          `INSERT INTO products (
            id, created_at, updated_at, code, name, category_id, category_name,
            supplier, quantity, min_quantity, unit, price, expiry, photo_url, meta_json
          ) VALUES (
            @id, @created_at, @updated_at, @code, @name, @category_id, @category_name,
            @supplier, @quantity, @min_quantity, @unit, @price, @expiry, @photo_url, @meta_json
          )`
        )
        .run(model.toMap());

      this.syncHooks.onLocalCreated?.(model);
      return model;
    } catch (error) {
      if (error instanceof InventoryRepositoryError) throw error;
      throw new InventoryRepositoryError(
        "CREATE_FAILED",
        `Impossibile creare il prodotto: ${errorMessage(error)}`
      );
    }
  }

  updateProduct(input: ProductUpdateInput): ProductModel {
    try {
      const existing = this.findProductById(input.id);
      if (!existing) {
        throw new InventoryRepositoryError("NOT_FOUND", "Prodotto non trovato.");
      }

      const name = input.name !== undefined ? input.name.trim() : existing.name;
      if (!name) {
        throw new InventoryRepositoryError("NAME_REQUIRED", "Il nome del prodotto è obbligatorio.");
      }

      let quantity = existing.quantity;
      if (input.quantity !== undefined) {
        quantity = Number(input.quantity);
        if (!Number.isFinite(quantity) || quantity < 0) {
          throw new InventoryRepositoryError("INVALID_QTY", "Quantità non valida.");
        }
      }

      let minQuantity = existing.minQuantity;
      if (input.minQuantity !== undefined) {
        minQuantity = Number(input.minQuantity);
        if (!Number.isFinite(minQuantity) || minQuantity < 0) {
          throw new InventoryRepositoryError("INVALID_MIN", "Soglia minima non valida.");
        }
      }

      let price = existing.price;
      if (input.price !== undefined) {
        price = Number(input.price);
        if (!Number.isFinite(price) || price < 0) {
          throw new InventoryRepositoryError("INVALID_PRICE", "Prezzo non valido.");
        }
      }

      const next = existing.copyWith({
        name,
        code: input.code !== undefined ? input.code.trim() || existing.code : existing.code,
        categoryId:
          input.categoryId !== undefined ? input.categoryId.trim() : existing.categoryId,
        categoryName:
          input.categoryName !== undefined
            ? input.categoryName.trim() || existing.categoryName
            : existing.categoryName,
        supplier: input.supplier !== undefined ? input.supplier.trim() : existing.supplier,
        quantity,
        minQuantity,
        unit: input.unit !== undefined ? input.unit.trim() || existing.unit : existing.unit,
        price,
        expiry: input.expiry !== undefined ? input.expiry.trim() : existing.expiry,
        photoUrl: input.photoUrl !== undefined ? input.photoUrl : existing.photoUrl,
        metaJson: input.metaJson !== undefined ? input.metaJson : existing.metaJson,
        updatedAt: nowIso()
      });

      this.persistProduct(next);
      this.syncHooks.onLocalUpdated?.(next);
      return next;
    } catch (error) {
      if (error instanceof InventoryRepositoryError) throw error;
      throw new InventoryRepositoryError(
        "UPDATE_FAILED",
        `Impossibile aggiornare il prodotto: ${errorMessage(error)}`
      );
    }
  }

  deleteProduct(id: string): void {
    try {
      const existing = this.findProductById(id);
      if (!existing) {
        throw new InventoryRepositoryError("NOT_FOUND", "Prodotto non trovato.");
      }
      const tx = this.db().transaction(() => {
        this.db().prepare(`DELETE FROM inventory_movements WHERE product_id = ?`).run(id);
        this.db().prepare(`DELETE FROM products WHERE id = ?`).run(id);
      });
      tx();
      this.syncHooks.onLocalDeleted?.(id);
    } catch (error) {
      if (error instanceof InventoryRepositoryError) throw error;
      throw new InventoryRepositoryError(
        "DELETE_FAILED",
        `Impossibile eliminare il prodotto: ${errorMessage(error)}`
      );
    }
  }

  renameSupplierOnProducts(fromName: string, toName: string): number {
    const from = fromName.trim();
    const to = toName.trim();
    if (!from || from.toLowerCase() === to.toLowerCase()) return 0;
    const info = this.db()
      .prepare(
        `UPDATE products SET supplier = ?, updated_at = ?
         WHERE LOWER(TRIM(supplier)) = LOWER(TRIM(?))`
      )
      .run(to, nowIso(), from);
    return Number(info.changes ?? 0);
  }

  createMovement(input: InventoryMovementCreateInput): InventoryMovementModel {
    try {
      const now = nowIso();
      const model = new InventoryMovementModel({
        id: input.id?.trim() || createEntityId(),
        createdAt: now,
        updatedAt: now,
        productId: input.productId,
        productName: (input.productName ?? "").trim(),
        kind: (input.kind ?? "scarico").trim() || "scarico",
        quantity: Number(input.quantity ?? 0),
        note: (input.note ?? "").trim(),
        operatorName: (input.operatorName ?? "").trim()
      });
      this.db()
        .prepare(
          `INSERT INTO inventory_movements (
            id, created_at, updated_at, product_id, product_name, kind, quantity, note, operator_name
          ) VALUES (
            @id, @created_at, @updated_at, @product_id, @product_name, @kind, @quantity, @note, @operator_name
          )`
        )
        .run(model.toMap());
      return model;
    } catch (error) {
      if (error instanceof InventoryRepositoryError) throw error;
      throw new InventoryRepositoryError(
        "MOVE_FAILED",
        `Impossibile registrare il movimento: ${errorMessage(error)}`
      );
    }
  }

  applyStockMove(input: InventoryMoveInput): ProductModel {
    const product = this.findProductById(input.productId);
    if (!product) {
      throw new InventoryRepositoryError("NOT_FOUND", "Prodotto non trovato.");
    }

    const qty = Number(input.quantity);
    if (!Number.isFinite(qty) || qty < 0) {
      throw new InventoryRepositoryError("INVALID_QTY", "Quantità non valida.");
    }
    if (input.kind !== "rettifica" && qty <= 0) {
      throw new InventoryRepositoryError("INVALID_QTY", "Inserisci una quantità valida.");
    }

    let nextQty = product.quantity;
    if (input.kind === "carico") nextQty = product.quantity + qty;
    if (input.kind === "scarico") nextQty = Math.max(0, product.quantity - qty);
    if (input.kind === "rettifica") nextQty = qty;

    const label =
      input.lastMovementLabel?.trim() ||
      (input.kind === "carico" ? "Carico" : input.kind === "scarico" ? "Scarico" : "Rettifica");

    let meta: Record<string, unknown> = {};
    try {
      meta = JSON.parse(product.metaJson || "{}") as Record<string, unknown>;
    } catch {
      meta = {};
    }
    meta.lastMovement = label;

    const tx = this.db().transaction(() => {
      this.createMovement({
        productId: product.id,
        productName: product.name,
        kind: input.kind,
        quantity: qty,
        note: input.note,
        operatorName: input.operatorName
      });
      return this.updateProduct({
        id: product.id,
        quantity: nextQty,
        metaJson: JSON.stringify(meta)
      });
    });

    return tx();
  }

  seedMany(rows: ProductData[]): number {
    const insert = this.db().prepare(
      `INSERT OR IGNORE INTO products (
        id, created_at, updated_at, code, name, category_id, category_name,
        supplier, quantity, min_quantity, unit, price, expiry, photo_url, meta_json
      ) VALUES (
        @id, @created_at, @updated_at, @code, @name, @category_id, @category_name,
        @supplier, @quantity, @min_quantity, @unit, @price, @expiry, @photo_url, @meta_json
      )`
    );
    const tx = this.db().transaction((items: ProductData[]) => {
      let n = 0;
      for (const item of items) {
        const info = insert.run(new ProductModel(item).toMap());
        n += info.changes;
      }
      return n;
    });
    return tx(rows);
  }

  seedMovements(rows: InventoryMovementData[]): number {
    const insert = this.db().prepare(
      `INSERT OR IGNORE INTO inventory_movements (
        id, created_at, updated_at, product_id, product_name, kind, quantity, note, operator_name
      ) VALUES (
        @id, @created_at, @updated_at, @product_id, @product_name, @kind, @quantity, @note, @operator_name
      )`
    );
    const tx = this.db().transaction((items: InventoryMovementData[]) => {
      let n = 0;
      for (const item of items) {
        const info = insert.run(new InventoryMovementModel(item).toMap());
        n += info.changes;
      }
      return n;
    });
    return tx(rows);
  }

  private persistProduct(model: ProductModel): void {
    this.db()
      .prepare(
        `UPDATE products SET
          updated_at = @updated_at,
          code = @code,
          name = @name,
          category_id = @category_id,
          category_name = @category_name,
          supplier = @supplier,
          quantity = @quantity,
          min_quantity = @min_quantity,
          unit = @unit,
          price = @price,
          expiry = @expiry,
          photo_url = @photo_url,
          meta_json = @meta_json
        WHERE id = @id`
      )
      .run(model.toMap());
  }
}

function errorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return String(error);
}
