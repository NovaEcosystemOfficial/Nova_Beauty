/**
 * Preload — bridge renderer → IPC (Client / Appointment / Service repositories).
 */
import { contextBridge, ipcRenderer } from "electron";

export type ClientIpcResult<T> =
  | { ok: true; data: T }
  | { ok: false; code: string; message: string };

const APPOINTMENT_CHANNELS = [
  "nb:appointments:list",
  "nb:appointments:get",
  "nb:appointments:create",
  "nb:appointments:update",
  "nb:appointments:delete"
] as const;

const CLIENT_CHANNELS = [
  "nb:clients:list",
  "nb:clients:get",
  "nb:clients:create",
  "nb:clients:update",
  "nb:clients:delete"
] as const;

const SERVICE_CHANNELS = [
  "nb:services:list",
  "nb:services:get",
  "nb:services:create",
  "nb:services:update",
  "nb:services:delete"
] as const;

const ALLOWED = new Set<string>([
  ...APPOINTMENT_CHANNELS,
  ...CLIENT_CHANNELS,
  ...SERVICE_CHANNELS
]);

const clientsApi = {
  list: (query?: unknown): Promise<ClientIpcResult<unknown>> =>
    ipcRenderer.invoke("nb:clients:list", query ?? {}),
  get: (id: string): Promise<ClientIpcResult<unknown>> =>
    ipcRenderer.invoke("nb:clients:get", id),
  create: (input: unknown): Promise<ClientIpcResult<unknown>> =>
    ipcRenderer.invoke("nb:clients:create", input),
  update: (input: unknown): Promise<ClientIpcResult<unknown>> =>
    ipcRenderer.invoke("nb:clients:update", input),
  delete: (id: string): Promise<ClientIpcResult<unknown>> =>
    ipcRenderer.invoke("nb:clients:delete", id)
};

const appointmentsApi = {
  list: (query?: unknown): Promise<ClientIpcResult<unknown>> =>
    ipcRenderer.invoke("nb:appointments:list", query ?? {}),
  get: (id: string): Promise<ClientIpcResult<unknown>> =>
    ipcRenderer.invoke("nb:appointments:get", id),
  create: (input: unknown): Promise<ClientIpcResult<unknown>> =>
    ipcRenderer.invoke("nb:appointments:create", input),
  update: (input: unknown): Promise<ClientIpcResult<unknown>> =>
    ipcRenderer.invoke("nb:appointments:update", input),
  delete: (id: string): Promise<ClientIpcResult<unknown>> =>
    ipcRenderer.invoke("nb:appointments:delete", id)
};

const servicesApi = {
  list: (query?: unknown): Promise<ClientIpcResult<unknown>> =>
    ipcRenderer.invoke("nb:services:list", query ?? {}),
  get: (id: string): Promise<ClientIpcResult<unknown>> =>
    ipcRenderer.invoke("nb:services:get", id),
  create: (input: unknown): Promise<ClientIpcResult<unknown>> =>
    ipcRenderer.invoke("nb:services:create", input),
  update: (input: unknown): Promise<ClientIpcResult<unknown>> =>
    ipcRenderer.invoke("nb:services:update", input),
  delete: (id: string): Promise<ClientIpcResult<unknown>> =>
    ipcRenderer.invoke("nb:services:delete", id)
};

function invokeLocal(channel: string, ...args: unknown[]): Promise<unknown> {
  if (!ALLOWED.has(channel)) {
    return Promise.reject(new Error(`Canale IPC non consentito: ${channel}`));
  }
  return ipcRenderer.invoke(channel, ...args);
}

try {
  contextBridge.exposeInMainWorld("novaBeauty", {
    clients: clientsApi,
    appointments: appointmentsApi,
    services: servicesApi
  });
  contextBridge.exposeInMainWorld("nbLocal", {
    invoke: invokeLocal,
    appointments: appointmentsApi,
    clients: clientsApi,
    services: servicesApi
  });
  console.info("[NovaBeauty preload] bridge esposto (novaBeauty + nbLocal + services)");
} catch (error) {
  console.error("[NovaBeauty preload] exposeInMainWorld fallito:", error);
}
