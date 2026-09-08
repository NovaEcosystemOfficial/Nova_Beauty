/**
 * IPC handlers fornitori (main process).
 */
import { ipcMain } from "electron";
import type {
  SupplierCreateInput,
  SupplierListQuery,
  SupplierUpdateInput
} from "../../src/models/Supplier";
import { SupplierService, type IpcResult } from "../../src/services/SupplierService";

const CHANNELS = {
  list: "nb:suppliers:list",
  get: "nb:suppliers:get",
  create: "nb:suppliers:create",
  update: "nb:suppliers:update",
  delete: "nb:suppliers:delete"
} as const;

export function registerSupplierIpcHandlers(): void {
  const svc = SupplierService.getInstance();

  ipcMain.removeHandler(CHANNELS.list);
  ipcMain.removeHandler(CHANNELS.get);
  ipcMain.removeHandler(CHANNELS.create);
  ipcMain.removeHandler(CHANNELS.update);
  ipcMain.removeHandler(CHANNELS.delete);

  ipcMain.handle(CHANNELS.list, (_evt, query: SupplierListQuery = {}): IpcResult<unknown> => {
    return svc.list(query);
  });

  ipcMain.handle(CHANNELS.get, (_evt, id: string): IpcResult<unknown> => {
    return svc.get(id);
  });

  ipcMain.handle(CHANNELS.create, (_evt, input: SupplierCreateInput): IpcResult<unknown> => {
    return svc.create(input);
  });

  ipcMain.handle(CHANNELS.update, (_evt, input: SupplierUpdateInput): IpcResult<unknown> => {
    return svc.update(input);
  });

  ipcMain.handle(CHANNELS.delete, (_evt, id: string): IpcResult<unknown> => {
    return svc.remove(id);
  });
}

export { CHANNELS as SUPPLIER_IPC_CHANNELS };
