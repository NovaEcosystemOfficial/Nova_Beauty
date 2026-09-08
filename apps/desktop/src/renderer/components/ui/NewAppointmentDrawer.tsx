import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useDemoWorkflow } from "../../demo/DemoWorkflowContext";
import NewClientDrawer from "./NewClientDrawer";
import NewServiceDrawer from "./NewServiceDrawer";
import RightDrawer from "./RightDrawer";
import SearchCombobox from "./SearchCombobox";

const OPERATORS = ["Fabio", "Laura"];
const CABINS = ["Cabina 1", "Cabina 2", "Cabina 3"];
const TIMES = ["09:00", "10:00", "11:30", "14:15", "15:30", "17:00", "17:30", "18:00"];

export default function NewAppointmentDrawer() {
  const {
    newApptDrawerOpen,
    newApptClientId,
    setNewApptClientId,
    closeNewAppointment,
    bookAppointment,
    getClient,
    getService,
    clients,
    services
  } = useDemoWorkflow();

  const [operator, setOperator] = useState(OPERATORS[0]);
  const [cabin, setCabin] = useState(CABINS[0]);
  const [serviceId, setServiceId] = useState<string | null>(null);
  const [timeLabel, setTimeLabel] = useState("17:30");
  const [notes, setNotes] = useState("");
  const [clientDrawerOpen, setClientDrawerOpen] = useState(false);
  const [serviceDrawerOpen, setServiceDrawerOpen] = useState(false);

  const wasOpen = useRef(false);
  const servicesRef = useRef(services);
  servicesRef.current = services;

  useEffect(() => {
    if (newApptDrawerOpen && !wasOpen.current) {
      setOperator(OPERATORS[0]);
      setCabin(CABINS[0]);
      const firstActive = servicesRef.current.find((s) => s.active) ?? servicesRef.current[0];
      setServiceId(firstActive?.id ?? null);
      setTimeLabel("17:30");
      setNotes("");
      setClientDrawerOpen(false);
      setServiceDrawerOpen(false);
    }
    if (!newApptDrawerOpen) {
      setClientDrawerOpen(false);
      setServiceDrawerOpen(false);
    }
    wasOpen.current = newApptDrawerOpen;
  }, [newApptDrawerOpen]);

  useEffect(() => {
    if (!newApptDrawerOpen) return;
    if (serviceId) return;
    const firstActive = services.find((s) => s.active) ?? services[0];
    if (firstActive) setServiceId(firstActive.id);
  }, [newApptDrawerOpen, serviceId, services]);

  const client = newApptClientId ? getClient(newApptClientId) : undefined;
  const service = serviceId ? getService(serviceId) : undefined;

  const clientItems = useMemo(
    () =>
      clients.map((c) => ({
        id: c.id,
        label: c.name,
        meta: c.phone
      })),
    [clients]
  );

  const serviceItems = useMemo(
    () =>
      services
        .filter((s) => s.active)
        .map((s) => ({
          id: s.id,
          label: s.name,
          meta: `${s.durationMin} min · €${s.price}`
        })),
    [services]
  );

  const canBook = Boolean(client && service);
  const stackedOpen = clientDrawerOpen || serviceDrawerOpen;

  return (
    <>
      <RightDrawer
        open={newApptDrawerOpen}
        title="Nuovo appuntamento"
        subtitle="Quick create · flusso senza interruzioni"
        onClose={closeNewAppointment}
        layer={1}
        escEnabled={!stackedOpen}
      >
        <form
          className="nb-drawerForm"
          onSubmit={(e) => {
            e.preventDefault();
            if (!client || !service) return;
            void (async () => {
              const ok = await bookAppointment({
                clientId: client.id,
                client: client.name,
                phone: client.phone,
                email: client.email,
                operator,
                cabin,
                service: service.name,
                serviceId: service.id,
                dateLabel: "Mer 5 ago 2026",
                timeLabel,
                durationMin: service.durationMin,
                price: service.price,
                notes
              });
              if (!ok) return;
            })();
          }}
        >
          <Field label="Cliente">
            <SearchCombobox
              items={clientItems}
              valueId={newApptClientId}
              placeholder="Cerca cliente..."
              createLabel="Crea nuovo cliente"
              onSelect={(id) => setNewApptClientId(id)}
              onClear={() => setNewApptClientId(null)}
              onCreate={() => setClientDrawerOpen(true)}
            />
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
            <SearchCombobox
              items={serviceItems}
              valueId={serviceId}
              placeholder="Cerca servizio..."
              createLabel="Nuovo Servizio"
              onSelect={setServiceId}
              onClear={() => setServiceId(null)}
              onCreate={() => setServiceDrawerOpen(true)}
            />
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
              <input
                className="nb-drawerInput"
                value={service ? `${service.durationMin} min` : "—"}
                readOnly
              />
            </Field>
            <Field label="Prezzo">
              <input
                className="nb-drawerInput"
                value={service ? `€${service.price}` : "—"}
                readOnly
              />
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

          <button type="submit" className="nb-newBtn nb-drawerSubmit" disabled={!canBook}>
            Prenota appuntamento
          </button>
        </form>
      </RightDrawer>

      <NewClientDrawer
        open={clientDrawerOpen}
        onClose={() => setClientDrawerOpen(false)}
        onCreated={(id) => setNewApptClientId(id)}
        layer={2}
        escEnabled={!serviceDrawerOpen}
      />

      <NewServiceDrawer
        open={serviceDrawerOpen}
        onClose={() => setServiceDrawerOpen(false)}
        onCreated={(id) => setServiceId(id)}
        layer={3}
      />
    </>
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
