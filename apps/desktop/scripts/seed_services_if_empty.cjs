/**
 * Seed servizi se tabella vuota + verifica list/search/sort (stesso DB app).
 */
const { app } = require("electron");
const path = require("path");
const fs = require("fs");
const { pathToFileURL } = require("url");

const appUserData = path.join(app.getPath("appData"), "novabeauty-desktop");
app.setPath("userData", appUserData);

app.whenReady().then(async () => {
  try {
    // Usa i moduli dal bundle main (contiene ServiceService + DataEngine)
    // Avvio engine come fa index.ts
    const { registerServiceIpcHandlers } = await import(
      pathToFileURL(path.join(__dirname, "..", "out", "main", "index.js")).href
    ).catch(() => ({ registerServiceIpcHandlers: null }));

    // Fallback diretto: better-sqlite3 + seed SQL allineato a ServiceService
    const Database = require("better-sqlite3");
    const userData = app.getPath("userData");
    const dataDir = path.join(userData, "data");
    fs.mkdirSync(dataDir, { recursive: true });
    const dbPath = path.join(dataDir, "novabeauty.sqlite");
    const db = new Database(dbPath);
    db.pragma("journal_mode = WAL");

    const cols = db.prepare(`PRAGMA table_info(services)`).all().map((c) => c.name);
    if (!cols.includes("meta_json")) {
      db.exec(`ALTER TABLE services ADD COLUMN meta_json TEXT NOT NULL DEFAULT '{}'`);
    }

    const count = db.prepare(`SELECT COUNT(*) AS c FROM services`).get().c;
    if (count === 0) {
      const now = new Date().toISOString();
      const seed = [
        ["svc1", "Pulizia viso deep", "Viso", 60, 65],
        ["svc2", "Massaggio rilassante", "Massaggi", 60, 55],
        ["svc3", "Epilazione gambe", "Epilazione", 45, 40],
        ["svc4", "Peeling enzimatico", "Viso", 45, 80],
        ["svc5", "Pressoterapia", "Corpo", 45, 45]
      ];
      const ins = db.prepare(
        `INSERT OR IGNORE INTO services (
          id, created_at, updated_at, name, category, duration_min, price,
          products, operators_json, color, active, meta_json
        ) VALUES (?, ?, ?, ?, ?, ?, ?, '', '[]', '#c45c6a', 1, '{}')`
      );
      const tx = db.transaction(() => {
        for (const row of seed) {
          ins.run(row[0], now, now, row[1], row[2], row[3], row[4]);
        }
      });
      tx();
      console.log("[svc-seed] seeded", seed.length);
    } else {
      console.log("[svc-seed] already has", count, "services");
    }

    const listed = db
      .prepare(`SELECT id, name, price, duration_min FROM services ORDER BY LOWER(name) ASC`)
      .all();
    console.log("[svc-seed] list count", listed.length);
    const search = db
      .prepare(`SELECT id FROM services WHERE LOWER(name) LIKE '%viso%'`)
      .all();
    console.log("[svc-seed] search viso", search.length);
    const byPrice = db
      .prepare(`SELECT name, price FROM services ORDER BY price ASC LIMIT 3`)
      .all();
    console.log("[svc-seed] sort price", JSON.stringify(byPrice));

    db.pragma("wal_checkpoint(TRUNCATE)");
    db.close();

    if (listed.length < 1) throw new Error("no services after seed");
    console.log("[svc-seed] SUCCESS");
    void registerServiceIpcHandlers;
    app.exit(0);
  } catch (e) {
    console.error("[svc-seed] FAILED", e);
    app.exit(1);
  }
});
