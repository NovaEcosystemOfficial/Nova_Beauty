import { Check, ChevronLeft, ChevronRight, Scissors, X } from "lucide-react";
import clsx from "clsx";
import { useEffect, useState, type ReactNode } from "react";

export type ServiceWizardResult = {
  name: string;
  category: string;
  durationMin: number;
  price: number;
  cabin: string;
  operators: string[];
  products: string;
  description: string;
};

const STEPS = ["Base", "Operatività", "Dettagli", "Riepilogo"] as const;

const CATEGORIES = [
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

const OPERATORS = ["Fabio", "Laura", "Chiara"];
const CABINS = ["Cabina 1", "Cabina 2", "Cabina 3", "Open space"];

type NewServiceWizardProps = {
  open: boolean;
  onClose: () => void;
  onCreate: (result: ServiceWizardResult) => void;
};

type Draft = ServiceWizardResult;

const EMPTY: Draft = {
  name: "",
  category: CATEGORIES[0],
  durationMin: 45,
  price: 50,
  cabin: CABINS[0],
  operators: ["Fabio"],
  products: "",
  description: ""
};

export default function NewServiceWizard({ open, onClose, onCreate }: NewServiceWizardProps) {
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState<Draft>(EMPTY);

  useEffect(() => {
    if (!open) return;
    setStep(0);
    setDraft(EMPTY);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, [open, onClose]);

  if (!open) return null;

  const last = step === STEPS.length - 1;
  const canContinue = draft.name.trim().length > 0 && draft.durationMin > 0;
  const patch = (partial: Partial<Draft>) => setDraft((d) => ({ ...d, ...partial }));

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
    <div className="nb-centroWizardRoot" role="dialog" aria-modal="true" aria-label="Nuovo Servizio">
      <button type="button" className="nb-centroWizardBackdrop" aria-label="Chiudi" onClick={onClose} />
      <div className="nb-centroWizardPanel">
        <header className="nb-centroWizardHead">
          <div>
            <div className="nb-centroEyebrow">Nuovo Servizio</div>
            <h3 className="nb-centroWizardTitle">
              Step {step + 1} · {STEPS[step]}
            </h3>
          </div>
          <button type="button" className="nb-centroWizardClose" onClick={onClose} aria-label="Chiudi">
            <X className="nb-centroBtnIcon" aria-hidden={true} />
          </button>
        </header>

        <div className="nb-centroWizardSteps" aria-hidden={true}>
          {STEPS.map((label, i) => (
            <div key={label} className={clsx("nb-centroWizardStep", i <= step && "isOn")}>
              <span>{i + 1}</span>
              <em>{label}</em>
            </div>
          ))}
        </div>

        <div className="nb-centroWizardBody">
          {step === 0 ? (
            <div className="nb-centroWizardForm">
              <Field label="Nome servizio">
                <input
                  value={draft.name}
                  onChange={(e) => patch({ name: e.target.value })}
                  placeholder="es. Pulizia viso deep"
                  autoFocus
                />
              </Field>
              <Field label="Categoria">
                <select
                  value={draft.category}
                  onChange={(e) => patch({ category: e.target.value })}
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Durata (minuti)">
                <input
                  type="number"
                  min={5}
                  step={5}
                  value={draft.durationMin}
                  onChange={(e) => patch({ durationMin: Number(e.target.value) || 0 })}
                />
              </Field>
            </div>
          ) : null}

          {step === 1 ? (
            <div className="nb-centroWizardForm">
              <Field label="Prezzo (€)">
                <input
                  type="number"
                  min={0}
                  step={1}
                  value={draft.price}
                  onChange={(e) => patch({ price: Number(e.target.value) || 0 })}
                  autoFocus
                />
              </Field>
              <div className="nb-centroField">
                <span>Cabina</span>
                <div className="nb-centroWizardChips">
                  {CABINS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      className={clsx("nb-centroChip", draft.cabin === c && "isOn")}
                      onClick={() => patch({ cabin: c })}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
              <div className="nb-centroField">
                <span>Operatori abilitati</span>
                <div className="nb-centroWizardChips">
                  {OPERATORS.map((op) => {
                    const on = draft.operators.includes(op);
                    return (
                      <button
                        key={op}
                        type="button"
                        className={clsx("nb-centroChip", on && "isOn")}
                        onClick={() => toggleOperator(op)}
                      >
                        {op}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : null}

          {step === 2 ? (
            <div className="nb-centroWizardForm">
              <Field label="Prodotti utilizzati">
                <textarea
                  rows={3}
                  value={draft.products}
                  onChange={(e) => patch({ products: e.target.value })}
                  placeholder="Separati da virgola · es. Cleanser, Maschera…"
                  autoFocus
                />
              </Field>
              <Field label="Descrizione">
                <textarea
                  rows={4}
                  value={draft.description}
                  onChange={(e) => patch({ description: e.target.value })}
                  placeholder="Descrizione del trattamento…"
                />
              </Field>
            </div>
          ) : null}

          {step === 3 ? (
            <div className="nb-centroWizardInvite">
              <Scissors className="nb-centroWizardInviteIcon" aria-hidden={true} />
              <p>
                Stai per creare <strong>{draft.name.trim() || "Nuovo servizio"}</strong> nel
                catalogo demo.
              </p>
              <ul>
                <li>
                  <Check className="nb-centroCheck" aria-hidden={true} /> Categoria · {draft.category}
                </li>
                <li>
                  <Check className="nb-centroCheck" aria-hidden={true} /> Durata ·{" "}
                  {draft.durationMin} min · €{draft.price}
                </li>
                <li>
                  <Check className="nb-centroCheck" aria-hidden={true} /> Cabina · {draft.cabin}
                </li>
                <li>
                  <Check className="nb-centroCheck" aria-hidden={true} /> Operatori ·{" "}
                  {draft.operators.join(", ") || "—"}
                </li>
                <li>
                  <Check className="nb-centroCheck" aria-hidden={true} /> Prodotti ·{" "}
                  {draft.products.trim() || "—"}
                </li>
              </ul>
            </div>
          ) : null}
        </div>

        <footer className="nb-centroWizardFoot">
          <button
            type="button"
            className="nb-centroGhostBtn"
            disabled={step === 0}
            onClick={() => setStep((s) => Math.max(0, s - 1))}
          >
            <ChevronLeft className="nb-centroBtnIcon" aria-hidden={true} />
            Indietro
          </button>
          {last ? (
            <button
              type="button"
              className="nb-newBtn"
              disabled={!canContinue}
              onClick={() => {
                if (!canContinue) return;
                onCreate(draft);
                onClose();
              }}
            >
              Crea Servizio
            </button>
          ) : (
            <button
              type="button"
              className="nb-newBtn"
              disabled={step === 0 && !canContinue}
              onClick={() => setStep((s) => Math.min(STEPS.length - 1, s + 1))}
            >
              Continua
              <ChevronRight className="nb-newBtnIcon" aria-hidden={true} />
            </button>
          )}
        </footer>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="nb-centroField">
      <span>{label}</span>
      {children}
    </label>
  );
}
