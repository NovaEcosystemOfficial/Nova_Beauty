/**
 * Verifica che il preload esponga window.novaBeauty.appointments
 * e che nb:appointments:create risponda (handler registrati).
 */
const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const fs = require("fs");

const appUserData = path.join(app.getPath("appData"), "novabeauty-desktop");
app.setPath("userData", appUserData);

app.whenReady().then(async () => {
  try {
    const preload = path.join(__dirname, "..", "out", "preload", "index.mjs");
    if (!fs.existsSync(preload)) throw new Error("preload missing: " + preload);

    // Handler minimi (come appointmentIpc) — verificano solo il bridge
    ipcMain.removeHandler("nb:appointments:create");
    ipcMain.handle("nb:appointments:create", (_e, input) => {
      return { ok: true, data: { id: "ipc-test-id", ...input } };
    });

    const win = new BrowserWindow({
      show: false,
      webPreferences: {
        preload,
        contextIsolation: true,
        nodeIntegration: false,
        sandbox: false
      }
    });

    await win.loadURL("data:text/html,<html><body>bridge-test</body></html>");

    const result = await win.webContents.executeJavaScript(`
      (async () => {
        const hasNova = !!(window.novaBeauty && window.novaBeauty.appointments);
        const hasLocal = !!(window.nbLocal && window.nbLocal.appointments);
        if (!hasNova && !hasLocal) {
          return { ok: false, reason: "bridge missing" };
        }
        const api = window.novaBeauty?.appointments || window.nbLocal.appointments;
        const created = await api.create({ clientName: "Test Bridge" });
        return { ok: true, hasNova, hasLocal, created };
      })()
    `);

    win.destroy();

    if (!result.ok) throw new Error(JSON.stringify(result));
    if (!result.created?.ok) throw new Error("create failed: " + JSON.stringify(result));
    console.log("[bridge-test] SUCCESS", JSON.stringify(result));
    app.exit(0);
  } catch (e) {
    console.error("[bridge-test] FAILED", e);
    app.exit(1);
  }
});
