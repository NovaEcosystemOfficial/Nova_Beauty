/**
 * Model Servizio — tabella `services`.
 * Sprint 4: CRUD + ricerca/ordinamento; `metaJson` per campi UI (descrizione, tone…).
 */
import { createEntityId, nowIso, readBool, readNumber, readString, type SqlMap } from "../core/types";
import type { EntityTimestamps } from "./BaseEntity";

export type ServiceData = EntityTimestamps & {
  name: string;
  category: string;
  durationMin: number;
  price: number;
  products: string;
  operatorsJson: string;
  color: string;
  active: boolean;
  /** JSON opaco: description, lastEdited, tone, soldCount, cabin */
  metaJson: string;
};

/** Ordinamenti lista servizi (repository + IPC). */
export type ServiceSort =
  | "name_asc"
  | "name_desc"
  | "price_asc"
  | "price_desc"
  | "duration_asc"
  | "duration_desc"
  | "category_asc"
  | "updated_desc";

/** Query lista / ricerca servizi. */
export type ServiceListQuery = {
  search?: string;
  sort?: ServiceSort;
  category?: string;
  activeOnly?: boolean;
  inactiveOnly?: boolean;
};

/** Input creazione servizio. */
export type ServiceCreateInput = {
  name: string;
  category?: string;
  durationMin?: number;
  price?: number;
  products?: string;
  operatorsJson?: string;
  color?: string;
  active?: boolean;
  metaJson?: string;
  /** Se valorizzato (seed), usa questo id. */
  id?: string;
};

/** Input aggiornamento servizio. */
export type ServiceUpdateInput = Partial<Omit<ServiceCreateInput, "id">> & {
  id: string;
};

export class ServiceModel {
  readonly id: string;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly name: string;
  readonly category: string;
  readonly durationMin: number;
  readonly price: number;
  readonly products: string;
  readonly operatorsJson: string;
  readonly color: string;
  readonly active: boolean;
  readonly metaJson: string;

  constructor(data: ServiceData) {
    this.id = data.id;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
    this.name = data.name;
    this.category = data.category;
    this.durationMin = data.durationMin;
    this.price = data.price;
    this.products = data.products;
    this.operatorsJson = data.operatorsJson;
    this.color = data.color;
    this.active = data.active;
    this.metaJson = data.metaJson;
  }

  static fromMap(map: SqlMap): ServiceModel {
    return new ServiceModel({
      id: readString(map, "id") || createEntityId(),
      createdAt: readString(map, "created_at", readString(map, "createdAt", nowIso())),
      updatedAt: readString(map, "updated_at", readString(map, "updatedAt", nowIso())),
      name: readString(map, "name"),
      category: readString(map, "category"),
      durationMin: readNumber(map, "duration_min", readNumber(map, "durationMin", 60)),
      price: readNumber(map, "price"),
      products: readString(map, "products"),
      operatorsJson: readString(map, "operators_json", readString(map, "operatorsJson", "[]")),
      color: readString(map, "color", "#c48a97"),
      active: readBool(map, "active", true),
      metaJson: readString(map, "meta_json", readString(map, "metaJson", "{}"))
    });
  }

  toMap(): SqlMap {
    return {
      id: this.id,
      created_at: this.createdAt,
      updated_at: this.updatedAt,
      name: this.name,
      category: this.category,
      duration_min: this.durationMin,
      price: this.price,
      products: this.products,
      operators_json: this.operatorsJson,
      color: this.color,
      active: this.active ? 1 : 0,
      meta_json: this.metaJson || "{}"
    };
  }

  toDto(): ServiceData {
    return {
      id: this.id,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      name: this.name,
      category: this.category,
      durationMin: this.durationMin,
      price: this.price,
      products: this.products,
      operatorsJson: this.operatorsJson,
      color: this.color,
      active: this.active,
      metaJson: this.metaJson
    };
  }

  copyWith(patch: Partial<ServiceData>): ServiceModel {
    return new ServiceModel({
      id: patch.id ?? this.id,
      createdAt: patch.createdAt ?? this.createdAt,
      updatedAt: patch.updatedAt ?? nowIso(),
      name: patch.name ?? this.name,
      category: patch.category ?? this.category,
      durationMin: patch.durationMin ?? this.durationMin,
      price: patch.price ?? this.price,
      products: patch.products ?? this.products,
      operatorsJson: patch.operatorsJson ?? this.operatorsJson,
      color: patch.color ?? this.color,
      active: patch.active ?? this.active,
      metaJson: patch.metaJson ?? this.metaJson
    });
  }
}
