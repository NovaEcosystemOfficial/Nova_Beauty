import { Check, Mail, MessageSquare, Pencil, Phone, Trash2 } from "lucide-react";
import { useState } from "react";
import {
  useDemoWorkflow,
  type AppointmentEditDraft,
  type ApptStatus
} from "../../demo/DemoWorkflowContext";
import RightDrawer from "./RightDrawer";

export default function AppointmentDetailDrawer() {
  const {
    detailApptId,
    appointments,
    closeAppointmentDetail,
    openCompleteDialog,
    getClient,
    updateAppointment,
    deleteAppointment
  } = useDemoWorkflow();

  const appt = appointments.find((a) => a.id === detailApptId) ?? null;
  const client = appt ? getClient(appt.clientId) : undefined;
  const open = Boolean(appt);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editDraft, setEditDraft] = useState<AppointmentEditDraft | null>(null);
  const [busy, setBusy] = useState(false);

  const openEdit = () => {
    if (!appt) return;
    setEditDraft({
      clientId: appt.clientId,
      client: appt.client,
      phone: appt.phone,
      email: appt.email,
      operator: appt.operator,
      cabin: appt.cabin,
      service: appt.service,
      dateLabel: appt.dateLabel,
      timeLabel: appt.timeLabel,
      durationMin: appt.durationMin,
      price: appt.price,
      notes: appt.notes,
      status: appt.status,
      dayOffset: appt.dayOffset
    });
    setEditOpen(true);
  };

  const saveEdit = async () => {
    if (!appt || !editDraft || busy) return;
    setBusy(true);
    const ok = await updateAppointment(appt.id, editDraft);
    setBusy(false);
    if (ok) setEditOpen(false);
  };

  const confirmDelete = async () => {
    if (!appt || busy) return;
    setBusy(true);
    const ok = await deleteAppointment(appt.id);
    setBusy(false);
    if (ok) {
      setDeleteOpen(false);
      closeAppointmentDetail();
    }
  };

  return (
    <>
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
              <button type="button" className="nb-drawerAction" onClick={openEdit}>
                <Pencil className="nb-drawerActionIcon" aria-hidden={true} />
                Modifica
              </button>
              <button
                type="button"
                className="nb-drawerAction danger"
                onClick={() => setDeleteOpen(true)}
              >
                <Trash2 className="nb-drawerActionIcon" aria-hidden={true} />
                Elimina
              </button>
            </div>
          </div>
        )}
      </RightDrawer>

      {editOpen && editDraft && appt ? (
        <div className="nb-dialogRoot isOpen" role="presentation">
          <button
            type="button"
            className="nb-dialogBackdrop"
            aria-label="Annulla"
            onClick={() => setEditOpen(false)}
          />
          <div
            className="nb-dialogCard"
            role="dialog"
            aria-modal="true"
            aria-label="Modifica appuntamento"
          >
            <h2 className="nb-dialogTitle">Modifica appuntamento</h2>
            <p className="nb-dialogSub">{appt.client}</p>
            <div className="nb-drawerForm">
              <label className="nb-drawerField">
                <span className="nb-drawerFieldLabel">Ora</span>
                <input
                  className="nb-drawerInput"
                  value={editDraft.timeLabel}
                  onChange={(e) => setEditDraft({ ...editDraft, timeLabel: e.target.value })}
                />
              </label>
              <label className="nb-drawerField">
                <span className="nb-drawerFieldLabel">Operatore</span>
                <select
                  className="nb-drawerInput"
                  value={editDraft.operator}
                  onChange={(e) => setEditDraft({ ...editDraft, operator: e.target.value })}
                >
                  <option value="Fabio">Fabio</option>
                  <option value="Laura">Laura</option>
                </select>
              </label>
              <label className="nb-drawerField">
                <span className="nb-drawerFieldLabel">Stato</span>
                <select
                  className="nb-drawerInput"
                  value={editDraft.status}
                  onChange={(e) =>
                    setEditDraft({ ...editDraft, status: e.target.value as ApptStatus })
                  }
                >
                  <option value="confermato">Confermato</option>
                  <option value="da_confermare">Da confermare</option>
                  <option value="completato">Completato</option>
                  <option value="annullato">Annullato</option>
                </select>
              </label>
              <label className="nb-drawerField">
                <span className="nb-drawerFieldLabel">Note</span>
                <textarea
                  className="nb-drawerInput"
                  rows={3}
                  value={editDraft.notes}
                  onChange={(e) => setEditDraft({ ...editDraft, notes: e.target.value })}
                />
              </label>
            </div>
            <div className="nb-dialogActions">
              <button type="button" className="nb-ghostBtn" onClick={() => setEditOpen(false)}>
                Annulla
              </button>
              <button
                type="button"
                className="nb-newBtn"
                disabled={busy}
                onClick={() => void saveEdit()}
              >
                Salva
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {deleteOpen && appt ? (
        <div className="nb-dialogRoot isOpen" role="presentation">
          <button
            type="button"
            className="nb-dialogBackdrop"
            aria-label="Annulla"
            onClick={() => setDeleteOpen(false)}
          />
          <div
            className="nb-dialogCard"
            role="dialog"
            aria-modal="true"
            aria-label="Elimina appuntamento"
          >
            <h2 className="nb-dialogTitle">Eliminare l&apos;appuntamento?</h2>
            <p className="nb-dialogSub">
              “{appt.client} · {appt.timeLabel}” verrà rimosso dal database locale.
            </p>
            <div className="nb-dialogActions">
              <button type="button" className="nb-ghostBtn" onClick={() => setDeleteOpen(false)}>
                Annulla
              </button>
              <button
                type="button"
                className="nb-newBtn"
                disabled={busy}
                onClick={() => void confirmDelete()}
              >
                Elimina
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
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
