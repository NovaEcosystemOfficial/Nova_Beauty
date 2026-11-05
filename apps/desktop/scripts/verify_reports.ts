import assert from "node:assert/strict";
import { buildReportDataset, isInReportWindow } from "../src/renderer/utils/reportDataset";

const base = {
  clientId: "c1",
  client: "Marta Greco",
  service: "Pulizia viso",
  operator: "Laura",
  cabin: "1",
  dateLabel: "Oggi",
  startMin: 60,
  durationMin: 60,
  price: 80,
  status: "completato",
  dayOffset: 0,
  dateIso: "2026-08-05"
};

const dataset = buildReportDataset({
  appointments: [
    base,
    {
      ...base,
      client: "Giulia Rossi",
      clientId: "c2",
      operator: "Chiara",
      service: "Massaggio",
      price: 50,
      status: "confermato",
      dayOffset: 1,
      dateIso: "2026-08-06"
    },
    {
      ...base,
      client: "Sara Bianchi",
      price: 999,
      status: "annullato",
      dayOffset: 0
    }
  ],
  clients: [
    { id: "c1", name: "Marta Greco", status: "attivo" },
    { id: "c2", name: "Giulia Rossi", status: "nuovo" }
  ],
  products: [
    { name: "Siero", quantity: 1, minQuantity: 4 },
    { name: "Crema", quantity: 10, minQuantity: 2 }
  ],
  period: "oggi",
  operator: "Tutti",
  cabin: "Tutte",
  service: "Tutti"
});

assert.equal(dataset.incassoCompleted, 80);
assert.equal(dataset.appointmentCount, 1);
assert.equal(dataset.cancelledCount, 1);
assert.equal(dataset.newClients, 1);
assert.equal(dataset.topClienti[0]?.name, "Marta Greco");
assert.equal(dataset.topProdotti[0]?.name, "Siero");
assert.equal(dataset.magazzinoRows[0]?.[0], "Siero");
assert.equal(isInReportWindow(base, [base], "oggi"), true);
assert.equal(
  isInReportWindow({ ...base, dayOffset: 3, dateIso: "2026-08-08" }, [base], "oggi"),
  false
);

const laura = buildReportDataset({
  appointments: [base, { ...base, operator: "Chiara", price: 20, client: "Altra" }],
  clients: [],
  products: [],
  period: "oggi",
  operator: "Laura",
  cabin: "Tutte",
  service: "Tutti"
});
assert.equal(laura.incassoCompleted, 80);
assert.equal(laura.operatoriRows.length, 1);

const empty = buildReportDataset({
  appointments: [],
  clients: [],
  products: [],
  period: "settimana",
  operator: "Tutti",
  cabin: "Tutte",
  service: "Tutti"
});
assert.equal(empty.incassoCompleted, 0);
assert.equal(empty.health.tone, "critico");

console.log("verify_reports ok");
