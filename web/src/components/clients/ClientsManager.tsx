"use client";

import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc
} from "firebase/firestore";
import { FileUp, MoreHorizontal, Plus, Search, Upload, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { FormField } from "@/components/ui/FormField";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { SecondaryButton } from "@/components/ui/SecondaryButton";
import { SuccessMessage } from "@/components/ui/SuccessMessage";
import { TextAreaField } from "@/components/ui/TextAreaField";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";
import { db } from "@/lib/firebase/client";
import { clientsPath } from "@/lib/firebase/paths";
import { deleteClientDiarioData } from "@/lib/firebase/diary-cleanup";
import { ClientsCompactList } from "@/components/clients/ClientsCompactList";
import { routes } from "@/lib/constants/routes";
import { recordRecentClient, type ClientListSegment } from "@/lib/utils/clients-list";
import { cn } from "@/lib/utils/cn";
import type { ClientDocument } from "@/types/firestore";

type ClientItem = ClientDocument & { id: string };
type SortMode = "name" | "createdAt" | "lastVisit" | "totalSpent";

type ClientFormState = {
  name: string;
  surname: string;
  phone: string;
  email: string;
  birthDate: string;
  notes: string;
};

type ContactPickerContact = {
  name?: string[];
  email?: string[];
  tel?: string[];
};

type ContactPreview = {
  id: string;
  selected: boolean;
  name: string;
  surname: string;
  phone: string;
  email: string;
  notes: string;
  source: "contacts" | "vcard";
  duplicate: boolean;
};

const emptyClientForm: ClientFormState = {
  name: "",
  surname: "",
  phone: "",
  email: "",
  birthDate: "",
  notes: ""
};

function normalize(value: string | null | undefined) {
  return (value ?? "").trim().toLowerCase();
}

function splitFullName(fullName: string) {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  return {
    name: parts[0] ?? "",
    surname: parts.slice(1).join(" ")
  };
}

function unfoldVcardLines(content: string) {
  return content.replace(/\r\n/g, "\n").replace(/\r/g, "\n").split("\n").reduce<string[]>((lines, line) => {
    if (/^[ \t]/.test(line) && lines.length) {
      lines[lines.length - 1] += line.slice(1);
      return lines;
    }

    lines.push(line);
    return lines;
  }, []);
}

function unescapeVcardValue(value: string) {
  return value
    .replace(/\\n/gi, "\n")
    .replace(/\\,/g, ",")
    .replace(/\\;/g, ";")
    .replace(/\\\\/g, "\\")
    .trim();
}

function getVcardFieldName(line: string) {
  const separatorIndex = line.indexOf(":");
  if (separatorIndex < 0) {
    return "";
  }

  return line.slice(0, separatorIndex).split(";")[0].toUpperCase();
}

function getVcardFieldValue(line: string) {
  const separatorIndex = line.indexOf(":");
  if (separatorIndex < 0) {
    return "";
  }

  return unescapeVcardValue(line.slice(separatorIndex + 1));
}

function parseVcardContacts(content: string) {
  const lines = unfoldVcardLines(content);
  const cards: string[][] = [];
  let currentCard: string[] = [];

  lines.forEach((line) => {
    const fieldName = getVcardFieldName(line);
    if (fieldName === "BEGIN" && getVcardFieldValue(line).toUpperCase() === "VCARD") {
      currentCard = [];
      return;
    }

    if (fieldName === "END" && getVcardFieldValue(line).toUpperCase() === "VCARD") {
      if (currentCard.length) {
        cards.push(currentCard);
      }
      currentCard = [];
      return;
    }

    if (currentCard) {
      currentCard.push(line);
    }
  });

  return cards
    .map((card, index) => {
      const fullName = getVcardFieldValue(card.find((line) => getVcardFieldName(line) === "FN") ?? "");
      const structuredName = getVcardFieldValue(card.find((line) => getVcardFieldName(line) === "N") ?? "");
      const phone = getVcardFieldValue(card.find((line) => getVcardFieldName(line) === "TEL") ?? "");
      const email = getVcardFieldValue(card.find((line) => getVcardFieldName(line) === "EMAIL") ?? "");
      const notes = getVcardFieldValue(card.find((line) => getVcardFieldName(line) === "NOTE") ?? "");

      const nameParts = structuredName.split(";").map((part) => part.trim());
      const fromStructuredName = {
        name: [nameParts[1], nameParts[2]].filter(Boolean).join(" "),
        surname: nameParts[0] ?? ""
      };
      const fromFullName = splitFullName(fullName);
      const name = fromStructuredName.name || fromFullName.name || fullName || "Contatto";
      const surname = fromStructuredName.surname || fromFullName.surname;

      return {
        id: `vcard-${index}-${phone}-${email}-${name}`,
        selected: true,
        name,
        surname,
        phone,
        email,
        notes,
        source: "vcard" as const,
        duplicate: false
      };
    })
    .filter((contact) => contact.name || contact.phone || contact.email);
}

function formatImportSummary(added: number, alreadyPresent: number, ignored: number) {
  const parts = [`${added} aggiunti`, `${alreadyPresent} già presenti`];

  if (ignored > 0) {
    parts.push(`${ignored} ignorati`);
  }

  return `Import completato: ${parts.join(", ")}.`;
}

export function ClientsManager({ androidChromeHidden = false }: { androidChromeHidden?: boolean }) {
  const { user } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [clients, setClients] = useState<ClientItem[]>([]);
  const [form, setForm] = useState<ClientFormState>(emptyClientForm);
  const [editingClientId, setEditingClientId] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [search, setSearch] = useState("");
  const [sortMode, setSortMode] = useState<SortMode>("name");
  const [listSegment, setListSegment] = useState<ClientListSegment>("tutti");
  const [recentRefreshKey, setRecentRefreshKey] = useState(0);
  const [contactImportError, setContactImportError] = useState("");
  const [contactImportNotice, setContactImportNotice] = useState("");
  const [contactPreview, setContactPreview] = useState<ContactPreview[]>([]);
  const [isReadingVcard, setIsReadingVcard] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isActionsMenuOpen, setIsActionsMenuOpen] = useState(false);
  const vcardInputRef = useRef<HTMLInputElement>(null);
  const actionsMenuRef = useRef<HTMLDivElement>(null);
  const handledEditRef = useRef<string | null>(null);

  const clientsCollectionPath = useMemo(() => (user ? clientsPath(user.uid) : null), [user]);
  const isEditing = Boolean(editingClientId);
  const hasCompletedImport = useMemo(
    () => clients.some((client) => client.source === "contacts" || client.source === "vcard"),
    [clients]
  );
  const supportsContactPicker = useMemo(() => {
    if (typeof navigator === "undefined") {
      return false;
    }

    return Boolean(
      (navigator as Navigator & { contacts?: { select: (properties: string[], options: { multiple: boolean }) => Promise<ContactPickerContact[]> } }).contacts?.select
    );
  }, []);

  useEffect(() => {
    const editClientId = searchParams.get("edit");
    if (!editClientId || !clients.length || handledEditRef.current === editClientId) {
      return;
    }

    const client = clients.find((item) => item.id === editClientId);
    if (!client) {
      return;
    }

    handledEditRef.current = editClientId;
    setEditingClientId(client.id);
    setForm({
      name: client.name,
      surname: client.surname ?? "",
      phone: client.phone,
      email: client.email ?? "",
      birthDate: client.birthDate ?? "",
      notes: client.notes ?? ""
    });
    setIsFormOpen(true);
    router.replace(routes.clients);
  }, [clients, router, searchParams]);

  useEffect(() => {
    if (!isActionsMenuOpen) {
      return;
    }

    function handlePointerDown(event: MouseEvent) {
      if (!actionsMenuRef.current?.contains(event.target as Node)) {
        setIsActionsMenuOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsActionsMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isActionsMenuOpen]);

  useEffect(() => {
    if (!user || !clientsCollectionPath) {
      return;
    }

    setIsLoading(true);
    setError("");

    const clientsQuery = query(collection(db, clientsCollectionPath), orderBy("name", "asc"));
    const unsubscribe = onSnapshot(
      clientsQuery,
      (snapshot) => {
        setClients(
          snapshot.docs.map((clientDoc) => ({
            id: clientDoc.id,
            ...(clientDoc.data() as ClientDocument)
          }))
        );
        setIsLoading(false);
      },
      (snapshotError) => {
        console.error("Clients subscription failed", snapshotError);
        setError("Non siamo riusciti a caricare i clienti. Controlla la connessione e riprova.");
        showToast("Non siamo riusciti a caricare i clienti.", "error");
        setIsLoading(false);
      }
    );

    return unsubscribe;
  }, [clientsCollectionPath, showToast, user]);

  const filteredClients = useMemo(() => {
    const term = normalize(search);
    const filtered = clients.filter((client) => {
      const haystack = [client.name, client.surname, client.phone, client.email, client.notes ?? ""].join(" ");
      return normalize(haystack).includes(term);
    });

    return filtered.sort((a, b) => {
      if (sortMode === "createdAt") {
        return (b.createdAt?.toMillis?.() ?? 0) - (a.createdAt?.toMillis?.() ?? 0);
      }

      if (sortMode === "lastVisit") {
        return (b.lastVisit?.toMillis?.() ?? 0) - (a.lastVisit?.toMillis?.() ?? 0);
      }

      if (sortMode === "totalSpent") {
        return (b.totalSpent ?? 0) - (a.totalSpent ?? 0);
      }

      return `${a.name} ${a.surname}`.localeCompare(`${b.name} ${b.surname}`);
    });
  }, [clients, search, sortMode]);

  function hasDuplicate(phone: string, email: string, excludedClientId?: string) {
    const normalizedPhone = normalize(phone).replace(/\s+/g, "");
    const normalizedEmail = normalize(email);

    return clients.some((client) => {
      if (client.id === excludedClientId) {
        return false;
      }

      const clientPhone = normalize(client.phone).replace(/\s+/g, "");
      const clientEmail = normalize(client.email);
      return Boolean((normalizedPhone && clientPhone === normalizedPhone) || (normalizedEmail && clientEmail === normalizedEmail));
    });
  }

  function updateField(field: keyof ClientFormState, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
    setSuccess("");
  }

  function openNewClientForm() {
    setEditingClientId(null);
    setForm(emptyClientForm);
    setError("");
    setSuccess("");
    setIsFormOpen(true);
  }

  function openEditClientForm(client: ClientItem) {
    setEditingClientId(client.id);
    setForm({
      name: client.name,
      surname: client.surname ?? "",
      phone: client.phone,
      email: client.email ?? "",
      birthDate: client.birthDate ?? "",
      notes: client.notes ?? ""
    });
    setError("");
    setSuccess("");
    setIsFormOpen(true);
  }

  function closeForm() {
    setIsFormOpen(false);
    setEditingClientId(null);
    setForm(emptyClientForm);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!user || !clientsCollectionPath) {
      setError("Sessione non valida. Accedi di nuovo per salvare il cliente.");
      return;
    }

    if (!form.name.trim()) {
      setError("Inserisci il nome del cliente.");
      return;
    }

    if (hasDuplicate(form.phone, form.email, editingClientId ?? undefined)) {
      setError("Esiste gia un cliente con lo stesso telefono o la stessa email.");
      return;
    }

    setIsSubmitting(true);
    setError("");
    setSuccess("");

    const clientPayload = {
      ownerId: user.uid,
      name: form.name.trim(),
      surname: form.surname.trim(),
      phone: form.phone.trim(),
      email: form.email.trim(),
      birthDate: form.birthDate || null,
      notes: form.notes.trim() || null,
      photoUrl: null,
      source: "manual" as const,
      updatedAt: serverTimestamp()
    };

    try {
      if (editingClientId) {
        await updateDoc(doc(db, clientsCollectionPath, editingClientId), clientPayload);
        setSuccess("Cliente aggiornato correttamente.");
        showToast("Cliente aggiornato correttamente.");
      } else {
        const clientRef = doc(collection(db, clientsCollectionPath));
        await setDoc(clientRef, {
          ...clientPayload,
          syncId: clientRef.id,
          lastVisit: null,
          appointmentsCount: 0,
          totalSpent: 0,
          createdAt: serverTimestamp()
        });
        setSuccess("Cliente creato correttamente.");
        showToast("Cliente creato correttamente.");
      }

      closeForm();
    } catch (saveError) {
      console.error("Client save failed", saveError);
      setError("Non siamo riusciti a salvare il cliente. Controlla i dati e riprova.");
      showToast("Non siamo riusciti a salvare il cliente.", "error");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete(client: ClientItem) {
    if (!clientsCollectionPath) {
      return;
    }

    const shouldDelete = window.confirm(`Eliminare ${client.name} ${client.surname ?? ""}? Questa azione non puo essere annullata.`);

    if (!shouldDelete) {
      return;
    }

    setError("");
    setSuccess("");

    try {
      if (user) {
        await deleteClientDiarioData(user.uid, client.id);
      }

      await deleteDoc(doc(db, clientsCollectionPath, client.id));
      setSuccess("Cliente eliminato.");
      showToast("Cliente eliminato.");
      if (editingClientId === client.id) {
        closeForm();
      }
    } catch (deleteError) {
      console.error("Client delete failed", deleteError);
      setError("Non siamo riusciti a eliminare il cliente. Riprova tra poco.");
      showToast("Non siamo riusciti a eliminare il cliente.", "error");
    }
  }

  async function handleToggleFavorite(client: ClientItem) {
    if (!clientsCollectionPath) {
      return;
    }

    try {
      await updateDoc(doc(db, clientsCollectionPath, client.id), {
        favorite: !client.favorite,
        updatedAt: serverTimestamp()
      });
      showToast(client.favorite ? "Cliente rimosso dai preferiti." : "Cliente aggiunto ai preferiti.");
    } catch (favoriteError) {
      console.error("Favorite toggle failed", favoriteError);
      showToast("Non siamo riusciti ad aggiornare i preferiti.", "error");
    }
  }

  function openClientSheet(client: ClientItem) {
    if (user) {
      recordRecentClient(user.uid, client.id);
      setRecentRefreshKey((current) => current + 1);
    }

    router.push(routes.clientSheet(client.id));
  }

  async function handleContactImport() {
    setContactImportError("");
    setContactImportNotice("");

    const contactsApi = (navigator as Navigator & {
      contacts?: {
        select: (properties: string[], options: { multiple: boolean }) => Promise<ContactPickerContact[]>;
      };
    }).contacts;

    if (!contactsApi?.select) {
      setContactImportNotice("Il tuo dispositivo non supporta l'importazione diretta dei contatti. Usa Importa vCard (.vcf).");
      return;
    }

    try {
      const pickedContacts = await contactsApi.select(["name", "email", "tel"], { multiple: true });
      const preview = pickedContacts.map((contact, index) => {
        const fullName = contact.name?.[0] ?? "";
        const splitName = splitFullName(fullName);
        const phone = contact.tel?.[0] ?? "";
        const email = contact.email?.[0] ?? "";

        return {
          id: `${index}-${phone}-${email}`,
          selected: !hasDuplicate(phone, email),
          name: splitName.name || fullName || "Contatto",
          surname: splitName.surname,
          phone,
          email,
          notes: "",
          source: "contacts" as const,
          duplicate: hasDuplicate(phone, email)
        };
      });

      setContactPreview(preview);
    } catch (importError) {
      console.error("Contact import failed", importError);
      setContactImportError("Importazione contatti annullata o non disponibile.");
    }
  }

  async function handleVcardFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setIsReadingVcard(true);
    setContactImportError("");
    setContactImportNotice("");
    setSuccess("");

    try {
      const text = await file.text();
      const parsedContacts = parseVcardContacts(text).map((contact) => ({
        ...contact,
        selected: !hasDuplicate(contact.phone, contact.email),
        duplicate: hasDuplicate(contact.phone, contact.email)
      }));

      if (!parsedContacts.length) {
        setContactImportError("Nessun contatto valido trovato nel file vCard selezionato.");
        showToast("Nessun contatto valido trovato.", "error");
        return;
      }

      setContactPreview(parsedContacts);
      setContactImportNotice("I contatti vengono letti dal file selezionato e salvati solo dopo la tua conferma.");
      showToast("File vCard letto correttamente.");
    } catch (vcardError) {
      console.error("vCard import failed", vcardError);
      setContactImportError("Non siamo riusciti a leggere il file vCard selezionato.");
      showToast("Importazione vCard non completata.", "error");
    } finally {
      setIsReadingVcard(false);
      event.target.value = "";
    }
  }

  async function saveSelectedContacts() {
    if (!user || !clientsCollectionPath) {
      return;
    }

    const selectedContacts = contactPreview.filter((contact) => contact.selected && !contact.duplicate);
    const alreadyPresent = contactPreview.filter((contact) => contact.duplicate).length;
    const ignored = contactPreview.filter((contact) => !contact.duplicate && !contact.selected).length;

    if (!selectedContacts.length) {
      setContactImportError("Seleziona almeno un contatto non duplicato.");
      return;
    }

    try {
      await Promise.all(
        selectedContacts.map((contact) => {
          const clientRef = doc(collection(db, clientsCollectionPath));
          return setDoc(clientRef, {
            ownerId: user.uid,
            syncId: clientRef.id,
            name: contact.name,
            surname: contact.surname,
            phone: contact.phone,
            email: contact.email,
            birthDate: null,
            notes: contact.notes || null,
            photoUrl: null,
            lastVisit: null,
            appointmentsCount: 0,
            totalSpent: 0,
            source: contact.source,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          });
        })
      );

      const summary = formatImportSummary(selectedContacts.length, alreadyPresent, ignored);

      setContactPreview([]);
      setSuccess(summary);
      showToast(summary);
    } catch (importSaveError) {
      console.error("Contact import save failed", importSaveError);
      setContactImportError("Non siamo riusciti a salvare i contatti selezionati.");
      showToast("Importazione non completata.", "error");
    }
  }

  function openVcardImport() {
    setIsActionsMenuOpen(false);
    vcardInputRef.current?.click();
  }

  function openContactImport() {
    setIsActionsMenuOpen(false);
    void handleContactImport();
  }

  return (
    <div className={cn("space-y-5", androidChromeHidden && "android-manager-compact")}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-[14px] text-beauty-muted">Anagrafica completa salvata nel namespace NovaBeauty.</p>
        <div className="flex flex-wrap items-center justify-end gap-2">
          <input
            ref={vcardInputRef}
            className="hidden"
            type="file"
            accept=".vcf,text/vcard,text/x-vcard"
            onChange={handleVcardFileChange}
          />
          {hasCompletedImport ? (
            <div className="relative" ref={actionsMenuRef}>
              <SecondaryButton
                type="button"
                onClick={() => setIsActionsMenuOpen((current) => !current)}
                className="h-10 px-3"
                aria-expanded={isActionsMenuOpen}
                aria-haspopup="menu"
                aria-label="Altre azioni"
              >
                <MoreHorizontal className="size-4" aria-hidden="true" />
                Altre azioni
              </SecondaryButton>
              {isActionsMenuOpen ? (
                <Card className="absolute right-0 top-full z-20 mt-2 w-56 space-y-2 p-2 shadow-beauty-floating">
                  <SecondaryButton type="button" onClick={openVcardImport} disabled={isReadingVcard} className="h-10 w-full justify-start px-3">
                    <FileUp className="size-4" aria-hidden="true" />
                    {isReadingVcard ? "Lettura..." : "Importa vCard (.vcf)"}
                  </SecondaryButton>
                  {supportsContactPicker ? (
                    <SecondaryButton type="button" onClick={openContactImport} className="h-10 w-full justify-start px-3">
                      <Upload className="size-4" aria-hidden="true" />
                      Importa da rubrica
                    </SecondaryButton>
                  ) : null}
                </Card>
              ) : null}
            </div>
          ) : (
            <>
              <SecondaryButton type="button" onClick={openVcardImport} disabled={isReadingVcard}>
                <FileUp size={18} aria-hidden="true" />
                {isReadingVcard ? "Lettura..." : "Importa vCard (.vcf)"}
              </SecondaryButton>
              <SecondaryButton type="button" onClick={openContactImport}>
                <Upload size={18} aria-hidden="true" />
                Importa da rubrica
              </SecondaryButton>
            </>
          )}
          <PrimaryButton type="button" onClick={openNewClientForm}>
            <Plus size={18} aria-hidden="true" />
            Nuovo cliente
          </PrimaryButton>
        </div>
      </div>

      <Card className="sticky top-0 z-20 -mx-beauty-page space-y-3 border-beauty-border/60 bg-beauty-surface/95 px-beauty-page py-3 backdrop-blur-xl sm:-mx-6 sm:px-6">
        <div className="grid gap-3 md:grid-cols-[1fr_220px]">
          <label className="relative block">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-beauty-muted" />
            <input
              className="h-11 w-full rounded-beauty border border-beauty-border bg-beauty-card pl-10 pr-3 text-[15px] text-beauty-text outline-none transition focus:border-beauty-primary focus:bg-beauty-surface"
              placeholder="Cerca per nome, telefono, email o note"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </label>
          <select
            className="h-11 rounded-beauty border border-beauty-border bg-beauty-card px-3 text-[15px] text-beauty-text outline-none"
            value={sortMode}
            onChange={(event) => setSortMode(event.target.value as SortMode)}
          >
            <option value="name">Ordina per nome</option>
            <option value="createdAt">Piu recenti</option>
            <option value="lastVisit">Ultima visita</option>
            <option value="totalSpent">Totale speso</option>
          </select>
        </div>

        <div className="flex gap-1 rounded-beauty border border-beauty-border bg-beauty-card p-1">
          {(
            [
              { id: "recenti", label: "Recenti" },
              { id: "preferiti", label: "Preferiti" },
              { id: "tutti", label: "Tutti" }
            ] as const
          ).map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setListSegment(item.id)}
              className={cn(
                "flex-1 rounded-beauty px-2 py-2 text-[13px] font-semibold transition",
                listSegment === item.id ? "bg-beauty-primary/12 text-beauty-primary" : "text-beauty-muted"
              )}
            >
              {item.label}
            </button>
          ))}
        </div>
      </Card>

      {contactImportNotice ? <Card className="text-[14px] leading-6 text-beauty-muted">{contactImportNotice}</Card> : null}
      {contactImportError ? <ErrorMessage message={contactImportError} /> : null}

      {contactPreview.length ? (
        <Card className="space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-[20px] font-semibold">Preview contatti</h2>
              <p className="mt-1 text-[14px] text-beauty-muted">Seleziona i contatti da importare. I duplicati sono esclusi.</p>
            </div>
            <SecondaryButton type="button" onClick={() => setContactPreview([])} className="h-10 px-3">
              <X className="size-4" aria-hidden="true" />
            </SecondaryButton>
          </div>
          <div className="space-y-2">
            {contactPreview.map((contact) => (
              <label key={contact.id} className="flex items-start gap-3 rounded-beauty bg-beauty-card p-3">
                <input
                  type="checkbox"
                  className="mt-1"
                  checked={contact.selected}
                  disabled={contact.duplicate}
                  onChange={(event) =>
                    setContactPreview((current) =>
                      current.map((item) => (item.id === contact.id ? { ...item, selected: event.target.checked } : item))
                    )
                  }
                />
                <span className="min-w-0">
                  <span className="block font-semibold text-beauty-text">{`${contact.name} ${contact.surname}`.trim()}</span>
                  <span className="block text-[13px] text-beauty-muted">{[contact.phone, contact.email].filter(Boolean).join(" - ")}</span>
                  {contact.notes ? <span className="mt-1 block text-[12px] text-beauty-subtle">{contact.notes}</span> : null}
                  {contact.duplicate ? <span className="text-[12px] text-beauty-danger">Duplicato rilevato</span> : null}
                </span>
              </label>
            ))}
          </div>
          <PrimaryButton type="button" onClick={saveSelectedContacts}>
            Importa selezionati
          </PrimaryButton>
        </Card>
      ) : null}

      {isFormOpen ? (
        <Card className="space-y-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-[20px] font-semibold">{isEditing ? "Modifica cliente" : "Nuovo cliente"}</h2>
              <p className="mt-1 text-[14px] text-beauty-muted">Scheda cliente completa per storico e appuntamenti.</p>
            </div>
            <SecondaryButton type="button" onClick={closeForm} className="h-10 px-3" aria-label="Chiudi form">
              <X size={17} aria-hidden="true" />
            </SecondaryButton>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="grid gap-4 md:grid-cols-2">
              <FormField label="Nome" name="name" value={form.name} onChange={(event) => updateField("name", event.target.value)} disabled={isSubmitting} required />
              <FormField label="Cognome" name="surname" value={form.surname} onChange={(event) => updateField("surname", event.target.value)} disabled={isSubmitting} />
              <FormField label="Telefono" name="phone" type="tel" value={form.phone} onChange={(event) => updateField("phone", event.target.value)} disabled={isSubmitting} />
              <FormField label="Email" name="email" type="email" value={form.email} onChange={(event) => updateField("email", event.target.value)} disabled={isSubmitting} />
              <FormField label="Data nascita" name="birthDate" type="date" value={form.birthDate} onChange={(event) => updateField("birthDate", event.target.value)} disabled={isSubmitting} />
            </div>
            <TextAreaField label="Note" name="notes" value={form.notes} onChange={(event) => updateField("notes", event.target.value)} placeholder="Preferenze, allergie, promemoria utili." disabled={isSubmitting} />
            <div className="flex flex-col gap-3 sm:flex-row">
              <PrimaryButton type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Salvataggio..." : isEditing ? "Salva modifiche" : "Crea cliente"}
              </PrimaryButton>
              <SecondaryButton type="button" onClick={closeForm} disabled={isSubmitting}>
                Annulla
              </SecondaryButton>
            </div>
          </form>
        </Card>
      ) : null}

      {error ? <ErrorMessage message={error} /> : null}
      {success ? <SuccessMessage message={success} /> : null}

      <ClientsCompactList
        filteredClients={filteredClients}
        isLoading={isLoading}
        search={search}
        sortMode={sortMode}
        segment={listSegment}
        userId={user?.uid}
        recentRefreshKey={recentRefreshKey}
        onOpenClient={openClientSheet}
        onEditClient={openEditClientForm}
        onDeleteClient={handleDelete}
        onToggleFavorite={handleToggleFavorite}
      />
    </div>
  );
}
