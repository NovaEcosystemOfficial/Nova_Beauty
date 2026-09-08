import { useEffect, useState, type ReactNode } from "react";
import { useDemoWorkflow, type NewClientDraft } from "../../demo/DemoWorkflowContext";
import RightDrawer from "./RightDrawer";

const OPERATORS = ["Fabio", "Laura", "Chiara"];

type NewClientDrawerProps = {
  open: boolean;
  onClose: () => void;
  onCreated: (clientId: string) => void;
  layer?: number;
  escEnabled?: boolean;
};

const EMPTY: NewClientDraft = {
  firstName: "",
  lastName: "",
  phone: "",
  email: "",
  birthday: "",
  preferredOperator: OPERATORS[0],
  privacyConsent: false,
  notes: ""
};

export default function NewClientDrawer({
  open,
  onClose,
  onCreated,
  layer = 2,
  escEnabled = true
}: NewClientDrawerProps) {
  const { createClient } = useDemoWorkflow();
  const [draft, setDraft] = useState(EMPTY);

  useEffect(() => {
    if (open) setDraft(EMPTY);
  }, [open]);

  const canSave =
    draft.firstName.trim().length > 0 &&
    draft.lastName.trim().length > 0 &&
    draft.privacyConsent;

  return (
    <RightDrawer
      open={open}
      title="Nuovo Cliente"
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
            const id = await createClient(draft);
            if (!id) return;
            onCreated(id);
            onClose();
          })();
        }}
      >
        <div className="nb-drawerRow2">
          <Field label="Nome">
            <input
              className="nb-drawerInput"
              value={draft.firstName}
              onChange={(e) => setDraft((d) => ({ ...d, firstName: e.target.value }))}
              placeholder="Nome"
              required
            />
          </Field>
          <Field label="Cognome">
            <input
              className="nb-drawerInput"
              value={draft.lastName}
              onChange={(e) => setDraft((d) => ({ ...d, lastName: e.target.value }))}
              placeholder="Cognome"
              required
            />
          </Field>
        </div>

        <Field label="Telefono">
          <input
            className="nb-drawerInput"
            value={draft.phone}
            onChange={(e) => setDraft((d) => ({ ...d, phone: e.target.value }))}
            placeholder="+39 …"
          />
        </Field>

        <Field label="Email">
          <input
            className="nb-drawerInput"
            type="email"
            value={draft.email}
            onChange={(e) => setDraft((d) => ({ ...d, email: e.target.value }))}
            placeholder="email@…"
          />
        </Field>

        <Field label="Data nascita">
          <input
            className="nb-drawerInput"
            value={draft.birthday}
            onChange={(e) => setDraft((d) => ({ ...d, birthday: e.target.value }))}
            placeholder="es. 12 marzo 1990"
          />
        </Field>

        <Field label="Operatore preferito">
          <select
            className="nb-drawerSelect"
            value={draft.preferredOperator}
            onChange={(e) => setDraft((d) => ({ ...d, preferredOperator: e.target.value }))}
          >
            {OPERATORS.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
        </Field>

        <label className="nb-drawerCheck">
          <input
            type="checkbox"
            checked={draft.privacyConsent}
            onChange={(e) => setDraft((d) => ({ ...d, privacyConsent: e.target.checked }))}
          />
          <span>Consenso Privacy</span>
        </label>

        <Field label="Note">
          <textarea
            className="nb-drawerTextarea"
            rows={3}
            value={draft.notes}
            onChange={(e) => setDraft((d) => ({ ...d, notes: e.target.value }))}
            placeholder="Note cliente…"
          />
        </Field>

        <button type="submit" className="nb-newBtn nb-drawerSubmit" disabled={!canSave}>
          Salva Cliente
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
