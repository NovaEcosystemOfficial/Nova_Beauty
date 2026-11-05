/**
 * IPC diario cliente.
 */
import { ipcMain } from "electron";
import type { DiaryEntryCreateInput } from "../../src/models/DiaryEntry";
import { DiaryService, type DiaryIpcResult } from "../../src/services/DiaryService";

const CHANNELS = {
  list: "nb:diary:list",
  create: "nb:diary:create",
  delete: "nb:diary:delete"
} as const;

export function registerDiaryIpcHandlers(): void {
  const diary = DiaryService.getInstance();

  ipcMain.removeHandler(CHANNELS.list);
  ipcMain.removeHandler(CHANNELS.create);
  ipcMain.removeHandler(CHANNELS.delete);

  ipcMain.handle(CHANNELS.list, (_evt, clientId: string): DiaryIpcResult<unknown> => {
    return diary.list(typeof clientId === "string" ? clientId : "");
  });

  ipcMain.handle(CHANNELS.create, (_evt, input: DiaryEntryCreateInput): DiaryIpcResult<unknown> => {
    return diary.create(input ?? { clientId: "", title: "" });
  });

  ipcMain.handle(CHANNELS.delete, (_evt, id: string): DiaryIpcResult<unknown> => {
    return diary.remove(typeof id === "string" ? id : "");
  });
}
