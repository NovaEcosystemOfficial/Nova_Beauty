import {
  ArrowDownUp,
  Boxes,
  Copy,
  Download,
  ImageIcon,
  Link2,
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
import { useEffect, useMemo, useRef, useState, type ChangeEvent } from "react";
import { useDemoWorkflow } from "../demo/DemoWorkflowContext";
import NewSupplierDrawer from "./ui/NewSupplierDrawer";
import RightDrawer from "./ui/RightDrawer";
import SearchCombobox from "./ui/SearchCombobox";

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
  imageUrl?: string | null;
};

type MovementKind = "carico" | "scarico" | "rettifica";
type ConfirmKind = "duplicate" | "delete" | null;

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

const PRODUCT_CATEGORIES: ProductCategory[] = [
  "Creme",
  "Sieri",
  "Maschere",
  "Oli",
  "Monouso",
  "Attrezzature",
  "Consumabili"
];

const INITIAL_PRODUCTS: DemoProduct[] = [
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
  return `€${n.toLocaleString("it-IT", {
    minimumFractionDigits: n % 1 ? 2 : 0,
    maximumFractionDigits: 2
  })}`;
}

function needsReorder(p: DemoProduct): boolean {
  return p.qty <= p.minStock;
}

function todayMoveLabel(kind: string): string {
  return `${kind} · 5 ago`;
}

export default function InventoryWorkspace() {
  const {
    suppliers,
    pushToast,
    inventoryFocusCode,
    clearInventoryFocus,
    openSupplierModule
  } = useDemoWorkflow();
  const [products, setProducts] = useState(INITIAL_PRODUCTS);
  const [category, setCategory] = useState<"Tutti" | ProductCategory | "Da ordinare">("Tutti");
  const [query, setQuery] = useState("");
  const [supplierFilter, setSupplierFilter] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("tutti");
  const [expiryFilter, setExpiryFilter] = useState<ExpiryFilter>("tutti");
  const [sort, setSort] = useState<SortKey>("nome");
  const [selectedId, setSelectedId] = useState(INITIAL_PRODUCTS[0].id);
  const [supplierDrawerOpen, setSupplierDrawerOpen] = useState(false);
  const [orderCart, setOrderCart] = useState<Record<string, number>>({});
  const [orderOpen, setOrderOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [importStep, setImportStep] = useState(0);
  const [exportOpen, setExportOpen] = useState(false);
  const [movementOpen, setMovementOpen] = useState(false);
  const [movementKind, setMovementKind] = useState<MovementKind>("carico");
  const [movementQty, setMovementQty] = useState("1");
  const [newProductOpen, setNewProductOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [confirmKind, setConfirmKind] = useState<ConfirmKind>(null);
  const [linkSupplierOpen, setLinkSupplierOpen] = useState(false);
  const [linkSupplierId, setLinkSupplierId] = useState<string | null>(null);
  const [productForm, setProductForm] = useState({
    name: "",
    category: "Creme" as ProductCategory,
    code: "",
    supplier: "",
    qty: "0",
    minStock: "5",
    location: "",
    avgCost: "0"
  });
  const photoInputRef = useRef<HTMLInputElement>(null);
  const exportMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!exportOpen) return;
    const onPointer = (e: MouseEvent) => {
      if (!exportMenuRef.current?.contains(e.target as Node)) setExportOpen(false);
    };
    document.addEventListener("mousedown", onPointer);
    return () => document.removeEventListener("mousedown", onPointer);
  }, [exportOpen]);

  useEffect(() => {
    if (!inventoryFocusCode) return;
    const match = products.find(
      (p) => p.code.toLowerCase() === inventoryFocusCode.toLowerCase()
    );
    if (match) {
      setSelectedId(match.id);
      setCategory("Tutti");
      setQuery("");
      setSupplierFilter(null);
      setStatusFilter("tutti");
      pushToast(`Scheda Magazzino · ${match.name}`);
    } else {
      pushToast(`Prodotto non trovato · ${inventoryFocusCode}`);
    }
    clearInventoryFocus();
  }, [inventoryFocusCode, products, clearInventoryFocus, pushToast]);

  const supplierItems = useMemo(
    () =>
      suppliers.map((s) => ({
        id: s.id,
        label: s.name,
        meta: s.category
      })),
    [suppliers]
  );

  const selectedSupplierName = useMemo(() => {
    if (!supplierFilter) return null;
    return suppliers.find((s) => s.id === supplierFilter)?.name ?? null;
  }, [supplierFilter, suppliers]);

  const categoryCounts = useMemo(() => {
    const map: Record<string, number> = {
      Tutti: products.length,
      "Da ordinare": products.filter(needsReorder).length
    };
    for (const c of CATEGORIES) {
      if (c === "Tutti" || c === "Da ordinare") continue;
      map[c] = products.filter((p) => p.category === c).length;
    }
    return map;
  }, [products]);

  const reorderList = useMemo(
    () => products.filter(needsReorder).sort((a, b) => a.qty - b.qty),
    [products]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = products.filter((p) => {
      const st = stockStatus(p);
      if (category === "Da ordinare" && !needsReorder(p)) return false;
      if (category !== "Tutti" && category !== "Da ordinare" && p.category !== category) return false;
      if (selectedSupplierName && p.supplier !== selectedSupplierName) return false;
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
  }, [products, category, query, selectedSupplierName, statusFilter, expiryFilter, sort]);

  const selected =
    products.find((p) => p.id === selectedId) ?? filtered[0] ?? products[0] ?? INITIAL_PRODUCTS[0];

  const linkedSupplier = useMemo(() => {
    if (!selected?.supplier || selected.supplier === "—" || !selected.supplier.trim()) return null;
    return suppliers.find((s) => s.name.toLowerCase() === selected.supplier.toLowerCase()) ?? null;
  }, [selected, suppliers]);

  const cartItems = useMemo(() => {
    return Object.entries(orderCart)
      .map(([id, qty]) => {
        const product = products.find((p) => p.id === id);
        return product ? { product, qty } : null;
      })
      .filter(Boolean) as Array<{ product: DemoProduct; qty: number }>;
  }, [orderCart, products]);

  const cartCount = cartItems.reduce((s, i) => s + i.qty, 0);

  const stats = useMemo(() => {
    const low = products.filter((p) => stockStatus(p) !== "disponibile").length;
    const value = products.reduce((s, p) => s + stockValue(p), 0);
    return {
      products: products.length,
      low,
      value: formatEuro(Math.round(value)),
      movements: 7,
      orders: reorderList.length
    };
  }, [products, reorderList.length]);

  const addToOrder = (productId: string) => {
    setOrderCart((prev) => ({ ...prev, [productId]: (prev[productId] ?? 0) + 1 }));
    pushToast("Aggiunto all'ordine fornitori");
  };

  const applyMovement = (kind: MovementKind, qtyRaw: string, productId: string) => {
    const qty = Math.max(0, Math.floor(Number(qtyRaw) || 0));
    if (qty <= 0 && kind !== "rettifica") {
      pushToast("Inserisci una quantità valida");
      return;
    }
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id !== productId) return p;
        let nextQty = p.qty;
        if (kind === "carico") nextQty = p.qty + qty;
        if (kind === "scarico") nextQty = Math.max(0, p.qty - qty);
        if (kind === "rettifica") nextQty = qty;
        const label =
          kind === "carico" ? "Carico" : kind === "scarico" ? "Scarico" : "Rettifica";
        return { ...p, qty: nextQty, lastMovement: todayMoveLabel(label) };
      })
    );
    pushToast(
      kind === "carico"
        ? `Carico +${qty}`
        : kind === "scarico"
          ? `Scarico −${qty}`
          : `Rettifica · qty ${qty}`
    );
    setMovementOpen(false);
  };

  const openMovement = (kind: MovementKind) => {
    setMovementKind(kind);
    setMovementQty(kind === "rettifica" ? String(selected.qty) : "1");
    setMovementOpen(true);
  };

  const openNewProduct = () => {
    setProductForm({
      name: "",
      category: "Creme",
      code: "",
      supplier: linkedSupplier?.name ?? suppliers[0]?.name ?? "",
      qty: "0",
      minStock: "5",
      location: "",
      avgCost: "0"
    });
    setNewProductOpen(true);
  };

  const openEdit = () => {
    setProductForm({
      name: selected.name,
      category: selected.category,
      code: selected.code,
      supplier: selected.supplier,
      qty: String(selected.qty),
      minStock: String(selected.minStock),
      location: selected.location,
      avgCost: String(selected.avgCost)
    });
    setEditOpen(true);
  };

  const saveProductForm = (mode: "create" | "edit") => {
    if (!productForm.name.trim()) {
      pushToast("Inserisci il nome prodotto");
      return;
    }
    if (mode === "create") {
      const id = `p-${Date.now()}`;
      const product: DemoProduct = {
        id,
        name: productForm.name.trim(),
        category: productForm.category,
        code: productForm.code.trim() || `NEW-${Date.now().toString().slice(-4)}`,
        barcode: `800${Date.now().toString().slice(-10)}`,
        supplier: productForm.supplier.trim() || "—",
        qty: Math.max(0, Number(productForm.qty) || 0),
        minStock: Math.max(0, Number(productForm.minStock) || 0),
        location: productForm.location.trim() || "—",
        lot: "—",
        expiry: "—",
        lastMovement: todayMoveLabel("Nuovo"),
        avgCost: Math.max(0, Number(productForm.avgCost) || 0),
        imageTone: "primary"
      };
      setProducts((prev) => [product, ...prev]);
      setSelectedId(id);
      setNewProductOpen(false);
      pushToast("Prodotto creato");
      return;
    }
    setProducts((prev) =>
      prev.map((p) =>
        p.id === selected.id
          ? {
              ...p,
              name: productForm.name.trim(),
              category: productForm.category,
              code: productForm.code.trim() || p.code,
              supplier: productForm.supplier.trim() || "—",
              qty: Math.max(0, Number(productForm.qty) || 0),
              minStock: Math.max(0, Number(productForm.minStock) || 0),
              location: productForm.location.trim() || "—",
              avgCost: Math.max(0, Number(productForm.avgCost) || 0),
              lastMovement: todayMoveLabel("Modifica")
            }
          : p
      )
    );
    setEditOpen(false);
    pushToast("Prodotto aggiornato");
  };

  const onPickPhoto = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      pushToast("Seleziona un'immagine valida");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const url = typeof reader.result === "string" ? reader.result : null;
      if (!url) return;
      setProducts((prev) =>
        prev.map((p) => (p.id === selected.id ? { ...p, imageUrl: url } : p))
      );
      pushToast("Foto prodotto aggiornata");
    };
    reader.readAsDataURL(file);
  };

  const runConfirm = () => {
    if (!confirmKind) return;
    if (confirmKind === "duplicate") {
      const id = `p-${Date.now()}`;
      const copy: DemoProduct = {
        ...selected,
        id,
        name: `${selected.name} (copia)`,
        code: `${selected.code}-C`,
        barcode: `${selected.barcode.slice(0, -1)}9`,
        qty: 0,
        lastMovement: todayMoveLabel("Duplica"),
        imageUrl: selected.imageUrl ?? null
      };
      setProducts((prev) => [copy, ...prev]);
      setSelectedId(id);
      pushToast("Prodotto duplicato");
    } else if (confirmKind === "delete") {
      const removed = selected.id;
      setProducts((prev) => {
        const next = prev.filter((p) => p.id !== removed);
        setSelectedId(next[0]?.id ?? "");
        return next;
      });
      setOrderCart((prev) => {
        const { [removed]: _, ...rest } = prev;
        return rest;
      });
      pushToast("Prodotto eliminato");
    }
    setConfirmKind(null);
  };

  if (!selected) {
    return (
      <div className="nb-inventoryWs" role="region" aria-label="Workspace Magazzino">
        <p className="nb-ivEmpty">Nessun prodotto in magazzino.</p>
      </div>
    );
  }

  return (
    <>
      <div className="nb-inventoryWs" role="region" aria-label="Workspace Magazzino">
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
              <div className="nb-ivSelectWrap nb-ivSupplierCombo">
                <span className="nb-ivSelectLabel">Fornitore</span>
                <SearchCombobox
                  items={supplierItems}
                  valueId={supplierFilter}
                  placeholder="Cerca fornitore..."
                  createLabel="Nuovo Fornitore"
                  onSelect={setSupplierFilter}
                  onClear={() => setSupplierFilter(null)}
                  onCreate={() => setSupplierDrawerOpen(true)}
                />
              </div>
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
              <button
                type="button"
                className="nb-ghostBtn nb-ivGhost"
                onClick={() => {
                  setImportStep(0);
                  setImportOpen(true);
                }}
              >
                <Upload className="nb-ghostBtnIcon" aria-hidden={true} />
                Importa
              </button>
              <div className="nb-ivExportWrap" ref={exportMenuRef}>
                <button
                  type="button"
                  className="nb-ghostBtn nb-ivGhost"
                  aria-expanded={exportOpen}
                  onClick={() => setExportOpen((v) => !v)}
                >
                  <Download className="nb-ghostBtnIcon" aria-hidden={true} />
                  Esporta
                </button>
                {exportOpen ? (
                  <div className="nb-ivExportMenu" role="menu">
                    {["CSV", "Excel", "PDF"].map((fmt) => (
                      <button
                        key={fmt}
                        type="button"
                        role="menuitem"
                        className="nb-ivExportItem"
                        onClick={() => {
                          setExportOpen(false);
                          pushToast(`Esporta ${fmt} · ${filtered.length} prodotti demo`);
                        }}
                      >
                        Esporta {fmt}
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>
              <button
                type="button"
                className="nb-ghostBtn nb-ivGhost"
                onClick={() => openMovement("carico")}
              >
                <ArrowDownUp className="nb-ghostBtnIcon" aria-hidden={true} />
                Movimento
              </button>
              <button type="button" className="nb-newBtn nb-ivNew" onClick={openNewProduct}>
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

          <div className="nb-ivReorder" aria-label="Da ordinare">
            <div className="nb-ivReorderHead">
              <div>
                <div className="nb-ivReorderTitle">Da ordinare</div>
                <div className="nb-ivReorderSub">
                  Prodotti sotto soglia · {reorderList.length} voci · carrello {cartCount}
                </div>
              </div>
              <button
                type="button"
                className="nb-ivCartBtn"
                aria-label="Apri ordine fornitori"
                onClick={() => setOrderOpen(true)}
              >
                <ShoppingCart className="nb-ivReorderIcon" aria-hidden={true} />
                {cartCount > 0 ? <span className="nb-ivCartBadge">{cartCount}</span> : null}
              </button>
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
                  <button
                    type="button"
                    className="nb-ivReorderBtn"
                    onClick={() => addToOrder(p.id)}
                  >
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

        <aside className="nb-ivDetail" aria-label={`Dettaglio ${selected.name}`}>
          <input
            ref={photoInputRef}
            type="file"
            accept="image/*"
            className="nb-ivPhotoFile"
            aria-hidden={true}
            tabIndex={-1}
            onChange={onPickPhoto}
          />
          <button
            type="button"
            className={clsx("nb-ivPhoto", `tone-${selected.imageTone}`, selected.imageUrl && "hasImage")}
            onClick={() => photoInputRef.current?.click()}
            aria-label={selected.imageUrl ? "Cambia foto prodotto" : "Carica immagine prodotto"}
          >
            {selected.imageUrl ? (
              <img src={selected.imageUrl} alt="" className="nb-ivPhotoImg" />
            ) : (
              <>
                <ImageIcon className="nb-ivPhotoIcon" aria-hidden={true} />
                <span>Carica immagine</span>
              </>
            )}
          </button>

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
            {linkedSupplier ? (
              <>
                <span className="nb-ivSupplierLinkText">
                  Fornitore collegato · {linkedSupplier.name}
                </span>
                <button
                  type="button"
                  className="nb-ivAction"
                  onClick={() => openSupplierModule(linkedSupplier.id)}
                >
                  Scheda fornitore
                </button>
              </>
            ) : (
              <>
                <span className="nb-ivSupplierLinkText">Nessun fornitore collegato</span>
                <button
                  type="button"
                  className="nb-ivAction"
                  onClick={() => {
                    setLinkSupplierId(suppliers[0]?.id ?? null);
                    setLinkSupplierOpen(true);
                  }}
                >
                  <Link2 className="nb-ivActionIcon" aria-hidden={true} />
                  Collega
                </button>
              </>
            )}
          </div>

          <div className="nb-ivDetailActions">
            <button type="button" className="nb-ivAction" onClick={openEdit}>
              <Pencil className="nb-ivActionIcon" aria-hidden={true} />
              Modifica
            </button>
            <button type="button" className="nb-ivAction mint" onClick={() => openMovement("carico")}>
              <Plus className="nb-ivActionIcon" aria-hidden={true} />
              Carico
            </button>
            <button type="button" className="nb-ivAction gold" onClick={() => openMovement("scarico")}>
              <Minus className="nb-ivActionIcon" aria-hidden={true} />
              Scarico
            </button>
            <button type="button" className="nb-ivAction" onClick={() => setConfirmKind("duplicate")}>
              <Copy className="nb-ivActionIcon" aria-hidden={true} />
              Duplica
            </button>
            <button type="button" className="nb-ivAction danger" onClick={() => setConfirmKind("delete")}>
              <Trash2 className="nb-ivActionIcon" aria-hidden={true} />
              Elimina
            </button>
          </div>

          <p className="nb-ivDetailHint">Magazzino pronto · azioni demo locali</p>
        </aside>
      </div>

      <NewSupplierDrawer
        open={supplierDrawerOpen}
        onClose={() => setSupplierDrawerOpen(false)}
        onCreated={(id) => setSupplierFilter(id)}
        layer={2}
      />

      <RightDrawer
        open={orderOpen}
        title="Ordine Fornitori"
        subtitle={`${cartCount} articoli · demo`}
        onClose={() => setOrderOpen(false)}
        wide
      >
        {cartItems.length === 0 ? (
          <p className="nb-ivOrderEmpty">Il carrello è vuoto. Aggiungi prodotti da “Da ordinare”.</p>
        ) : (
          <div className="nb-ivOrderList">
            {cartItems.map(({ product, qty }) => (
              <div key={product.id} className="nb-ivOrderRow">
                <div>
                  <div className="nb-ivOrderName">{product.name}</div>
                  <div className="nb-ivOrderMeta">
                    {product.supplier} · min {product.minStock}
                  </div>
                </div>
                <div className="nb-ivOrderQty">
                  <button
                    type="button"
                    className="nb-ivOrderQtyBtn"
                    onClick={() =>
                      setOrderCart((prev) => {
                        const next = (prev[product.id] ?? 0) - 1;
                        if (next <= 0) {
                          const { [product.id]: _, ...rest } = prev;
                          return rest;
                        }
                        return { ...prev, [product.id]: next };
                      })
                    }
                  >
                    −
                  </button>
                  <strong>{qty}</strong>
                  <button
                    type="button"
                    className="nb-ivOrderQtyBtn"
                    onClick={() => addToOrder(product.id)}
                  >
                    +
                  </button>
                </div>
              </div>
            ))}
            <button
              type="button"
              className="nb-newBtn nb-drawerSubmit"
              onClick={() => {
                pushToast("Ordine fornitori inviato · demo");
                setOrderCart({});
                setOrderOpen(false);
              }}
            >
              Invia ordine demo
            </button>
          </div>
        )}
      </RightDrawer>

      {importOpen ? (
        <div className="nb-dialogRoot isOpen" role="presentation">
          <button
            type="button"
            className="nb-dialogBackdrop"
            aria-label="Chiudi"
            onClick={() => setImportOpen(false)}
          />
          <div className="nb-dialogCard nb-ivWideDialog" role="dialog" aria-modal="true" aria-label="Importa prodotti">
            <h2 className="nb-dialogTitle">Importa prodotti</h2>
            <p className="nb-dialogSub">
              Wizard demo · step {importStep + 1} di 3
            </p>
            <div className="nb-ivImportSteps" aria-hidden={true}>
              {["File", "Mappatura", "Conferma"].map((label, i) => (
                <span key={label} className={clsx("nb-ivImportStep", i <= importStep && "isOn")}>
                  {i + 1}. {label}
                </span>
              ))}
            </div>
            <p className="nb-ivImportCopy">
              {importStep === 0
                ? "Seleziona un file CSV/Excel (placeholder). Nessun upload reale in questa fase."
                : importStep === 1
                  ? "Associa colonne nome, codice, quantità e fornitore (demo)."
                  : "Anteprima: 12 prodotti pronti all'import demo."}
            </p>
            <div className="nb-dialogActions">
              <button type="button" className="nb-ghostBtn" onClick={() => setImportOpen(false)}>
                Annulla
              </button>
              {importStep < 2 ? (
                <button type="button" className="nb-newBtn" onClick={() => setImportStep((s) => s + 1)}>
                  Continua
                </button>
              ) : (
                <button
                  type="button"
                  className="nb-newBtn"
                  onClick={() => {
                    setImportOpen(false);
                    pushToast("Import completato · demo");
                  }}
                >
                  Importa
                </button>
              )}
            </div>
          </div>
        </div>
      ) : null}

      {movementOpen ? (
        <div className="nb-dialogRoot isOpen" role="presentation">
          <button
            type="button"
            className="nb-dialogBackdrop"
            aria-label="Chiudi"
            onClick={() => setMovementOpen(false)}
          />
          <div className="nb-dialogCard" role="dialog" aria-modal="true" aria-label="Movimento magazzino">
            <h2 className="nb-dialogTitle">Movimento inventario</h2>
            <p className="nb-dialogSub">{selected.name}</p>
            <div className="nb-ivMoveKinds" role="group" aria-label="Tipo movimento">
              {(
                [
                  ["carico", "Carico"],
                  ["scarico", "Scarico"],
                  ["rettifica", "Rettifica"]
                ] as const
              ).map(([k, label]) => (
                <button
                  key={k}
                  type="button"
                  className={clsx("nb-ivMoveKind", movementKind === k && "isOn")}
                  onClick={() => {
                    setMovementKind(k);
                    if (k === "rettifica") setMovementQty(String(selected.qty));
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
            <label className="nb-drawerField">
              <span className="nb-drawerFieldLabel">
                {movementKind === "rettifica" ? "Nuova quantità" : "Quantità"}
              </span>
              <input
                className="nb-drawerInput"
                type="number"
                min={0}
                value={movementQty}
                onChange={(e) => setMovementQty(e.target.value)}
              />
            </label>
            <div className="nb-dialogActions">
              <button type="button" className="nb-ghostBtn" onClick={() => setMovementOpen(false)}>
                Annulla
              </button>
              <button
                type="button"
                className="nb-newBtn"
                onClick={() => applyMovement(movementKind, movementQty, selected.id)}
              >
                Conferma
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {newProductOpen || editOpen ? (
        <div className="nb-dialogRoot isOpen" role="presentation">
          <button
            type="button"
            className="nb-dialogBackdrop"
            aria-label="Chiudi"
            onClick={() => {
              setNewProductOpen(false);
              setEditOpen(false);
            }}
          />
          <div
            className="nb-dialogCard nb-ivWideDialog"
            role="dialog"
            aria-modal="true"
            aria-label={newProductOpen ? "Nuovo prodotto" : "Modifica prodotto"}
          >
            <h2 className="nb-dialogTitle">{newProductOpen ? "Nuovo prodotto" : "Modifica prodotto"}</h2>
            <p className="nb-dialogSub">Catalogo magazzino · demo</p>
            <div className="nb-drawerRow2">
              <label className="nb-drawerField">
                <span className="nb-drawerFieldLabel">Nome</span>
                <input
                  className="nb-drawerInput"
                  value={productForm.name}
                  onChange={(e) => setProductForm((d) => ({ ...d, name: e.target.value }))}
                />
              </label>
              <label className="nb-drawerField">
                <span className="nb-drawerFieldLabel">Categoria</span>
                <select
                  className="nb-drawerSelect"
                  value={productForm.category}
                  onChange={(e) =>
                    setProductForm((d) => ({ ...d, category: e.target.value as ProductCategory }))
                  }
                >
                  {PRODUCT_CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <div className="nb-drawerRow2">
              <label className="nb-drawerField">
                <span className="nb-drawerFieldLabel">Codice</span>
                <input
                  className="nb-drawerInput"
                  value={productForm.code}
                  onChange={(e) => setProductForm((d) => ({ ...d, code: e.target.value }))}
                />
              </label>
              <label className="nb-drawerField">
                <span className="nb-drawerFieldLabel">Fornitore</span>
                <input
                  className="nb-drawerInput"
                  value={productForm.supplier}
                  onChange={(e) => setProductForm((d) => ({ ...d, supplier: e.target.value }))}
                  list="nb-iv-supplier-list"
                />
                <datalist id="nb-iv-supplier-list">
                  {suppliers.map((s) => (
                    <option key={s.id} value={s.name} />
                  ))}
                </datalist>
              </label>
            </div>
            <div className="nb-drawerRow2">
              <label className="nb-drawerField">
                <span className="nb-drawerFieldLabel">Quantità</span>
                <input
                  className="nb-drawerInput"
                  type="number"
                  min={0}
                  value={productForm.qty}
                  onChange={(e) => setProductForm((d) => ({ ...d, qty: e.target.value }))}
                />
              </label>
              <label className="nb-drawerField">
                <span className="nb-drawerFieldLabel">Scorta min</span>
                <input
                  className="nb-drawerInput"
                  type="number"
                  min={0}
                  value={productForm.minStock}
                  onChange={(e) => setProductForm((d) => ({ ...d, minStock: e.target.value }))}
                />
              </label>
            </div>
            <div className="nb-drawerRow2">
              <label className="nb-drawerField">
                <span className="nb-drawerFieldLabel">Ubicazione</span>
                <input
                  className="nb-drawerInput"
                  value={productForm.location}
                  onChange={(e) => setProductForm((d) => ({ ...d, location: e.target.value }))}
                />
              </label>
              <label className="nb-drawerField">
                <span className="nb-drawerFieldLabel">Costo medio</span>
                <input
                  className="nb-drawerInput"
                  type="number"
                  min={0}
                  step="0.01"
                  value={productForm.avgCost}
                  onChange={(e) => setProductForm((d) => ({ ...d, avgCost: e.target.value }))}
                />
              </label>
            </div>
            <div className="nb-dialogActions">
              <button
                type="button"
                className="nb-ghostBtn"
                onClick={() => {
                  setNewProductOpen(false);
                  setEditOpen(false);
                }}
              >
                Annulla
              </button>
              <button
                type="button"
                className="nb-newBtn"
                onClick={() => saveProductForm(newProductOpen ? "create" : "edit")}
              >
                {newProductOpen ? "Crea prodotto" : "Salva"}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {linkSupplierOpen ? (
        <div className="nb-dialogRoot isOpen" role="presentation">
          <button
            type="button"
            className="nb-dialogBackdrop"
            aria-label="Chiudi"
            onClick={() => setLinkSupplierOpen(false)}
          />
          <div className="nb-dialogCard" role="dialog" aria-modal="true" aria-label="Collega fornitore">
            <h2 className="nb-dialogTitle">Collega fornitore</h2>
            <p className="nb-dialogSub">{selected.name}</p>
            <label className="nb-drawerField">
              <span className="nb-drawerFieldLabel">Fornitore</span>
              <select
                className="nb-drawerSelect"
                value={linkSupplierId ?? ""}
                onChange={(e) => setLinkSupplierId(e.target.value || null)}
              >
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </label>
            <div className="nb-dialogActions">
              <button type="button" className="nb-ghostBtn" onClick={() => setLinkSupplierOpen(false)}>
                Annulla
              </button>
              <button
                type="button"
                className="nb-newBtn"
                onClick={() => {
                  const name = suppliers.find((s) => s.id === linkSupplierId)?.name;
                  if (!name) return;
                  setProducts((prev) =>
                    prev.map((p) => (p.id === selected.id ? { ...p, supplier: name } : p))
                  );
                  setLinkSupplierOpen(false);
                  pushToast(`Fornitore collegato · ${name}`);
                }}
              >
                Collega
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {confirmKind ? (
        <div className="nb-dialogRoot isOpen" role="presentation">
          <button
            type="button"
            className="nb-dialogBackdrop"
            aria-label="Annulla"
            onClick={() => setConfirmKind(null)}
          />
          <div className="nb-dialogCard" role="dialog" aria-modal="true">
            <h2 className="nb-dialogTitle">
              {confirmKind === "duplicate" ? "Duplicare il prodotto?" : "Eliminare il prodotto?"}
            </h2>
            <p className="nb-dialogSub">
              {confirmKind === "duplicate"
                ? `Verrà creata una copia di “${selected.name}”.`
                : `“${selected.name}” verrà rimosso dal magazzino demo.`}
            </p>
            <div className="nb-dialogActions">
              <button type="button" className="nb-ghostBtn" onClick={() => setConfirmKind(null)}>
                Annulla
              </button>
              <button
                type="button"
                className={clsx("nb-newBtn", confirmKind === "delete" && "nb-ivConfirmDanger")}
                onClick={runConfirm}
              >
                {confirmKind === "duplicate" ? "Duplica" : "Elimina"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
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
