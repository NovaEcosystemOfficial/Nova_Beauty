/**
 * BaseRepository — accesso tipizzato alla connessione SQLite.
 * Sprint 1: struttura pronta; CRUD concreto nelle sprint successive.
 */
import type Database from "better-sqlite3";
import { DatabaseService } from "../database/DatabaseService";

export abstract class BaseRepository {
  protected readonly tableName: string;

  protected constructor(tableName: string) {
    this.tableName = tableName;
  }

  /** Connessione attiva (richiede DatabaseService già inizializzato). */
  protected db(): Database.Database {
    return DatabaseService.getInstance().getConnection();
  }

  /**
   * Conta le righe della tabella.
   * Utile per health-check; non espone ancora CRUD di dominio.
   */
  count(): number {
    const row = this.db()
      .prepare(`SELECT COUNT(*) AS c FROM ${this.tableName}`)
      .get() as { c: number };
    return Number(row?.c ?? 0);
  }

  /** True se la tabella è raggiungibile. */
  isAvailable(): boolean {
    try {
      this.count();
      return true;
    } catch {
      return false;
    }
  }
}
