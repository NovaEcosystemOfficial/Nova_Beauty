/**
 * DatabaseService — singleton SQLite locale (better-sqlite3).
 *
 * Uso previsto: processo main Electron.
 * Unica istanza → stessa connessione / stesso file per lettura e scrittura.
 */
import Database from "better-sqlite3";
import { existsSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { applyMigrations } from "./migrations";
import { CREATE_TABLES_SQL, DOMAIN_TABLES, SCHEMA_VERSION } from "./schema";

const DB_FILE_NAME = "novabeauty.sqlite";

export class DatabaseService {
  private static instance: DatabaseService | null = null;

  private db: Database.Database | null = null;
  private dbPath: string | null = null;
  private ready = false;

  private constructor() {
    /* singleton */
  }

  /** Istanza unica del servizio database. */
  static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  /**
   * Inizializza il database sotto `userDataPath` (tipicamente `app.getPath('userData')`).
   * Crea la cartella e il file SQLite al primo avvio, poi applica le migrazioni.
   * NON cancella mai il DB esistente (persistenza utenti).
   */
  initialize(userDataPath: string): void {
    if (this.ready && this.db) {
      return;
    }

    const dataDir = join(userDataPath, "data");
    if (!existsSync(dataDir)) {
      mkdirSync(dataDir, { recursive: true });
    }

    this.dbPath = join(dataDir, DB_FILE_NAME);
    this.db = new Database(this.dbPath);
    this.db.pragma("journal_mode = WAL");
    this.db.pragma("foreign_keys = ON");
    this.db.pragma("synchronous = NORMAL");
    this.db.exec(CREATE_TABLES_SQL);
    applyMigrations(this.db);
    this.writeSchemaVersion(SCHEMA_VERSION);
    this.ready = true;
  }

  /** True se `initialize` è già stato chiamato con successo. */
  isReady(): boolean {
    return this.ready && this.db != null;
  }

  /** Percorso assoluto del file SQLite (dopo init). */
  getPath(): string | null {
    return this.dbPath;
  }

  /**
   * Connessione better-sqlite3 attiva.
   * @throws se il servizio non è inizializzato.
   */
  getConnection(): Database.Database {
    if (!this.db) {
      throw new Error(
        "DatabaseService non inizializzato. Chiamare initialize(userDataPath) al boot del main process."
      );
    }
    return this.db;
  }

  /** Flush WAL → file principale (persistenza su disco). */
  checkpoint(): void {
    if (!this.db) return;
    try {
      this.db.pragma("wal_checkpoint(TRUNCATE)");
    } catch {
      /* ignore checkpoint errors */
    }
  }

  /** Verifica rapida che tutte le tabelle di dominio esistano. */
  listExistingDomainTables(): string[] {
    const db = this.getConnection();
    const rows = db
      .prepare(
        `SELECT name FROM sqlite_master WHERE type = 'table' AND name IN (${DOMAIN_TABLES.map(() => "?").join(",")})`
      )
      .all(...DOMAIN_TABLES) as Array<{ name: string }>;
    return rows.map((r) => r.name);
  }

  /** Chiude la connessione (shutdown app) dopo checkpoint. */
  close(): void {
    if (this.db) {
      this.checkpoint();
      this.db.close();
      this.db = null;
      this.ready = false;
    }
  }

  private writeSchemaVersion(version: number): void {
    const db = this.getConnection();
    db.prepare(
      `INSERT INTO schema_meta (key, value) VALUES ('schema_version', ?)
       ON CONFLICT(key) DO UPDATE SET value = excluded.value`
    ).run(String(version));
  }
}

export default DatabaseService;
