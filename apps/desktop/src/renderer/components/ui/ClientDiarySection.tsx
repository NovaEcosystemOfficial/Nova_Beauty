import { useEffect, useState, type ChangeEvent } from "react";
import { Camera, Plus, Trash2 } from "lucide-react";
import clsx from "clsx";
import { DIARY_TAGS, type DiaryEntryData, type DiaryTag } from "../../../models/DiaryEntry";
import {
  createDiaryEntry,
  deleteDiaryEntry,
  listDiary,
  readDiaryPhoto
} from "../../data/diaryApi";
import type { WorkflowAppointment } from "../../demo/DemoWorkflowContext";

type ClientDiarySectionProps = {
  clientId: string;
  appointments: WorkflowAppointment[];
  onToast: (message: string) => void;
};

const emptyForm = {
  title: "",
  body: "",
  appointmentId: "",
  tags: [] as DiaryTag[]
};

export default function ClientDiarySection({
  clientId,
  appointments,
  onToast
}: ClientDiarySectionProps) {
  const [entries, setEntries] = useState<DiaryEntryData[]>([]);
  const [loading, setLoading] = useState(true);
  const [composerOpen, setComposerOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [photosBefore, setPhotosBefore] = useState<string[]>([]);
  const [photosAfter, setPhotosAfter] = useState<string[]>([]);

  const clientAppointments = appointments.filter((appointment) => appointment.clientId === clientId);

  const reload = async (id: string) => {
    setLoading(true);
    const result = await listDiary(id);
    setLoading(false);
    if (!result.ok) {
      if (result.code !== "NO_IPC") onToast(result.message);
      setEntries([]);
      return;
    }
    setEntries(result.data);
  };

  useEffect(() => {
    setComposerOpen(false);
    setForm(emptyForm);
    setPhotosBefore([]);
    setPhotosAfter([]);
    void reload(clientId);
  }, [clientId]);

  const onPickPhotos = async (event: ChangeEvent<HTMLInputElement>, phase: "before" | "after") => {
    const files = Array.from(event.target.files ?? []);
    event.target.value = "";
    if (!files.length) return;
    try {
      const encoded = await Promise.all(files.map((file) => readDiaryPhoto(file)));
      const setter = phase === "before" ? setPhotosBefore : setPhotosAfter;
      setter((current) => [...current, ...encoded].slice(0, 4));
    } catch (error) {
      onToast(error instanceof Error ? error.message : "Foto non valida.");
    }
  };

  const toggleTag = (tag: DiaryTag) => {
    setForm((current) => ({
      ...current,
      tags: current.tags.includes(tag)
        ? current.tags.filter((item) => item !== tag)
        : [...current.tags, tag]
    }));
  };

  const save = async () => {
    if (saving) return;
    const appointment = clientAppointments.find((item) => item.id === form.appointmentId);
    setSaving(true);
    const result = await createDiaryEntry({
      clientId,
      title: form.title,
      body: form.body,
      tags: form.tags,
      appointmentId: appointment?.id ?? "",
      serviceName: appointment?.service ?? "",
      operatorName: appointment?.operator ?? "",
      occurredAt: new Date().toISOString(),
      photosBefore,
      photosAfter
    });
    setSaving(false);
    if (!result.ok) {
      onToast(result.message);
      return;
    }
    setEntries((current) => [result.data, ...current]);
    setForm(emptyForm);
    setPhotosBefore([]);
    setPhotosAfter([]);
    setComposerOpen(false);
    onToast("Voce di diario salvata");
  };

  const remove = async (id: string) => {
    if (!window.confirm("Eliminare questa voce di diario?")) return;
    const result = await deleteDiaryEntry(id);
    if (!result.ok) {
      onToast(result.message);
      return;
    }
    setEntries((current) => current.filter((entry) => entry.id !== id));
  };

  return (
    <div className="nb-diary">
      <div className="nb-diaryHead">
        <p className="nb-clientSheetEmptyInline">
          {loading ? "Caricamento diario…" : entries.length ? `${entries.length} voci` : "Nessuna voce"}
        </p>
        <button type="button" className="nb-newBtn" onClick={() => setComposerOpen((open) => !open)}>
          <Plus className="nb-newBtnIcon" aria-hidden={true} />
          Nuova voce
        </button>
      </div>

      {composerOpen ? (
        <div className="nb-diaryComposer">
          <label className="nb-drawerField">
            <span className="nb-drawerFieldLabel">Titolo</span>
            <input
              className="nb-drawerInput"
              value={form.title}
              onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
              placeholder="Es. Pulizia viso"
            />
          </label>
          <label className="nb-drawerField">
            <span className="nb-drawerFieldLabel">Nota</span>
            <textarea
              className="nb-drawerTextarea"
              rows={3}
              value={form.body}
              onChange={(event) => setForm((current) => ({ ...current, body: event.target.value }))}
              placeholder="Cosa è stato fatto, reazione della pelle, prossimo passo"
            />
          </label>
          <label className="nb-drawerField">
            <span className="nb-drawerFieldLabel">Appuntamento collegato</span>
            <select
              className="nb-drawerInput"
              value={form.appointmentId}
              onChange={(event) =>
                setForm((current) => ({ ...current, appointmentId: event.target.value }))
              }
            >
              <option value="">Nessuno</option>
              {clientAppointments.map((appointment) => (
                <option key={appointment.id} value={appointment.id}>
                  {appointment.dateLabel} · {appointment.timeLabel} · {appointment.service}
                </option>
              ))}
            </select>
          </label>
          <div className="nb-diaryTags">
            {DIARY_TAGS.map((tag) => (
              <button
                key={tag}
                type="button"
                className={clsx("nb-diaryTag", form.tags.includes(tag) && "isOn")}
                onClick={() => toggleTag(tag)}
              >
                {tag}
              </button>
            ))}
          </div>
          <div className="nb-diaryPhotoPicks">
            <PhotoPick
              label="Prima"
              photos={photosBefore}
              onPick={(event) => void onPickPhotos(event, "before")}
            />
            <PhotoPick
              label="Dopo"
              photos={photosAfter}
              onPick={(event) => void onPickPhotos(event, "after")}
            />
          </div>
          <div className="nb-dialogActions">
            <button type="button" className="nb-ghostBtn" onClick={() => setComposerOpen(false)}>
              Annulla
            </button>
            <button type="button" className="nb-newBtn" onClick={() => void save()} disabled={saving}>
              {saving ? "Salvataggio…" : "Salva voce"}
            </button>
          </div>
        </div>
      ) : null}

      {entries.length ? (
        <ul className="nb-diaryList">
          {entries.map((entry) => (
            <li key={entry.id} className="nb-diaryEntry">
              <div className="nb-diaryEntryTop">
                <div>
                  <div className="nb-diaryEntryTitle">{entry.title}</div>
                  <div className="nb-diaryEntryMeta">
                    {formatWhen(entry.occurredAt)}
                    {entry.serviceName ? ` · ${entry.serviceName}` : ""}
                  </div>
                </div>
                <button
                  type="button"
                  className="nb-diaryDelete"
                  aria-label={`Elimina ${entry.title}`}
                  onClick={() => void remove(entry.id)}
                >
                  <Trash2 aria-hidden={true} />
                </button>
              </div>
              {entry.body ? <p className="nb-diaryEntryBody">{entry.body}</p> : null}
              {entry.tags.length ? (
                <div className="nb-diaryTags">
                  {entry.tags.map((tag) => (
                    <span key={tag} className="nb-diaryTag isOn">
                      {tag}
                    </span>
                  ))}
                </div>
              ) : null}
              {entry.photosBefore.length || entry.photosAfter.length ? (
                <div className="nb-clientSheetPhotos">
                  {entry.photosBefore.map((photo, index) => (
                    <img key={`${entry.id}-before-${index}`} className="nb-diaryPhoto" src={photo} alt="Prima" />
                  ))}
                  {entry.photosAfter.map((photo, index) => (
                    <img key={`${entry.id}-after-${index}`} className="nb-diaryPhoto" src={photo} alt="Dopo" />
                  ))}
                </div>
              ) : null}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

function PhotoPick({
  label,
  photos,
  onPick
}: {
  label: string;
  photos: string[];
  onPick: (event: ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <label className="nb-diaryPhotoPick">
      <Camera aria-hidden={true} />
      <span>
        {label}
        {photos.length ? ` · ${photos.length}` : ""}
      </span>
      <input type="file" accept="image/*" multiple onChange={onPick} />
    </label>
  );
}

function formatWhen(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return new Intl.DateTimeFormat("it-IT", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(date);
}
