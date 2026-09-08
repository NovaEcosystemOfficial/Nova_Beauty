/**
 * ServiceService — orchestrazione servizi + seed iniziale + DTO IPC.
 * Sprint 4: solo main process.
 */
import { nowIso } from "../core/types";
import {
  ServiceModel,
  type ServiceCreateInput,
  type ServiceData,
  type ServiceListQuery,
  type ServiceUpdateInput
} from "../models/Service";
import { ServiceRepository, ServiceRepositoryError } from "../repositories/ServiceRepository";
import { DataEngine } from "./DataEngine";

export type ServiceDto = ServiceData;

export type ServiceMetaExtras = {
  description?: string;
  lastEdited?: string;
  tone?: string;
  soldCount?: number;
  cabin?: string;
};

type SeedRow = {
  id: string;
  name: string;
  category: string;
  durationMin: number;
  price: number;
  products: string[];
  operators: string[];
  color: string;
  active: boolean;
  meta: ServiceMetaExtras;
};

/**
 * Catalogo iniziale (solo se tabella vuota).
 * ID allineati agli appuntamenti seed (svc1–svc5) + catalogo schermata Servizi.
 */
const INITIAL_SEED: SeedRow[] = [
  {
    id: "svc1",
    name: "Pulizia viso deep",
    category: "Viso",
    durationMin: 60,
    price: 65,
    products: ["Cleanser enzyme", "Maschera argilla", "Siero idratante"],
    operators: ["Fabio", "Laura"],
    color: "#c45c6a",
    active: true,
    meta: {
      description: "Pulizia profonda con estrazione, maschera e idratazione finale.",
      lastEdited: "2 ago 2026",
      tone: "primary",
      soldCount: 48,
      cabin: "Cabina 1"
    }
  },
  {
    id: "svc4",
    name: "Peeling enzimatico",
    category: "Viso",
    durationMin: 45,
    price: 80,
    products: ["Peeling enzyme bio", "Crema lenitiva"],
    operators: ["Fabio"],
    color: "#c45c6a",
    active: true,
    meta: {
      description: "Peeling delicato per luminosità e texture più uniforme.",
      lastEdited: "28 lug 2026",
      tone: "primary",
      soldCount: 31
    }
  },
  {
    id: "svc2",
    name: "Massaggio rilassante",
    category: "Massaggi",
    durationMin: 60,
    price: 55,
    products: ["Olio mandorle", "Candela massaggio"],
    operators: ["Laura", "Fabio"],
    color: "#7a6bb0",
    active: true,
    meta: {
      description: "Massaggio corpo a olio caldo, focus schiena e spalle.",
      lastEdited: "30 lug 2026",
      tone: "lavender",
      soldCount: 62
    }
  },
  {
    id: "svc5",
    name: "Pressoterapia",
    category: "Corpo",
    durationMin: 45,
    price: 45,
    products: ["Gel drenante"],
    operators: ["Laura"],
    color: "#3d9b84",
    active: true,
    meta: {
      description: "Trattamento drenante con tuta pressoterapica.",
      lastEdited: "25 lug 2026",
      tone: "mint",
      soldCount: 27
    }
  },
  {
    id: "svc6",
    name: "Manicure spa",
    category: "Mani",
    durationMin: 40,
    price: 35,
    products: ["Scrub mani", "Base coat", "Smalto"],
    operators: ["Laura"],
    color: "#c45c6a",
    active: true,
    meta: {
      description: "Cura mani completa con scrub, maschera e smalto classico.",
      lastEdited: "20 lug 2026",
      tone: "rose",
      soldCount: 41
    }
  },
  {
    id: "svc7",
    name: "Pedicure estetico",
    category: "Piedi",
    durationMin: 50,
    price: 42,
    products: ["Crema piedi", "Smalto"],
    operators: ["Laura"],
    color: "#c9a227",
    active: true,
    meta: {
      description: "Cura piedi con callosità leggere e finitura smalto.",
      lastEdited: "18 lug 2026",
      tone: "gold",
      soldCount: 22
    }
  },
  {
    id: "svc3",
    name: "Epilazione gambe",
    category: "Epilazione",
    durationMin: 45,
    price: 40,
    products: ["Cera professionale", "Olio post"],
    operators: ["Laura", "Fabio"],
    color: "#5a6b7a",
    active: true,
    meta: {
      description: "Epilazione completa gambe con cera a caldo.",
      lastEdited: "22 lug 2026",
      tone: "slate",
      soldCount: 55
    }
  },
  {
    id: "svc8",
    name: "Extension ciglia classiche",
    category: "Extension ciglia",
    durationMin: 90,
    price: 95,
    products: ["Ciglia 0.15", "Colla hypo"],
    operators: ["Fabio"],
    color: "#7a6bb0",
    active: true,
    meta: {
      description: "Applicazione one-by-one per volume naturale.",
      lastEdited: "1 ago 2026",
      tone: "lavender",
      soldCount: 19
    }
  },
  {
    id: "svc9",
    name: "Trucco evento",
    category: "Trucco",
    durationMin: 50,
    price: 70,
    products: ["Primer", "Fondotinta", "Palette occhi"],
    operators: ["Fabio"],
    color: "#c45c6a",
    active: false,
    meta: {
      description: "Make-up completo per eventi — temporaneamente non in listino.",
      lastEdited: "10 giu 2026",
      tone: "rose",
      soldCount: 8
    }
  },
  {
    id: "svc10",
    name: "Pacchetto Viso Glow ×5",
    category: "Pacchetti",
    durationMin: 60,
    price: 280,
    products: ["Kit viso studio"],
    operators: ["Fabio", "Laura"],
    color: "#c9a227",
    active: true,
    meta: {
      description: "5 sedute pulizia + peeling a prezzo dedicato.",
      lastEdited: "3 ago 2026",
      tone: "gold",
      soldCount: 14
    }
  },
  {
    id: "svc11",
    name: "Idratazione intensiva",
    category: "Viso",
    durationMin: 50,
    price: 55,
    products: ["Ampolla HA", "Maschera tessuto"],
    operators: ["Fabio", "Laura"],
    color: "#c45c6a",
    active: true,
    meta: {
      description: "Trattamento idratante con ampolle e maschera tessuto.",
      lastEdited: "29 lug 2026",
      tone: "primary",
      soldCount: 36
    }
  },
  {
    id: "svc12",
    name: "Massaggio linfodrenante",
    category: "Massaggi",
    durationMin: 50,
    price: 60,
    products: ["Crema drenante"],
    operators: ["Laura"],
    color: "#7a6bb0",
    active: true,
    meta: {
      description: "Manovre drenanti per gambe e addome.",
      lastEdited: "27 lug 2026",
      tone: "lavender",
      soldCount: 24
    }
  }
];

export type IpcResult<T> =
  | { ok: true; data: T }
  | { ok: false; code: string; message: string };

export class ServiceService {
  private static instance: ServiceService | null = null;

  static getInstance(): ServiceService {
    if (!ServiceService.instance) {
      ServiceService.instance = new ServiceService();
    }
    return ServiceService.instance;
  }

  private repo(): ServiceRepository {
    return DataEngine.getInstance().services;
  }

  /** Se la tabella è vuota, importa il catalogo iniziale in SQLite. */
  ensureDemoSeed(): number {
    const repo = this.repo();
    if (repo.count() > 0) return 0;
    const now = nowIso();
    const rows: ServiceData[] = INITIAL_SEED.map((d) => ({
      id: d.id,
      createdAt: now,
      updatedAt: now,
      name: d.name,
      category: d.category,
      durationMin: d.durationMin,
      price: d.price,
      products: d.products.join(", "),
      operatorsJson: JSON.stringify(d.operators),
      color: d.color,
      active: d.active,
      metaJson: JSON.stringify(d.meta)
    }));
    return repo.seedMany(rows);
  }

  list(query: ServiceListQuery = {}): IpcResult<ServiceDto[]> {
    try {
      this.ensureDemoSeed();
      return { ok: true, data: this.repo().list(query).map((s) => s.toDto()) };
    } catch (error) {
      return wrapError(error);
    }
  }

  get(id: string): IpcResult<ServiceDto | null> {
    try {
      const row = this.repo().findById(id);
      return { ok: true, data: row ? row.toDto() : null };
    } catch (error) {
      return wrapError(error);
    }
  }

  create(input: ServiceCreateInput): IpcResult<ServiceDto> {
    try {
      return { ok: true, data: this.repo().create(input).toDto() };
    } catch (error) {
      return wrapError(error);
    }
  }

  update(input: ServiceUpdateInput): IpcResult<ServiceDto> {
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
  if (error instanceof ServiceRepositoryError) {
    return { ok: false, code: error.code, message: error.message };
  }
  return {
    ok: false,
    code: "UNKNOWN",
    message: error instanceof Error ? error.message : "Errore database sconosciuto."
  };
}

export { ServiceModel };
