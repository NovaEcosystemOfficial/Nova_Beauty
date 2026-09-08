/**
 * Hook sync Firestore magazzino — predisposti, non collegati (B1).
 */
import type { ProductModel } from "../models/Product";
import type { InventorySyncHooks } from "../repositories/InventoryRepository";

export const firestoreInventorySyncHooks: InventorySyncHooks = {
  onLocalCreated: (_product: ProductModel) => {
    /* futuro: queue upsert → Firestore */
  },
  onLocalUpdated: (_product: ProductModel) => {
    /* futuro: queue update → Firestore */
  },
  onLocalDeleted: (_id: string) => {
    /* futuro: queue delete → Firestore */
  }
};
