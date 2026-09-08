import {
  ClipboardList,
  Eye,
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
import { useEffect, useMemo, useState, type ComponentType } from "react";
import {
  useDemoWorkflow,
  type SupplierReorderMethod,
  type SupplierStatus,
  type SupplierUpdateDraft
} from "../demo/DemoWorkflowContext";
import NewSupplierDrawer from "./ui/NewSupplierDrawer";

type StatusFilter = "tutti" | SupplierStatus;
type CategoryFilter = "tutti" | string;
type MethodFilter = "tutti" | SupplierReorderMethod;

const REORDER_META: Record<
  SupplierReorderMethod,
  { label: string; icon: ComponentType<{ className?: string; "aria-hidden"?: boolean }> }
> = {
  sito: { label: "Sito Web", icon: Globe },
  email: { label: "Email", icon: Mail },
  whatsapp: { label: "WhatsApp", icon: MessageSquare },
  telefono: { label: "Telefono", icon: Phone },
  manuale: { label: "Manuale", icon: ClipboardList }
};

const KNOWN_PRODUCT_CODES = new Set([
  "CR-VIS-01",
  "CR-COR-02",
  "SR-VC-01",
  "SR-HA-02",
  "MS-AR-01",
  "MS-TS-02",
  "OL-MD-01",
  "MN-GN-M",
  "MN-LZ-01",
  "AT-LED-01",
  "CN-ST-01",
  "CN-CW-01",
  "CN-GL-01",
  "CR-LN-03"
]);

function ensureHttp(url: string): string {
  const t = url.trim();
  if (!t) return "";
  if (/^https?:\/\//i.test(t)) return t;
  return `https://${t}`;
}

function waDigits(phone: string): string {
  return phone.replace(/\D/g, "");
}

export default function SuppliersWorkspace() {
  const {
    suppliers,
    pushToast,
    updateSupplier,
    toggleSupplierStatus,
    deleteSupplier,
    openInventoryProduct,
    supplierFocusKey,
    clearSupplierFocus
  } = useDemoWorkflow();

  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("tutti");
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("tutti");
  const [methodFilter, setMethodFilter] = useState<MethodFilter>("tutti");
  const [selectedId, setSelectedId] = useState(suppliers[0]?.id ?? "");
  const [newOpen, setNewOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editDraft, setEditDraft] = useState<SupplierUpdateDraft | null>(null);

  useEffect(() => {
    if (!supplierFocusKey) return;
    const key = supplierFocusKey.toLowerCase();
    const match =
      suppliers.find((s) => s.id === supplierFocusKey) ??
      suppliers.find((s) => s.name.toLowerCase() === key);
    if (match) {
      setSelectedId(match.id);
      setStatusFilter("tutti");
      setCategoryFilter("tutti");
      setMethodFilter("tutti");
      setQuery("");
    } else {
      pushToast("Fornitore non trovato");
    }
    clearSupplierFocus();
  }, [supplierFocusKey, suppliers, clearSupplierFocus, pushToast]);

  useEffect(() => {
    if (suppliers.length === 0) return;
    if (!suppliers.some((s) => s.id === selectedId)) {
      setSelectedId(suppliers[0].id);
    }
  }, [suppliers, selectedId]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return suppliers.filter((s) => {
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
  }, [suppliers, query, statusFilter, categoryFilter, methodFilter]);

  const selected =
    filtered.find((s) => s.id === selectedId) ??
    filtered[0] ??
    suppliers.find((s) => s.id === selectedId) ??
    suppliers[0];

  if (!selected) {
    return (
      <div className="nb-suppliersWs" role="region" aria-label="Workspace Fornitori">
        <div className="nb-spEmptyState">
          <p>Nessun fornitore. Creane uno per iniziare.</p>
          <button type="button" className="nb-newBtn" onClick={() => setNewOpen(true)}>
            <Plus className="nb-newBtnIcon" aria-hidden={true} />
            Nuovo fornitore
          </button>
        </div>
        <NewSupplierDrawer
          open={newOpen}
          onClose={() => setNewOpen(false)}
          onCreated={(id) => setSelectedId(id)}
          subtitle="Anagrafica completa · Fornitori"
        />
      </div>
    );
  }

  const ReorderIcon = REORDER_META[selected.reorderMethod].icon;

  const openUrl = (url: string, emptyMsg: string) => {
    const href = ensureHttp(url);
    if (!href) {
      pushToast(emptyMsg);
      return;
    }
    window.open(href, "_blank", "noopener,noreferrer");
  };

  const openEdit = () => {
    setEditDraft({
      name: selected.name,
      category: selected.category,
      contact: selected.contact === "—" ? "" : selected.contact,
      phone: selected.phone,
      email: selected.email,
      whatsapp: selected.whatsapp,
      website: selected.website,
      catalogUrl: selected.catalogUrl,
      address: selected.address === "—" ? "" : selected.address,
      vat: selected.vat === "—" ? "" : selected.vat,
      avgDelivery: selected.avgDelivery === "—" ? "" : selected.avgDelivery,
      minOrder: selected.minOrder === "—" ? "" : selected.minOrder,
      reorderMethod: selected.reorderMethod,
      notes: selected.notes,
      status: selected.status
    });
    setEditOpen(true);
  };

  const openLinkedProduct = (sku: string, name: string) => {
    if (!KNOWN_PRODUCT_CODES.has(sku)) {
      pushToast(`Prodotto non in Magazzino · ${name}`);
      return;
    }
    openInventoryProduct(sku);
  };

  return (
    <div className="nb-suppliersWs" role="region" aria-label="Workspace Fornitori">
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
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <option value="tutti">Tutte</option>
                <option value="Dermocosmesi">Dermocosmesi</option>
                <option value="Consumabili">Consumabili</option>
                <option value="Attrezzature">Attrezzature</option>
                <option value="Cera & Depilazione">Cera & Depilazione</option>
                <option value="Monouso">Monouso</option>
                <option value="Oli & Essenze">Oli & Essenze</option>
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

          <button type="button" className="nb-newBtn nb-spNew" onClick={() => setNewOpen(true)}>
            <Plus className="nb-newBtnIcon" aria-hidden={true} />
            Nuovo fornitore
          </button>

          <div className="nb-spListMeta">
            <span>{filtered.length} fornitori</span>
            <span className="nb-spListMetaHint">Collegato a Magazzino</span>
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
                      <span className="nb-spProductBadge">{supplier.productsCount} prodotti</span>
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
          <button
            type="button"
            className="nb-spQuick"
            onClick={() => openUrl(selected.website, "Nessun sito configurato")}
          >
            <Globe className="nb-spQuickIcon" aria-hidden={true} />
            Apri sito
          </button>
          <button
            type="button"
            className="nb-spQuick"
            onClick={() => openUrl(selected.catalogUrl, "Nessun catalogo configurato")}
          >
            <ExternalLink className="nb-spQuickIcon" aria-hidden={true} />
            Apri catalogo
          </button>
          <button
            type="button"
            className="nb-spQuick"
            onClick={() => {
              if (!selected.email.trim()) {
                pushToast("Nessuna email configurata");
                return;
              }
              window.open(`mailto:${selected.email}`, "_blank", "noopener,noreferrer");
            }}
          >
            <Mail className="nb-spQuickIcon" aria-hidden={true} />
            Invia email
          </button>
          <button
            type="button"
            className="nb-spQuick"
            onClick={() => {
              const digits = waDigits(selected.whatsapp);
              if (!digits) {
                pushToast("Nessun WhatsApp configurato");
                return;
              }
              window.open(`https://wa.me/${digits}`, "_blank", "noopener,noreferrer");
            }}
          >
            <MessageSquare className="nb-spQuickIcon" aria-hidden={true} />
            Apri WhatsApp
          </button>
          <button
            type="button"
            className="nb-spQuick"
            onClick={() => {
              if (!selected.phone.trim()) {
                pushToast("Nessun telefono configurato");
                return;
              }
              window.open(`tel:${selected.phone.replace(/\s+/g, "")}`, "_self");
            }}
          >
            <Phone className="nb-spQuickIcon" aria-hidden={true} />
            Chiama
          </button>
        </div>

        <div className="nb-spDetailGrid">
          <Field label="Referente" value={selected.contact} />
          <Field label="Telefono" value={selected.phone || "—"} />
          <Field label="Email" value={selected.email || "—"} />
          <Field label="WhatsApp" value={selected.whatsapp || "—"} />
          <Field
            label="Sito Web"
            value={selected.website ? selected.website.replace(/^https?:\/\//, "") : "—"}
          />
          <Field label="Link Catalogo" value={selected.catalogUrl ? "Catalogo B2B" : "—"} />
          <Field label="Indirizzo" value={selected.address} />
          <Field label="Partita IVA" value={selected.vat} />
          <Field label="Tempi medi consegna" value={selected.avgDelivery} />
          <Field label="Ordine minimo" value={selected.minOrder} />
          <Field label="Metodo di riordino" value={REORDER_META[selected.reorderMethod].label} />
          <Field label="Ultimo ordine" value={selected.lastOrder} />
        </div>

        <div className="nb-spNotes">
          <div className="nb-spNotesHead">
            <FileText className="nb-spNotesIcon" aria-hidden={true} />
            Note
          </div>
          <p className="nb-spNotesBody">{selected.notes || "Nessuna nota."}</p>
        </div>

        <div className="nb-spLinkHint">
          <Truck className="nb-spLinkHintIcon" aria-hidden={true} />
          Prodotti Magazzino collegati a questo fornitore · clicca un prodotto per aprirlo.
        </div>

        <div className="nb-spDetailActions">
          <button type="button" className="nb-spAction" onClick={openEdit}>
            <Pencil className="nb-spActionIcon" aria-hidden={true} />
            Modifica
          </button>
          <button
            type="button"
            className="nb-spAction warn"
            onClick={() => {
              void toggleSupplierStatus(selected.id);
            }}
          >
            {selected.status === "attivo" ? (
              <EyeOff className="nb-spActionIcon" aria-hidden={true} />
            ) : (
              <Eye className="nb-spActionIcon" aria-hidden={true} />
            )}
            {selected.status === "attivo" ? "Disattiva" : "Riattiva"}
          </button>
          <button type="button" className="nb-spAction danger" onClick={() => setDeleteOpen(true)}>
            <Trash2 className="nb-spActionIcon" aria-hidden={true} />
            Elimina
          </button>
        </div>
      </section>

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
          <Stat label="Metodo riordino" value={REORDER_META[selected.reorderMethod].label} />
        </div>

        <div className="nb-spLinked">
          <div className="nb-spLinkedHead">
            <div>
              <div className="nb-spLinkedTitle">Prodotti collegati</div>
              <div className="nb-spLinkedSub">Apri in Magazzino</div>
            </div>
            <span className="nb-spProductBadge">{selected.linkedProducts.length}</span>
          </div>
          <ul className="nb-spLinkedList">
            {selected.linkedProducts.map((p) => (
              <li key={p.sku}>
                <button
                  type="button"
                  className="nb-spLinkedItem"
                  onClick={() => openLinkedProduct(p.sku, p.name)}
                >
                  <div className="nb-spLinkedInfo">
                    <div className="nb-spLinkedName">{p.name}</div>
                    <div className="nb-spLinkedMeta">
                      {p.sku} · {p.stockHint}
                    </div>
                  </div>
                  <span className="nb-spLinkedTag">Magazzino</span>
                </button>
              </li>
            ))}
            {selected.linkedProducts.length === 0 ? (
              <li className="nb-spEmpty">Nessun prodotto collegato.</li>
            ) : null}
          </ul>
        </div>

        <p className="nb-spStatsHint">Fornitori pronti · collegamento Magazzino attivo</p>
      </aside>

      <NewSupplierDrawer
        open={newOpen}
        onClose={() => setNewOpen(false)}
        onCreated={(id) => setSelectedId(id)}
        subtitle="Anagrafica completa · Fornitori"
      />

      {editOpen && editDraft ? (
        <EditSupplierDialog
          draft={editDraft}
          onChange={setEditDraft}
          onClose={() => setEditOpen(false)}
          onSave={() => {
            if (!editDraft.name.trim()) {
              pushToast("Inserisci il nome fornitore");
              return;
            }
            void (async () => {
              const ok = await updateSupplier(selected.id, editDraft);
              if (ok) setEditOpen(false);
            })();
          }}
        />
      ) : null}

      {deleteOpen ? (
        <div className="nb-dialogRoot isOpen" role="presentation">
          <button
            type="button"
            className="nb-dialogBackdrop"
            aria-label="Annulla"
            onClick={() => setDeleteOpen(false)}
          />
          <div className="nb-dialogCard" role="dialog" aria-modal="true" aria-label="Elimina fornitore">
            <h2 className="nb-dialogTitle">Eliminare il fornitore?</h2>
            <p className="nb-dialogSub">
              “{selected.name}” verrà rimosso dall&apos;anagrafica. I prodotti Magazzino restano.
            </p>
            <div className="nb-dialogActions">
              <button type="button" className="nb-ghostBtn" onClick={() => setDeleteOpen(false)}>
                Annulla
              </button>
              <button
                type="button"
                className="nb-newBtn nb-ivConfirmDanger"
                onClick={() => {
                  const id = selected.id;
                  void (async () => {
                    const ok = await deleteSupplier(id);
                    if (ok) setDeleteOpen(false);
                  })();
                }}
              >
                Elimina
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function EditSupplierDialog({
  draft,
  onChange,
  onClose,
  onSave
}: {
  draft: SupplierUpdateDraft;
  onChange: (d: SupplierUpdateDraft) => void;
  onClose: () => void;
  onSave: () => void;
}) {
  return (
    <div className="nb-dialogRoot isOpen" role="presentation">
      <button type="button" className="nb-dialogBackdrop" aria-label="Chiudi" onClick={onClose} />
      <div
        className="nb-dialogCard nb-spEditDialog"
        role="dialog"
        aria-modal="true"
        aria-label="Modifica fornitore"
      >
        <h2 className="nb-dialogTitle">Modifica fornitore</h2>
        <p className="nb-dialogSub">Aggiorna anagrafica</p>
        <div className="nb-spEditForm">
          <label className="nb-drawerField">
            <span className="nb-drawerFieldLabel">Nome</span>
            <input
              className="nb-drawerInput"
              value={draft.name}
              onChange={(e) => onChange({ ...draft, name: e.target.value })}
            />
          </label>
          <label className="nb-drawerField">
            <span className="nb-drawerFieldLabel">Categoria</span>
            <input
              className="nb-drawerInput"
              value={draft.category}
              onChange={(e) => onChange({ ...draft, category: e.target.value })}
            />
          </label>
          <label className="nb-drawerField">
            <span className="nb-drawerFieldLabel">Referente</span>
            <input
              className="nb-drawerInput"
              value={draft.contact}
              onChange={(e) => onChange({ ...draft, contact: e.target.value })}
            />
          </label>
          <div className="nb-drawerRow2">
            <label className="nb-drawerField">
              <span className="nb-drawerFieldLabel">Telefono</span>
              <input
                className="nb-drawerInput"
                value={draft.phone}
                onChange={(e) => onChange({ ...draft, phone: e.target.value })}
              />
            </label>
            <label className="nb-drawerField">
              <span className="nb-drawerFieldLabel">WhatsApp</span>
              <input
                className="nb-drawerInput"
                value={draft.whatsapp ?? ""}
                onChange={(e) => onChange({ ...draft, whatsapp: e.target.value })}
              />
            </label>
          </div>
          <label className="nb-drawerField">
            <span className="nb-drawerFieldLabel">Email</span>
            <input
              className="nb-drawerInput"
              value={draft.email}
              onChange={(e) => onChange({ ...draft, email: e.target.value })}
            />
          </label>
          <label className="nb-drawerField">
            <span className="nb-drawerFieldLabel">Sito Web</span>
            <input
              className="nb-drawerInput"
              value={draft.website ?? ""}
              onChange={(e) => onChange({ ...draft, website: e.target.value })}
            />
          </label>
          <label className="nb-drawerField">
            <span className="nb-drawerFieldLabel">Catalogo</span>
            <input
              className="nb-drawerInput"
              value={draft.catalogUrl ?? ""}
              onChange={(e) => onChange({ ...draft, catalogUrl: e.target.value })}
            />
          </label>
          <label className="nb-drawerField">
            <span className="nb-drawerFieldLabel">Note</span>
            <textarea
              className="nb-drawerTextarea"
              rows={3}
              value={draft.notes}
              onChange={(e) => onChange({ ...draft, notes: e.target.value })}
            />
          </label>
        </div>
        <div className="nb-dialogActions">
          <button type="button" className="nb-ghostBtn" onClick={onClose}>
            Annulla
          </button>
          <button type="button" className="nb-newBtn" onClick={onSave}>
            Salva
          </button>
        </div>
      </div>
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
