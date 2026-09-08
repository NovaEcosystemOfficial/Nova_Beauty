/**
 * AppointmentService — orchestrazione appuntamenti + seed demo + DTO IPC.
 * Sprint 3: solo main process.
 */
import { nowIso } from "../core/types";
import {
  AppointmentModel,
  computeEndTime,
  uiStatusToDomain,
  type AppointmentCreateInput,
  type AppointmentData,
  type AppointmentListQuery,
  type AppointmentStatus,
  type AppointmentUpdateInput
} from "../models/Appointment";
import {
  AppointmentRepository,
  AppointmentRepositoryError
} from "../repositories/AppointmentRepository";
import { DataEngine } from "./DataEngine";

export type AppointmentDto = AppointmentData;

export type IpcResult<T> =
  | { ok: true; data: T }
  | { ok: false; code: string; message: string };

type SeedRow = {
  id: string;
  clientId: string;
  clientName: string;
  serviceId: string;
  serviceName: string;
  operatorId: string;
  operatorName: string;
  cabin: string;
  dateIso: string;
  dateLabel: string;
  startTime: string;
  durationMin: number;
  dayOffset: number;
  startMin: number;
  price: number;
  phone: string;
  email: string;
  status: AppointmentStatus;
  notes: string;
  history: string;
  lastTreatment: string;
};

/** Seed allineato alla demo Agenda (a1–a8). */
const DEMO_SEED: SeedRow[] = [
  {
    id: "a1",
    clientId: "c1",
    clientName: "Giulia Rossi",
    serviceId: "svc1",
    serviceName: "Pulizia viso deep",
    operatorId: "op-fabio",
    operatorName: "Fabio",
    cabin: "Cabina 1",
    dateIso: "2026-08-05",
    dateLabel: "Mer 5 ago 2026",
    startTime: "09:00",
    durationMin: 60,
    dayOffset: 0,
    startMin: 60,
    price: 65,
    phone: "+39 340 112 8890",
    email: "giulia.rossi@email.it",
    status: "confermato",
    notes: "Pelle sensibile. Cabina 1 preferita.",
    history: "Cliente VIP · 12 visite",
    lastTreatment: "Peeling enzimatico · 15 giu"
  },
  {
    id: "a2",
    clientId: "c2",
    clientName: "Sara Bianchi",
    serviceId: "svc2",
    serviceName: "Massaggio rilassante",
    operatorId: "op-fabio",
    operatorName: "Fabio",
    cabin: "Cabina 1",
    dateIso: "2026-08-05",
    dateLabel: "Mer 5 ago 2026",
    startTime: "11:30",
    durationMin: 60,
    dayOffset: 0,
    startMin: 210,
    price: 55,
    phone: "+39 333 441 2098",
    email: "sara.b@email.it",
    status: "prenotato",
    notes: "Conferma SMS inviata ieri.",
    history: "8 visite · pacchetto massaggi 3/5",
    lastTreatment: "Massaggio · 28 lug"
  },
  {
    id: "a3",
    clientId: "c3",
    clientName: "Elena Conti",
    serviceId: "svc3",
    serviceName: "Epilazione gambe",
    operatorId: "op-laura",
    operatorName: "Laura",
    cabin: "Cabina 2",
    dateIso: "2026-08-05",
    dateLabel: "Mer 5 ago 2026",
    startTime: "14:15",
    durationMin: 45,
    dayOffset: 0,
    startMin: 375,
    price: 40,
    phone: "+39 348 990 4412",
    email: "elena.conti@email.it",
    status: "confermato",
    notes: "Allergia lattice — guanti nitrile.",
    history: "6 visite · cabina 2",
    lastTreatment: "Epilazione · 20 lug"
  },
  {
    id: "a4",
    clientId: "c4",
    clientName: "Marta Greco",
    serviceId: "svc4",
    serviceName: "Trucco permanente",
    operatorId: "op-fabio",
    operatorName: "Fabio",
    cabin: "Cabina 1",
    dateIso: "2026-08-05",
    dateLabel: "Mer 5 ago 2026",
    startTime: "16:00",
    durationMin: 90,
    dayOffset: 0,
    startMin: 480,
    price: 180,
    phone: "+39 347 221 0088",
    email: "marta.greco@email.it",
    status: "confermato",
    notes: "3ª seduta ciclo PMU.",
    history: "Ciclo PMU in corso",
    lastTreatment: "PMU · 15 lug"
  },
  {
    id: "a5",
    clientId: "c5",
    clientName: "Chiara Ferri",
    serviceId: "svc5",
    serviceName: "Consulenza nuova cliente",
    operatorId: "op-laura",
    operatorName: "Laura",
    cabin: "Cabina 3",
    dateIso: "2026-08-05",
    dateLabel: "Mer 5 ago 2026",
    startTime: "10:00",
    durationMin: 30,
    dayOffset: 0,
    startMin: 120,
    price: 0,
    phone: "+39 331 778 4501",
    email: "chiara.ferri@email.it",
    status: "completato",
    notes: "Anamnesi da completare.",
    history: "Prima visita",
    lastTreatment: "—"
  },
  {
    id: "a6",
    clientId: "c6",
    clientName: "Laura Neri",
    serviceId: "svc6",
    serviceName: "Manicure spa",
    operatorId: "op-laura",
    operatorName: "Laura",
    cabin: "Cabina 2",
    dateIso: "2026-08-05",
    dateLabel: "Mer 5 ago 2026",
    startTime: "13:00",
    durationMin: 45,
    dayOffset: 0,
    startMin: 300,
    price: 35,
    phone: "+39 339 120 6677",
    email: "laura.neri@email.it",
    status: "annullato",
    notes: "Ha annullato.",
    history: "4 visite",
    lastTreatment: "Manicure · 12 apr"
  },
  {
    id: "a7",
    clientId: "c7",
    clientName: "Francesca Villa",
    serviceId: "svc7",
    serviceName: "Pressoterapia",
    operatorId: "op-fabio",
    operatorName: "Fabio",
    cabin: "Cabina 2",
    dateIso: "2026-08-06",
    dateLabel: "Gio 6 ago 2026",
    startTime: "09:30",
    durationMin: 45,
    dayOffset: 1,
    startMin: 90,
    price: 45,
    phone: "+39 345 889 3310",
    email: "f.villa@email.it",
    status: "confermato",
    notes: "Pacchetto attivo",
    history: "Pacchetto attivo",
    lastTreatment: "Pressoterapia · 30 lug"
  },
  {
    id: "a8",
    clientId: "c8",
    clientName: "Valentina Russo",
    serviceId: "svc8",
    serviceName: "Peeling enzimatico",
    operatorId: "op-laura",
    operatorName: "Laura",
    cabin: "Cabina 1",
    dateIso: "2026-08-07",
    dateLabel: "Ven 7 ago 2026",
    startTime: "11:00",
    durationMin: 60,
    dayOffset: 2,
    startMin: 180,
    price: 80,
    phone: "+39 320 554 7788",
    email: "v.russo@email.it",
    status: "prenotato",
    notes: "Prodotti bio",
    history: "5 visite",
    lastTreatment: "Peeling · 25 lug"
  }
];

export class AppointmentService {
  private static instance: AppointmentService | null = null;

  static getInstance(): AppointmentService {
    if (!AppointmentService.instance) {
      AppointmentService.instance = new AppointmentService();
    }
    return AppointmentService.instance;
  }

  private repo(): AppointmentRepository {
    return DataEngine.getInstance().appointments;
  }

  /** Se la tabella è vuota, importa gli appuntamenti demo. */
  ensureDemoSeed(): number {
    const repo = this.repo();
    if (repo.count() > 0) return 0;
    const now = nowIso();
    const rows: AppointmentData[] = DEMO_SEED.map((d) => ({
      id: d.id,
      createdAt: now,
      updatedAt: now,
      clientId: d.clientId,
      clientName: d.clientName,
      serviceId: d.serviceId,
      serviceName: d.serviceName,
      operatorId: d.operatorId,
      operatorName: d.operatorName,
      title: d.serviceName,
      cabin: d.cabin,
      dateIso: d.dateIso,
      dateLabel: d.dateLabel,
      startTime: d.startTime,
      endTime: computeEndTime(d.startTime, d.durationMin),
      timeLabel: d.startTime,
      durationMin: d.durationMin,
      dayOffset: d.dayOffset,
      startMin: d.startMin,
      price: d.price,
      phone: d.phone,
      email: d.email,
      status: d.status,
      notes: d.notes,
      history: d.history,
      lastTreatment: d.lastTreatment,
      syncStatus: "local"
    }));
    return repo.seedMany(rows);
  }

  list(query: AppointmentListQuery = {}): IpcResult<AppointmentDto[]> {
    try {
      this.ensureDemoSeed();
      return { ok: true, data: this.repo().list(query).map((a) => a.toDto()) };
    } catch (error) {
      return wrapError(error);
    }
  }

  get(id: string): IpcResult<AppointmentDto | null> {
    try {
      const row = this.repo().findById(id);
      return { ok: true, data: row ? row.toDto() : null };
    } catch (error) {
      return wrapError(error);
    }
  }

  create(input: AppointmentCreateInput): IpcResult<AppointmentDto> {
    try {
      // insert() = create() → INSERT reale su SQLite + verify + checkpoint
      const created = this.repo().insert(input);
      return { ok: true, data: created.toDto() };
    } catch (error) {
      return wrapError(error);
    }
  }

  update(input: AppointmentUpdateInput): IpcResult<AppointmentDto> {
    try {
      return { ok: true, data: this.repo().update(input).toDto() };
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
  if (error instanceof AppointmentRepositoryError) {
    return { ok: false, code: error.code, message: error.message };
  }
  return {
    ok: false,
    code: "UNKNOWN",
    message: error instanceof Error ? error.message : "Errore database sconosciuto."
  };
}

/** Re-export utile per normalizzare status da IPC. */
export { uiStatusToDomain, AppointmentModel };
