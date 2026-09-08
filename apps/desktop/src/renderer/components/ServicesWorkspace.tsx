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
import { useEffect, useMemo, useState } from "react";
import { useDemoWorkflow, type WorkflowService } from "../demo/DemoWorkflowContext";
import type { ServiceSort } from "../../models/Service";
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

function asCategory(value: string): ServiceCategory {
  return (CATEGORIES.includes(value as ServiceCategory) ? value : "Viso") as ServiceCategory;
}

function asTone(value: string, category: ServiceCategory): CategoryTone {
  if (
    value === "primary" ||
    value === "mint" ||
    value === "gold" ||
    value === "lavender" ||
    value === "rose" ||
    value === "slate"
  ) {
    return value;
  }
  return CATEGORY_TONE[category];
}

function toDemoService(s: WorkflowService): DemoService {
  const category = asCategory(s.category);
  return {
    id: s.id,
    name: s.name,
    category,
    durationMin: s.durationMin,
    price: s.price,
    active: s.active,
    description: s.description,
    products: s.productList?.length ? s.productList : ["—"],
    operators: s.operators,
    lastEdited: s.lastEdited,
    tone: asTone(s.tone, category),
    soldCount: s.soldCount,
    cabin: s.cabin
  };
}

function sortKeyToRepo(sort: SortKey): ServiceSort {
  switch (sort) {
    case "prezzo":
      return "price_asc";
    case "durata":
      return "duration_asc";
    case "categoria":
      return "category_asc";
    default:
      return "name_asc";
  }
}

export default function ServicesWorkspace() {
  const {
    services: workflowServices,
    pushToast,
    createService,
    updateService,
    deleteService,
    duplicateService,
    reloadServices
  } = useDemoWorkflow();
  const services = useMemo(
    () => workflowServices.map(toDemoService),
    [workflowServices]
  );
  const [category, setCategory] = useState<"Tutti" | ServiceCategory>("Tutti");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortKey>("nome");
  const [durationFilter, setDurationFilter] = useState<DurationFilter>("tutti");
  const [priceFilter, setPriceFilter] = useState<PriceFilter>("tutti");
  const [operatorFilter, setOperatorFilter] = useState("tutti");
  const [activeFilter, setActiveFilter] = useState<ActiveFilter>("tutti");
  const [selectedId, setSelectedId] = useState("");
  const [wizardOpen, setWizardOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [confirmKind, setConfirmKind] = useState<ConfirmKind>(null);
  const [editDraft, setEditDraft] = useState({
    name: "",
    durationMin: 45,
    price: 50,
    description: ""
  });

  useEffect(() => {
    void reloadServices({ sort: sortKeyToRepo(sort) });
  }, [sort]); // eslint-disable-line react-hooks/exhaustive-deps -- sort only

  useEffect(() => {
    if (!selectedId && services[0]) setSelectedId(services[0].id);
  }, [services, selectedId]);

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

  const handleDuplicate = async (source: DemoService) => {
    const id = await duplicateService(source.id);
    if (id) setSelectedId(id);
  };

  const handleWizardCreate = async (result: ServiceWizardResult) => {
    const cat = asCategory(result.category);
    const products = result.products
      .split(",")
      .map((p) => p.trim())
      .filter(Boolean);
    const id = await createService({
      category: cat,
      name: result.name.trim(),
      durationMin: result.durationMin,
      price: result.price,
      products: products.join(", "),
      operators: result.operators.length ? result.operators : ["Fabio"],
      color: "#c45c6a",
      description: result.description.trim(),
      cabin: result.cabin
    });
    if (id) setSelectedId(id);
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

  const saveEdit = async () => {
    if (!selected) return;
    const ok = await updateService(selected.id, {
      name: editDraft.name.trim() || selected.name,
      durationMin: editDraft.durationMin,
      price: editDraft.price,
      description: editDraft.description.trim()
    });
    if (ok) setEditOpen(false);
  };

  const runConfirm = async () => {
    if (!selected || !confirmKind) return;
    if (confirmKind === "duplicate") {
      await handleDuplicate(selected);
    } else if (confirmKind === "toggle") {
      await updateService(selected.id, {
        name: selected.name,
        durationMin: selected.durationMin,
        price: selected.price,
        description: selected.description,
        active: !selected.active
      });
    } else if (confirmKind === "delete") {
      const removedId = selected.id;
      const ok = await deleteService(removedId);
      if (ok) {
        const next = services.find((s) => s.id !== removedId);
        setSelectedId(next?.id ?? "");
      }
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
              <button type="button" className="nb-newBtn" onClick={() => void saveEdit()}>
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
                onClick={() => void runConfirm()}
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
