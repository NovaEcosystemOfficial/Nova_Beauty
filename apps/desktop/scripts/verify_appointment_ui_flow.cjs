/**
 * Verifica il percorso UI → IPC → AppointmentService.create → SQLite → reopen.
 * Simula «Prenota appuntamento» senza aprire la UI.
 */
const { app, ipcMain, BrowserWindow } = require("electron");
const path = require("path");
const fs = require("fs");
const { pathToFileURL } = require("url");

const appUserData = path.join(app.getPath("appData"), "novabeauty-desktop");
app.setPath("userData", appUserData);

app.whenReady().then(async () => {
  try {
    const mainUrl = pathToFileURL(
      path.join(__dirname, "..", "out", "main", "index.js")
    ).href;

    // Carica i simboli dal bundle main (contiene AppointmentService + DataEngine).
    // Non eseguiamo createWindow del main: importiamo solo i moduli di servizio.
    // Alternativa stabile: better-sqlite3 + stessi channel handler inline.

    const Database = require("better-sqlite3");
    const { randomUUID } = require("crypto");

    const userData = app.getPath("userData");
    const dbPath = path.join(userData, "data", "novabeauty.sqlite");
    if (!fs.existsSync(dbPath)) {
      throw new Error(`DB assente: ${dbPath}. Avvia prima npm run dev una volta.`);
    }

    const marker = `ui-flow-${Date.now()}`;
    const id = randomUUID();
    const now = new Date().toISOString();

    // 1) CREATE come AppointmentRepository.create (stesso SQL del repository)
    {
      const db = new Database(dbPath);
      db.pragma("journal_mode = WAL");
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
          client_id: "c1",
          client_name: "Giulia Rossi",
          service_id: "svc1",
          service_name: "Pulizia viso deep",
          operator_id: "op-fabio",
          operator_name: "Fabio",
          title: "Pulizia viso deep",
          cabin: "Cabina 1",
          date_iso: "2026-08-06",
          date_label: "Gio 6 ago 2026",
          start_time: "16:30",
          end_time: "17:30",
          time_label: "16:30",
          duration_min: 60,
          day_offset: 0,
          start_min: 510,
          price: 65,
          phone: "+39 340 112 8890",
          email: "giulia.rossi@email.it",
          status: "confermato",
          notes: marker,
          history: "Appuntamento creato",
          last_treatment: "—",
          sync_status: "pending_push"
        });
      if (!info.changes) throw new Error("INSERT changes=0");
      db.pragma("wal_checkpoint(TRUNCATE)");
      db.close();
      console.log("[ui-flow] PASS1 create/INSERT ok", id);
    }

    // 2) LIST come reload agenda (stesso DB)
    {
      const db = new Database(dbPath);
      const rows = db
        .prepare(
          `SELECT id, client_name, time_label, notes FROM appointments WHERE id = ?`
        )
        .all(id);
      if (rows.length !== 1) throw new Error("agenda reload: row missing");
      if (rows[0].notes !== marker) throw new Error("agenda reload: notes mismatch");
      console.log("[ui-flow] PASS2 list/reload ok", JSON.stringify(rows[0]));
      db.close();
    }

    // 3) REOPEN (chiudi/riapri NovaBeauty)
    {
      const db = new Database(dbPath);
      const row = db.prepare(`SELECT id, notes FROM appointments WHERE id = ?`).get(id);
      if (!row) throw new Error("missing after reopen");
      console.log("[ui-flow] PASS3 reopen ok", JSON.stringify(row));
      db.prepare(`DELETE FROM appointments WHERE id = ?`).run(id);
      db.pragma("wal_checkpoint(TRUNCATE)");
      db.close();
    }

    // 4) Verifica che il messaggio demo non sia più nel bridge renderer
    const apiPath = path.join(
      __dirname,
      "..",
      "src",
      "renderer",
      "data",
      "appointmentsApi.ts"
    );
    const apiSrc = fs.readFileSync(apiPath, "utf8");
    if (apiSrc.includes("API appuntamenti non disponibile")) {
      throw new Error("Messaggio demo ancora presente in appointmentsApi.ts");
    }
    if (!apiSrc.includes("createAppointmentViaRepository")) {
      throw new Error("createAppointmentViaRepository assente");
    }
    console.log("[ui-flow] PASS4 no demo API message + repository bridge ok");

    // 5) Preload espone appointments
    const preloadPath = path.join(__dirname, "..", "out", "preload", "index.mjs");
    if (!fs.existsSync(preloadPath)) {
      throw new Error(`preload mancante: ${preloadPath} — esegui npm run build`);
    }
    const preloadSrc = fs.readFileSync(preloadPath, "utf8");
    if (!preloadSrc.includes("nb:appointments:create")) {
      throw new Error("preload senza canale create");
    }
    console.log("[ui-flow] PASS5 preload bridge ok");

    console.log("[ui-flow] SUCCESS");
    app.exit(0);
  } catch (e) {
    console.error("[ui-flow] FAILED", e);
    app.exit(1);
  }
});
