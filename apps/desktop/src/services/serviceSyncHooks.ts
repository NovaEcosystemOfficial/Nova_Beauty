/**
 * Hook sync Firestore — predisposti, non collegati (Sprint 4).
 */
import type { ServiceModel } from "../models/Service";
import type { ServiceSyncHooks } from "../repositories/ServiceRepository";

export const firestoreServiceSyncHooks: ServiceSyncHooks = {
  onLocalCreated: (_service: ServiceModel) => {
    /* futuro: queue upsert → Firestore */
  },
  onLocalUpdated: (_service: ServiceModel) => {
    /* futuro: queue update → Firestore */
  },
  onLocalDeleted: (_id: string) => {
    /* futuro: queue delete → Firestore */
  }
};
