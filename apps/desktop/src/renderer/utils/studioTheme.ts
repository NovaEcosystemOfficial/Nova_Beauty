/**
 * Studio Styles — design tokens globali + persistenza.
 *
 * TODO FUTURI:
 * - Marketplace temi / Community / Premium
 * - Importa / Esporta .novastyle
 * - Sincronizzazione cloud Nova
 * - Font, animazioni, pacchetti icone personalizzati
 * - Temi automatici giorno/notte
 */

export type AppliedPalette = {
  primary: string;
  secondary: string;
  sidebar: string;
  surface: string;
  button: string;
  card: string;
  success?: string;
  error?: string;
  dark?: boolean;
};

export type StudioStyleDefinition = AppliedPalette & {
  id: string;
  name: string;
  description: string;
};

/** Catalogo ufficiale Studio Styles (fonte unica). */
export const OFFICIAL_STUDIO_STYLES: StudioStyleDefinition[] = [
  {
    id: "nova-pink",
    name: "Nova Pink",
    description: "Il design originale NovaBeauty.",
    primary: "#c48a97",
    secondary: "#eac7cf",
    sidebar: "#ffffff",
    surface: "#f7f2f4",
    button: "#c48a97",
    card: "#fbf7f9"
  },
  {
    id: "luxury-gold",
    name: "Luxury Gold",
    description: "Elegante, premium, nero e oro.",
    primary: "#d4b06a",
    secondary: "#3a2f34",
    sidebar: "#1c1719",
    surface: "#151113",
    button: "#d4b06a",
    card: "#221c1f",
    dark: true
  },
  {
    id: "nature-spa",
    name: "Nature Spa",
    description: "Verde salvia e colori rilassanti.",
    primary: "#659c8b",
    secondary: "#cfe3db",
    sidebar: "#f4faf7",
    surface: "#eef6f2",
    button: "#4f8a7a",
    card: "#f7fbf9"
  },
  {
    id: "ocean",
    name: "Ocean",
    description: "Blu moderno e pulito.",
    primary: "#4f7cac",
    secondary: "#c9d9ea",
    sidebar: "#f3f7fb",
    surface: "#e8f0f8",
    button: "#3f6a98",
    card: "#f5f8fc"
  },
  {
    id: "violet",
    name: "Violet Studio",
    description: "Viola contemporaneo.",
    primary: "#7a6bb0",
    secondary: "#d9d4ec",
    sidebar: "#f6f4fb",
    surface: "#eeeaf8",
    button: "#6759a0",
    card: "#f7f5fc"
  },
  {
    id: "graphite",
    name: "Graphite",
    description: "Scuro professionale.",
    primary: "#8a8890",
    secondary: "#2c2a30",
    sidebar: "#1a191d",
    surface: "#121114",
    button: "#9a98a0",
    card: "#1e1c22",
    dark: true
  },
  {
    id: "sunset",
    name: "Sunset",
    description: "Caldo, corallo e sabbia.",
    primary: "#e08a6a",
    secondary: "#f3e0d2",
    sidebar: "#fff8f3",
    surface: "#faf0e8",
    button: "#d97858",
    card: "#fffaf6"
  }
];

export type ThemeTokens = Record<string, string>;

const LIGHT_DEFAULTS: ThemeTokens = {
  "--nb-primary": "#d8a7b1",
  "--nb-primary-deep": "#c48a97",
  "--nb-secondary": "#eac7cf",
  "--nb-background": "#f7f2f4",
  "--nb-surface": "#ffffff",
  "--nb-card": "#fbf7f9",
  "--nb-elevated": "#ffffff",
  "--nb-text": "#1a1417",
  "--nb-muted": "#6f5f68",
  "--nb-subtle": "#9a8791",
  "--nb-border": "#eadde2",
  "--nb-border-strong": "#dbcfd5",
  "--nb-success": "#2e7d32",
  "--nb-danger": "#e5484d",
  "--nb-gold": "#bc9150",
  "--nb-mint": "#659c8b",
  "--nb-lavender": "#8680be",
  "--nb-on-primary": "#ffffff",
  "--nb-sidebar": "#ffffff",
  "--nb-sidebar-end": "#fbf7f9",
  "--nb-header-bg": "color-mix(in srgb, var(--nb-elevated) 72%, transparent)",
  "--nb-header-border": "color-mix(in srgb, var(--nb-border) 90%, transparent)",
  "--nb-input-bg": "var(--nb-elevated)",
  "--nb-overlay": "rgba(26, 20, 23, 0.4)",
  "--nb-hover": "color-mix(in srgb, var(--nb-primary) 10%, transparent)",
  "--nb-active-bg":
    "linear-gradient(90deg, color-mix(in srgb, var(--nb-primary) 22%, transparent), color-mix(in srgb, var(--nb-primary) 8%, transparent))",
  "--nb-active-ring": "color-mix(in srgb, var(--nb-primary) 35%, transparent)",
  "--nb-wash-a": "color-mix(in srgb, var(--nb-primary) 18%, transparent)",
  "--nb-wash-b": "color-mix(in srgb, var(--nb-lavender) 8%, transparent)",
  "--nb-scrollbar-track": "color-mix(in srgb, var(--nb-border) 55%, transparent)",
  "--nb-scrollbar-thumb": "color-mix(in srgb, var(--nb-primary-deep) 45%, var(--nb-border))",
  "--nb-scrollbar-thumb-hover": "color-mix(in srgb, var(--nb-primary-deep) 70%, var(--nb-border))",
  "--nb-shadow-soft": "0 1px 2px rgba(37, 26, 31, 0.04), 0 8px 24px rgba(37, 26, 31, 0.05)",
  "--nb-shadow-card": "0 1px 1px rgba(37, 26, 31, 0.03), 0 12px 32px rgba(37, 26, 31, 0.06)",
  "--nb-shadow-floating": "0 18px 50px rgba(37, 26, 31, 0.1)",
  "--nb-shadow-primary": "0 10px 24px color-mix(in srgb, var(--nb-primary-deep) 35%, transparent)"
};

function mixHex(hex: string, withWhite: number): string {
  const h = hex.replace("#", "");
  if (h.length !== 6) return hex;
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  const m = (c: number) => Math.round(c + (255 - c) * withWhite);
  return `#${[m(r), m(g), m(b)].map((n) => n.toString(16).padStart(2, "0")).join("")}`;
}

function mixToward(hex: string, toward: string, amount: number): string {
  const parse = (v: string) => {
    const h = v.replace("#", "");
    if (h.length !== 6) return null;
    return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)] as const;
  };
  const a = parse(hex);
  const b = parse(toward);
  if (!a || !b) return hex;
  const m = (i: number) => Math.round(a[i] + (b[i] - a[i]) * amount);
  return `#${[m(0), m(1), m(2)].map((n) => n.toString(16).padStart(2, "0")).join("")}`;
}

/** Risolve la palette in token CSS completi per l'intera app. */
export function resolveThemeTokens(palette: AppliedPalette): ThemeTokens {
  const dark = Boolean(palette.dark);
  const primaryDeep = palette.button || palette.primary;
  const primary = dark ? palette.primary : mixHex(palette.primary, 0.25);
  const card = palette.card || (dark ? "#221c1f" : mixHex(palette.surface, 0.5));
  const elevated = dark ? mixToward(card, "#ffffff", 0.06) : "#ffffff";
  const surface = dark ? palette.sidebar : "#ffffff";
  const sidebar = dark ? palette.sidebar : palette.sidebar || "#ffffff";
  const sidebarEnd = dark ? mixToward(sidebar, "#000000", 0.12) : mixHex(palette.surface, 0.35);
  const text = dark ? "#f7f2f4" : "#1a1417";
  const muted = dark ? "#c4b6bc" : "#6f5f68";
  const subtle = dark ? "#9a8791" : "#9a8791";
  const border = dark ? "#3a3236" : mixHex(palette.secondary, 0.35);
  const borderStrong = dark ? "#4a4246" : mixHex(palette.primary, 0.55);
  const background = palette.surface;

  return {
    "--nb-primary": primary,
    "--nb-primary-deep": primaryDeep,
    "--nb-secondary": palette.secondary,
    "--nb-background": background,
    "--nb-surface": surface,
    "--nb-card": card,
    "--nb-elevated": elevated,
    "--nb-text": text,
    "--nb-muted": muted,
    "--nb-subtle": subtle,
    "--nb-border": border,
    "--nb-border-strong": borderStrong,
    "--nb-success": palette.success || (dark ? "#5dba6a" : "#2e7d32"),
    "--nb-danger": palette.error || "#e5484d",
    "--nb-on-primary": dark ? "#1a1417" : "#ffffff",
    "--nb-sidebar": sidebar,
    "--nb-sidebar-end": sidebarEnd,
    "--nb-header-bg": dark
      ? "color-mix(in srgb, var(--nb-elevated) 82%, transparent)"
      : "color-mix(in srgb, var(--nb-elevated) 72%, transparent)",
    "--nb-header-border": "color-mix(in srgb, var(--nb-border) 90%, transparent)",
    "--nb-input-bg": "var(--nb-elevated)",
    "--nb-overlay": dark ? "rgba(0, 0, 0, 0.55)" : "rgba(26, 20, 23, 0.4)",
    "--nb-hover": "color-mix(in srgb, var(--nb-primary) 10%, transparent)",
    "--nb-active-bg":
      "linear-gradient(90deg, color-mix(in srgb, var(--nb-primary) 22%, transparent), color-mix(in srgb, var(--nb-primary) 8%, transparent))",
    "--nb-active-ring": "color-mix(in srgb, var(--nb-primary) 35%, transparent)",
    "--nb-wash-a": "color-mix(in srgb, var(--nb-primary) 18%, transparent)",
    "--nb-wash-b": dark
      ? "color-mix(in srgb, var(--nb-primary) 8%, transparent)"
      : "color-mix(in srgb, var(--nb-lavender) 8%, transparent)",
    "--nb-scrollbar-track": "color-mix(in srgb, var(--nb-border) 55%, transparent)",
    "--nb-scrollbar-thumb": "color-mix(in srgb, var(--nb-primary-deep) 45%, var(--nb-border))",
    "--nb-scrollbar-thumb-hover": "color-mix(in srgb, var(--nb-primary-deep) 70%, var(--nb-border))",
    "--nb-shadow-soft": dark
      ? "0 1px 2px rgba(0, 0, 0, 0.25), 0 8px 24px rgba(0, 0, 0, 0.28)"
      : "0 1px 2px rgba(37, 26, 31, 0.04), 0 8px 24px rgba(37, 26, 31, 0.05)",
    "--nb-shadow-card": dark
      ? "0 1px 1px rgba(0, 0, 0, 0.3), 0 12px 32px rgba(0, 0, 0, 0.35)"
      : "0 1px 1px rgba(37, 26, 31, 0.03), 0 12px 32px rgba(37, 26, 31, 0.06)",
    "--nb-shadow-floating": dark
      ? "0 18px 50px rgba(0, 0, 0, 0.45)"
      : "0 18px 50px rgba(37, 26, 31, 0.1)",
    "--nb-shadow-primary": "0 10px 24px color-mix(in srgb, var(--nb-primary-deep) 35%, transparent)"
  };
}

export function applyThemeTokensToDocument(tokens: ThemeTokens, dark?: boolean): void {
  const root = document.documentElement;
  root.classList.add("nb-ssThemeTween");
  root.dataset.theme = dark ? "dark" : "light";
  root.dataset.studioStyle = "1";

  for (const [key, value] of Object.entries(tokens)) {
    root.style.setProperty(key, value);
  }

  window.setTimeout(() => root.classList.remove("nb-ssThemeTween"), 420);
}

export function applyStudioThemeToDocument(palette: AppliedPalette): void {
  applyThemeTokensToDocument(resolveThemeTokens(palette), Boolean(palette.dark));
}

export function resetStudioThemeToDefault(): void {
  applyThemeTokensToDocument(LIGHT_DEFAULTS, false);
}

const STORAGE_KEY = "nb-studio-custom-styles-v1";
const ACTIVE_KEY = "nb-studio-active-style-v1";

export type StoredCustomStyle = {
  id: string;
  name: string;
  description: string;
  primary: string;
  secondary: string;
  sidebar: string;
  surface: string;
  button: string;
  card: string;
  success: string;
  error: string;
  dark?: boolean;
};

export function loadCustomStyles(): StoredCustomStyle[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as StoredCustomStyle[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveCustomStyles(list: StoredCustomStyle[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

export function loadActiveStyleId(): string | null {
  return localStorage.getItem(ACTIVE_KEY);
}

export function saveActiveStyleId(id: string): void {
  localStorage.setItem(ACTIVE_KEY, id);
}

export function findStyleById(id: string): StudioStyleDefinition | StoredCustomStyle | null {
  const official = OFFICIAL_STUDIO_STYLES.find((s) => s.id === id);
  if (official) return official;
  return loadCustomStyles().find((s) => s.id === id) ?? null;
}

/** Applica lo stile attivo da localStorage (boot app). */
export function bootstrapStudioTheme(): string {
  const id = loadActiveStyleId() ?? "nova-pink";
  const style = findStyleById(id) ?? OFFICIAL_STUDIO_STYLES[0];
  applyStudioThemeToDocument({
    primary: style.primary,
    secondary: style.secondary,
    sidebar: style.sidebar,
    surface: style.surface,
    button: style.button,
    card: style.card || (style.dark ? "#221c1f" : "#ffffff"),
    success: "success" in style ? style.success : undefined,
    error: "error" in style ? style.error : undefined,
    dark: style.dark
  });
  return style.id;
}

/** TODO: sincronizzazione reale Studio Style via Nova Cloud */
export async function syncStudioStyleToEcosystem(): Promise<string> {
  await new Promise((r) => window.setTimeout(r, 1400));
  return "Studio Style sincronizzato.";
}
