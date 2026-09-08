/**
 * Migrazioni schema SQLite idempotenti.
 */
import type Database from "better-sqlite3";
import { SCHEMA_VERSION } from "./schema";

function columnExists(db: Database.Database, table: string, column: string): boolean {
  const rows = db.prepare(`PRAGMA table_info(${table})`).all() as Array<{ name: string }>;
  return rows.some((r) => r.name === column);
}

function addColumnIfMissing(
  db: Database.Database,
  table: string,
  column: string,
  ddlType: string
): void {
  if (!columnExists(db, table, column)) {
    db.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${ddlType}`);
  }
}

/**
 * Porta lo schema alla versione corrente.
 * Sicuro da rieseguire (idempotente).
 */
export function applyMigrations(db: Database.Database): void {
  // Sprint 2 — clienti reali
  addColumnIfMissing(db, "clients", "first_name", "TEXT NOT NULL DEFAULT ''");
  addColumnIfMissing(db, "clients", "last_name", "TEXT NOT NULL DEFAULT ''");
  addColumnIfMissing(db, "clients", "profile_json", "TEXT NOT NULL DEFAULT '{}'");
  addColumnIfMissing(db, "clients", "sync_status", "TEXT NOT NULL DEFAULT 'local'");

  // Backfill nome/cognome da `name` legacy se vuoti
  db.exec(`
    UPDATE clients
    SET
      first_name = CASE
        WHEN TRIM(first_name) = '' AND TRIM(name) != '' THEN TRIM(SUBSTR(name, 1, INSTR(name || ' ', ' ') - 1))
        ELSE first_name
      END,
      last_name = CASE
        WHEN TRIM(last_name) = '' AND TRIM(name) != '' AND INSTR(name, ' ') > 0
          THEN TRIM(SUBSTR(name, INSTR(name, ' ') + 1))
        ELSE last_name
      END
    WHERE TRIM(first_name) = '' OR TRIM(last_name) = '';
  `);

  // Sprint 3 — appuntamenti reali
  addColumnIfMissing(db, "appointments", "title", "TEXT NOT NULL DEFAULT ''");
  addColumnIfMissing(db, "appointments", "date_iso", "TEXT NOT NULL DEFAULT ''");
  addColumnIfMissing(db, "appointments", "start_time", "TEXT NOT NULL DEFAULT ''");
  addColumnIfMissing(db, "appointments", "end_time", "TEXT NOT NULL DEFAULT ''");
  addColumnIfMissing(db, "appointments", "day_offset", "INTEGER NOT NULL DEFAULT 0");
  addColumnIfMissing(db, "appointments", "start_min", "INTEGER NOT NULL DEFAULT 0");
  addColumnIfMissing(db, "appointments", "price", "REAL NOT NULL DEFAULT 0");
  addColumnIfMissing(db, "appointments", "phone", "TEXT NOT NULL DEFAULT ''");
  addColumnIfMissing(db, "appointments", "email", "TEXT NOT NULL DEFAULT ''");
  addColumnIfMissing(db, "appointments", "history", "TEXT NOT NULL DEFAULT ''");
  addColumnIfMissing(db, "appointments", "last_treatment", "TEXT NOT NULL DEFAULT ''");
  addColumnIfMissing(db, "appointments", "sync_status", "TEXT NOT NULL DEFAULT 'local'");

  // Backfill orari/titolo/data da colonne legacy
  db.exec(`
    UPDATE appointments
    SET
      start_time = CASE WHEN TRIM(start_time) = '' THEN time_label ELSE start_time END,
      end_time = CASE
        WHEN TRIM(end_time) = '' AND TRIM(COALESCE(start_time, time_label, '')) != ''
          THEN time_label
        ELSE end_time
      END,
      title = CASE
        WHEN TRIM(title) = '' AND TRIM(service_name) != '' THEN service_name
        ELSE title
      END,
      status = CASE
        WHEN status = 'previsto' OR status = 'da_confermare' THEN 'prenotato'
        ELSE status
      END
    WHERE TRIM(start_time) = '' OR TRIM(title) = '' OR TRIM(end_time) = ''
       OR status IN ('previsto', 'da_confermare');
  `);

  // Sprint 4 — servizi reali
  addColumnIfMissing(db, "services", "meta_json", "TEXT NOT NULL DEFAULT '{}'");

  db.prepare(
    `INSERT INTO schema_meta (key, value) VALUES ('schema_version', ?)
     ON CONFLICT(key) DO UPDATE SET value = excluded.value`
  ).run(String(SCHEMA_VERSION));
}
