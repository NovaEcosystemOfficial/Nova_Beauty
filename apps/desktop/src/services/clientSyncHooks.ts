/**
 * Hook sync Firestore — predisposti, non collegati (Sprint 2).
 * Sprint future: implementare push/pull reale senza cambiare il repository.
 */
import type { ClientModel } from "../models/Client";
import type { ClientSyncHooks } from "../repositories/ClientRepository";

/**
 * Stub no-op. Sostituire con adapter Firestore senza alterare ClientRepository.
 */
export const firestoreClientSyncHooks: ClientSyncHooks = {
  onLocalCreated: (_client: ClientModel) => {
    /* futuro: queue upsert → Firestore */
  },
  onLocalUpdated: (_client: ClientModel) => {
    /* futuro: queue update → Firestore */
  },
  onLocalDeleted: (_id: string) => {
    /* futuro: queue delete → Firestore */
  }
};
