import { useEffect, useState, type ReactNode } from "react";
import {
  useDemoWorkflow,
  type NewSupplierDraft,
  type SupplierReorderMethod
} from "../../demo/DemoWorkflowContext";
import RightDrawer from "./RightDrawer";

const CATEGORIES = [
  "Dermocosmesi",
  "Consumabili",
  "Attrezzature",
  "Cera & Depilazione",
  "Monouso",
  "Oli & Essenze"
];

const REORDER_METHODS: Array<{ value: SupplierReorderMethod; label: string }> = [
  { value: "sito", label: "Sito Web" },
  { value: "email", label: "Email" },
  { value: "whatsapp", label: "WhatsApp" },
  { value: "telefono", label: "Telefono" },
  { value: "manuale", label: "Manuale" }
];

type NewSupplierDrawerProps = {
  open: boolean;
  onClose: () => void;
  onCreated: (supplierId: string) => void;
  layer?: number;
  subtitle?: string;
};

const EMPTY: NewSupplierDraft = {
  name: "",
  category: CATEGORIES[0],
  contact: "",
  phone: "",
  email: "",
  whatsapp: "",
  website: "",
  catalogUrl: "",
  address: "",
  vat: "",
  avgDelivery: "",
  minOrder: "",
  reorderMethod: "email",
  notes: ""
};

export default function NewSupplierDrawer({
  open,
  onClose,
  onCreated,
  layer = 2,
  subtitle = "Anagrafica completa · demo"
}: NewSupplierDrawerProps) {
  const { createSupplier } = useDemoWorkflow();
  const [draft, setDraft] = useState(EMPTY);

  useEffect(() => {
    if (open) setDraft(EMPTY);
  }, [open]);

  const canSave = draft.name.trim().length > 0;

  return (
    <RightDrawer open={open} title="Nuovo Fornitore" subtitle={subtitle} onClose={onClose} layer={layer}>
      <form
        className="nb-drawerForm"
        onSubmit={(e) => {
          e.preventDefault();
          if (!canSave) return;
          const id = createSupplier(draft);
          onCreated(id);
          onClose();
        }}
      >
        <Field label="Nome *">
          <input
            className="nb-drawerInput"
            value={draft.name}
            onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
            placeholder="Ragione sociale"
            required
          />
        </Field>

        <Field label="Categoria">
          <select
            className="nb-drawerSelect"
            value={draft.category}
            onChange={(e) => setDraft((d) => ({ ...d, category: e.target.value }))}
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Referente">
          <input
            className="nb-drawerInput"
            value={draft.contact}
            onChange={(e) => setDraft((d) => ({ ...d, contact: e.target.value }))}
            placeholder="Nome contatto"
          />
        </Field>

        <div className="nb-drawerRow2">
          <Field label="Telefono">
            <input
              className="nb-drawerInput"
              value={draft.phone}
              onChange={(e) => setDraft((d) => ({ ...d, phone: e.target.value }))}
              placeholder="+39 …"
            />
          </Field>
          <Field label="WhatsApp">
            <input
              className="nb-drawerInput"
              value={draft.whatsapp ?? ""}
              onChange={(e) => setDraft((d) => ({ ...d, whatsapp: e.target.value }))}
              placeholder="+39 …"
            />
          </Field>
        </div>

        <Field label="Email">
          <input
            className="nb-drawerInput"
            type="email"
            value={draft.email}
            onChange={(e) => setDraft((d) => ({ ...d, email: e.target.value }))}
            placeholder="ordini@…"
          />
        </Field>

        <Field label="Sito Web">
          <input
            className="nb-drawerInput"
            value={draft.website ?? ""}
            onChange={(e) => setDraft((d) => ({ ...d, website: e.target.value }))}
            placeholder="https://…"
          />
        </Field>

        <Field label="Link catalogo">
          <input
            className="nb-drawerInput"
            value={draft.catalogUrl ?? ""}
            onChange={(e) => setDraft((d) => ({ ...d, catalogUrl: e.target.value }))}
            placeholder="https://…/catalogo"
          />
        </Field>

        <Field label="Indirizzo">
          <input
            className="nb-drawerInput"
            value={draft.address ?? ""}
            onChange={(e) => setDraft((d) => ({ ...d, address: e.target.value }))}
            placeholder="Via, città"
          />
        </Field>

        <div className="nb-drawerRow2">
          <Field label="Partita IVA">
            <input
              className="nb-drawerInput"
              value={draft.vat ?? ""}
              onChange={(e) => setDraft((d) => ({ ...d, vat: e.target.value }))}
              placeholder="IT…"
            />
          </Field>
          <Field label="Metodo riordino">
            <select
              className="nb-drawerSelect"
              value={draft.reorderMethod ?? "email"}
              onChange={(e) =>
                setDraft((d) => ({
                  ...d,
                  reorderMethod: e.target.value as SupplierReorderMethod
                }))
              }
            >
              {REORDER_METHODS.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <div className="nb-drawerRow2">
          <Field label="Tempi medi consegna">
            <input
              className="nb-drawerInput"
              value={draft.avgDelivery ?? ""}
              onChange={(e) => setDraft((d) => ({ ...d, avgDelivery: e.target.value }))}
              placeholder="3–4 giorni"
            />
          </Field>
          <Field label="Ordine minimo">
            <input
              className="nb-drawerInput"
              value={draft.minOrder ?? ""}
              onChange={(e) => setDraft((d) => ({ ...d, minOrder: e.target.value }))}
              placeholder="€100"
            />
          </Field>
        </div>

        <Field label="Note">
          <textarea
            className="nb-drawerTextarea"
            rows={3}
            value={draft.notes}
            onChange={(e) => setDraft((d) => ({ ...d, notes: e.target.value }))}
            placeholder="Condizioni, minimi ordine…"
          />
        </Field>

        <button type="submit" className="nb-newBtn nb-drawerSubmit" disabled={!canSave}>
          Salva Fornitore
        </button>
      </form>
    </RightDrawer>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="nb-drawerField">
      <span className="nb-drawerFieldLabel">{label}</span>
      {children}
    </label>
  );
}
