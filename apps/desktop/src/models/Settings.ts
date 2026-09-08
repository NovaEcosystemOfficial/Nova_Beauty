/**
 * Model Impostazione chiave/valore — tabella `settings`.
 */
import { createEntityId, nowIso, readString, type SqlMap } from "../core/types";
import type { EntityTimestamps } from "./BaseEntity";

export type SettingsData = EntityTimestamps & {
  key: string;
  value: string;
  scope: string;
};

export class SettingsModel {
  readonly id: string;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly key: string;
  readonly value: string;
  readonly scope: string;

  constructor(data: SettingsData) {
    this.id = data.id;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
    this.key = data.key;
    this.value = data.value;
    this.scope = data.scope;
  }

  static fromMap(map: SqlMap): SettingsModel {
    return new SettingsModel({
      id: readString(map, "id") || createEntityId(),
      createdAt: readString(map, "created_at", readString(map, "createdAt", nowIso())),
      updatedAt: readString(map, "updated_at", readString(map, "updatedAt", nowIso())),
      key: readString(map, "key"),
      value: readString(map, "value"),
      scope: readString(map, "scope", "app")
    });
  }

  toMap(): SqlMap {
    return {
      id: this.id,
      created_at: this.createdAt,
      updated_at: this.updatedAt,
      key: this.key,
      value: this.value,
      scope: this.scope
    };
  }

  copyWith(patch: Partial<SettingsData>): SettingsModel {
    return new SettingsModel({
      id: patch.id ?? this.id,
      createdAt: patch.createdAt ?? this.createdAt,
      updatedAt: patch.updatedAt ?? nowIso(),
      key: patch.key ?? this.key,
      value: patch.value ?? this.value,
      scope: patch.scope ?? this.scope
    });
  }
}
