/**
 * IPC handlers clienti (main process).
 */
import { ipcMain } from "electron";
import {
  ClientService,
  type IpcResult
} from "../../src/services/ClientService";
import type {
  ClientCreateInput,
  ClientListQuery,
  ClientUpdateInput
} from "../../src/models/Client";

const CHANNELS = {
  list: "nb:clients:list",
  get: "nb:clients:get",
  create: "nb:clients:create",
  update: "nb:clients:update",
  delete: "nb:clients:delete"
} as const;

export function registerClientIpcHandlers(): void {
  const svc = ClientService.getInstance();

  // removeHandler evita crash su hot-reload del main process
  ipcMain.removeHandler(CHANNELS.list);
  ipcMain.removeHandler(CHANNELS.get);
  ipcMain.removeHandler(CHANNELS.create);
  ipcMain.removeHandler(CHANNELS.update);
  ipcMain.removeHandler(CHANNELS.delete);

  ipcMain.handle(CHANNELS.list, (_evt, query: ClientListQuery = {}): IpcResult<unknown> => {
    return svc.list(query);
  });

  ipcMain.handle(CHANNELS.get, (_evt, id: string): IpcResult<unknown> => {
    return svc.get(id);
  });

  ipcMain.handle(CHANNELS.create, (_evt, input: ClientCreateInput): IpcResult<unknown> => {
    return svc.create(input);
  });

  ipcMain.handle(CHANNELS.update, (_evt, input: ClientUpdateInput): IpcResult<unknown> => {
    return svc.update(input);
  });

  ipcMain.handle(CHANNELS.delete, (_evt, id: string): IpcResult<unknown> => {
    return svc.remove(id);
  });
}

export { CHANNELS as CLIENT_IPC_CHANNELS };
