import { resolve } from "path";
import { defineConfig, externalizeDepsPlugin } from "electron-vite";
import react from "@vitejs/plugin-react";

const root = __dirname;

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()],
    build: {
      lib: {
        entry: resolve(root, "electron/main/index.ts")
      }
    }
  },
  preload: {
    plugins: [externalizeDepsPlugin()],
    build: {
      lib: {
        entry: resolve(root, "electron/preload/index.ts")
      }
    }
  },
  renderer: {
    root: resolve(root, "src/renderer"),
    resolve: {
      alias: {
        "@": resolve(root, "src")
      }
    },
    plugins: [react()],
    build: {
      rollupOptions: {
        input: resolve(root, "src/renderer/index.html")
      }
    }
  }
});

