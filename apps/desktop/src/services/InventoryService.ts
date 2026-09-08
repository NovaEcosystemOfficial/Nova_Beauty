/**
 * InventoryService — orchestrazione magazzino + seed iniziale + DTO IPC.
 */
import { nowIso } from "../core/types";
import type { InventoryMovementData } from "../models/InventoryMovement";
import {
  ProductModel,
  type InventoryMoveInput,
  type ProductCreateInput,
  type ProductData,
  type ProductListQuery,
  type ProductUpdateInput
} from "../models/Product";
import { InventoryRepository, InventoryRepositoryError } from "../repositories/InventoryRepository";
import { DataEngine } from "./DataEngine";

export type ProductDto = ProductData;
export type MovementDto = InventoryMovementData;

type SeedProduct = {
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
  imageTone: string;
};

const INITIAL_SEED: SeedProduct[] = [
  {
    id: "p1",
    name: "Crema viso idratante",
    category: "Creme",
    code: "CR-VIS-01",
    barcode: "8001234567001",
    supplier: "DermLab Italia",
    qty: 18,
    minStock: 8,
    location: "Scaffale A1",
    lot: "L2408-A",
    expiry: "03/2027",
    lastMovement: "Carico · 1 ago",
    avgCost: 12.5,
    imageTone: "primary"
  },
  {
    id: "p2",
    name: "Crema corpo nutriente",
    category: "Creme",
    code: "CR-COR-02",
    barcode: "8001234567002",
    supplier: "DermLab Italia",
    qty: 3,
    minStock: 8,
    location: "Scaffale A2",
    lot: "L2406-B",
    expiry: "11/2026",
    lastMovement: "Scarico · 4 ago",
    avgCost: 9.8,
    imageTone: "primary"
  },
  {
    id: "p3",
    name: "Siero vitamina C",
    category: "Sieri",
    code: "SR-VC-01",
    barcode: "8001234567010",
    supplier: "GlowSupply",
    qty: 11,
    minStock: 6,
    location: "Frigo B",
    lot: "L2501-C",
    expiry: "06/2027",
    lastMovement: "Carico · 28 lug",
    avgCost: 18.0,
    imageTone: "gold"
  },
  {
    id: "p4",
    name: "Siero acido ialuronico",
    category: "Sieri",
    code: "SR-HA-02",
    barcode: "8001234567011",
    supplier: "GlowSupply",
    qty: 0,
    minStock: 5,
    location: "Frigo B",
    lot: "L2409-D",
    expiry: "01/2027",
    lastMovement: "Scarico · 2 ago",
    avgCost: 16.4,
    imageTone: "gold"
  },
  {
    id: "p5",
    name: "Maschera argilla verde",
    category: "Maschere",
    code: "MS-AR-01",
    barcode: "8001234567020",
    supplier: "BeautyRaw",
    qty: 14,
    minStock: 6,
    location: "Scaffale C1",
    lot: "L2412-E",
    expiry: "09/2027",
    lastMovement: "Carico · 20 lug",
    avgCost: 7.2,
    imageTone: "mint"
  },
  {
    id: "p6",
    name: "Maschera tessuto HA",
    category: "Maschere",
    code: "MS-TS-02",
    barcode: "8001234567021",
    supplier: "BeautyRaw",
    qty: 2,
    minStock: 10,
    location: "Scaffale C2",
    lot: "L2502-F",
    expiry: "08/2026",
    lastMovement: "Scarico · 5 ago",
    avgCost: 2.9,
    imageTone: "mint"
  },
  {
    id: "p7",
    name: "Olio mandorle dolci",
    category: "Oli",
    code: "OL-MD-01",
    barcode: "8001234567030",
    supplier: "NaturalOil Co",
    qty: 9,
    minStock: 4,
    location: "Scaffale D1",
    lot: "L2407-G",
    expiry: "12/2027",
    lastMovement: "Scarico · 3 ago",
    avgCost: 6.5,
    imageTone: "lavender"
  },
  {
    id: "p8",
    name: "Guanti nitrile M",
    category: "Monouso",
    code: "MN-GN-M",
    barcode: "8001234567040",
    supplier: "SafeClinic",
    qty: 120,
    minStock: 50,
    location: "Armadio E",
    lot: "L2503-H",
    expiry: "—",
    lastMovement: "Carico · 30 lug",
    avgCost: 0.08,
    imageTone: "rose"
  },
  {
    id: "p9",
    name: "Lenzuolino monouso",
    category: "Monouso",
    code: "MN-LZ-01",
    barcode: "8001234567041",
    supplier: "SafeClinic",
    qty: 4,
    minStock: 20,
    location: "Armadio E",
    lot: "L2411-I",
    expiry: "—",
    lastMovement: "Scarico · 5 ago",
    avgCost: 0.35,
    imageTone: "rose"
  },
  {
    id: "p10",
    name: "Lampada LED magnifier",
    category: "Attrezzature",
    code: "AT-LED-01",
    barcode: "8001234567050",
    supplier: "StudioTech",
    qty: 2,
    minStock: 1,
    location: "Cabina 1",
    lot: "—",
    expiry: "—",
    lastMovement: "Inventario · 15 giu",
    avgCost: 180,
    imageTone: "lavender"
  },
  {
    id: "p11",
    name: "Strisce depilatorie",
    category: "Consumabili",
    code: "CN-ST-01",
    barcode: "8001234567060",
    supplier: "WaxPro",
    qty: 0,
    minStock: 15,
    location: "Scaffale F",
    lot: "L2405-J",
    expiry: "—",
    lastMovement: "Scarico · 31 lug",
    avgCost: 0.12,
    imageTone: "gold"
  },
  {
    id: "p12",
    name: "Cera professionale hot",
    category: "Consumabili",
    code: "CN-CW-01",
    barcode: "8001234567061",
    supplier: "WaxPro",
    qty: 7,
    minStock: 5,
    location: "Scaffale F",
    lot: "L2501-K",
    expiry: "05/2028",
    lastMovement: "Carico · 22 lug",
    avgCost: 14.0,
    imageTone: "gold"
  },
  {
    id: "p13",
    name: "Gel refill pressoterapia",
    category: "Consumabili",
    code: "CN-GL-01",
    barcode: "8001234567062",
    supplier: "BodyFlow",
    qty: 2,
    minStock: 6,
    location: "Cabina 2",
    lot: "L2408-L",
    expiry: "02/2027",
    lastMovement: "Scarico · 4 ago",
    avgCost: 11.5,
    imageTone: "mint"
  },
  {
    id: "p14",
    name: "Crema lenitiva post",
    category: "Creme",
    code: "CR-LN-03",
    barcode: "8001234567003",
    supplier: "DermLab Italia",
    qty: 6,
    minStock: 6,
    location: "Scaffale A3",
    lot: "L2502-M",
    expiry: "04/2027",
    lastMovement: "Scarico · 29 lug",
    avgCost: 10.2,
    imageTone: "primary"
  }
];

export type IpcResult<T> =
  | { ok: true; data: T }
  | { ok: false; code: string; message: string };

export class InventoryService {
  private static instance: InventoryService | null = null;

  static getInstance(): InventoryService {
    if (!InventoryService.instance) {
      InventoryService.instance = new InventoryService();
    }
    return InventoryService.instance;
  }

  private repo(): InventoryRepository {
    return DataEngine.getInstance().inventory;
  }

  ensureDemoSeed(): number {
    const repo = this.repo();
    if (repo.count() > 0) return 0;
    const now = nowIso();
    const rows: ProductData[] = INITIAL_SEED.map((d) => ({
      id: d.id,
      createdAt: now,
      updatedAt: now,
      code: d.code,
      name: d.name,
      categoryId: d.category.toLowerCase(),
      categoryName: d.category,
      supplier: d.supplier,
      quantity: d.qty,
      minQuantity: d.minStock,
      unit: "pz",
      price: d.avgCost,
      expiry: d.expiry,
      photoUrl: "",
      metaJson: JSON.stringify({
        barcode: d.barcode,
        location: d.location,
        lot: d.lot,
        lastMovement: d.lastMovement,
        imageTone: d.imageTone
      })
    }));
    return repo.seedMany(rows);
  }

  list(query: ProductListQuery = {}): IpcResult<ProductDto[]> {
    try {
      this.ensureDemoSeed();
      return { ok: true, data: this.repo().listProducts(query).map((p) => p.toDto()) };
    } catch (error) {
      return wrapError(error);
    }
  }

  get(id: string): IpcResult<ProductDto | null> {
    try {
      const row = this.repo().findProductById(id);
      return { ok: true, data: row ? row.toDto() : null };
    } catch (error) {
      return wrapError(error);
    }
  }

  create(input: ProductCreateInput): IpcResult<ProductDto> {
    try {
      return { ok: true, data: this.repo().createProduct(input).toDto() };
    } catch (error) {
      return wrapError(error);
    }
  }

  update(input: ProductUpdateInput): IpcResult<ProductDto> {
    try {
      return { ok: true, data: this.repo().updateProduct(input).toDto() };
    } catch (error) {
      return wrapError(error);
    }
  }

  remove(id: string): IpcResult<{ id: string }> {
    try {
      this.repo().deleteProduct(id);
      return { ok: true, data: { id } };
    } catch (error) {
      return wrapError(error);
    }
  }

  movements(): IpcResult<MovementDto[]> {
    try {
      return { ok: true, data: this.repo().findAllMovements().map((m) => m.toDto()) };
    } catch (error) {
      return wrapError(error);
    }
  }

  move(input: InventoryMoveInput): IpcResult<ProductDto> {
    try {
      return { ok: true, data: this.repo().applyStockMove(input).toDto() };
    } catch (error) {
      return wrapError(error);
    }
  }
}

function wrapError(error: unknown): IpcResult<never> {
  if (error instanceof InventoryRepositoryError) {
    return { ok: false, code: error.code, message: error.message };
  }
  return {
    ok: false,
    code: "UNKNOWN",
    message: error instanceof Error ? error.message : "Errore database sconosciuto."
  };
}

export { ProductModel };
