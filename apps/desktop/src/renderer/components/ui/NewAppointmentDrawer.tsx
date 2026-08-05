import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useDemoWorkflow } from "../../demo/DemoWorkflowContext";
import RightDrawer from "./RightDrawer";

const SERVICES = [
  { name: "Pulizia viso deep", duration: 60, price: 65 },
  { name: "Massaggio rilassante", duration: 60, price: 55 },
  { name: "Epilazione gambe", duration: 45, price: 40 },
  { name: "Peeling enzimatico", duration: 45, price: 80 },
  { name: "Pressoterapia", duration: 45, price: 45 }
];

const OPERATORS = ["Fabio", "Laura"];
const CABINS = ["Cabina 1", "Cabina 2", "Cabina 3"];
const TIMES = ["09:00", "10:00", "11:30", "14:15", "15:30", "17:00", "17:30", "18:00"];

export default function NewAppointmentDrawer() {
  const {
    newApptDrawerOpen,
    newApptClientId,
    closeNewAppointment,
    bookAppointment,
    getClient
  } = useDemoWorkflow();

  const client = newApptClientId ? getClient(newApptClientId) : undefined;

  const [operator, setOperator] = useState(OPERATORS[0]);
  const [cabin, setCabin] = useState(CABINS[0]);
  const [serviceIdx, setServiceIdx] = useState(0);
  const [timeLabel, setTimeLabel] = useState("17:30");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (newApptDrawerOpen && client) {
      setOperator(OPERATORS[0]);
      setCabin(CABINS[0]);
      setServiceIdx(0);
      setTimeLabel("17:30");
      setNotes("");
    }
  }, [newApptDrawerOpen, client]);

  const service = SERVICES[serviceIdx];

  const canBook = useMemo(() => Boolean(client && service), [client, service]);

  return (
    <RightDrawer
      open={newApptDrawerOpen}
      title="Nuovo appuntamento"
      subtitle="Workflow demo · senza sync"
      onClose={closeNewAppointment}
    >
      {!client ? (
        <p className="nb-drawerEmpty">Seleziona un cliente.</p>
      ) : (
        <form
          className="nb-drawerForm"
          onSubmit={(e) => {
            e.preventDefault();
            if (!canBook) return;
            bookAppointment({
              clientId: client.id,
              client: client.name,
              phone: client.phone,
              email: client.email,
              operator,
              cabin,
              service: service.name,
              dateLabel: "Mer 5 ago 2026",
              timeLabel,
              durationMin: service.duration,
              price: service.price,
              notes
            });
          }}
        >
          <Field label="Cliente">
            <input className="nb-drawerInput" value={client.name} readOnly />
          </Field>

          <Field label="Operatore">
            <select
              className="nb-drawerSelect"
              value={operator}
              onChange={(e) => setOperator(e.target.value)}
            >
              {OPERATORS.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Cabina">
            <select
              className="nb-drawerSelect"
              value={cabin}
              onChange={(e) => setCabin(e.target.value)}
            >
              {CABINS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Servizio">
            <select
              className="nb-drawerSelect"
              value={serviceIdx}
              onChange={(e) => setServiceIdx(Number(e.target.value))}
            >
              {SERVICES.map((s, i) => (
                <option key={s.name} value={i}>
                  {s.name}
                </option>
              ))}
            </select>
          </Field>

          <div className="nb-drawerRow2">
            <Field label="Data">
              <input className="nb-drawerInput" value="Mer 5 ago 2026" readOnly />
            </Field>
            <Field label="Ora">
              <select
                className="nb-drawerSelect"
                value={timeLabel}
                onChange={(e) => setTimeLabel(e.target.value)}
              >
                {TIMES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <div className="nb-drawerRow2">
            <Field label="Durata">
              <input className="nb-drawerInput" value={`${service.duration} min`} readOnly />
            </Field>
            <Field label="Prezzo">
              <input className="nb-drawerInput" value={`€${service.price}`} readOnly />
            </Field>
          </div>

          <Field label="Note">
            <textarea
              className="nb-drawerTextarea"
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Note appuntamento…"
            />
          </Field>

          <button type="submit" className="nb-newBtn nb-drawerSubmit">
            Prenota appuntamento
          </button>
        </form>
      )}
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
