/**
 * Diario cliente — orchestrazione IPC.
 */
import type { DiaryEntryCreateInput, DiaryEntryData } from "../models/DiaryEntry";
import { DiaryRepositoryError } from "../repositories/DiaryRepository";
import { DataEngine } from "./DataEngine";

export type DiaryIpcResult<T> =
  | { ok: true; data: T }
  | { ok: false; code: string; message: string };

export class DiaryService {
  private static instance: DiaryService | null = null;

  static getInstance(): DiaryService {
    if (!DiaryService.instance) {
      DiaryService.instance = new DiaryService();
    }
    return DiaryService.instance;
  }

  private repo() {
    return DataEngine.getInstance().diary;
  }

  list(clientId: string): DiaryIpcResult<DiaryEntryData[]> {
    try {
      return { ok: true, data: this.repo().listByClient(clientId).map((entry) => entry.toDto()) };
    } catch (error) {
      return wrapError(error);
    }
  }

  create(input: DiaryEntryCreateInput): DiaryIpcResult<DiaryEntryData> {
    try {
      return { ok: true, data: this.repo().create(input).toDto() };
    } catch (error) {
      return wrapError(error);
    }
  }

  remove(id: string): DiaryIpcResult<{ id: string }> {
    try {
      this.repo().delete(id);
      return { ok: true, data: { id } };
    } catch (error) {
      return wrapError(error);
    }
  }
}

function wrapError(error: unknown): DiaryIpcResult<never> {
  if (error instanceof DiaryRepositoryError) {
    return { ok: false, code: error.code, message: error.message };
  }
  return {
    ok: false,
    code: "UNKNOWN",
    message: error instanceof Error ? error.message : "Errore database sconosciuto."
  };
}
