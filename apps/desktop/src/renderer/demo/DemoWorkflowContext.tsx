import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode
} from "react";

export type ApptStatus = "confermato" | "da_confermare" | "completato" | "annullato";

export type WorkflowClient = {
  id: string;
  name: string;
  phone: string;
  email: string;
  birthday: string;
  notes: string;
  favorite: boolean;
  status: "attivo" | "inattivo" | "nuovo";
  lastAppointment: string;
  lastTreatment: string;
  nextAppointment: string;
  totalSpent: number;
  fidelityPoints: number;
  tags: string[];
  diaryPlaceholders: string[];
  historyLines: string[];
};

export type WorkflowAppointment = {
  id: string;
  clientId: string;
  client: string;
  phone: string;
  email: string;
  service: string;
  operator: string;
  cabin: string;
  dateLabel: string;
  timeLabel: string;
  startMin: number;
  durationMin: number;
  price: number;
  notes: string;
  status: ApptStatus;
  dayOffset: number;
  history: string;
  lastTreatment: string;
  isNew?: boolean;
  justCompleted?: boolean;
};

export type ActivityItem = {
  id: string;
  time: string;
  text: string;
  isNew?: boolean;
};

export type ToastItem = {
  id: string;
  message: string;
};

export type NewAppointmentDraft = {
  clientId: string;
  client: string;
  phone: string;
  email: string;
  operator: string;
  cabin: string;
  service: string;
  dateLabel: string;
  timeLabel: string;
  durationMin: number;
  price: number;
  notes: string;
};

type DemoWorkflowValue = {
  clients: WorkflowClient[];
  appointments: WorkflowAppointment[];
  activities: ActivityItem[];
  toasts: ToastItem[];
  appointmentsToday: number;
  revenueExpected: number;
  revenueCompleted: number;
  inventoryScaledHint: boolean;
  reportsPulse: boolean;
  newApptDrawerOpen: boolean;
  newApptClientId: string | null;
  detailApptId: string | null;
  completeDialogOpen: boolean;
  openNewAppointment: (clientId: string) => void;
  closeNewAppointment: () => void;
  bookAppointment: (draft: NewAppointmentDraft) => void;
  openAppointmentDetail: (id: string) => void;
  closeAppointmentDetail: () => void;
  openCompleteDialog: () => void;
  closeCompleteDialog: () => void;
  completeAppointment: (payload: {
    amount: number;
    paymentMethod: string;
    products: string;
    notes: string;
  }) => void;
  dismissToast: (id: string) => void;
  getClient: (id: string) => WorkflowClient | undefined;
  clearApptFlags: (id: string) => void;
};

const INITIAL_CLIENTS: WorkflowClient[] = [
  {
    id: "c1",
    name: "Giulia Rossi",
    phone: "+39 340 112 8890",
    email: "giulia.rossi@email.it",
    birthday: "12 marzo",
    notes: "Preferisce trattamenti mattutini. Pelle sensibile — evitare retinolo.",
    favorite: true,
    status: "attivo",
    lastAppointment: "2 ago 2026",
    lastTreatment: "Pulizia viso deep",
    nextAppointment: "Oggi · 09:00",
    totalSpent: 1240,
    fidelityPoints: 180,
    tags: ["VIP", "Viso"],
    diaryPlaceholders: ["Before/After viso", "Mappa zone", "Follow-up"],
    historyLines: ["Pulizia viso · 2 ago", "Peeling · 15 giu", "Idratazione · 2 mag"]
  },
  {
    id: "c2",
    name: "Sara Bianchi",
    phone: "+39 333 441 2098",
    email: "sara.b@email.it",
    birthday: "4 luglio",
    notes: "Chiedere conferma SMS 24h prima.",
    favorite: true,
    status: "attivo",
    lastAppointment: "28 lug 2026",
    lastTreatment: "Massaggio rilassante",
    nextAppointment: "Oggi · 11:30",
    totalSpent: 860,
    fidelityPoints: 95,
    tags: ["Massaggi"],
    diaryPlaceholders: ["Zona schiena", "Preferenze olio"],
    historyLines: ["Massaggio · 28 lug", "Pressoterapia · 10 giu"]
  },
  {
    id: "c3",
    name: "Elena Conti",
    phone: "+39 348 990 4412",
    email: "elena.conti@email.it",
    birthday: "22 gennaio",
    notes: "Allergia a lattice. Preferisce cabina 2.",
    favorite: false,
    status: "attivo",
    lastAppointment: "20 lug 2026",
    lastTreatment: "Epilazione gambe",
    nextAppointment: "Oggi · 14:15",
    totalSpent: 620,
    fidelityPoints: 70,
    tags: ["Epilazione"],
    diaryPlaceholders: ["Zone trattate"],
    historyLines: ["Epilazione · 20 lug", "Epilazione · 18 giu"]
  },
  {
    id: "c4",
    name: "Marta Greco",
    phone: "+39 347 221 0088",
    email: "marta.greco@email.it",
    birthday: "9 settembre",
    notes: "Ciclo trucco permanente in corso (3a seduta).",
    favorite: false,
    status: "attivo",
    lastAppointment: "15 lug 2026",
    lastTreatment: "Trucco permanente",
    nextAppointment: "Oggi · 16:00",
    totalSpent: 1890,
    fidelityPoints: 240,
    tags: ["VIP", "PMU"],
    diaryPlaceholders: ["Sopracciglia", "Pigmento"],
    historyLines: ["PMU · 15 lug", "PMU · 20 mag"]
  },
  {
    id: "c5",
    name: "Chiara Ferri",
    phone: "+39 331 778 4501",
    email: "chiara.ferri@email.it",
    birthday: "30 novembre",
    notes: "Nuova cliente — scheda anamnesi da completare.",
    favorite: false,
    status: "nuovo",
    lastAppointment: "—",
    lastTreatment: "—",
    nextAppointment: "8 ago · 10:00",
    totalSpent: 0,
    fidelityPoints: 0,
    tags: ["Nuova"],
    diaryPlaceholders: ["Anamnesi"],
    historyLines: []
  },
  {
    id: "c6",
    name: "Laura Neri",
    phone: "+39 339 120 6677",
    email: "laura.neri@email.it",
    birthday: "18 maggio",
    notes: "Non risponde da 3 mesi. Riattivazione consigliata.",
    favorite: false,
    status: "inattivo",
    lastAppointment: "12 apr 2026",
    lastTreatment: "Manicure spa",
    nextAppointment: "Non pianificato",
    totalSpent: 410,
    fidelityPoints: 40,
    tags: ["Da richiamare"],
    diaryPlaceholders: [],
    historyLines: ["Manicure · 12 apr"]
  },
  {
    id: "c7",
    name: "Francesca Villa",
    phone: "+39 345 889 3310",
    email: "f.villa@email.it",
    birthday: "2 febbraio",
    notes: "Pacchetto 5 sedute — 2 rimanenti.",
    favorite: true,
    status: "attivo",
    lastAppointment: "30 lug 2026",
    lastTreatment: "Pressoterapia",
    nextAppointment: "12 ago · 15:30",
    totalSpent: 980,
    fidelityPoints: 110,
    tags: ["Pacchetto"],
    diaryPlaceholders: ["Gambe", "Circonferenze"],
    historyLines: ["Pressoterapia · 30 lug", "Pressoterapia · 16 lug"]
  },
  {
    id: "c8",
    name: "Valentina Russo",
    phone: "+39 320 554 7788",
    email: "v.russo@email.it",
    birthday: "27 agosto",
    notes: "Preferisce prodotti bio. Budget medio-alto.",
    favorite: false,
    status: "attivo",
    lastAppointment: "25 lug 2026",
    lastTreatment: "Peeling enzimatico",
    nextAppointment: "19 ago · 11:00",
    totalSpent: 745,
    fidelityPoints: 85,
    tags: ["Viso", "Bio"],
    diaryPlaceholders: ["Texture pelle"],
    historyLines: ["Peeling · 25 lug", "Pulizia · 1 giu"]
  }
];

const INITIAL_APPOINTMENTS: WorkflowAppointment[] = [
  {
    id: "a1",
    clientId: "c1",
    client: "Giulia Rossi",
    phone: "+39 340 112 8890",
    email: "giulia.rossi@email.it",
    service: "Pulizia viso deep",
    operator: "Fabio",
    cabin: "Cabina 1",
    dateLabel: "Mer 5 ago 2026",
    timeLabel: "09:00",
    startMin: 60,
    durationMin: 60,
    price: 65,
    notes: "Pelle sensibile. Cabina 1 preferita.",
    status: "confermato",
    dayOffset: 0,
    history: "Cliente VIP · 12 visite",
    lastTreatment: "Peeling enzimatico · 15 giu"
  },
  {
    id: "a2",
    clientId: "c2",
    client: "Sara Bianchi",
    phone: "+39 333 441 2098",
    email: "sara.b@email.it",
    service: "Massaggio rilassante",
    operator: "Fabio",
    cabin: "Cabina 1",
    dateLabel: "Mer 5 ago 2026",
    timeLabel: "11:30",
    startMin: 210,
    durationMin: 60,
    price: 55,
    notes: "Conferma SMS inviata ieri.",
    status: "da_confermare",
    dayOffset: 0,
    history: "8 visite · pacchetto massaggi 3/5",
    lastTreatment: "Massaggio · 28 lug"
  },
  {
    id: "a3",
    clientId: "c3",
    client: "Elena Conti",
    phone: "+39 348 990 4412",
    email: "elena.conti@email.it",
    service: "Epilazione gambe",
    operator: "Laura",
    cabin: "Cabina 2",
    dateLabel: "Mer 5 ago 2026",
    timeLabel: "14:15",
    startMin: 375,
    durationMin: 45,
    price: 40,
    notes: "Allergia lattice — guanti nitrile.",
    status: "confermato",
    dayOffset: 0,
    history: "6 visite · cabina 2",
    lastTreatment: "Epilazione · 20 lug"
  },
  {
    id: "a4",
    clientId: "c4",
    client: "Marta Greco",
    phone: "+39 347 221 0088",
    email: "marta.greco@email.it",
    service: "Trucco permanente",
    operator: "Fabio",
    cabin: "Cabina 1",
    dateLabel: "Mer 5 ago 2026",
    timeLabel: "16:00",
    startMin: 480,
    durationMin: 90,
    price: 180,
    notes: "3ª seduta ciclo PMU.",
    status: "confermato",
    dayOffset: 0,
    history: "Ciclo PMU in corso",
    lastTreatment: "PMU · 15 lug"
  },
  {
    id: "a5",
    clientId: "c5",
    client: "Chiara Ferri",
    phone: "+39 331 778 4501",
    email: "chiara.ferri@email.it",
    service: "Consulenza nuova cliente",
    operator: "Laura",
    cabin: "Cabina 3",
    dateLabel: "Mer 5 ago 2026",
    timeLabel: "10:00",
    startMin: 120,
    durationMin: 30,
    price: 0,
    notes: "Anamnesi da completare.",
    status: "completato",
    dayOffset: 0,
    history: "Prima visita",
    lastTreatment: "—"
  },
  {
    id: "a6",
    clientId: "c6",
    client: "Laura Neri",
    phone: "+39 339 120 6677",
    email: "laura.neri@email.it",
    service: "Manicure spa",
    operator: "Laura",
    cabin: "Cabina 2",
    dateLabel: "Mer 5 ago 2026",
    timeLabel: "13:00",
    startMin: 300,
    durationMin: 45,
    price: 35,
    notes: "Ha annullato.",
    status: "annullato",
    dayOffset: 0,
    history: "4 visite",
    lastTreatment: "Manicure · 12 apr"
  },
  {
    id: "a7",
    clientId: "c7",
    client: "Francesca Villa",
    phone: "+39 345 889 3310",
    email: "f.villa@email.it",
    service: "Pressoterapia",
    operator: "Fabio",
    cabin: "Cabina 2",
    dateLabel: "Gio 6 ago 2026",
    timeLabel: "09:30",
    startMin: 90,
    durationMin: 45,
    price: 45,
    notes: "Pacchetto attivo",
    status: "confermato",
    dayOffset: 1,
    history: "Pacchetto attivo",
    lastTreatment: "Pressoterapia · 30 lug"
  },
  {
    id: "a8",
    clientId: "c8",
    client: "Valentina Russo",
    phone: "+39 320 554 7788",
    email: "v.russo@email.it",
    service: "Peeling enzimatico",
    operator: "Laura",
    cabin: "Cabina 1",
    dateLabel: "Ven 7 ago 2026",
    timeLabel: "11:00",
    startMin: 180,
    durationMin: 60,
    price: 80,
    notes: "Prodotti bio",
    status: "da_confermare",
    dayOffset: 2,
    history: "5 visite",
    lastTreatment: "Peeling · 25 lug"
  }
];

const INITIAL_ACTIVITIES: ActivityItem[] = [
  { id: "act1", time: "09:00", text: "Nuovo cliente creato" },
  { id: "act2", time: "09:15", text: "Appuntamento prenotato" },
  { id: "act3", time: "10:30", text: "Pagamento registrato" },
  { id: "act4", time: "11:00", text: "Prodotto scaricato" }
];

function parseTimeToStartMin(timeLabel: string): number {
  const [h, m] = timeLabel.split(":").map(Number);
  return (h - 8) * 60 + (m || 0);
}

function nowTimeLabel(): string {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

const DemoWorkflowContext = createContext<DemoWorkflowValue | null>(null);

export function DemoWorkflowProvider({ children }: { children: ReactNode }) {
  const [clients, setClients] = useState(INITIAL_CLIENTS);
  const [appointments, setAppointments] = useState(INITIAL_APPOINTMENTS);
  const [activities, setActivities] = useState(INITIAL_ACTIVITIES);
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [appointmentsToday, setAppointmentsToday] = useState(8);
  const [revenueExpected, setRevenueExpected] = useState(375);
  const [revenueCompleted, setRevenueCompleted] = useState(0);
  const [inventoryScaledHint, setInventoryScaledHint] = useState(false);
  const [reportsPulse, setReportsPulse] = useState(false);
  const [newApptDrawerOpen, setNewApptDrawerOpen] = useState(false);
  const [newApptClientId, setNewApptClientId] = useState<string | null>(null);
  const [detailApptId, setDetailApptId] = useState<string | null>(null);
  const [completeDialogOpen, setCompleteDialogOpen] = useState(false);

  const pushToast = useCallback((message: string) => {
    const id = `t-${Date.now()}`;
    setToasts((prev) => [...prev, { id, message }]);
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3200);
  }, []);

  const pushActivity = useCallback((text: string) => {
    const item: ActivityItem = {
      id: `act-${Date.now()}`,
      time: nowTimeLabel(),
      text,
      isNew: true
    };
    setActivities((prev) => [item, ...prev].slice(0, 12));
    window.setTimeout(() => {
      setActivities((prev) => prev.map((a) => (a.id === item.id ? { ...a, isNew: false } : a)));
    }, 1800);
  }, []);

  const openNewAppointment = useCallback((clientId: string) => {
    setNewApptClientId(clientId);
    setNewApptDrawerOpen(true);
  }, []);

  const closeNewAppointment = useCallback(() => {
    setNewApptDrawerOpen(false);
  }, []);

  const bookAppointment = useCallback(
    (draft: NewAppointmentDraft) => {
      const id = `wf-${Date.now()}`;
      const appt: WorkflowAppointment = {
        id,
        clientId: draft.clientId,
        client: draft.client,
        phone: draft.phone,
        email: draft.email,
        service: draft.service,
        operator: draft.operator,
        cabin: draft.cabin,
        dateLabel: draft.dateLabel,
        timeLabel: draft.timeLabel,
        startMin: parseTimeToStartMin(draft.timeLabel),
        durationMin: draft.durationMin,
        price: draft.price,
        notes: draft.notes,
        status: "confermato",
        dayOffset: 0,
        history: "Appuntamento creato da workflow demo",
        lastTreatment: "—",
        isNew: true
      };

      setAppointments((prev) => [...prev, appt]);
      setAppointmentsToday((n) => n + 1);
      setRevenueExpected((n) => n + draft.price);
      setClients((prev) =>
        prev.map((c) =>
          c.id === draft.clientId
            ? { ...c, nextAppointment: `Oggi · ${draft.timeLabel}` }
            : c
        )
      );
      setNewApptDrawerOpen(false);
      pushToast("Appuntamento creato");
      pushActivity(`Appuntamento prenotato · ${draft.client}`);

      window.setTimeout(() => {
        setAppointments((prev) =>
          prev.map((a) => (a.id === id ? { ...a, isNew: false } : a))
        );
      }, 2200);
    },
    [pushActivity, pushToast]
  );

  const openAppointmentDetail = useCallback((id: string) => {
    setDetailApptId(id);
  }, []);

  const closeAppointmentDetail = useCallback(() => {
    setDetailApptId(null);
    setCompleteDialogOpen(false);
  }, []);

  const openCompleteDialog = useCallback(() => {
    setCompleteDialogOpen(true);
  }, []);

  const closeCompleteDialog = useCallback(() => {
    setCompleteDialogOpen(false);
  }, []);

  const completeAppointment = useCallback(
    (payload: {
      amount: number;
      paymentMethod: string;
      products: string;
      notes: string;
    }) => {
      if (!detailApptId) return;
      const apptId = detailApptId;

      setAppointments((prev) => {
        const appt = prev.find((a) => a.id === apptId);
        if (!appt) return prev;

        queueMicrotask(() => {
          setClients((clientsPrev) =>
            clientsPrev.map((c) => {
              if (c.id !== appt.clientId) return c;
              return {
                ...c,
                totalSpent: c.totalSpent + payload.amount,
                fidelityPoints: c.fidelityPoints + Math.max(5, Math.round(payload.amount / 10)),
                lastTreatment: appt.service,
                lastAppointment: "Oggi",
                historyLines: [
                  `${appt.service} · oggi · €${payload.amount}`,
                  ...c.historyLines
                ].slice(0, 8)
              };
            })
          );
        });

        return prev.map((a) =>
          a.id === apptId
            ? {
                ...a,
                status: "completato" as const,
                price: payload.amount,
                notes: payload.notes || a.notes,
                justCompleted: true
              }
            : a
        );
      });

      setRevenueCompleted((n) => n + payload.amount);
      setInventoryScaledHint(true);
      setReportsPulse(true);
      setCompleteDialogOpen(false);
      setDetailApptId(null);
      pushToast("Appuntamento completato");
      pushActivity(`Pagamento registrato · €${payload.amount} · ${payload.paymentMethod}`);
      pushActivity(
        payload.products
          ? `Prodotto scaricato · ${payload.products}`
          : "Prodotto scaricato · magazzino"
      );

      window.setTimeout(() => setReportsPulse(false), 2400);
      window.setTimeout(() => {
        setAppointments((prev) =>
          prev.map((a) => (a.id === apptId ? { ...a, justCompleted: false } : a))
        );
      }, 2000);
    },
    [detailApptId, pushActivity, pushToast]
  );

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const getClient = useCallback(
    (id: string) => clients.find((c) => c.id === id),
    [clients]
  );

  const clearApptFlags = useCallback((id: string) => {
    setAppointments((prev) =>
      prev.map((a) => (a.id === id ? { ...a, isNew: false, justCompleted: false } : a))
    );
  }, []);

  const value = useMemo<DemoWorkflowValue>(
    () => ({
      clients,
      appointments,
      activities,
      toasts,
      appointmentsToday,
      revenueExpected,
      revenueCompleted,
      inventoryScaledHint,
      reportsPulse,
      newApptDrawerOpen,
      newApptClientId,
      detailApptId,
      completeDialogOpen,
      openNewAppointment,
      closeNewAppointment,
      bookAppointment,
      openAppointmentDetail,
      closeAppointmentDetail,
      openCompleteDialog,
      closeCompleteDialog,
      completeAppointment,
      dismissToast,
      getClient,
      clearApptFlags
    }),
    [
      clients,
      appointments,
      activities,
      toasts,
      appointmentsToday,
      revenueExpected,
      revenueCompleted,
      inventoryScaledHint,
      reportsPulse,
      newApptDrawerOpen,
      newApptClientId,
      detailApptId,
      completeDialogOpen,
      openNewAppointment,
      closeNewAppointment,
      bookAppointment,
      openAppointmentDetail,
      closeAppointmentDetail,
      openCompleteDialog,
      closeCompleteDialog,
      completeAppointment,
      dismissToast,
      getClient,
      clearApptFlags
    ]
  );

  return <DemoWorkflowContext.Provider value={value}>{children}</DemoWorkflowContext.Provider>;
}

export function useDemoWorkflow(): DemoWorkflowValue {
  const ctx = useContext(DemoWorkflowContext);
  if (!ctx) throw new Error("useDemoWorkflow must be used within DemoWorkflowProvider");
  return ctx;
}
