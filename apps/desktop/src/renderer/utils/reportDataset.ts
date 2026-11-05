/**
 * Report calcolati dagli appuntamenti e dai clienti locali.
 * Il periodo usa lo stesso "oggi" dell'agenda: dayOffset 0.
 */

export type ReportPeriod = "oggi" | "settimana" | "mese" | "anno" | "personalizzato";

export type ReportAppointment = {
  clientId: string;
  client: string;
  service: string;
  operator: string;
  cabin: string;
  dateLabel: string;
  startMin: number;
  durationMin: number;
  price: number;
  status: string;
  dayOffset: number;
  dateIso?: string;
  createdAt?: string;
};

export type ReportClient = {
  id: string;
  name: string;
  status: string;
  createdAt?: string;
};

export type ReportProduct = {
  name: string;
  quantity: number;
  minQuantity: number;
};

export type ReportRank = {
  name: string;
  meta: string;
  rank: number;
  value: number;
};

export type ReportHealth = {
  tone: "ottimo" | "attenzione" | "critico";
  title: string;
  lines: string[];
};

export type ReportDataset = {
  incassoCompleted: number;
  incassoExpected: number;
  appointmentCount: number;
  completedCount: number;
  cancelledCount: number;
  newClients: number;
  averageTicket: number;
  hours: number;
  incassiRows: Array<[string, number]>;
  serviziRows: Array<[string, number, string]>;
  acquisitiRows: Array<[string, number]>;
  pagamentiRows: Array<[string, number, string]>;
  occupazioneRows: Array<[string, string, number]>;
  operatoriRows: Array<[string, number, number, string]>;
  topClienti: ReportRank[];
  topServizi: ReportRank[];
  topProdotti: ReportRank[];
  topOperatori: ReportRank[];
  magazzinoRows: Array<[string, number, number, string]>;
  health: ReportHealth;
};

const BANDS: Array<[string, number, number]> = [
  ["08–11", 8, 11],
  ["11–13", 11, 13],
  ["13–15", 13, 15],
  ["15–17", 15, 17],
  ["17–19", 17, 19],
  ["19–21", 19, 21]
];

function euro(value: number) {
  return `€${Math.round(value).toLocaleString("it-IT")}`;
}

function anchorIso(appointments: ReportAppointment[]) {
  const marked = appointments.find((appointment) => appointment.dayOffset === 0 && appointment.dateIso);
  if (marked?.dateIso) return marked.dateIso.slice(0, 10);
  return new Date().toISOString().slice(0, 10);
}

export function isInReportWindow(
  appointment: ReportAppointment,
  appointments: ReportAppointment[],
  period: ReportPeriod
) {
  return inPeriod(appointment, period, anchorIso(appointments));
}

function inPeriod(appointment: ReportAppointment, period: ReportPeriod, anchor: string) {
  const iso = (appointment.dateIso ?? "").slice(0, 10);
  if (period === "oggi") return appointment.dayOffset === 0 || iso === anchor;
  if (period === "settimana" || period === "personalizzato") {
    return appointment.dayOffset >= 0 && appointment.dayOffset <= 6;
  }
  if (period === "mese") {
    if (iso) return iso.slice(0, 7) === anchor.slice(0, 7);
    return appointment.dayOffset >= -7 && appointment.dayOffset <= 24;
  }
  if (iso) return iso.slice(0, 4) === anchor.slice(0, 4);
  return true;
}

function hourOf(appointment: ReportAppointment) {
  return 8 + Math.floor(appointment.startMin / 60);
}

function rank(rows: Array<{ name: string; value: number; meta: string }>): ReportRank[] {
  return rows
    .filter((row) => row.name.trim() && row.value > 0)
    .sort((a, b) => b.value - a.value)
    .slice(0, 5)
    .map((row, index) => ({ ...row, rank: index + 1 }));
}

export function buildReportDataset(input: {
  appointments: ReportAppointment[];
  clients: ReportClient[];
  products: ReportProduct[];
  period: ReportPeriod;
  operator: string;
  cabin: string;
  service: string;
}): ReportDataset {
  const anchor = anchorIso(input.appointments);
  const rows = input.appointments.filter((appointment) => {
    if (!inPeriod(appointment, input.period, anchor)) return false;
    if (input.operator !== "Tutti" && appointment.operator !== input.operator) return false;
    if (input.cabin !== "Tutte" && appointment.cabin !== input.cabin) return false;
    if (input.service !== "Tutti" && appointment.service !== input.service) return false;
    return true;
  });

  const active = rows.filter((appointment) => appointment.status !== "annullato");
  const completed = active.filter((appointment) => appointment.status === "completato");
  const cancelledCount = rows.length - active.length;
  const incassoCompleted = completed.reduce((sum, appointment) => sum + appointment.price, 0);
  const incassoExpected = active.reduce((sum, appointment) => sum + appointment.price, 0);
  const averageTicket = completed.length
    ? incassoCompleted / completed.length
    : active.length
      ? incassoExpected / active.length
      : 0;
  const hours = active.reduce((sum, appointment) => sum + appointment.durationMin, 0) / 60;

  const byDay = new Map<string, { label: string; offset: number; total: number }>();
  for (const appointment of completed) {
    const label = appointment.dateLabel || appointment.dateIso || "Giorno";
    const current = byDay.get(label) ?? { label, offset: appointment.dayOffset, total: 0 };
    current.total += appointment.price;
    byDay.set(label, current);
  }
  const incassiRows = [...byDay.values()]
    .sort((a, b) => a.offset - b.offset)
    .map((row) => [row.label, Math.round(row.total)] as [string, number]);

  const byService = new Map<string, number>();
  for (const appointment of active) {
    const name = appointment.service || "Servizio";
    byService.set(name, (byService.get(name) ?? 0) + 1);
  }
  const serviceTotal = [...byService.values()].reduce((sum, count) => sum + count, 0) || 1;
  const serviziRows = [...byService.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(
      ([name, count]) =>
        [name, count, `${Math.round((count / serviceTotal) * 100)}%`] as [string, number, string]
    );

  const newClients = input.clients.filter((client) => client.status === "nuovo");
  const acquisitiRows: Array<[string, number]> = [["Nuovi", newClients.length]];

  const pagamentiRows: Array<[string, number, string]> = completed.length
    ? [["Completati", Math.round(incassoCompleted), "100%"]]
    : [["Nessun completato", 0, "0%"]];

  const bandCounts = BANDS.map(([label, from, to]) => {
    const count = active.filter((appointment) => {
      const hour = hourOf(appointment);
      return hour >= from && hour < to;
    }).length;
    return { label, count };
  });
  const bandMax = Math.max(1, ...bandCounts.map((band) => band.count));
  const occupazioneRows = bandCounts.map(
    (band) =>
      [band.label, `${band.count}`, Math.round((band.count / bandMax) * 100)] as [
        string,
        string,
        number
      ]
  );

  const byOperator = new Map<string, { revenue: number; count: number }>();
  for (const appointment of active) {
    const name = appointment.operator || "Senza operatore";
    const current = byOperator.get(name) ?? { revenue: 0, count: 0 };
    current.revenue += appointment.price;
    current.count += 1;
    byOperator.set(name, current);
  }
  const operatoriRows = [...byOperator.entries()]
    .sort((a, b) => b[1].revenue - a[1].revenue)
    .map(
      ([name, stats]) =>
        [name, Math.round(stats.revenue), stats.count, ""] as [string, number, number, string]
    );

  const byClient = new Map<string, number>();
  for (const appointment of completed.length ? completed : active) {
    byClient.set(appointment.client, (byClient.get(appointment.client) ?? 0) + appointment.price);
  }

  const lowStock = input.products.filter((product) => product.quantity <= product.minQuantity);
  const tone: ReportHealth["tone"] =
    active.length === 0 ? "critico" : cancelledCount > active.length ? "attenzione" : "ottimo";

  return {
    incassoCompleted,
    incassoExpected,
    appointmentCount: active.length,
    completedCount: completed.length,
    cancelledCount,
    newClients: newClients.length,
    averageTicket,
    hours,
    incassiRows,
    serviziRows,
    acquisitiRows,
    pagamentiRows,
    occupazioneRows,
    operatoriRows,
    topClienti: rank(
      [...byClient.entries()].map(([name, value]) => ({ name, value, meta: euro(value) }))
    ),
    topServizi: rank(
      serviziRows.map(([name, count]) => ({ name, value: count, meta: `${count} appuntamenti` }))
    ),
    topProdotti: rank(
      lowStock.map((product) => ({
        name: product.name,
        value: product.minQuantity - product.quantity + 1,
        meta: `${product.quantity} / min ${product.minQuantity}`
      }))
    ),
    topOperatori: rank(
      operatoriRows.map(([name, revenue]) => ({ name, value: revenue, meta: euro(revenue) }))
    ),
    magazzinoRows: [...input.products]
      .sort((a, b) => a.quantity - a.minQuantity - (b.quantity - b.minQuantity))
      .map((product) => {
        const state =
          product.quantity <= 0 ? "esaurito" : product.quantity <= product.minQuantity ? "bassa" : "ok";
        return [product.name, product.quantity, product.minQuantity, state] as [
          string,
          number,
          number,
          string
        ];
      }),
    health: {
      tone,
      title: tone === "ottimo" ? "In linea" : tone === "attenzione" ? "Attenzione" : "Vuoto",
      lines: [
        completed.length
          ? `Incasso completato ${euro(incassoCompleted)}`
          : `Incasso previsto ${euro(incassoExpected)}`,
        `${active.length} appuntamenti nel periodo`,
        cancelledCount ? `${cancelledCount} annullati` : "Nessun annullamento"
      ]
    }
  };
}
