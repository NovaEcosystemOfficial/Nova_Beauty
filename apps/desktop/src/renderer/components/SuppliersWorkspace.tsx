import {
  ClipboardList,
  EyeOff,
  ExternalLink,
  FileText,
  Globe,
  Mail,
  MessageSquare,
  Pencil,
  Phone,
  Plus,
  Search,
  Trash2,
  Truck
} from "lucide-react";
import clsx from "clsx";
import { useMemo, useState, type ComponentType } from "react";

type SupplierStatus = "attivo" | "disattivo";

type ReorderMethod = "sito" | "email" | "whatsapp" | "telefono" | "manuale";

type SupplierCategory =
  | "Dermocosmesi"
  | "Consumabili"
  | "Attrezzature"
  | "Cera & Depilazione"
  | "Monouso";

type LinkedProduct = {
  name: string;
  sku: string;
  stockHint: string;
};

type DemoSupplier = {
  id: string;
  name: string;
  category: SupplierCategory;
  status: SupplierStatus;
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
  reorderMethod: ReorderMethod;
  notes: string;
  productsCount: number;
  ordersValue: string;
  reliability: string;
  logoTone: "primary" | "mint" | "gold" | "lavender" | "rose";
  logoInitials: string;
  linkedProducts: LinkedProduct[];
};

const REORDER_META: Record<
  ReorderMethod,
  { label: string; icon: ComponentType<{ className?: string; "aria-hidden"?: boolean }> }
> = {
  sito: { label: "Sito Web", icon: Globe },
  email: { label: "Email", icon: Mail },
  whatsapp: { label: "WhatsApp", icon: MessageSquare },
  telefono: { label: "Telefono", icon: Phone },
  manuale: { label: "Manuale", icon: ClipboardList }
};

const DEMO_SUPPLIERS: DemoSupplier[] = [
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
    productsCount: 4,
    ordersValue: "€4.280",
    reliability: "98%",
    logoTone: "primary",
    logoInitials: "DL",
    linkedProducts: [
      { name: "Crema viso idratante", sku: "CR-VIS-01", stockHint: "18 pz" },
      { name: "Crema corpo nutriente", sku: "CR-COR-02", stockHint: "Scorta bassa" },
      { name: "Crema lenitiva post", sku: "CR-LN-03", stockHint: "6 pz" },
      { name: "Siero partner kit", sku: "SR-KIT-01", stockHint: "Catalogo" }
    ]
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
    productsCount: 2,
    ordersValue: "€2.140",
    reliability: "95%",
    logoTone: "gold",
    logoInitials: "GS",
    linkedProducts: [
      { name: "Siero vitamina C", sku: "SR-VC-01", stockHint: "11 pz" },
      { name: "Siero acido ialuronico", sku: "SR-HA-02", stockHint: "Esaurito" }
    ]
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
    productsCount: 2,
    ordersValue: "€980",
    reliability: "92%",
    logoTone: "mint",
    logoInitials: "BR",
    linkedProducts: [
      { name: "Maschera argilla verde", sku: "MS-AR-01", stockHint: "14 pz" },
      { name: "Maschera tessuto HA", sku: "MS-TS-02", stockHint: "Scorta bassa" }
    ]
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
    productsCount: 2,
    ordersValue: "€1.560",
    reliability: "99%",
    logoTone: "rose",
    logoInitials: "SC",
    linkedProducts: [
      { name: "Guanti nitrile M", sku: "MN-GN-M", stockHint: "120 pz" },
      { name: "Lenzuolino monouso", sku: "MN-LZ-01", stockHint: "Scorta bassa" }
    ]
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
    productsCount: 2,
    ordersValue: "€760",
    reliability: "90%",
    logoTone: "lavender",
    logoInitials: "WP",
    linkedProducts: [
      { name: "Strisce depilatorie", sku: "CN-ST-01", stockHint: "Esaurito" },
      { name: "Cera professionale hot", sku: "CN-CW-01", stockHint: "7 pz" }
    ]
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
    productsCount: 1,
    ordersValue: "€180",
    reliability: "94%",
    logoTone: "lavender",
    logoInitials: "ST",
    linkedProducts: [
      { name: "Lampada LED magnifier", sku: "AT-LED-01", stockHint: "2 pz" }
    ]
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
    productsCount: 1,
    ordersValue: "€420",
    reliability: "88%",
    logoTone: "mint",
    logoInitials: "BF",
    linkedProducts: [
      { name: "Gel refill pressoterapia", sku: "CN-GL-01", stockHint: "Scorta bassa" }
    ]
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
    productsCount: 1,
    ordersValue: "€310",
    reliability: "96%",
    logoTone: "gold",
    logoInitials: "NO",
    linkedProducts: [
      { name: "Olio mandorle dolci", sku: "OL-MD-01", stockHint: "9 pz" }
    ]
  }
];

type StatusFilter = "tutti" | SupplierStatus;
type CategoryFilter = "tutti" | SupplierCategory;
type MethodFilter = "tutti" | ReorderMethod;

export default function SuppliersWorkspace() {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("tutti");
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("tutti");
  const [methodFilter, setMethodFilter] = useState<MethodFilter>("tutti");
  const [selectedId, setSelectedId] = useState(DEMO_SUPPLIERS[0].id);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return DEMO_SUPPLIERS.filter((s) => {
      if (statusFilter !== "tutti" && s.status !== statusFilter) return false;
      if (categoryFilter !== "tutti" && s.category !== categoryFilter) return false;
      if (methodFilter !== "tutti" && s.reorderMethod !== methodFilter) return false;
      if (!q) return true;
      return (
        s.name.toLowerCase().includes(q) ||
        s.contact.toLowerCase().includes(q) ||
        s.category.toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q)
      );
    });
  }, [query, statusFilter, categoryFilter, methodFilter]);

  const selected =
    filtered.find((s) => s.id === selectedId) ?? filtered[0] ?? DEMO_SUPPLIERS[0];

  const ReorderIcon = REORDER_META[selected.reorderMethod].icon;

  return (
    <div className="nb-suppliersWs" role="region" aria-label="Workspace Fornitori">
      {/* COLONNA 1 — lista */}
      <aside className="nb-spList">
        <div className="nb-spListToolbar">
          <div className="nb-spSearch">
            <Search className="nb-spSearchIcon" aria-hidden={true} />
            <input
              className="nb-spSearchInput"
              placeholder="Cerca fornitori…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Cerca fornitori"
            />
          </div>

          <div className="nb-spFilters">
            <label className="nb-spSelectWrap">
              <span className="nb-spSelectLabel">Stato</span>
              <select
                className="nb-spSelect"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
              >
                <option value="tutti">Tutti</option>
                <option value="attivo">Attivo</option>
                <option value="disattivo">Disattivo</option>
              </select>
            </label>
            <label className="nb-spSelectWrap">
              <span className="nb-spSelectLabel">Categoria</span>
              <select
                className="nb-spSelect"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value as CategoryFilter)}
              >
                <option value="tutti">Tutte</option>
                <option value="Dermocosmesi">Dermocosmesi</option>
                <option value="Consumabili">Consumabili</option>
                <option value="Attrezzature">Attrezzature</option>
                <option value="Cera & Depilazione">Cera & Depilazione</option>
                <option value="Monouso">Monouso</option>
              </select>
            </label>
            <label className="nb-spSelectWrap">
              <span className="nb-spSelectLabel">Riordino</span>
              <select
                className="nb-spSelect"
                value={methodFilter}
                onChange={(e) => setMethodFilter(e.target.value as MethodFilter)}
              >
                <option value="tutti">Tutti</option>
                <option value="sito">Sito Web</option>
                <option value="email">Email</option>
                <option value="whatsapp">WhatsApp</option>
                <option value="telefono">Telefono</option>
                <option value="manuale">Manuale</option>
              </select>
            </label>
          </div>

          <button type="button" className="nb-newBtn nb-spNew" disabled>
            <Plus className="nb-newBtnIcon" aria-hidden={true} />
            Nuovo fornitore
          </button>

          <div className="nb-spListMeta">
            <span>{filtered.length} fornitori</span>
            <span className="nb-spListMetaHint">Demo · senza sync</span>
          </div>
        </div>

        <ul className="nb-spCards" role="listbox" aria-label="Elenco fornitori">
          {filtered.map((supplier) => {
            const isSelected = supplier.id === selected.id;
            const MethodIcon = REORDER_META[supplier.reorderMethod].icon;
            return (
              <li key={supplier.id}>
                <button
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  className={clsx("nb-spCard", isSelected && "isSelected")}
                  onClick={() => setSelectedId(supplier.id)}
                >
                  <span
                    className={clsx("nb-spLogo", `tone-${supplier.logoTone}`)}
                    aria-hidden={true}
                  >
                    {supplier.logoInitials}
                  </span>
                  <span className="nb-spCardBody">
                    <span className="nb-spCardTop">
                      <span className="nb-spCardName">{supplier.name}</span>
                      <span
                        className={clsx(
                          "nb-spStatus",
                          supplier.status === "attivo" ? "isOn" : "isOff"
                        )}
                      >
                        {supplier.status === "attivo" ? "Attivo" : "Disattivo"}
                      </span>
                    </span>
                    <span className="nb-spCardMeta">
                      <span>{supplier.category}</span>
                      <span>Ultimo ordine · {supplier.lastOrder}</span>
                    </span>
                    <span className="nb-spCardFoot">
                      <span className="nb-spProductBadge">
                        {supplier.productsCount} prodotti
                      </span>
                      <span className="nb-spMethodChip">
                        <MethodIcon className="nb-spMethodIcon" aria-hidden={true} />
                        {REORDER_META[supplier.reorderMethod].label}
                      </span>
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
          {filtered.length === 0 ? (
            <li className="nb-spEmpty">Nessun fornitore con questi filtri.</li>
          ) : null}
        </ul>
      </aside>

      {/* COLONNA 2 — scheda */}
      <section className="nb-spDetail" aria-label={`Scheda ${selected.name}`}>
        <div className="nb-spDetailHead">
          <div className={clsx("nb-spDetailLogo", `tone-${selected.logoTone}`)} aria-hidden={true}>
            {selected.logoInitials}
          </div>
          <div className="nb-spDetailTitleBlock">
            <h2 className="nb-spDetailName">{selected.name}</h2>
            <div className="nb-spDetailBadges">
              <span className="nb-spCatPill">{selected.category}</span>
              <span
                className={clsx("nb-spStatus", selected.status === "attivo" ? "isOn" : "isOff")}
              >
                {selected.status === "attivo" ? "Attivo" : "Disattivo"}
              </span>
              <span className="nb-spMethodChip large">
                <ReorderIcon className="nb-spMethodIcon" aria-hidden={true} />
                Riordino · {REORDER_META[selected.reorderMethod].label}
              </span>
            </div>
          </div>
        </div>

        <div className="nb-spQuickActions" aria-label="Azioni rapide">
          <button type="button" className="nb-spQuick" disabled>
            <Globe className="nb-spQuickIcon" aria-hidden={true} />
            Apri sito
          </button>
          <button type="button" className="nb-spQuick" disabled>
            <ExternalLink className="nb-spQuickIcon" aria-hidden={true} />
            Apri catalogo
          </button>
          <button type="button" className="nb-spQuick" disabled>
            <Mail className="nb-spQuickIcon" aria-hidden={true} />
            Invia email
          </button>
          <button type="button" className="nb-spQuick" disabled>
            <MessageSquare className="nb-spQuickIcon" aria-hidden={true} />
            Apri WhatsApp
          </button>
          <button type="button" className="nb-spQuick" disabled>
            <Phone className="nb-spQuickIcon" aria-hidden={true} />
            Chiama
          </button>
        </div>

        <div className="nb-spDetailGrid">
          <Field label="Referente" value={selected.contact} />
          <Field label="Telefono" value={selected.phone} />
          <Field label="Email" value={selected.email} />
          <Field label="WhatsApp" value={selected.whatsapp} />
          <Field label="Sito Web" value={selected.website.replace("https://", "")} />
          <Field label="Link Catalogo" value="Catalogo B2B" />
          <Field label="Indirizzo" value={selected.address} />
          <Field label="Partita IVA" value={selected.vat} />
          <Field label="Tempi medi consegna" value={selected.avgDelivery} />
          <Field label="Ordine minimo" value={selected.minOrder} />
          <Field
            label="Metodo di riordino"
            value={REORDER_META[selected.reorderMethod].label}
          />
          <Field label="Ultimo ordine" value={selected.lastOrder} />
        </div>

        <div className="nb-spNotes">
          <div className="nb-spNotesHead">
            <FileText className="nb-spNotesIcon" aria-hidden={true} />
            Note
          </div>
          <p className="nb-spNotesBody">{selected.notes}</p>
        </div>

        <div className="nb-spLinkHint">
          <Truck className="nb-spLinkHintIcon" aria-hidden={true} />
          I prodotti Magazzino potranno essere collegati a questo fornitore (UI ready).
        </div>

        <div className="nb-spDetailActions">
          <button type="button" className="nb-spAction" disabled>
            <Pencil className="nb-spActionIcon" aria-hidden={true} />
            Modifica
          </button>
          <button type="button" className="nb-spAction warn" disabled>
            <EyeOff className="nb-spActionIcon" aria-hidden={true} />
            Disattiva
          </button>
          <button type="button" className="nb-spAction danger" disabled>
            <Trash2 className="nb-spActionIcon" aria-hidden={true} />
            Elimina
          </button>
        </div>
      </section>

      {/* COLONNA 3 — stats + prodotti */}
      <aside className="nb-spStats" aria-label="Statistiche fornitore">
        <div className="nb-spStatsHead">
          <h3 className="nb-spStatsTitle">Statistiche</h3>
          <span
            className={clsx("nb-spStatus", selected.status === "attivo" ? "isOn" : "isOff")}
          >
            {selected.status === "attivo" ? "Attivo" : "Disattivo"}
          </span>
        </div>

        <div className="nb-spStatGrid">
          <Stat label="Prodotti collegati" value={String(selected.productsCount)} />
          <Stat label="Ultimo ordine" value={selected.lastOrder} />
          <Stat label="Valore ordini" value={selected.ordersValue} strong />
          <Stat label="Tempo medio consegna" value={selected.avgDelivery} />
          <Stat label="Affidabilità" value={selected.reliability} accent />
          <Stat
            label="Metodo riordino"
            value={REORDER_META[selected.reorderMethod].label}
          />
        </div>

        <div className="nb-spLinked">
          <div className="nb-spLinkedHead">
            <div>
              <div className="nb-spLinkedTitle">Prodotti collegati</div>
              <div className="nb-spLinkedSub">Relazione Magazzino · demo</div>
            </div>
            <span className="nb-spProductBadge">{selected.linkedProducts.length}</span>
          </div>
          <ul className="nb-spLinkedList">
            {selected.linkedProducts.map((p) => (
              <li key={p.sku} className="nb-spLinkedItem">
                <div className="nb-spLinkedInfo">
                  <div className="nb-spLinkedName">{p.name}</div>
                  <div className="nb-spLinkedMeta">
                    {p.sku} · {p.stockHint}
                  </div>
                </div>
                <span className="nb-spLinkedTag">Magazzino</span>
              </li>
            ))}
          </ul>
        </div>

        <p className="nb-spStatsHint">Demo UI — pronto per collegamento al Core</p>
      </aside>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="nb-spField">
      <span className="nb-spFieldLabel">{label}</span>
      <span className="nb-spFieldValue">{value}</span>
    </div>
  );
}

function Stat({
  label,
  value,
  strong,
  accent
}: {
  label: string;
  value: string;
  strong?: boolean;
  accent?: boolean;
}) {
  return (
    <div className={clsx("nb-spStat", accent && "accent")}>
      <span className="nb-spStatLabel">{label}</span>
      <span className={clsx("nb-spStatValue", strong && "strong")}>{value}</span>
    </div>
  );
}
