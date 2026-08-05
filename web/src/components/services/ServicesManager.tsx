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
import { CheckCircle2, Edit3, PackagePlus, Plus, Search, Sparkles, Trash2, X } from "lucide-react";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Card } from "@/components/ui/Card";
import { DangerButton } from "@/components/ui/DangerButton";
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
import { servicesPath } from "@/lib/firebase/paths";
import {
  buildTemplateImportSummary,
  formatServiceMeta,
  getServiceCategoryIcon
} from "@/lib/utils/service-display";
import { cn } from "@/lib/utils/cn";
import type { ServiceDocument } from "@/types/firestore";

type ServiceItem = ServiceDocument & { id: string };

type ServiceFormState = {
  name: string;
  category: string;
  durationMinutes: string;
  price: string;
  description: string;
  active: boolean;
};

type TemplateService = {
  name: string;
  category: string;
  active?: boolean;
};

type TemplatePreviewItem = TemplateService & {
  id: string;
  selected: boolean;
  duplicate: boolean;
};

const templateId = "beauty-center-essential";

const essentialBeautyTemplate: TemplateService[] = [
  { name: "Pulizia viso", category: "Viso e corpo" },
  { name: "Scrub esfoliante", category: "Viso e corpo" },
  { name: "Fanghi", category: "Viso e corpo" },
  { name: "Pressoterapia", category: "Viso e corpo" },
  { name: "Vacuum", category: "Viso e corpo" },
  { name: "Massaggio rilassante", category: "Viso e corpo" },
  { name: "Massaggio viso", category: "Viso e corpo" },
  { name: "Massaggio drenante", category: "Viso e corpo" },
  { name: "Massaggio esfoliante", category: "Viso e corpo" },
  { name: "Massaggio anticellulite", category: "Viso e corpo" },
  { name: "Massaggio linfodrenante", category: "Viso e corpo" },
  { name: "Cera completa", category: "Epilazione" },
  { name: "Cera inguine", category: "Epilazione" },
  { name: "Cera braccia", category: "Epilazione" },
  { name: "Cera gambaletto", category: "Epilazione" },
  { name: "Cera sopracciglia", category: "Epilazione" },
  { name: "Cera ascelle", category: "Epilazione" },
  { name: "Cera baffetto", category: "Epilazione" },
  { name: "Epilazione viso", category: "Epilazione" },
  { name: "Filo arabo", category: "Epilazione" },
  { name: "Ricostruzione in gel o acrygel", category: "Unghie e mani/piedi" },
  { name: "Refill gel o acrygel", category: "Unghie e mani/piedi" },
  { name: "Semipermanente mani", category: "Unghie e mani/piedi" },
  { name: "Semipermanente piedi", category: "Unghie e mani/piedi" },
  { name: "Pedicure estetico", category: "Unghie e mani/piedi" },
  { name: "Pedicure curativo", category: "Unghie e mani/piedi" },
  { name: "Manicure", category: "Unghie e mani/piedi" },
  { name: "Trucco permanente sopracciglia", category: "Trucco e PMU" },
  { name: "Trucco permanente labbra", category: "Trucco e PMU" },
  { name: "Trucco cerimonia", category: "Trucco e PMU" },
  { name: "Laminazione ciglia", category: "Ciglia e sopracciglia" },
  { name: "Laminazione sopracciglia", category: "Ciglia e sopracciglia" }
];

const emptyForm: ServiceFormState = {
  name: "",
  category: "",
  durationMinutes: "",
  price: "",
  description: "",
  active: true
};

function normalize(value: string | null | undefined) {
  return (value ?? "").trim().toLowerCase();
}

function parseOptionalDuration(value: string) {
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  const duration = Number(trimmed);
  return Number.isFinite(duration) && duration > 0 ? duration : null;
}

function parseOptionalPrice(value: string) {
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  const price = Number(trimmed);
  return Number.isFinite(price) && price >= 0 ? price : null;
}

export function ServicesManager({ androidChromeHidden = false }: { androidChromeHidden?: boolean }) {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [form, setForm] = useState<ServiceFormState>(emptyForm);
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [templatePreview, setTemplatePreview] = useState<TemplatePreviewItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const collectionPath = useMemo(() => (user ? servicesPath(user.uid) : null), [user]);
  const isEditing = Boolean(editingServiceId);

  useEffect(() => {
    if (!collectionPath) {
      return;
    }

    const unsubscribe = onSnapshot(
      query(collection(db, collectionPath), orderBy("category", "asc"), orderBy("name", "asc")),
      (snapshot) => {
        setServices(snapshot.docs.map((serviceDoc) => ({ id: serviceDoc.id, ...(serviceDoc.data() as ServiceDocument) })));
        setIsLoading(false);
      },
      (snapshotError) => {
        console.error("Services subscription failed", snapshotError);
        setError("Non siamo riusciti a caricare i servizi.");
        setIsLoading(false);
      }
    );

    return unsubscribe;
  }, [collectionPath]);

  const filteredServices = useMemo(() => {
    const term = normalize(search);
    return services.filter((service) => normalize(`${service.name} ${service.category} ${service.description ?? ""}`).includes(term));
  }, [search, services]);

  const categories = useMemo(() => Array.from(new Set(filteredServices.map((service) => service.category || "Senza categoria"))), [filteredServices]);

  function hasDuplicate(name: string, category: string, excludedServiceId?: string) {
    const normalizedName = normalize(name);
    const normalizedCategory = normalize(category);
    return services.some(
      (service) =>
        service.id !== excludedServiceId &&
        normalize(service.name) === normalizedName &&
        normalize(service.category) === normalizedCategory
    );
  }

  function updateField(field: keyof ServiceFormState, value: string | boolean) {
    setForm((current) => ({ ...current, [field]: value }));
    setSuccess("");
  }

  function openNewServiceForm() {
    setEditingServiceId(null);
    setForm(emptyForm);
    setError("");
    setSuccess("");
    setIsFormOpen(true);
  }

  function openEditServiceForm(service: ServiceItem) {
    setEditingServiceId(service.id);
    setForm({
      name: service.name,
      category: service.category ?? "",
      durationMinutes: typeof service.durationMinutes === "number" && service.durationMinutes > 0 ? String(service.durationMinutes) : "",
      price: typeof service.price === "number" ? String(service.price) : "",
      description: service.description ?? "",
      active: service.active ?? true
    });
    setError("");
    setSuccess("");
    setIsFormOpen(true);
  }

  function closeForm() {
    setIsFormOpen(false);
    setEditingServiceId(null);
    setForm(emptyForm);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!user || !collectionPath) {
      setError("Sessione non valida. Accedi di nuovo.");
      return;
    }

    if (!form.name.trim() || !form.category.trim()) {
      setError("Compila nome e categoria.");
      return;
    }

    const durationMinutes = parseOptionalDuration(form.durationMinutes);
    if (form.durationMinutes.trim() && durationMinutes === null) {
      setError("La durata deve essere un numero positivo oppure lasciata vuota.");
      return;
    }

    const price = parseOptionalPrice(form.price);
    if (form.price.trim() && price === null) {
      setError("Il prezzo deve essere un numero valido oppure lasciato vuoto.");
      return;
    }

    if (hasDuplicate(form.name, form.category, editingServiceId ?? undefined)) {
      setError("Esiste gia un servizio con questo nome e categoria.");
      return;
    }

    setIsSubmitting(true);
    setError("");
    setSuccess("");

    const payload = {
      ownerId: user.uid,
      name: form.name.trim(),
      category: form.category.trim(),
      durationMinutes,
      price,
      description: form.description.trim() || null,
      active: form.active,
      source: "manual" as const,
      templateId: null,
      updatedAt: serverTimestamp()
    };

    try {
      if (editingServiceId) {
        await updateDoc(doc(db, collectionPath, editingServiceId), payload);
        setSuccess("Servizio aggiornato.");
        showToast("Servizio aggiornato.");
      } else {
        const serviceRef = doc(collection(db, collectionPath));
        await setDoc(serviceRef, {
          ...payload,
          syncId: serviceRef.id,
          createdAt: serverTimestamp()
        });
        setSuccess("Servizio creato.");
        showToast("Servizio creato.");
      }

      closeForm();
    } catch (saveError) {
      console.error("Service save failed", saveError);
      setError("Non siamo riusciti a salvare il servizio.");
      showToast("Servizio non salvato.", "error");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete(service: ServiceItem) {
    if (!collectionPath) {
      return;
    }

    if (!window.confirm(`Eliminare ${service.name}?`)) {
      return;
    }

    try {
      await deleteDoc(doc(db, collectionPath, service.id));
      setSuccess("Servizio eliminato.");
      showToast("Servizio eliminato.");
    } catch (deleteError) {
      console.error("Service delete failed", deleteError);
      setError("Non siamo riusciti a eliminare il servizio.");
      showToast("Servizio non eliminato.", "error");
    }
  }

  function openTemplatePreview() {
    setTemplatePreview(
      essentialBeautyTemplate.map((service, index) => ({
        ...service,
        id: `${templateId}-${index}`,
        selected: !hasDuplicate(service.name, service.category),
        duplicate: hasDuplicate(service.name, service.category)
      }))
    );
    setError("");
    setSuccess("");
  }

  async function importSelectedTemplateServices() {
    if (!user || !collectionPath) {
      return;
    }

    const selectedServices = templatePreview.filter((service) => service.selected && !service.duplicate);
    const alreadyPresent = templatePreview.filter((service) => service.duplicate).length;
    const ignored = templatePreview.filter((service) => !service.selected && !service.duplicate).length;

    if (!selectedServices.length) {
      setError("Seleziona almeno un servizio non duplicato.");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const results = await Promise.allSettled(
        selectedServices.map((service) => {
          const serviceRef = doc(collection(db, collectionPath));
          return setDoc(serviceRef, {
            ownerId: user.uid,
            syncId: serviceRef.id,
            name: service.name,
            category: service.category,
            price: null,
            durationMinutes: null,
            description: null,
            active: service.active ?? true,
            source: "template",
            templateId,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          });
        })
      );

      const added = results.filter((result) => result.status === "fulfilled").length;
      const errors = results.filter((result) => result.status === "rejected").length;

      if (errors > 0) {
        console.error("Service template import partial failure", results);
      }

      setTemplatePreview([]);
      const summary = buildTemplateImportSummary({ added, alreadyPresent, ignored, errors });

      if (added > 0) {
        setSuccess(`${summary}\nOra puoi impostare prezzi e dettagli.`);
        showToast(summary.replace(/\n/g, " "));
      } else {
        setError(`${summary}\nNessun servizio importato.`);
        showToast("Import non completato.", "error");
      }
    } catch (templateError) {
      console.error("Service template import failed", templateError);
      setError("Non siamo riusciti a importare il template.");
      showToast("Template non importato.", "error");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className={cn("space-y-5", androidChromeHidden && "android-manager-compact")}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-[14px] text-beauty-muted">Crea il catalogo trattamenti. I prezzi restano da impostare da chi usa l&apos;app.</p>
        <div className="flex flex-col gap-2 sm:flex-row">
          <SecondaryButton type="button" onClick={openTemplatePreview}>
            <PackagePlus className="size-5" aria-hidden="true" />
            Importa template
          </SecondaryButton>
          <PrimaryButton type="button" onClick={openNewServiceForm}>
            <Plus className="size-5" aria-hidden="true" />
            Nuovo servizio
          </PrimaryButton>
        </div>
      </div>

      <Card className="space-y-3">
        <div className="flex items-start gap-3">
          <IconBadge icon={Sparkles} tone="gold" />
          <div>
            <p className="text-[16px] font-bold text-beauty-text">Template Centro estetico essenziale</p>
            <p className="mt-1 text-[13px] leading-5 text-beauty-muted">
              Importa i servizi principali del centro estetico. Prezzi e dettagli restano personalizzabili.
            </p>
          </div>
        </div>
      </Card>

      <Card className="grid gap-3 md:grid-cols-[1fr_220px]">
        <label className="relative block">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-beauty-muted" />
          <input
            className="h-11 w-full rounded-beauty border border-beauty-border bg-beauty-card pl-10 pr-3 text-[15px] text-beauty-text outline-none transition focus:border-beauty-primary focus:bg-beauty-surface"
            placeholder="Cerca servizio o categoria"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </label>
        <div className="rounded-beauty border border-beauty-border bg-beauty-card px-3 py-2 text-[13px] text-beauty-muted">
          {services.length} servizi totali
        </div>
      </Card>

      {templatePreview.length ? (
        <Card className="space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-[20px] font-semibold">Preview template</h2>
              <p className="mt-1 text-[14px] text-beauty-muted">Seleziona i servizi da importare. I duplicati sono esclusi.</p>
            </div>
            <SecondaryButton type="button" onClick={() => setTemplatePreview([])} className="h-10 px-3">
              <X className="size-4" aria-hidden="true" />
            </SecondaryButton>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            {templatePreview.map((service) => (
              <label key={service.id} className="flex items-start gap-3 rounded-beauty bg-beauty-card p-3">
                <input
                  type="checkbox"
                  className="mt-1"
                  checked={service.selected}
                  disabled={service.duplicate}
                  onChange={(event) =>
                    setTemplatePreview((current) =>
                      current.map((item) => (item.id === service.id ? { ...item, selected: event.target.checked } : item))
                    )
                  }
                />
                <span className="min-w-0">
                  <span className="block font-semibold text-beauty-text">{service.name}</span>
                  <span className="block text-[13px] text-beauty-muted">
                    {service.category} - prezzo e dettagli da impostare
                  </span>
                  {service.duplicate ? <span className="text-[12px] text-beauty-danger">Duplicato rilevato</span> : null}
                </span>
              </label>
            ))}
          </div>
          <PrimaryButton type="button" onClick={importSelectedTemplateServices} disabled={isSubmitting}>
            {isSubmitting ? "Importazione..." : "Importa selezionati"}
          </PrimaryButton>
        </Card>
      ) : null}

      {isFormOpen ? (
        <Card className="space-y-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-[20px] font-semibold">{isEditing ? "Modifica servizio" : "Nuovo servizio"}</h2>
              <p className="mt-1 text-[14px] text-beauty-muted">Prezzo e durata possono restare vuoti finche non vengono decisi dallo studio.</p>
            </div>
            <SecondaryButton type="button" onClick={closeForm} className="h-10 px-3">
              <X className="size-4" aria-hidden="true" />
            </SecondaryButton>
          </div>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="grid gap-4 md:grid-cols-2">
              <FormField label="Nome servizio" name="name" value={form.name} onChange={(event) => updateField("name", event.target.value)} required disabled={isSubmitting} />
              <FormField label="Categoria" name="category" value={form.category} onChange={(event) => updateField("category", event.target.value)} required disabled={isSubmitting} />
              <FormField label="Durata minuti" name="durationMinutes" type="number" min={5} step={5} value={form.durationMinutes} onChange={(event) => updateField("durationMinutes", event.target.value)} placeholder="Da impostare" disabled={isSubmitting} />
              <FormField label="Prezzo" name="price" type="number" min={0} step="0.01" value={form.price} onChange={(event) => updateField("price", event.target.value)} placeholder="Da impostare" disabled={isSubmitting} />
            </div>
            <TextAreaField label="Descrizione" name="description" value={form.description} onChange={(event) => updateField("description", event.target.value)} disabled={isSubmitting} />
            <label className="flex items-center gap-3 text-[14px] font-semibold text-beauty-text">
              <input type="checkbox" checked={form.active} onChange={(event) => updateField("active", event.target.checked)} disabled={isSubmitting} />
              Servizio attivo
            </label>
            <PrimaryButton type="submit" disabled={isSubmitting}>{isSubmitting ? "Salvataggio..." : "Salva servizio"}</PrimaryButton>
          </form>
        </Card>
      ) : null}

      {error ? <ErrorMessage message={error} /> : null}
      {success ? <SuccessMessage message={success} /> : null}

      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>
      ) : filteredServices.length === 0 ? (
        <EmptyState title="Nessun servizio" description={search ? "Nessun servizio corrisponde alla ricerca." : "Importa un template o crea il primo servizio."} />
      ) : (
        <div className="space-y-5">
          {categories.map((category) => {
            const CategoryIcon = getServiceCategoryIcon(category);

            return (
            <section key={category} className="space-y-3">
              <h2 className="flex items-center gap-2 text-[18px] font-bold text-beauty-text">
                <CategoryIcon aria-hidden="true" className="size-[18px] text-beauty-muted" strokeWidth={2} />
                {category}
              </h2>
              <div className="grid gap-3">
                {filteredServices
                  .filter((service) => (service.category || "Senza categoria") === category)
                  .map((service) => (
                    <Card key={service.id} className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex min-w-0 gap-3">
                        <IconBadge icon={service.active === false ? X : CheckCircle2} tone={service.active === false ? "lavender" : "mint"} />
                        <div className="min-w-0">
                          <p className="truncate text-[17px] font-semibold text-beauty-text">{service.name}</p>
                          <p className="mt-1 text-[13px] text-beauty-muted">
                            {formatServiceMeta(service.durationMinutes, service.price)}
                          </p>
                          {service.description ? (
                            <p className="mt-2 text-[13px] leading-5 text-beauty-subtle">{service.description}</p>
                          ) : null}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <SecondaryButton type="button" onClick={() => openEditServiceForm(service)} className="h-10 px-3">
                          <Edit3 className="size-4" aria-hidden="true" />
                          Modifica
                        </SecondaryButton>
                        <DangerButton type="button" onClick={() => handleDelete(service)} className="h-10 px-3">
                          <Trash2 className="size-4" aria-hidden="true" />
                          Elimina
                        </DangerButton>
                      </div>
                    </Card>
                  ))}
              </div>
            </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
