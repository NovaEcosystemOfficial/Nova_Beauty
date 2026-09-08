/**
 * ClientService — orchestrazione clienti + seed demo + DTO IPC.
 * Sprint 2: nessuna UI qui; solo main process.
 */
import { createEntityId, nowIso } from "../core/types";
import { ClientModel, type ClientData, type ClientStatus } from "../models/Client";
import type {
  ClientCreateInput,
  ClientListQuery,
  ClientUpdateInput
} from "../models/Client";
import { ClientRepository, ClientRepositoryError } from "../repositories/ClientRepository";
import { DataEngine } from "./DataEngine";

export type ClientDto = ClientData;

export type ClientProfileExtras = {
  lastAppointment?: string;
  lastTreatment?: string;
  nextAppointment?: string;
  totalSpent?: number;
  fidelityPoints?: number;
  tags?: string[];
  diaryPlaceholders?: string[];
  historyLines?: string[];
};

/** Seed iniziale allineato alla demo Sprint 0 (non rimuove dati UI). */
const DEMO_SEED: Array<{
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  birthday: string;
  notes: string;
  favorite: boolean;
  status: ClientStatus;
  profile: ClientProfileExtras;
}> = [
  {
    id: "c1",
    firstName: "Giulia",
    lastName: "Rossi",
    phone: "+39 340 112 8890",
    email: "giulia.rossi@email.it",
    birthday: "12 marzo",
    notes: "Preferisce trattamenti mattutini. Pelle sensibile — evitare retinolo.",
    favorite: true,
    status: "attivo",
    profile: {
      lastAppointment: "2 ago 2026",
      lastTreatment: "Pulizia viso deep",
      nextAppointment: "Oggi · 09:00",
      totalSpent: 1240,
      fidelityPoints: 180,
      tags: ["VIP", "Viso"],
      diaryPlaceholders: ["Before/After viso", "Mappa zone", "Follow-up"],
      historyLines: ["Pulizia viso · 2 ago", "Peeling · 15 giu", "Idratazione · 2 mag"]
    }
  },
  {
    id: "c2",
    firstName: "Sara",
    lastName: "Bianchi",
    phone: "+39 333 441 2098",
    email: "sara.b@email.it",
    birthday: "4 luglio",
    notes: "Chiedere conferma SMS 24h prima.",
    favorite: true,
    status: "attivo",
    profile: {
      lastAppointment: "28 lug 2026",
      lastTreatment: "Massaggio rilassante",
      nextAppointment: "Oggi · 11:30",
      totalSpent: 860,
      fidelityPoints: 95,
      tags: ["Massaggi"],
      diaryPlaceholders: ["Zona schiena", "Preferenze olio"],
      historyLines: ["Massaggio · 28 lug", "Pressoterapia · 10 giu"]
    }
  },
  {
    id: "c3",
    firstName: "Elena",
    lastName: "Conti",
    phone: "+39 348 990 4412",
    email: "elena.conti@email.it",
    birthday: "22 gennaio",
    notes: "Allergia a lattice. Preferisce cabina 2.",
    favorite: false,
    status: "attivo",
    profile: {
      lastAppointment: "20 lug 2026",
      lastTreatment: "Epilazione gambe",
      nextAppointment: "Oggi · 14:15",
      totalSpent: 620,
      fidelityPoints: 70,
      tags: ["Epilazione"],
      diaryPlaceholders: ["Zone trattate"],
      historyLines: ["Epilazione · 20 lug", "Epilazione · 18 giu"]
    }
  },
  {
    id: "c4",
    firstName: "Marta",
    lastName: "Greco",
    phone: "+39 347 221 0088",
    email: "marta.greco@email.it",
    birthday: "9 settembre",
    notes: "Ciclo trucco permanente in corso (3a seduta).",
    favorite: false,
    status: "attivo",
    profile: {
      lastAppointment: "15 lug 2026",
      lastTreatment: "Trucco permanente",
      nextAppointment: "Oggi · 16:00",
      totalSpent: 1890,
      fidelityPoints: 240,
      tags: ["VIP", "PMU"],
      diaryPlaceholders: ["Sopracciglia", "Pigmento"],
      historyLines: ["PMU · 15 lug", "PMU · 20 mag"]
    }
  },
  {
    id: "c5",
    firstName: "Chiara",
    lastName: "Ferri",
    phone: "+39 331 778 4501",
    email: "chiara.ferri@email.it",
    birthday: "30 novembre",
    notes: "Cliente nuova · primo ciclo viso.",
    favorite: false,
    status: "nuovo",
    profile: {
      lastAppointment: "—",
      lastTreatment: "—",
      nextAppointment: "8 ago · 10:00",
      totalSpent: 0,
      fidelityPoints: 0,
      tags: ["Nuova"],
      diaryPlaceholders: ["Anamnesi"],
      historyLines: []
    }
  },
  {
    id: "c6",
    firstName: "Laura",
    lastName: "Neri",
    phone: "+39 339 120 6677",
    email: "laura.neri@email.it",
    birthday: "18 maggio",
    notes: "Non risponde da 3 mesi. Riattivazione consigliata.",
    favorite: false,
    status: "inattivo",
    profile: {
      lastAppointment: "12 apr 2026",
      lastTreatment: "Manicure spa",
      nextAppointment: "Non pianificato",
      totalSpent: 410,
      fidelityPoints: 40,
      tags: ["Da richiamare"],
      diaryPlaceholders: [],
      historyLines: ["Manicure · 12 apr"]
    }
  },
  {
    id: "c7",
    firstName: "Francesca",
    lastName: "Villa",
    phone: "+39 345 889 3310",
    email: "f.villa@email.it",
    birthday: "2 febbraio",
    notes: "Pacchetto 5 sedute — 2 rimanenti.",
    favorite: true,
    status: "attivo",
    profile: {
      lastAppointment: "30 lug 2026",
      lastTreatment: "Pressoterapia",
      nextAppointment: "12 ago · 15:30",
      totalSpent: 980,
      fidelityPoints: 110,
      tags: ["Pacchetto"],
      diaryPlaceholders: ["Gambe", "Circonferenze"],
      historyLines: ["Pressoterapia · 30 lug", "Pressoterapia · 16 lug"]
    }
  },
  {
    id: "c8",
    firstName: "Valentina",
    lastName: "Russo",
    phone: "+39 320 554 7788",
    email: "v.russo@email.it",
    birthday: "27 agosto",
    notes: "Preferisce prodotti bio. Budget medio-alto.",
    favorite: false,
    status: "attivo",
    profile: {
      lastAppointment: "25 lug 2026",
      lastTreatment: "Peeling enzimatico",
      nextAppointment: "19 ago · 11:00",
      totalSpent: 745,
      fidelityPoints: 85,
      tags: ["Viso", "Bio"],
      diaryPlaceholders: ["Texture pelle"],
      historyLines: ["Peeling · 25 lug", "Pulizia · 1 giu"]
    }
  }
];

export type IpcResult<T> =
  | { ok: true; data: T }
  | { ok: false; code: string; message: string };

export class ClientService {
  private static instance: ClientService | null = null;

  static getInstance(): ClientService {
    if (!ClientService.instance) {
      ClientService.instance = new ClientService();
    }
    return ClientService.instance;
  }

  private repo(): ClientRepository {
    return DataEngine.getInstance().clients;
  }

  /** Se la tabella è vuota, importa i clienti demo Sprint 0. */
  ensureDemoSeed(): number {
    const repo = this.repo();
    if (repo.count() > 0) return 0;
    const now = nowIso();
    const rows: ClientData[] = DEMO_SEED.map((d) => ({
      id: d.id,
      createdAt: now,
      updatedAt: now,
      firstName: d.firstName,
      lastName: d.lastName,
      name: ClientModel.displayName(d.firstName, d.lastName),
      phone: d.phone,
      email: d.email,
      birthday: d.birthday,
      notes: d.notes,
      favorite: d.favorite,
      status: d.status,
      profileJson: JSON.stringify(d.profile),
      syncStatus: "local"
    }));
    return repo.seedMany(rows);
  }

  list(query: ClientListQuery = {}): IpcResult<ClientDto[]> {
    try {
      this.ensureDemoSeed();
      const rows = this.repo().list(query).map((c) => c.toDto());
      return { ok: true, data: rows };
    } catch (error) {
      return wrapError(error);
    }
  }

  get(id: string): IpcResult<ClientDto | null> {
    try {
      const row = this.repo().findById(id);
      return { ok: true, data: row ? row.toDto() : null };
    } catch (error) {
      return wrapError(error);
    }
  }

  create(input: ClientCreateInput): IpcResult<ClientDto> {
    try {
      const created = this.repo().create(input);
      return { ok: true, data: created.toDto() };
    } catch (error) {
      return wrapError(error);
    }
  }

  update(input: ClientUpdateInput): IpcResult<ClientDto> {
    try {
      const updated = this.repo().update(input);
      return { ok: true, data: updated.toDto() };
    } catch (error) {
      return wrapError(error);
    }
  }

  remove(id: string): IpcResult<{ id: string }> {
    try {
      this.repo().delete(id);
      return { ok: true, data: { id } };
    } catch (error) {
      return wrapError(error);
    }
  }
}

function wrapError(error: unknown): IpcResult<never> {
  if (error instanceof ClientRepositoryError) {
    return { ok: false, code: error.code, message: error.message };
  }
  return {
    ok: false,
    code: "UNKNOWN",
    message: error instanceof Error ? error.message : "Errore database sconosciuto."
  };
}

/** Utility: genera id se serve fuori dal repository. */
export function newClientId(): string {
  return createEntityId();
}
