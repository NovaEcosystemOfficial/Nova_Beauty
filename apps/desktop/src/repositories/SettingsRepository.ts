/**
 * SettingsRepository — accesso tabella `settings` (+ center in sola lettura).
 * Sprint 1: struttura pronta; nessuna mutazione collegata alla UI.
 */
import { CenterModel } from "../models/Center";
import { SettingsModel } from "../models/Settings";
import type { SqlMap } from "../core/types";
import { BaseRepository } from "./BaseRepository";

export class SettingsRepository extends BaseRepository {
  constructor() {
    super("settings");
  }

  findAll(): SettingsModel[] {
    const rows = this.db().prepare(`SELECT * FROM settings ORDER BY key ASC`).all() as SqlMap[];
    return rows.map((row) => SettingsModel.fromMap(row));
  }

  findByKey(key: string): SettingsModel | null {
    const row = this.db().prepare(`SELECT * FROM settings WHERE key = ?`).get(key) as
      | SqlMap
      | undefined;
    return row ? SettingsModel.fromMap(row) : null;
  }

  /** Profilo centro (0..N righe; tipicamente 0 o 1). */
  findCenter(): CenterModel | null {
    const row = this.db().prepare(`SELECT * FROM center LIMIT 1`).get() as SqlMap | undefined;
    return row ? CenterModel.fromMap(row) : null;
  }

  upsert(_model: SettingsModel): never {
    throw new Error("SettingsRepository.upsert non implementato (Sprint CRUD).");
  }

  deleteByKey(_key: string): never {
    throw new Error("SettingsRepository.deleteByKey non implementato (Sprint CRUD).");
  }
}
