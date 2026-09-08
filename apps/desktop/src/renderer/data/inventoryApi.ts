/**
 * Bridge renderer → InventoryRepository (main/SQLite via IPC).
 */
import type { InventoryMovementData } from "../../models/InventoryMovement";
import type {
  InventoryMoveInput,
  ProductCreateInput,
  ProductData,
  ProductListQuery,
  ProductUpdateInput
} from "../../models/Product";
import type { ClientIpcResult } from "../types/novaBeautyApi";

type InventoryBridge = {
  list: (query?: ProductListQuery) => Promise<ClientIpcResult<ProductData[]>>;
  get: (id: string) => Promise<ClientIpcResult<ProductData | null>>;
  create: (input: ProductCreateInput) => Promise<ClientIpcResult<ProductData>>;
  update: (input: ProductUpdateInput) => Promise<ClientIpcResult<ProductData>>;
  delete: (id: string) => Promise<ClientIpcResult<{ id: string }>>;
  movements: () => Promise<ClientIpcResult<InventoryMovementData[]>>;
  move: (input: InventoryMoveInput) => Promise<ClientIpcResult<ProductData>>;
};

type NbLocal = {
  invoke: (channel: string, ...args: unknown[]) => Promise<unknown>;
  inventory?: InventoryBridge;
};

function inventoryBridge(): InventoryBridge | null {
  const fromNova = window.novaBeauty?.inventory;
  if (fromNova) return fromNova;

  const local = (window as Window & { nbLocal?: NbLocal }).nbLocal;
  if (local?.inventory) return local.inventory;

  if (local?.invoke) {
    return {
      list: (query) =>
        local.invoke("nb:inventory:list", query ?? {}) as Promise<ClientIpcResult<ProductData[]>>,
      get: (id) =>
        local.invoke("nb:inventory:get", id) as Promise<ClientIpcResult<ProductData | null>>,
      create: (input) =>
        local.invoke("nb:inventory:create", input) as Promise<ClientIpcResult<ProductData>>,
      update: (input) =>
        local.invoke("nb:inventory:update", input) as Promise<ClientIpcResult<ProductData>>,
      delete: (id) =>
        local.invoke("nb:inventory:delete", id) as Promise<ClientIpcResult<{ id: string }>>,
      movements: () =>
        local.invoke("nb:inventory:movements") as Promise<ClientIpcResult<InventoryMovementData[]>>,
      move: (input) =>
        local.invoke("nb:inventory:move", input) as Promise<ClientIpcResult<ProductData>>
    };
  }

  return null;
}

function engineUnavailable<T>(): ClientIpcResult<T> {
  return {
    ok: false,
    code: "ENGINE_UNAVAILABLE",
    message: "Motore dati magazzino non connesso. Avvia NovaBeauty con Electron (npm run dev)."
  };
}

async function safeCall<T>(run: () => Promise<ClientIpcResult<T>>): Promise<ClientIpcResult<T>> {
  try {
    return await run();
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Errore IPC verso InventoryRepository.";
    return { ok: false, code: "IPC_ERROR", message };
  }
}

export async function listProducts(
  query?: ProductListQuery
): Promise<ClientIpcResult<ProductData[]>> {
  const bridge = inventoryBridge();
  if (!bridge) return engineUnavailable();
  return safeCall(() => bridge.list(query));
}

export async function createProductRemote(
  input: ProductCreateInput
): Promise<ClientIpcResult<ProductData>> {
  const bridge = inventoryBridge();
  if (!bridge) return engineUnavailable();
  return safeCall(() => bridge.create(input));
}

export async function updateProductRemote(
  input: ProductUpdateInput
): Promise<ClientIpcResult<ProductData>> {
  const bridge = inventoryBridge();
  if (!bridge) return engineUnavailable();
  return safeCall(() => bridge.update(input));
}

export async function deleteProductRemote(id: string): Promise<ClientIpcResult<{ id: string }>> {
  const bridge = inventoryBridge();
  if (!bridge) return engineUnavailable();
  return safeCall(() => bridge.delete(id));
}

export async function listInventoryMovements(): Promise<ClientIpcResult<InventoryMovementData[]>> {
  const bridge = inventoryBridge();
  if (!bridge) return engineUnavailable();
  return safeCall(() => bridge.movements());
}

export async function applyInventoryMove(
  input: InventoryMoveInput
): Promise<ClientIpcResult<ProductData>> {
  const bridge = inventoryBridge();
  if (!bridge) return engineUnavailable();
  return safeCall(() => bridge.move(input));
}

export type WorkflowProduct = {
  id: string;
  name: string;
  category: string;
  code: string;
  barcode: string;
  supplier: string;
  qty: number;
  minStock: number;
  location: string;
  lot: string;
  expiry: string;
  lastMovement: string;
  avgCost: number;
  imageTone: "primary" | "mint" | "gold" | "lavender" | "rose";
  imageUrl?: string | null;
};

const TONES = new Set(["primary", "mint", "gold", "lavender", "rose"]);

export function dtoToWorkflowProduct(dto: ProductData): WorkflowProduct {
  let meta: Record<string, unknown> = {};
  try {
    meta = JSON.parse(dto.metaJson || "{}") as Record<string, unknown>;
  } catch {
    meta = {};
  }
  const tone = String(meta.imageTone ?? "primary");
  return {
    id: dto.id,
    name: dto.name,
    category: dto.categoryName || "Creme",
    code: dto.code,
    barcode: String(meta.barcode ?? ""),
    supplier: dto.supplier || "—",
    qty: dto.quantity,
    minStock: dto.minQuantity,
    location: String(meta.location ?? "—"),
    lot: String(meta.lot ?? "—"),
    expiry: dto.expiry || "—",
    lastMovement: String(meta.lastMovement ?? "—"),
    avgCost: dto.price,
    imageTone: TONES.has(tone)
      ? (tone as WorkflowProduct["imageTone"])
      : "primary",
    imageUrl: dto.photoUrl || null
  };
}

export function productMetaJson(product: {
  barcode: string;
  location: string;
  lot: string;
  lastMovement: string;
  imageTone: string;
}): string {
  return JSON.stringify({
    barcode: product.barcode,
    location: product.location,
    lot: product.lot,
    lastMovement: product.lastMovement,
    imageTone: product.imageTone
  });
}
