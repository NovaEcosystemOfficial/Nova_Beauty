"use client";

import {
  Timestamp,
  collection,
  deleteDoc,
  doc,
  increment,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc
} from "firebase/firestore";
import { CalendarPlus, CheckCircle2, Clock, X } from "lucide-react";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { AppointmentCardMenu } from "@/components/appointments/AppointmentCardMenu";
import { Card } from "@/components/ui/Card";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { FormField } from "@/components/ui/FormField";
import { IconBadge } from "@/components/ui/IconBadge";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { SecondaryButton } from "@/components/ui/SecondaryButton";
import { Skeleton } from "@/components/ui/Skeleton";
import { SuccessMessage } from "@/components/ui/SuccessMessage";
import { TextAreaField } from "@/components/ui/TextAreaField";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";
import { db } from "@/lib/firebase/client";
import { appointmentsPath, clientsPath, servicesPath } from "@/lib/firebase/paths";
import { createNotification } from "@/lib/notifications/notifications";
import { cn } from "@/lib/utils/cn";
import type { AppointmentDocument, ClientDocument, ServiceDocument } from "@/types/firestore";

type AppointmentItem = AppointmentDocument & { id: string };
type ClientItem = ClientDocument & { id: string };
type ServiceItem = ServiceDocument & { id: string };
type AppointmentStatus = AppointmentDocument["status"];

type AppointmentFormState = {
  clientId: string;
  serviceId: string;
  serviceName: string;
  date: string;
  startTime: string;
  durationMinutes: string;
  price: string;
  notes: string;
  status: AppointmentStatus;
};

const emptyForm: AppointmentFormState = {
  clientId: "",
  serviceId: "",
  serviceName: "",
  date: new Date().toISOString().slice(0, 10),
  startTime: "09:00",
  durationMinutes: "60",
  price: "0",
  notes: "",
  status: "Prenotato"
};

const statuses: AppointmentStatus[] = ["Prenotato", "Confermato", "Completato", "Annullato"];

function toDateTime(date: string, time: string) {
  return new Date(`${date}T${time}:00`);
}

function toMinutes(time: string) {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

function addMinutes(time: string, durationMinutes: number) {
  const total = toMinutes(time) + durationMinutes;
  const hours = Math.floor(total / 60).toString().padStart(2, "0");
  const minutes = (total % 60).toString().padStart(2, "0");
  return `${hours}:${minutes}`;
}

function formatDate(timestamp: Timestamp) {
  return new Intl.DateTimeFormat("it-IT", {
    weekday: "short",
    day: "2-digit",
    month: "short"
  }).format(timestamp.toDate());
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR" }).format(value || 0);
}

function appointmentToForm(appointment: AppointmentItem): AppointmentFormState {
  return {
    clientId: appointment.clientId,
    serviceId: appointment.serviceId ?? "",
    serviceName: appointment.serviceName,
    date: appointment.date.toDate().toISOString().slice(0, 10),
    startTime: appointment.startTime,
    durationMinutes: String(appointment.durationMinutes),
    price: String(appointment.price),
    notes: appointment.notes ?? "",
    status: appointment.status
  };
}

export function AppointmentsManager({ androidChromeHidden = false }: { androidChromeHidden?: boolean }) {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [appointments, setAppointments] = useState<AppointmentItem[]>([]);
  const [clients, setClients] = useState<ClientItem[]>([]);
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [form, setForm] = useState<AppointmentFormState>(emptyForm);
  const [editingAppointmentId, setEditingAppointmentId] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [openMenuAppointmentId, setOpenMenuAppointmentId] = useState<string | null>(null);
  const [appointmentToDelete, setAppointmentToDelete] = useState<AppointmentItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const paths = useMemo(
    () =>
      user
        ? {
            appointments: appointmentsPath(user.uid),
            clients: clientsPath(user.uid),
            services: servicesPath(user.uid)
          }
        : null,
    [user]
  );

  useEffect(() => {
    if (!user || !paths) {
      return;
    }

    const unsubscribers = [
      onSnapshot(
        query(collection(db, paths.appointments), orderBy("date", "asc"), limit(200)),
        (snapshot) => {
          setAppointments(snapshot.docs.map((item) => ({ id: item.id, ...(item.data() as AppointmentDocument) })));
          setIsLoading(false);
        },
        (snapshotError) => {
          console.error("Appointments subscription failed", snapshotError);
          setError("Non siamo riusciti a caricare l'agenda.");
          setIsLoading(false);
        }
      ),
      onSnapshot(query(collection(db, paths.clients), orderBy("name", "asc"), limit(500)), (snapshot) => {
        setClients(snapshot.docs.map((item) => ({ id: item.id, ...(item.data() as ClientDocument) })));
      }),
      onSnapshot(query(collection(db, paths.services), orderBy("name", "asc"), limit(200)), (snapshot) => {
        setServices(snapshot.docs.map((item) => ({ id: item.id, ...(item.data() as ServiceDocument) })));
      })
    ];

    return () => unsubscribers.forEach((unsubscribe) => unsubscribe());
  }, [paths, user]);

  function updateField(field: keyof AppointmentFormState, value: string) {
    setForm((current) => {
      if (field === "serviceId") {
        const selectedService = services.find((service) => service.id === value);
        return {
          ...current,
          serviceId: value,
          serviceName: selectedService?.name ?? current.serviceName,
          durationMinutes:
            selectedService?.durationMinutes != null && selectedService.durationMinutes > 0
              ? String(selectedService.durationMinutes)
              : "",
          price: selectedService && typeof selectedService.price === "number" ? String(selectedService.price) : current.price
        };
      }

      return { ...current, [field]: value };
    });
    setSuccess("");
  }

  function hasConflict(startTime: string, durationMinutes: number, excludeAppointmentId?: string) {
    const start = toMinutes(startTime);
    const end = start + durationMinutes;

    return appointments.some((appointment) => {
      if (appointment.id === excludeAppointmentId) {
        return false;
      }

      const sameDate = appointment.date.toDate().toISOString().slice(0, 10) === form.date;
      if (!sameDate || appointment.status === "Annullato") {
        return false;
      }

      const appointmentStart = toMinutes(appointment.startTime);
      const appointmentEnd = toMinutes(appointment.endTime);
      return start < appointmentEnd && end > appointmentStart;
    });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!user || !paths) {
      setError("Sessione non valida. Accedi di nuovo.");
      return;
    }

    const selectedClient = clients.find((client) => client.id === form.clientId);
    const durationMinutes = Number(form.durationMinutes);
    const price = Number(form.price || 0);
    const serviceName = form.serviceName.trim();

    if (!selectedClient || !serviceName || !form.date || !form.startTime || !durationMinutes) {
      setError("Compila cliente, servizio, data, ora e durata.");
      return;
    }

    if (hasConflict(form.startTime, durationMinutes, editingAppointmentId ?? undefined)) {
      setError("Esiste gia un appuntamento in questa fascia oraria.");
      return;
    }

    setIsSubmitting(true);
    setError("");
    setSuccess("");

    const endTime = addMinutes(form.startTime, durationMinutes);
    const appointmentDate = Timestamp.fromDate(toDateTime(form.date, form.startTime));
    const clientNameSnapshot = `${selectedClient.name} ${selectedClient.surname ?? ""}`.trim();
    const appointmentPayload = {
      ownerId: user.uid,
      date: appointmentDate,
      clientId: selectedClient.id,
      clientNameSnapshot,
      serviceName,
      serviceId: form.serviceId || null,
      price,
      startTime: form.startTime,
      endTime,
      durationMinutes,
      notes: form.notes.trim() || null,
      status: form.status,
      updatedAt: serverTimestamp()
    };

    try {
      if (editingAppointmentId) {
        await updateDoc(doc(db, paths.appointments, editingAppointmentId), appointmentPayload);
        setSuccess("Appuntamento aggiornato correttamente.");
        showToast("Appuntamento aggiornato correttamente.");
      } else {
        const appointmentRef = doc(collection(db, paths.appointments));
        await setDoc(appointmentRef, {
          ...appointmentPayload,
          syncId: appointmentRef.id,
          reminderMinutes: 0,
          notificationIdentifier: null,
          createdAt: serverTimestamp()
        });

        await createNotification({
          userId: user.uid,
          title: "Nuovo appuntamento",
          description: `${clientNameSnapshot} - ${serviceName} - ${form.date} ${form.startTime}`,
          type: "appointment",
          priority: "normal",
          action: "/appointments"
        });

        setSuccess("Appuntamento creato correttamente.");
        showToast("Appuntamento creato correttamente.");
      }

      setForm(emptyForm);
      setEditingAppointmentId(null);
      setIsFormOpen(false);
    } catch (saveError) {
      console.error("Appointment save failed", saveError);
      setError(editingAppointmentId ? "Non siamo riusciti ad aggiornare l'appuntamento." : "Non siamo riusciti a salvare l'appuntamento.");
      showToast(editingAppointmentId ? "Appuntamento non aggiornato." : "Appuntamento non salvato.", "error");
    } finally {
      setIsSubmitting(false);
    }
  }

  function openCreateForm() {
    setEditingAppointmentId(null);
    setForm(emptyForm);
    setError("");
    setSuccess("");
    setIsFormOpen(true);
  }

  function openEditAppointment(appointment: AppointmentItem) {
    setEditingAppointmentId(appointment.id);
    setForm(appointmentToForm(appointment));
    setError("");
    setSuccess("");
    setIsFormOpen(true);
  }

  function duplicateAppointment(appointment: AppointmentItem) {
    setEditingAppointmentId(null);
    setForm({
      ...appointmentToForm(appointment),
      status: "Prenotato"
    });
    setError("");
    setSuccess("");
    setIsFormOpen(true);
  }

  function requestDeleteAppointment(appointment: AppointmentItem) {
    setAppointmentToDelete(appointment);
  }

  async function confirmDeleteAppointment() {
    if (!paths || !appointmentToDelete) {
      return;
    }

    setIsDeleting(true);

    try {
      await deleteDoc(doc(db, paths.appointments, appointmentToDelete.id));
      showToast("Appuntamento eliminato");
      setAppointmentToDelete(null);

      if (editingAppointmentId === appointmentToDelete.id) {
        setEditingAppointmentId(null);
        setForm(emptyForm);
        setIsFormOpen(false);
      }
    } catch (deleteError) {
      console.error("Appointment delete failed", deleteError);
      showToast("Impossibile eliminare l'appuntamento.", "error");
    } finally {
      setIsDeleting(false);
    }
  }

  async function updateStatus(appointment: AppointmentItem, status: AppointmentStatus) {
    if (!user || !paths) {
      return;
    }

    try {
      await updateDoc(doc(db, paths.appointments, appointment.id), {
        status,
        updatedAt: serverTimestamp()
      });

      if (status === "Completato" && appointment.status !== "Completato") {
        await updateDoc(doc(db, paths.clients, appointment.clientId), {
          appointmentsCount: increment(1),
          totalSpent: increment(appointment.price || 0),
          lastVisit: appointment.date,
          updatedAt: serverTimestamp()
        });
      }

      showToast("Stato appuntamento aggiornato.");
    } catch (statusError) {
      console.error("Appointment status update failed", statusError);
      showToast("Stato non aggiornato.", "error");
    }
  }

  return (
    <div className={cn("space-y-5", androidChromeHidden && "android-manager-compact")}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-[14px] text-beauty-muted">Agenda reale salvata in Firestore.</p>
        <PrimaryButton type="button" onClick={openCreateForm}>
          <CalendarPlus className="size-5" aria-hidden="true" />
          Nuovo appuntamento
        </PrimaryButton>
      </div>

      {isFormOpen ? (
        <Card className="space-y-5">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-[20px] font-semibold">{editingAppointmentId ? "Modifica appuntamento" : "Crea appuntamento"}</h2>
              <p className="mt-1 text-[14px] text-beauty-muted">Il controllo conflitti usa gli appuntamenti gia presenti nella stessa giornata.</p>
            </div>
            <SecondaryButton
              type="button"
              className="h-10 px-3"
              onClick={() => {
                setIsFormOpen(false);
                setEditingAppointmentId(null);
                setForm(emptyForm);
              }}
            >
              <X className="size-4" aria-hidden="true" />
            </SecondaryButton>
          </div>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="block space-y-2 text-[15px] font-medium">
                <span>Cliente</span>
                <select className="h-11 w-full rounded-beauty border border-beauty-border bg-beauty-card px-3 text-beauty-text outline-none" value={form.clientId} onChange={(event) => updateField("clientId", event.target.value)} required>
                  <option value="">Seleziona cliente</option>
                  {clients.map((client) => (
                    <option key={client.id} value={client.id}>{`${client.name} ${client.surname ?? ""}`.trim()}</option>
                  ))}
                </select>
              </label>
              <label className="block space-y-2 text-[15px] font-medium">
                <span>Servizio</span>
                <select className="h-11 w-full rounded-beauty border border-beauty-border bg-beauty-card px-3 text-beauty-text outline-none" value={form.serviceId} onChange={(event) => updateField("serviceId", event.target.value)}>
                  <option value="">Servizio libero</option>
                  {services.map((service) => (
                    <option key={service.id} value={service.id}>{service.name}</option>
                  ))}
                </select>
              </label>
              <FormField label="Nome servizio" name="serviceName" value={form.serviceName} onChange={(event) => updateField("serviceName", event.target.value)} required />
              <FormField label="Data" name="date" type="date" value={form.date} onChange={(event) => updateField("date", event.target.value)} required />
              <FormField label="Ora" name="startTime" type="time" value={form.startTime} onChange={(event) => updateField("startTime", event.target.value)} required />
              <FormField label="Durata minuti" name="durationMinutes" type="number" min={15} step={15} value={form.durationMinutes} onChange={(event) => updateField("durationMinutes", event.target.value)} required />
              <FormField label="Prezzo" name="price" type="number" min={0} step="0.01" value={form.price} onChange={(event) => updateField("price", event.target.value)} />
            </div>
            <TextAreaField label="Note" name="notes" value={form.notes} onChange={(event) => updateField("notes", event.target.value)} />
            {error ? <ErrorMessage message={error} /> : null}
            <PrimaryButton type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Salvataggio..." : editingAppointmentId ? "Salva modifiche" : "Crea appuntamento"}
            </PrimaryButton>
          </form>
        </Card>
      ) : null}

      {success ? <SuccessMessage message={success} /> : null}

      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>
      ) : appointments.length === 0 ? (
        <EmptyState title="Nessun appuntamento" description="Crea il primo appuntamento per iniziare a popolare l'agenda." />
      ) : (
        <div className="space-y-3">
          {appointments.map((appointment) => (
            <Card key={appointment.id} className="relative flex flex-col gap-4 pr-3 sm:flex-row sm:items-center sm:justify-between">
              <AppointmentCardMenu
                appointment={appointment}
                isOpen={openMenuAppointmentId === appointment.id}
                onToggle={setOpenMenuAppointmentId}
                onEdit={openEditAppointment}
                onDuplicate={duplicateAppointment}
                onDelete={requestDeleteAppointment}
              />
              <div className="flex min-w-0 gap-3 pr-10">
                <IconBadge icon={Clock} tone={appointment.status === "Completato" ? "mint" : "primary"} />
                <div>
                  <p className="text-[16px] font-bold">{appointment.clientNameSnapshot}</p>
                  <p className="text-[13px] text-beauty-muted">
                    {formatDate(appointment.date)} - {appointment.startTime}-{appointment.endTime} - {appointment.serviceName}
                  </p>
                  <p className="mt-1 text-[12px] text-beauty-subtle">
                    {appointment.durationMinutes} min - {formatCurrency(appointment.price)} - {appointment.notes ?? "Nessuna nota"}
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {statuses.map((status) => (
                  <SecondaryButton key={status} type="button" className="h-9 px-3 text-[13px]" onClick={() => updateStatus(appointment, status)}>
                    {status === appointment.status ? <CheckCircle2 className="size-4" aria-hidden="true" /> : null}
                    {status}
                  </SecondaryButton>
                ))}
              </div>
            </Card>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={Boolean(appointmentToDelete)}
        title="Eliminare questo appuntamento?"
        description="L'operazione è definitiva e non può essere annullata."
        confirmLabel="Elimina"
        isConfirming={isDeleting}
        onConfirm={() => void confirmDeleteAppointment()}
        onCancel={() => {
          if (!isDeleting) {
            setAppointmentToDelete(null);
          }
        }}
      />
    </div>
  );
}
