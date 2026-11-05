/**
 * Voce di diario cliente — tabella `diary_entries`.
 */
import { createEntityId, nowIso, readString, type SqlMap } from "../core/types";
import type { EntityTimestamps } from "./BaseEntity";

export const DIARY_TAGS = ["PMU", "Viso", "Corpo", "Unghie", "Ciglia", "Altro"] as const;

export type DiaryTag = (typeof DIARY_TAGS)[number];

export type DiaryEntryData = EntityTimestamps & {
  clientId: string;
  occurredAt: string;
  title: string;
  body: string;
  tags: DiaryTag[];
  appointmentId: string;
  serviceName: string;
  operatorName: string;
  photosBefore: string[];
  photosAfter: string[];
};

export type DiaryEntryCreateInput = {
  clientId: string;
  occurredAt?: string;
  title: string;
  body?: string;
  tags?: string[];
  appointmentId?: string;
  serviceName?: string;
  operatorName?: string;
  photosBefore?: string[];
  photosAfter?: string[];
};

function parseStringList(raw: string): string[] {
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item): item is string => typeof item === "string" && item.length > 0);
  } catch {
    return [];
  }
}

export function normalizeDiaryTags(tags: string[] | undefined): DiaryTag[] {
  const allowed = new Set<string>(DIARY_TAGS);
  const unique: DiaryTag[] = [];
  for (const tag of tags ?? []) {
    const value = tag.trim();
    if (!allowed.has(value) || unique.includes(value as DiaryTag)) continue;
    unique.push(value as DiaryTag);
  }
  return unique;
}

export class DiaryEntryModel {
  readonly id: string;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly clientId: string;
  readonly occurredAt: string;
  readonly title: string;
  readonly body: string;
  readonly tags: DiaryTag[];
  readonly appointmentId: string;
  readonly serviceName: string;
  readonly operatorName: string;
  readonly photosBefore: string[];
  readonly photosAfter: string[];

  constructor(data: DiaryEntryData) {
    this.id = data.id;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
    this.clientId = data.clientId;
    this.occurredAt = data.occurredAt;
    this.title = data.title;
    this.body = data.body;
    this.tags = data.tags;
    this.appointmentId = data.appointmentId;
    this.serviceName = data.serviceName;
    this.operatorName = data.operatorName;
    this.photosBefore = data.photosBefore;
    this.photosAfter = data.photosAfter;
  }

  static fromMap(map: SqlMap): DiaryEntryModel {
    return new DiaryEntryModel({
      id: readString(map, "id") || createEntityId(),
      createdAt: readString(map, "created_at", readString(map, "createdAt", nowIso())),
      updatedAt: readString(map, "updated_at", readString(map, "updatedAt", nowIso())),
      clientId: readString(map, "client_id", readString(map, "clientId")),
      occurredAt: readString(map, "occurred_at", readString(map, "occurredAt", nowIso())),
      title: readString(map, "title"),
      body: readString(map, "body"),
      tags: normalizeDiaryTags(parseStringList(readString(map, "tags_json", readString(map, "tagsJson", "[]")))),
      appointmentId: readString(map, "appointment_id", readString(map, "appointmentId")),
      serviceName: readString(map, "service_name", readString(map, "serviceName")),
      operatorName: readString(map, "operator_name", readString(map, "operatorName")),
      photosBefore: parseStringList(
        readString(map, "photos_before_json", readString(map, "photosBeforeJson", "[]"))
      ),
      photosAfter: parseStringList(
        readString(map, "photos_after_json", readString(map, "photosAfterJson", "[]"))
      )
    });
  }

  toMap(): SqlMap {
    return {
      id: this.id,
      created_at: this.createdAt,
      updated_at: this.updatedAt,
      client_id: this.clientId,
      occurred_at: this.occurredAt,
      title: this.title,
      body: this.body,
      tags_json: JSON.stringify(this.tags),
      appointment_id: this.appointmentId,
      service_name: this.serviceName,
      operator_name: this.operatorName,
      photos_before_json: JSON.stringify(this.photosBefore),
      photos_after_json: JSON.stringify(this.photosAfter)
    };
  }

  toDto(): DiaryEntryData {
    return {
      id: this.id,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      clientId: this.clientId,
      occurredAt: this.occurredAt,
      title: this.title,
      body: this.body,
      tags: this.tags,
      appointmentId: this.appointmentId,
      serviceName: this.serviceName,
      operatorName: this.operatorName,
      photosBefore: this.photosBefore,
      photosAfter: this.photosAfter
    };
  }
}
