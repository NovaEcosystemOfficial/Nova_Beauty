import {
  ArrowLeft,
  Brain,
  CalendarDays,
  Check,
  Cloud,
  CreditCard,
  Download,
  ExternalLink,
  FileText,
  Gift,
  HardDrive,
  Heart,
  History,
  Laptop,
  Mail,
  Megaphone,
  MessageSquare,
  Package,
  Plug,
  QrCode,
  RefreshCw,
  Rocket,
  Search,
  Send,
  ShoppingBag,
  Smartphone,
  Sparkles,
  Store,
  Trash2,
  Wifi,
  WifiOff
} from "lucide-react";
import clsx from "clsx";
import { useMemo, useState, type ComponentType, type ReactNode } from "react";
import { useDemoWorkflow } from "../demo/DemoWorkflowContext";

type AtlasMode = "locale" | "cloud" | "auto";
type IgView =
  | "home"
  | "atlas-config"
  | "atlas-chat"
  | "atlas-models"
  | "cloud"
  | "staff-devices"
  | "marketplace"
  | "module-detail"
  | "logs";

type MarketplaceMod = {
  id: string;
  name: string;
  description: string;
  category: string;
  version: string;
  installed: boolean;
  featured?: "novita" | "popolari" | "consigliati" | "aggiornamenti";
  icon: ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
};

type StaffDevice = {
  id: string;
  name: string;
  status: "online" | "offline";
  device: string;
  version?: string;
  sync: string;
  tone: "mint" | "gold" | "lavender";
};

type AiModel = {
  id: string;
  name: string;
  size: string;
  status: "installato" | "disponibile" | "aggiornamento";
};

type EcoLog = {
  id: string;
  time: string;
  date: string;
  text: string;
  type: "sistema" | "sync" | "security" | "backup" | "staff";
  user: string;
  tone: "lavender" | "gold" | "mint" | "rose" | "slate";
};

const MARKETPLACE_SEED: MarketplaceMod[] = [
  {
    id: "wa",
    name: "WhatsApp Business",
    description: "Messaggi e reminder clienti.",
    category: "Comunicazione",
    version: "2.1.0",
    installed: false,
    featured: "popolari",
    icon: MessageSquare
  },
  {
    id: "gcal",
    name: "Google Calendar",
    description: "Sync agenda bidirezionale.",
    category: "Produttività",
    version: "1.8.2",
    installed: false,
    featured: "consigliati",
    icon: CalendarDays
  },
  {
    id: "stripe",
    name: "Stripe",
    description: "Pagamenti online e abbonamenti.",
    category: "Pagamenti",
    version: "3.0.1",
    installed: false,
    featured: "popolari",
    icon: CreditCard
  },
  {
    id: "sumup",
    name: "SumUp",
    description: "POS e pagamenti in studio.",
    category: "Pagamenti",
    version: "1.4.0",
    installed: false,
    icon: CreditCard
  },
  {
    id: "gift",
    name: "Gift Card",
    description: "Buoni regalo digitali.",
    category: "Vendite",
    version: "1.2.0",
    installed: false,
    featured: "novita",
    icon: Gift
  },
  {
    id: "fid",
    name: "Fidelity",
    description: "Punti e premi fedeltà.",
    category: "Vendite",
    version: "2.0.4",
    installed: true,
    icon: Heart
  },
  {
    id: "sms",
    name: "SMS",
    description: "Promemoria via SMS.",
    category: "Comunicazione",
    version: "1.1.0",
    installed: false,
    featured: "consigliati",
    icon: MessageSquare
  },
  {
    id: "email",
    name: "Email Marketing",
    description: "Newsletter e campagne.",
    category: "Marketing",
    version: "1.6.3",
    installed: false,
    featured: "aggiornamenti",
    icon: Mail
  },
  {
    id: "mai",
    name: "Marketing AI",
    description: "Contenuti e creatività AI.",
    category: "Marketing",
    version: "0.9.1",
    installed: false,
    featured: "novita",
    icon: Sparkles
  },
  {
    id: "cont",
    name: "Contabilità",
    description: "Esportazioni e registri.",
    category: "Amministrazione",
    version: "1.0.0",
    installed: false,
    icon: FileText
  },
  {
    id: "cassa",
    name: "Cassa",
    description: "Chiusure e scontrini.",
    category: "Amministrazione",
    version: "2.3.1",
    installed: true,
    icon: ShoppingBag
  },
  {
    id: "mag",
    name: "Magazzino PRO",
    description: "Scorta avanzata e ordini.",
    category: "Operatività",
    version: "1.5.0",
    installed: false,
    featured: "aggiornamenti",
    icon: Package
  }
];

const STAFF_SEED: StaffDevice[] = [
  {
    id: "d1",
    name: "Laura",
    status: "online",
    device: "iPhone 15 · iOS 18",
    version: "Staff 1.4.2",
    sync: "2 min fa",
    tone: "mint"
  },
  {
    id: "d2",
    name: "Giulia",
    status: "online",
    device: "Pixel 8 · Android 15",
    version: "Staff 1.4.1",
    sync: "8 min fa",
    tone: "lavender"
  },
  {
    id: "d3",
    name: "Marco",
    status: "offline",
    device: "Samsung A54 · Android 14",
    version: "Staff 1.3.9",
    sync: "2 ore fa",
    tone: "gold"
  },
  {
    id: "d4",
    name: "Reception iPad",
    status: "online",
    device: "iPad Air · iPadOS 18",
    version: "Staff 1.4.2",
    sync: "1 min fa",
    tone: "mint"
  }
];

const AI_MODELS: AiModel[] = [
  { id: "qwen", name: "Qwen 2.5", size: "4.2 GB", status: "installato" },
  { id: "llama", name: "Llama 3.2", size: "3.8 GB", status: "disponibile" },
  { id: "mistral", name: "Mistral 7B", size: "4.1 GB", status: "aggiornamento" },
  { id: "gemma", name: "Gemma 2", size: "2.9 GB", status: "disponibile" },
  { id: "phi", name: "Phi-3 Mini", size: "2.1 GB", status: "disponibile" }
];

const HEALTH = [
  { name: "Atlas", ok: true },
  { name: "NovaPromo", ok: true },
  { name: "NovaCloud", ok: true },
  { name: "NovaDocs", ok: true },
  { name: "NovaBeauty Staff", ok: true }
];

const LOGS_SEED: EcoLog[] = [
  {
    id: "l1",
    time: "20:12",
    date: "2026-08-05",
    text: "Atlas aggiornato · Qwen 2.5",
    type: "sistema",
    user: "Sistema",
    tone: "lavender"
  },
  {
    id: "l2",
    time: "19:42",
    date: "2026-08-05",
    text: "NovaPromo sincronizzato",
    type: "sync",
    user: "Fabio",
    tone: "gold"
  },
  {
    id: "l3",
    time: "18:56",
    date: "2026-08-05",
    text: "Nuovo dispositivo Staff · Laura",
    type: "staff",
    user: "Laura",
    tone: "mint"
  },
  {
    id: "l4",
    time: "18:11",
    date: "2026-08-05",
    text: "Backup Cloud completato",
    type: "backup",
    user: "NovaCloud",
    tone: "rose"
  },
  {
    id: "l5",
    time: "17:38",
    date: "2026-08-05",
    text: "NovaDocs collegato",
    type: "sync",
    user: "Sistema",
    tone: "slate"
  },
  {
    id: "l6",
    time: "16:05",
    date: "2026-08-05",
    text: "Accesso Staff revocato · dispositivo demo",
    type: "security",
    user: "Fabio",
    tone: "rose"
  },
  {
    id: "l7",
    time: "14:22",
    date: "2026-08-04",
    text: "Modulo Fidelity aggiornato a 2.0.4",
    type: "sistema",
    user: "Marketplace",
    tone: "lavender"
  },
  {
    id: "l8",
    time: "09:10",
    date: "2026-08-04",
    text: "Sincronizzazione cartelle Cloud",
    type: "sync",
    user: "NovaCloud",
    tone: "mint"
  }
];

const EXPAND = ["Atlas Cloud", "NovaPromo PRO", "Gift Card", "Google Calendar", "Marketplace"];

const NOVAPROMO_URL = "https://novapromo.vercel.app/";
const NOVADOCS_URL =
  "https://apps.microsoft.com/detail/9P1G6TZGVSJM?hl=it-it&gl=IT&ocid=pdpshare";
const INVITE_LINK = "https://staff.novabeauty.app/invite/demo-NB-8842";

const MARKET_CATEGORIES = [
  "Tutte",
  "Comunicazione",
  "Pagamenti",
  "Marketing",
  "Vendite",
  "Produttività",
  "Amministrazione",
  "Operatività"
];

export default function IntegrationsCenter() {
  const { pushToast } = useDemoWorkflow();
  const [view, setView] = useState<IgView>("home");
  const [atlasMode, setAtlasMode] = useState<AtlasMode>("auto");
  const [checking, setChecking] = useState(false);
  const [lastCheck, setLastCheck] = useState("Adesso");
  const [mods, setMods] = useState(MARKETPLACE_SEED);
  const [staff, setStaff] = useState(STAFF_SEED);
  const [models, setModels] = useState(AI_MODELS);
  const [logs, setLogs] = useState(LOGS_SEED);
  const [activeModuleId, setActiveModuleId] = useState<string | null>(null);

  const [atlasProvider, setAtlasProvider] = useState("Ollama");
  const [atlasApiKey, setAtlasApiKey] = useState("");
  const [atlasModel, setAtlasModel] = useState("qwen2.5");
  const [atlasTemp, setAtlasTemp] = useState(0.7);
  const [atlasAuto, setAtlasAuto] = useState(true);

  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState<
    { id: string; role: "user" | "atlas"; text: string }[]
  >([
    {
      id: "m0",
      role: "atlas",
      text: "Ciao, sono Atlas. Dimmi pure: posso aiutarti con agenda, clienti o suggerimenti per lo studio."
    }
  ]);

  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [revokeOpen, setRevokeOpen] = useState(false);
  const [revokeIds, setRevokeIds] = useState<string[]>([]);

  const [marketQuery, setMarketQuery] = useState("");
  const [marketCat, setMarketCat] = useState("Tutte");
  const [marketTab, setMarketTab] = useState<
    "tutti" | "novita" | "popolari" | "consigliati" | "aggiornamenti"
  >("tutti");

  const [logQuery, setLogQuery] = useState("");
  const [logType, setLogType] = useState<string>("tutti");
  const [logUser, setLogUser] = useState<string>("tutti");
  const [logDate, setLogDate] = useState<string>("tutti");

  const online = staff.filter((s) => s.status === "online").length;
  const offline = staff.length - online;
  const activeModule = mods.find((m) => m.id === activeModuleId) ?? null;

  const verify = () => {
    if (checking) return;
    setChecking(true);
    window.setTimeout(() => {
      setChecking(false);
      setLastCheck("Adesso");
      pushToast("Connessioni verificate · ecosistema operativo.");
    }, 1400);
  };

  const installMod = (id: string) => {
    setMods((prev) => prev.map((m) => (m.id === id ? { ...m, installed: true } : m)));
    const mod = mods.find((m) => m.id === id);
    pushToast(`${mod?.name ?? "Modulo"} installato.`);
  };

  const openMod = (id: string) => {
    setActiveModuleId(id);
    setView("module-detail");
  };

  const sendChat = () => {
    const text = chatInput.trim();
    if (!text) return;
    const userMsg = { id: `u-${Date.now()}`, role: "user" as const, text };
    setChatMessages((prev) => [...prev, userMsg]);
    setChatInput("");
    window.setTimeout(() => {
      setChatMessages((prev) => [
        ...prev,
        {
          id: `a-${Date.now()}`,
          role: "atlas",
          text: `Demo Atlas · ho ricevuto: «${text}». In produzione risponderò con il modello configurato (${atlasModel}).`
        }
      ]);
    }, 600);
  };

  const filteredMarket = useMemo(() => {
    return mods.filter((m) => {
      if (marketCat !== "Tutte" && m.category !== marketCat) return false;
      if (marketTab !== "tutti" && m.featured !== marketTab) return false;
      if (marketQuery.trim()) {
        const q = marketQuery.toLowerCase();
        if (
          !m.name.toLowerCase().includes(q) &&
          !m.description.toLowerCase().includes(q) &&
          !m.category.toLowerCase().includes(q)
        ) {
          return false;
        }
      }
      return true;
    });
  }, [mods, marketCat, marketTab, marketQuery]);

  const filteredLogs = useMemo(() => {
    return logs.filter((l) => {
      if (logType !== "tutti" && l.type !== logType) return false;
      if (logUser !== "tutti" && l.user !== logUser) return false;
      if (logDate !== "tutti" && l.date !== logDate) return false;
      if (logQuery.trim()) {
        const q = logQuery.toLowerCase();
        if (!l.text.toLowerCase().includes(q) && !l.user.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [logs, logType, logUser, logDate, logQuery]);

  const logUsers = useMemo(
    () => ["tutti", ...Array.from(new Set(logs.map((l) => l.user)))],
    [logs]
  );
  const logDates = useMemo(
    () => ["tutti", ...Array.from(new Set(logs.map((l) => l.date)))],
    [logs]
  );

  if (view !== "home") {
    return (
      <div className="nb-ig" role="region" aria-label="Integrazioni">
        {view === "atlas-config" ? (
          <AtlasConfigPage
            mode={atlasMode}
            setMode={setAtlasMode}
            provider={atlasProvider}
            setProvider={setAtlasProvider}
            apiKey={atlasApiKey}
            setApiKey={setAtlasApiKey}
            model={atlasModel}
            setModel={setAtlasModel}
            temp={atlasTemp}
            setTemp={setAtlasTemp}
            auto={atlasAuto}
            setAuto={setAtlasAuto}
            onBack={() => setView("home")}
            onSave={() => {
              pushToast("Impostazioni Atlas salvate.");
              setView("home");
            }}
          />
        ) : null}
        {view === "atlas-chat" ? (
          <AtlasChatPage
            messages={chatMessages}
            input={chatInput}
            setInput={setChatInput}
            onSend={sendChat}
            onBack={() => setView("home")}
          />
        ) : null}
        {view === "atlas-models" ? (
          <AtlasModelsPage
            models={models}
            onBack={() => setView("home")}
            onAction={(id, action) => {
              setModels((prev) =>
                prev.map((m) => {
                  if (m.id !== id) return m;
                  if (action === "install") return { ...m, status: "installato" };
                  if (action === "update") return { ...m, status: "installato" };
                  return m;
                })
              );
              pushToast(
                action === "install" ? "Modello installato." : "Modello aggiornato."
              );
            }}
          />
        ) : null}
        {view === "cloud" ? (
          <CloudPage
            onBack={() => setView("home")}
            onToast={pushToast}
          />
        ) : null}
        {view === "staff-devices" ? (
          <StaffDevicesPage
            devices={staff}
            onBack={() => setView("home")}
            onInvite={() => setInviteOpen(true)}
            onRevoke={() => {
              setRevokeIds([]);
              setRevokeOpen(true);
            }}
          />
        ) : null}
        {view === "marketplace" ? (
          <MarketplacePage
            mods={filteredMarket}
            query={marketQuery}
            setQuery={setMarketQuery}
            category={marketCat}
            setCategory={setMarketCat}
            tab={marketTab}
            setTab={setMarketTab}
            onBack={() => setView("home")}
            onInstall={installMod}
            onOpen={openMod}
          />
        ) : null}
        {view === "module-detail" && activeModule ? (
          <ModuleDetailPage
            mod={activeModule}
            onBack={() => setView("marketplace")}
            onInstall={() => installMod(activeModule.id)}
          />
        ) : null}
        {view === "logs" ? (
          <LogsPage
            logs={filteredLogs}
            query={logQuery}
            setQuery={setLogQuery}
            type={logType}
            setType={setLogType}
            user={logUser}
            setUser={setLogUser}
            date={logDate}
            setDate={setLogDate}
            users={logUsers}
            dates={logDates}
            onBack={() => setView("home")}
            onExport={() => pushToast("Log esportato · EcoLog_demo.csv")}
            onClear={() => {
              setLogs([]);
              pushToast("Log cancellati.");
            }}
          />
        ) : null}

        {inviteOpen ? (
          <InviteDialog
            email={inviteEmail}
            setEmail={setInviteEmail}
            onClose={() => setInviteOpen(false)}
            onSend={() => {
              pushToast(
                inviteEmail.trim()
                  ? `Invito inviato a ${inviteEmail.trim()}`
                  : "Link invito copiato · demo"
              );
              setInviteOpen(false);
              setInviteEmail("");
            }}
          />
        ) : null}
        {revokeOpen ? (
          <RevokeDialog
            devices={staff}
            selected={revokeIds}
            setSelected={setRevokeIds}
            onClose={() => setRevokeOpen(false)}
            onConfirm={() => {
              if (!revokeIds.length) {
                pushToast("Seleziona almeno un dispositivo.");
                return;
              }
              setStaff((prev) => prev.filter((d) => !revokeIds.includes(d.id)));
              pushToast(`Accesso revocato · ${revokeIds.length} dispositivi`);
              setRevokeOpen(false);
              setRevokeIds([]);
            }}
          />
        ) : null}
      </div>
    );
  }

  return (
    <div className="nb-ig" role="region" aria-label="Integrazioni Ecosistema Nova">
      <header className="nb-igHead">
        <div className="nb-igHeadIcon" aria-hidden={true}>
          <Plug />
        </div>
        <div>
          <h2 className="nb-igTitle">Integrazioni</h2>
          <p className="nb-igSub">
            Collega e gestisci tutti i servizi dell&apos;Ecosistema Nova.
          </p>
        </div>
      </header>

      <article className={clsx("nb-igStatus", checking && "isChecking")}>
        <div className="nb-igStatusMain">
          <span className="nb-igStatusPill">
            <span className="nb-igDot" aria-hidden={true} />
            Ecosistema operativo
          </span>
          <div className="nb-igStatusMeta">
            <span>
              <strong>5</strong> servizi collegati
            </span>
            <span>
              Ultima verifica · <strong>{lastCheck}</strong>
            </span>
          </div>
        </div>
        <button
          type="button"
          className={clsx("nb-igPrimaryBtn", checking && "isBusy")}
          onClick={verify}
          disabled={checking}
        >
          <RefreshCw className={clsx("nb-igBtnIcon", checking && "isSpin")} aria-hidden={true} />
          {checking ? "Verifica in corso…" : "Verifica connessioni"}
        </button>
      </article>

      <div className="nb-igGrid">
        <article className="nb-igCard nb-igAtlas">
          <CardHead
            icon={Brain}
            title="Atlas AI"
            description="Assistente intelligente del tuo centro."
            badge="Operativo"
            badgeTone="ok"
          />
          <div className="nb-igFacts">
            <Fact label="Stato" value="Operativo" ok />
            <Fact label="Modello installato" value="Qwen" />
            <Fact label="Ultimo aggiornamento" value="Oggi · 07:40" />
            <Fact label="Tempo risposta" value="~180 ms · demo" />
          </div>
          <div className="nb-igModeRow" role="radiogroup" aria-label="Modalità Atlas">
            {(
              [
                { id: "locale", label: "Locale (Qwen)" },
                { id: "cloud", label: "Cloud (OpenAI)" },
                { id: "auto", label: "Automatica" }
              ] as const
            ).map((m) => (
              <button
                key={m.id}
                type="button"
                role="radio"
                aria-checked={atlasMode === m.id}
                className={clsx("nb-igMode", atlasMode === m.id && "isOn")}
                onClick={() => setAtlasMode(m.id)}
              >
                {m.label}
              </button>
            ))}
          </div>
          <div className="nb-igActions">
            <button type="button" className="nb-igGhost" onClick={() => setView("atlas-config")}>
              Configura
            </button>
            <button type="button" className="nb-igGhost" onClick={() => setView("atlas-chat")}>
              Test Assistente
            </button>
            <button type="button" className="nb-igGhost" onClick={() => setView("atlas-models")}>
              Scarica Modelli
            </button>
          </div>
        </article>

        <article className="nb-igCard">
          <CardHead
            icon={Megaphone}
            title="NovaPromo"
            description="Marketing intelligente per il tuo centro."
            badge="PRO"
            badgeTone="pro"
          />
          <div className="nb-igChips">
            {["Instagram", "Facebook", "TikTok", "Banner AI", "Campagne"].map((c) => (
              <span key={c}>{c}</span>
            ))}
          </div>
          <div className="nb-igFacts">
            <Fact label="Piano" value="PRO" />
            <Fact label="Ultima campagna" value="Spring Glow · 28 lug" />
            <Fact label="Clienti raggiunti" value="1.842 · demo" />
          </div>
          <p className="nb-igNote">Il piano PRO è condiviso automaticamente con NovaBeauty.</p>
          <button
            type="button"
            className="nb-igPrimaryBtn isLive"
            onClick={() => window.open(NOVAPROMO_URL, "_blank", "noopener,noreferrer")}
          >
            Apri NovaPromo
            <ExternalLink className="nb-igBtnIcon" aria-hidden={true} />
          </button>
        </article>

        <article className="nb-igCard">
          <CardHead
            icon={Cloud}
            title="NovaCloud"
            description="Storage, backup e sincronizzazione."
            badge="Sincronizzato"
            badgeTone="ok"
          />
          <div className="nb-igFacts">
            <Fact label="Storage" value="1,2 GB / 10 GB" />
            <Fact label="Backup" value="Attivo · giornaliero" />
            <Fact label="Ultima sincronizzazione" value="2 min fa" />
            <Fact label="Condivisioni" value="3 cartelle" />
          </div>
          <div className="nb-igSpace" aria-label="Spazio utilizzato">
            <div className="nb-igSpaceBar">
              <span style={{ width: "12%" }} />
            </div>
            <div className="nb-igSpaceMeta">
              <span>Cronologia backup disponibile</span>
              <span>12%</span>
            </div>
          </div>
          <button type="button" className="nb-igGhost" onClick={() => setView("cloud")}>
            <HardDrive className="nb-igBtnIcon" aria-hidden={true} />
            Gestisci Cloud
          </button>
        </article>

        <article className="nb-igCard">
          <CardHead
            icon={FileText}
            title="NovaDocs"
            description="Documenti, consensi e privacy."
            badge="Disponibile"
            badgeTone="avail"
          />
          <div className="nb-igChips">
            {[
              "Consensi informati",
              "Contratti",
              "Privacy GDPR",
              "PDF",
              "Firma digitale",
              "Documenti collegati"
            ].map((c) => (
              <span key={c}>{c}</span>
            ))}
          </div>
          <button
            type="button"
            className="nb-igPrimaryBtn isLive"
            onClick={() => window.open(NOVADOCS_URL, "_blank", "noopener,noreferrer")}
          >
            Apri NovaDocs
            <ExternalLink className="nb-igBtnIcon" aria-hidden={true} />
          </button>
        </article>

        <article className="nb-igCard nb-igStaffCard">
          <CardHead
            icon={Smartphone}
            title="NovaBeauty Staff"
            description="Dispositivi autorizzati del personale."
            badge={`${online} online`}
            badgeTone="ok"
          />
          <div className="nb-igStaffGrid">
            {staff.slice(0, 3).map((s) => (
              <div key={s.id} className={clsx("nb-igStaffPerson", `tone-${s.tone}`)}>
                <div className="nb-igStaffTop">
                  <strong>{s.name}</strong>
                  <span className={clsx("nb-igStaffStatus", `is-${s.status}`)}>
                    {s.status === "online" ? (
                      <Wifi className="nb-igTinyIcon" aria-hidden={true} />
                    ) : (
                      <WifiOff className="nb-igTinyIcon" aria-hidden={true} />
                    )}
                    {s.status === "online" ? "Online" : "Offline"}
                  </span>
                </div>
                <div className="nb-igStaffMeta">
                  <span>{s.device}</span>
                  {s.version ? <span>{s.version}</span> : null}
                  <span>
                    {s.status === "online" ? "Sync" : "Ultimo accesso"} · {s.sync}
                  </span>
                </div>
              </div>
            ))}
          </div>
          <div className="nb-igStaffStats">
            <span>
              <strong>{staff.length}</strong> dispositivi
            </span>
            <span>
              <strong>{online}</strong> online
            </span>
            <span>
              <strong>{offline}</strong> offline
            </span>
          </div>
          <div className="nb-igActions">
            <button type="button" className="nb-igGhost" onClick={() => setView("staff-devices")}>
              Gestisci dispositivi
            </button>
            <button type="button" className="nb-igGhost" onClick={() => setInviteOpen(true)}>
              Invita operatore
            </button>
            <button
              type="button"
              className="nb-igGhost danger"
              onClick={() => {
                setRevokeIds([]);
                setRevokeOpen(true);
              }}
            >
              Revoca accesso
            </button>
          </div>
        </article>

        <article className="nb-igCard nb-igMarketCard">
          <CardHead
            icon={Store}
            title="Marketplace"
            description="Espandi NovaBeauty installando nuovi moduli."
            badge="Store Nova"
            badgeTone="avail"
          />
          <div className="nb-igMarketGrid">
            {mods.map((mod) => {
              const Icon = mod.icon;
              return (
                <div key={mod.id} className="nb-igMarketItem">
                  <span className="nb-igMarketIcon">
                    <Icon aria-hidden={true} />
                  </span>
                  <div className="nb-igMarketBody">
                    <div className="nb-igMarketName">
                      {mod.name}
                      <span
                        className={clsx(
                          "nb-igModBadge",
                          mod.installed ? "is-installato" : "is-pro"
                        )}
                      >
                        {mod.installed ? "Installato" : mod.category}
                      </span>
                    </div>
                    <p>{mod.description}</p>
                    <span className="nb-igMarketMeta">
                      v{mod.version} · {mod.category}
                    </span>
                  </div>
                  <button
                    type="button"
                    className={clsx("nb-igInstall", mod.installed && "isDone")}
                    onClick={() => (mod.installed ? openMod(mod.id) : installMod(mod.id))}
                  >
                    {mod.installed ? (
                      <>
                        <Check className="nb-igBtnIcon" aria-hidden={true} />
                        Apri
                      </>
                    ) : (
                      "Installa"
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </article>

        <article className="nb-igExpand">
          <div className="nb-igExpandIcon" aria-hidden={true}>
            <Rocket />
          </div>
          <div>
            <h3 className="nb-igExpandTitle">Espandi il tuo Ecosistema Nova</h3>
            <p className="nb-igExpandText">
              Aggiungi nuovi strumenti per far crescere il tuo centro.
            </p>
            <div className="nb-igChips light">
              {EXPAND.map((e) => (
                <span key={e}>{e}</span>
              ))}
            </div>
          </div>
          <button
            type="button"
            className="nb-igPrimaryBtn isLive"
            onClick={() => setView("marketplace")}
          >
            <Store className="nb-igBtnIcon" aria-hidden={true} />
            Esplora Marketplace
          </button>
        </article>

        <article className="nb-igCard nb-igHealth">
          <CardHead
            icon={Heart}
            title="Salute Ecosistema"
            description="Stato generale dei servizi collegati."
            badge="100%"
            badgeTone="ok"
          />
          <ul className="nb-igHealthList">
            {HEALTH.map((h) => (
              <li key={h.name}>
                <span className="nb-igDot" aria-hidden={true} />
                {h.name}
              </li>
            ))}
          </ul>
          <div className="nb-igHealthBar" aria-hidden={true}>
            <span style={{ width: "100%" }} />
          </div>
          <p className="nb-igHealthNote">Tutti i servizi risultano operativi.</p>
          <button type="button" className="nb-igGhost" onClick={() => setView("logs")}>
            Visualizza Log
          </button>
        </article>

        <article className="nb-igCard nb-igLogCard">
          <h3 className="nb-igCardTitle">Log integrazioni</h3>
          <p className="nb-igCardDesc">Timeline eventi · anteprima</p>
          <ol className="nb-igLog">
            {logs.slice(0, 5).map((log) => (
              <li key={log.id}>
                <span className="nb-igLogTime">{log.time}</span>
                <span className={clsx("nb-igLogDot", `tone-${log.tone}`)} aria-hidden={true} />
                <span className="nb-igLogText">{log.text}</span>
              </li>
            ))}
          </ol>
          <button type="button" className="nb-igGhost" onClick={() => setView("logs")}>
            <History className="nb-igBtnIcon" aria-hidden={true} />
            Cronologia completa
          </button>
        </article>
      </div>

      {inviteOpen ? (
        <InviteDialog
          email={inviteEmail}
          setEmail={setInviteEmail}
          onClose={() => setInviteOpen(false)}
          onSend={() => {
            pushToast(
              inviteEmail.trim()
                ? `Invito inviato a ${inviteEmail.trim()}`
                : "Link invito copiato · demo"
            );
            setInviteOpen(false);
            setInviteEmail("");
          }}
        />
      ) : null}
      {revokeOpen ? (
        <RevokeDialog
          devices={staff}
          selected={revokeIds}
          setSelected={setRevokeIds}
          onClose={() => setRevokeOpen(false)}
          onConfirm={() => {
            if (!revokeIds.length) {
              pushToast("Seleziona almeno un dispositivo.");
              return;
            }
            setStaff((prev) => prev.filter((d) => !revokeIds.includes(d.id)));
            pushToast(`Accesso revocato · ${revokeIds.length} dispositivi`);
            setRevokeOpen(false);
            setRevokeIds([]);
          }}
        />
      ) : null}
    </div>
  );
}

/* ——— Sub pages ——— */

function PageShell({
  title,
  subtitle,
  onBack,
  children,
  actions
}: {
  title: string;
  subtitle?: string;
  onBack: () => void;
  children: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <div className="nb-igPage">
      <header className="nb-igPageHead">
        <button type="button" className="nb-igGhost" onClick={onBack}>
          <ArrowLeft className="nb-igBtnIcon" aria-hidden={true} />
          Indietro
        </button>
        <div className="nb-igPageHeadMain">
          <h2 className="nb-igTitle">{title}</h2>
          {subtitle ? <p className="nb-igSub">{subtitle}</p> : null}
        </div>
        {actions ? <div className="nb-igPageActions">{actions}</div> : null}
      </header>
      <div className="nb-igPageBody">{children}</div>
    </div>
  );
}

function AtlasConfigPage({
  mode,
  setMode,
  provider,
  setProvider,
  apiKey,
  setApiKey,
  model,
  setModel,
  temp,
  setTemp,
  auto,
  setAuto,
  onBack,
  onSave
}: {
  mode: AtlasMode;
  setMode: (m: AtlasMode) => void;
  provider: string;
  setProvider: (v: string) => void;
  apiKey: string;
  setApiKey: (v: string) => void;
  model: string;
  setModel: (v: string) => void;
  temp: number;
  setTemp: (v: number) => void;
  auto: boolean;
  setAuto: (v: boolean) => void;
  onBack: () => void;
  onSave: () => void;
}) {
  return (
    <PageShell
      title="Configurazione Atlas"
      subtitle="Provider, modelli e modalità dell’assistente AI"
      onBack={onBack}
      actions={
        <button type="button" className="nb-igPrimaryBtn isLive" onClick={onSave}>
          Salva impostazioni
        </button>
      }
    >
      <article className="nb-igPageCard">
        <h3 className="nb-igCardTitle">Provider AI</h3>
        <div className="nb-igModeRow" role="radiogroup" aria-label="Provider">
          {(
            [
              { id: "locale" as const, label: "Locale (Qwen)" },
              { id: "cloud" as const, label: "Cloud (OpenAI)" },
              { id: "auto" as const, label: "Modalità automatica" }
            ] as const
          ).map((m) => (
            <button
              key={m.id}
              type="button"
              role="radio"
              aria-checked={mode === m.id}
              className={clsx("nb-igMode", mode === m.id && "isOn")}
              onClick={() => {
                setMode(m.id);
                if (m.id === "locale") {
                  setProvider("Ollama");
                  setModel("qwen2.5");
                } else if (m.id === "cloud") {
                  setProvider("OpenAI");
                  setModel("gpt-4o-mini");
                }
              }}
            >
              {m.label}
            </button>
          ))}
        </div>

        <div className="nb-igFormGrid">
          <label className="nb-igField">
            <span>Provider</span>
            <select value={provider} onChange={(e) => setProvider(e.target.value)}>
              {mode === "cloud" ? (
                <>
                  <option>OpenAI</option>
                  <option>Azure OpenAI</option>
                  <option>Anthropic</option>
                </>
              ) : (
                <>
                  <option>Ollama</option>
                  <option>LM Studio</option>
                </>
              )}
            </select>
          </label>
          <label className="nb-igField">
            <span>API Key</span>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder={mode === "locale" ? "Opzionale · locale" : "sk-…"}
              disabled={mode === "locale"}
            />
          </label>
          <label className="nb-igField">
            <span>Modello</span>
            <input value={model} onChange={(e) => setModel(e.target.value)} />
          </label>
          <label className="nb-igField">
            <span>Temperatura · {temp.toFixed(1)}</span>
            <input
              type="range"
              min={0}
              max={1}
              step={0.1}
              value={temp}
              onChange={(e) => setTemp(Number(e.target.value))}
            />
          </label>
        </div>

        <label className="nb-igSwitchRow">
          <span>Modalità automatica (scegli locale/cloud in base al carico)</span>
          <button
            type="button"
            className={clsx("nb-ncToggle", auto && "isOn")}
            aria-pressed={auto}
            onClick={() => setAuto(!auto)}
          >
            <span className="nb-ncToggleKnob" />
          </button>
        </label>
      </article>
    </PageShell>
  );
}

function AtlasChatPage({
  messages,
  input,
  setInput,
  onSend,
  onBack
}: {
  messages: { id: string; role: "user" | "atlas"; text: string }[];
  input: string;
  setInput: (v: string) => void;
  onSend: () => void;
  onBack: () => void;
}) {
  return (
    <PageShell title="Test Assistente Atlas" subtitle="Chat demo · nessuna chiamata cloud reale" onBack={onBack}>
      <article className="nb-igChat">
        <div className="nb-igChatLog">
          {messages.map((m) => (
            <div key={m.id} className={clsx("nb-igChatBubble", m.role === "user" && "isUser")}>
              <strong>{m.role === "atlas" ? "Atlas" : "Tu"}</strong>
              <p>{m.text}</p>
            </div>
          ))}
        </div>
        <div className="nb-igChatComposer">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Scrivi un messaggio…"
            onKeyDown={(e) => {
              if (e.key === "Enter") onSend();
            }}
          />
          <button type="button" className="nb-igPrimaryBtn isLive" onClick={onSend}>
            <Send className="nb-igBtnIcon" aria-hidden={true} />
            Invia
          </button>
        </div>
      </article>
    </PageShell>
  );
}

function AtlasModelsPage({
  models,
  onBack,
  onAction
}: {
  models: AiModel[];
  onBack: () => void;
  onAction: (id: string, action: "install" | "update") => void;
}) {
  return (
    <PageShell title="Model Manager" subtitle="Modelli locali Atlas · gestione demo" onBack={onBack}>
      <div className="nb-igModelGrid">
        {models.map((m) => (
          <article key={m.id} className="nb-igPageCard nb-igModelCard">
            <div className="nb-igModelTop">
              <h3 className="nb-igCardTitle">{m.name}</h3>
              <span className={clsx("nb-igModBadge", `is-${m.status}`)}>
                {m.status === "installato"
                  ? "Installato"
                  : m.status === "aggiornamento"
                    ? "Aggiornamento"
                    : "Disponibile"}
              </span>
            </div>
            <p className="nb-igCardDesc">{m.size}</p>
            <div className="nb-igActions">
              {m.status === "installato" ? (
                <button type="button" className="nb-igGhost" disabled>
                  <Check className="nb-igBtnIcon" aria-hidden={true} />
                  In uso
                </button>
              ) : m.status === "aggiornamento" ? (
                <button
                  type="button"
                  className="nb-igPrimaryBtn isLive"
                  onClick={() => onAction(m.id, "update")}
                >
                  <Download className="nb-igBtnIcon" aria-hidden={true} />
                  Aggiorna
                </button>
              ) : (
                <button
                  type="button"
                  className="nb-igPrimaryBtn isLive"
                  onClick={() => onAction(m.id, "install")}
                >
                  <Download className="nb-igBtnIcon" aria-hidden={true} />
                  Installa
                </button>
              )}
            </div>
          </article>
        ))}
      </div>
    </PageShell>
  );
}

function CloudPage({ onBack, onToast }: { onBack: () => void; onToast: (m: string) => void }) {
  return (
    <PageShell title="NovaCloud" subtitle="Storage, backup e sincronizzazione" onBack={onBack}>
      <div className="nb-igCloudGrid">
        <article className="nb-igPageCard">
          <h3 className="nb-igCardTitle">Storage utilizzato</h3>
          <p className="nb-igCardDesc">1,2 GB su 10 GB · piano Studio</p>
          <div className="nb-igSpaceBar">
            <span style={{ width: "12%" }} />
          </div>
          <div className="nb-igSpaceMeta">
            <span>Foto, documenti, backup</span>
            <span>12%</span>
          </div>
        </article>
        <article className="nb-igPageCard">
          <h3 className="nb-igCardTitle">Backup</h3>
          <div className="nb-igFacts">
            <Fact label="Stato" value="Attivo" ok />
            <Fact label="Frequenza" value="Giornaliero · 06:00" />
            <Fact label="Ultimo" value="Oggi · 06:02" />
          </div>
          <button
            type="button"
            className="nb-igGhost"
            onClick={() => onToast("Backup avviato · demo")}
          >
            Avvia backup ora
          </button>
        </article>
        <article className="nb-igPageCard">
          <h3 className="nb-igCardTitle">Cronologia Backup</h3>
          <ul className="nb-igSimpleList">
            <li>05 ago · 06:02 · Completo · 842 MB</li>
            <li>04 ago · 06:01 · Completo · 838 MB</li>
            <li>03 ago · 06:00 · Completo · 831 MB</li>
          </ul>
        </article>
        <article className="nb-igPageCard">
          <h3 className="nb-igCardTitle">Cartelle sincronizzate</h3>
          <ul className="nb-igSimpleList">
            <li>Clienti / Foto</li>
            <li>Documenti / Consensi</li>
            <li>Report / Esportazioni</li>
          </ul>
        </article>
        <article className="nb-igPageCard">
          <h3 className="nb-igCardTitle">Cartelle condivise</h3>
          <ul className="nb-igSimpleList">
            <li>Team · Materiali marketing</li>
            <li>Reception · Modulistica</li>
            <li>Partner · Listini</li>
          </ul>
        </article>
        <article className="nb-igPageCard">
          <h3 className="nb-igCardTitle">Dispositivi collegati</h3>
          <ul className="nb-igSimpleList">
            <li>
              <Laptop className="nb-igTinyIcon" aria-hidden={true} /> Desktop Studio · online
            </li>
            <li>
              <Smartphone className="nb-igTinyIcon" aria-hidden={true} /> Staff Laura · online
            </li>
            <li>
              <Smartphone className="nb-igTinyIcon" aria-hidden={true} /> Staff Giulia · online
            </li>
          </ul>
        </article>
        <article className="nb-igPageCard">
          <h3 className="nb-igCardTitle">Impostazioni sincronizzazione</h3>
          <div className="nb-igFacts">
            <Fact label="Wi‑Fi only" value="Attivo" />
            <Fact label="Compressione" value="Media" />
            <Fact label="Conflitti" value="Chiedi conferma" />
          </div>
          <button
            type="button"
            className="nb-igGhost"
            onClick={() => onToast("Impostazioni sync salvate.")}
          >
            Salva impostazioni
          </button>
        </article>
        <article className="nb-igPageCard">
          <h3 className="nb-igCardTitle">Ripristino Backup</h3>
          <p className="nb-igCardDesc">Seleziona un punto di ripristino dalla cronologia.</p>
          <button
            type="button"
            className="nb-igPrimaryBtn isLive"
            onClick={() => onToast("Ripristino avviato · demo")}
          >
            Ripristina ultimo backup
          </button>
        </article>
        <article className="nb-igPageCard">
          <h3 className="nb-igCardTitle">Gestione spazio</h3>
          <p className="nb-igCardDesc">Libera spazio eliminando backup obsoleti o cache.</p>
          <div className="nb-igActions">
            <button
              type="button"
              className="nb-igGhost"
              onClick={() => onToast("Cache pulita · 120 MB liberati")}
            >
              Pulisci cache
            </button>
            <button
              type="button"
              className="nb-igGhost"
              onClick={() => onToast("Backup obsoleti rimossi · demo")}
            >
              Rimuovi backup vecchi
            </button>
          </div>
        </article>
      </div>
    </PageShell>
  );
}

function StaffDevicesPage({
  devices,
  onBack,
  onInvite,
  onRevoke
}: {
  devices: StaffDevice[];
  onBack: () => void;
  onInvite: () => void;
  onRevoke: () => void;
}) {
  return (
    <PageShell
      title="Dispositivi autorizzati"
      subtitle="NovaBeauty Staff · accesso mobile del team"
      onBack={onBack}
      actions={
        <div className="nb-igActions">
          <button type="button" className="nb-igGhost" onClick={onInvite}>
            Invita operatore
          </button>
          <button type="button" className="nb-igGhost danger" onClick={onRevoke}>
            Revoca accesso
          </button>
        </div>
      }
    >
      <div className="nb-igStaffGrid nb-igStaffGridFull">
        {devices.map((s) => (
          <div key={s.id} className={clsx("nb-igStaffPerson", `tone-${s.tone}`)}>
            <div className="nb-igStaffTop">
              <strong>{s.name}</strong>
              <span className={clsx("nb-igStaffStatus", `is-${s.status}`)}>
                {s.status === "online" ? "Online" : "Offline"}
              </span>
            </div>
            <div className="nb-igStaffMeta">
              <span>{s.device}</span>
              {s.version ? <span>{s.version}</span> : null}
              <span>
                {s.status === "online" ? "Sync" : "Ultimo accesso"} · {s.sync}
              </span>
            </div>
          </div>
        ))}
      </div>
    </PageShell>
  );
}

function MarketplacePage({
  mods,
  query,
  setQuery,
  category,
  setCategory,
  tab,
  setTab,
  onBack,
  onInstall,
  onOpen
}: {
  mods: MarketplaceMod[];
  query: string;
  setQuery: (v: string) => void;
  category: string;
  setCategory: (v: string) => void;
  tab: "tutti" | "novita" | "popolari" | "consigliati" | "aggiornamenti";
  setTab: (v: "tutti" | "novita" | "popolari" | "consigliati" | "aggiornamenti") => void;
  onBack: () => void;
  onInstall: (id: string) => void;
  onOpen: (id: string) => void;
}) {
  return (
    <PageShell
      title="Marketplace Nova"
      subtitle="Store ufficiale dell’Ecosistema Nova"
      onBack={onBack}
    >
      <div className="nb-igStoreToolbar">
        <label className="nb-igSearch">
          <Search className="nb-igBtnIcon" aria-hidden={true} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cerca moduli…"
          />
        </label>
        <div className="nb-igStoreTabs" role="tablist">
          {(
            [
              ["tutti", "Tutti"],
              ["novita", "Novità"],
              ["popolari", "Popolari"],
              ["consigliati", "Consigliati"],
              ["aggiornamenti", "Aggiornamenti"]
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={tab === id}
              className={clsx("nb-igStoreTab", tab === id && "isOn")}
              onClick={() => setTab(id)}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="nb-igChips">
          {MARKET_CATEGORIES.map((c) => (
            <button
              key={c}
              type="button"
              className={clsx("nb-igCatChip", category === c && "isOn")}
              onClick={() => setCategory(c)}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <div className="nb-igStoreGrid">
        {mods.map((mod) => {
          const Icon = mod.icon;
          return (
            <article key={mod.id} className="nb-igStoreCard">
              <span className="nb-igMarketIcon lg">
                <Icon aria-hidden={true} />
              </span>
              <h3 className="nb-igCardTitle">{mod.name}</h3>
              <p className="nb-igCardDesc">{mod.description}</p>
              <div className="nb-igStoreMeta">
                <span>{mod.category}</span>
                <span>v{mod.version}</span>
                <span className={clsx("nb-igModBadge", mod.installed ? "is-installato" : "is-pro")}>
                  {mod.installed ? "Installato" : "Disponibile"}
                </span>
              </div>
              <button
                type="button"
                className={clsx("nb-igInstall", mod.installed && "isDone")}
                onClick={() => (mod.installed ? onOpen(mod.id) : onInstall(mod.id))}
              >
                {mod.installed ? "Apri" : "Installa"}
              </button>
            </article>
          );
        })}
      </div>
      {mods.length === 0 ? (
        <p className="nb-igEmpty">Nessun modulo corrisponde ai filtri.</p>
      ) : null}
    </PageShell>
  );
}

function ModuleDetailPage({
  mod,
  onBack,
  onInstall
}: {
  mod: MarketplaceMod;
  onBack: () => void;
  onInstall: () => void;
}) {
  const Icon = mod.icon;
  return (
    <PageShell title={mod.name} subtitle={`${mod.category} · v${mod.version}`} onBack={onBack}>
      <article className="nb-igPageCard nb-igModuleDetail">
        <span className="nb-igMarketIcon lg">
          <Icon aria-hidden={true} />
        </span>
        <p className="nb-igCardDesc">{mod.description}</p>
        <div className="nb-igFacts">
          <Fact label="Categoria" value={mod.category} />
          <Fact label="Versione" value={mod.version} />
          <Fact label="Stato" value={mod.installed ? "Installato" : "Disponibile"} ok={mod.installed} />
        </div>
        {!mod.installed ? (
          <button type="button" className="nb-igPrimaryBtn isLive" onClick={onInstall}>
            Installa modulo
          </button>
        ) : (
          <p className="nb-igNote">Modulo attivo nell’ecosistema · configurazione demo.</p>
        )}
      </article>
    </PageShell>
  );
}

function LogsPage({
  logs,
  query,
  setQuery,
  type,
  setType,
  user,
  setUser,
  date,
  setDate,
  users,
  dates,
  onBack,
  onExport,
  onClear
}: {
  logs: EcoLog[];
  query: string;
  setQuery: (v: string) => void;
  type: string;
  setType: (v: string) => void;
  user: string;
  setUser: (v: string) => void;
  date: string;
  setDate: (v: string) => void;
  users: string[];
  dates: string[];
  onBack: () => void;
  onExport: () => void;
  onClear: () => void;
}) {
  return (
    <PageShell
      title="Log Ecosistema"
      subtitle="Cronologia completa eventi · demo"
      onBack={onBack}
      actions={
        <div className="nb-igActions">
          <button type="button" className="nb-igGhost" onClick={onExport}>
            Esporta
          </button>
          <button type="button" className="nb-igGhost danger" onClick={onClear}>
            <Trash2 className="nb-igBtnIcon" aria-hidden={true} />
            Cancella log
          </button>
        </div>
      }
    >
      <div className="nb-igLogFilters">
        <label className="nb-igSearch">
          <Search className="nb-igBtnIcon" aria-hidden={true} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cerca negli eventi…"
          />
        </label>
        <label className="nb-igField compact">
          <span>Tipo</span>
          <select value={type} onChange={(e) => setType(e.target.value)}>
            <option value="tutti">Tutti</option>
            <option value="sistema">Sistema</option>
            <option value="sync">Sync</option>
            <option value="security">Security</option>
            <option value="backup">Backup</option>
            <option value="staff">Staff</option>
          </select>
        </label>
        <label className="nb-igField compact">
          <span>Utente</span>
          <select value={user} onChange={(e) => setUser(e.target.value)}>
            {users.map((u) => (
              <option key={u} value={u}>
                {u === "tutti" ? "Tutti" : u}
              </option>
            ))}
          </select>
        </label>
        <label className="nb-igField compact">
          <span>Data</span>
          <select value={date} onChange={(e) => setDate(e.target.value)}>
            {dates.map((d) => (
              <option key={d} value={d}>
                {d === "tutti" ? "Tutte" : d}
              </option>
            ))}
          </select>
        </label>
      </div>

      <ol className="nb-igLogFull">
        {logs.map((log) => (
          <li key={log.id}>
            <span className="nb-igLogTime">
              {log.date} · {log.time}
            </span>
            <span className={clsx("nb-igLogDot", `tone-${log.tone}`)} aria-hidden={true} />
            <div className="nb-igLogFullBody">
              <span className="nb-igLogText">{log.text}</span>
              <span className="nb-igLogMeta">
                {log.type} · {log.user}
              </span>
            </div>
          </li>
        ))}
      </ol>
      {logs.length === 0 ? <p className="nb-igEmpty">Nessun evento in cronologia.</p> : null}
    </PageShell>
  );
}

function InviteDialog({
  email,
  setEmail,
  onClose,
  onSend
}: {
  email: string;
  setEmail: (v: string) => void;
  onClose: () => void;
  onSend: () => void;
}) {
  return (
    <div className="nb-dialogRoot isOpen" role="presentation">
      <button type="button" className="nb-dialogBackdrop" aria-label="Chiudi" onClick={onClose} />
      <div className="nb-dialogCard nb-igWideDialog" role="dialog" aria-modal="true">
        <h2 className="nb-dialogTitle">Invita operatore</h2>
        <p className="nb-dialogSub">Condividi l’accesso a NovaBeauty Staff</p>
        <div className="nb-igInviteQr" aria-hidden={true}>
          <QrCode />
          <span>QR Code demo</span>
        </div>
        <label className="nb-igField">
          <span>Link invito</span>
          <input readOnly value={INVITE_LINK} />
        </label>
        <label className="nb-igField">
          <span>Email</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="operatore@studio.it"
          />
        </label>
        <div className="nb-dialogActions">
          <button type="button" className="nb-igGhost" onClick={onClose}>
            Annulla
          </button>
          <button type="button" className="nb-igPrimaryBtn isLive" onClick={onSend}>
            Invia invito
          </button>
        </div>
      </div>
    </div>
  );
}

function RevokeDialog({
  devices,
  selected,
  setSelected,
  onClose,
  onConfirm
}: {
  devices: StaffDevice[];
  selected: string[];
  setSelected: (ids: string[]) => void;
  onClose: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className="nb-dialogRoot isOpen" role="presentation">
      <button type="button" className="nb-dialogBackdrop" aria-label="Chiudi" onClick={onClose} />
      <div className="nb-dialogCard nb-igWideDialog" role="dialog" aria-modal="true">
        <h2 className="nb-dialogTitle">Revoca accesso</h2>
        <p className="nb-dialogSub">Seleziona i dispositivi da disautorizzare</p>
        <ul className="nb-igRevokeList">
          {devices.map((d) => {
            const on = selected.includes(d.id);
            return (
              <li key={d.id}>
                <label className="nb-igRevokeRow">
                  <input
                    type="checkbox"
                    checked={on}
                    onChange={() =>
                      setSelected(
                        on ? selected.filter((id) => id !== d.id) : [...selected, d.id]
                      )
                    }
                  />
                  <span>
                    <strong>{d.name}</strong>
                    <em>
                      {d.device} · {d.status}
                    </em>
                  </span>
                </label>
              </li>
            );
          })}
        </ul>
        <div className="nb-dialogActions">
          <button type="button" className="nb-igGhost" onClick={onClose}>
            Annulla
          </button>
          <button type="button" className="nb-igGhost danger" onClick={onConfirm}>
            Conferma revoca
          </button>
        </div>
      </div>
    </div>
  );
}

function CardHead({
  icon: Icon,
  title,
  description,
  badge,
  badgeTone
}: {
  icon: ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  title: string;
  description: string;
  badge: string;
  badgeTone: "ok" | "pro" | "avail";
}) {
  return (
    <div className="nb-igCardHead">
      <span className="nb-igCardIcon">
        <Icon aria-hidden={true} />
      </span>
      <div className="nb-igCardHeadBody">
        <div className="nb-igCardTitleRow">
          <h3 className="nb-igCardTitle">{title}</h3>
          <span className={clsx("nb-igBadge", `is-${badgeTone}`)}>{badge}</span>
        </div>
        <p className="nb-igCardDesc">{description}</p>
      </div>
    </div>
  );
}

function Fact({ label, value, ok }: { label: string; value: string; ok?: boolean }) {
  return (
    <div className="nb-igFact">
      <span className="nb-igFactLabel">{label}</span>
      <span className={clsx("nb-igFactValue", ok && "isOk")}>{value}</span>
    </div>
  );
}
