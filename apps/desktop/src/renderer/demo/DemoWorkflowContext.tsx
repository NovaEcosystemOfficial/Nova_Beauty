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

export type WorkflowService = {
  id: string;
  name: string;
  category: string;
  durationMin: number;
  price: number;
  products: string;
  operators: string[];
  color: string;
};

export type SupplierStatus = "attivo" | "disattivo";

export type SupplierReorderMethod = "sito" | "email" | "whatsapp" | "telefono" | "manuale";

export type SupplierLinkedProduct = {
  name: string;
  sku: string;
  stockHint: string;
};

export type WorkflowSupplier = {
  id: string;
  name: string;
  category: string;
  status: SupplierStatus;
  lastOrder: string;
  contact: string;
  phone: string;
  email: string;
  whatsapp: string;
  website: string;
  catalogUrl: string;
  address: string;
  vat: string;
  avgDelivery: string;
  minOrder: string;
  reorderMethod: SupplierReorderMethod;
  notes: string;
  productsCount: number;
  ordersValue: string;
  reliability: string;
  logoTone: "primary" | "mint" | "gold" | "lavender" | "rose";
  logoInitials: string;
  linkedProducts: SupplierLinkedProduct[];
};

export type DesktopNavKey =
  | "dashboard"
  | "agenda"
  | "clients"
  | "services"
  | "inventory"
  | "suppliers"
  | "studio"
  | "reports"
  | "settings";

export type NewClientDraft = {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  birthday: string;
  preferredOperator: string;
  privacyConsent: boolean;
  notes: string;
  gender?: string;
  address?: string;
  city?: string;
  zip?: string;
  fiscalCode?: string;
  marketingConsent?: boolean;
  profilePhoto?: boolean;
  allergies?: string;
  pathologies?: string;
  preferences?: string;
};

export type NewServiceDraft = {
  category: string;
  name: string;
  durationMin: number;
  price: number;
  products: string;
  operators: string[];
  color: string;
};

export type NewSupplierDraft = {
  name: string;
  category: string;
  contact: string;
  phone: string;
  email: string;
  whatsapp?: string;
  website?: string;
  catalogUrl?: string;
  address?: string;
  vat?: string;
  avgDelivery?: string;
  minOrder?: string;
  reorderMethod?: SupplierReorderMethod;
  notes: string;
};

export type SupplierUpdateDraft = NewSupplierDraft & {
  status?: SupplierStatus;
};

type DemoWorkflowValue = {
  clients: WorkflowClient[];
  services: WorkflowService[];
  suppliers: WorkflowSupplier[];
  appointments: WorkflowAppointment[];
  activities: ActivityItem[];
  toasts: ToastItem[];
  appointmentsToday: number;
  revenueExpected: number;
  revenueCompleted: number;
  inventoryScaledHint: boolean;
  reportsPulse: boolean;
  studioName: string;
  studioLogoUrl: string | null;
  setStudioName: (name: string) => void;
  setStudioLogoUrl: (url: string | null) => void;
  newApptDrawerOpen: boolean;
  newApptClientId: string | null;
  newClientWizardOpen: boolean;
  lastCreatedClientId: string | null;
  detailApptId: string | null;
  completeDialogOpen: boolean;
  navRequest: { key: DesktopNavKey; token: number } | null;
  inventoryFocusCode: string | null;
  supplierFocusKey: string | null;
  openNewAppointment: (clientId?: string | null) => void;
  closeNewAppointment: () => void;
  setNewApptClientId: (clientId: string | null) => void;
  openNewClientWizard: () => void;
  closeNewClientWizard: () => void;
  clearLastCreatedClientId: () => void;
  bookAppointment: (draft: NewAppointmentDraft) => void;
  createClient: (draft: NewClientDraft) => string;
  createService: (draft: NewServiceDraft) => string;
  createSupplier: (draft: NewSupplierDraft) => string;
  updateSupplier: (id: string, draft: SupplierUpdateDraft) => void;
  toggleSupplierStatus: (id: string) => void;
  deleteSupplier: (id: string) => void;
  openInventoryProduct: (productCode: string) => void;
  openSupplierModule: (supplierIdOrName: string) => void;
  clearInventoryFocus: () => void;
  clearSupplierFocus: () => void;
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
  pushToast: (message: string) => void;
  getClient: (id: string) => WorkflowClient | undefined;
  getService: (id: string) => WorkflowService | undefined;
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

const INITIAL_SERVICES: WorkflowService[] = [
  {
    id: "svc1",
    name: "Pulizia viso deep",
    category: "Viso",
    durationMin: 60,
    price: 65,
    products: "Cleanser enzyme, Maschera argilla",
    operators: ["Fabio", "Laura"],
    color: "#c45c6a"
  },
  {
    id: "svc2",
    name: "Massaggio rilassante",
    category: "Massaggi",
    durationMin: 60,
    price: 55,
    products: "Olio mandorle",
    operators: ["Laura"],
    color: "#7a6bb0"
  },
  {
    id: "svc3",
    name: "Epilazione gambe",
    category: "Epilazione",
    durationMin: 45,
    price: 40,
    products: "Cera liposolubile",
    operators: ["Fabio", "Laura"],
    color: "#5a6b7a"
  },
  {
    id: "svc4",
    name: "Peeling enzimatico",
    category: "Viso",
    durationMin: 45,
    price: 80,
    products: "Peeling enzyme bio",
    operators: ["Fabio"],
    color: "#c45c6a"
  },
  {
    id: "svc5",
    name: "Pressoterapia",
    category: "Corpo",
    durationMin: 45,
    price: 45,
    products: "—",
    operators: ["Laura"],
    color: "#3d9b84"
  }
];

const INITIAL_SUPPLIERS: WorkflowSupplier[] = [
  {
    id: "f1",
    name: "DermLab Italia",
    category: "Dermocosmesi",
    status: "attivo",
    lastOrder: "1 ago 2026",
    contact: "Marco Bianchi",
    phone: "+39 02 8899 1100",
    email: "ordini@dermlab.it",
    whatsapp: "+39 340 112 2200",
    website: "https://dermlab.it",
    catalogUrl: "https://dermlab.it/catalogo",
    address: "Via Tortona 12, Milano",
    vat: "IT12345678901",
    avgDelivery: "3–4 giorni",
    minOrder: "€150",
    reorderMethod: "sito",
    notes: "Listino B2B aggiornato mensilmente. Sconto 5% oltre €500.",
    productsCount: 4,
    ordersValue: "€4.280",
    reliability: "98%",
    logoTone: "primary",
    logoInitials: "DL",
    linkedProducts: [
      { name: "Crema viso idratante", sku: "CR-VIS-01", stockHint: "18 pz" },
      { name: "Crema corpo nutriente", sku: "CR-COR-02", stockHint: "Scorta bassa" },
      { name: "Crema lenitiva post", sku: "CR-LN-03", stockHint: "6 pz" },
      { name: "Siero partner kit", sku: "SR-KIT-01", stockHint: "Catalogo" }
    ]
  },
  {
    id: "f2",
    name: "GlowSupply",
    category: "Dermocosmesi",
    status: "attivo",
    lastOrder: "28 lug 2026",
    contact: "Elena Verdi",
    phone: "+39 06 4455 7788",
    email: "hello@glowsupply.com",
    whatsapp: "+39 333 990 4411",
    website: "https://glowsupply.com",
    catalogUrl: "https://glowsupply.com/b2b",
    address: "Via Appia Nuova 88, Roma",
    vat: "IT98765432109",
    avgDelivery: "2 giorni",
    minOrder: "€100",
    reorderMethod: "email",
    notes: "Preferisce ordini via email con PDF allegato.",
    productsCount: 2,
    ordersValue: "€2.140",
    reliability: "95%",
    logoTone: "gold",
    logoInitials: "GS",
    linkedProducts: [
      { name: "Siero vitamina C", sku: "SR-VC-01", stockHint: "11 pz" },
      { name: "Siero acido ialuronico", sku: "SR-HA-02", stockHint: "Esaurito" }
    ]
  },
  {
    id: "f3",
    name: "BeautyRaw",
    category: "Consumabili",
    status: "attivo",
    lastOrder: "20 lug 2026",
    contact: "Sara Neri",
    phone: "+39 051 220 3344",
    email: "ordini@beautyraw.it",
    whatsapp: "+39 348 771 0099",
    website: "https://beautyraw.it",
    catalogUrl: "https://beautyraw.it/shop",
    address: "Via Emilia 45, Bologna",
    vat: "IT11223344556",
    avgDelivery: "4–5 giorni",
    minOrder: "€80",
    reorderMethod: "whatsapp",
    notes: "Riordino rapido su WhatsApp Business.",
    productsCount: 2,
    ordersValue: "€980",
    reliability: "92%",
    logoTone: "mint",
    logoInitials: "BR",
    linkedProducts: [
      { name: "Maschera argilla verde", sku: "MS-AR-01", stockHint: "14 pz" },
      { name: "Maschera tessuto HA", sku: "MS-TS-02", stockHint: "Scorta bassa" }
    ]
  },
  {
    id: "f4",
    name: "SafeClinic",
    category: "Monouso",
    status: "attivo",
    lastOrder: "30 lug 2026",
    contact: "Luca Conti",
    phone: "+39 011 556 7788",
    email: "vendite@safeclinic.it",
    whatsapp: "+39 320 445 6677",
    website: "https://safeclinic.it",
    catalogUrl: "https://safeclinic.it/catalogo-pdf",
    address: "Corso Francia 210, Torino",
    vat: "IT55667788990",
    avgDelivery: "1–2 giorni",
    minOrder: "€50",
    reorderMethod: "telefono",
    notes: "Consegna espresso su Torino e provincia.",
    productsCount: 2,
    ordersValue: "€1.560",
    reliability: "99%",
    logoTone: "rose",
    logoInitials: "SC",
    linkedProducts: [
      { name: "Guanti nitrile M", sku: "MN-GN-M", stockHint: "120 pz" },
      { name: "Lenzuolino monouso", sku: "MN-LZ-01", stockHint: "Scorta bassa" }
    ]
  },
  {
    id: "f5",
    name: "WaxPro",
    category: "Cera & Depilazione",
    status: "attivo",
    lastOrder: "22 lug 2026",
    contact: "Anna Greco",
    phone: "+39 081 334 5566",
    email: "ordini@waxpro.it",
    whatsapp: "+39 347 889 0011",
    website: "https://waxpro.it",
    catalogUrl: "https://waxpro.it/listino",
    address: "Via Toledo 100, Napoli",
    vat: "IT66778899001",
    avgDelivery: "5 giorni",
    minOrder: "€120",
    reorderMethod: "sito",
    notes: "Portale riordino con tracking lotto.",
    productsCount: 2,
    ordersValue: "€760",
    reliability: "90%",
    logoTone: "lavender",
    logoInitials: "WP",
    linkedProducts: [
      { name: "Strisce depilatorie", sku: "CN-ST-01", stockHint: "Esaurito" },
      { name: "Cera professionale hot", sku: "CN-CW-01", stockHint: "7 pz" }
    ]
  },
  {
    id: "f6",
    name: "StudioTech",
    category: "Attrezzature",
    status: "attivo",
    lastOrder: "15 giu 2026",
    contact: "Paolo Ferri",
    phone: "+39 02 1122 3344",
    email: "support@studiotech.eu",
    whatsapp: "+39 331 220 9988",
    website: "https://studiotech.eu",
    catalogUrl: "https://studiotech.eu/equipment",
    address: "Via Mecenate 76, Milano",
    vat: "IT77889900112",
    avgDelivery: "7–10 giorni",
    minOrder: "€300",
    reorderMethod: "manuale",
    notes: "Preventivi attrezzature su richiesta. Assistenza inclusa 12 mesi.",
    productsCount: 1,
    ordersValue: "€180",
    reliability: "94%",
    logoTone: "lavender",
    logoInitials: "ST",
    linkedProducts: [{ name: "Lampada LED magnifier", sku: "AT-LED-01", stockHint: "2 pz" }]
  },
  {
    id: "f7",
    name: "BodyFlow",
    category: "Consumabili",
    status: "disattivo",
    lastOrder: "4 ago 2026",
    contact: "Giulia Romano",
    phone: "+39 055 778 9900",
    email: "b2b@bodyflow.it",
    whatsapp: "+39 339 554 1122",
    website: "https://bodyflow.it",
    catalogUrl: "https://bodyflow.it/refill",
    address: "Via della Scala 9, Firenze",
    vat: "IT33445566778",
    avgDelivery: "3 giorni",
    minOrder: "€90",
    reorderMethod: "email",
    notes: "Temporaneamente sospeso — rinnovo contratto in corso.",
    productsCount: 1,
    ordersValue: "€420",
    reliability: "88%",
    logoTone: "mint",
    logoInitials: "BF",
    linkedProducts: [{ name: "Gel refill pressoterapia", sku: "CN-GL-01", stockHint: "Scorta bassa" }]
  },
  {
    id: "f8",
    name: "NaturalOil Co",
    category: "Dermocosmesi",
    status: "attivo",
    lastOrder: "3 ago 2026",
    contact: "Francesca Villa",
    phone: "+39 049 221 3344",
    email: "ordini@naturaloil.co",
    whatsapp: "+39 345 667 8899",
    website: "https://naturaloil.co",
    catalogUrl: "https://naturaloil.co/oils",
    address: "Via Roma 15, Padova",
    vat: "IT22334455667",
    avgDelivery: "2–3 giorni",
    minOrder: "€60",
    reorderMethod: "whatsapp",
    notes: "Oli bio certificati. Pack da 6 pezzi.",
    productsCount: 1,
    ordersValue: "€310",
    reliability: "96%",
    logoTone: "gold",
    logoInitials: "NO",
    linkedProducts: [{ name: "Olio mandorle dolci", sku: "OL-MD-01", stockHint: "9 pz" }]
  }
];

function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "NF";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
}

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
  const [services, setServices] = useState(INITIAL_SERVICES);
  const [suppliers, setSuppliers] = useState(INITIAL_SUPPLIERS);
  const [appointments, setAppointments] = useState(INITIAL_APPOINTMENTS);
  const [activities, setActivities] = useState(INITIAL_ACTIVITIES);
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [appointmentsToday, setAppointmentsToday] = useState(8);
  const [revenueExpected, setRevenueExpected] = useState(375);
  const [revenueCompleted, setRevenueCompleted] = useState(0);
  const [inventoryScaledHint, setInventoryScaledHint] = useState(false);
  const [reportsPulse, setReportsPulse] = useState(false);
  const [studioName, setStudioName] = useState("NovaBeauty Milano Centro");
  const [studioLogoUrl, setStudioLogoUrl] = useState<string | null>(null);
  const [newApptDrawerOpen, setNewApptDrawerOpen] = useState(false);
  const [newApptClientId, setNewApptClientId] = useState<string | null>(null);
  const [newClientWizardOpen, setNewClientWizardOpen] = useState(false);
  const [lastCreatedClientId, setLastCreatedClientId] = useState<string | null>(null);
  const [detailApptId, setDetailApptId] = useState<string | null>(null);
  const [completeDialogOpen, setCompleteDialogOpen] = useState(false);
  const [navRequest, setNavRequest] = useState<{ key: DesktopNavKey; token: number } | null>(null);
  const [inventoryFocusCode, setInventoryFocusCode] = useState<string | null>(null);
  const [supplierFocusKey, setSupplierFocusKey] = useState<string | null>(null);

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

  const openNewAppointment = useCallback((clientId?: string | null) => {
    setNewApptClientId(clientId ?? null);
    setNewApptDrawerOpen(true);
  }, []);

  const closeNewAppointment = useCallback(() => {
    setNewApptDrawerOpen(false);
  }, []);

  const openNewClientWizard = useCallback(() => {
    setNewClientWizardOpen(true);
  }, []);

  const closeNewClientWizard = useCallback(() => {
    setNewClientWizardOpen(false);
  }, []);

  const clearLastCreatedClientId = useCallback(() => {
    setLastCreatedClientId(null);
  }, []);

  const createClient = useCallback(
    (draft: NewClientDraft) => {
      const id = `c-${Date.now()}`;
      const name = `${draft.firstName.trim()} ${draft.lastName.trim()}`.trim();
      const noteParts = [
        draft.notes.trim(),
        draft.gender ? `Sesso · ${draft.gender}` : "",
        draft.address || draft.city || draft.zip
          ? `Indirizzo · ${[draft.address, draft.zip, draft.city].filter(Boolean).join(", ")}`
          : "",
        draft.fiscalCode ? `CF · ${draft.fiscalCode}` : "",
        draft.allergies ? `Allergie · ${draft.allergies}` : "",
        draft.pathologies ? `Patologie · ${draft.pathologies}` : "",
        draft.preferences ? `Preferenze · ${draft.preferences}` : "",
        draft.marketingConsent ? "Marketing · consenso attivo" : "",
        draft.profilePhoto ? "Foto profilo · caricata (demo)" : ""
      ].filter(Boolean);

      const client: WorkflowClient = {
        id,
        name,
        phone: draft.phone.trim() || "—",
        email: draft.email.trim() || "—",
        birthday: draft.birthday.trim() || "—",
        notes: noteParts.join("\n") || draft.notes.trim(),
        favorite: false,
        status: "nuovo",
        lastAppointment: "—",
        lastTreatment: "—",
        nextAppointment: "—",
        totalSpent: 0,
        fidelityPoints: 0,
        tags: ["Nuova", ...(draft.privacyConsent ? ["Privacy ok"] : [])],
        diaryPlaceholders: ["Scheda anamnesi"],
        historyLines: []
      };
      setClients((prev) => [client, ...prev]);
      setLastCreatedClientId(id);
      pushToast("Cliente creato");
      pushActivity(`Nuovo cliente creato · ${name}`);
      return id;
    },
    [pushActivity, pushToast]
  );

  const createService = useCallback(
    (draft: NewServiceDraft) => {
      const id = `svc-${Date.now()}`;
      const service: WorkflowService = {
        id,
        name: draft.name.trim(),
        category: draft.category,
        durationMin: draft.durationMin,
        price: draft.price,
        products: draft.products.trim() || "—",
        operators: draft.operators.length ? draft.operators : ["Fabio"],
        color: draft.color
      };
      setServices((prev) => [service, ...prev]);
      pushToast("Servizio creato");
      pushActivity(`Nuovo servizio creato · ${service.name}`);
      return id;
    },
    [pushActivity, pushToast]
  );

  const createSupplier = useCallback(
    (draft: NewSupplierDraft) => {
      const id = `sup-${Date.now()}`;
      const name = draft.name.trim();
      const supplier: WorkflowSupplier = {
        id,
        name,
        category: draft.category,
        status: "attivo",
        lastOrder: "—",
        contact: draft.contact.trim() || "—",
        phone: draft.phone.trim() || "",
        email: draft.email.trim() || "",
        whatsapp: draft.whatsapp?.trim() || "",
        website: draft.website?.trim() || "",
        catalogUrl: draft.catalogUrl?.trim() || "",
        address: draft.address?.trim() || "—",
        vat: draft.vat?.trim() || "—",
        avgDelivery: draft.avgDelivery?.trim() || "—",
        minOrder: draft.minOrder?.trim() || "—",
        reorderMethod: draft.reorderMethod ?? "email",
        notes: draft.notes.trim(),
        productsCount: 0,
        ordersValue: "€0",
        reliability: "—",
        logoTone: "primary",
        logoInitials: initialsFromName(name),
        linkedProducts: []
      };
      setSuppliers((prev) => [supplier, ...prev]);
      pushToast("Fornitore creato");
      pushActivity(`Nuovo fornitore creato · ${supplier.name}`);
      return id;
    },
    [pushActivity, pushToast]
  );

  const updateSupplier = useCallback(
    (id: string, draft: SupplierUpdateDraft) => {
      setSuppliers((prev) =>
        prev.map((s) => {
          if (s.id !== id) return s;
          const name = draft.name.trim() || s.name;
          return {
            ...s,
            name,
            category: draft.category || s.category,
            contact: draft.contact.trim() || "—",
            phone: draft.phone.trim(),
            email: draft.email.trim(),
            whatsapp: draft.whatsapp?.trim() ?? s.whatsapp,
            website: draft.website?.trim() ?? s.website,
            catalogUrl: draft.catalogUrl?.trim() ?? s.catalogUrl,
            address: draft.address?.trim() || s.address,
            vat: draft.vat?.trim() || s.vat,
            avgDelivery: draft.avgDelivery?.trim() || s.avgDelivery,
            minOrder: draft.minOrder?.trim() || s.minOrder,
            reorderMethod: draft.reorderMethod ?? s.reorderMethod,
            notes: draft.notes.trim(),
            status: draft.status ?? s.status,
            logoInitials: initialsFromName(name)
          };
        })
      );
      pushToast("Fornitore aggiornato");
    },
    [pushToast]
  );

  const toggleSupplierStatus = useCallback(
    (id: string) => {
      setSuppliers((prev) => {
        const target = prev.find((s) => s.id === id);
        if (!target) return prev;
        const next = target.status === "attivo" ? "disattivo" : "attivo";
        pushToast(next === "attivo" ? "Fornitore riattivato" : "Fornitore disattivato");
        return prev.map((s) => (s.id === id ? { ...s, status: next } : s));
      });
    },
    [pushToast]
  );

  const deleteSupplier = useCallback(
    (id: string) => {
      setSuppliers((prev) => {
        const target = prev.find((s) => s.id === id);
        if (target) pushToast(`Fornitore eliminato · ${target.name}`);
        return prev.filter((s) => s.id !== id);
      });
    },
    [pushToast]
  );

  const openInventoryProduct = useCallback((productCode: string) => {
    setInventoryFocusCode(productCode);
    setNavRequest({ key: "inventory", token: Date.now() });
  }, []);

  const openSupplierModule = useCallback((supplierIdOrName: string) => {
    setSupplierFocusKey(supplierIdOrName);
    setNavRequest({ key: "suppliers", token: Date.now() });
  }, []);

  const clearInventoryFocus = useCallback(() => setInventoryFocusCode(null), []);
  const clearSupplierFocus = useCallback(() => setSupplierFocusKey(null), []);

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

  const getService = useCallback(
    (id: string) => services.find((s) => s.id === id),
    [services]
  );

  const clearApptFlags = useCallback((id: string) => {
    setAppointments((prev) =>
      prev.map((a) => (a.id === id ? { ...a, isNew: false, justCompleted: false } : a))
    );
  }, []);

  const value = useMemo<DemoWorkflowValue>(
    () => ({
      clients,
      services,
      suppliers,
      appointments,
      activities,
      toasts,
      appointmentsToday,
      revenueExpected,
      revenueCompleted,
      inventoryScaledHint,
      reportsPulse,
      studioName,
      studioLogoUrl,
      setStudioName,
      setStudioLogoUrl,
      newApptDrawerOpen,
      newApptClientId,
      newClientWizardOpen,
      lastCreatedClientId,
      detailApptId,
      completeDialogOpen,
      navRequest,
      inventoryFocusCode,
      supplierFocusKey,
      openNewAppointment,
      closeNewAppointment,
      setNewApptClientId,
      openNewClientWizard,
      closeNewClientWizard,
      clearLastCreatedClientId,
      bookAppointment,
      createClient,
      createService,
      createSupplier,
      updateSupplier,
      toggleSupplierStatus,
      deleteSupplier,
      openInventoryProduct,
      openSupplierModule,
      clearInventoryFocus,
      clearSupplierFocus,
      openAppointmentDetail,
      closeAppointmentDetail,
      openCompleteDialog,
      closeCompleteDialog,
      completeAppointment,
      dismissToast,
      pushToast,
      getClient,
      getService,
      clearApptFlags
    }),
    [
      clients,
      services,
      suppliers,
      appointments,
      activities,
      toasts,
      appointmentsToday,
      revenueExpected,
      revenueCompleted,
      inventoryScaledHint,
      reportsPulse,
      studioName,
      studioLogoUrl,
      newApptDrawerOpen,
      newApptClientId,
      newClientWizardOpen,
      lastCreatedClientId,
      detailApptId,
      completeDialogOpen,
      navRequest,
      inventoryFocusCode,
      supplierFocusKey,
      openNewAppointment,
      closeNewAppointment,
      openNewClientWizard,
      closeNewClientWizard,
      clearLastCreatedClientId,
      bookAppointment,
      createClient,
      createService,
      createSupplier,
      updateSupplier,
      toggleSupplierStatus,
      deleteSupplier,
      openInventoryProduct,
      openSupplierModule,
      clearInventoryFocus,
      clearSupplierFocus,
      openAppointmentDetail,
      closeAppointmentDetail,
      openCompleteDialog,
      closeCompleteDialog,
      completeAppointment,
      dismissToast,
      pushToast,
      getClient,
      getService,
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
