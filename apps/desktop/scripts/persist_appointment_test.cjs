/**
 * Test persistenza appuntamenti sullo STESSO database dell'app NovaBeauty.
 *
 * Uso:
 *   .\node_modules\electron\dist\electron.exe --disable-crash-reporter .\scripts\persist_appointment_test.cjs
 */
const { app } = require("electron");
const path = require("path");
const fs = require("fs");

// Stesso userData di electron-vite / package name
const appUserData = path.join(app.getPath("appData"), "novabeauty-desktop");
app.setPath("userData", appUserData);

app.whenReady().then(() => {
  const Database = require("better-sqlite3");
  const dbPath = path.join(app.getPath("userData"), "data", "novabeauty.sqlite");
  const marker = `persist-test-${Date.now()}`;
  let createdId = "";

  try {
    console.log("[persist-test] userData =", app.getPath("userData"));
    console.log("[persist-test] dbPath   =", dbPath);
    if (!fs.existsSync(dbPath)) {
      throw new Error(`DB assente: ${dbPath} — avvia prima l'app (npm run dev) una volta`);
    }

    // --- PASS 1: INSERT + checkpoint + close (come shutdown app) ---
    {
      const db = new Database(dbPath);
      db.pragma("journal_mode = WAL");
      db.pragma("foreign_keys = ON");

      const now = new Date().toISOString();
      createdId = `persist_${Date.now()}`;
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
          id: createdId,
          created_at: now,
          updated_at: now,
          client_id: "c1",
          client_name: "Giulia Rossi",
          service_id: "svc1",
          service_name: "Pulizia viso deep",
          operator_id: "op-laura",
          operator_name: "Laura",
          title: "Pulizia viso deep",
          cabin: "Cabina 3",
          date_iso: "2026-08-05",
          date_label: "Mer 5 ago 2026",
          start_time: "18:00",
          end_time: "19:00",
          time_label: "18:00",
          duration_min: 60,
          day_offset: 0,
          start_min: 600,
          price: 65,
          phone: "+39 340 112 8890",
          email: "giulia.rossi@email.it",
          status: "confermato",
          notes: marker,
          history: "persist test",
          last_treatment: "—",
          sync_status: "local"
        });

      if (!info.changes) throw new Error("INSERT changes=0");
      db.pragma("wal_checkpoint(TRUNCATE)");
      const row = db.prepare(`SELECT id, notes FROM appointments WHERE id = ?`).get(createdId);
      if (!row) throw new Error("INSERT non leggibile nella stessa sessione");
      console.log("[persist-test] PASS1 insert ok", row.id);
      db.close();
    }

    // --- PASS 2: riapertura (simula riavvio NovaBeauty) ---
    {
      const db = new Database(dbPath);
      const row = db
        .prepare(`SELECT id, notes, client_name, start_time, status FROM appointments WHERE id = ?`)
        .get(createdId);
      if (!row) throw new Error("FAIL: record assente dopo riapertura DB");
      if (row.notes !== marker) throw new Error("FAIL: notes non corrispondono");
      console.log("[persist-test] PASS2 reopen ok", JSON.stringify(row));

      const total = db.prepare(`SELECT COUNT(*) AS c FROM appointments`).get();
      console.log("[persist-test] total appointments =", total.c);

      // cleanup sola riga di test
      db.prepare(`DELETE FROM appointments WHERE id = ?`).run(createdId);
      db.pragma("wal_checkpoint(TRUNCATE)");
      db.close();
    }

    console.log("[persist-test] SUCCESS — stesso DB, INSERT + riapertura OK");
    app.exit(0);
  } catch (e) {
    console.error("[persist-test] FAILED", e);
    app.exit(1);
  }
});
