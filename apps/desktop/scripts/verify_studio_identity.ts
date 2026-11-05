/**
 * Verifica: avvio senza seed, profilo studio persistito, esempio solo su comando.
 * Usa un database temporaneo e non tocca i dati dell'app.
 */
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { AppointmentService } from "../src/services/AppointmentService";
import { CenterService } from "../src/services/CenterService";
import { ClientService } from "../src/services/ClientService";
import { DataEngine } from "../src/services/DataEngine";
import { InventoryService } from "../src/services/InventoryService";
import { loadSampleData } from "../src/services/SampleDataService";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

const dir = mkdtempSync(join(tmpdir(), "nb-studio-"));

try {
  DataEngine.getInstance().start(dir);

  const center = CenterService.getInstance().get();
  assert(center.ok, "lettura centro fallita");
  assert(center.data.name === "Il mio studio", `nome default inatteso: ${center.data.name}`);
  assert(center.data.ownerName === "", "titolare default non vuoto");

  const clients = ClientService.getInstance().list();
  const appointments = AppointmentService.getInstance().list();
  const products = InventoryService.getInstance().list();
  assert(clients.ok && clients.data.length === 0, "i clienti partono pieni");
  assert(appointments.ok && appointments.data.length === 0, "l'agenda parte piena");
  assert(products.ok && products.data.length === 0, "il magazzino parte pieno");

  const saved = CenterService.getInstance().update({
    name: "Studio Rosa",
    ownerName: "Maria Rossi"
  });
  assert(saved.ok, "salvataggio centro fallito");
  assert(saved.data.name === "Studio Rosa" && saved.data.ownerName === "Maria Rossi", "patch non salvata");

  const reloaded = CenterService.getInstance().get();
  assert(
    reloaded.ok && reloaded.data.name === "Studio Rosa" && reloaded.data.ownerName === "Maria Rossi",
    "il centro non resta salvato"
  );

  const seeded = loadSampleData();
  assert(seeded.clients > 0 && seeded.appointments > 0 && seeded.services > 0, "seed vuoto");

  const listed = ClientService.getInstance().list();
  assert(listed.ok && listed.data.length === seeded.clients, "lista clienti diversa dal seed");

  const second = loadSampleData();
  assert(
    second.clients === 0 &&
      second.appointments === 0 &&
      second.services === 0 &&
      second.products === 0 &&
      second.suppliers === 0,
    "il secondo caricamento ha riscritto dati esistenti"
  );

  for (const row of listed.data) {
    const removed = ClientService.getInstance().remove(row.id);
    assert(removed.ok, `cancellazione cliente ${row.id} fallita`);
  }

  const afterDelete = ClientService.getInstance().list();
  assert(afterDelete.ok && afterDelete.data.length === 0, "la lista ha reinserito i clienti demo");

  console.log("ok", seeded);
} finally {
  DataEngine.getInstance().stop();
  rmSync(dir, { recursive: true, force: true });
}
