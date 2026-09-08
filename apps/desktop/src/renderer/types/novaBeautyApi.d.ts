/**
 * Tipi window.novaBeauty per il renderer (solo models — no repositories).
 */
import type {
  AppointmentCreateInput,
  AppointmentData,
  AppointmentListQuery,
  AppointmentUpdateInput
} from "../../models/Appointment";
import type {
  ClientCreateInput,
  ClientData,
  ClientListQuery,
  ClientUpdateInput
} from "../../models/Client";
import type {
  ServiceCreateInput,
  ServiceData,
  ServiceListQuery,
  ServiceUpdateInput
} from "../../models/Service";

export type ClientIpcResult<T> =
  | { ok: true; data: T }
  | { ok: false; code: string; message: string };

export type NovaBeautyClientsApi = {
  list: (query?: ClientListQuery) => Promise<ClientIpcResult<ClientData[]>>;
  get: (id: string) => Promise<ClientIpcResult<ClientData | null>>;
  create: (input: ClientCreateInput) => Promise<ClientIpcResult<ClientData>>;
  update: (input: ClientUpdateInput) => Promise<ClientIpcResult<ClientData>>;
  delete: (id: string) => Promise<ClientIpcResult<{ id: string }>>;
};

export type NovaBeautyAppointmentsApi = {
  list: (query?: AppointmentListQuery) => Promise<ClientIpcResult<AppointmentData[]>>;
  get: (id: string) => Promise<ClientIpcResult<AppointmentData | null>>;
  create: (input: AppointmentCreateInput) => Promise<ClientIpcResult<AppointmentData>>;
  update: (input: AppointmentUpdateInput) => Promise<ClientIpcResult<AppointmentData>>;
  delete: (id: string) => Promise<ClientIpcResult<{ id: string }>>;
};

export type NovaBeautyServicesApi = {
  list: (query?: ServiceListQuery) => Promise<ClientIpcResult<ServiceData[]>>;
  get: (id: string) => Promise<ClientIpcResult<ServiceData | null>>;
  create: (input: ServiceCreateInput) => Promise<ClientIpcResult<ServiceData>>;
  update: (input: ServiceUpdateInput) => Promise<ClientIpcResult<ServiceData>>;
  delete: (id: string) => Promise<ClientIpcResult<{ id: string }>>;
};

export type NovaBeautyApi = {
  clients: NovaBeautyClientsApi;
  appointments: NovaBeautyAppointmentsApi;
  services: NovaBeautyServicesApi;
};

export type NbLocalApi = {
  invoke: (channel: string, ...args: unknown[]) => Promise<unknown>;
  appointments?: NovaBeautyAppointmentsApi;
  clients?: NovaBeautyClientsApi;
  services?: NovaBeautyServicesApi;
};

declare global {
  interface Window {
    novaBeauty?: NovaBeautyApi;
    nbLocal?: NbLocalApi;
  }
}

export {};
