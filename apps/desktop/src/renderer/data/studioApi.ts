/**
 * Bridge renderer → IPC profilo studio e dati di esempio.
 */
import type { CenterProfile } from "../../models/Center";
import type { ClientIpcResult, SampleSeedCounts } from "../types/novaBeautyApi";

function api() {
  return window.novaBeauty?.studio;
}

export async function getCenter(): Promise<ClientIpcResult<CenterProfile>> {
  const studio = api();
  if (!studio) {
    return { ok: false, code: "NO_IPC", message: "API studio non disponibile." };
  }
  return studio.get();
}

export async function updateCenter(
  patch: Partial<CenterProfile>
): Promise<ClientIpcResult<CenterProfile>> {
  const studio = api();
  if (!studio) {
    return { ok: false, code: "NO_IPC", message: "API studio non disponibile." };
  }
  return studio.update(patch);
}

export async function loadSampleDataRemote(): Promise<ClientIpcResult<SampleSeedCounts>> {
  const studio = api();
  if (!studio) {
    return { ok: false, code: "NO_IPC", message: "API studio non disponibile." };
  }
  return studio.loadSample();
}
