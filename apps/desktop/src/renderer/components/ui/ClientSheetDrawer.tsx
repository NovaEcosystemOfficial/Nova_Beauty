import type { ReactNode } from "react";
import {
  CalendarDays,
  Camera,
  CreditCard,
  FileText,
  History,
  Lock,
  Scissors,
  Sparkles
} from "lucide-react";
import RightDrawer from "./RightDrawer";
import type { WorkflowAppointment, WorkflowClient } from "../../demo/DemoWorkflowContext";

type ClientSheetDrawerProps = {
  open: boolean;
  client: WorkflowClient | null;
  appointments: WorkflowAppointment[];
  onClose: () => void;
};

export default function ClientSheetDrawer({
  open,
  client,
  appointments,
  onClose
}: ClientSheetDrawerProps) {
  if (!client) {
    return (
      <RightDrawer open={open} title="Scheda cliente" onClose={onClose} wide>
        <p className="nb-clientSheetEmpty">Cliente non trovato nella demo.</p>
      </RightDrawer>
    );
  }

  const future = appointments
    .filter(
      (a) =>
        a.clientId === client.id &&
        a.status !== "annullato" &&
        a.status !== "completato" &&
        a.dayOffset >= 0
    )
    .sort((a, b) => a.dayOffset - b.dayOffset || a.startMin - b.startMin);

  const treatments = client.historyLines.length
    ? client.historyLines
    : ["Nessun trattamento registrato"];

  return (
    <RightDrawer
      open={open}
      title="Scheda cliente"
      subtitle={client.name}
      onClose={onClose}
      wide
    >
      <div className="nb-clientSheet">
        <section className="nb-clientSheetHero">
          <div className="nb-clientSheetAvatar" aria-hidden={true}>
            {client.name
              .split(" ")
              .slice(0, 2)
              .map((p) => p[0])
              .join("")}
          </div>
          <div>
            <h3 className="nb-clientSheetName">{client.name}</h3>
            <p className="nb-clientSheetMeta">
              {client.status} · {client.phone}
            </p>
            <div className="nb-clientSheetTags">
              {client.tags.map((t) => (
                <span key={t} className="nb-clientSheetTag">
                  {t}
                </span>
              ))}
            </div>
          </div>
        </section>

        <Section icon={Sparkles} title="Dati cliente">
          <dl className="nb-clientSheetDl">
            <div>
              <dt>Email</dt>
              <dd>{client.email}</dd>
            </div>
            <div>
              <dt>Telefono</dt>
              <dd>{client.phone}</dd>
            </div>
            <div>
              <dt>Compleanno</dt>
              <dd>{client.birthday}</dd>
            </div>
            <div>
              <dt>Ultimo trattamento</dt>
              <dd>{client.lastTreatment || "—"}</dd>
            </div>
            <div>
              <dt>Spesa totale</dt>
              <dd>€{client.totalSpent}</dd>
            </div>
            <div>
              <dt>Punti fidelity</dt>
              <dd>{client.fidelityPoints}</dd>
            </div>
          </dl>
          {client.notes ? <p className="nb-clientSheetNotes">{client.notes}</p> : null}
        </Section>

        <Section icon={History} title="Storico visite">
          <ul className="nb-clientSheetList">
            {treatments.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </Section>

        <Section icon={Scissors} title="Trattamenti">
          <ul className="nb-clientSheetList">
            {client.diaryPlaceholders.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </Section>

        <Section icon={Camera} title="Diario Fotografico">
          <div className="nb-clientSheetPhotos" data-client-id={client.id}>
            <div className="nb-clientSheetPhoto">Prima trattamento</div>
            <div className="nb-clientSheetPhoto">Dopo trattamento</div>
            <div className="nb-clientSheetPhoto">Zone trattate</div>
            <div className="nb-clientSheetPhoto">Follow-up programmato</div>
          </div>
        </Section>

        <Section icon={FileText} title="Documenti">
          <ul className="nb-clientSheetList">
            <li>Anamnesi · firmata</li>
            <li>Scheda trattamento · PDF</li>
            <li>Preventivo · bozza</li>
          </ul>
        </Section>

        <Section icon={Lock} title="Consenso privacy">
          <p className="nb-clientSheetPrivacy isOk">Consenso privacy attivo · aggiornato 2026</p>
        </Section>

        <Section icon={CreditCard} title="Pagamenti">
          <ul className="nb-clientSheetList">
            <li>Ultimo pagamento · €{Math.min(client.totalSpent, 95)} · Carta</li>
            <li>Saldo aperto · €0</li>
            <li>Fidelity · {client.fidelityPoints} punti</li>
          </ul>
        </Section>

        <Section icon={CalendarDays} title="Appuntamenti futuri">
          {future.length ? (
            <ul className="nb-clientSheetList">
              {future.map((a) => (
                <li key={a.id}>
                  {a.dateLabel} · {a.timeLabel} · {a.service}
                </li>
              ))}
            </ul>
          ) : (
            <p className="nb-clientSheetEmptyInline">Nessun appuntamento futuro</p>
          )}
        </Section>
      </div>
    </RightDrawer>
  );
}

function Section({
  icon: Icon,
  title,
  children
}: {
  icon: typeof History;
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="nb-clientSheetSection">
      <div className="nb-clientSheetSectionHead">
        <Icon className="nb-clientSheetSectionIcon" aria-hidden={true} />
        <h4 className="nb-clientSheetSectionTitle">{title}</h4>
      </div>
      {children}
    </section>
  );
}
