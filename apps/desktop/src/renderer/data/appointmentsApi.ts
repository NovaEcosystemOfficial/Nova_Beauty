/**
 * Bridge renderer → AppointmentRepository (main/SQLite via IPC).
 * Nessun layer demo: create/list/update/delete passano da nb:appointments:*.
 */
import {
  domainStatusToUi,
  type AppointmentCreateInput,
  type AppointmentData,
  type AppointmentListQuery,
  type AppointmentUpdateInput
} from "../../models/Appointment";
import type { ClientIpcResult } from "../types/novaBeautyApi";

type AppointmentsBridge = {
  list: (query?: AppointmentListQuery) => Promise<ClientIpcResult<AppointmentData[]>>;
  get: (id: string) => Promise<ClientIpcResult<AppointmentData | null>>;
  create: (input: AppointmentCreateInput) => Promise<ClientIpcResult<AppointmentData>>;
  update: (input: AppointmentUpdateInput) => Promise<ClientIpcResult<AppointmentData>>;
  delete: (id: string) => Promise<ClientIpcResult<{ id: string }>>;
};

type NbLocal = {
  invoke: (channel: string, ...args: unknown[]) => Promise<unknown>;
  appointments?: AppointmentsBridge;
};

function appointmentsBridge(): AppointmentsBridge | null {
  const fromNova = window.novaBeauty?.appointments;
  if (fromNova) return fromNova as AppointmentsBridge;

  const local = (window as Window & { nbLocal?: NbLocal }).nbLocal;
  if (local?.appointments) return local.appointments;

  if (local?.invoke) {
    return {
      list: (query) =>
        local.invoke("nb:appointments:list", query ?? {}) as Promise<
          ClientIpcResult<AppointmentData[]>
        >,
      get: (id) =>
        local.invoke("nb:appointments:get", id) as Promise<
          ClientIpcResult<AppointmentData | null>
        >,
      create: (input) =>
        local.invoke("nb:appointments:create", input) as Promise<
          ClientIpcResult<AppointmentData>
        >,
      update: (input) =>
        local.invoke("nb:appointments:update", input) as Promise<
          ClientIpcResult<AppointmentData>
        >,
      delete: (id) =>
        local.invoke("nb:appointments:delete", id) as Promise<
          ClientIpcResult<{ id: string }>
        >
    };
  }

  return null;
}

function engineUnavailable<T>(): ClientIpcResult<T> {
  return {
    ok: false,
    code: "ENGINE_UNAVAILABLE",
    message:
      "Motore dati locale non connesso. Avvia NovaBeauty con Electron (npm run dev), non dal solo browser."
  };
}

async function safeCall<T>(
  run: () => Promise<ClientIpcResult<T>>
): Promise<ClientIpcResult<T>> {
  try {
    return await run();
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Errore IPC verso AppointmentRepository.";
    return { ok: false, code: "IPC_ERROR", message };
  }
}

export async function listAppointments(
  query?: AppointmentListQuery
): Promise<ClientIpcResult<AppointmentData[]>> {
  const bridge = appointmentsBridge();
  if (!bridge) return engineUnavailable();
  return safeCall(() => bridge.list(query));
}

/** Crea via AppointmentRepository.create() (INSERT SQLite). */
export async function createAppointmentViaRepository(
  input: AppointmentCreateInput
): Promise<ClientIpcResult<AppointmentData>> {
  const bridge = appointmentsBridge();
  if (!bridge) return engineUnavailable();
  return safeCall(() => bridge.create(input));
}

/** @deprecated Usa createAppointmentViaRepository — alias per compatibilità. */
export const createAppointmentRemote = createAppointmentViaRepository;

export async function updateAppointmentRemote(
  input: AppointmentUpdateInput
): Promise<ClientIpcResult<AppointmentData>> {
  const bridge = appointmentsBridge();
  if (!bridge) return engineUnavailable();
  return safeCall(() => bridge.update(input));
}

export async function deleteAppointmentRemote(
  id: string
): Promise<ClientIpcResult<{ id: string }>> {
  const bridge = appointmentsBridge();
  if (!bridge) return engineUnavailable();
  return safeCall(() => bridge.delete(id));
}

/** Shape UI Agenda (allineata a WorkflowAppointment). */
export type WorkflowAppointmentShape = {
  id: string;
  clientId: string;
  client: string;
  phone: string;
  email: string;
  service: string;
  operator: string;
  cabin: string;
  dateLabel: string;
  timeLabel: string;
  startMin: number;
  durationMin: number;
  price: number;
  notes: string;
  status: "confermato" | "da_confermare" | "completato" | "annullato";
  dayOffset: number;
  history: string;
  lastTreatment: string;
  serviceId?: string;
  operatorId?: string;
  title?: string;
  dateIso?: string;
  startTime?: string;
  endTime?: string;
};

export function dtoToWorkflowAppointment(dto: AppointmentData): WorkflowAppointmentShape {
  return {
    id: dto.id,
    clientId: dto.clientId,
    client: dto.clientName,
    phone: dto.phone || "—",
    email: dto.email || "—",
    service: dto.serviceName || dto.title,
    operator: dto.operatorName,
    cabin: dto.cabin,
    dateLabel: dto.dateLabel,
    timeLabel: dto.timeLabel || dto.startTime,
    startMin: dto.startMin,
    durationMin: dto.durationMin,
    price: dto.price,
    notes: dto.notes,
    status: domainStatusToUi(dto.status),
    dayOffset: dto.dayOffset,
    history: dto.history || "—",
    lastTreatment: dto.lastTreatment || "—",
    serviceId: dto.serviceId,
    operatorId: dto.operatorId,
    title: dto.title,
    dateIso: dto.dateIso,
    startTime: dto.startTime,
    endTime: dto.endTime
  };
}
