import {
  ArrowDownAZ,
  Clock,
  Copy,
  Download,
  Euro,
  Eye,
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
import { useDemoWorkflow } from "../demo/DemoWorkflowContext";
import NewServiceWizard, { type ServiceWizardResult } from "./ui/NewServiceWizard";

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
  cabin?: string;
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

const INITIAL_SERVICES: DemoService[] = [
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
    soldCount: 48,
    cabin: "Cabina 1"
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

type ConfirmKind = "duplicate" | "toggle" | "delete" | null;

function formatPrice(n: number): string {
  return `€${n}`;
}

function formatDuration(min: number): string {
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m ? `${h}h ${m}m` : `${h}h`;
}

function todayLabel(): string {
  return "5 ago 2026";
}

function asCategory(value: string): ServiceCategory {
  return (CATEGORIES.includes(value as ServiceCategory) ? value : "Viso") as ServiceCategory;
}

export default function ServicesWorkspace() {
  const { pushToast, createService } = useDemoWorkflow();
  const [services, setServices] = useState(INITIAL_SERVICES);
  const [category, setCategory] = useState<"Tutti" | ServiceCategory>("Tutti");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortKey>("nome");
  const [durationFilter, setDurationFilter] = useState<DurationFilter>("tutti");
  const [priceFilter, setPriceFilter] = useState<PriceFilter>("tutti");
  const [operatorFilter, setOperatorFilter] = useState("tutti");
  const [activeFilter, setActiveFilter] = useState<ActiveFilter>("tutti");
  const [selectedId, setSelectedId] = useState(INITIAL_SERVICES[0].id);
  const [wizardOpen, setWizardOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [confirmKind, setConfirmKind] = useState<ConfirmKind>(null);
  const [editDraft, setEditDraft] = useState({
    name: "",
    durationMin: 45,
    price: 50,
    description: ""
  });

  const categoryCounts = useMemo(() => {
    const map: Record<string, number> = { Tutti: services.length };
    for (const c of CATEGORIES.slice(1)) {
      map[c] = services.filter((s) => s.category === c).length;
    }
    return map;
  }, [services]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = services.filter((s) => {
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
  }, [services, category, query, sort, durationFilter, priceFilter, operatorFilter, activeFilter]);

  const selected =
    services.find((s) => s.id === selectedId) ??
    filtered.find((s) => s.id === selectedId) ??
    filtered[0] ??
    services[0];

  const stats = useMemo(() => {
    if (services.length === 0) {
      return { active: 0, top: "—", avgDur: "—", avgPrice: "—" };
    }
    const active = services.filter((s) => s.active);
    const top = [...services].sort((a, b) => b.soldCount - a.soldCount)[0];
    const avgDur = Math.round(services.reduce((sum, s) => sum + s.durationMin, 0) / services.length);
    const avgPrice = Math.round(services.reduce((sum, s) => sum + s.price, 0) / services.length);
    return {
      active: active.length,
      top: top.name,
      avgDur: formatDuration(avgDur),
      avgPrice: formatPrice(avgPrice)
    };
  }, [services]);

  const duplicateService = (source: DemoService) => {
    const id = `s-${Date.now()}`;
    const copy: DemoService = {
      ...source,
      id,
      name: `${source.name} (copia)`,
      lastEdited: todayLabel(),
      soldCount: 0,
      active: true
    };
    setServices((prev) => [copy, ...prev]);
    setSelectedId(id);
    pushToast("Servizio duplicato");
  };

  const handleWizardCreate = (result: ServiceWizardResult) => {
    const cat = asCategory(result.category);
    const id = `s-${Date.now()}`;
    const products = result.products
      .split(",")
      .map((p) => p.trim())
      .filter(Boolean);
    const service: DemoService = {
      id,
      name: result.name.trim(),
      category: cat,
      durationMin: result.durationMin,
      price: result.price,
      active: true,
      description: result.description.trim() || "Descrizione demo.",
      products: products.length ? products : ["—"],
      operators: result.operators.length ? result.operators : ["Fabio"],
      lastEdited: todayLabel(),
      tone: CATEGORY_TONE[cat],
      soldCount: 0,
      cabin: result.cabin
    };
    setServices((prev) => [service, ...prev]);
    setSelectedId(id);
    createService({
      category: cat,
      name: service.name,
      durationMin: service.durationMin,
      price: service.price,
      products: products.join(", "),
      operators: service.operators,
      color: "#c45c6a"
    });
  };

  const openEdit = () => {
    if (!selected) return;
    setEditDraft({
      name: selected.name,
      durationMin: selected.durationMin,
      price: selected.price,
      description: selected.description
    });
    setEditOpen(true);
  };

  const saveEdit = () => {
    if (!selected) return;
    setServices((prev) =>
      prev.map((s) =>
        s.id === selected.id
          ? {
              ...s,
              name: editDraft.name.trim() || s.name,
              durationMin: editDraft.durationMin,
              price: editDraft.price,
              description: editDraft.description.trim(),
              lastEdited: todayLabel()
            }
          : s
      )
    );
    setEditOpen(false);
    pushToast("Servizio aggiornato");
  };

  const runConfirm = () => {
    if (!selected || !confirmKind) return;
    if (confirmKind === "duplicate") {
      duplicateService(selected);
    } else if (confirmKind === "toggle") {
      setServices((prev) =>
        prev.map((s) =>
          s.id === selected.id
            ? { ...s, active: !s.active, lastEdited: todayLabel() }
            : s
        )
      );
      pushToast(selected.active ? "Servizio disattivato" : "Servizio riattivato");
    } else if (confirmKind === "delete") {
      const removedId = selected.id;
      setServices((prev) => {
        const next = prev.filter((s) => s.id !== removedId);
        setSelectedId(next[0]?.id ?? "");
        return next;
      });
      pushToast("Servizio eliminato");
    }
    setConfirmKind(null);
  };

  if (!selected) {
    return (
      <div className="nb-servicesWs" role="region" aria-label="Workspace Servizi">
        <p className="nb-svEmpty">Nessun servizio nel catalogo.</p>
      </div>
    );
  }

  const confirmCopy =
    confirmKind === "duplicate"
      ? {
          title: "Duplicare questo servizio?",
          sub: `Verrà creata una copia di “${selected.name}”.`,
          confirm: "Duplica"
        }
      : confirmKind === "toggle"
        ? {
            title: selected.active ? "Disattivare il servizio?" : "Riattivare il servizio?",
            sub: selected.active
              ? `“${selected.name}” non sarà più prenotabile.`
              : `“${selected.name}” tornerà attivo nel listino.`,
            confirm: selected.active ? "Disattiva" : "Riattiva"
          }
        : confirmKind === "delete"
          ? {
              title: "Eliminare il servizio?",
              sub: `“${selected.name}” verrà rimosso dal catalogo demo.`,
              confirm: "Elimina"
            }
          : null;

  return (
    <div className="nb-servicesWs" role="region" aria-label="Workspace Servizi">
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
            <button
              type="button"
              className="nb-ghostBtn nb-svGhost"
              onClick={() => pushToast("Importa servizi · demo")}
            >
              <Upload className="nb-ghostBtnIcon" aria-hidden={true} />
              Importa
            </button>
            <button
              type="button"
              className="nb-ghostBtn nb-svGhost"
              onClick={() => pushToast(`Esporta · ${filtered.length} servizi demo`)}
            >
              <Download className="nb-ghostBtnIcon" aria-hidden={true} />
              Esporta
            </button>
            <button
              type="button"
              className="nb-ghostBtn nb-svGhost"
              onClick={() => setConfirmKind("duplicate")}
            >
              <Copy className="nb-ghostBtnIcon" aria-hidden={true} />
              Duplica
            </button>
            <button type="button" className="nb-newBtn nb-svNew" onClick={() => setWizardOpen(true)}>
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
          <button type="button" className="nb-svAction" onClick={openEdit}>
            <Pencil className="nb-svActionIcon" aria-hidden={true} />
            Modifica
          </button>
          <button type="button" className="nb-svAction" onClick={() => setConfirmKind("duplicate")}>
            <Copy className="nb-svActionIcon" aria-hidden={true} />
            Duplica
          </button>
          <button type="button" className="nb-svAction warn" onClick={() => setConfirmKind("toggle")}>
            {selected.active ? (
              <EyeOff className="nb-svActionIcon" aria-hidden={true} />
            ) : (
              <Eye className="nb-svActionIcon" aria-hidden={true} />
            )}
            {selected.active ? "Disattiva" : "Riattiva"}
          </button>
          <button type="button" className="nb-svAction danger" onClick={() => setConfirmKind("delete")}>
            <Trash2 className="nb-svActionIcon" aria-hidden={true} />
            Elimina
          </button>
        </div>

        <p className="nb-svDetailHint">Catalogo demo — azioni disponibili in questa schermata</p>
      </aside>

      <NewServiceWizard
        open={wizardOpen}
        onClose={() => setWizardOpen(false)}
        onCreate={handleWizardCreate}
      />

      {editOpen ? (
        <div className="nb-dialogRoot isOpen" role="presentation">
          <button
            type="button"
            className="nb-dialogBackdrop"
            aria-label="Annulla"
            onClick={() => setEditOpen(false)}
          />
          <div className="nb-dialogCard nb-svEditDialog" role="dialog" aria-modal="true" aria-label="Modifica servizio">
            <h2 className="nb-dialogTitle">Modifica servizio</h2>
            <p className="nb-dialogSub">{selected.name}</p>
            <label className="nb-drawerField">
              <span className="nb-drawerFieldLabel">Nome</span>
              <input
                className="nb-drawerInput"
                value={editDraft.name}
                onChange={(e) => setEditDraft((d) => ({ ...d, name: e.target.value }))}
              />
            </label>
            <div className="nb-drawerRow2">
              <label className="nb-drawerField">
                <span className="nb-drawerFieldLabel">Durata (min)</span>
                <input
                  className="nb-drawerInput"
                  type="number"
                  min={5}
                  value={editDraft.durationMin}
                  onChange={(e) =>
                    setEditDraft((d) => ({ ...d, durationMin: Number(e.target.value) || 0 }))
                  }
                />
              </label>
              <label className="nb-drawerField">
                <span className="nb-drawerFieldLabel">Prezzo (€)</span>
                <input
                  className="nb-drawerInput"
                  type="number"
                  min={0}
                  value={editDraft.price}
                  onChange={(e) =>
                    setEditDraft((d) => ({ ...d, price: Number(e.target.value) || 0 }))
                  }
                />
              </label>
            </div>
            <label className="nb-drawerField">
              <span className="nb-drawerFieldLabel">Descrizione</span>
              <textarea
                className="nb-drawerTextarea"
                rows={3}
                value={editDraft.description}
                onChange={(e) => setEditDraft((d) => ({ ...d, description: e.target.value }))}
              />
            </label>
            <div className="nb-dialogActions" style={{ marginTop: 14 }}>
              <button type="button" className="nb-ghostBtn" onClick={() => setEditOpen(false)}>
                Annulla
              </button>
              <button type="button" className="nb-newBtn" onClick={saveEdit}>
                Salva
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {confirmCopy ? (
        <div className="nb-dialogRoot isOpen" role="presentation">
          <button
            type="button"
            className="nb-dialogBackdrop"
            aria-label="Annulla"
            onClick={() => setConfirmKind(null)}
          />
          <div className="nb-dialogCard" role="dialog" aria-modal="true" aria-labelledby="nb-sv-confirm-title">
            <h2 className="nb-dialogTitle" id="nb-sv-confirm-title">
              {confirmCopy.title}
            </h2>
            <p className="nb-dialogSub">{confirmCopy.sub}</p>
            <div className="nb-dialogActions">
              <button type="button" className="nb-ghostBtn" onClick={() => setConfirmKind(null)}>
                Annulla
              </button>
              <button
                type="button"
                className={clsx("nb-newBtn", confirmKind === "delete" && "nb-svConfirmDanger")}
                onClick={runConfirm}
              >
                {confirmCopy.confirm}
              </button>
            </div>
          </div>
        </div>
      ) : null}
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
