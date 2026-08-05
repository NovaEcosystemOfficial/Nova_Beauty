import {
  Brain,
  Check,
  ExternalLink,
  FileText,
  Megaphone,
  Orbit,
  Sparkles,
  Star
} from "lucide-react";
import clsx from "clsx";
import { useState, type ComponentType, type ReactNode } from "react";
import { startStripeCheckout } from "../utils/licenseBilling";

type AppStatus = "installed" | "available";

type NovaModule = {
  id: string;
  name: string;
  blurb: string;
  status: AppStatus;
  statusLabel: string;
  meta?: string;
  description?: string;
  modes?: string[];
  actionLabel: string;
  /** Se presente, il CTA apre questo URL (browser esterno). */
  href?: string;
  tone: "beauty" | "promo" | "docs" | "atlas";
  icon: ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  /** Azione interna (es. dialog Atlas). */
  onAction?: () => void;
  /** Tutta la card è cliccabile. */
  cardClickable?: boolean;
};

const SYNC_ITEMS = [
  "Account",
  "Licenza",
  "Preferenze",
  "Backup",
  "Atlas",
  "NovaDocs",
  "NovaPromo"
];

const PRO_PERKS = [
  "Sincronizzazione Cloud",
  "Atlas Cloud",
  "Backup automatici",
  "Multi-dispositivo",
  "Licenza condivisa Ecosistema",
  "Aggiornamenti Premium"
];

type AtlasDraft = {
  mode: "locale" | "cloud";
  provider: string;
  apiKey: string;
  model: string;
};

const ATLAS_EMPTY: AtlasDraft = {
  mode: "locale",
  provider: "Ollama",
  apiKey: "",
  model: "qwen2.5"
};

export default function NovaHub() {
  const [atlasOpen, setAtlasOpen] = useState(false);
  const [atlasDraft, setAtlasDraft] = useState(ATLAS_EMPTY);
  const [atlasTestMsg, setAtlasTestMsg] = useState<string | null>(null);
  const [billingOpen, setBillingOpen] = useState(false);
  const [billingMsg, setBillingMsg] = useState<string | null>(null);
  const [billingBusy, setBillingBusy] = useState(false);

  const openAtlas = () => {
    setAtlasDraft(ATLAS_EMPTY);
    setAtlasTestMsg(null);
    setAtlasOpen(true);
  };

  const modules: NovaModule[] = [
    {
      id: "novabeauty",
      name: "NovaBeauty",
      blurb: "Gestionale estetico Desktop",
      status: "installed",
      statusLabel: "Installato",
      meta: "Versione Desktop",
      actionLabel: "Apri",
      tone: "beauty",
      icon: Sparkles
    },
    {
      id: "novapromo",
      name: "NovaPromo",
      blurb: "Marketing intelligente",
      status: "available",
      statusLabel: "Disponibile",
      description: "Crea campagne, banner, post social e contenuti AI.",
      actionLabel: "Apri NovaPromo",
      href: "https://novapromo.vercel.app/",
      tone: "promo",
      icon: Megaphone
    },
    {
      id: "novadocs",
      name: "NovaDocs",
      blurb: "Gestione documenti",
      status: "available",
      statusLabel: "Disponibile",
      actionLabel: "Scopri",
      href: "https://apps.microsoft.com/detail/9P1G6TZGVSJM?hl=it-it&gl=IT&ocid=pdpshare",
      tone: "docs",
      icon: FileText
    },
    {
      id: "atlas",
      name: "Atlas",
      blurb: "Assistente AI dell’Ecosistema Nova",
      status: "available",
      statusLabel: "Disponibile",
      modes: ["Locale (Ollama)", "Cloud (OpenAI)"],
      actionLabel: "Configura",
      tone: "atlas",
      icon: Brain,
      onAction: openAtlas,
      cardClickable: true
    }
  ];

  const openBilling = () => {
    setBillingMsg(null);
    setBillingOpen(true);
  };

  const confirmBilling = async () => {
    setBillingBusy(true);
    // TODO: integrazione Stripe — abbonamento Ecosistema Nova PRO
    // TODO: sincronizzazione con account Nova
    const result = await startStripeCheckout({
      plan: "pro",
      interval: "month",
      amountEur: 15,
      currency: "eur"
    });
    setBillingBusy(false);
    setBillingMsg(result.message);
  };

  return (
    <div className="nb-nova" role="region" aria-label="Centro Ecosistema Nova">
      <header className="nb-novaHeader">
        <div className="nb-novaHeaderIcon" aria-hidden={true}>
          <Orbit className="nb-novaHeaderIconSvg" />
        </div>
        <div>
          <h2 className="nb-novaTitle">Centro Ecosistema Nova</h2>
          <p className="nb-novaSubtitle">
            Tutte le applicazioni e i servizi del tuo ecosistema Nova, in un unico posto.
          </p>
        </div>
      </header>

      <HubSection
        title="Applicazioni installate"
        caption="Moduli collegati al tuo account Nova · demo UI"
      >
        <div className="nb-novaAppGrid">
          {modules.map((mod) => (
            <ModuleCard key={mod.id} module={mod} />
          ))}
        </div>
      </HubSection>

      <HubSection title="Ecosistema Nova PRO" caption="Abbonamento unico sull’ecosistema">
        <article className="nb-novaPro">
          <div className="nb-novaProTop">
            <span className="nb-novaProBadge">
              <Star className="nb-novaProBadgeIcon" aria-hidden={true} />
              Nova PRO
            </span>
            <p className="nb-novaProText">
              Con un solo abbonamento sblocchi le funzionalità Premium dell&apos;Ecosistema Nova su
              tutti i dispositivi collegati.
            </p>
          </div>
          <ul className="nb-novaProList">
            {PRO_PERKS.map((p) => (
              <li key={p}>
                <Check className="nb-novaCheck" aria-hidden={true} />
                {p}
              </li>
            ))}
          </ul>
          <button type="button" className="nb-novaProCta" onClick={openBilling}>
            Gestisci abbonamento
          </button>
        </article>
      </HubSection>

      <HubSection
        title="Sincronizzazione Ecosistema"
        caption="Preparata per sync futura · Account, Licenza, Preferenze, Backup, Atlas, NovaDocs, NovaPromo"
      >
        <article className="nb-novaSync">
          <h3 className="nb-novaSyncTitle">Sincronizzazione</h3>
          <ul className="nb-novaSyncList">
            {SYNC_ITEMS.map((item) => (
              <li key={item}>
                <span className="nb-novaSyncOk" aria-hidden={true}>
                  <Check className="nb-novaCheck" />
                </span>
                {item}
                <span className="nb-novaSyncReady">Pronto</span>
              </li>
            ))}
          </ul>
        </article>
      </HubSection>

      {atlasOpen ? (
        <div
          className="nb-dialogRoot isOpen"
          role="presentation"
        >
          <button
            type="button"
            className="nb-dialogBackdrop"
            aria-label="Chiudi"
            onClick={() => setAtlasOpen(false)}
          />
          <div
            className="nb-dialogCard nb-novaAtlasDialog"
            role="dialog"
            aria-modal="true"
            aria-label="Configurazione Atlas"
          >
            <h2 className="nb-dialogTitle">Configurazione Atlas</h2>
            <p className="nb-dialogSub">Assistente AI · locale o cloud · placeholder demo</p>

            <div className="nb-novaAtlasForm">
              <fieldset className="nb-novaAtlasModes">
                <legend>Modalità</legend>
                <label className="nb-novaAtlasRadio">
                  <input
                    type="radio"
                    name="atlas-mode"
                    checked={atlasDraft.mode === "locale"}
                    onChange={() =>
                      setAtlasDraft((d) => ({
                        ...d,
                        mode: "locale",
                        provider: "Ollama",
                        model: "qwen2.5"
                      }))
                    }
                  />
                  <span>Modalità Locale (Ollama)</span>
                </label>
                <label className="nb-novaAtlasRadio">
                  <input
                    type="radio"
                    name="atlas-mode"
                    checked={atlasDraft.mode === "cloud"}
                    onChange={() =>
                      setAtlasDraft((d) => ({
                        ...d,
                        mode: "cloud",
                        provider: "OpenAI",
                        model: "gpt-4o-mini"
                      }))
                    }
                  />
                  <span>Modalità Cloud (OpenAI)</span>
                </label>
              </fieldset>

              <label className="nb-drawerField">
                <span className="nb-drawerFieldLabel">Provider AI</span>
                <select
                  className="nb-drawerSelect"
                  value={atlasDraft.provider}
                  onChange={(e) => setAtlasDraft((d) => ({ ...d, provider: e.target.value }))}
                >
                  {atlasDraft.mode === "locale" ? (
                    <>
                      <option value="Ollama">Ollama</option>
                      <option value="LM Studio">LM Studio</option>
                    </>
                  ) : (
                    <>
                      <option value="OpenAI">OpenAI</option>
                      <option value="Azure OpenAI">Azure OpenAI</option>
                      <option value="Anthropic">Anthropic</option>
                    </>
                  )}
                </select>
              </label>

              <label className="nb-drawerField">
                <span className="nb-drawerFieldLabel">API Key</span>
                <input
                  className="nb-drawerInput"
                  type="password"
                  autoComplete="off"
                  placeholder={atlasDraft.mode === "locale" ? "Opzionale · locale" : "sk-…"}
                  value={atlasDraft.apiKey}
                  onChange={(e) => setAtlasDraft((d) => ({ ...d, apiKey: e.target.value }))}
                  disabled={atlasDraft.mode === "locale"}
                />
              </label>

              <label className="nb-drawerField">
                <span className="nb-drawerFieldLabel">Modello predefinito</span>
                <input
                  className="nb-drawerInput"
                  value={atlasDraft.model}
                  onChange={(e) => setAtlasDraft((d) => ({ ...d, model: e.target.value }))}
                  placeholder="modello"
                />
              </label>

              {atlasTestMsg ? (
                <p className="nb-novaAtlasTestMsg" role="status">
                  {atlasTestMsg}
                </p>
              ) : null}
            </div>

            <div className="nb-dialogActions">
              <button
                type="button"
                className="nb-ghostBtn"
                onClick={() => {
                  // Placeholder: nessuna connessione reale
                  setAtlasTestMsg(
                    atlasDraft.mode === "locale"
                      ? "Test connessione · Ollama locale (placeholder)"
                      : "Test connessione · Cloud AI (placeholder)"
                  );
                }}
              >
                Test connessione
              </button>
              <button type="button" className="nb-ghostBtn" onClick={() => setAtlasOpen(false)}>
                Annulla
              </button>
              <button
                type="button"
                className="nb-newBtn"
                onClick={() => {
                  // Placeholder save — nessuna persistenza backend
                  setAtlasOpen(false);
                }}
              >
                Salva configurazione
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {billingOpen ? (
        <div className="nb-dialogRoot isOpen" role="presentation">
          <button
            type="button"
            className="nb-dialogBackdrop"
            aria-label="Chiudi"
            onClick={() => setBillingOpen(false)}
          />
          <div
            className="nb-dialogCard"
            role="dialog"
            aria-modal="true"
            aria-label="Gestisci abbonamento"
          >
            <h2 className="nb-dialogTitle">Gestisci abbonamento</h2>
            <p className="nb-dialogSub">
              Ecosistema Nova PRO · integrazione Stripe in arrivo. Qui gestirai rinnovi, metodo di
              pagamento e fatture.
            </p>
            {billingMsg ? (
              <p className="nb-licUpgradeDemoMsg" role="status">
                {billingMsg}
              </p>
            ) : null}
            <div className="nb-dialogActions">
              <button
                type="button"
                className="nb-ghostBtn"
                onClick={() => setBillingOpen(false)}
                disabled={billingBusy}
              >
                Chiudi
              </button>
              {!billingMsg ? (
                <button
                  type="button"
                  className="nb-newBtn"
                  disabled={billingBusy}
                  onClick={() => void confirmBilling()}
                >
                  {billingBusy ? "Attendere…" : "Continua"}
                </button>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function HubSection({
  title,
  caption,
  children
}: {
  title: string;
  caption: string;
  children: ReactNode;
}) {
  return (
    <section className="nb-novaSection">
      <div className="nb-novaSectionHead">
        <h3 className="nb-novaSectionTitle">{title}</h3>
        <p className="nb-novaSectionCap">{caption}</p>
      </div>
      {children}
    </section>
  );
}

function ModuleCard({ module }: { module: NovaModule }) {
  const Icon = module.icon;
  const installed = module.status === "installed";
  const canOpen = Boolean(module.href);
  const interactive = canOpen || Boolean(module.onAction);

  const runAction = () => {
    if (module.onAction) {
      module.onAction();
      return;
    }
    if (!module.href) return;
    window.open(module.href, "_blank", "noopener,noreferrer");
  };

  return (
    <article
      className={clsx(
        "nb-novaAppCard",
        `tone-${module.tone}`,
        installed && "isInstalled",
        module.cardClickable && "isClickable"
      )}
      onClick={module.cardClickable ? runAction : undefined}
      onKeyDown={
        module.cardClickable
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                runAction();
              }
            }
          : undefined
      }
      role={module.cardClickable ? "button" : undefined}
      tabIndex={module.cardClickable ? 0 : undefined}
    >
      <div className="nb-novaAppTop">
        <div className={clsx("nb-novaAppIcon", `tone-${module.tone}`)}>
          <Icon className="nb-novaAppIconSvg" aria-hidden={true} />
        </div>
        <span className={clsx("nb-novaStatus", installed ? "isOn" : "isAvail")}>
          {installed ? <Check className="nb-novaStatusIcon" aria-hidden={true} /> : null}
          {module.statusLabel}
        </span>
      </div>

      <h3 className="nb-novaAppName">{module.name}</h3>
      <p className="nb-novaAppBlurb">{module.blurb}</p>

      {module.description ? <p className="nb-novaAppDesc">{module.description}</p> : null}

      {module.meta ? <p className="nb-novaAppMeta">{module.meta}</p> : null}

      {module.modes ? (
        <div className="nb-novaModes" aria-label="Modalità Atlas">
          {module.modes.map((m) => (
            <span key={m} className="nb-novaModeChip">
              {m}
            </span>
          ))}
        </div>
      ) : null}

      <button
        type="button"
        className={clsx("nb-novaAppCta", interactive && "isLive")}
        disabled={!interactive}
        onClick={(e) => {
          e.stopPropagation();
          runAction();
        }}
      >
        {module.actionLabel}
        {canOpen || !installed ? (
          <ExternalLink className="nb-novaAppCtaIcon" aria-hidden={true} />
        ) : null}
      </button>
    </article>
  );
}
