import {
  Calendar,
  CalendarPlus,
  Camera,
  Gift,
  Mail,
  MessageSquare,
  Phone,
  Search,
  Star,
  StickyNote
} from "lucide-react";
import clsx from "clsx";
import { useMemo, useState } from "react";
import { useDemoWorkflow, type WorkflowClient } from "../demo/DemoWorkflowContext";

type ListFilter = "tutti" | "preferiti" | "attivi" | "nuovi";

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

export default function ClientsWorkspace() {
  const { clients, appointments, openNewAppointment } = useDemoWorkflow();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<ListFilter>("tutti");
  const [selectedId, setSelectedId] = useState(clients[0]?.id ?? "c1");

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
            <span className="nb-cwListMetaHint">Workflow demo</span>
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

      <section className="nb-cwDetail nb-cwDetailRich" aria-label={`Scheda ${selected.name}`}>
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

          <button
            type="button"
            className="nb-newBtn nb-cwNewAppt"
            onClick={() => openNewAppointment(selected.id)}
          >
            <CalendarPlus className="nb-newBtnIcon" aria-hidden={true} />
            Nuovo appuntamento
          </button>
        </div>

        <div className="nb-cwDetailGrid">
          <div className="nb-cwField">
            <span className="nb-cwFieldLabel">Telefono</span>
            <span className="nb-cwFieldValue">{selected.phone}</span>
          </div>
          <div className="nb-cwField">
            <span className="nb-cwFieldLabel">Email</span>
            <span className="nb-cwFieldValue">{selected.email}</span>
          </div>
          <div className="nb-cwField">
            <span className="nb-cwFieldLabel">Compleanno</span>
            <span className="nb-cwFieldValue">{selected.birthday}</span>
          </div>
          <div className="nb-cwField">
            <span className="nb-cwFieldLabel">Ultimo trattamento</span>
            <span className="nb-cwFieldValue">{selected.lastTreatment}</span>
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
          <p className="nb-cwNotesBody">{selected.notes}</p>
        </div>

        <div className="nb-cwExtraRow">
          <div className="nb-cwBlock">
            <div className="nb-cwBlockHead">
              <Camera className="nb-cwBlockIcon" aria-hidden={true} />
              Ultime foto diario
            </div>
            <div className="nb-cwPhotoPlaceholders">
              {(selected.diaryPlaceholders.length
                ? selected.diaryPlaceholders
                : ["Nessuna foto"]
              ).map((p) => (
                <div key={p} className="nb-cwPhotoPh">
                  {p}
                </div>
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
              {selected.fidelityPoints >= 200 ? "Gold" : selected.fidelityPoints >= 80 ? "Silver" : "Starter"}
            </p>
          </div>
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
          <button type="button" className="nb-cwQuick" disabled>
            <Phone className="nb-cwQuickIcon" aria-hidden={true} />
            Chiama
          </button>
          <button type="button" className="nb-cwQuick" disabled>
            <Mail className="nb-cwQuickIcon" aria-hidden={true} />
            Email
          </button>
          <button type="button" className="nb-cwQuick" disabled>
            <MessageSquare className="nb-cwQuickIcon" aria-hidden={true} />
            WhatsApp
          </button>
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
