import {
  Calendar,
  Camera,
  Gift,
  Mail,
  MessageSquare,
  Phone,
  Search,
  Sparkles,
  Star,
  StickyNote
} from "lucide-react";
import clsx from "clsx";
import { useEffect, useMemo, useState } from "react";
import { useDemoWorkflow, type WorkflowClient } from "../demo/DemoWorkflowContext";

type ListFilter = "tutti" | "preferiti" | "attivi" | "nuovi";

const PHOTO_DIARY_SLOTS = [
  { id: "before", label: "Prima trattamento", kind: "photo" as const },
  { id: "after", label: "Dopo trattamento", kind: "photo" as const },
  { id: "zones", label: "Zone trattate", kind: "zones" as const },
  { id: "followup", label: "Follow-up programmato", kind: "followup" as const }
] as const;

const EVOLUTION_DEMO: Array<{ id: string; label: string; meta: string }> = [
  { id: "ev1", label: "Prima visita", meta: "Scheda iniziale · trattamento base" },
  { id: "ev2", label: "2 settimane", meta: "Controllo · note e foto" },
  { id: "ev3", label: "1 mese", meta: "Verifica risultato · follow-up" },
  { id: "ev4", label: "3 mesi", meta: "Mantieni · nuovo ciclo" }
];

function statusLabel(status: WorkflowClient["status"]): string {
  switch (status) {
    case "attivo":
      return "Attivo";
    case "inattivo":
      return "Inattivo";
    case "nuovo":
      return "Nuovo";
  }
}

function initials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();
}

function phoneDigits(phone: string): string {
  return phone.replace(/\D/g, "");
}

function telHref(phone: string): string {
  return `tel:+${phoneDigits(phone)}`;
}

function waHref(phone: string): string {
  return `https://wa.me/${phoneDigits(phone)}`;
}

export default function ClientsWorkspace() {
  const { clients, appointments, pushToast, lastCreatedClientId, clearLastCreatedClientId } =
    useDemoWorkflow();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<ListFilter>("tutti");
  const [selectedId, setSelectedId] = useState(clients[0]?.id ?? "c1");
  const [activeSlot, setActiveSlot] = useState<string | null>(null);
  const [activeEvolution, setActiveEvolution] = useState<string | null>(null);

  useEffect(() => {
    if (!lastCreatedClientId) return;
    setSelectedId(lastCreatedClientId);
    setFilter("tutti");
    setQuery("");
    clearLastCreatedClientId();
  }, [lastCreatedClientId, clearLastCreatedClientId]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return clients.filter((c) => {
      if (filter === "preferiti" && !c.favorite) return false;
      if (filter === "attivi" && c.status !== "attivo") return false;
      if (filter === "nuovi" && c.status !== "nuovo") return false;
      if (!q) return true;
      return (
        c.name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.phone.toLowerCase().includes(q)
      );
    });
  }, [clients, query, filter]);

  const selected = filtered.find((c) => c.id === selectedId) ?? filtered[0] ?? clients[0];

  const futureAppts = appointments.filter(
    (a) => a.clientId === selected.id && a.status !== "completato" && a.status !== "annullato"
  );

  const phone = selected.phone.trim();
  const email = selected.email.trim();

  const onDiarySlot = (slotId: string, kind: "photo" | "zones" | "followup") => {
    setActiveSlot(`${selected.id}:${slotId}`);
    window.setTimeout(() => setActiveSlot(null), 420);
    if (kind === "zones") {
      pushToast("Zone trattate · mappa corpo in arrivo");
      return;
    }
    if (kind === "followup") {
      pushToast("Follow-up programmato · reminder in arrivo");
      return;
    }
    pushToast("Diario fotografico · sync Staff in arrivo");
  };

  return (
    <div className="nb-clientsWs" role="region" aria-label="Workspace Clienti">
      <aside className="nb-cwList">
        <div className="nb-cwListToolbar">
          <div className="nb-cwSearch">
            <Search className="nb-cwSearchIcon" aria-hidden={true} />
            <input
              className="nb-cwSearchInput"
              placeholder="Cerca nella lista…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Cerca clienti"
            />
          </div>
          <div className="nb-cwFilters" role="toolbar" aria-label="Filtri clienti">
            {(
              [
                ["tutti", "Tutti"],
                ["preferiti", "Preferiti"],
                ["attivi", "Attivi"],
                ["nuovi", "Nuovi"]
              ] as const
            ).map(([key, label]) => (
              <button
                key={key}
                type="button"
                className={clsx("nb-cwFilter", filter === key && "isActive")}
                onClick={() => setFilter(key)}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="nb-cwListMeta">
            <span>{filtered.length} clienti</span>
            <span className="nb-cwListMetaHint">Cartella digitale</span>
          </div>
        </div>

        <ul className="nb-cwClientList" role="listbox" aria-label="Elenco clienti">
          {filtered.map((client) => {
            const isSelected = client.id === selected.id;
            return (
              <li key={client.id}>
                <button
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  className={clsx("nb-cwClientRow", isSelected && "isSelected")}
                  onClick={() => setSelectedId(client.id)}
                >
                  <span className="nb-cwClientAvatar" aria-hidden={true}>
                    {initials(client.name)}
                  </span>
                  <span className="nb-cwClientBody">
                    <span className="nb-cwClientTop">
                      <span className="nb-cwClientName">{client.name}</span>
                      {client.favorite ? (
                        <Star className="nb-cwFav" aria-label="Preferito" fill="currentColor" />
                      ) : null}
                    </span>
                    <span className="nb-cwClientSub">Ultimo: {client.lastAppointment}</span>
                  </span>
                  <span className={clsx("nb-cwStatus", `is-${client.status}`)}>
                    {statusLabel(client.status)}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </aside>

      <section
        className="nb-cwDetail nb-cwDetailRich"
        aria-label={`Scheda ${selected.name}`}
        key={selected.id}
      >
        <div className="nb-cwDetailHead">
          <div className="nb-cwDetailIdentity">
            <div className="nb-cwDetailAvatar" aria-hidden={true}>
              {initials(selected.name)}
            </div>
            <div className="nb-cwDetailTitleBlock">
              <div className="nb-cwDetailNameRow">
                <h2 className="nb-cwDetailName">{selected.name}</h2>
                <span className={clsx("nb-cwStatus", `is-${selected.status}`)}>
                  {statusLabel(selected.status)}
                </span>
              </div>
              <div className="nb-cwTags">
                {selected.tags.map((tag) => (
                  <span key={tag} className="nb-cwTag">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="nb-cwDetailGrid">
          <div className="nb-cwField">
            <span className="nb-cwFieldLabel">Telefono</span>
            <span className="nb-cwFieldValue">{phone || "—"}</span>
          </div>
          <div className="nb-cwField">
            <span className="nb-cwFieldLabel">Email</span>
            <span className="nb-cwFieldValue">{email || "—"}</span>
          </div>
          <div className="nb-cwField">
            <span className="nb-cwFieldLabel">Compleanno</span>
            <span className="nb-cwFieldValue">{selected.birthday}</span>
          </div>
          <div className="nb-cwField">
            <span className="nb-cwFieldLabel">Ultimo trattamento</span>
            <span className="nb-cwFieldValue">{selected.lastTreatment || "—"}</span>
          </div>
          <div className="nb-cwField">
            <span className="nb-cwFieldLabel">Totale speso</span>
            <span className="nb-cwFieldValue strong">€{selected.totalSpent}</span>
          </div>
          <div className="nb-cwField">
            <span className="nb-cwFieldLabel">Fidelity</span>
            <span className="nb-cwFieldValue accent">{selected.fidelityPoints} pt</span>
          </div>
        </div>

        <div className="nb-cwNotes">
          <div className="nb-cwNotesHead">
            <StickyNote className="nb-cwNotesIcon" aria-hidden={true} />
            <span>Note</span>
          </div>
          <p className="nb-cwNotesBody">{selected.notes || "Nessuna nota."}</p>
        </div>

        <div className="nb-cwExtraRow">
          <div className="nb-cwBlock nb-cwDiaryBlock">
            <div className="nb-cwBlockHead">
              <Camera className="nb-cwBlockIcon" aria-hidden={true} />
              Diario Fotografico
            </div>
            <p className="nb-cwDiaryHint">
              Diario personale · cliente <strong>{selected.id}</strong> · sync Staff
            </p>
            <div
              className="nb-cwPhotoPlaceholders nb-cwPhotoDiary"
              data-client-id={selected.id}
              aria-label={`Diario fotografico di ${selected.name}`}
            >
              {PHOTO_DIARY_SLOTS.map((slot) => (
                <button
                  key={`${selected.id}-${slot.id}`}
                  type="button"
                  className={clsx(
                    "nb-cwPhotoPh",
                    "isClickable",
                    activeSlot === `${selected.id}:${slot.id}` && "isPulse"
                  )}
                  data-client-id={selected.id}
                  data-slot={slot.id}
                  onClick={() => onDiarySlot(slot.id, slot.kind)}
                >
                  <span className="nb-cwPhotoPhLabel">{slot.label}</span>
                  <span className="nb-cwPhotoPhSub">
                    {slot.kind === "zones"
                      ? "Apri mappa"
                      : slot.kind === "followup"
                        ? "Programma"
                        : "In attesa foto"}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="nb-cwBlock">
            <div className="nb-cwBlockHead">
              <Gift className="nb-cwBlockIcon" aria-hidden={true} />
              Fidelity
            </div>
            <p className="nb-cwBlockText">
              {selected.fidelityPoints} punti · livello{" "}
              {selected.fidelityPoints >= 200
                ? "Gold"
                : selected.fidelityPoints >= 80
                  ? "Silver"
                  : "Starter"}
            </p>
          </div>
        </div>

        <div className="nb-cwBlock nb-cwEvolution">
          <div className="nb-cwBlockHead">
            <Sparkles className="nb-cwBlockIcon" aria-hidden={true} />
            Evoluzione
          </div>
          <ol className="nb-cwEvoList" aria-label={`Evoluzione di ${selected.name}`}>
            {EVOLUTION_DEMO.map((step, idx) => (
              <li key={`${selected.id}-${step.id}`}>
                <button
                  type="button"
                  className={clsx(
                    "nb-cwEvoItem",
                    activeEvolution === `${selected.id}:${step.id}` && "isPulse"
                  )}
                  onClick={() => {
                    setActiveEvolution(`${selected.id}:${step.id}`);
                    window.setTimeout(() => setActiveEvolution(null), 420);
                    pushToast(`${step.label} · demo`);
                  }}
                >
                  <span className="nb-cwEvoRail" aria-hidden={true}>
                    <span className="nb-cwEvoDot" />
                    {idx < EVOLUTION_DEMO.length - 1 ? <span className="nb-cwEvoLine" /> : null}
                  </span>
                  <span className="nb-cwEvoCopy">
                    <span className="nb-cwEvoLabel">{step.label}</span>
                    <span className="nb-cwEvoMeta">
                      {step.meta} · {selected.lastTreatment || "trattamento"}
                    </span>
                  </span>
                </button>
              </li>
            ))}
          </ol>
        </div>

        <div className="nb-cwBlock">
          <div className="nb-cwBlockHead">
            <Calendar className="nb-cwBlockIcon" aria-hidden={true} />
            Appuntamenti futuri
          </div>
          {futureAppts.length === 0 ? (
            <p className="nb-cwBlockText">Nessun appuntamento futuro.</p>
          ) : (
            <ul className="nb-cwFutureList">
              {futureAppts.map((a) => (
                <li key={a.id}>
                  <strong>
                    {a.timeLabel} · {a.service}
                  </strong>
                  <span>
                    {a.operator} · {a.cabin}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="nb-cwQuickActions">
          {phone ? (
            <a
              className="nb-cwQuick"
              href={telHref(phone)}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Chiama ${selected.name}`}
            >
              <Phone className="nb-cwQuickIcon" aria-hidden={true} />
              Chiama
            </a>
          ) : (
            <span className="nb-cwQuick isMissing" role="status">
              <Phone className="nb-cwQuickIcon" aria-hidden={true} />
              Nessun numero disponibile
            </span>
          )}

          {email ? (
            <a
              className="nb-cwQuick"
              href={`mailto:${email}`}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Email ${selected.name}`}
            >
              <Mail className="nb-cwQuickIcon" aria-hidden={true} />
              Email
            </a>
          ) : (
            <span className="nb-cwQuick isMissing" role="status">
              <Mail className="nb-cwQuickIcon" aria-hidden={true} />
              Nessuna email disponibile
            </span>
          )}

          {phone ? (
            <a
              className="nb-cwQuick"
              href={waHref(phone)}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`WhatsApp ${selected.name}`}
            >
              <MessageSquare className="nb-cwQuickIcon" aria-hidden={true} />
              WhatsApp
            </a>
          ) : (
            <span className="nb-cwQuick isMissing" role="status">
              <MessageSquare className="nb-cwQuickIcon" aria-hidden={true} />
              Nessun numero disponibile
            </span>
          )}
        </div>
      </section>

      <aside className="nb-cwTimeline" aria-label="Storico cliente">
        <div className="nb-cwTimelineHead">
          <h3 className="nb-cwTimelineTitle">Storico</h3>
          <p className="nb-cwTimelineCaption">Trattamenti e attività · demo</p>
        </div>
        <div className="nb-cwTimelineBody">
          <ol className="nb-cwTimelineList">
            {selected.historyLines.length === 0 ? (
              <li className="nb-cwTimelineItem">
                <span className="nb-cwTimelineDot tone-primary" aria-hidden={true} />
                <div className="nb-cwTimelineContent">
                  <div className="nb-cwTimelineItemTitle">Nessuno storico</div>
                  <div className="nb-cwTimelineItemMeta">Cliente nuovo o riattivato</div>
                </div>
              </li>
            ) : (
              selected.historyLines.map((line, idx) => (
                <li key={`${line}-${idx}`} className="nb-cwTimelineItem">
                  <span
                    className={clsx(
                      "nb-cwTimelineDot",
                      idx === 0 ? "tone-mint" : "tone-lavender"
                    )}
                    aria-hidden={true}
                  />
                  <div className="nb-cwTimelineContent">
                    <div className="nb-cwTimelineItemTitle">{line}</div>
                    <div className="nb-cwTimelineItemMeta">Scheda cliente</div>
                  </div>
                </li>
              ))
            )}
          </ol>
        </div>
      </aside>
    </div>
  );
}
