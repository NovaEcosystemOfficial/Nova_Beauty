/**
 * Diario cliente: creazione, lettura, cancellazione a cascata col cliente.
 * Database temporaneo.
 */
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { ClientService } from "../src/services/ClientService";
import { DataEngine } from "../src/services/DataEngine";
import { DiaryService } from "../src/services/DiaryService";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

const dir = mkdtempSync(join(tmpdir(), "nb-diary-"));

try {
  DataEngine.getInstance().start(dir);
  const created = ClientService.getInstance().create({
    firstName: "Giulia",
    lastName: "Test",
    phone: "3331234567"
  });
  assert(created.ok, "cliente non creato");

  const empty = DiaryService.getInstance().list(created.data.id);
  assert(empty.ok && empty.data.length === 0, "diario non parte vuoto");

  const entry = DiaryService.getInstance().create({
    clientId: created.data.id,
    title: "Pulizia viso",
    body: "Pelle arrossata, niente acidi.",
    tags: ["Viso", "inesistente"],
    photosBefore: ["data:image/jpeg;base64,aaa"]
  });
  assert(entry.ok, "voce non creata");
  assert(entry.data.tags.length === 1 && entry.data.tags[0] === "Viso", "tag non filtrati");

  const listed = DiaryService.getInstance().list(created.data.id);
  assert(listed.ok && listed.data.length === 1, "lista diario errata");

  const removed = ClientService.getInstance().remove(created.data.id);
  assert(removed.ok, "cliente non eliminato");
  const after = DiaryService.getInstance().list(created.data.id);
  assert(after.ok && after.data.length === 0, "il diario è rimasto dopo la cancellazione cliente");

  console.log("ok");
} finally {
  DataEngine.getInstance().stop();
  rmSync(dir, { recursive: true, force: true });
}
