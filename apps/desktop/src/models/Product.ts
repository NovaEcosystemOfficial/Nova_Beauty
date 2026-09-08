/**
 * Model Prodotto magazzino — tabella `products`.
 */
import { createEntityId, nowIso, readNumber, readString, type SqlMap } from "../core/types";
import type { EntityTimestamps } from "./BaseEntity";

export type ProductData = EntityTimestamps & {
  code: string;
  name: string;
  categoryId: string;
  categoryName: string;
  supplier: string;
  quantity: number;
  minQuantity: number;
  unit: string;
  price: number;
  expiry: string;
  photoUrl: string;
  /** JSON: barcode, location, lot, lastMovement, imageTone */
  metaJson: string;
};

export type ProductListQuery = {
  search?: string;
  category?: string;
};

export type ProductCreateInput = {
  name: string;
  code?: string;
  categoryId?: string;
  categoryName?: string;
  supplier?: string;
  quantity?: number;
  minQuantity?: number;
  unit?: string;
  price?: number;
  expiry?: string;
  photoUrl?: string;
  metaJson?: string;
  id?: string;
};

export type ProductUpdateInput = Partial<Omit<ProductCreateInput, "id">> & {
  id: string;
};

export type MovementKind = "carico" | "scarico" | "rettifica";

export type InventoryMoveInput = {
  productId: string;
  kind: MovementKind;
  quantity: number;
  note?: string;
  operatorName?: string;
  lastMovementLabel?: string;
};

export class ProductModel {
  readonly id: string;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly code: string;
  readonly name: string;
  readonly categoryId: string;
  readonly categoryName: string;
  readonly supplier: string;
  readonly quantity: number;
  readonly minQuantity: number;
  readonly unit: string;
  readonly price: number;
  readonly expiry: string;
  readonly photoUrl: string;
  readonly metaJson: string;

  constructor(data: ProductData) {
    this.id = data.id;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
    this.code = data.code;
    this.name = data.name;
    this.categoryId = data.categoryId;
    this.categoryName = data.categoryName;
    this.supplier = data.supplier;
    this.quantity = data.quantity;
    this.minQuantity = data.minQuantity;
    this.unit = data.unit;
    this.price = data.price;
    this.expiry = data.expiry;
    this.photoUrl = data.photoUrl;
    this.metaJson = data.metaJson;
  }

  static fromMap(map: SqlMap): ProductModel {
    return new ProductModel({
      id: readString(map, "id") || createEntityId(),
      createdAt: readString(map, "created_at", readString(map, "createdAt", nowIso())),
      updatedAt: readString(map, "updated_at", readString(map, "updatedAt", nowIso())),
      code: readString(map, "code"),
      name: readString(map, "name"),
      categoryId: readString(map, "category_id", readString(map, "categoryId")),
      categoryName: readString(map, "category_name", readString(map, "categoryName")),
      supplier: readString(map, "supplier"),
      quantity: readNumber(map, "quantity"),
      minQuantity: readNumber(map, "min_quantity", readNumber(map, "minQuantity")),
      unit: readString(map, "unit", "pz"),
      price: readNumber(map, "price"),
      expiry: readString(map, "expiry"),
      photoUrl: readString(map, "photo_url", readString(map, "photoUrl")),
      metaJson: readString(map, "meta_json", readString(map, "metaJson", "{}"))
    });
  }

  toMap(): SqlMap {
    return {
      id: this.id,
      created_at: this.createdAt,
      updated_at: this.updatedAt,
      code: this.code,
      name: this.name,
      category_id: this.categoryId,
      category_name: this.categoryName,
      supplier: this.supplier,
      quantity: this.quantity,
      min_quantity: this.minQuantity,
      unit: this.unit,
      price: this.price,
      expiry: this.expiry,
      photo_url: this.photoUrl,
      meta_json: this.metaJson || "{}"
    };
  }

  toDto(): ProductData {
    return {
      id: this.id,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      code: this.code,
      name: this.name,
      categoryId: this.categoryId,
      categoryName: this.categoryName,
      supplier: this.supplier,
      quantity: this.quantity,
      minQuantity: this.minQuantity,
      unit: this.unit,
      price: this.price,
      expiry: this.expiry,
      photoUrl: this.photoUrl,
      metaJson: this.metaJson
    };
  }

  copyWith(patch: Partial<ProductData>): ProductModel {
    return new ProductModel({
      id: patch.id ?? this.id,
      createdAt: patch.createdAt ?? this.createdAt,
      updatedAt: patch.updatedAt ?? nowIso(),
      code: patch.code ?? this.code,
      name: patch.name ?? this.name,
      categoryId: patch.categoryId ?? this.categoryId,
      categoryName: patch.categoryName ?? this.categoryName,
      supplier: patch.supplier ?? this.supplier,
      quantity: patch.quantity ?? this.quantity,
      minQuantity: patch.minQuantity ?? this.minQuantity,
      unit: patch.unit ?? this.unit,
      price: patch.price ?? this.price,
      expiry: patch.expiry ?? this.expiry,
      photoUrl: patch.photoUrl ?? this.photoUrl,
      metaJson: patch.metaJson ?? this.metaJson
    });
  }
}
