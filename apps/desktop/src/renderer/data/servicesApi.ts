/**
 * Bridge renderer → ServiceRepository (main/SQLite via IPC).
 */
import type {
  ServiceCreateInput,
  ServiceData,
  ServiceListQuery,
  ServiceUpdateInput
} from "../../models/Service";
import type { ClientIpcResult } from "../types/novaBeautyApi";

type ServicesBridge = {
  list: (query?: ServiceListQuery) => Promise<ClientIpcResult<ServiceData[]>>;
  get: (id: string) => Promise<ClientIpcResult<ServiceData | null>>;
  create: (input: ServiceCreateInput) => Promise<ClientIpcResult<ServiceData>>;
  update: (input: ServiceUpdateInput) => Promise<ClientIpcResult<ServiceData>>;
  delete: (id: string) => Promise<ClientIpcResult<{ id: string }>>;
};

type NbLocal = {
  invoke: (channel: string, ...args: unknown[]) => Promise<unknown>;
  services?: ServicesBridge;
};

function servicesBridge(): ServicesBridge | null {
  const fromNova = window.novaBeauty?.services;
  if (fromNova) return fromNova as ServicesBridge;

  const local = (window as Window & { nbLocal?: NbLocal }).nbLocal;
  if (local?.services) return local.services;

  if (local?.invoke) {
    return {
      list: (query) =>
        local.invoke("nb:services:list", query ?? {}) as Promise<ClientIpcResult<ServiceData[]>>,
      get: (id) =>
        local.invoke("nb:services:get", id) as Promise<ClientIpcResult<ServiceData | null>>,
      create: (input) =>
        local.invoke("nb:services:create", input) as Promise<ClientIpcResult<ServiceData>>,
      update: (input) =>
        local.invoke("nb:services:update", input) as Promise<ClientIpcResult<ServiceData>>,
      delete: (id) =>
        local.invoke("nb:services:delete", id) as Promise<ClientIpcResult<{ id: string }>>
    };
  }

  return null;
}

function engineUnavailable<T>(): ClientIpcResult<T> {
  return {
    ok: false,
    code: "ENGINE_UNAVAILABLE",
    message:
      "Motore dati servizi non connesso. Avvia NovaBeauty con Electron (npm run dev)."
  };
}

async function safeCall<T>(run: () => Promise<ClientIpcResult<T>>): Promise<ClientIpcResult<T>> {
  try {
    return await run();
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Errore IPC verso ServiceRepository.";
    return { ok: false, code: "IPC_ERROR", message };
  }
}

export async function listServices(
  query?: ServiceListQuery
): Promise<ClientIpcResult<ServiceData[]>> {
  const bridge = servicesBridge();
  if (!bridge) return engineUnavailable();
  return safeCall(() => bridge.list(query));
}

export async function createServiceViaRepository(
  input: ServiceCreateInput
): Promise<ClientIpcResult<ServiceData>> {
  const bridge = servicesBridge();
  if (!bridge) return engineUnavailable();
  return safeCall(() => bridge.create(input));
}

export async function updateServiceViaRepository(
  input: ServiceUpdateInput
): Promise<ClientIpcResult<ServiceData>> {
  const bridge = servicesBridge();
  if (!bridge) return engineUnavailable();
  return safeCall(() => bridge.update(input));
}

export async function deleteServiceViaRepository(
  id: string
): Promise<ClientIpcResult<{ id: string }>> {
  const bridge = servicesBridge();
  if (!bridge) return engineUnavailable();
  return safeCall(() => bridge.delete(id));
}

export type WorkflowServiceShape = {
  id: string;
  name: string;
  category: string;
  durationMin: number;
  price: number;
  products: string;
  productList: string[];
  operators: string[];
  color: string;
  active: boolean;
  description: string;
  lastEdited: string;
  tone: string;
  soldCount: number;
  cabin?: string;
};

function parseOperators(json: string): string[] {
  try {
    const parsed = JSON.parse(json || "[]") as unknown;
    if (Array.isArray(parsed)) {
      return parsed.map((o) => String(o)).filter(Boolean);
    }
  } catch {
    /* ignore */
  }
  return [];
}

function parseProducts(products: string): string[] {
  return products
    .split(",")
    .map((p) => p.trim())
    .filter(Boolean);
}

export function dtoToWorkflowService(dto: ServiceData): WorkflowServiceShape {
  let meta: Record<string, unknown> = {};
  try {
    meta = JSON.parse(dto.metaJson || "{}") as Record<string, unknown>;
  } catch {
    meta = {};
  }

  const productList = parseProducts(dto.products);
  const tone = String(meta.tone ?? "primary");
  const cabinRaw = meta.cabin;
  const cabin = typeof cabinRaw === "string" && cabinRaw.trim() ? cabinRaw : undefined;

  return {
    id: dto.id,
    name: dto.name,
    category: dto.category || "Viso",
    durationMin: dto.durationMin,
    price: dto.price,
    products: dto.products || "—",
    productList: productList.length ? productList : ["—"],
    operators: parseOperators(dto.operatorsJson).length
      ? parseOperators(dto.operatorsJson)
      : ["Fabio"],
    color: dto.color || "#c48a97",
    active: dto.active,
    description: String(meta.description ?? ""),
    lastEdited: String(meta.lastEdited ?? "—"),
    tone,
    soldCount: Number(meta.soldCount ?? 0),
    cabin
  };
}
