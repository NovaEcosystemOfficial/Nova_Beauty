/**
 * B2: tabella suppliers + rename fornitore sui prodotti + persistenza reopen.
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
      db.exec(`
        CREATE TABLE IF NOT EXISTS suppliers (
          id TEXT PRIMARY KEY NOT NULL,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL,
          name TEXT NOT NULL DEFAULT '',
          category TEXT NOT NULL DEFAULT '',
          status TEXT NOT NULL DEFAULT 'attivo',
          contact TEXT NOT NULL DEFAULT '',
          phone TEXT NOT NULL DEFAULT '',
          email TEXT NOT NULL DEFAULT '',
          notes TEXT NOT NULL DEFAULT '',
          meta_json TEXT NOT NULL DEFAULT '{}'
        )
      `);
      const cols = db.prepare(`PRAGMA table_info(products)`).all();
      if (!cols.some((c) => c.name === "meta_json")) {
        db.exec(`ALTER TABLE products ADD COLUMN meta_json TEXT NOT NULL DEFAULT '{}'`);
      }
      db.close();
    }

    const stamp = Date.now();
    const supplierId = randomUUID();
    const productId = randomUUID();
    const nameA = `Sup-B2-${stamp}`;
    const nameB = `Sup-B2-${stamp}-ren`;
    const now = new Date().toISOString();

    {
      const db = new Database(dbPath);
      db.pragma("journal_mode = WAL");
      db.prepare(
        `INSERT INTO suppliers (
          id, created_at, updated_at, name, category, status, contact, phone, email, notes, meta_json
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      ).run(
        supplierId,
        now,
        now,
        nameA,
        "Test",
        "attivo",
        "Contatto",
        "",
        "",
        "",
        JSON.stringify({ lastOrder: "—", logoInitials: "SB" })
      );
      db.prepare(
        `INSERT INTO products (
          id, created_at, updated_at, code, name, category_id, category_name,
          supplier, quantity, min_quantity, unit, price, expiry, photo_url, meta_json
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      ).run(
        productId,
        now,
        now,
        `B2-${stamp}`,
        `Prod-B2-${stamp}`,
        "creme",
        "Creme",
        nameA,
        3,
        1,
        "pz",
        1,
        "—",
        "",
        "{}"
      );
      db.pragma("wal_checkpoint(TRUNCATE)");
      db.close();
      console.log("[sup-test] PASS1 create supplier+product", supplierId);
    }

    {
      const db = new Database(dbPath);
      db.prepare(`UPDATE suppliers SET name = ?, updated_at = ? WHERE id = ?`).run(
        nameB,
        new Date().toISOString(),
        supplierId
      );
      db.prepare(
        `UPDATE products SET supplier = ?, updated_at = ?
         WHERE LOWER(TRIM(supplier)) = LOWER(TRIM(?))`
      ).run(nameB, new Date().toISOString(), nameA);
      const linked = db
        .prepare(`SELECT id FROM products WHERE LOWER(TRIM(supplier)) = LOWER(?)`)
        .all(nameB);
      if (!linked.some((r) => r.id === productId)) throw new Error("LINK/RENAME failed");
      db.pragma("wal_checkpoint(TRUNCATE)");
      db.close();
      console.log("[sup-test] PASS2 rename+join", linked.length);
    }

    {
      const db = new Database(dbPath);
      db.close();
      const db2 = new Database(dbPath);
      const supplier = db2.prepare(`SELECT name FROM suppliers WHERE id = ?`).get(supplierId);
      const product = db2.prepare(`SELECT supplier FROM products WHERE id = ?`).get(productId);
      if (!supplier || supplier.name !== nameB) throw new Error("REOPEN supplier failed");
      if (!product || product.supplier !== nameB) throw new Error("REOPEN product failed");
      db2.prepare(`DELETE FROM products WHERE id = ?`).run(productId);
      db2.prepare(`DELETE FROM suppliers WHERE id = ?`).run(supplierId);
      db2.pragma("wal_checkpoint(TRUNCATE)");
      db2.close();
      console.log("[sup-test] PASS3 reopen+cleanup");
    }

    console.log("[sup-test] ALL PASS");
    app.quit();
  } catch (error) {
    console.error("[sup-test] FAIL", error);
    app.exit(1);
  }
});
