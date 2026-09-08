/**
 * IPC handlers magazzino (main process).
 */
import { ipcMain } from "electron";
import type { InventoryMoveInput, ProductCreateInput, ProductListQuery, ProductUpdateInput } from "../../src/models/Product";
import { InventoryService, type IpcResult } from "../../src/services/InventoryService";

const CHANNELS = {
  list: "nb:inventory:list",
  get: "nb:inventory:get",
  create: "nb:inventory:create",
  update: "nb:inventory:update",
  delete: "nb:inventory:delete",
  movements: "nb:inventory:movements",
  move: "nb:inventory:move"
} as const;

export function registerInventoryIpcHandlers(): void {
  const svc = InventoryService.getInstance();

  ipcMain.removeHandler(CHANNELS.list);
  ipcMain.removeHandler(CHANNELS.get);
  ipcMain.removeHandler(CHANNELS.create);
  ipcMain.removeHandler(CHANNELS.update);
  ipcMain.removeHandler(CHANNELS.delete);
  ipcMain.removeHandler(CHANNELS.movements);
  ipcMain.removeHandler(CHANNELS.move);

  ipcMain.handle(CHANNELS.list, (_evt, query: ProductListQuery = {}): IpcResult<unknown> => {
    return svc.list(query);
  });

  ipcMain.handle(CHANNELS.get, (_evt, id: string): IpcResult<unknown> => {
    return svc.get(id);
  });

  ipcMain.handle(CHANNELS.create, (_evt, input: ProductCreateInput): IpcResult<unknown> => {
    return svc.create(input);
  });

  ipcMain.handle(CHANNELS.update, (_evt, input: ProductUpdateInput): IpcResult<unknown> => {
    return svc.update(input);
  });

  ipcMain.handle(CHANNELS.delete, (_evt, id: string): IpcResult<unknown> => {
    return svc.remove(id);
  });

  ipcMain.handle(CHANNELS.movements, (): IpcResult<unknown> => {
    return svc.movements();
  });

  ipcMain.handle(CHANNELS.move, (_evt, input: InventoryMoveInput): IpcResult<unknown> => {
    return svc.move(input);
  });
}

export { CHANNELS as INVENTORY_IPC_CHANNELS };
