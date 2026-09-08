/**
 * Model Backup — tabella `backups`.
 */
import { createEntityId, nowIso, readNumber, readString, type SqlMap } from "../core/types";
import type { EntityTimestamps } from "./BaseEntity";

export type BackupData = EntityTimestamps & {
  kind: string;
  status: string;
  sizeBytes: number;
  path: string;
  note: string;
};

export class BackupModel {
  readonly id: string;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly kind: string;
  readonly status: string;
  readonly sizeBytes: number;
  readonly path: string;
  readonly note: string;

  constructor(data: BackupData) {
    this.id = data.id;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
    this.kind = data.kind;
    this.status = data.status;
    this.sizeBytes = data.sizeBytes;
    this.path = data.path;
    this.note = data.note;
  }

  static fromMap(map: SqlMap): BackupModel {
    return new BackupModel({
      id: readString(map, "id") || createEntityId(),
      createdAt: readString(map, "created_at", readString(map, "createdAt", nowIso())),
      updatedAt: readString(map, "updated_at", readString(map, "updatedAt", nowIso())),
      kind: readString(map, "kind", "manuale"),
      status: readString(map, "status", "successo"),
      sizeBytes: readNumber(map, "size_bytes", readNumber(map, "sizeBytes")),
      path: readString(map, "path"),
      note: readString(map, "note")
    });
  }

  toMap(): SqlMap {
    return {
      id: this.id,
      created_at: this.createdAt,
      updated_at: this.updatedAt,
      kind: this.kind,
      status: this.status,
      size_bytes: this.sizeBytes,
      path: this.path,
      note: this.note
    };
  }

  copyWith(patch: Partial<BackupData>): BackupModel {
    return new BackupModel({
      id: patch.id ?? this.id,
      createdAt: patch.createdAt ?? this.createdAt,
      updatedAt: patch.updatedAt ?? nowIso(),
      kind: patch.kind ?? this.kind,
      status: patch.status ?? this.status,
      sizeBytes: patch.sizeBytes ?? this.sizeBytes,
      path: patch.path ?? this.path,
      note: patch.note ?? this.note
    });
  }
}
