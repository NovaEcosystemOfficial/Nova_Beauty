/**
 * Hook sync Firestore fornitori — predisposti, non collegati (B2).
 */
import type { SupplierModel } from "../models/Supplier";
import type { SupplierSyncHooks } from "../repositories/SupplierRepository";

export const firestoreSupplierSyncHooks: SupplierSyncHooks = {
  onLocalCreated: (_supplier: SupplierModel) => {
    /* futuro: queue upsert → Firestore */
  },
  onLocalUpdated: (_supplier: SupplierModel) => {
    /* futuro: queue update → Firestore */
  },
  onLocalDeleted: (_id: string) => {
    /* futuro: queue delete → Firestore */
  }
};
