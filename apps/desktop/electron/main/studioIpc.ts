/**
 * IPC profilo studio e caricamento dati di esempio.
 */
import { ipcMain } from "electron";
import type { CenterProfile } from "../../src/models/Center";
import { CenterService, type CenterIpcResult } from "../../src/services/CenterService";
import { loadSampleData, type SampleSeedCounts } from "../../src/services/SampleDataService";

const CHANNELS = {
  get: "nb:center:get",
  update: "nb:center:update",
  loadSample: "nb:sample:load"
} as const;

export function registerStudioIpcHandlers(): void {
  const center = CenterService.getInstance();

  ipcMain.removeHandler(CHANNELS.get);
  ipcMain.removeHandler(CHANNELS.update);
  ipcMain.removeHandler(CHANNELS.loadSample);

  ipcMain.handle(CHANNELS.get, (): CenterIpcResult<CenterProfile> => {
    return center.get();
  });

  ipcMain.handle(
    CHANNELS.update,
    (_evt, patch: Partial<CenterProfile> = {}): CenterIpcResult<CenterProfile> => {
      return center.update(patch ?? {});
    }
  );

  ipcMain.handle(CHANNELS.loadSample, (): CenterIpcResult<SampleSeedCounts> => {
    try {
      return { ok: true, data: loadSampleData() };
    } catch (error) {
      return {
        ok: false,
        code: "UNKNOWN",
        message: error instanceof Error ? error.message : "Impossibile caricare i dati di esempio."
      };
    }
  });
}
