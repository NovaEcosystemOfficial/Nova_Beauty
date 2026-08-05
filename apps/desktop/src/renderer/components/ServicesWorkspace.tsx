import {
  ArrowDownAZ,
  Clock,
  Copy,
  Download,
  Euro,
  EyeOff,
  Pencil,
  Plus,
  Scissors,
  Search,
  Sparkles,
  Trash2,
  Upload
} from "lucide-react";
import clsx from "clsx";
import { useMemo, useState } from "react";

type ServiceCategory =
  | "Viso"
  | "Corpo"
  | "Massaggi"
  | "Mani"
  | "Piedi"
  | "Epilazione"
  | "Extension ciglia"
  | "Trucco"
  | "Pacchetti";

type CategoryTone = "primary" | "mint" | "gold" | "lavender" | "rose" | "slate";

type DemoService = {
  id: string;
  name: string;
  category: ServiceCategory;
  durationMin: number;
  price: number;
  active: boolean;
  description: string;
  products: string[];
  operators: string[];
  lastEdited: string;
  tone: CategoryTone;
  soldCount: number;
};

const CATEGORIES: Array<"Tutti" | ServiceCategory> = [
  "Tutti",
  "Viso",
  "Corpo",
  "Massaggi",
  "Mani",
  "Piedi",
  "Epilazione",
  "Extension ciglia",
  "Trucco",
  "Pacchetti"
];

const CATEGORY_TONE: Record<ServiceCategory, CategoryTone> = {
  Viso: "primary",
  Corpo: "mint",
  Massaggi: "lavender",
  Mani: "rose",
  Piedi: "gold",
  Epilazione: "slate",
  "Extension ciglia": "lavender",
  Trucco: "rose",
  Pacchetti: "gold"
};

const DEMO_SERVICES: DemoService[] = [
  {
    id: "s1",
    name: "Pulizia viso deep",
    category: "Viso",
    durationMin: 60,
    price: 65,
    active: true,
    description: "Pulizia profonda con estrazione, maschera e idratazione finale.",
    products: ["Cleanser enzyme", "Maschera argilla", "Siero idratante"],
    operators: ["Fabio", "Laura"],
    lastEdited: "2 ago 2026",
    tone: "primary",
    soldCount: 48
  },
  {
    id: "s2",
    name: "Peeling enzimatico",
    category: "Viso",
    durationMin: 45,
    price: 80,
    active: true,
    description: "Peeling delicato per luminosità e texture più uniforme.",
    products: ["Peeling enzyme bio", "Crema lenitiva"],
    operators: ["Fabio"],
    lastEdited: "28 lug 2026",
    tone: "primary",
    soldCount: 31
  },
  {
    id: "s3",
    name: "Massaggio rilassante",
    category: "Massaggi",
    durationMin: 60,
    price: 55,
    active: true,
    description: "Massaggio corpo a olio caldo, focus schiena e spalle.",
    products: ["Olio mandorle", "Candela massaggio"],
    operators: ["Laura", "Fabio"],
    lastEdited: "30 lug 2026",
    tone: "lavender",
    soldCount: 62
  },
  {
    id: "s4",
    name: "Pressoterapia",
    category: "Corpo",
    durationMin: 45,
    price: 45,
    active: true,
    description: "Trattamento drenante con tuta pressoterapica.",
    products: ["Gel drenante"],
    operators: ["Laura"],
    lastEdited: "25 lug 2026",
    tone: "mint",
    soldCount: 27
  },
  {
    id: "s5",
    name: "Manicure spa",
    category: "Mani",
    durationMin: 40,
    price: 35,
    active: true,
    description: "Cura mani completa con scrub, maschera e smalto classico.",
    products: ["Scrub mani", "Base coat", "Smalto"],
    operators: ["Laura"],
    lastEdited: "20 lug 2026",
    tone: "rose",
    soldCount: 41
  },
  {
    id: "s6",
    name: "Pedicure estetico",
    category: "Piedi",
    durationMin: 50,
    price: 42,
    active: true,
    description: "Cura piedi con callosità leggere e finitura smalto.",
    products: ["Crema piedi", "Smalto"],
    operators: ["Laura"],
    lastEdited: "18 lug 2026",
    tone: "gold",
    soldCount: 22
  },
  {
    id: "s7",
    name: "Epilazione gambe",
    category: "Epilazione",
    durationMin: 45,
    price: 40,
    active: true,
    description: "Epilazione completa gambe con cera a caldo.",
    products: ["Cera professionale", "Olio post"],
    operators: ["Laura", "Fabio"],
    lastEdited: "22 lug 2026",
    tone: "slate",
    soldCount: 55
  },
  {
    id: "s8",
    name: "Extension ciglia classiche",
    category: "Extension ciglia",
    durationMin: 90,
    price: 95,
    active: true,
    description: "Applicazione one-by-one per volume naturale.",
    products: ["Ciglia 0.15", "Colla hypo"],
    operators: ["Fabio"],
    lastEdited: "1 ago 2026",
    tone: "lavender",
    soldCount: 19
  },
  {
    id: "s9",
    name: "Trucco evento",
    category: "Trucco",
    durationMin: 50,
    price: 70,
    active: false,
    description: "Make-up completo per eventi — temporaneamente non in listino.",
    products: ["Primer", "Fondotinta", "Palette occhi"],
    operators: ["Fabio"],
    lastEdited: "10 giu 2026",
    tone: "rose",
    soldCount: 8
  },
  {
    id: "s10",
    name: "Pacchetto Viso Glow ×5",
    category: "Pacchetti",
    durationMin: 60,
    price: 280,
    active: true,
    description: "5 sedute pulizia + peeling a prezzo dedicato.",
    products: ["Kit viso studio"],
    operators: ["Fabio", "Laura"],
    lastEdited: "3 ago 2026",
    tone: "gold",
    soldCount: 14
  },
  {
    id: "s11",
    name: "Idratazione intensiva",
    category: "Viso",
    durationMin: 50,
    price: 55,
    active: true,
    description: "Trattamento idratante con ampolle e maschera tessuto.",
    products: ["Ampolla HA", "Maschera tessuto"],
    operators: ["Fabio", "Laura"],
    lastEdited: "29 lug 2026",
    tone: "primary",
    soldCount: 36
  },
  {
    id: "s12",
    name: "Massaggio linfodrenante",
    category: "Massaggi",
    durationMin: 50,
    price: 60,
    active: true,
    description: "Manovre drenanti per gambe e addome.",
    products: ["Crema drenante"],
    operators: ["Laura"],
    lastEdited: "27 lug 2026",
    tone: "lavender",
    soldCount: 24
  }
];

type SortKey = "nome" | "prezzo" | "durata" | "categoria";
type DurationFilter = "tutti" | "breve" | "media" | "lunga";
type PriceFilter = "tutti" | "low" | "mid" | "high";
type ActiveFilter = "tutti" | "attivo" | "disattivo";

function formatPrice(n: number): string {
  return `€${n}`;
}

function formatDuration(min: number): string {
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m ? `${h}h ${m}m` : `${h}h`;
}

export default function ServicesWorkspace() {
  const [category, setCategory] = useState<"Tutti" | ServiceCategory>("Tutti");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortKey>("nome");
  const [durationFilter, setDurationFilter] = useState<DurationFilter>("tutti");
  const [priceFilter, setPriceFilter] = useState<PriceFilter>("tutti");
  const [operatorFilter, setOperatorFilter] = useState("tutti");
  const [activeFilter, setActiveFilter] = useState<ActiveFilter>("tutti");
  const [selectedId, setSelectedId] = useState(DEMO_SERVICES[0].id);

  const categoryCounts = useMemo(() => {
    const map: Record<string, number> = { Tutti: DEMO_SERVICES.length };
    for (const c of CATEGORIES.slice(1)) {
      map[c] = DEMO_SERVICES.filter((s) => s.category === c).length;
    }
    return map;
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = DEMO_SERVICES.filter((s) => {
      if (category !== "Tutti" && s.category !== category) return false;
      if (activeFilter === "attivo" && !s.active) return false;
      if (activeFilter === "disattivo" && s.active) return false;
      if (operatorFilter !== "tutti" && !s.operators.includes(operatorFilter)) return false;
      if (durationFilter === "breve" && s.durationMin > 40) return false;
      if (durationFilter === "media" && (s.durationMin <= 40 || s.durationMin > 60)) return false;
      if (durationFilter === "lunga" && s.durationMin <= 60) return false;
      if (priceFilter === "low" && s.price >= 50) return false;
      if (priceFilter === "mid" && (s.price < 50 || s.price > 80)) return false;
      if (priceFilter === "high" && s.price <= 80) return false;
      if (!q) return true;
      return (
        s.name.toLowerCase().includes(q) ||
        s.category.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q)
      );
    });

    list = [...list].sort((a, b) => {
      switch (sort) {
        case "prezzo":
          return a.price - b.price;
        case "durata":
          return a.durationMin - b.durationMin;
        case "categoria":
          return a.category.localeCompare(b.category, "it");
        default:
          return a.name.localeCompare(b.name, "it");
      }
    });

    return list;
  }, [category, query, sort, durationFilter, priceFilter, operatorFilter, activeFilter]);

  const selected = filtered.find((s) => s.id === selectedId) ?? filtered[0] ?? DEMO_SERVICES[0];

  const stats = useMemo(() => {
    const active = DEMO_SERVICES.filter((s) => s.active);
    const top = [...DEMO_SERVICES].sort((a, b) => b.soldCount - a.soldCount)[0];
    const avgDur = Math.round(
      DEMO_SERVICES.reduce((sum, s) => sum + s.durationMin, 0) / DEMO_SERVICES.length
    );
    const avgPrice = Math.round(
      DEMO_SERVICES.reduce((sum, s) => sum + s.price, 0) / DEMO_SERVICES.length
    );
    return {
      active: active.length,
      top: top.name,
      avgDur: formatDuration(avgDur),
      avgPrice: formatPrice(avgPrice)
    };
  }, []);

  return (
    <div className="nb-servicesWs" role="region" aria-label="Workspace Servizi">
      {/* SINISTRA — categorie */}
      <aside className="nb-svCats">
        <div className="nb-svCatsHead">
          <Scissors className="nb-svCatsIcon" aria-hidden={true} />
          <div>
            <div className="nb-svCatsTitle">Categorie</div>
            <div className="nb-svCatsSub">Catalogo studio · demo</div>
          </div>
        </div>
        <nav className="nb-svCatList" aria-label="Categorie servizi">
          {CATEGORIES.map((cat) => {
            const isActive = category === cat;
            const tone = cat === "Tutti" ? "primary" : CATEGORY_TONE[cat];
            return (
              <button
                key={cat}
                type="button"
                className={clsx("nb-svCatItem", isActive && "isActive", `tone-${tone}`)}
                onClick={() => setCategory(cat)}
              >
                <span className={clsx("nb-svCatDot", `tone-${tone}`)} aria-hidden={true} />
                <span className="nb-svCatLabel">{cat}</span>
                <span className="nb-svCatCount">{categoryCounts[cat] ?? 0}</span>
              </button>
            );
          })}
        </nav>
      </aside>

      {/* CENTRO — lista */}
      <section className="nb-svMain">
        <div className="nb-svToolbar">
          <div className="nb-svSearch">
            <Search className="nb-svSearchIcon" aria-hidden={true} />
            <input
              className="nb-svSearchInput"
              placeholder="Cerca servizi…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Cerca servizi"
            />
          </div>

          <div className="nb-svFilters">
            <label className="nb-svSelectWrap">
              <span className="nb-svSelectLabel">Durata</span>
              <select
                className="nb-svSelect"
                value={durationFilter}
                onChange={(e) => setDurationFilter(e.target.value as DurationFilter)}
              >
                <option value="tutti">Tutte</option>
                <option value="breve">≤ 40 min</option>
                <option value="media">41–60 min</option>
                <option value="lunga">&gt; 60 min</option>
              </select>
            </label>
            <label className="nb-svSelectWrap">
              <span className="nb-svSelectLabel">Prezzo</span>
              <select
                className="nb-svSelect"
                value={priceFilter}
                onChange={(e) => setPriceFilter(e.target.value as PriceFilter)}
              >
                <option value="tutti">Tutti</option>
                <option value="low">&lt; €50</option>
                <option value="mid">€50–80</option>
                <option value="high">&gt; €80</option>
              </select>
            </label>
            <label className="nb-svSelectWrap">
              <span className="nb-svSelectLabel">Operatore</span>
              <select
                className="nb-svSelect"
                value={operatorFilter}
                onChange={(e) => setOperatorFilter(e.target.value)}
              >
                <option value="tutti">Tutti</option>
                <option value="Fabio">Fabio</option>
                <option value="Laura">Laura</option>
              </select>
            </label>
            <label className="nb-svSelectWrap">
              <span className="nb-svSelectLabel">Stato</span>
              <select
                className="nb-svSelect"
                value={activeFilter}
                onChange={(e) => setActiveFilter(e.target.value as ActiveFilter)}
              >
                <option value="tutti">Tutti</option>
                <option value="attivo">Attivo</option>
                <option value="disattivo">Disattivato</option>
              </select>
            </label>
            <label className="nb-svSelectWrap">
              <span className="nb-svSelectLabel">
                <ArrowDownAZ className="nb-svSortIcon" aria-hidden={true} />
                Ordina
              </span>
              <select
                className="nb-svSelect"
                value={sort}
                onChange={(e) => setSort(e.target.value as SortKey)}
              >
                <option value="nome">Nome</option>
                <option value="prezzo">Prezzo</option>
                <option value="durata">Durata</option>
                <option value="categoria">Categoria</option>
              </select>
            </label>
          </div>

          <div className="nb-svQuickActions">
            <button type="button" className="nb-ghostBtn nb-svGhost" disabled>
              <Upload className="nb-ghostBtnIcon" aria-hidden={true} />
              Importa
            </button>
            <button type="button" className="nb-ghostBtn nb-svGhost" disabled>
              <Download className="nb-ghostBtnIcon" aria-hidden={true} />
              Esporta
            </button>
            <button type="button" className="nb-ghostBtn nb-svGhost" disabled>
              <Copy className="nb-ghostBtnIcon" aria-hidden={true} />
              Duplica
            </button>
            <button type="button" className="nb-newBtn nb-svNew" disabled>
              <Plus className="nb-newBtnIcon" aria-hidden={true} />
              Nuovo servizio
            </button>
          </div>
        </div>

        <div className="nb-svListMeta">
          <span>
            {filtered.length} servizi
            {category !== "Tutti" ? ` · ${category}` : ""}
          </span>
          <span className="nb-svListMetaHint">Ricerca istantanea · demo</span>
        </div>

        <ul className="nb-svList" role="listbox" aria-label="Elenco servizi">
          {filtered.map((service) => {
            const isSelected = service.id === selected.id;
            return (
              <li key={service.id}>
                <button
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  className={clsx("nb-svCard", isSelected && "isSelected", !service.active && "isOff")}
                  onClick={() => setSelectedId(service.id)}
                >
                  <span className={clsx("nb-svCardAccent", `tone-${service.tone}`)} aria-hidden={true} />
                  <span className="nb-svCardBody">
                    <span className="nb-svCardTop">
                      <span className="nb-svCardName">{service.name}</span>
                      <span className={clsx("nb-svStatus", service.active ? "isOn" : "isOff")}>
                        {service.active ? "Attivo" : "Disattivato"}
                      </span>
                    </span>
                    <span className="nb-svCardMeta">
                      <span className={clsx("nb-svCatBadge", `tone-${service.tone}`)}>
                        {service.category}
                      </span>
                      <span className="nb-svMetaItem">
                        <Clock className="nb-svMetaIcon" aria-hidden={true} />
                        {formatDuration(service.durationMin)}
                      </span>
                      <span className="nb-svMetaItem strong">
                        <Euro className="nb-svMetaIcon" aria-hidden={true} />
                        {formatPrice(service.price)}
                      </span>
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
          {filtered.length === 0 ? (
            <li className="nb-svEmpty">Nessun servizio con questi filtri.</li>
          ) : null}
        </ul>

        <div className="nb-svStats" aria-label="Statistiche catalogo">
          <StatCard label="Servizi attivi" value={String(stats.active)} />
          <StatCard label="Più venduto" value={stats.top} compact />
          <StatCard label="Durata media" value={stats.avgDur} />
          <StatCard label="Prezzo medio" value={stats.avgPrice} />
        </div>
      </section>

      {/* DESTRA — dettaglio */}
      <aside className="nb-svDetail" aria-label={`Dettaglio ${selected.name}`}>
        <div className="nb-svDetailHead">
          <div className={clsx("nb-svDetailIcon", `tone-${selected.tone}`)} aria-hidden={true}>
            <Sparkles className="nb-svDetailIconSvg" />
          </div>
          <div className="nb-svDetailTitleBlock">
            <h2 className="nb-svDetailName">{selected.name}</h2>
            <div className="nb-svDetailBadges">
              <span className={clsx("nb-svCatBadge", `tone-${selected.tone}`)}>
                {selected.category}
              </span>
              <span className={clsx("nb-svStatus", selected.active ? "isOn" : "isOff")}>
                {selected.active ? "Attivo" : "Disattivato"}
              </span>
            </div>
          </div>
        </div>

        <div className="nb-svDetailGrid">
          <Field label="Durata" value={formatDuration(selected.durationMin)} />
          <Field label="Prezzo" value={formatPrice(selected.price)} strong />
          <Field label="Ultima modifica" value={selected.lastEdited} />
          <Field label="Vendite demo" value={`${selected.soldCount}`} />
        </div>

        <div className="nb-svBlock">
          <div className="nb-svBlockLabel">Descrizione</div>
          <p className="nb-svBlockText">{selected.description}</p>
        </div>

        <div className="nb-svBlock">
          <div className="nb-svBlockLabel">Prodotti utilizzati</div>
          <div className="nb-svChips">
            {selected.products.map((p) => (
              <span key={p} className="nb-svChip">
                {p}
              </span>
            ))}
          </div>
        </div>

        <div className="nb-svBlock">
          <div className="nb-svBlockLabel">Operatori abilitati</div>
          <div className="nb-svChips">
            {selected.operators.map((op) => (
              <span key={op} className="nb-svChip op">
                {op}
              </span>
            ))}
          </div>
        </div>

        <div className="nb-svDetailActions">
          <button type="button" className="nb-svAction" disabled>
            <Pencil className="nb-svActionIcon" aria-hidden={true} />
            Modifica
          </button>
          <button type="button" className="nb-svAction" disabled>
            <Copy className="nb-svActionIcon" aria-hidden={true} />
            Duplica
          </button>
          <button type="button" className="nb-svAction warn" disabled>
            <EyeOff className="nb-svActionIcon" aria-hidden={true} />
            Disattiva
          </button>
          <button type="button" className="nb-svAction danger" disabled>
            <Trash2 className="nb-svActionIcon" aria-hidden={true} />
            Elimina
          </button>
        </div>

        <p className="nb-svDetailHint">Demo UI — pronto per collegamento al Core</p>
      </aside>
    </div>
  );
}

function Field({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="nb-svField">
      <span className="nb-svFieldLabel">{label}</span>
      <span className={clsx("nb-svFieldValue", strong && "strong")}>{value}</span>
    </div>
  );
}

function StatCard({ label, value, compact }: { label: string; value: string; compact?: boolean }) {
  return (
    <div className="nb-svStat">
      <span className="nb-svStatLabel">{label}</span>
      <span className={clsx("nb-svStatValue", compact && "compact")}>{value}</span>
    </div>
  );
}
