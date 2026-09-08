/**
 * Model Movimento magazzino — tabella `inventory_movements`.
 */
import { createEntityId, nowIso, readNumber, readString, type SqlMap } from "../core/types";
import type { EntityTimestamps } from "./BaseEntity";

export type InventoryMovementData = EntityTimestamps & {
  productId: string;
  productName: string;
  kind: string;
  quantity: number;
  note: string;
  operatorName: string;
};

export type InventoryMovementCreateInput = {
  productId: string;
  productName?: string;
  kind: string;
  quantity: number;
  note?: string;
  operatorName?: string;
  id?: string;
};

export class InventoryMovementModel {
  readonly id: string;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly productId: string;
  readonly productName: string;
  readonly kind: string;
  readonly quantity: number;
  readonly note: string;
  readonly operatorName: string;

  constructor(data: InventoryMovementData) {
    this.id = data.id;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
    this.productId = data.productId;
    this.productName = data.productName;
    this.kind = data.kind;
    this.quantity = data.quantity;
    this.note = data.note;
    this.operatorName = data.operatorName;
  }

  static fromMap(map: SqlMap): InventoryMovementModel {
    return new InventoryMovementModel({
      id: readString(map, "id") || createEntityId(),
      createdAt: readString(map, "created_at", readString(map, "createdAt", nowIso())),
      updatedAt: readString(map, "updated_at", readString(map, "updatedAt", nowIso())),
      productId: readString(map, "product_id", readString(map, "productId")),
      productName: readString(map, "product_name", readString(map, "productName")),
      kind: readString(map, "kind", "scarico"),
      quantity: readNumber(map, "quantity"),
      note: readString(map, "note"),
      operatorName: readString(map, "operator_name", readString(map, "operatorName"))
    });
  }

  toMap(): SqlMap {
    return {
      id: this.id,
      created_at: this.createdAt,
      updated_at: this.updatedAt,
      product_id: this.productId,
      product_name: this.productName,
      kind: this.kind,
      quantity: this.quantity,
      note: this.note,
      operator_name: this.operatorName
    };
  }

  toDto(): InventoryMovementData {
    return {
      id: this.id,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      productId: this.productId,
      productName: this.productName,
      kind: this.kind,
      quantity: this.quantity,
      note: this.note,
      operatorName: this.operatorName
    };
  }

  copyWith(patch: Partial<InventoryMovementData>): InventoryMovementModel {
    return new InventoryMovementModel({
      id: patch.id ?? this.id,
      createdAt: patch.createdAt ?? this.createdAt,
      updatedAt: patch.updatedAt ?? nowIso(),
      productId: patch.productId ?? this.productId,
      productName: patch.productName ?? this.productName,
      kind: patch.kind ?? this.kind,
      quantity: patch.quantity ?? this.quantity,
      note: patch.note ?? this.note,
      operatorName: patch.operatorName ?? this.operatorName
    });
  }
}
