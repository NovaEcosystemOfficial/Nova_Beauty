/**
 * One-shot migrator: replace hardcoded Nova Pink / cream colors with design tokens.
 * Run: node scripts/migrate-theme-tokens.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const cssPath = path.resolve(__dirname, "../src/renderer/styles.css");
let css = fs.readFileSync(cssPath, "utf8");

function pct(alpha) {
  return Math.max(1, Math.round(Number(alpha) * 100));
}

// Pink primary rgba → color-mix with --nb-primary
css = css.replace(
  /rgba\(\s*216\s*,\s*167\s*,\s*177\s*,\s*([0-9.]+)\s*\)/g,
  (_, a) => `color-mix(in srgb, var(--nb-primary) ${pct(a)}%, transparent)`
);

// Primary-deep rgba → --nb-primary-deep
css = css.replace(
  /rgba\(\s*196\s*,\s*138\s*,\s*151\s*,\s*([0-9.]+)\s*\)/g,
  (_, a) => `color-mix(in srgb, var(--nb-primary-deep) ${pct(a)}%, transparent)`
);

// Cream border rgba
css = css.replace(
  /rgba\(\s*232\s*,\s*221\s*,\s*225\s*,\s*([0-9.]+)\s*\)/g,
  (_, a) => `color-mix(in srgb, var(--nb-border) ${pct(a)}%, transparent)`
);

// Warm shadow base often used with pink UI
css = css.replace(
  /rgba\(\s*40\s*,\s*28\s*,\s*36\s*,\s*([0-9.]+)\s*\)/g,
  (_, a) => `color-mix(in srgb, var(--nb-text) ${pct(a)}%, transparent)`
);

// Cream / blush panel fills
css = css.replace(/#fbf7f9\b/gi, "var(--nb-card)");
css = css.replace(/#fbf8f9\b/gi, "var(--nb-card)");
css = css.replace(/#f7f2f4\b/gi, "var(--nb-background)");
css = css.replace(/#f4eef1\b/gi, "var(--nb-card)");
css = css.replace(/#fff8f9\b/gi, "var(--nb-card)");
css = css.replace(/#faf6f7\b/gi, "var(--nb-card)");

// color-mix(..., #fff) → elevated so dark themes work
css = css.replace(
  /color-mix\(\s*in srgb,\s*([^,]+),\s*#fff\s*\)/gi,
  "color-mix(in srgb, $1, var(--nb-elevated))"
);
css = css.replace(
  /color-mix\(\s*in srgb,\s*([^,]+),\s*#ffffff\s*\)/gi,
  "color-mix(in srgb, $1, var(--nb-elevated))"
);

// Standalone white backgrounds (not color:)
css = css.replace(
  /(background(?:-color)?\s*:\s*)#fff\b/gi,
  "$1var(--nb-elevated)"
);
css = css.replace(
  /(background(?:-color)?\s*:\s*)#ffffff\b/gi,
  "$1var(--nb-elevated)"
);

// Gradients that start/end with #fff
css = css.replace(
  /(linear-gradient\([^)]*?)\b#fff\b/gi,
  "$1var(--nb-elevated)"
);
css = css.replace(
  /(linear-gradient\([^)]*?)\b#ffffff\b/gi,
  "$1var(--nb-elevated)"
);

fs.writeFileSync(cssPath, css);
console.log("Migrated theme tokens in styles.css");
