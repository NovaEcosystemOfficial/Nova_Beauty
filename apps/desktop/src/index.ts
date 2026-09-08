/**
 * NovaBeauty Desktop — motore dati locale (Sprint 1).
 *
 * Architettura:
 * - `core/` tipi e helper id/timestamp
 * - `models/` entità con fromMap / toMap / copyWith
 * - `database/` schema SQLite + DatabaseService singleton
 * - `repositories/` accesso tabelle (CRUD mutazioni deferito)
 * - `services/` DataEngine facade
 *
 * La UI renderer (`src/renderer`) resta sulla demo in-memory.
 * Il database vive nel main process Electron.
 */
export {};
