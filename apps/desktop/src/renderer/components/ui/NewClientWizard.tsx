import { Camera, Check, ChevronLeft, ChevronRight, UserPlus, X } from "lucide-react";
import clsx from "clsx";
import { useEffect, useState, type ReactNode } from "react";
import { useDemoWorkflow, type NewClientDraft } from "../../demo/DemoWorkflowContext";

const STEPS = ["Anagrafica", "Residenza", "Consensi", "Clinico", "Riepilogo"] as const;

const GENDERS = ["Donna", "Uomo", "Altro", "Preferisco non dire"] as const;

const EMPTY: NewClientDraft = {
  firstName: "",
  lastName: "",
  phone: "",
  email: "",
  birthday: "",
  preferredOperator: "Fabio",
  privacyConsent: false,
  notes: "",
  gender: GENDERS[0],
  address: "",
  city: "",
  zip: "",
  fiscalCode: "",
  marketingConsent: false,
  profilePhoto: false,
  allergies: "",
  pathologies: "",
  preferences: ""
};

export default function NewClientWizard() {
  const { newClientWizardOpen, closeNewClientWizard, createClient } = useDemoWorkflow();
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState<NewClientDraft>(EMPTY);

  useEffect(() => {
    if (!newClientWizardOpen) return;
    setStep(0);
    setDraft(EMPTY);
  }, [newClientWizardOpen]);

  useEffect(() => {
    if (!newClientWizardOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        closeNewClientWizard();
      }
    };
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, [newClientWizardOpen, closeNewClientWizard]);

  if (!newClientWizardOpen) return null;

  const last = step === STEPS.length - 1;
  const canContinueStep0 =
    draft.firstName.trim().length > 0 && draft.lastName.trim().length > 0;
  const canCreate = canContinueStep0 && draft.privacyConsent;

  const patch = (partial: Partial<NewClientDraft>) =>
    setDraft((d) => ({ ...d, ...partial }));

  const handleCreate = async () => {
    if (!canCreate) return;
    const id = await createClient(draft);
    if (id) closeNewClientWizard();
  };

  return (
    <div className="nb-centroWizardRoot" role="dialog" aria-modal="true" aria-label="Nuovo Cliente">
      <button
        type="button"
        className="nb-centroWizardBackdrop"
        aria-label="Chiudi"
        onClick={closeNewClientWizard}
      />
      <div className="nb-centroWizardPanel">
        <header className="nb-centroWizardHead">
          <div>
            <div className="nb-centroEyebrow">Nuovo Cliente</div>
            <h3 className="nb-centroWizardTitle">
              Step {step + 1} · {STEPS[step]}
            </h3>
          </div>
          <button
            type="button"
            className="nb-centroWizardClose"
            onClick={closeNewClientWizard}
            aria-label="Chiudi"
          >
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
              <Field label="Nome">
                <input
                  value={draft.firstName}
                  onChange={(e) => patch({ firstName: e.target.value })}
                  placeholder="Nome"
                  autoFocus
                />
              </Field>
              <Field label="Cognome">
                <input
                  value={draft.lastName}
                  onChange={(e) => patch({ lastName: e.target.value })}
                  placeholder="Cognome"
                />
              </Field>
              <Field label="Telefono">
                <input
                  value={draft.phone}
                  onChange={(e) => patch({ phone: e.target.value })}
                  placeholder="+39 …"
                />
              </Field>
              <Field label="Email">
                <input
                  type="email"
                  value={draft.email}
                  onChange={(e) => patch({ email: e.target.value })}
                  placeholder="email@…"
                />
              </Field>
              <Field label="Data di nascita">
                <input
                  value={draft.birthday}
                  onChange={(e) => patch({ birthday: e.target.value })}
                  placeholder="es. 12 marzo 1990"
                />
              </Field>
              <div className="nb-centroField">
                <span>Sesso</span>
                <div className="nb-centroWizardChips">
                  {GENDERS.map((g) => (
                    <button
                      key={g}
                      type="button"
                      className={clsx("nb-centroChip", draft.gender === g && "isOn")}
                      onClick={() => patch({ gender: g })}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : null}

          {step === 1 ? (
            <div className="nb-centroWizardForm">
              <Field label="Indirizzo">
                <input
                  value={draft.address ?? ""}
                  onChange={(e) => patch({ address: e.target.value })}
                  placeholder="Via / Piazza…"
                  autoFocus
                />
              </Field>
              <Field label="Città">
                <input
                  value={draft.city ?? ""}
                  onChange={(e) => patch({ city: e.target.value })}
                  placeholder="Città"
                />
              </Field>
              <Field label="CAP">
                <input
                  value={draft.zip ?? ""}
                  onChange={(e) => patch({ zip: e.target.value })}
                  placeholder="20100"
                />
              </Field>
              <Field label="Codice fiscale (facoltativo)">
                <input
                  value={draft.fiscalCode ?? ""}
                  onChange={(e) => patch({ fiscalCode: e.target.value.toUpperCase() })}
                  placeholder="RSSGLI90A41F205X"
                />
              </Field>
            </div>
          ) : null}

          {step === 2 ? (
            <div className="nb-centroWizardForm">
              <label className="nb-clientWizardCheck">
                <input
                  type="checkbox"
                  checked={draft.privacyConsent}
                  onChange={(e) => patch({ privacyConsent: e.target.checked })}
                />
                <span>
                  <strong>Privacy</strong> — consenso al trattamento dei dati personali
                </span>
              </label>
              <label className="nb-clientWizardCheck">
                <input
                  type="checkbox"
                  checked={Boolean(draft.marketingConsent)}
                  onChange={(e) => patch({ marketingConsent: e.target.checked })}
                />
                <span>
                  <strong>Marketing</strong> — comunicazioni promozionali e reminder
                </span>
              </label>
              <button
                type="button"
                className={clsx("nb-clientWizardPhoto", draft.profilePhoto && "isOn")}
                onClick={() => patch({ profilePhoto: !draft.profilePhoto })}
              >
                <span className="nb-clientWizardPhotoIcon" aria-hidden={true}>
                  {draft.profilePhoto ? (
                    <UserPlus className="nb-centroBtnIcon" aria-hidden={true} />
                  ) : (
                    <Camera className="nb-centroBtnIcon" aria-hidden={true} />
                  )}
                </span>
                <span>
                  <strong>Foto profilo</strong>
                  <em>{draft.profilePhoto ? "Foto demo collegata" : "Carica foto (demo)"}</em>
                </span>
              </button>
              <p className="nb-centroWizardNote">
                In produzione la foto arriverà dalla PWA NovaBeauty Staff. Qui simuliamo solo il
                collegamento.
              </p>
            </div>
          ) : null}

          {step === 3 ? (
            <div className="nb-centroWizardForm">
              <Field label="Allergie">
                <textarea
                  rows={2}
                  value={draft.allergies ?? ""}
                  onChange={(e) => patch({ allergies: e.target.value })}
                  placeholder="es. Lattice, nichel…"
                />
              </Field>
              <Field label="Patologie">
                <textarea
                  rows={2}
                  value={draft.pathologies ?? ""}
                  onChange={(e) => patch({ pathologies: e.target.value })}
                  placeholder="es. Pelle sensibile…"
                />
              </Field>
              <Field label="Note">
                <textarea
                  rows={2}
                  value={draft.notes}
                  onChange={(e) => patch({ notes: e.target.value })}
                  placeholder="Note libere…"
                />
              </Field>
              <Field label="Preferenze">
                <textarea
                  rows={2}
                  value={draft.preferences ?? ""}
                  onChange={(e) => patch({ preferences: e.target.value })}
                  placeholder="es. Preferisce mattina, cabina 2…"
                />
              </Field>
            </div>
          ) : null}

          {step === 4 ? (
            <div className="nb-centroWizardInvite">
              <UserPlus className="nb-centroWizardInviteIcon" aria-hidden={true} />
              <p>
                Stai per creare{" "}
                <strong>
                  {draft.firstName.trim() || "Nome"} {draft.lastName.trim() || "Cognome"}
                </strong>{" "}
                nella lista clienti demo.
              </p>
              <ul>
                <li>
                  <Check className="nb-centroCheck" aria-hidden={true} /> Telefono ·{" "}
                  {draft.phone.trim() || "—"}
                </li>
                <li>
                  <Check className="nb-centroCheck" aria-hidden={true} /> Email ·{" "}
                  {draft.email.trim() || "—"}
                </li>
                <li>
                  <Check className="nb-centroCheck" aria-hidden={true} /> Nascita ·{" "}
                  {draft.birthday.trim() || "—"} · {draft.gender || "—"}
                </li>
                <li>
                  <Check className="nb-centroCheck" aria-hidden={true} /> Residenza ·{" "}
                  {[draft.address, draft.zip, draft.city].filter(Boolean).join(", ") || "—"}
                </li>
                <li>
                  <Check className="nb-centroCheck" aria-hidden={true} /> Privacy ·{" "}
                  {draft.privacyConsent ? "OK" : "Mancante"}
                  {draft.marketingConsent ? " · Marketing OK" : ""}
                </li>
                <li>
                  <Check className="nb-centroCheck" aria-hidden={true} /> Clinico ·{" "}
                  {draft.allergies || draft.pathologies || draft.preferences
                    ? "Note registrate"
                    : "Nessuna nota"}
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
              disabled={!canCreate}
              onClick={() => void handleCreate()}
            >
              Crea Cliente
            </button>
          ) : (
            <button
              type="button"
              className="nb-newBtn"
              disabled={step === 0 && !canContinueStep0}
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
