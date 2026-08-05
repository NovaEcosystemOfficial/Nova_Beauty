import {
  AlertTriangle,
  Check,
  Cloud,
  CloudOff,
  Download,
  HardDrive,
  History,
  Info,
  Loader2,
  RefreshCw,
  RotateCcw,
  ShieldCheck
} from "lucide-react";
import clsx from "clsx";
import { useEffect, useState } from "react";
import { useDemoWorkflow } from "../demo/DemoWorkflowContext";

/**
 * Backup Center — logica demo.
 *
 * TODO FUTURI:
 * - backup incrementali
 * - backup cifrati
 * - backup automatici programmabili
 * - ripristino selettivo
 * - ripristino immagini
 * - ripristino database
 * - ripristino documenti
 * - sincronizzazione Firebase
 * - sincronizzazione Nova Cloud
 * - esportazione ZIP
 * - download cloud
 * - cronologia completa backup
 * - download reale del file backup
 */

type Frequency = "giornaliero" | "settimanale" | "mensile";
type BackupKind = "manuale" | "automatico" | "cloud";
type BackupStatus = "successo" | "errore" | "in_corso";
type CloudBadge = "sincronizzato" | "in_attesa" | "offline";

type HistoryItem = {
  id: string;
  kind: BackupKind;
  kindLabel: string;
  date: string;
  time: string;
  size: string;
  status: BackupStatus;
  version: string;
  notes: string;
};

const CONTENT_ITEMS = [
  "Clienti",
  "Agenda",
  "Servizi",
  "Magazzino",
  "Fornitori",
  "Report",
  "Impostazioni",
  "Operatori",
  "Cabine",
  "Foto clienti",
  "Documenti"
] as const;

const HISTORY: HistoryItem[] = [
  {
    id: "b1",
    kind: "manuale",
    kindLabel: "Backup Manuale",
    date: "5 ago 2026",
    time: "15:10",
    size: "48,2 MB",
    status: "successo",
    version: "Desktop 0.1.0",
    notes: "Eseguito da Fabio · include foto clienti"
  },
  {
    id: "b2",
    kind: "automatico",
    kindLabel: "Backup Automatico",
    date: "5 ago 2026",
    time: "06:00",
    size: "47,9 MB",
    status: "successo",
    version: "Desktop 0.1.0",
    notes: "Schedulato giornaliero · 06:00"
  },
  {
    id: "b3",
    kind: "cloud",
    kindLabel: "Backup Cloud",
    date: "4 ago 2026",
    time: "22:14",
    size: "47,6 MB",
    status: "in_corso",
    version: "Desktop 0.1.0",
    notes: "Upload Nova Cloud in corso"
  },
  {
    id: "b4",
    kind: "automatico",
    kindLabel: "Backup Automatico",
    date: "4 ago 2026",
    time: "06:00",
    size: "47,1 MB",
    status: "successo",
    version: "Desktop 0.1.0",
    notes: "Schedulato giornaliero · 06:00"
  },
  {
    id: "b5",
    kind: "manuale",
    kindLabel: "Backup Manuale",
    date: "2 ago 2026",
    time: "19:42",
    size: "46,8 MB",
    status: "errore",
    version: "Desktop 0.1.0",
    notes: "Interrotto · spazio disco insufficiente (demo)"
  },
  {
    id: "b6",
    kind: "cloud",
    kindLabel: "Backup Cloud",
    date: "1 ago 2026",
    time: "23:05",
    size: "46,4 MB",
    status: "successo",
    version: "Desktop 0.1.0",
    notes: "Sincronizzato su Nova Cloud"
  }
];

const STATUS_LABEL: Record<BackupStatus, string> = {
  successo: "Successo",
  errore: "Errore",
  in_corso: "In corso"
};

const KIND_DETAIL: Record<BackupKind, string> = {
  manuale: "Manuale",
  automatico: "Automatico",
  cloud: "Cloud"
};

const CLOUD_LABEL: Record<CloudBadge, string> = {
  sincronizzato: "Sincronizzato",
  in_attesa: "In attesa",
  offline: "Offline"
};

/**
 * TODO: verifica token
 * TODO: verifica spazio cloud
 * TODO: verifica sincronizzazione
 * TODO: verifica licenza
 * TODO: refresh dati cloud
 */
async function refreshNovaCloudStatus(): Promise<{
  ok: true;
  badge: CloudBadge;
  lastSync: string;
  message: string;
}> {
  await new Promise((r) => window.setTimeout(r, 900));
  return {
    ok: true,
    badge: "sincronizzato",
    lastSync: "Adesso · demo",
    message: "Connessione Nova Cloud verificata."
  };
}

/**
 * TODO: download reale del file backup
 * TODO: esportazione ZIP
 * TODO: download cloud
 */
function downloadBackupDemo(_item: HistoryItem): void {
  // Placeholder — nessun file reale generato.
}

export default function BackupCenter() {
  const { pushToast } = useDemoWorkflow();
  const [autoBackup, setAutoBackup] = useState(true);
  const [frequency, setFrequency] = useState<Frequency>("giornaliero");
  const [time, setTime] = useState("06:00");
  const [keepCount, setKeepCount] = useState(14);
  const [running, setRunning] = useState(false);
  const [lastBackup, setLastBackup] = useState("Oggi · 15:10");
  const [cloudBadge, setCloudBadge] = useState<CloudBadge>("sincronizzato");
  const [cloudLastSync, setCloudLastSync] = useState("Oggi · 15:12");
  const [cloudRefreshing, setCloudRefreshing] = useState(false);
  const [content, setContent] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(CONTENT_ITEMS.map((c) => [c, c !== "Documenti"]))
  );

  const [detailsItem, setDetailsItem] = useState<HistoryItem | null>(null);
  const [restoreTarget, setRestoreTarget] = useState<HistoryItem | null>(null);
  const [restorePhase, setRestorePhase] = useState<"idle" | "confirm" | "progress" | "done">(
    "idle"
  );
  const [restoreProgress, setRestoreProgress] = useState(0);

  useEffect(() => {
    if (!running) return;
    const t = window.setTimeout(() => {
      setRunning(false);
      setLastBackup("Adesso · demo");
      setCloudBadge("sincronizzato");
    }, 2200);
    return () => window.clearTimeout(t);
  }, [running]);

  useEffect(() => {
    if (restorePhase !== "progress") return;
    setRestoreProgress(0);
    let p = 0;
    const id = window.setInterval(() => {
      p += 12;
      if (p >= 100) {
        window.clearInterval(id);
        setRestoreProgress(100);
        window.setTimeout(() => setRestorePhase("done"), 280);
        return;
      }
      setRestoreProgress(p);
    }, 180);
    return () => window.clearInterval(id);
  }, [restorePhase]);

  const runBackup = () => {
    if (running) return;
    setRunning(true);
    setCloudBadge("in_attesa");
  };

  const latestRestorable =
    HISTORY.find((h) => h.status === "successo") ?? HISTORY[0] ?? null;

  const openRestore = (item: HistoryItem) => {
    setRestoreTarget(item);
    setRestorePhase("confirm");
    setRestoreProgress(0);
  };

  const closeRestore = () => {
    setRestoreTarget(null);
    setRestorePhase("idle");
    setRestoreProgress(0);
  };

  const startRestore = () => {
    // Demo: crea backup di sicurezza implicito, poi ripristina
    setRestorePhase("progress");
  };

  const onDownload = (item: HistoryItem) => {
    // TODO: download reale del file backup
    // TODO: esportazione ZIP
    // TODO: download cloud
    downloadBackupDemo(item);
    pushToast("Download backup completato.");
  };

  const onRenewCloud = async () => {
    if (cloudRefreshing) return;
    setCloudRefreshing(true);
    setCloudBadge("in_attesa");
    // TODO: verifica token
    // TODO: verifica spazio cloud
    // TODO: verifica sincronizzazione
    // TODO: verifica licenza
    // TODO: refresh dati cloud
    const result = await refreshNovaCloudStatus();
    setCloudBadge(result.badge);
    setCloudLastSync(result.lastSync);
    setCloudRefreshing(false);
    pushToast(result.message);
  };

  return (
    <div className="nb-backup" role="region" aria-label="Backup Center">
      <header className="nb-backupHead">
        <div className="nb-backupHeadIcon" aria-hidden={true}>
          <HardDrive />
        </div>
        <div>
          <h2 className="nb-backupTitle">Backup Center</h2>
          <p className="nb-backupSub">
            Proteggi i dati del centro con backup locali e Nova Cloud. Solo UI demo —
            nessun salvataggio reale.
          </p>
        </div>
      </header>

      <div className="nb-backupGrid">
        <article className={clsx("nb-backupCard nb-backupStatus", running && "isRunning")}>
          <div className="nb-backupCardTop">
            <h3 className="nb-backupCardTitle">Backup stato</h3>
            <span className="nb-backupPill isOk">
              <span className="nb-backupDot" aria-hidden={true} />
              Tutto ok
            </span>
          </div>

          <div className="nb-backupStatusGrid">
            <Stat label="Ultimo backup" value={lastBackup} />
            <Stat label="Stato" value="Integro" tone="ok" />
            <Stat label="Destinazione" value="Disco locale + Nova Cloud" />
            <Stat label="Dimensione" value="48,2 MB" />
            <Stat
              label="Backup automatico"
              value={autoBackup ? "ON" : "OFF"}
              tone={autoBackup ? "ok" : "muted"}
            />
          </div>

          <button
            type="button"
            className={clsx("nb-backupRunBtn", running && "isRunning")}
            onClick={runBackup}
            disabled={running}
          >
            {running ? (
              <>
                <Loader2 className="nb-backupRunIcon isSpin" aria-hidden={true} />
                Backup in corso…
              </>
            ) : (
              <>
                <RefreshCw className="nb-backupRunIcon" aria-hidden={true} />
                Esegui Backup Ora
              </>
            )}
          </button>
          {running ? (
            <div className="nb-backupProgress" aria-hidden={true}>
              <span />
            </div>
          ) : null}
        </article>

        <article className="nb-backupCard">
          <div className="nb-backupCardTop">
            <h3 className="nb-backupCardTitle">Backup automatico</h3>
            <button
              type="button"
              className={clsx("nb-backupToggle", autoBackup && "isOn")}
              aria-pressed={autoBackup}
              onClick={() => setAutoBackup((v) => !v)}
            >
              <span className="nb-backupToggleKnob" />
              <span className="nb-backupToggleLabel">{autoBackup ? "ON" : "OFF"}</span>
            </button>
          </div>

          {autoBackup ? (
            <div className="nb-backupAutoBody">
              <label className="nb-backupField">
                <span>Frequenza</span>
                <select
                  value={frequency}
                  onChange={(e) => setFrequency(e.target.value as Frequency)}
                >
                  <option value="giornaliero">Giornaliero</option>
                  <option value="settimanale">Settimanale</option>
                  <option value="mensile">Mensile</option>
                </select>
              </label>
              <label className="nb-backupField">
                <span>Orario</span>
                <input type="time" value={time} onChange={(e) => setTime(e.target.value)} />
              </label>
              <label className="nb-backupField">
                <span>Backup conservati</span>
                <input
                  type="number"
                  min={1}
                  max={90}
                  value={keepCount}
                  onChange={(e) => setKeepCount(Number(e.target.value) || 1)}
                />
              </label>
              <div className="nb-backupProNote">
                <ShieldCheck className="nb-backupProIcon" aria-hidden={true} />
                <div>
                  <strong>Versione PRO</strong>
                  <p>Conservazione illimitata e retention avanzata.</p>
                </div>
              </div>
            </div>
          ) : (
            <p className="nb-backupMuted">
              Attiva il backup automatico per proteggere i dati senza intervento manuale.
            </p>
          )}
        </article>

        <article className="nb-backupCard nb-backupContentCard">
          <div className="nb-backupCardTop">
            <h3 className="nb-backupCardTitle">Contenuto backup</h3>
            <span className="nb-backupHint">Seleziona cosa includere</span>
          </div>
          <div className="nb-backupCheckGrid">
            {CONTENT_ITEMS.map((item) => (
              <label key={item} className="nb-backupCheck">
                <input
                  type="checkbox"
                  checked={Boolean(content[item])}
                  onChange={(e) =>
                    setContent((prev) => ({ ...prev, [item]: e.target.checked }))
                  }
                />
                <span className="nb-backupCheckBox" aria-hidden={true}>
                  <Check className="nb-backupCheckIcon" />
                </span>
                <span className="nb-backupCheckLabel">{item}</span>
              </label>
            ))}
          </div>
        </article>

        <article className="nb-backupCard nb-backupHistoryCard">
          <div className="nb-backupCardTop">
            <h3 className="nb-backupCardTitle">
              <History className="nb-backupTitleIcon" aria-hidden={true} />
              Cronologia
            </h3>
          </div>
          <ul className="nb-backupHistory">
            {HISTORY.map((item) => {
              const canRestore = item.status === "successo";
              return (
                <li key={item.id} className="nb-backupHistoryItem">
                  <div className="nb-backupHistoryMain">
                    <div className="nb-backupHistoryName">{item.kindLabel}</div>
                    <div className="nb-backupHistoryMeta">
                      {item.date} · {item.time} · {item.size}
                    </div>
                  </div>
                  <span className={clsx("nb-backupBadge", `is-${item.status}`)}>
                    {STATUS_LABEL[item.status]}
                  </span>
                  <div className="nb-backupHistoryActions">
                    <button
                      type="button"
                      className="nb-backupMiniBtn"
                      disabled={!canRestore || restorePhase === "progress"}
                      onClick={() => openRestore(item)}
                    >
                      <RotateCcw className="nb-backupMiniIcon" aria-hidden={true} />
                      Ripristina
                    </button>
                    <button
                      type="button"
                      className="nb-backupMiniBtn"
                      onClick={() => onDownload(item)}
                    >
                      <Download className="nb-backupMiniIcon" aria-hidden={true} />
                      Scarica
                    </button>
                    <button
                      type="button"
                      className="nb-backupMiniBtn"
                      onClick={() => setDetailsItem(item)}
                    >
                      <Info className="nb-backupMiniIcon" aria-hidden={true} />
                      Dettagli
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        </article>

        <article className="nb-backupCard nb-backupRestore">
          <div className="nb-backupRestoreWarn" aria-hidden={true}>
            <AlertTriangle />
          </div>
          <div className="nb-backupRestoreBody">
            <h3 className="nb-backupCardTitle">Ripristino</h3>
            <p className="nb-backupRestoreText">Ripristina un backup precedente.</p>
            <button
              type="button"
              className="nb-backupRestoreBtn"
              disabled={!latestRestorable || restorePhase === "progress"}
              onClick={() => latestRestorable && openRestore(latestRestorable)}
            >
              <RotateCcw className="nb-backupRunIcon" aria-hidden={true} />
              Ripristina Backup
            </button>
            <p className="nb-backupRestoreNote">
              Prima del ripristino verrà creato automaticamente un backup di sicurezza.
            </p>
          </div>
        </article>

        <article className="nb-backupCard nb-backupCloud">
          <div className="nb-backupCardTop">
            <h3 className="nb-backupCardTitle">
              <Cloud className="nb-backupTitleIcon" aria-hidden={true} />
              Nova Cloud
            </h3>
            <span className={clsx("nb-backupCloudBadge", `is-${cloudBadge}`)}>
              {cloudBadge === "offline" ? (
                <CloudOff className="nb-backupCloudBadgeIcon" aria-hidden={true} />
              ) : (
                <Cloud className="nb-backupCloudBadgeIcon" aria-hidden={true} />
              )}
              {CLOUD_LABEL[cloudBadge]}
            </span>
          </div>
          <div className="nb-backupCloudGrid">
            <Stat label="Connessione Cloud" value="Account Nova · demo" />
            <Stat label="Ultima sincronizzazione" value={cloudLastSync} />
            <Stat label="Spazio utilizzato" value="1,2 GB / 10 GB" />
            <Stat
              label="Stato sincronizzazione"
              value={CLOUD_LABEL[cloudBadge]}
              tone={cloudBadge === "sincronizzato" ? "ok" : "muted"}
            />
          </div>
          <div className="nb-backupCloudBar" aria-hidden={true}>
            <span style={{ width: "12%" }} />
          </div>
          <div className="nb-backupCloudActions">
            <button
              type="button"
              className="nb-backupMiniBtn"
              disabled={cloudRefreshing}
              onClick={() => void onRenewCloud()}
            >
              {cloudRefreshing ? (
                <Loader2 className="nb-backupMiniIcon isSpin" aria-hidden={true} />
              ) : (
                <RefreshCw className="nb-backupMiniIcon" aria-hidden={true} />
              )}
              Rinnova Stato
            </button>
          </div>
        </article>
      </div>

      {detailsItem ? (
        <div className="nb-dialogRoot isOpen" role="presentation">
          <button
            type="button"
            className="nb-dialogBackdrop"
            aria-label="Chiudi"
            onClick={() => setDetailsItem(null)}
          />
          <div className="nb-dialogCard" role="dialog" aria-modal="true" aria-label="Dettagli backup">
            <h2 className="nb-dialogTitle">Dettagli backup</h2>
            <p className="nb-dialogSub">{detailsItem.kindLabel}</p>
            <dl className="nb-backupDetailDl">
              <div>
                <dt>Nome backup</dt>
                <dd>{detailsItem.kindLabel}</dd>
              </div>
              <div>
                <dt>Data</dt>
                <dd>{detailsItem.date}</dd>
              </div>
              <div>
                <dt>Ora</dt>
                <dd>{detailsItem.time}</dd>
              </div>
              <div>
                <dt>Tipo</dt>
                <dd>{KIND_DETAIL[detailsItem.kind]}</dd>
              </div>
              <div>
                <dt>Dimensione</dt>
                <dd>{detailsItem.size}</dd>
              </div>
              <div>
                <dt>Versione</dt>
                <dd>{detailsItem.version}</dd>
              </div>
              <div>
                <dt>Stato</dt>
                <dd>{STATUS_LABEL[detailsItem.status]}</dd>
              </div>
              <div className="nb-backupDetailNotes">
                <dt>Note</dt>
                <dd>{detailsItem.notes || "—"}</dd>
              </div>
            </dl>
            <div className="nb-dialogActions">
              <button type="button" className="nb-newBtn" onClick={() => setDetailsItem(null)}>
                Chiudi
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {restorePhase !== "idle" && restoreTarget ? (
        <div className="nb-dialogRoot isOpen" role="presentation">
          <button
            type="button"
            className="nb-dialogBackdrop"
            aria-label="Chiudi"
            disabled={restorePhase === "progress"}
            onClick={() => {
              if (restorePhase === "progress") return;
              closeRestore();
            }}
          />
          <div
            className="nb-dialogCard"
            role="dialog"
            aria-modal="true"
            aria-label="Ripristina backup"
          >
            {restorePhase === "confirm" ? (
              <>
                <h2 className="nb-dialogTitle">Confermare il ripristino?</h2>
                <p className="nb-dialogSub">
                  Stai per ripristinare <strong>{restoreTarget.kindLabel}</strong> del{" "}
                  {restoreTarget.date} · {restoreTarget.time}. Verrà creato automaticamente un
                  backup di sicurezza prima del ripristino.
                </p>
                <div className="nb-dialogActions">
                  <button type="button" className="nb-ghostBtn" onClick={closeRestore}>
                    Annulla
                  </button>
                  <button type="button" className="nb-newBtn" onClick={startRestore}>
                    Conferma ripristino
                  </button>
                </div>
              </>
            ) : null}

            {restorePhase === "progress" ? (
              <>
                <h2 className="nb-dialogTitle">Ripristino in corso</h2>
                <p className="nb-dialogSub">
                  Backup di sicurezza creato · ripristino demo di {restoreTarget.kindLabel}…
                </p>
                <div className="nb-backupRestoreProgress" role="progressbar" aria-valuenow={restoreProgress}>
                  <span style={{ width: `${restoreProgress}%` }} />
                </div>
                <p className="nb-backupRestorePct">{restoreProgress}%</p>
              </>
            ) : null}

            {restorePhase === "done" ? (
              <>
                <h2 className="nb-dialogTitle">Completato</h2>
                <p className="nb-dialogSub">Backup ripristinato con successo.</p>
                <div className="nb-dialogActions">
                  <button
                    type="button"
                    className="nb-newBtn"
                    onClick={() => {
                      setLastBackup("Adesso · ripristino demo");
                      closeRestore();
                      pushToast("Backup ripristinato con successo.");
                    }}
                  >
                    Chiudi
                  </button>
                </div>
              </>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function Stat({
  label,
  value,
  tone
}: {
  label: string;
  value: string;
  tone?: "ok" | "muted";
}) {
  return (
    <div className="nb-backupStat">
      <span className="nb-backupStatLabel">{label}</span>
      <span className={clsx("nb-backupStatValue", tone && `tone-${tone}`)}>{value}</span>
    </div>
  );
}
