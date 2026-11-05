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
import type { InventoryMovementData } from "../../models/InventoryMovement";
import type {
  InventoryMoveInput,
  ProductCreateInput,
  ProductData,
  ProductListQuery,
  ProductUpdateInput
} from "../../models/Product";
import type {
  ServiceCreateInput,
  ServiceData,
  ServiceListQuery,
  ServiceUpdateInput
} from "../../models/Service";
import type { CenterProfile } from "../../models/Center";
import type { DiaryEntryCreateInput, DiaryEntryData } from "../../models/DiaryEntry";
import type {
  SupplierCreateInput,
  SupplierDto,
  SupplierListQuery,
  SupplierUpdateInput
} from "../../models/Supplier";

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

export type NovaBeautyInventoryApi = {
  list: (query?: ProductListQuery) => Promise<ClientIpcResult<ProductData[]>>;
  get: (id: string) => Promise<ClientIpcResult<ProductData | null>>;
  create: (input: ProductCreateInput) => Promise<ClientIpcResult<ProductData>>;
  update: (input: ProductUpdateInput) => Promise<ClientIpcResult<ProductData>>;
  delete: (id: string) => Promise<ClientIpcResult<{ id: string }>>;
  movements: () => Promise<ClientIpcResult<InventoryMovementData[]>>;
  move: (input: InventoryMoveInput) => Promise<ClientIpcResult<ProductData>>;
};

export type NovaBeautySuppliersApi = {
  list: (query?: SupplierListQuery) => Promise<ClientIpcResult<SupplierDto[]>>;
  get: (id: string) => Promise<ClientIpcResult<SupplierDto | null>>;
  create: (input: SupplierCreateInput) => Promise<ClientIpcResult<SupplierDto>>;
  update: (input: SupplierUpdateInput) => Promise<ClientIpcResult<SupplierDto>>;
  delete: (id: string) => Promise<ClientIpcResult<{ id: string }>>;
};

export type SampleSeedCounts = {
  clients: number;
  appointments: number;
  services: number;
  products: number;
  suppliers: number;
};

export type NovaBeautyStudioApi = {
  get: () => Promise<ClientIpcResult<CenterProfile>>;
  update: (patch: Partial<CenterProfile>) => Promise<ClientIpcResult<CenterProfile>>;
  loadSample: () => Promise<ClientIpcResult<SampleSeedCounts>>;
};

export type NovaBeautyDiaryApi = {
  list: (clientId: string) => Promise<ClientIpcResult<DiaryEntryData[]>>;
  create: (input: DiaryEntryCreateInput) => Promise<ClientIpcResult<DiaryEntryData>>;
  delete: (id: string) => Promise<ClientIpcResult<{ id: string }>>;
};

export type NovaBeautyApi = {
  clients: NovaBeautyClientsApi;
  appointments: NovaBeautyAppointmentsApi;
  services: NovaBeautyServicesApi;
  inventory: NovaBeautyInventoryApi;
  suppliers: NovaBeautySuppliersApi;
  studio: NovaBeautyStudioApi;
  diary: NovaBeautyDiaryApi;
};

export type NbLocalApi = {
  invoke: (channel: string, ...args: unknown[]) => Promise<unknown>;
  appointments?: NovaBeautyAppointmentsApi;
  clients?: NovaBeautyClientsApi;
  services?: NovaBeautyServicesApi;
  inventory?: NovaBeautyInventoryApi;
  suppliers?: NovaBeautySuppliersApi;
  studio?: NovaBeautyStudioApi;
  diary?: NovaBeautyDiaryApi;
};

declare global {
  interface Window {
    novaBeauty?: NovaBeautyApi;
    nbLocal?: NbLocalApi;
  }
}

export {};
