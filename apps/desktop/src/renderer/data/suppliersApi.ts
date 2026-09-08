/**
 * Bridge renderer → SupplierRepository (main/SQLite via IPC).
 */
import type {
  SupplierCreateInput,
  SupplierDto,
  SupplierLinkedProduct,
  SupplierListQuery,
  SupplierReorderMethod,
  SupplierStatus,
  SupplierUpdateInput
} from "../../models/Supplier";
import type { ClientIpcResult } from "../types/novaBeautyApi";

type SuppliersBridge = {
  list: (query?: SupplierListQuery) => Promise<ClientIpcResult<SupplierDto[]>>;
  get: (id: string) => Promise<ClientIpcResult<SupplierDto | null>>;
  create: (input: SupplierCreateInput) => Promise<ClientIpcResult<SupplierDto>>;
  update: (input: SupplierUpdateInput) => Promise<ClientIpcResult<SupplierDto>>;
  delete: (id: string) => Promise<ClientIpcResult<{ id: string }>>;
};

type NbLocal = {
  invoke: (channel: string, ...args: unknown[]) => Promise<unknown>;
  suppliers?: SuppliersBridge;
};

function suppliersBridge(): SuppliersBridge | null {
  const fromNova = window.novaBeauty?.suppliers;
  if (fromNova) return fromNova;

  const local = (window as Window & { nbLocal?: NbLocal }).nbLocal;
  if (local?.suppliers) return local.suppliers;

  if (local?.invoke) {
    return {
      list: (query) =>
        local.invoke("nb:suppliers:list", query ?? {}) as Promise<ClientIpcResult<SupplierDto[]>>,
      get: (id) =>
        local.invoke("nb:suppliers:get", id) as Promise<ClientIpcResult<SupplierDto | null>>,
      create: (input) =>
        local.invoke("nb:suppliers:create", input) as Promise<ClientIpcResult<SupplierDto>>,
      update: (input) =>
        local.invoke("nb:suppliers:update", input) as Promise<ClientIpcResult<SupplierDto>>,
      delete: (id) =>
        local.invoke("nb:suppliers:delete", id) as Promise<ClientIpcResult<{ id: string }>>
    };
  }

  return null;
}

function engineUnavailable<T>(): ClientIpcResult<T> {
  return {
    ok: false,
    code: "ENGINE_UNAVAILABLE",
    message: "Motore dati fornitori non connesso. Avvia NovaBeauty con Electron (npm run dev)."
  };
}

async function safeCall<T>(run: () => Promise<ClientIpcResult<T>>): Promise<ClientIpcResult<T>> {
  try {
    return await run();
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Errore IPC verso SupplierRepository.";
    return { ok: false, code: "IPC_ERROR", message };
  }
}

export async function listSuppliers(
  query?: SupplierListQuery
): Promise<ClientIpcResult<SupplierDto[]>> {
  const bridge = suppliersBridge();
  if (!bridge) return engineUnavailable();
  return safeCall(() => bridge.list(query));
}

export async function createSupplierRemote(
  input: SupplierCreateInput
): Promise<ClientIpcResult<SupplierDto>> {
  const bridge = suppliersBridge();
  if (!bridge) return engineUnavailable();
  return safeCall(() => bridge.create(input));
}

export async function updateSupplierRemote(
  input: SupplierUpdateInput
): Promise<ClientIpcResult<SupplierDto>> {
  const bridge = suppliersBridge();
  if (!bridge) return engineUnavailable();
  return safeCall(() => bridge.update(input));
}

export async function deleteSupplierRemote(
  id: string
): Promise<ClientIpcResult<{ id: string }>> {
  const bridge = suppliersBridge();
  if (!bridge) return engineUnavailable();
  return safeCall(() => bridge.delete(id));
}

const REORDER: SupplierReorderMethod[] = ["sito", "email", "whatsapp", "telefono", "manuale"];
const TONES = new Set(["primary", "mint", "gold", "lavender", "rose"]);

function parseMeta(raw: string): Record<string, unknown> {
  try {
    return JSON.parse(raw || "{}") as Record<string, unknown>;
  } catch {
    return {};
  }
}

export function dtoToWorkflowSupplier(dto: SupplierDto) {
  const meta = parseMeta(dto.metaJson);
  const method = String(meta.reorderMethod ?? "email");
  const tone = String(meta.logoTone ?? "primary");
  const linked: SupplierLinkedProduct[] = Array.isArray(dto.linkedProducts)
    ? dto.linkedProducts
    : [];
  const status: SupplierStatus = dto.status === "disattivo" ? "disattivo" : "attivo";

  return {
    id: dto.id,
    name: dto.name,
    category: dto.category || "Dermocosmesi",
    status,
    lastOrder: String(meta.lastOrder ?? "—"),
    contact: dto.contact || "—",
    phone: dto.phone,
    email: dto.email,
    whatsapp: String(meta.whatsapp ?? ""),
    website: String(meta.website ?? ""),
    catalogUrl: String(meta.catalogUrl ?? ""),
    address: String(meta.address ?? "—"),
    vat: String(meta.vat ?? "—"),
    avgDelivery: String(meta.avgDelivery ?? "—"),
    minOrder: String(meta.minOrder ?? "—"),
    reorderMethod: REORDER.includes(method as SupplierReorderMethod)
      ? (method as SupplierReorderMethod)
      : "email",
    notes: dto.notes,
    productsCount: dto.productsCount,
    ordersValue: String(meta.ordersValue ?? "€0"),
    reliability: String(meta.reliability ?? "—"),
    logoTone: TONES.has(tone)
      ? (tone as "primary" | "mint" | "gold" | "lavender" | "rose")
      : "primary",
    logoInitials: String(meta.logoInitials ?? dto.name.slice(0, 2).toUpperCase()),
    linkedProducts: linked
  };
}

export function supplierMetaJson(input: {
  lastOrder?: string;
  whatsapp?: string;
  website?: string;
  catalogUrl?: string;
  address?: string;
  vat?: string;
  avgDelivery?: string;
  minOrder?: string;
  reorderMethod?: SupplierReorderMethod;
  ordersValue?: string;
  reliability?: string;
  logoTone?: string;
  logoInitials?: string;
}): string {
  return JSON.stringify({
    lastOrder: input.lastOrder ?? "—",
    whatsapp: input.whatsapp ?? "",
    website: input.website ?? "",
    catalogUrl: input.catalogUrl ?? "",
    address: input.address ?? "—",
    vat: input.vat ?? "—",
    avgDelivery: input.avgDelivery ?? "—",
    minOrder: input.minOrder ?? "—",
    reorderMethod: input.reorderMethod ?? "email",
    ordersValue: input.ordersValue ?? "€0",
    reliability: input.reliability ?? "—",
    logoTone: input.logoTone ?? "primary",
    logoInitials: input.logoInitials ?? "NF"
  });
}
