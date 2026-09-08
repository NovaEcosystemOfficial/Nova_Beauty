/**
 * Model Cliente — tabella `clients`.
 * Campi Sprint 2: nome, cognome, telefono, email, nascita, note, stato + timestamp.
 * `profileJson` conserva metadati UI demo (fidelity, storico…) senza perdere la Sprint 0.
 */
import { createEntityId, nowIso, readBool, readString, type SqlMap } from "../core/types";
import type { EntityTimestamps } from "./BaseEntity";

/** Stato operativo del cliente (UI). */
export type ClientStatus = "attivo" | "inattivo" | "nuovo";

/**
 * Stato sync locale → cloud (Firestore futuro).
 * Solo marker: nessuna chiamata remota in Sprint 2.
 */
export type ClientSyncStatus = "local" | "pending_push" | "synced" | "conflict";

export type ClientData = EntityTimestamps & {
  firstName: string;
  lastName: string;
  /** Nome completo denormalizzato (ricerca / UI). */
  name: string;
  phone: string;
  email: string;
  birthday: string;
  notes: string;
  favorite: boolean;
  status: ClientStatus;
  /** JSON opaco per campi UI demo / estensioni. */
  profileJson: string;
  syncStatus: ClientSyncStatus;
};

/** Ordinamenti lista clienti (repository + IPC). */
export type ClientSort =
  | "name_asc"
  | "name_desc"
  | "created_desc"
  | "updated_desc";

/** Query lista / ricerca clienti. */
export type ClientListQuery = {
  search?: string;
  sort?: ClientSort;
  status?: ClientStatus | "tutti";
  favoritesOnly?: boolean;
};

/** Input creazione cliente. */
export type ClientCreateInput = {
  firstName: string;
  lastName: string;
  phone?: string;
  email?: string;
  birthday?: string;
  notes?: string;
  favorite?: boolean;
  status?: ClientStatus;
  profileJson?: string;
};

/** Input aggiornamento cliente. */
export type ClientUpdateInput = Partial<ClientCreateInput> & {
  id: string;
};

export class ClientModel {
  readonly id: string;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly firstName: string;
  readonly lastName: string;
  readonly name: string;
  readonly phone: string;
  readonly email: string;
  readonly birthday: string;
  readonly notes: string;
  readonly favorite: boolean;
  readonly status: ClientStatus;
  readonly profileJson: string;
  readonly syncStatus: ClientSyncStatus;

  constructor(data: ClientData) {
    this.id = data.id;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
    this.firstName = data.firstName;
    this.lastName = data.lastName;
    this.name = data.name || `${data.firstName} ${data.lastName}`.trim();
    this.phone = data.phone;
    this.email = data.email;
    this.birthday = data.birthday;
    this.notes = data.notes;
    this.favorite = data.favorite;
    this.status = data.status;
    this.profileJson = data.profileJson;
    this.syncStatus = data.syncStatus;
  }

  /** Compone il nome visualizzato. */
  static displayName(firstName: string, lastName: string): string {
    return `${firstName.trim()} ${lastName.trim()}`.trim();
  }

  static fromMap(map: SqlMap): ClientModel {
    const firstName = readString(map, "first_name", readString(map, "firstName"));
    const lastName = readString(map, "last_name", readString(map, "lastName"));
    const legacyName = readString(map, "name");
    let fn = firstName;
    let ln = lastName;
    if (!fn && !ln && legacyName) {
      const parts = legacyName.split(/\s+/).filter(Boolean);
      fn = parts[0] ?? "";
      ln = parts.slice(1).join(" ");
    }
    const statusRaw = readString(map, "status", "attivo");
    const status: ClientStatus =
      statusRaw === "inattivo" || statusRaw === "nuovo" || statusRaw === "attivo"
        ? statusRaw
        : "attivo";
    const syncRaw = readString(map, "sync_status", readString(map, "syncStatus", "local"));
    const syncStatus: ClientSyncStatus =
      syncRaw === "pending_push" || syncRaw === "synced" || syncRaw === "conflict"
        ? syncRaw
        : "local";

    return new ClientModel({
      id: readString(map, "id") || createEntityId(),
      createdAt: readString(map, "created_at", readString(map, "createdAt", nowIso())),
      updatedAt: readString(map, "updated_at", readString(map, "updatedAt", nowIso())),
      firstName: fn,
      lastName: ln,
      name: legacyName || ClientModel.displayName(fn, ln),
      phone: readString(map, "phone"),
      email: readString(map, "email"),
      birthday: readString(map, "birthday"),
      notes: readString(map, "notes"),
      favorite: readBool(map, "favorite"),
      status,
      profileJson: readString(map, "profile_json", readString(map, "profileJson", "{}")),
      syncStatus
    });
  }

  toMap(): SqlMap {
    return {
      id: this.id,
      created_at: this.createdAt,
      updated_at: this.updatedAt,
      first_name: this.firstName,
      last_name: this.lastName,
      name: this.name || ClientModel.displayName(this.firstName, this.lastName),
      phone: this.phone,
      email: this.email,
      birthday: this.birthday,
      notes: this.notes,
      favorite: this.favorite ? 1 : 0,
      status: this.status,
      profile_json: this.profileJson || "{}",
      sync_status: this.syncStatus
    };
  }

  /** DTO serializzabile via IPC (plain object). */
  toDto(): ClientData {
    return {
      id: this.id,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      firstName: this.firstName,
      lastName: this.lastName,
      name: this.name,
      phone: this.phone,
      email: this.email,
      birthday: this.birthday,
      notes: this.notes,
      favorite: this.favorite,
      status: this.status,
      profileJson: this.profileJson,
      syncStatus: this.syncStatus
    };
  }

  copyWith(patch: Partial<ClientData>): ClientModel {
    const firstName = patch.firstName ?? this.firstName;
    const lastName = patch.lastName ?? this.lastName;
    return new ClientModel({
      id: patch.id ?? this.id,
      createdAt: patch.createdAt ?? this.createdAt,
      updatedAt: patch.updatedAt ?? nowIso(),
      firstName,
      lastName,
      name: patch.name ?? ClientModel.displayName(firstName, lastName),
      phone: patch.phone ?? this.phone,
      email: patch.email ?? this.email,
      birthday: patch.birthday ?? this.birthday,
      notes: patch.notes ?? this.notes,
      favorite: patch.favorite ?? this.favorite,
      status: patch.status ?? this.status,
      profileJson: patch.profileJson ?? this.profileJson,
      syncStatus: patch.syncStatus ?? this.syncStatus
    });
  }
}
