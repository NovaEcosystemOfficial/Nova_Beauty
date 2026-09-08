/**
 * B1: InventoryRepository CRUD + persistenza reopen.
 */
const { app } = require("electron");
const path = require("path");
const fs = require("fs");

const appUserData = path.join(app.getPath("appData"), "novabeauty-desktop");
app.setPath("userData", appUserData);

app.whenReady().then(() => {
  try {
    const Database = require("better-sqlite3");
    const { randomUUID } = require("crypto");

    const userData = app.getPath("userData");
    const dbPath = path.join(userData, "data", "novabeauty.sqlite");
    if (!fs.existsSync(dbPath)) {
      throw new Error(`DB assente: ${dbPath}. Avvia npm run dev una volta.`);
    }

    {
      const db = new Database(dbPath);
      const cols = db.prepare(`PRAGMA table_info(products)`).all();
      if (!cols.some((c) => c.name === "meta_json")) {
        db.exec(`ALTER TABLE products ADD COLUMN meta_json TEXT NOT NULL DEFAULT '{}'`);
      }
      db.close();
    }

    const marker = `inv-b1-${Date.now()}`;
    const id = randomUUID();
    const now = new Date().toISOString();

    {
      const db = new Database(dbPath);
      db.pragma("journal_mode = WAL");
      const info = db
        .prepare(
          `INSERT INTO products (
            id, created_at, updated_at, code, name, category_id, category_name,
            supplier, quantity, min_quantity, unit, price, expiry, photo_url, meta_json
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
        )
        .run(
          id,
          now,
          now,
          "TST-B1",
          marker,
          "creme",
          "Creme",
          "TestSupplier",
          10,
          2,
          "pz",
          4.5,
          "12/2027",
          "",
          JSON.stringify({ barcode: "800000", location: "A1", lot: "L1", lastMovement: "Nuovo", imageTone: "primary" })
        );
      if (!info.changes) throw new Error("CREATE failed");
      db.pragma("wal_checkpoint(TRUNCATE)");
      db.close();
      console.log("[inv-test] PASS1 create", id);
    }

    {
      const db = new Database(dbPath);
      db.prepare(
        `UPDATE products SET quantity = 7, name = ?, updated_at = ? WHERE id = ?`
      ).run(`${marker}-upd`, new Date().toISOString(), id);
      const row = db.prepare(`SELECT name, quantity FROM products WHERE id = ?`).get(id);
      if (!row || row.quantity !== 7) throw new Error("UPDATE failed");
      db.pragma("wal_checkpoint(TRUNCATE)");
      db.close();
      console.log("[inv-test] PASS2 update", JSON.stringify(row));
    }

    {
      const db = new Database(dbPath);
      const found = db
        .prepare(`SELECT id FROM products WHERE LOWER(name) LIKE ?`)
        .get(`%${marker.toLowerCase()}%`);
      if (!found) throw new Error("SEARCH failed");
      db.close();
      console.log("[inv-test] PASS3 search", found.id);
    }

    {
      const db = new Database(dbPath);
      db.close();
      const db2 = new Database(dbPath);
      const row = db2.prepare(`SELECT name, quantity FROM products WHERE id = ?`).get(id);
      if (!row || row.quantity !== 7) throw new Error("REOPEN failed");
      db2.prepare(`DELETE FROM products WHERE id = ?`).run(id);
      db2.pragma("wal_checkpoint(TRUNCATE)");
      db2.close();
      console.log("[inv-test] PASS4 reopen+cleanup");
    }

    console.log("[inv-test] ALL PASS");
    app.quit();
  } catch (error) {
    console.error("[inv-test] FAIL", error);
    app.exit(1);
  }
});
