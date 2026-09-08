/**
 * Model Operatore — tabella `operators`.
 */
import { createEntityId, nowIso, readString, type SqlMap } from "../core/types";
import type { EntityTimestamps } from "./BaseEntity";

export type OperatorData = EntityTimestamps & {
  name: string;
  role: string;
  email: string;
  phone: string;
  status: string;
  color: string;
};

export class OperatorModel {
  readonly id: string;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly name: string;
  readonly role: string;
  readonly email: string;
  readonly phone: string;
  readonly status: string;
  readonly color: string;

  constructor(data: OperatorData) {
    this.id = data.id;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
    this.name = data.name;
    this.role = data.role;
    this.email = data.email;
    this.phone = data.phone;
    this.status = data.status;
    this.color = data.color;
  }

  static fromMap(map: SqlMap): OperatorModel {
    return new OperatorModel({
      id: readString(map, "id") || createEntityId(),
      createdAt: readString(map, "created_at", readString(map, "createdAt", nowIso())),
      updatedAt: readString(map, "updated_at", readString(map, "updatedAt", nowIso())),
      name: readString(map, "name"),
      role: readString(map, "role"),
      email: readString(map, "email"),
      phone: readString(map, "phone"),
      status: readString(map, "status", "attivo"),
      color: readString(map, "color", "#c48a97")
    });
  }

  toMap(): SqlMap {
    return {
      id: this.id,
      created_at: this.createdAt,
      updated_at: this.updatedAt,
      name: this.name,
      role: this.role,
      email: this.email,
      phone: this.phone,
      status: this.status,
      color: this.color
    };
  }

  copyWith(patch: Partial<OperatorData>): OperatorModel {
    return new OperatorModel({
      id: patch.id ?? this.id,
      createdAt: patch.createdAt ?? this.createdAt,
      updatedAt: patch.updatedAt ?? nowIso(),
      name: patch.name ?? this.name,
      role: patch.role ?? this.role,
      email: patch.email ?? this.email,
      phone: patch.phone ?? this.phone,
      status: patch.status ?? this.status,
      color: patch.color ?? this.color
    });
  }
}
