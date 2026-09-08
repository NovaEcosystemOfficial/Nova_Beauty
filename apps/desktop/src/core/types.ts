/**
 * NovaBeauty Core — tipi e utilità condivise del motore dati locale.
 *
 * Sprint 1: fondazione. Nessuna UI, nessuna sync, nessun CRUD operativo.
 */

/** Campi obbligatori di ogni entità persistita. */
export type EntityTimestamps = {
  /** Identificativo univoco (UUID v4 string). */
  id: string;
  /** ISO-8601 di creazione. */
  createdAt: string;
  /** ISO-8601 di ultimo aggiornamento. */
  updatedAt: string;
};

/** Riga grezza SQLite (valori serializzati). */
export type SqlMap = Record<string, unknown>;

/**
 * Genera un id univoco compatibile browser/Node.
 * Preferisce `crypto.randomUUID` quando disponibile.
 */
export function createEntityId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  // Fallback deterministico-abbastanza per ambienti senza Web Crypto.
  return `nb_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

/** Timestamp ISO UTC corrente. */
export function nowIso(): string {
  return new Date().toISOString();
}

/**
 * Legge una stringa da map SQLite in modo difensivo.
 */
export function readString(map: SqlMap, key: string, fallback = ""): string {
  const value = map[key];
  if (value == null) return fallback;
  return String(value);
}

/**
 * Legge un numero da map SQLite in modo difensivo.
 */
export function readNumber(map: SqlMap, key: string, fallback = 0): number {
  const value = map[key];
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    const n = Number(value);
    return Number.isFinite(n) ? n : fallback;
  }
  return fallback;
}

/**
 * Legge un booleano (SQLite INTEGER 0/1) da map.
 */
export function readBool(map: SqlMap, key: string, fallback = false): boolean {
  const value = map[key];
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value !== 0;
  if (typeof value === "string") return value === "1" || value.toLowerCase() === "true";
  return fallback;
}
