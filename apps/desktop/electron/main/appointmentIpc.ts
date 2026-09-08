/**
 * IPC handlers appuntamenti (main process).
 */
import { ipcMain } from "electron";
import type {
  AppointmentCreateInput,
  AppointmentListQuery,
  AppointmentUpdateInput
} from "../../src/models/Appointment";
import { AppointmentService, type IpcResult } from "../../src/services/AppointmentService";

const CHANNELS = {
  list: "nb:appointments:list",
  get: "nb:appointments:get",
  create: "nb:appointments:create",
  update: "nb:appointments:update",
  delete: "nb:appointments:delete"
} as const;

export function registerAppointmentIpcHandlers(): void {
  const svc = AppointmentService.getInstance();

  // removeHandler evita crash su hot-reload del main process
  ipcMain.removeHandler(CHANNELS.list);
  ipcMain.removeHandler(CHANNELS.get);
  ipcMain.removeHandler(CHANNELS.create);
  ipcMain.removeHandler(CHANNELS.update);
  ipcMain.removeHandler(CHANNELS.delete);

  ipcMain.handle(CHANNELS.list, (_evt, query: AppointmentListQuery = {}): IpcResult<unknown> => {
    return svc.list(query);
  });

  ipcMain.handle(CHANNELS.get, (_evt, id: string): IpcResult<unknown> => {
    return svc.get(id);
  });

  ipcMain.handle(
    CHANNELS.create,
    (_evt, input: AppointmentCreateInput): IpcResult<unknown> => {
      return svc.create(input);
    }
  );

  ipcMain.handle(
    CHANNELS.update,
    (_evt, input: AppointmentUpdateInput): IpcResult<unknown> => {
      return svc.update(input);
    }
  );

  ipcMain.handle(CHANNELS.delete, (_evt, id: string): IpcResult<unknown> => {
    return svc.remove(id);
  });
}

export { CHANNELS as APPOINTMENT_IPC_CHANNELS };
