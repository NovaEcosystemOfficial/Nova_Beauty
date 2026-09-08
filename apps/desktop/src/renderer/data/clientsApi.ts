/**
 * Bridge renderer → IPC clienti.
 */
import type {
  ClientCreateInput,
  ClientData,
  ClientListQuery,
  ClientUpdateInput
} from "../../models/Client";
import type { ClientIpcResult } from "../types/novaBeautyApi";

function api() {
  return window.novaBeauty?.clients;
}

export async function listClients(
  query?: ClientListQuery
): Promise<ClientIpcResult<ClientData[]>> {
  const clients = api();
  if (!clients) {
    return { ok: false, code: "NO_IPC", message: "API clienti non disponibile." };
  }
  return (await clients.list(query)) as ClientIpcResult<ClientData[]>;
}

export async function createClientRemote(
  input: ClientCreateInput
): Promise<ClientIpcResult<ClientData>> {
  const clients = api();
  if (!clients) {
    return { ok: false, code: "NO_IPC", message: "API clienti non disponibile." };
  }
  return (await clients.create(input)) as ClientIpcResult<ClientData>;
}

export async function updateClientRemote(
  input: ClientUpdateInput
): Promise<ClientIpcResult<ClientData>> {
  const clients = api();
  if (!clients) {
    return { ok: false, code: "NO_IPC", message: "API clienti non disponibile." };
  }
  return (await clients.update(input)) as ClientIpcResult<ClientData>;
}

export async function deleteClientRemote(id: string): Promise<ClientIpcResult<{ id: string }>> {
  const clients = api();
  if (!clients) {
    return { ok: false, code: "NO_IPC", message: "API clienti non disponibile." };
  }
  return (await clients.delete(id)) as ClientIpcResult<{ id: string }>;
}

export type WorkflowClientShape = {
  id: string;
  name: string;
  phone: string;
  email: string;
  birthday: string;
  notes: string;
  favorite: boolean;
  status: "attivo" | "inattivo" | "nuovo";
  lastAppointment: string;
  lastTreatment: string;
  nextAppointment: string;
  totalSpent: number;
  fidelityPoints: number;
  tags: string[];
  diaryPlaceholders: string[];
  historyLines: string[];
  firstName: string;
  lastName: string;
  createdAt: string;
  updatedAt: string;
};

export function dtoToWorkflowShape(dto: ClientData): WorkflowClientShape {
  let profile: Record<string, unknown> = {};
  try {
    profile = JSON.parse(dto.profileJson || "{}") as Record<string, unknown>;
  } catch {
    profile = {};
  }
  const status =
    dto.status === "inattivo" || dto.status === "nuovo" || dto.status === "attivo"
      ? dto.status
      : "attivo";

  return {
    id: dto.id,
    name: dto.name || `${dto.firstName} ${dto.lastName}`.trim(),
    phone: dto.phone || "—",
    email: dto.email || "—",
    birthday: dto.birthday || "—",
    notes: dto.notes,
    favorite: dto.favorite,
    status,
    lastAppointment: String(profile.lastAppointment ?? "—"),
    lastTreatment: String(profile.lastTreatment ?? "—"),
    nextAppointment: String(profile.nextAppointment ?? "—"),
    totalSpent: Number(profile.totalSpent ?? 0),
    fidelityPoints: Number(profile.fidelityPoints ?? 0),
    tags: Array.isArray(profile.tags) ? (profile.tags as string[]) : [],
    diaryPlaceholders: Array.isArray(profile.diaryPlaceholders)
      ? (profile.diaryPlaceholders as string[])
      : [],
    historyLines: Array.isArray(profile.historyLines)
      ? (profile.historyLines as string[])
      : [],
    firstName: dto.firstName,
    lastName: dto.lastName,
    createdAt: dto.createdAt,
    updatedAt: dto.updatedAt
  };
}
