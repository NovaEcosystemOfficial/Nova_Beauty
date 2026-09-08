/**
 * IPC handlers servizi (main process).
 */
import { ipcMain } from "electron";
import type {
  ServiceCreateInput,
  ServiceListQuery,
  ServiceUpdateInput
} from "../../src/models/Service";
import { ServiceService, type IpcResult } from "../../src/services/ServiceService";

const CHANNELS = {
  list: "nb:services:list",
  get: "nb:services:get",
  create: "nb:services:create",
  update: "nb:services:update",
  delete: "nb:services:delete"
} as const;

export function registerServiceIpcHandlers(): void {
  const svc = ServiceService.getInstance();

  ipcMain.removeHandler(CHANNELS.list);
  ipcMain.removeHandler(CHANNELS.get);
  ipcMain.removeHandler(CHANNELS.create);
  ipcMain.removeHandler(CHANNELS.update);
  ipcMain.removeHandler(CHANNELS.delete);

  ipcMain.handle(CHANNELS.list, (_evt, query: ServiceListQuery = {}): IpcResult<unknown> => {
    return svc.list(query);
  });

  ipcMain.handle(CHANNELS.get, (_evt, id: string): IpcResult<unknown> => {
    return svc.get(id);
  });

  ipcMain.handle(CHANNELS.create, (_evt, input: ServiceCreateInput): IpcResult<unknown> => {
    return svc.create(input);
  });

  ipcMain.handle(CHANNELS.update, (_evt, input: ServiceUpdateInput): IpcResult<unknown> => {
    return svc.update(input);
  });

  ipcMain.handle(CHANNELS.delete, (_evt, id: string): IpcResult<unknown> => {
    return svc.remove(id);
  });
}

export { CHANNELS as SERVICE_IPC_CHANNELS };
