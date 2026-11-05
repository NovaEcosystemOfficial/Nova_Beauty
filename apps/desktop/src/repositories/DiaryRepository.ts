/**
 * Diario cliente — CRUD su `diary_entries`.
 */
import { createEntityId, nowIso, type SqlMap } from "../core/types";
import {
  DiaryEntryModel,
  normalizeDiaryTags,
  type DiaryEntryCreateInput,
  type DiaryEntryData
} from "../models/DiaryEntry";
import { BaseRepository } from "./BaseRepository";

export class DiaryRepositoryError extends Error {
  readonly code: string;

  constructor(code: string, message: string) {
    super(message);
    this.name = "DiaryRepositoryError";
    this.code = code;
  }
}

const MAX_PHOTOS = 4;
const MAX_PHOTO_CHARS = 1_500_000;

function cleanPhotos(photos: string[] | undefined): string[] {
  const next = (photos ?? []).filter((photo) => photo.startsWith("data:image/"));
  if (next.length > MAX_PHOTOS) {
    throw new DiaryRepositoryError("TOO_MANY_PHOTOS", `Massimo ${MAX_PHOTOS} foto per fase.`);
  }
  for (const photo of next) {
    if (photo.length > MAX_PHOTO_CHARS) {
      throw new DiaryRepositoryError("PHOTO_TOO_LARGE", "Una foto è troppo pesante.");
    }
  }
  return next;
}

export class DiaryRepository extends BaseRepository {
  constructor() {
    super("diary_entries");
  }

  listByClient(clientId: string): DiaryEntryModel[] {
    const rows = this.db()
      .prepare(
        `SELECT * FROM diary_entries WHERE client_id = ? ORDER BY occurred_at DESC, created_at DESC`
      )
      .all(clientId) as SqlMap[];
    return rows.map((row) => DiaryEntryModel.fromMap(row));
  }

  create(input: DiaryEntryCreateInput): DiaryEntryModel {
    const clientId = input.clientId.trim();
    const title = input.title.trim();
    const body = (input.body ?? "").trim();
    if (!clientId) {
      throw new DiaryRepositoryError("CLIENT_REQUIRED", "Manca il cliente.");
    }
    if (!title && !body) {
      throw new DiaryRepositoryError("TEXT_REQUIRED", "Scrivi un titolo o una nota.");
    }

    const now = nowIso();
    const model = new DiaryEntryModel({
      id: createEntityId(),
      createdAt: now,
      updatedAt: now,
      clientId,
      occurredAt: input.occurredAt?.trim() || now,
      title: title || "Nota",
      body,
      tags: normalizeDiaryTags(input.tags),
      appointmentId: input.appointmentId?.trim() ?? "",
      serviceName: input.serviceName?.trim() ?? "",
      operatorName: input.operatorName?.trim() ?? "",
      photosBefore: cleanPhotos(input.photosBefore),
      photosAfter: cleanPhotos(input.photosAfter)
    });

    this.db()
      .prepare(
        `INSERT INTO diary_entries (
          id, created_at, updated_at, client_id, occurred_at, title, body, tags_json,
          appointment_id, service_name, operator_name, photos_before_json, photos_after_json
        ) VALUES (
          @id, @created_at, @updated_at, @client_id, @occurred_at, @title, @body, @tags_json,
          @appointment_id, @service_name, @operator_name, @photos_before_json, @photos_after_json
        )`
      )
      .run(model.toMap());
    return model;
  }

  delete(id: string): void {
    const info = this.db().prepare(`DELETE FROM diary_entries WHERE id = ?`).run(id);
    if (info.changes === 0) {
      throw new DiaryRepositoryError("NOT_FOUND", "Voce di diario non trovata.");
    }
  }

  deleteByClient(clientId: string): void {
    this.db().prepare(`DELETE FROM diary_entries WHERE client_id = ?`).run(clientId);
  }
}

export type { DiaryEntryData };
