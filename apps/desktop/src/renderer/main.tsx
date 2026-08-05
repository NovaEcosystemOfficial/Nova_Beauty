import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./styles.css";
import { bootstrapStudioTheme } from "./utils/studioTheme";

/** Applica lo Studio Style salvato prima del primo paint. */
bootstrapStudioTheme();

const rootEl = document.getElementById("root");
if (!rootEl) {
  throw new Error("Missing #root element in index.html");
}

createRoot(rootEl).render(
  <StrictMode>
    <App />
  </StrictMode>
);
