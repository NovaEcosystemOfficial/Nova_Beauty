/**
 * Bridge renderer → IPC diario cliente.
 */
import type { DiaryEntryCreateInput, DiaryEntryData } from "../../models/DiaryEntry";
import type { ClientIpcResult } from "../types/novaBeautyApi";

function api() {
  return window.novaBeauty?.diary;
}

export async function listDiary(
  clientId: string
): Promise<ClientIpcResult<DiaryEntryData[]>> {
  const diary = api();
  if (!diary) {
    return { ok: false, code: "NO_IPC", message: "API diario non disponibile." };
  }
  return diary.list(clientId);
}

export async function createDiaryEntry(
  input: DiaryEntryCreateInput
): Promise<ClientIpcResult<DiaryEntryData>> {
  const diary = api();
  if (!diary) {
    return { ok: false, code: "NO_IPC", message: "API diario non disponibile." };
  }
  return diary.create(input);
}

export async function deleteDiaryEntry(id: string): Promise<ClientIpcResult<{ id: string }>> {
  const diary = api();
  if (!diary) {
    return { ok: false, code: "NO_IPC", message: "API diario non disponibile." };
  }
  return diary.delete(id);
}

export async function readDiaryPhoto(file: File): Promise<string> {
  const bitmap = await createImageBitmap(file);
  const maxEdge = 1280;
  const scale = Math.min(1, maxEdge / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(bitmap.width * scale));
  canvas.height = Math.max(1, Math.round(bitmap.height * scale));
  const context = canvas.getContext("2d");
  if (!context) {
    bitmap.close();
    throw new Error("Impossibile leggere la foto.");
  }
  context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  return canvas.toDataURL("image/jpeg", 0.82);
}
