import {
  Eye,
  Image as ImageIcon,
  Monitor,
  Moon,
  Orbit,
  Pencil,
  Sparkles,
  Sun,
  Trash2,
  Type,
  Upload,
  Download
} from "lucide-react";
import clsx from "clsx";
import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { useDemoWorkflow } from "../demo/DemoWorkflowContext";
import { useStudioTheme } from "../theme/ThemeProvider";
import {
  loadCustomStyles,
  OFFICIAL_STUDIO_STYLES,
  saveCustomStyles,
  syncStudioStyleToEcosystem,
  type StoredCustomStyle
} from "../utils/studioTheme";

type ThemeMode = "chiaro" | "scuro" | "automatico";
type Density = "compatto" | "standard" | "confortevole";

type StudioStyle = {
  id: string;
  name: string;
  description: string;
  primary: string;
  secondary: string;
  sidebar: string;
  surface: string;
  button: string;
  card?: string;
  success?: string;
  error?: string;
  dark?: boolean;
  custom?: boolean;
};

const STUDIO_STYLES: StudioStyle[] = OFFICIAL_STUDIO_STYLES.map((s) => ({
  id: s.id,
  name: s.name,
  description: s.description,
  primary: s.primary,
  secondary: s.secondary,
  sidebar: s.sidebar,
  surface: s.surface,
  button: s.button,
  card: s.card,
  dark: s.dark
}));

const ECOSYSTEM_APPS = ["NovaBeauty", "NovaDocs", "NovaPromo"];

const SLOGAN_KEY = "nb-studio-slogan-v1";
const LOGIN_ASSETS_KEY = "nb-studio-login-assets-v1";

function storedToStudioStyle(s: StoredCustomStyle): StudioStyle {
  return {
    id: s.id,
    name: s.name,
    description: s.description,
    primary: s.primary,
    secondary: s.secondary,
    sidebar: s.sidebar,
    surface: s.surface,
    button: s.button,
    card: s.card,
    success: s.success,
    error: s.error,
    dark: s.dark,
    custom: true
  };
}

export default function AppearanceCenter() {
  const {
    studioName,
    setStudioName,
    studioLogoUrl,
    setStudioLogoUrl,
    pushToast
  } = useDemoWorkflow();
  const { activeStyleId, applyPalette } = useStudioTheme();

  const [slogan, setSlogan] = useState(() => localStorage.getItem(SLOGAN_KEY) ?? "Bellezza · Cura · Presenza");
  const [customStyles, setCustomStyles] = useState<StoredCustomStyle[]>(() => loadCustomStyles());
  const [styleId, setStyleId] = useState(activeStyleId);
  const [editingCustomId, setEditingCustomId] = useState<string | null>(null);
  const [custom, setCustom] = useState({
    primary: "#c48a97",
    secondary: "#eac7cf",
    sidebar: "#ffffff",
    header: "#fbf7f9",
    button: "#c48a97",
    card: "#ffffff",
    chart: "#c48a97",
    success: "#2e9b63",
    error: "#e5484d"
  });
  const [useCustomDraft, setUseCustomDraft] = useState(false);
  const [theme, setTheme] = useState<ThemeMode>("chiaro");
  const [density, setDensity] = useState<Density>("standard");
  const [micro, setMicro] = useState(true);
  const [blur, setBlur] = useState(true);
  const [effects, setEffects] = useState(true);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [welcome, setWelcome] = useState("Bentornata nel tuo studio");
  const [savedFlash, setSavedFlash] = useState(false);
  const [nameDialogOpen, setNameDialogOpen] = useState(false);
  const [draftName, setDraftName] = useState(studioName);
  const [draftSlogan, setDraftSlogan] = useState(slogan);
  const [fullscreenPreview, setFullscreenPreview] = useState(false);
  const [syncOpen, setSyncOpen] = useState(false);
  const [syncProgress, setSyncProgress] = useState(0);
  const [syncing, setSyncing] = useState(false);
  const [loginLogoUrl, setLoginLogoUrl] = useState<string | null>(null);
  const [loginBgUrl, setLoginBgUrl] = useState<string | null>(null);

  const logoInputRef = useRef<HTMLInputElement>(null);
  const loginLogoInputRef = useRef<HTMLInputElement>(null);
  const loginBgInputRef = useRef<HTMLInputElement>(null);

  const allStyles = useMemo(
    () => [...STUDIO_STYLES, ...customStyles.map(storedToStudioStyle)],
    [customStyles]
  );

  const activeStyle = allStyles.find((s) => s.id === styleId) ?? STUDIO_STYLES[0];
  const appliedId = useCustomDraft && editingCustomId ? editingCustomId : styleId;

  const palette = useMemo(() => {
    if (useCustomDraft) {
      return {
        primary: custom.primary,
        secondary: custom.secondary,
        sidebar: custom.sidebar,
        surface: custom.header,
        button: custom.button,
        card: custom.card,
        success: custom.success,
        error: custom.error,
        dark: theme === "scuro"
      };
    }
    return {
      primary: activeStyle.primary,
      secondary: activeStyle.secondary,
      sidebar: activeStyle.sidebar,
      surface: activeStyle.surface,
      button: activeStyle.button,
      card: activeStyle.card ?? (activeStyle.dark ? "#221c1f" : "#ffffff"),
      success: activeStyle.success,
      error: activeStyle.error,
      dark: Boolean(activeStyle.dark) || theme === "scuro"
    };
  }, [useCustomDraft, custom, activeStyle, theme]);

  const pushTheme = (id: string, next: typeof palette) => {
    applyPalette(id, {
      primary: next.primary,
      secondary: next.secondary,
      sidebar: next.sidebar,
      surface: next.surface,
      button: next.button,
      card: next.card,
      success: next.success,
      error: next.error,
      dark: next.dark
    });
  };

  useEffect(() => {
    setStyleId(activeStyleId);
    const found = allStyles.find((s) => s.id === activeStyleId);
    if (found?.dark) setTheme("scuro");
  }, [activeStyleId, allStyles]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(LOGIN_ASSETS_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as { logo?: string | null; bg?: string | null };
      if (parsed.logo) setLoginLogoUrl(parsed.logo);
      if (parsed.bg) setLoginBgUrl(parsed.bg);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(SLOGAN_KEY, slogan);
  }, [slogan]);

  const persistLoginAssets = (logo: string | null, bg: string | null) => {
    localStorage.setItem(LOGIN_ASSETS_KEY, JSON.stringify({ logo, bg }));
  };

  const applyStyle = (id: string) => {
    setUseCustomDraft(false);
    setEditingCustomId(null);
    setStyleId(id);
    const s = allStyles.find((x) => x.id === id);
    if (!s) return;
    setCustom((c) => ({
      ...c,
      primary: s.primary,
      secondary: s.secondary,
      sidebar: s.sidebar,
      header: s.surface,
      button: s.button,
      card: s.card ?? c.card,
      chart: s.primary,
      success: s.success ?? c.success,
      error: s.error ?? c.error
    }));
    if (s.dark) setTheme("scuro");
    else if (theme === "scuro" && !s.dark) setTheme("chiaro");
    pushTheme(id, {
      primary: s.primary,
      secondary: s.secondary,
      sidebar: s.sidebar,
      surface: s.surface,
      button: s.button,
      card: s.card ?? (s.dark ? "#221c1f" : "#ffffff"),
      success: s.success,
      error: s.error,
      dark: Boolean(s.dark)
    });
    pushToast(`Stile «${s.name}» applicato.`);
  };

  const saveCustom = () => {
    const isDark = theme === "scuro";
    if (editingCustomId) {
      const nextList = customStyles.map((s) =>
        s.id === editingCustomId
          ? {
              ...s,
              primary: custom.primary,
              secondary: custom.secondary,
              sidebar: custom.sidebar,
              surface: custom.header,
              button: custom.button,
              card: custom.card,
              success: custom.success,
              error: custom.error,
              dark: isDark
            }
          : s
      );
      setCustomStyles(nextList);
      saveCustomStyles(nextList);
      setStyleId(editingCustomId);
      setUseCustomDraft(false);
      pushTheme(editingCustomId, {
        primary: custom.primary,
        secondary: custom.secondary,
        sidebar: custom.sidebar,
        surface: custom.header,
        button: custom.button,
        card: custom.card,
        success: custom.success,
        error: custom.error,
        dark: isDark
      });
      setSavedFlash(true);
      window.setTimeout(() => setSavedFlash(false), 1600);
      pushToast("Studio Style aggiornato.");
      return;
    }

    const n = customStyles.length + 1;
    const created: StoredCustomStyle = {
      id: `custom-${Date.now()}`,
      name: `Il mio stile ${n}`,
      description: "Tema personalizzato del centro.",
      primary: custom.primary,
      secondary: custom.secondary,
      sidebar: custom.sidebar,
      surface: custom.header,
      button: custom.button,
      card: custom.card,
      success: custom.success,
      error: custom.error,
      dark: isDark
    };
    const nextList = [...customStyles, created];
    setCustomStyles(nextList);
    saveCustomStyles(nextList);
    setStyleId(created.id);
    setUseCustomDraft(false);
    setEditingCustomId(null);
    pushTheme(created.id, {
      primary: created.primary,
      secondary: created.secondary,
      sidebar: created.sidebar,
      surface: created.surface,
      button: created.button,
      card: created.card,
      success: created.success,
      error: created.error,
      dark: Boolean(created.dark)
    });
    setSavedFlash(true);
    window.setTimeout(() => setSavedFlash(false), 1600);
    pushToast("Studio Style salvato.");
  };

  const editCustom = (id: string) => {
    const s = customStyles.find((x) => x.id === id);
    if (!s) return;
    setEditingCustomId(id);
    setUseCustomDraft(true);
    setCustom({
      primary: s.primary,
      secondary: s.secondary,
      sidebar: s.sidebar,
      header: s.surface,
      button: s.button,
      card: s.card,
      chart: s.primary,
      success: s.success,
      error: s.error
    });
    if (s.dark) setTheme("scuro");
    pushToast("Modifica lo stile e premi Salva Studio Style.");
  };

  const deleteCustom = (id: string) => {
    const nextList = customStyles.filter((s) => s.id !== id);
    setCustomStyles(nextList);
    saveCustomStyles(nextList);
    if (editingCustomId === id) setEditingCustomId(null);
    if (styleId === id) {
      applyStyle("nova-pink");
    }
    pushToast("Studio Style eliminato.");
  };

  const exportCustom = (id: string) => {
    const s = customStyles.find((x) => x.id === id);
    if (!s) return;
    // TODO: formato ufficiale .novastyle + firma cloud
    const blob = new Blob([JSON.stringify({ format: "novastyle", version: 1, style: s }, null, 2)], {
      type: "application/json"
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${s.name.replace(/\s+/g, "_")}.novastyle`;
    a.click();
    URL.revokeObjectURL(url);
    pushToast("Tema esportato (.novastyle).");
  };

  const onPickImage = (
    file: File | undefined,
    onDone: (dataUrl: string) => void,
    toastMsg: string
  ) => {
    if (!file || !file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = String(reader.result ?? "");
      onDone(dataUrl);
      pushToast(toastMsg);
    };
    reader.readAsDataURL(file);
  };

  const openNameDialog = () => {
    setDraftName(studioName);
    setDraftSlogan(slogan);
    setNameDialogOpen(true);
  };

  const saveNameDialog = () => {
    const nextName = draftName.trim() || studioName;
    const nextSlogan = draftSlogan.trim() || slogan;
    setStudioName(nextName);
    setSlogan(nextSlogan);
    setNameDialogOpen(false);
    pushToast("Identità aggiornata.");
  };

  const onSyncEcosystem = async () => {
    if (syncing) return;
    setSyncOpen(true);
    setSyncing(true);
    setSyncProgress(0);
    const steps = [18, 42, 68, 88, 100];
    for (const p of steps) {
      await new Promise((r) => window.setTimeout(r, 280));
      setSyncProgress(p);
    }
    // TODO: sincronizzazione reale Studio Style via Nova Cloud verso NovaBeauty / NovaDocs / NovaPromo
    const msg = await syncStudioStyleToEcosystem();
    setSyncing(false);
    pushToast(msg);
    window.setTimeout(() => setSyncOpen(false), 500);
  };

  const livePreview = (
    className?: string,
    fullscreen?: boolean
  ) => (
    <article
      className={clsx(
        "nb-ssLive",
        palette.dark && "isDark",
        theme === "automatico" && "isAuto",
        `density-${density}`,
        (micro || effects) && !reduceMotion && "hasMotion",
        blur && !reduceMotion && "hasBlur",
        className
      )}
      style={
        {
          ["--ss-primary" as string]: palette.primary,
          ["--ss-secondary" as string]: palette.secondary,
          ["--ss-sidebar" as string]: palette.sidebar,
          ["--ss-surface" as string]: palette.surface,
          ["--ss-button" as string]: palette.button,
          ["--ss-card" as string]: palette.card
        } as CSSProperties
      }
    >
      <div className="nb-ssLiveHead">
        <Sparkles className="nb-ssIcon" aria-hidden={true} />
        {fullscreen ? "Anteprima stile" : "Anteprima live"}
        <em>{useCustomDraft ? "Custom Style" : activeStyle.name}</em>
      </div>
      <div className="nb-ssMock">
        <aside className="nb-ssMockSidebar">
          <div className="nb-ssMockBrand">
            {studioLogoUrl ? (
              <img className="nb-ssMockLogoImg" src={studioLogoUrl} alt="" />
            ) : (
              <span className="nb-ssMockLogo">{initials(studioName)}</span>
            )}
            <div>
              <strong>{studioName.split(" ").slice(0, 2).join(" ")}</strong>
              <em>{slogan}</em>
            </div>
          </div>
          <nav>
            {["Dashboard", "Agenda", "Clienti", "Servizi", "Report"].map((item, i) => (
              <span key={item} className={clsx(i === 0 && "isOn")}>
                {item}
              </span>
            ))}
          </nav>
        </aside>
        <div className="nb-ssMockMain">
          <header>
            <div>
              <small>NovaBeauty</small>
              <h4>Dashboard</h4>
            </div>
            <button type="button" className="nb-ssMockCta">
              <Pencil className="nb-ssIcon" aria-hidden={true} />
              Nuovo
            </button>
          </header>
          <div className="nb-ssMockKpis">
            <div>
              <span>Incasso</span>
              <strong>€4.280</strong>
            </div>
            <div>
              <span>Appuntamenti</span>
              <strong>86</strong>
            </div>
            <div>
              <span>Clienti</span>
              <strong>12</strong>
            </div>
          </div>
          <div className="nb-ssMockPanel">
            <div className="nb-ssMockPanelTitle">Attività oggi</div>
            <div className="nb-ssMockRows">
              <span />
              <span />
              <span />
            </div>
          </div>
        </div>
      </div>
      <p className="nb-ssLiveFoot">
        {useCustomDraft ? "Stile personalizzato" : activeStyle.name} · tema {theme} · layout{" "}
        {density}
      </p>
    </article>
  );

  return (
    <div className="nb-ss" role="region" aria-label="Studio Styles">
      <input
        ref={logoInputRef}
        type="file"
        accept="image/*"
        hidden
        onChange={(e) => {
          // TODO: upload reale logo centro su Nova Cloud / storage brand
          onPickImage(e.target.files?.[0], (url) => setStudioLogoUrl(url), "Logo aggiornato.");
          e.target.value = "";
        }}
      />
      <input
        ref={loginLogoInputRef}
        type="file"
        accept="image/*"
        hidden
        onChange={(e) => {
          // TODO: upload reale logo login su Nova Cloud
          onPickImage(
            e.target.files?.[0],
            (url) => {
              setLoginLogoUrl(url);
              persistLoginAssets(url, loginBgUrl);
            },
            "Logo login aggiornato."
          );
          e.target.value = "";
        }}
      />
      <input
        ref={loginBgInputRef}
        type="file"
        accept="image/*"
        hidden
        onChange={(e) => {
          // TODO: upload reale sfondo login su Nova Cloud
          onPickImage(
            e.target.files?.[0],
            (url) => {
              setLoginBgUrl(url);
              persistLoginAssets(loginLogoUrl, url);
            },
            "Sfondo login aggiornato."
          );
          e.target.value = "";
        }}
      />

      <header className="nb-ssHead">
        <div
          className="nb-ssHeadIcon"
          aria-hidden={true}
          style={{ color: palette.primary, background: `${palette.primary}22` }}
        >
          <Sparkles />
        </div>
        <div>
          <h2 className="nb-ssTitle">Studio Styles</h2>
          <p className="nb-ssSub">Personalizza l&apos;identità visiva del tuo centro estetico.</p>
        </div>
      </header>

      <div className="nb-ssLayout">
        <div className="nb-ssControls">
          <article className="nb-ssCard">
            <h3 className="nb-ssCardTitle">Identità del centro</h3>
            <div className="nb-ssIdentity">
              <div
                className="nb-ssLogo"
                style={{
                  background: studioLogoUrl
                    ? undefined
                    : `linear-gradient(145deg, ${palette.primary}, ${palette.secondary})`
                }}
                aria-hidden={true}
              >
                {studioLogoUrl ? (
                  <img className="nb-ssLogoImg" src={studioLogoUrl} alt="" />
                ) : (
                  initials(studioName)
                )}
              </div>
              <div className="nb-ssIdentityBody">
                <div className="nb-ssStudioName">{studioName}</div>
                <input
                  className="nb-ssInput"
                  value={slogan}
                  onChange={(e) => setSlogan(e.target.value)}
                  aria-label="Slogan"
                  placeholder="Slogan"
                />
                <div className="nb-ssActions">
                  <button
                    type="button"
                    className="nb-ssGhost"
                    onClick={() => logoInputRef.current?.click()}
                  >
                    <Upload className="nb-ssIcon" aria-hidden={true} />
                    Modifica Logo
                  </button>
                  <button type="button" className="nb-ssGhost" onClick={openNameDialog}>
                    <Type className="nb-ssIcon" aria-hidden={true} />
                    Modifica Nome
                  </button>
                  <button
                    type="button"
                    className="nb-ssGhost"
                    onClick={() => setFullscreenPreview(true)}
                  >
                    <Eye className="nb-ssIcon" aria-hidden={true} />
                    Anteprima
                  </button>
                </div>
              </div>
            </div>
          </article>

          <article className="nb-ssCard">
            <h3 className="nb-ssCardTitle">Studio Styles</h3>
            <p className="nb-ssCardHint">Scegli uno stile e applicalo all&apos;anteprima live</p>
            <div className="nb-ssStyleGrid">
              {allStyles.map((style) => {
                const selected = !useCustomDraft && appliedId === style.id;
                return (
                  <div
                    key={style.id}
                    className={clsx("nb-ssStyleCard", selected && "isSelected", style.dark && "isDark")}
                  >
                    {selected ? <span className="nb-ssAppliedBadge">Applicato</span> : null}
                    <StyleMiniPreview style={style} />
                    <div className="nb-ssStyleName">{style.name}</div>
                    <p className="nb-ssStyleDesc">{style.description}</p>
                    <button
                      type="button"
                      className={clsx("nb-ssApply", selected && "isOn")}
                      style={
                        selected
                          ? { background: style.button, borderColor: style.button }
                          : undefined
                      }
                      onClick={() => applyStyle(style.id)}
                    >
                      {selected ? "Applicato" : "Applica"}
                    </button>
                    {style.custom ? (
                      <div className="nb-ssStyleMetaActions">
                        <button type="button" className="nb-ssGhost" onClick={() => editCustom(style.id)}>
                          <Pencil className="nb-ssIcon" aria-hidden={true} />
                          Modifica
                        </button>
                        <button type="button" className="nb-ssGhost" onClick={() => exportCustom(style.id)}>
                          <Download className="nb-ssIcon" aria-hidden={true} />
                          Esporta
                        </button>
                        <button type="button" className="nb-ssGhost" onClick={() => deleteCustom(style.id)}>
                          <Trash2 className="nb-ssIcon" aria-hidden={true} />
                          Elimina
                        </button>
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </article>

          <article className="nb-ssCard">
            <div className="nb-ssCardTop">
              <h3 className="nb-ssCardTitle">Crea il tuo stile</h3>
              <span className="nb-ssProBadge">PRO</span>
            </div>
            <div className="nb-ssCustomGrid">
              {(
                [
                  ["primary", "Colore principale"],
                  ["secondary", "Colore secondario"],
                  ["sidebar", "Sidebar"],
                  ["header", "Header"],
                  ["button", "Bottoni"],
                  ["card", "Card"],
                  ["chart", "Grafici"],
                  ["success", "Successo"],
                  ["error", "Errore"]
                ] as const
              ).map(([key, label]) => (
                <label key={key} className="nb-ssColorField">
                  <span>{label}</span>
                  <input
                    type="color"
                    value={custom[key]}
                    onChange={(e) => {
                      setUseCustomDraft(true);
                      setCustom((c) => ({ ...c, [key]: e.target.value }));
                    }}
                  />
                  <code>{custom[key]}</code>
                </label>
              ))}
            </div>
            <button type="button" className="nb-ssSaveBtn" onClick={saveCustom}>
              {savedFlash
                ? "Studio Style salvato · demo"
                : editingCustomId
                  ? "Aggiorna Studio Style"
                  : "Salva Studio Style"}
            </button>
          </article>

          <article className="nb-ssCard">
            <h3 className="nb-ssCardTitle">Tema</h3>
            <div className="nb-ssRadioRow" role="radiogroup" aria-label="Tema">
              {(
                [
                  { id: "chiaro", label: "Chiaro", icon: Sun },
                  { id: "scuro", label: "Scuro", icon: Moon },
                  { id: "automatico", label: "Automatico", icon: Monitor }
                ] as const
              ).map((opt) => {
                const Icon = opt.icon;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    role="radio"
                    aria-checked={theme === opt.id}
                    className={clsx("nb-ssRadio", theme === opt.id && "isOn")}
                    onClick={() => {
                      setTheme(opt.id);
                      const dark =
                        opt.id === "scuro"
                          ? true
                          : opt.id === "chiaro"
                            ? false
                            : Boolean(activeStyle.dark);
                      pushTheme(styleId, { ...palette, dark });
                    }}
                  >
                    <Icon className="nb-ssIcon" aria-hidden={true} />
                    {opt.label}
                  </button>
                );
              })}
            </div>
            <div
              className={clsx(
                "nb-ssThemePreview",
                theme === "scuro" && "isDark",
                theme === "automatico" && "isAuto"
              )}
              style={{ ["--ss-accent" as string]: palette.primary }}
            />
          </article>

          <article className="nb-ssCard">
            <h3 className="nb-ssCardTitle">Layout</h3>
            <div className="nb-ssRadioRow" role="radiogroup" aria-label="Layout">
              {(
                [
                  { id: "compatto", label: "Compatto" },
                  { id: "standard", label: "Standard" },
                  { id: "confortevole", label: "Confortevole" }
                ] as const
              ).map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  role="radio"
                  aria-checked={density === opt.id}
                  className={clsx("nb-ssRadio", density === opt.id && "isOn")}
                  onClick={() => setDensity(opt.id)}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            <div className={clsx("nb-ssDensityPreview", `is-${density}`)}>
              <span />
              <span />
              <span />
            </div>
          </article>

          <article className="nb-ssCard">
            <h3 className="nb-ssCardTitle">Animazioni</h3>
            <div className="nb-ssSwitchList">
              <SwitchRow
                label="Micro animazioni"
                on={micro && !reduceMotion}
                disabled={reduceMotion}
                onToggle={() => setMicro((v) => !v)}
              />
              <SwitchRow
                label="Blur"
                on={blur && !reduceMotion}
                disabled={reduceMotion}
                onToggle={() => setBlur((v) => !v)}
              />
              <SwitchRow
                label="Effetti"
                on={effects && !reduceMotion}
                disabled={reduceMotion}
                onToggle={() => setEffects((v) => !v)}
              />
              <SwitchRow
                label="Riduci movimento"
                on={reduceMotion}
                onToggle={() => setReduceMotion((v) => !v)}
              />
            </div>
          </article>

          <article className="nb-ssCard">
            <h3 className="nb-ssCardTitle">Login Brand</h3>
            <label className="nb-ssField">
              <span>Messaggio di benvenuto</span>
              <input value={welcome} onChange={(e) => setWelcome(e.target.value)} />
            </label>
            <div className="nb-ssActions">
              <button
                type="button"
                className="nb-ssGhost"
                onClick={() => loginLogoInputRef.current?.click()}
              >
                <Upload className="nb-ssIcon" aria-hidden={true} />
                Logo
              </button>
              <button
                type="button"
                className="nb-ssGhost"
                onClick={() => loginBgInputRef.current?.click()}
              >
                <ImageIcon className="nb-ssIcon" aria-hidden={true} />
                Sfondo
              </button>
            </div>
            <div
              className="nb-ssLoginPreview"
              style={
                loginBgUrl
                  ? {
                      backgroundImage: `linear-gradient(160deg, rgba(26,20,23,0.55), rgba(26,20,23,0.35)), url(${loginBgUrl})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center"
                    }
                  : {
                      background: `radial-gradient(500px 180px at 20% 0%, ${palette.primary}55, transparent 55%), linear-gradient(160deg, ${palette.dark ? "#1c1719" : "#2a2226"} 0%, ${palette.secondary} 140%)`
                    }
              }
            >
              <div className="nb-ssLoginCard">
                <div
                  className="nb-ssLoginLogo"
                  style={{
                    background: loginLogoUrl ? undefined : palette.primary,
                    overflow: "hidden"
                  }}
                >
                  {loginLogoUrl ? (
                    <img className="nb-ssLoginLogoImg" src={loginLogoUrl} alt="" />
                  ) : studioLogoUrl ? (
                    <img className="nb-ssLoginLogoImg" src={studioLogoUrl} alt="" />
                  ) : (
                    initials(studioName)
                  )}
                </div>
                <div className="nb-ssLoginWelcome">{welcome}</div>
                <span />
                <span />
                <i style={{ background: palette.button }} />
              </div>
            </div>
          </article>

          <article className="nb-ssCard nb-ssEco">
            <div className="nb-ssCardTop">
              <h3 className="nb-ssCardTitle">Sincronizzazione Stile</h3>
              <span className="nb-ssProBadge">PRO</span>
            </div>
            <p className="nb-ssEcoText">
              Con Nova PRO il tuo Studio Style verrà applicato automaticamente a tutte le
              applicazioni dell&apos;Ecosistema Nova.
            </p>
            <div className="nb-ssEcoApps">
              {ECOSYSTEM_APPS.map((app) => (
                <span key={app}>{app}</span>
              ))}
            </div>
            <button type="button" className="nb-ssEcoBtn" onClick={onSyncEcosystem} disabled={syncing}>
              <Orbit className="nb-ssIcon" aria-hidden={true} />
              Sincronizza Ecosistema
            </button>
          </article>
        </div>

        <aside className="nb-ssLiveWrap">{livePreview()}</aside>
      </div>

      {nameDialogOpen ? (
        <div className="nb-dialogRoot isOpen" role="presentation">
          <button
            type="button"
            className="nb-dialogBackdrop"
            aria-label="Chiudi"
            onClick={() => setNameDialogOpen(false)}
          />
          <div className="nb-dialogCard" role="dialog" aria-labelledby="ss-name-title">
            <h3 id="ss-name-title" className="nb-dialogTitle">
              Modifica Nome
            </h3>
            <p className="nb-dialogSub">Aggiorna nome studio e slogan (demo locale).</p>
            <label className="nb-ssField">
              <span>Nome studio</span>
              <input value={draftName} onChange={(e) => setDraftName(e.target.value)} autoFocus />
            </label>
            <label className="nb-ssField">
              <span>Slogan</span>
              <input value={draftSlogan} onChange={(e) => setDraftSlogan(e.target.value)} />
            </label>
            <div className="nb-dialogActions">
              <button type="button" className="nb-ssGhost" onClick={() => setNameDialogOpen(false)}>
                Annulla
              </button>
              <button type="button" className="nb-ssSaveBtn" onClick={saveNameDialog}>
                Salva
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {fullscreenPreview ? (
        <div className="nb-ssFullscreen" role="dialog" aria-label="Anteprima stile">
          <button
            type="button"
            className="nb-dialogBackdrop"
            aria-label="Chiudi anteprima"
            onClick={() => setFullscreenPreview(false)}
          />
          <div className="nb-ssFullscreenInner">{livePreview("isFullscreen", true)}</div>
          <button
            type="button"
            className="nb-ssFullscreenClose"
            onClick={() => setFullscreenPreview(false)}
          >
            Chiudi
          </button>
        </div>
      ) : null}

      {syncOpen ? (
        <div className="nb-dialogRoot isOpen" role="presentation">
          <button type="button" className="nb-dialogBackdrop" aria-label="Chiudi" disabled={syncing} />
          <div className="nb-dialogCard" role="dialog" aria-labelledby="ss-sync-title">
            <h3 id="ss-sync-title" className="nb-dialogTitle">
              Sincronizzazione Ecosistema
            </h3>
            <p className="nb-dialogSub">
              Distribuzione Studio Style a NovaBeauty, NovaDocs e NovaPromo…
            </p>
            <div className="nb-ssSyncTrack" aria-hidden={true}>
              <div className="nb-ssSyncFill" style={{ width: `${syncProgress}%` }} />
            </div>
            <p className="nb-ssSyncPct">{syncProgress}%</p>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function StyleMiniPreview({ style }: { style: StudioStyle }) {
  return (
    <div
      className={clsx("nb-ssMini", style.dark && "isDark")}
      style={
        {
          ["--ss-primary" as string]: style.primary,
          ["--ss-secondary" as string]: style.secondary,
          ["--ss-sidebar" as string]: style.sidebar,
          ["--ss-surface" as string]: style.surface,
          ["--ss-button" as string]: style.button
        } as CSSProperties
      }
      aria-hidden={true}
    >
      <div className="nb-ssMiniSide" />
      <div className="nb-ssMiniMain">
        <i />
        <b />
        <b className="soft" />
      </div>
    </div>
  );
}

function SwitchRow({
  label,
  on,
  onToggle,
  disabled
}: {
  label: string;
  on: boolean;
  onToggle: () => void;
  disabled?: boolean;
}) {
  return (
    <label className={clsx("nb-ssSwitchRow", disabled && "isDisabled")}>
      <span>{label}</span>
      <button
        type="button"
        className={clsx("nb-ssToggle", on && "isOn")}
        aria-pressed={on}
        disabled={disabled}
        onClick={onToggle}
      >
        <span className="nb-ssToggleKnob" />
        <span className="nb-ssToggleLabel">{on ? "ON" : "OFF"}</span>
      </button>
    </label>
  );
}

function initials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}
