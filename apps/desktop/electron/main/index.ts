import { app, BrowserWindow, shell } from "electron";
import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { registerAppointmentIpcHandlers } from "./appointmentIpc";
import { registerClientIpcHandlers } from "./clientIpc";
import { registerInventoryIpcHandlers } from "./inventoryIpc";
import { registerServiceIpcHandlers } from "./serviceIpc";
import { registerSupplierIpcHandlers } from "./supplierIpc";
import { AppointmentService } from "../../src/services/AppointmentService";
import { firestoreAppointmentSyncHooks } from "../../src/services/appointmentSyncHooks";
import { ClientService } from "../../src/services/ClientService";
import { firestoreClientSyncHooks } from "../../src/services/clientSyncHooks";
import { InventoryService } from "../../src/services/InventoryService";
import { firestoreInventorySyncHooks } from "../../src/services/inventorySyncHooks";
import { ServiceService } from "../../src/services/ServiceService";
import { firestoreServiceSyncHooks } from "../../src/services/serviceSyncHooks";
import { SupplierService } from "../../src/services/SupplierService";
import { firestoreSupplierSyncHooks } from "../../src/services/supplierSyncHooks";
import { DataEngine } from "../../src/services/DataEngine";

function mainDir(): string {
  if (typeof import.meta.dirname === "string" && import.meta.dirname.length > 0) {
    return import.meta.dirname;
  }
  return dirname(fileURLToPath(import.meta.url));
}

function resolvePreloadPath(): string {
  const candidates = [
    join(mainDir(), "../preload/index.mjs"),
    join(app.getAppPath(), "out/preload/index.mjs"),
    join(process.cwd(), "out/preload/index.mjs"),
    join(process.cwd(), "apps/desktop/out/preload/index.mjs")
  ];
  const found = candidates.find((p) => existsSync(p));
  if (!found) {
    console.error("[NovaBeauty] preload non trovato. Candidati:", candidates);
    return candidates[0];
  }
  console.info("[NovaBeauty] preload:", found);
  return found;
}

/**
 * Avvia SQLite + registra IPC clienti/appuntamenti.
 * I handler IPC vengono registrati anche se il seed fallisce,
 * così il renderer non resta sul messaggio demo.
 */
function bootstrapLocalDataEngine(): void {
  let engineReady = false;
  try {
    const engine = DataEngine.getInstance();
    const status = engine.start(app.getPath("userData"));
    engine.clients.setSyncHooks(firestoreClientSyncHooks);
    engine.appointments.setSyncHooks(firestoreAppointmentSyncHooks);
    engine.services.setSyncHooks(firestoreServiceSyncHooks);
    engine.inventory.setSyncHooks(firestoreInventorySyncHooks);
    engine.suppliers.setSyncHooks(firestoreSupplierSyncHooks);

    const seededClients = ClientService.getInstance().ensureDemoSeed();
    const seededAppts = AppointmentService.getInstance().ensureDemoSeed();
    const seededServices = ServiceService.getInstance().ensureDemoSeed();
    const seededProducts = InventoryService.getInstance().ensureDemoSeed();
    const seededSuppliers = SupplierService.getInstance().ensureDemoSeed();
    engineReady = status.ready;

    if (status.ready) {
      console.info(
        `[NovaBeauty] DataEngine ready · ${status.tables.length}/${status.expectedTables.length} tables · ${status.dbPath}` +
          (seededClients > 0 ? ` · seeded ${seededClients} clients` : "") +
          (seededAppts > 0 ? ` · seeded ${seededAppts} appointments` : "") +
          (seededServices > 0 ? ` · seeded ${seededServices} services` : "") +
          (seededProducts > 0 ? ` · seeded ${seededProducts} products` : "") +
          (seededSuppliers > 0 ? ` · seeded ${seededSuppliers} suppliers` : "")
      );
    }
  } catch (error) {
    console.error("[NovaBeauty] DataEngine init failed:", error);
  }

  try {
    registerClientIpcHandlers();
    registerAppointmentIpcHandlers();
    registerServiceIpcHandlers();
    registerInventoryIpcHandlers();
    registerSupplierIpcHandlers();
    console.info(
      `[NovaBeauty] IPC registrato (appointments + clients + services + inventory + suppliers)` +
        (engineReady ? "" : " · DB non ready: i create restituiranno l'errore repository")
    );
  } catch (error) {
    console.error("[NovaBeauty] Registrazione IPC fallita:", error);
  }
}

function createWindow(): void {
  const preload = resolvePreloadPath();
  const mainWindow = new BrowserWindow({
    width: 1600,
    height: 900,
    minWidth: 1200,
    minHeight: 720,
    show: false,
    title: "NovaBeauty",
    backgroundColor: "#F7F2F4",
    autoHideMenuBar: true,
    webPreferences: {
      preload,
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false
    }
  });

  mainWindow.webContents.on("preload-error", (_event, preloadPath, error) => {
    console.error("[NovaBeauty] preload-error:", preloadPath, error);
  });

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (
      url.startsWith("https:") ||
      url.startsWith("http:") ||
      url.startsWith("mailto:") ||
      url.startsWith("tel:")
    ) {
      void shell.openExternal(url);
    }
    return { action: "deny" };
  });

  const isDev = !app.isPackaged;
  if (isDev && process.env.ELECTRON_RENDERER_URL) {
    mainWindow.loadURL(process.env.ELECTRON_RENDERER_URL);
    mainWindow.webContents.openDevTools({ mode: "detach" });
  } else {
    mainWindow.loadFile(join(mainDir(), "../../renderer/index.html"));
  }

  mainWindow.once("ready-to-show", () => {
    mainWindow.show();
  });

  mainWindow.on("closed", () => {
    // Let Electron GC collect the window reference.
  });
}

app.whenReady().then(() => {
  bootstrapLocalDataEngine();
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    try {
      DataEngine.getInstance().stop();
    } catch {
      /* ignore */
    }
    app.quit();
  }
});
