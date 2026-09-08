/**
 * Model Centro estetico — tabella `center` (singola riga logica).
 */
import { createEntityId, nowIso, readString, type SqlMap } from "../core/types";
import type { EntityTimestamps } from "./BaseEntity";

export type CenterData = EntityTimestamps & {
  name: string;
  slogan: string;
  address: string;
  phone: string;
  email: string;
  logoUrl: string;
  ownerName: string;
};

export class CenterModel {
  readonly id: string;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly name: string;
  readonly slogan: string;
  readonly address: string;
  readonly phone: string;
  readonly email: string;
  readonly logoUrl: string;
  readonly ownerName: string;

  constructor(data: CenterData) {
    this.id = data.id;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
    this.name = data.name;
    this.slogan = data.slogan;
    this.address = data.address;
    this.phone = data.phone;
    this.email = data.email;
    this.logoUrl = data.logoUrl;
    this.ownerName = data.ownerName;
  }

  static fromMap(map: SqlMap): CenterModel {
    return new CenterModel({
      id: readString(map, "id") || createEntityId(),
      createdAt: readString(map, "created_at", readString(map, "createdAt", nowIso())),
      updatedAt: readString(map, "updated_at", readString(map, "updatedAt", nowIso())),
      name: readString(map, "name"),
      slogan: readString(map, "slogan"),
      address: readString(map, "address"),
      phone: readString(map, "phone"),
      email: readString(map, "email"),
      logoUrl: readString(map, "logo_url", readString(map, "logoUrl")),
      ownerName: readString(map, "owner_name", readString(map, "ownerName"))
    });
  }

  toMap(): SqlMap {
    return {
      id: this.id,
      created_at: this.createdAt,
      updated_at: this.updatedAt,
      name: this.name,
      slogan: this.slogan,
      address: this.address,
      phone: this.phone,
      email: this.email,
      logo_url: this.logoUrl,
      owner_name: this.ownerName
    };
  }

  copyWith(patch: Partial<CenterData>): CenterModel {
    return new CenterModel({
      id: patch.id ?? this.id,
      createdAt: patch.createdAt ?? this.createdAt,
      updatedAt: patch.updatedAt ?? nowIso(),
      name: patch.name ?? this.name,
      slogan: patch.slogan ?? this.slogan,
      address: patch.address ?? this.address,
      phone: patch.phone ?? this.phone,
      email: patch.email ?? this.email,
      logoUrl: patch.logoUrl ?? this.logoUrl,
      ownerName: patch.ownerName ?? this.ownerName
    });
  }
}
