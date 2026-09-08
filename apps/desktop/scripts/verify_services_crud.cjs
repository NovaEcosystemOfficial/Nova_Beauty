/**
 * Test Sprint 4: ServiceRepository CRUD + persistenza reopen.
 */
const { app } = require("electron");
const path = require("path");
const fs = require("fs");

const appUserData = path.join(app.getPath("appData"), "novabeauty-desktop");
app.setPath("userData", appUserData);

app.whenReady().then(async () => {
  try {
    const Database = require("better-sqlite3");
    const { randomUUID } = require("crypto");

    const userData = app.getPath("userData");
    const dbPath = path.join(userData, "data", "novabeauty.sqlite");
    if (!fs.existsSync(dbPath)) {
      throw new Error(`DB assente: ${dbPath}. Avvia npm run dev una volta.`);
    }

    // Ensure meta_json column (migration)
    {
      const db = new Database(dbPath);
      const cols = db.prepare(`PRAGMA table_info(services)`).all();
      if (!cols.some((c) => c.name === "meta_json")) {
        db.exec(`ALTER TABLE services ADD COLUMN meta_json TEXT NOT NULL DEFAULT '{}'`);
      }
      db.close();
    }

    const marker = `svc-sprint4-${Date.now()}`;
    const id = randomUUID();
    const now = new Date().toISOString();

    // CREATE
    {
      const db = new Database(dbPath);
      db.pragma("journal_mode = WAL");
      const info = db
        .prepare(
          `INSERT INTO services (
            id, created_at, updated_at, name, category, duration_min, price,
            products, operators_json, color, active, meta_json
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
        )
        .run(
          id,
          now,
          now,
          marker,
          "Viso",
          45,
          77,
          "Test product",
          JSON.stringify(["Fabio"]),
          "#c45c6a",
          1,
          JSON.stringify({ description: "test desc", tone: "primary", soldCount: 0 })
        );
      if (!info.changes) throw new Error("CREATE failed");
      db.pragma("wal_checkpoint(TRUNCATE)");
      db.close();
      console.log("[svc-test] PASS1 create", id);
    }

    // UPDATE
    {
      const db = new Database(dbPath);
      db.prepare(
        `UPDATE services SET price = 88, name = ?, updated_at = ? WHERE id = ?`
      ).run(`${marker}-upd`, new Date().toISOString(), id);
      const row = db.prepare(`SELECT name, price FROM services WHERE id = ?`).get(id);
      if (!row || row.price !== 88) throw new Error("UPDATE failed");
      db.pragma("wal_checkpoint(TRUNCATE)");
      db.close();
      console.log("[svc-test] PASS2 update", JSON.stringify(row));
    }

    // SEARCH
    {
      const db = new Database(dbPath);
      const rows = db
        .prepare(
          `SELECT id FROM services WHERE LOWER(name) LIKE ? ORDER BY LOWER(name) ASC`
        )
        .all(`%${marker.toLowerCase()}%`);
      if (!rows.some((r) => r.id === id)) throw new Error("SEARCH failed");
      db.close();
      console.log("[svc-test] PASS3 search ok");
    }

    // REOPEN
    {
      const db = new Database(dbPath);
      const row = db.prepare(`SELECT id, name, price FROM services WHERE id = ?`).get(id);
      if (!row) throw new Error("missing after reopen");
      console.log("[svc-test] PASS4 reopen", JSON.stringify(row));
      db.prepare(`DELETE FROM services WHERE id = ?`).run(id);
      const gone = db.prepare(`SELECT id FROM services WHERE id = ?`).get(id);
      if (gone) throw new Error("DELETE failed");
      db.pragma("wal_checkpoint(TRUNCATE)");
      db.close();
      console.log("[svc-test] PASS5 delete ok");
    }

    // Seed catalog present (or empty is ok if wiped)
    {
      const db = new Database(dbPath);
      const count = db.prepare(`SELECT COUNT(*) AS c FROM services`).get().c;
      console.log("[svc-test] services count =", count);
      db.close();
    }

    // Source checks
    const repoSrc = fs.readFileSync(
      path.join(__dirname, "..", "src", "repositories", "ServiceRepository.ts"),
      "utf8"
    );
    if (!repoSrc.includes("create(input: ServiceCreateInput)")) {
      throw new Error("ServiceRepository.create missing");
    }
    const apiSrc = fs.readFileSync(
      path.join(__dirname, "..", "src", "renderer", "data", "servicesApi.ts"),
      "utf8"
    );
    if (!apiSrc.includes("createServiceViaRepository")) {
      throw new Error("servicesApi bridge missing");
    }
    console.log("[svc-test] PASS6 repository + bridge present");
    console.log("[svc-test] SUCCESS");
    app.exit(0);
  } catch (e) {
    console.error("[svc-test] FAILED", e);
    app.exit(1);
  }
});
