/**
 * Model Categoria — tabella `categories`.
 */
import { createEntityId, nowIso, readNumber, readString, type SqlMap } from "../core/types";
import type { EntityTimestamps } from "./BaseEntity";

export type CategoryData = EntityTimestamps & {
  name: string;
  kind: string;
  sortOrder: number;
};

export class CategoryModel {
  readonly id: string;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly name: string;
  readonly kind: string;
  readonly sortOrder: number;

  constructor(data: CategoryData) {
    this.id = data.id;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
    this.name = data.name;
    this.kind = data.kind;
    this.sortOrder = data.sortOrder;
  }

  static fromMap(map: SqlMap): CategoryModel {
    return new CategoryModel({
      id: readString(map, "id") || createEntityId(),
      createdAt: readString(map, "created_at", readString(map, "createdAt", nowIso())),
      updatedAt: readString(map, "updated_at", readString(map, "updatedAt", nowIso())),
      name: readString(map, "name"),
      kind: readString(map, "kind", "service"),
      sortOrder: readNumber(map, "sort_order", readNumber(map, "sortOrder"))
    });
  }

  toMap(): SqlMap {
    return {
      id: this.id,
      created_at: this.createdAt,
      updated_at: this.updatedAt,
      name: this.name,
      kind: this.kind,
      sort_order: this.sortOrder
    };
  }

  copyWith(patch: Partial<CategoryData>): CategoryModel {
    return new CategoryModel({
      id: patch.id ?? this.id,
      createdAt: patch.createdAt ?? this.createdAt,
      updatedAt: patch.updatedAt ?? nowIso(),
      name: patch.name ?? this.name,
      kind: patch.kind ?? this.kind,
      sortOrder: patch.sortOrder ?? this.sortOrder
    });
  }
}
