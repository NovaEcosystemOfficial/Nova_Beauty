/**
 * Hook sync Firestore appuntamenti — predisposti, non collegati (Sprint 3).
 */
import type { AppointmentModel } from "../models/Appointment";
import type { AppointmentSyncHooks } from "../repositories/AppointmentRepository";

export const firestoreAppointmentSyncHooks: AppointmentSyncHooks = {
  onLocalCreated: (_appointment: AppointmentModel) => {
    /* futuro: queue upsert → Firestore */
  },
  onLocalUpdated: (_appointment: AppointmentModel) => {
    /* futuro: queue update → Firestore */
  },
  onLocalDeleted: (_id: string) => {
    /* futuro: queue delete → Firestore */
  }
};
