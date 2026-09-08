/**
 * Contratto base per i model del motore dati locale.
 * Ogni entità espone fromMap / toMap / copyWith + timestamp.
 */
import type { EntityTimestamps, SqlMap } from "../core/types";

export type { EntityTimestamps, SqlMap };

export interface EntityModel<T extends EntityTimestamps> {
  readonly id: string;
  readonly createdAt: string;
  readonly updatedAt: string;
  toMap(): SqlMap;
  copyWith(patch: Partial<T>): EntityModel<T>;
}
