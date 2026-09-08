/**
 * Model Notifica — tabella `notifications`.
 */
import { createEntityId, nowIso, readBool, readString, type SqlMap } from "../core/types";
import type { EntityTimestamps } from "./BaseEntity";

export type NotificationData = EntityTimestamps & {
  title: string;
  body: string;
  channel: string;
  tone: string;
  read: boolean;
};

export class NotificationModel {
  readonly id: string;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly title: string;
  readonly body: string;
  readonly channel: string;
  readonly tone: string;
  readonly read: boolean;

  constructor(data: NotificationData) {
    this.id = data.id;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
    this.title = data.title;
    this.body = data.body;
    this.channel = data.channel;
    this.tone = data.tone;
    this.read = data.read;
  }

  static fromMap(map: SqlMap): NotificationModel {
    return new NotificationModel({
      id: readString(map, "id") || createEntityId(),
      createdAt: readString(map, "created_at", readString(map, "createdAt", nowIso())),
      updatedAt: readString(map, "updated_at", readString(map, "updatedAt", nowIso())),
      title: readString(map, "title"),
      body: readString(map, "body"),
      channel: readString(map, "channel", "desktop"),
      tone: readString(map, "tone", "info"),
      read: readBool(map, "read")
    });
  }

  toMap(): SqlMap {
    return {
      id: this.id,
      created_at: this.createdAt,
      updated_at: this.updatedAt,
      title: this.title,
      body: this.body,
      channel: this.channel,
      tone: this.tone,
      read: this.read ? 1 : 0
    };
  }

  copyWith(patch: Partial<NotificationData>): NotificationModel {
    return new NotificationModel({
      id: patch.id ?? this.id,
      createdAt: patch.createdAt ?? this.createdAt,
      updatedAt: patch.updatedAt ?? nowIso(),
      title: patch.title ?? this.title,
      body: patch.body ?? this.body,
      channel: patch.channel ?? this.channel,
      tone: patch.tone ?? this.tone,
      read: patch.read ?? this.read
    });
  }
}
