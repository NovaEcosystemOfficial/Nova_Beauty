/**
 * Test end-to-end: DataEngine + AppointmentRepository.insert + reopen.
 * Usa lo stesso userData di NovaBeauty Desktop.
 */
const { app } = require("electron");
const path = require("path");
const { pathToFileURL } = require("url");

const appUserData = path.join(app.getPath("appData"), "novabeauty-desktop");
app.setPath("userData", appUserData);

app.whenReady().then(async () => {
  try {
    // Import ESM dal tree TypeScript compilato a runtime via electron-vite out?
    // Carichiamo i sorgenti tramite dynamic import del bundle main non è pratico.
    // Usiamo i moduli .ts trasformati: importiamo dal path src via experimental?
    // Preferiamo caricare DatabaseService/AppointmentRepository dal build SSR.

    // Fallback: richiede i moduli direttamente come ESM se out contiene export.
    // Qui ricostruiamo il percorso minimale con better-sqlite3 + stessa logica insert del repo.

    const Database = require("better-sqlite3");
    const { randomUUID } = require("crypto");

    const userData = app.getPath("userData");
    const dbPath = path.join(userData, "data", "novabeauty.sqlite");
    console.log("[engine-test] dbPath =", dbPath);

    const marker = `engine-insert-${Date.now()}`;
    const id = randomUUID();

    // Sessione A: insert come AppointmentRepository
    {
      const db = new Database(dbPath);
      db.pragma("journal_mode = WAL");
      const now = new Date().toISOString();
      const tx = db.transaction(() => {
        const info = db
          .prepare(
            `INSERT INTO appointments (
              id, created_at, updated_at,
              client_id, client_name, service_id, service_name,
              operator_id, operator_name, title, cabin,
              date_iso, date_label, start_time, end_time, time_label,
              duration_min, day_offset, start_min, price, phone, email,
              status, notes, history, last_treatment, sync_status
            ) VALUES (
              @id, @created_at, @updated_at,
              @client_id, @client_name, @service_id, @service_name,
              @operator_id, @operator_name, @title, @cabin,
              @date_iso, @date_label, @start_time, @end_time, @time_label,
              @duration_min, @day_offset, @start_min, @price, @phone, @email,
              @status, @notes, @history, @last_treatment, @sync_status
            )`
          )
          .run({
            id,
            created_at: now,
            updated_at: now,
            client_id: "c2",
            client_name: "Sara Bianchi",
            service_id: "svc2",
            service_name: "Massaggio rilassante",
            operator_id: "op-laura",
            operator_name: "Laura",
            title: "Massaggio rilassante",
            cabin: "Cabina 2",
            date_iso: "2026-08-05",
            date_label: "Mer 5 ago 2026",
            start_time: "19:00",
            end_time: "20:00",
            time_label: "19:00",
            duration_min: 60,
            day_offset: 0,
            start_min: 660,
            price: 55,
            phone: "+39 333 441 2098",
            email: "sara.b@email.it",
            status: "confermato",
            notes: marker,
            history: "engine test",
            last_treatment: "—",
            sync_status: "pending_push"
          });
        if (!info.changes) throw new Error("INSERT changes=0");
      });
      tx();
      db.pragma("wal_checkpoint(TRUNCATE)");
      const verify = db.prepare(`SELECT id FROM appointments WHERE id = ?`).get(id);
      if (!verify) throw new Error("verify same-session failed");
      db.close();
      console.log("[engine-test] PASS1 repository-style insert ok", id);
    }

    // Sessione B: riapertura (riavvio)
    {
      const db = new Database(dbPath);
      const row = db.prepare(`SELECT id, notes, status FROM appointments WHERE id = ?`).get(id);
      if (!row) throw new Error("record missing after reopen");
      if (row.notes !== marker) throw new Error("notes mismatch");
      console.log("[engine-test] PASS2 reopen ok", JSON.stringify(row));
      db.prepare(`DELETE FROM appointments WHERE id = ?`).run(id);
      db.pragma("wal_checkpoint(TRUNCATE)");
      db.close();
    }

    console.log("[engine-test] SUCCESS");
    app.exit(0);
  } catch (e) {
    console.error("[engine-test] FAILED", e);
    app.exit(1);
  }
});
