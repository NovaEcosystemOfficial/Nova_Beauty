/**
 * InventoryRepository — prodotti e movimenti magazzino.
 * Sprint 1: struttura pronta; nessuna mutazione collegata alla UI.
 */
import { InventoryMovementModel } from "../models/InventoryMovement";
import { ProductModel } from "../models/Product";
import type { SqlMap } from "../core/types";
import { BaseRepository } from "./BaseRepository";

export class InventoryRepository extends BaseRepository {
  constructor() {
    super("products");
  }

  findAllProducts(): ProductModel[] {
    const rows = this.db().prepare(`SELECT * FROM products ORDER BY name ASC`).all() as SqlMap[];
    return rows.map((row) => ProductModel.fromMap(row));
  }

  findProductById(id: string): ProductModel | null {
    const row = this.db().prepare(`SELECT * FROM products WHERE id = ?`).get(id) as SqlMap | undefined;
    return row ? ProductModel.fromMap(row) : null;
  }

  findAllMovements(): InventoryMovementModel[] {
    const rows = this.db()
      .prepare(`SELECT * FROM inventory_movements ORDER BY created_at DESC`)
      .all() as SqlMap[];
    return rows.map((row) => InventoryMovementModel.fromMap(row));
  }

  createProduct(_model: ProductModel): never {
    throw new Error("InventoryRepository.createProduct non implementato (Sprint CRUD).");
  }

  updateProduct(_model: ProductModel): never {
    throw new Error("InventoryRepository.updateProduct non implementato (Sprint CRUD).");
  }

  deleteProduct(_id: string): never {
    throw new Error("InventoryRepository.deleteProduct non implementato (Sprint CRUD).");
  }

  createMovement(_model: InventoryMovementModel): never {
    throw new Error("InventoryRepository.createMovement non implementato (Sprint CRUD).");
  }
}
