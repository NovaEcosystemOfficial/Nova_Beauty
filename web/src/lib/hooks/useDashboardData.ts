"use client";

import {
  Timestamp,
  collection,
  doc,
  limit,
  onSnapshot,
  orderBy,
  query,
  where
} from "firebase/firestore";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { db } from "@/lib/firebase/client";
import { appointmentsPath, clientsPath, profilePath, servicesPath } from "@/lib/firebase/paths";
import { routes } from "@/lib/constants/routes";
import type { AppointmentDocument, ClientDocument, ProfileDocument, ServiceDocument } from "@/types/firestore";

export type DashboardAppointment = AppointmentDocument & { id: string };

export type DashboardData = {
  profile: Partial<ProfileDocument> | null;
  clients: ClientDocument[];
  services: ServiceDocument[];
  todayAppointments: DashboardAppointment[];
  weekAppointments: DashboardAppointment[];
  upcomingAppointments: DashboardAppointment[];
};

const initialDashboardData: DashboardData = {
  profile: null,
  clients: [],
  services: [],
  todayAppointments: [],
  weekAppointments: [],
  upcomingAppointments: []
};

function startOfToday() {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date;
}

function startOfTomorrow() {
  const date = startOfToday();
  date.setDate(date.getDate() + 1);
  return date;
}

function startOfWeek() {
  const date = startOfToday();
  const day = date.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  date.setDate(date.getDate() + diff);
  return date;
}

export function useDashboardData() {
  const { user } = useAuth();
  const [data, setData] = useState<DashboardData>(initialDashboardData);
  const [loadingSections, setLoadingSections] = useState({
    profile: true,
    clients: true,
    services: true,
    todayAppointments: true,
    weekAppointments: true,
    upcomingAppointments: true
  });
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) {
      return;
    }

    setError("");
    const todayStart = Timestamp.fromDate(startOfToday());
    const tomorrowStart = Timestamp.fromDate(startOfTomorrow());
    const weekStart = Timestamp.fromDate(startOfWeek());

    const unsubscribers = [
      onSnapshot(
        doc(db, profilePath(user.uid)),
        (snapshot) => {
          setData((current) => ({
            ...current,
            profile: snapshot.exists() ? (snapshot.data() as Partial<ProfileDocument>) : null
          }));
          setLoadingSections((current) => ({ ...current, profile: false }));
        },
        () => {
          setError("Non siamo riusciti ad aggiornare la dashboard.");
          setLoadingSections((current) => ({ ...current, profile: false }));
        }
      ),
      onSnapshot(
        query(collection(db, clientsPath(user.uid)), orderBy("name", "asc"), limit(100)),
        (snapshot) => {
          setData((current) => ({
            ...current,
            clients: snapshot.docs.map((clientDoc) => clientDoc.data() as ClientDocument)
          }));
          setLoadingSections((current) => ({ ...current, clients: false }));
        },
        () => {
          setError("Non siamo riusciti ad aggiornare la dashboard.");
          setLoadingSections((current) => ({ ...current, clients: false }));
        }
      ),
      onSnapshot(
        query(collection(db, servicesPath(user.uid)), orderBy("name", "asc"), limit(100)),
        (snapshot) => {
          setData((current) => ({
            ...current,
            services: snapshot.docs.map((serviceDoc) => serviceDoc.data() as ServiceDocument)
          }));
          setLoadingSections((current) => ({ ...current, services: false }));
        },
        () => {
          setError("Non siamo riusciti ad aggiornare la dashboard.");
          setLoadingSections((current) => ({ ...current, services: false }));
        }
      ),
      onSnapshot(
        query(
          collection(db, appointmentsPath(user.uid)),
          where("date", ">=", todayStart),
          where("date", "<", tomorrowStart),
          orderBy("date", "asc")
        ),
        (snapshot) => {
          setData((current) => ({
            ...current,
            todayAppointments: snapshot.docs.map((appointmentDoc) => ({
              id: appointmentDoc.id,
              ...(appointmentDoc.data() as AppointmentDocument)
            }))
          }));
          setLoadingSections((current) => ({ ...current, todayAppointments: false }));
        },
        () => {
          setError("Non siamo riusciti ad aggiornare la dashboard.");
          setLoadingSections((current) => ({ ...current, todayAppointments: false }));
        }
      ),
      onSnapshot(
        query(collection(db, appointmentsPath(user.uid)), where("date", ">=", todayStart), orderBy("date", "asc"), limit(5)),
        (snapshot) => {
          setData((current) => ({
            ...current,
            upcomingAppointments: snapshot.docs.map((appointmentDoc) => ({
              id: appointmentDoc.id,
              ...(appointmentDoc.data() as AppointmentDocument)
            }))
          }));
          setLoadingSections((current) => ({ ...current, upcomingAppointments: false }));
        },
        () => {
          setError("Non siamo riusciti ad aggiornare la dashboard.");
          setLoadingSections((current) => ({ ...current, upcomingAppointments: false }));
        }
      ),
      onSnapshot(
        query(collection(db, appointmentsPath(user.uid)), where("date", ">=", weekStart), orderBy("date", "asc"), limit(200)),
        (snapshot) => {
          setData((current) => ({
            ...current,
            weekAppointments: snapshot.docs.map((appointmentDoc) => ({
              id: appointmentDoc.id,
              ...(appointmentDoc.data() as AppointmentDocument)
            }))
          }));
          setLoadingSections((current) => ({ ...current, weekAppointments: false }));
        },
        () => {
          setError("Non siamo riusciti ad aggiornare la dashboard.");
          setLoadingSections((current) => ({ ...current, weekAppointments: false }));
        }
      )
    ];

    return () => {
      unsubscribers.forEach((unsubscribe) => unsubscribe());
    };
  }, [user]);

  const isLoading = Object.values(loadingSections).some(Boolean);

  const profileComplete = Boolean(
    data.profile?.businessName && data.profile?.ownerName && data.profile?.email && data.profile?.phone
  );

  const todayRevenue = useMemo(
    () =>
      data.todayAppointments
        .filter((appointment) => appointment.status === "Completato")
        .reduce((total, appointment) => total + (appointment.price || 0), 0),
    [data.todayAppointments]
  );

  const setupActions = useMemo(
    () =>
      [
        {
          title: "Completa il profilo",
          href: routes.studioMioStudio,
          done: profileComplete
        },
        {
          title: "Aggiungi il primo cliente",
          href: routes.clients,
          done: data.clients.length > 0
        },
        {
          title: "Crea il primo servizio",
          href: routes.services,
          done: data.services.length > 0
        },
        {
          title: "Programma il primo appuntamento",
          href: routes.appointments,
          done: data.upcomingAppointments.length > 0 || data.todayAppointments.length > 0
        }
      ].filter((action) => !action.done)
        .slice(0, 2),
    [
      data.clients.length,
      data.services.length,
      data.todayAppointments.length,
      data.upcomingAppointments.length,
      profileComplete
    ]
  );

  const nextAppointment = data.todayAppointments[0] ?? data.upcomingAppointments[0] ?? null;

  return {
    data,
    isLoading,
    error,
    profileComplete,
    todayRevenue,
    setupActions,
    nextAppointment,
    ownerName: data.profile?.ownerName || data.profile?.displayName || user?.displayName || "",
    businessName: data.profile?.businessName || "NovaBeauty"
  };
}
