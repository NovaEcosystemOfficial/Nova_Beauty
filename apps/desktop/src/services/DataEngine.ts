/**
 * DataEngine — facade di avvio del motore dati locale.
 *
 * Sprint 1–B2: SQLite + repository. Clienti, Appuntamenti, Servizi, Magazzino, Fornitori via IPC.
 */
import { DatabaseService } from "../database/DatabaseService";
import { DOMAIN_TABLES } from "../database/schema";
import { AppointmentRepository } from "../repositories/AppointmentRepository";
import { ClientRepository } from "../repositories/ClientRepository";
import { InventoryRepository } from "../repositories/InventoryRepository";
import { ServiceRepository } from "../repositories/ServiceRepository";
import { SettingsRepository } from "../repositories/SettingsRepository";
import { SupplierRepository } from "../repositories/SupplierRepository";

export type DataEngineStatus = {
  ready: boolean;
  dbPath: string | null;
  tables: string[];
  expectedTables: readonly string[];
};

export class DataEngine {
  private static instance: DataEngine | null = null;

  readonly clients: ClientRepository;
  readonly appointments: AppointmentRepository;
  readonly inventory: InventoryRepository;
  readonly services: ServiceRepository;
  readonly settings: SettingsRepository;
  readonly suppliers: SupplierRepository;

  private constructor() {
    this.clients = new ClientRepository();
    this.appointments = new AppointmentRepository();
    this.inventory = new InventoryRepository();
    this.services = new ServiceRepository();
    this.settings = new SettingsRepository();
    this.suppliers = new SupplierRepository();
  }

  static getInstance(): DataEngine {
    if (!DataEngine.instance) {
      DataEngine.instance = new DataEngine();
    }
    return DataEngine.instance;
  }

  /**
   * Boot del motore: crea/apre SQLite sotto userData e verifica le tabelle.
   * Idempotente.
   */
  start(userDataPath: string): DataEngineStatus {
    const db = DatabaseService.getInstance();
    db.initialize(userDataPath);
    return this.status();
  }

  /** Snapshot stato motore (per log main process). */
  status(): DataEngineStatus {
    const db = DatabaseService.getInstance();
    return {
      ready: db.isReady(),
      dbPath: db.getPath(),
      tables: db.isReady() ? db.listExistingDomainTables() : [],
      expectedTables: DOMAIN_TABLES
    };
  }

  /** Shutdown pulito. */
  stop(): void {
    DatabaseService.getInstance().close();
  }
}

export default DataEngine;
