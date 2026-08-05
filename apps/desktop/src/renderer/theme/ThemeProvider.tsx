import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode
} from "react";
import {
  applyStudioThemeToDocument,
  bootstrapStudioTheme,
  findStyleById,
  loadActiveStyleId,
  OFFICIAL_STUDIO_STYLES,
  saveActiveStyleId,
  type AppliedPalette
} from "../utils/studioTheme";

type ThemeContextValue = {
  activeStyleId: string;
  isDark: boolean;
  applyPalette: (id: string, palette: AppliedPalette) => void;
  reapplyActive: () => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [activeStyleId, setActiveStyleId] = useState(
    () => loadActiveStyleId() ?? "nova-pink"
  );
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const id = bootstrapStudioTheme();
    setActiveStyleId(id);
    const style = findStyleById(id);
    setIsDark(Boolean(style?.dark));
  }, []);

  const applyPalette = useCallback((id: string, palette: AppliedPalette) => {
    applyStudioThemeToDocument(palette);
    saveActiveStyleId(id);
    setActiveStyleId(id);
    setIsDark(Boolean(palette.dark));
  }, []);

  const reapplyActive = useCallback(() => {
    const id = loadActiveStyleId() ?? activeStyleId;
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
    setActiveStyleId(style.id);
    setIsDark(Boolean(style.dark));
  }, [activeStyleId]);

  const value = useMemo(
    () => ({ activeStyleId, isDark, applyPalette, reapplyActive }),
    [activeStyleId, isDark, applyPalette, reapplyActive]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useStudioTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useStudioTheme must be used within ThemeProvider");
  }
  return ctx;
}
