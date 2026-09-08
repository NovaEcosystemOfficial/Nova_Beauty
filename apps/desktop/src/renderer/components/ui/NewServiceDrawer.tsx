import { useEffect, useState, type ReactNode } from "react";
import { useDemoWorkflow, type NewServiceDraft } from "../../demo/DemoWorkflowContext";
import RightDrawer from "./RightDrawer";

const CATEGORIES = [
  "Viso",
  "Corpo",
  "Massaggi",
  "Mani",
  "Piedi",
  "Epilazione",
  "Trucco",
  "Pacchetti"
];

const OPERATORS = ["Fabio", "Laura", "Chiara"];

const COLORS = [
  { id: "#c45c6a", label: "Rosa" },
  { id: "#3d9b84", label: "Menta" },
  { id: "#7a6bb0", label: "Lavanda" },
  { id: "#c9a227", label: "Oro" },
  { id: "#5a6b7a", label: "Ardesia" }
];

type NewServiceDrawerProps = {
  open: boolean;
  onClose: () => void;
  onCreated: (serviceId: string) => void;
  layer?: number;
  escEnabled?: boolean;
};

const EMPTY: NewServiceDraft = {
  category: CATEGORIES[0],
  name: "",
  durationMin: 45,
  price: 50,
  products: "",
  operators: ["Fabio"],
  color: COLORS[0].id
};

export default function NewServiceDrawer({
  open,
  onClose,
  onCreated,
  layer = 2,
  escEnabled = true
}: NewServiceDrawerProps) {
  const { createService } = useDemoWorkflow();
  const [draft, setDraft] = useState(EMPTY);

  useEffect(() => {
    if (open) setDraft(EMPTY);
  }, [open]);

  const canSave = draft.name.trim().length > 0 && draft.durationMin > 0 && draft.price >= 0;

  const toggleOperator = (name: string) => {
    setDraft((d) => {
      const has = d.operators.includes(name);
      return {
        ...d,
        operators: has ? d.operators.filter((o) => o !== name) : [...d.operators, name]
      };
    });
  };

  return (
    <RightDrawer
      open={open}
      title="Nuovo Servizio"
      subtitle="Quick create · senza uscire dal flusso"
      onClose={onClose}
      layer={layer}
      escEnabled={escEnabled}
    >
      <form
        className="nb-drawerForm"
        onSubmit={(e) => {
          e.preventDefault();
          if (!canSave) return;
          void (async () => {
            const id = await createService(draft);
            if (!id) return;
            onCreated(id);
            onClose();
          })();
        }}
      >
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

        <Field label="Nome">
          <input
            className="nb-drawerInput"
            value={draft.name}
            onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
            placeholder="Nome servizio"
            required
          />
        </Field>

        <div className="nb-drawerRow2">
          <Field label="Durata (min)">
            <input
              className="nb-drawerInput"
              type="number"
              min={5}
              step={5}
              value={draft.durationMin}
              onChange={(e) =>
                setDraft((d) => ({ ...d, durationMin: Number(e.target.value) || 0 }))
              }
            />
          </Field>
          <Field label="Prezzo (€)">
            <input
              className="nb-drawerInput"
              type="number"
              min={0}
              step={1}
              value={draft.price}
              onChange={(e) => setDraft((d) => ({ ...d, price: Number(e.target.value) || 0 }))}
            />
          </Field>
        </div>

        <Field label="Prodotti utilizzati">
          <input
            className="nb-drawerInput"
            value={draft.products}
            onChange={(e) => setDraft((d) => ({ ...d, products: e.target.value }))}
            placeholder="es. Siero, Maschera…"
          />
        </Field>

        <fieldset className="nb-drawerFieldset">
          <legend className="nb-drawerFieldLabel">Operatori abilitati</legend>
          <div className="nb-drawerChipRow">
            {OPERATORS.map((o) => {
              const on = draft.operators.includes(o);
              return (
                <button
                  key={o}
                  type="button"
                  className={`nb-drawerChipToggle${on ? " isOn" : ""}`}
                  aria-pressed={on}
                  onClick={() => toggleOperator(o)}
                >
                  {o}
                </button>
              );
            })}
          </div>
        </fieldset>

        <fieldset className="nb-drawerFieldset">
          <legend className="nb-drawerFieldLabel">Colore</legend>
          <div className="nb-drawerColorRow" role="radiogroup" aria-label="Colore servizio">
            {COLORS.map((c) => (
              <button
                key={c.id}
                type="button"
                className={`nb-drawerColorSwatch${draft.color === c.id ? " isOn" : ""}`}
                style={{ background: c.id }}
                aria-label={c.label}
                aria-checked={draft.color === c.id}
                role="radio"
                onClick={() => setDraft((d) => ({ ...d, color: c.id }))}
              />
            ))}
          </div>
        </fieldset>

        <button type="submit" className="nb-newBtn nb-drawerSubmit" disabled={!canSave}>
          Salva
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
