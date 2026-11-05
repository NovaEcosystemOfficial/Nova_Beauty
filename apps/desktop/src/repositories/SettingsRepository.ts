/**
 * SettingsRepository — accesso tabella `settings` e profilo `center`.
 */
import { createEntityId, nowIso, type SqlMap } from "../core/types";
import {
  CenterModel,
  DEFAULT_CENTER_NAME,
  DEFAULT_CENTER_PROFILE,
  type CenterProfile
} from "../models/Center";
import { SettingsModel } from "../models/Settings";
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

  /** Crea la riga studio se manca. Non inserisce clienti o altri dati demo. */
  ensureCenter(): CenterModel {
    const existing = this.findCenter();
    if (existing) return existing;

    const now = nowIso();
    const model = new CenterModel({
      id: createEntityId(),
      createdAt: now,
      updatedAt: now,
      ...DEFAULT_CENTER_PROFILE
    });
    const map = model.toMap();
    this.db()
      .prepare(
        `INSERT INTO center (
          id, created_at, updated_at, name, slogan, address, phone, email, logo_url, owner_name
        ) VALUES (
          @id, @created_at, @updated_at, @name, @slogan, @address, @phone, @email, @logo_url, @owner_name
        )`
      )
      .run(map);
    return model;
  }

  /** Aggiorna il profilo studio. I campi assenti nel patch restano invariati. */
  saveCenter(patch: Partial<CenterProfile>): CenterModel {
    const current = this.ensureCenter();
    const next = current.copyWith({
      name:
        patch.name !== undefined
          ? patch.name.trim() || DEFAULT_CENTER_NAME
          : current.name,
      slogan: patch.slogan !== undefined ? patch.slogan : current.slogan,
      address: patch.address !== undefined ? patch.address : current.address,
      phone: patch.phone !== undefined ? patch.phone : current.phone,
      email: patch.email !== undefined ? patch.email : current.email,
      logoUrl: patch.logoUrl !== undefined ? patch.logoUrl : current.logoUrl,
      ownerName: patch.ownerName !== undefined ? patch.ownerName.trim() : current.ownerName
    });
    this.db()
      .prepare(
        `UPDATE center SET
          updated_at = @updated_at,
          name = @name,
          slogan = @slogan,
          address = @address,
          phone = @phone,
          email = @email,
          logo_url = @logo_url,
          owner_name = @owner_name
        WHERE id = @id`
      )
      .run(next.toMap());
    return next;
  }

  upsert(_model: SettingsModel): never {
    throw new Error("SettingsRepository.upsert non implementato (Sprint CRUD).");
  }

  deleteByKey(_key: string): never {
    throw new Error("SettingsRepository.deleteByKey non implementato (Sprint CRUD).");
  }
}
