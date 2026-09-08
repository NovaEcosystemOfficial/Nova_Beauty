/**
 * Model Fornitore — tabella `suppliers`.
 */
import { createEntityId, nowIso, readString, type SqlMap } from "../core/types";
import type { EntityTimestamps } from "./BaseEntity";

export type SupplierStatus = "attivo" | "disattivo";
export type SupplierReorderMethod = "sito" | "email" | "whatsapp" | "telefono" | "manuale";

export type SupplierLinkedProduct = {
  name: string;
  sku: string;
  stockHint: string;
};

export type SupplierData = EntityTimestamps & {
  name: string;
  category: string;
  status: SupplierStatus;
  contact: string;
  phone: string;
  email: string;
  notes: string;
  metaJson: string;
};

export type SupplierDto = SupplierData & {
  productsCount: number;
  linkedProducts: SupplierLinkedProduct[];
};

export type SupplierListQuery = {
  search?: string;
  status?: SupplierStatus | "tutti";
  category?: string;
};

export type SupplierCreateInput = {
  name: string;
  category?: string;
  status?: SupplierStatus;
  contact?: string;
  phone?: string;
  email?: string;
  notes?: string;
  metaJson?: string;
  id?: string;
};

export type SupplierUpdateInput = Partial<Omit<SupplierCreateInput, "id">> & {
  id: string;
};

export class SupplierModel {
  readonly id: string;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly name: string;
  readonly category: string;
  readonly status: SupplierStatus;
  readonly contact: string;
  readonly phone: string;
  readonly email: string;
  readonly notes: string;
  readonly metaJson: string;

  constructor(data: SupplierData) {
    this.id = data.id;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
    this.name = data.name;
    this.category = data.category;
    this.status = data.status;
    this.contact = data.contact;
    this.phone = data.phone;
    this.email = data.email;
    this.notes = data.notes;
    this.metaJson = data.metaJson;
  }

  static fromMap(map: SqlMap): SupplierModel {
    const statusRaw = readString(map, "status", "attivo");
    const status: SupplierStatus = statusRaw === "disattivo" ? "disattivo" : "attivo";
    return new SupplierModel({
      id: readString(map, "id") || createEntityId(),
      createdAt: readString(map, "created_at", readString(map, "createdAt", nowIso())),
      updatedAt: readString(map, "updated_at", readString(map, "updatedAt", nowIso())),
      name: readString(map, "name"),
      category: readString(map, "category"),
      status,
      contact: readString(map, "contact"),
      phone: readString(map, "phone"),
      email: readString(map, "email"),
      notes: readString(map, "notes"),
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
      status: this.status,
      contact: this.contact,
      phone: this.phone,
      email: this.email,
      notes: this.notes,
      meta_json: this.metaJson || "{}"
    };
  }

  toDto(): SupplierData {
    return {
      id: this.id,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      name: this.name,
      category: this.category,
      status: this.status,
      contact: this.contact,
      phone: this.phone,
      email: this.email,
      notes: this.notes,
      metaJson: this.metaJson
    };
  }

  copyWith(patch: Partial<SupplierData>): SupplierModel {
    return new SupplierModel({
      id: patch.id ?? this.id,
      createdAt: patch.createdAt ?? this.createdAt,
      updatedAt: patch.updatedAt ?? nowIso(),
      name: patch.name ?? this.name,
      category: patch.category ?? this.category,
      status: patch.status ?? this.status,
      contact: patch.contact ?? this.contact,
      phone: patch.phone ?? this.phone,
      email: patch.email ?? this.email,
      notes: patch.notes ?? this.notes,
      metaJson: patch.metaJson ?? this.metaJson
    });
  }
}
