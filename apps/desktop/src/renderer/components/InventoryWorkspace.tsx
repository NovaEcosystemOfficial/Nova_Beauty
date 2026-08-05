import {
  ArrowDownUp,
  Boxes,
  Copy,
  Download,
  ImageIcon,
  Minus,
  PackagePlus,
  Pencil,
  Plus,
  Search,
  ShoppingCart,
  Trash2,
  Upload
} from "lucide-react";
import clsx from "clsx";
import { useMemo, useState } from "react";

type ProductCategory =
  | "Creme"
  | "Sieri"
  | "Maschere"
  | "Oli"
  | "Monouso"
  | "Attrezzature"
  | "Consumabili";

type StockStatus = "disponibile" | "scorta_bassa" | "esaurito";

type DemoProduct = {
  id: string;
  name: string;
  category: ProductCategory;
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
};

const CATEGORIES: Array<"Tutti" | ProductCategory | "Da ordinare"> = [
  "Tutti",
  "Creme",
  "Sieri",
  "Maschere",
  "Oli",
  "Monouso",
  "Attrezzature",
  "Consumabili",
  "Da ordinare"
];

const DEMO_PRODUCTS: DemoProduct[] = [
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

type SortKey = "nome" | "qty" | "scadenza" | "valore";
type StatusFilter = "tutti" | StockStatus;
type ExpiryFilter = "tutti" | "prossima" | "ok" | "nessuna";

function stockStatus(p: DemoProduct): StockStatus {
  if (p.qty <= 0) return "esaurito";
  if (p.qty <= p.minStock) return "scorta_bassa";
  return "disponibile";
}

function statusLabel(s: StockStatus): string {
  switch (s) {
    case "disponibile":
      return "Disponibile";
    case "scorta_bassa":
      return "Scorta bassa";
    case "esaurito":
      return "Esaurito";
  }
}

function stockValue(p: DemoProduct): number {
  return Math.round(p.qty * p.avgCost * 100) / 100;
}

function formatEuro(n: number): string {
  return `€${n.toLocaleString("it-IT", { minimumFractionDigits: n % 1 ? 2 : 0, maximumFractionDigits: 2 })}`;
}

function needsReorder(p: DemoProduct): boolean {
  return p.qty <= p.minStock;
}

export default function InventoryWorkspace() {
  const [category, setCategory] = useState<"Tutti" | ProductCategory | "Da ordinare">("Tutti");
  const [query, setQuery] = useState("");
  const [supplierFilter, setSupplierFilter] = useState("tutti");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("tutti");
  const [expiryFilter, setExpiryFilter] = useState<ExpiryFilter>("tutti");
  const [sort, setSort] = useState<SortKey>("nome");
  const [selectedId, setSelectedId] = useState(DEMO_PRODUCTS[0].id);

  const suppliers = useMemo(
    () => [...new Set(DEMO_PRODUCTS.map((p) => p.supplier))].sort((a, b) => a.localeCompare(b, "it")),
    []
  );

  const categoryCounts = useMemo(() => {
    const map: Record<string, number> = {
      Tutti: DEMO_PRODUCTS.length,
      "Da ordinare": DEMO_PRODUCTS.filter(needsReorder).length
    };
    for (const c of CATEGORIES) {
      if (c === "Tutti" || c === "Da ordinare") continue;
      map[c] = DEMO_PRODUCTS.filter((p) => p.category === c).length;
    }
    return map;
  }, []);

  const reorderList = useMemo(
    () => DEMO_PRODUCTS.filter(needsReorder).sort((a, b) => a.qty - b.qty),
    []
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = DEMO_PRODUCTS.filter((p) => {
      const st = stockStatus(p);
      if (category === "Da ordinare" && !needsReorder(p)) return false;
      if (category !== "Tutti" && category !== "Da ordinare" && p.category !== category) return false;
      if (supplierFilter !== "tutti" && p.supplier !== supplierFilter) return false;
      if (statusFilter !== "tutti" && st !== statusFilter) return false;
      if (expiryFilter === "nessuna" && p.expiry !== "—") return false;
      if (expiryFilter === "ok" && (p.expiry === "—" || p.expiry.includes("2026"))) return false;
      if (expiryFilter === "prossima" && !p.expiry.includes("2026")) return false;
      if (!q) return true;
      return (
        p.name.toLowerCase().includes(q) ||
        p.code.toLowerCase().includes(q) ||
        p.barcode.includes(q) ||
        p.supplier.toLowerCase().includes(q)
      );
    });

    list = [...list].sort((a, b) => {
      switch (sort) {
        case "qty":
          return a.qty - b.qty;
        case "scadenza":
          return a.expiry.localeCompare(b.expiry, "it");
        case "valore":
          return stockValue(b) - stockValue(a);
        default:
          return a.name.localeCompare(b.name, "it");
      }
    });

    return list;
  }, [category, query, supplierFilter, statusFilter, expiryFilter, sort]);

  const selected =
    filtered.find((p) => p.id === selectedId) ?? filtered[0] ?? DEMO_PRODUCTS[0];

  const stats = useMemo(() => {
    const low = DEMO_PRODUCTS.filter((p) => stockStatus(p) !== "disponibile").length;
    const value = DEMO_PRODUCTS.reduce((s, p) => s + stockValue(p), 0);
    return {
      products: DEMO_PRODUCTS.length,
      low,
      value: formatEuro(Math.round(value)),
      movements: 7,
      orders: reorderList.length
    };
  }, [reorderList.length]);

  return (
    <div className="nb-inventoryWs" role="region" aria-label="Workspace Magazzino">
      {/* SINISTRA */}
      <aside className="nb-ivCats">
        <div className="nb-ivCatsHead">
          <Boxes className="nb-ivCatsIcon" aria-hidden={true} />
          <div>
            <div className="nb-ivCatsTitle">Categorie</div>
            <div className="nb-ivCatsSub">Magazzino · demo</div>
          </div>
        </div>
        <nav className="nb-ivCatList" aria-label="Categorie magazzino">
          {CATEGORIES.map((cat) => {
            const isActive = category === cat;
            const isReorder = cat === "Da ordinare";
            return (
              <button
                key={cat}
                type="button"
                className={clsx("nb-ivCatItem", isActive && "isActive", isReorder && "isReorder")}
                onClick={() => setCategory(cat)}
              >
                <span className="nb-ivCatLabel">{cat}</span>
                <span className={clsx("nb-ivCatCount", isReorder && "warn")}>
                  {categoryCounts[cat] ?? 0}
                </span>
              </button>
            );
          })}
        </nav>
      </aside>

      {/* CENTRO */}
      <section className="nb-ivMain">
        <div className="nb-ivToolbar">
          <div className="nb-ivSearch">
            <Search className="nb-ivSearchIcon" aria-hidden={true} />
            <input
              className="nb-ivSearchInput"
              placeholder="Cerca prodotti, codice, barcode…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Cerca prodotti"
            />
          </div>

          <div className="nb-ivFilters">
            <label className="nb-ivSelectWrap">
              <span className="nb-ivSelectLabel">Fornitore</span>
              <select
                className="nb-ivSelect"
                value={supplierFilter}
                onChange={(e) => setSupplierFilter(e.target.value)}
              >
                <option value="tutti">Tutti</option>
                {suppliers.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </label>
            <label className="nb-ivSelectWrap">
              <span className="nb-ivSelectLabel">Stato</span>
              <select
                className="nb-ivSelect"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
              >
                <option value="tutti">Tutti</option>
                <option value="disponibile">Disponibile</option>
                <option value="scorta_bassa">Scorta bassa</option>
                <option value="esaurito">Esaurito</option>
              </select>
            </label>
            <label className="nb-ivSelectWrap">
              <span className="nb-ivSelectLabel">Scadenza</span>
              <select
                className="nb-ivSelect"
                value={expiryFilter}
                onChange={(e) => setExpiryFilter(e.target.value as ExpiryFilter)}
              >
                <option value="tutti">Tutte</option>
                <option value="prossima">Entro 2026</option>
                <option value="ok">Oltre 2026</option>
                <option value="nessuna">Senza scadenza</option>
              </select>
            </label>
            <label className="nb-ivSelectWrap">
              <span className="nb-ivSelectLabel">
                <ArrowDownUp className="nb-ivSortIcon" aria-hidden={true} />
                Ordina
              </span>
              <select
                className="nb-ivSelect"
                value={sort}
                onChange={(e) => setSort(e.target.value as SortKey)}
              >
                <option value="nome">Nome</option>
                <option value="qty">Quantità</option>
                <option value="scadenza">Scadenza</option>
                <option value="valore">Valore</option>
              </select>
            </label>
          </div>

          <div className="nb-ivQuickActions">
            <button type="button" className="nb-ghostBtn nb-ivGhost" disabled>
              <Upload className="nb-ghostBtnIcon" aria-hidden={true} />
              Importa
            </button>
            <button type="button" className="nb-ghostBtn nb-ivGhost" disabled>
              <Download className="nb-ghostBtnIcon" aria-hidden={true} />
              Esporta
            </button>
            <button type="button" className="nb-ghostBtn nb-ivGhost" disabled>
              <ArrowDownUp className="nb-ghostBtnIcon" aria-hidden={true} />
              Movimento
            </button>
            <button type="button" className="nb-newBtn nb-ivNew" disabled>
              <PackagePlus className="nb-newBtnIcon" aria-hidden={true} />
              Nuovo prodotto
            </button>
          </div>
        </div>

        <div className="nb-ivListMeta">
          <span>
            {filtered.length} prodotti
            {category !== "Tutti" ? ` · ${category}` : ""}
          </span>
          <span className="nb-ivListMetaHint">Ricerca istantanea · demo</span>
        </div>

        <ul className="nb-ivList" role="listbox" aria-label="Elenco prodotti">
          {filtered.map((product) => {
            const st = stockStatus(product);
            const isSelected = product.id === selected.id;
            return (
              <li key={product.id}>
                <button
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  className={clsx("nb-ivRow", isSelected && "isSelected", `status-${st}`)}
                  onClick={() => setSelectedId(product.id)}
                >
                  <span className={clsx("nb-ivRowDot", `is-${st}`)} aria-hidden={true} />
                  <span className="nb-ivRowBody">
                    <span className="nb-ivRowTop">
                      <span className="nb-ivRowName">{product.name}</span>
                      <span className={clsx("nb-ivBadge", `is-${st}`)}>{statusLabel(st)}</span>
                    </span>
                    <span className="nb-ivRowMeta">
                      <span>{product.category}</span>
                      <span>
                        Qty <strong>{product.qty}</strong>
                      </span>
                      <span>
                        Min <strong>{product.minStock}</strong>
                      </span>
                      <span className="nb-ivRowSupplier">{product.supplier}</span>
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
          {filtered.length === 0 ? (
            <li className="nb-ivEmpty">Nessun prodotto con questi filtri.</li>
          ) : null}
        </ul>

        {/* Pannello Da ordinare */}
        <div className="nb-ivReorder" aria-label="Da ordinare">
          <div className="nb-ivReorderHead">
            <div>
              <div className="nb-ivReorderTitle">Da ordinare</div>
              <div className="nb-ivReorderSub">
                Prodotti sotto soglia · {reorderList.length} voci · solo UI
              </div>
            </div>
            <ShoppingCart className="nb-ivReorderIcon" aria-hidden={true} />
          </div>
          <div className="nb-ivReorderList">
            {reorderList.slice(0, 5).map((p) => (
              <div key={p.id} className="nb-ivReorderItem">
                <div className="nb-ivReorderInfo">
                  <div className="nb-ivReorderName">{p.name}</div>
                  <div className="nb-ivReorderMeta">
                    Qty {p.qty} / min {p.minStock} · {p.supplier}
                  </div>
                </div>
                <button type="button" className="nb-ivReorderBtn" disabled>
                  Aggiungi all&apos;ordine
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="nb-ivStats" aria-label="Statistiche magazzino">
          <StatCard label="Prodotti" value={String(stats.products)} />
          <StatCard label="In esaurimento" value={String(stats.low)} tone="warn" />
          <StatCard label="Valore magazzino" value={stats.value} />
          <StatCard label="Movimenti oggi" value={String(stats.movements)} />
          <StatCard label="Ordini consigliati" value={String(stats.orders)} tone="danger" />
        </div>
      </section>

      {/* DESTRA */}
      <aside className="nb-ivDetail" aria-label={`Dettaglio ${selected.name}`}>
        <div className={clsx("nb-ivPhoto", `tone-${selected.imageTone}`)} aria-hidden={true}>
          <ImageIcon className="nb-ivPhotoIcon" />
          <span>Foto prodotto</span>
        </div>

        <div className="nb-ivDetailHead">
          <h2 className="nb-ivDetailName">{selected.name}</h2>
          <div className="nb-ivDetailBadges">
            <span className="nb-ivCatPill">{selected.category}</span>
            <span className={clsx("nb-ivBadge", `is-${stockStatus(selected)}`)}>
              {statusLabel(stockStatus(selected))}
            </span>
          </div>
        </div>

        <div className="nb-ivDetailGrid">
          <Field label="Codice" value={selected.code} />
          <Field label="Barcode" value={selected.barcode} />
          <Field label="Fornitore" value={selected.supplier} />
          <Field label="Ubicazione" value={selected.location} />
          <Field label="Quantità" value={String(selected.qty)} strong />
          <Field label="Scorta minima" value={String(selected.minStock)} />
          <Field label="Lotto" value={selected.lot} />
          <Field label="Scadenza" value={selected.expiry} />
          <Field label="Ultimo movimento" value={selected.lastMovement} />
          <Field label="Costo medio" value={formatEuro(selected.avgCost)} />
          <Field label="Valore magazzino" value={formatEuro(stockValue(selected))} strong />
          <Field label="Categoria" value={selected.category} />
        </div>

        <div className="nb-ivSupplierLink">
          <span className="nb-ivSupplierLinkText">
            Collegamento Fornitori · UI ready (nessuna logica)
          </span>
          <button type="button" className="nb-ivAction" disabled>
            Scheda fornitore
          </button>
        </div>

        <div className="nb-ivDetailActions">
          <button type="button" className="nb-ivAction" disabled>
            <Pencil className="nb-ivActionIcon" aria-hidden={true} />
            Modifica
          </button>
          <button type="button" className="nb-ivAction mint" disabled>
            <Plus className="nb-ivActionIcon" aria-hidden={true} />
            Carico
          </button>
          <button type="button" className="nb-ivAction gold" disabled>
            <Minus className="nb-ivActionIcon" aria-hidden={true} />
            Scarico
          </button>
          <button type="button" className="nb-ivAction" disabled>
            <Copy className="nb-ivActionIcon" aria-hidden={true} />
            Duplica
          </button>
          <button type="button" className="nb-ivAction danger" disabled>
            <Trash2 className="nb-ivActionIcon" aria-hidden={true} />
            Elimina
          </button>
        </div>

        <p className="nb-ivDetailHint">Demo UI — pronto per collegamento al Core</p>
      </aside>
    </div>
  );
}

function Field({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="nb-ivField">
      <span className="nb-ivFieldLabel">{label}</span>
      <span className={clsx("nb-ivFieldValue", strong && "strong")}>{value}</span>
    </div>
  );
}

function StatCard({
  label,
  value,
  tone
}: {
  label: string;
  value: string;
  tone?: "warn" | "danger";
}) {
  return (
    <div className={clsx("nb-ivStat", tone && `tone-${tone}`)}>
      <span className="nb-ivStatLabel">{label}</span>
      <span className="nb-ivStatValue">{value}</span>
    </div>
  );
}
