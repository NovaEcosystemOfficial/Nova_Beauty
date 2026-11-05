/**
 * Caricamento esplicito dei dati di esempio.
 * Riempie solo le tabelle vuote. Non parte all'avvio e non parte dalle list().
 */
import { AppointmentService } from "./AppointmentService";
import { ClientService } from "./ClientService";
import { InventoryService } from "./InventoryService";
import { ServiceService } from "./ServiceService";
import { SupplierService } from "./SupplierService";

export type SampleSeedCounts = {
  clients: number;
  appointments: number;
  services: number;
  products: number;
  suppliers: number;
};

export function loadSampleData(): SampleSeedCounts {
  return {
    clients: ClientService.getInstance().ensureDemoSeed(),
    appointments: AppointmentService.getInstance().ensureDemoSeed(),
    services: ServiceService.getInstance().ensureDemoSeed(),
    products: InventoryService.getInstance().ensureDemoSeed(),
    suppliers: SupplierService.getInstance().ensureDemoSeed()
  };
}
