/**
 * SupplierService — orchestrazione fornitori + seed + join prodotti.
 */
import { nowIso } from "../core/types";
import type { ProductModel } from "../models/Product";
import {
  type SupplierCreateInput,
  type SupplierData,
  type SupplierDto,
  type SupplierLinkedProduct,
  type SupplierListQuery,
  type SupplierReorderMethod,
  type SupplierUpdateInput
} from "../models/Supplier";
import { SupplierRepository, SupplierRepositoryError } from "../repositories/SupplierRepository";
import { DataEngine } from "./DataEngine";

type SeedRow = {
  id: string;
  name: string;
  category: string;
  status: "attivo" | "disattivo";
  lastOrder: string;
  contact: string;
  phone: string;
  email: string;
  whatsapp: string;
  website: string;
  catalogUrl: string;
  address: string;
  vat: string;
  avgDelivery: string;
  minOrder: string;
  reorderMethod: SupplierReorderMethod;
  notes: string;
  ordersValue: string;
  reliability: string;
  logoTone: string;
  logoInitials: string;
};

const INITIAL_SEED: SeedRow[] = [
  {
    id: "f1",
    name: "DermLab Italia",
    category: "Dermocosmesi",
    status: "attivo",
    lastOrder: "1 ago 2026",
    contact: "Marco Bianchi",
    phone: "+39 02 8899 1100",
    email: "ordini@dermlab.it",
    whatsapp: "+39 340 112 2200",
    website: "https://dermlab.it",
    catalogUrl: "https://dermlab.it/catalogo",
    address: "Via Tortona 12, Milano",
    vat: "IT12345678901",
    avgDelivery: "3–4 giorni",
    minOrder: "€150",
    reorderMethod: "sito",
    notes: "Listino B2B aggiornato mensilmente. Sconto 5% oltre €500.",
    ordersValue: "€4.280",
    reliability: "98%",
    logoTone: "primary",
    logoInitials: "DL"
  },
  {
    id: "f2",
    name: "GlowSupply",
    category: "Dermocosmesi",
    status: "attivo",
    lastOrder: "28 lug 2026",
    contact: "Elena Verdi",
    phone: "+39 06 4455 7788",
    email: "hello@glowsupply.com",
    whatsapp: "+39 333 990 4411",
    website: "https://glowsupply.com",
    catalogUrl: "https://glowsupply.com/b2b",
    address: "Via Appia Nuova 88, Roma",
    vat: "IT98765432109",
    avgDelivery: "2 giorni",
    minOrder: "€100",
    reorderMethod: "email",
    notes: "Preferisce ordini via email con PDF allegato.",
    ordersValue: "€2.140",
    reliability: "95%",
    logoTone: "gold",
    logoInitials: "GS"
  },
  {
    id: "f3",
    name: "BeautyRaw",
    category: "Consumabili",
    status: "attivo",
    lastOrder: "20 lug 2026",
    contact: "Sara Neri",
    phone: "+39 051 220 3344",
    email: "ordini@beautyraw.it",
    whatsapp: "+39 348 771 0099",
    website: "https://beautyraw.it",
    catalogUrl: "https://beautyraw.it/shop",
    address: "Via Emilia 45, Bologna",
    vat: "IT11223344556",
    avgDelivery: "4–5 giorni",
    minOrder: "€80",
    reorderMethod: "whatsapp",
    notes: "Riordino rapido su WhatsApp Business.",
    ordersValue: "€980",
    reliability: "92%",
    logoTone: "mint",
    logoInitials: "BR"
  },
  {
    id: "f4",
    name: "SafeClinic",
    category: "Monouso",
    status: "attivo",
    lastOrder: "30 lug 2026",
    contact: "Luca Conti",
    phone: "+39 011 556 7788",
    email: "vendite@safeclinic.it",
    whatsapp: "+39 320 445 6677",
    website: "https://safeclinic.it",
    catalogUrl: "https://safeclinic.it/catalogo-pdf",
    address: "Corso Francia 210, Torino",
    vat: "IT55667788990",
    avgDelivery: "1–2 giorni",
    minOrder: "€50",
    reorderMethod: "telefono",
    notes: "Consegna espresso su Torino e provincia.",
    ordersValue: "€1.560",
    reliability: "99%",
    logoTone: "rose",
    logoInitials: "SC"
  },
  {
    id: "f5",
    name: "WaxPro",
    category: "Cera & Depilazione",
    status: "attivo",
    lastOrder: "22 lug 2026",
    contact: "Anna Greco",
    phone: "+39 081 334 5566",
    email: "ordini@waxpro.it",
    whatsapp: "+39 347 889 0011",
    website: "https://waxpro.it",
    catalogUrl: "https://waxpro.it/listino",
    address: "Via Toledo 100, Napoli",
    vat: "IT66778899001",
    avgDelivery: "5 giorni",
    minOrder: "€120",
    reorderMethod: "sito",
    notes: "Portale riordino con tracking lotto.",
    ordersValue: "€760",
    reliability: "90%",
    logoTone: "lavender",
    logoInitials: "WP"
  },
  {
    id: "f6",
    name: "StudioTech",
    category: "Attrezzature",
    status: "attivo",
    lastOrder: "15 giu 2026",
    contact: "Paolo Ferri",
    phone: "+39 02 1122 3344",
    email: "support@studiotech.eu",
    whatsapp: "+39 331 220 9988",
    website: "https://studiotech.eu",
    catalogUrl: "https://studiotech.eu/equipment",
    address: "Via Mecenate 76, Milano",
    vat: "IT77889900112",
    avgDelivery: "7–10 giorni",
    minOrder: "€300",
    reorderMethod: "manuale",
    notes: "Preventivi attrezzature su richiesta. Assistenza inclusa 12 mesi.",
    ordersValue: "€180",
    reliability: "94%",
    logoTone: "lavender",
    logoInitials: "ST"
  },
  {
    id: "f7",
    name: "BodyFlow",
    category: "Consumabili",
    status: "disattivo",
    lastOrder: "4 ago 2026",
    contact: "Giulia Romano",
    phone: "+39 055 778 9900",
    email: "b2b@bodyflow.it",
    whatsapp: "+39 339 554 1122",
    website: "https://bodyflow.it",
    catalogUrl: "https://bodyflow.it/refill",
    address: "Via della Scala 9, Firenze",
    vat: "IT33445566778",
    avgDelivery: "3 giorni",
    minOrder: "€90",
    reorderMethod: "email",
    notes: "Temporaneamente sospeso — rinnovo contratto in corso.",
    ordersValue: "€420",
    reliability: "88%",
    logoTone: "mint",
    logoInitials: "BF"
  },
  {
    id: "f8",
    name: "NaturalOil Co",
    category: "Dermocosmesi",
    status: "attivo",
    lastOrder: "3 ago 2026",
    contact: "Francesca Villa",
    phone: "+39 049 221 3344",
    email: "ordini@naturaloil.co",
    whatsapp: "+39 345 667 8899",
    website: "https://naturaloil.co",
    catalogUrl: "https://naturaloil.co/oils",
    address: "Via Roma 15, Padova",
    vat: "IT22334455667",
    avgDelivery: "2–3 giorni",
    minOrder: "€60",
    reorderMethod: "whatsapp",
    notes: "Oli bio certificati. Pack da 6 pezzi.",
    ordersValue: "€310",
    reliability: "96%",
    logoTone: "gold",
    logoInitials: "NO"
  }
];

export type IpcResult<T> =
  | { ok: true; data: T }
  | { ok: false; code: string; message: string };

function stockHint(product: ProductModel): string {
  if (product.quantity <= 0) return "Esaurito";
  if (product.quantity <= product.minQuantity) return "Scorta bassa";
  return `${product.quantity} pz`;
}

function linkedFor(name: string, products: ProductModel[]): SupplierLinkedProduct[] {
  const key = name.trim().toLowerCase();
  return products
    .filter((p) => p.supplier.trim().toLowerCase() === key)
    .map((p) => ({
      name: p.name,
      sku: p.code,
      stockHint: stockHint(p)
    }));
}

function withLinks(dto: SupplierData, products: ProductModel[]): SupplierDto {
  const linkedProducts = linkedFor(dto.name, products);
  return {
    ...dto,
    linkedProducts,
    productsCount: linkedProducts.length
  };
}

function seedMeta(row: SeedRow): string {
  return JSON.stringify({
    lastOrder: row.lastOrder,
    whatsapp: row.whatsapp,
    website: row.website,
    catalogUrl: row.catalogUrl,
    address: row.address,
    vat: row.vat,
    avgDelivery: row.avgDelivery,
    minOrder: row.minOrder,
    reorderMethod: row.reorderMethod,
    ordersValue: row.ordersValue,
    reliability: row.reliability,
    logoTone: row.logoTone,
    logoInitials: row.logoInitials
  });
}

export class SupplierService {
  private static instance: SupplierService | null = null;

  static getInstance(): SupplierService {
    if (!SupplierService.instance) {
      SupplierService.instance = new SupplierService();
    }
    return SupplierService.instance;
  }

  private repo(): SupplierRepository {
    return DataEngine.getInstance().suppliers;
  }

  ensureDemoSeed(): number {
    const repo = this.repo();
    if (repo.count() > 0) return 0;
    const now = nowIso();
    const rows: SupplierData[] = INITIAL_SEED.map((d) => ({
      id: d.id,
      createdAt: now,
      updatedAt: now,
      name: d.name,
      category: d.category,
      status: d.status,
      contact: d.contact,
      phone: d.phone,
      email: d.email,
      notes: d.notes,
      metaJson: seedMeta(d)
    }));
    return repo.seedMany(rows);
  }

  list(query: SupplierListQuery = {}): IpcResult<SupplierDto[]> {
    try {
      this.ensureDemoSeed();
      const products = DataEngine.getInstance().inventory.findAllProducts();
      return {
        ok: true,
        data: this.repo().list(query).map((s) => withLinks(s.toDto(), products))
      };
    } catch (error) {
      return wrapError(error);
    }
  }

  get(id: string): IpcResult<SupplierDto | null> {
    try {
      const row = this.repo().findById(id);
      if (!row) return { ok: true, data: null };
      const products = DataEngine.getInstance().inventory.findAllProducts();
      return { ok: true, data: withLinks(row.toDto(), products) };
    } catch (error) {
      return wrapError(error);
    }
  }

  create(input: SupplierCreateInput): IpcResult<SupplierDto> {
    try {
      const created = this.repo().create(input);
      const products = DataEngine.getInstance().inventory.findAllProducts();
      return { ok: true, data: withLinks(created.toDto(), products) };
    } catch (error) {
      return wrapError(error);
    }
  }

  update(input: SupplierUpdateInput): IpcResult<SupplierDto> {
    try {
      const existing = this.repo().findById(input.id);
      if (!existing) {
        return { ok: false, code: "NOT_FOUND", message: "Fornitore non trovato." };
      }
      const nextName = input.name !== undefined ? input.name.trim() : existing.name;
      const updated = this.repo().update(input);
      if (nextName && nextName.toLowerCase() !== existing.name.toLowerCase()) {
        DataEngine.getInstance().inventory.renameSupplierOnProducts(existing.name, nextName);
      }
      const products = DataEngine.getInstance().inventory.findAllProducts();
      return { ok: true, data: withLinks(updated.toDto(), products) };
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
  if (error instanceof SupplierRepositoryError) {
    return { ok: false, code: error.code, message: error.message };
  }
  return {
    ok: false,
    code: "UNKNOWN",
    message: error instanceof Error ? error.message : "Errore database sconosciuto."
  };
}
