import { Check, Mail, MessageSquare, Pencil, Phone, Trash2 } from "lucide-react";
import { useDemoWorkflow } from "../../demo/DemoWorkflowContext";
import RightDrawer from "./RightDrawer";

export default function AppointmentDetailDrawer() {
  const {
    detailApptId,
    appointments,
    closeAppointmentDetail,
    openCompleteDialog,
    getClient
  } = useDemoWorkflow();

  const appt = appointments.find((a) => a.id === detailApptId) ?? null;
  const client = appt ? getClient(appt.clientId) : undefined;
  const open = Boolean(appt);

  return (
    <RightDrawer
      open={open}
      title="Scheda appuntamento"
      subtitle={appt ? `${appt.timeLabel} · ${appt.dateLabel}` : undefined}
      onClose={closeAppointmentDetail}
      wide
    >
      {!appt ? null : (
        <div className="nb-drawerForm">
          <div className="nb-apptDetailHero">
            <div className="nb-apptDetailAvatar" aria-hidden={true}>
              {appt.client
                .split(" ")
                .slice(0, 2)
                .map((p) => p[0])
                .join("")}
            </div>
            <div>
              <div className="nb-apptDetailName">{appt.client}</div>
              <div className="nb-apptDetailService">{appt.service}</div>
              <span className={`nb-cwStatus is-${appt.status === "completato" ? "attivo" : "nuovo"}`}>
                {appt.status.replace("_", " ")}
              </span>
            </div>
          </div>

          <div className="nb-drawerMetaGrid">
            <Meta label="Operatore" value={appt.operator} />
            <Meta label="Cabina" value={appt.cabin} />
            <Meta label="Durata" value={`${appt.durationMin} min`} />
            <Meta label="Prezzo" value={`€${appt.price}`} />
            <Meta label="Telefono" value={appt.phone} />
            <Meta label="Email" value={appt.email} />
          </div>

          <div className="nb-drawerBlock">
            <div className="nb-drawerBlockTitle">Contatti rapidi</div>
            <div className="nb-drawerContactRow">
              <button type="button" className="nb-drawerChipBtn" disabled>
                <Phone className="nb-drawerChipIcon" aria-hidden={true} />
                Telefono
              </button>
              <button type="button" className="nb-drawerChipBtn" disabled>
                <MessageSquare className="nb-drawerChipIcon" aria-hidden={true} />
                WhatsApp
              </button>
              <button type="button" className="nb-drawerChipBtn" disabled>
                <Mail className="nb-drawerChipIcon" aria-hidden={true} />
                Email
              </button>
            </div>
          </div>

          <div className="nb-drawerBlock">
            <div className="nb-drawerBlockTitle">Storico cliente</div>
            <ul className="nb-drawerHistory">
              {(client?.historyLines.length ? client.historyLines : [appt.history]).map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </div>

          <div className="nb-drawerBlock">
            <div className="nb-drawerBlockTitle">Note</div>
            <p className="nb-drawerNoteText">{appt.notes || "—"}</p>
          </div>

          <div className="nb-drawerActionRow">
            <button
              type="button"
              className="nb-drawerAction primary"
              disabled={appt.status === "completato"}
              onClick={openCompleteDialog}
            >
              <Check className="nb-drawerActionIcon" aria-hidden={true} />
              Completa
            </button>
            <button type="button" className="nb-drawerAction" disabled>
              <Pencil className="nb-drawerActionIcon" aria-hidden={true} />
              Modifica
            </button>
            <button type="button" className="nb-drawerAction danger" disabled>
              <Trash2 className="nb-drawerActionIcon" aria-hidden={true} />
              Elimina
            </button>
          </div>
        </div>
      )}
    </RightDrawer>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div className="nb-drawerMeta">
      <span className="nb-drawerMetaLabel">{label}</span>
      <span className="nb-drawerMetaValue">{value}</span>
    </div>
  );
}
