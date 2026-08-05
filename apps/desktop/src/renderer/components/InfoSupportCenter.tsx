import {
  BookOpen,
  Bug,
  CheckCircle2,
  ExternalLink,
  Globe,
  Heart,
  Info,
  Lightbulb,
  Mail,
  Map,
  MessageCircle,
  Rocket,
  Sparkles
} from "lucide-react";
import clsx from "clsx";

const SOFTWARE_FACTS = [
  { label: "Versione", value: "0.1.0" },
  { label: "Build", value: "2026.08.05-desktop" },
  { label: "Canale", value: "Demo UI" },
  { label: "Release", value: "Sprint 21" },
  { label: "Ultimo aggiornamento", value: "5 ago 2026" },
  { label: "Licenza", value: "Community Edition" },
  { label: "Database", value: "Locale · demo" },
  { label: "Operatori", value: "3" },
  { label: "Clienti", value: "248" },
  { label: "Appuntamenti", value: "1.124" },
  { label: "Storage", value: "1,2 GB / 10 GB" }
];

const DOCS = ["Guide", "FAQ", "Primi passi", "Tutorial", "Centro assistenza"];

const NOVA_WEB_URL = "https://novaweb-nu.vercel.app/";
const SUPPORT_EMAIL = "fabiodigitalstudio.dev@gmail.com";
const GITHUB_ISSUES_URL = "https://github.com/NovaEcosystemOfficial/NovaBeauty/issues";
const SUPPORT_MAILTO = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent("Richiesta supporto NovaBeauty")}`;

const openExternal = (url: string) => {
  window.open(url, "_blank", "noopener,noreferrer");
};

const ROADMAP = {
  completato: [
    "Dashboard",
    "Agenda",
    "Clienti",
    "Servizi",
    "Magazzino",
    "Centro",
    "Report",
    "Backup",
    "Studio Styles",
    "Notification Center",
    "Integrazioni"
  ],
  sviluppo: ["Atlas", "NovaBeauty Staff", "Marketplace"],
  prossimo: ["Prenotazione Online", "Gift Card", "WhatsApp Business", "Google Calendar"]
};

export default function InfoSupportCenter() {
  const scrollToRoadmap = () => {
    document.getElementById("info-roadmap")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="nb-info" role="region" aria-label="Informazioni e Supporto">
      <header className="nb-infoHead">
        <div className="nb-infoHeadIcon" aria-hidden={true}>
          <Info />
        </div>
        <div>
          <h2 className="nb-infoTitle">Informazioni &amp; Supporto</h2>
          <p className="nb-infoSub">
            Tutto ciò che riguarda NovaBeauty e il supporto del tuo centro.
          </p>
        </div>
      </header>

      <article className="nb-infoStatus">
        <div className="nb-infoStatusMain">
          <span className="nb-infoStatusPill">
            <span className="nb-infoDot" aria-hidden={true} />
            Sistema operativo
          </span>
          <div className="nb-infoStatusGrid">
            <StatusFact label="Versione installata" value="0.1.0" />
            <StatusFact label="Licenza" value="Community" />
            <StatusFact label="Ultimo aggiornamento" value="5 ago 2026" />
            <StatusFact label="Sistema operativo" value="Windows 11 · demo" />
          </div>
        </div>
        <div className="nb-infoStatusSide">
          <CheckCircle2 className="nb-infoStatusOk" aria-hidden={true} />
          <span>Stato sano</span>
        </div>
      </article>

      <div className="nb-infoGrid">
        {/* 1 · Software */}
        <article className="nb-infoCard">
          <h3 className="nb-infoCardTitle">Informazioni software</h3>
          <div className="nb-infoFacts">
            {SOFTWARE_FACTS.map((f) => (
              <div key={f.label} className="nb-infoFact">
                <span>{f.label}</span>
                <strong>{f.value}</strong>
              </div>
            ))}
          </div>
        </article>

        {/* 2 · Ecosystem */}
        <article className="nb-infoCard">
          <div className="nb-infoCardHead">
            <span className="nb-infoCardIcon">
              <Globe aria-hidden={true} />
            </span>
            <div>
              <h3 className="nb-infoCardTitle">Nova Ecosystem</h3>
              <p className="nb-infoCardDesc">
                Scopri tutte le applicazioni e gli aggiornamenti dell&apos;ecosistema Nova.
              </p>
            </div>
          </div>
          <div className="nb-infoActions">
            <button
              type="button"
              className="nb-infoPrimary"
              onClick={() => openExternal(NOVA_WEB_URL)}
            >
              Apri sito ufficiale
              <ExternalLink className="nb-infoBtnIcon" aria-hidden={true} />
            </button>
            <button type="button" className="nb-infoGhost" onClick={() => openExternal(NOVA_WEB_URL)}>
              Novità
            </button>
            <button type="button" className="nb-infoGhost" onClick={scrollToRoadmap}>
              Roadmap
            </button>
          </div>
        </article>

        {/* 3 · Docs */}
        <article className="nb-infoCard">
          <div className="nb-infoCardHead">
            <span className="nb-infoCardIcon tone-docs">
              <BookOpen aria-hidden={true} />
            </span>
            <div>
              <h3 className="nb-infoCardTitle">Documentazione</h3>
              <p className="nb-infoCardDesc">Guide, FAQ e risorse per il tuo team.</p>
            </div>
          </div>
          <div className="nb-infoChips">
            {DOCS.map((d) => (
              <span key={d}>{d}</span>
            ))}
          </div>
          <div className="nb-infoActions">
            <button type="button" className="nb-infoGhost" onClick={() => openExternal(NOVA_WEB_URL)}>
              Apri documentazione
            </button>
            <button type="button" className="nb-infoGhost" onClick={() => openExternal(NOVA_WEB_URL)}>
              Guarda tutorial
            </button>
          </div>
        </article>

        {/* 4 · Support */}
        <article className="nb-infoCard">
          <div className="nb-infoCardHead">
            <span className="nb-infoCardIcon tone-support">
              <MessageCircle aria-hidden={true} />
            </span>
            <div>
              <h3 className="nb-infoCardTitle">Supporto</h3>
              <p className="nb-infoCardDesc">Assistenza dedicata al tuo centro estetico.</p>
            </div>
          </div>
          <div className="nb-infoFacts compact">
            <div className="nb-infoFact">
              <span>Email assistenza</span>
              <strong>{SUPPORT_EMAIL}</strong>
            </div>
            <div className="nb-infoFact">
              <span>Centro assistenza</span>
              <strong>24/5 · demo</strong>
            </div>
            <div className="nb-infoFact">
              <span>Contatta Nova</span>
              <strong>Chat · email</strong>
            </div>
          </div>
          <div className="nb-infoActions">
            <button
              type="button"
              className="nb-infoPrimary"
              onClick={() => {
                window.location.href = SUPPORT_MAILTO;
              }}
            >
              <Mail className="nb-infoBtnIcon" aria-hidden={true} />
              Richiedi supporto
            </button>
            <button type="button" className="nb-infoGhost" onClick={() => openExternal(NOVA_WEB_URL)}>
              Apri sito
              <ExternalLink className="nb-infoBtnIcon" aria-hidden={true} />
            </button>
          </div>
        </article>

        {/* 5 · Suggest — reserved for future site page */}
        <article className="nb-infoSuggest">
          <span className="nb-infoSuggestIcon" aria-hidden={true}>
            <Lightbulb />
          </span>
          <div>
            <h3 className="nb-infoSuggestTitle">Suggerisci una funzione</h3>
            <p>
              Ogni nuova funzione di NovaBeauty nasce anche dalle idee dei nostri clienti.
            </p>
          </div>
          <button type="button" className="nb-infoSuggestBtn" disabled title="Disponibile a breve">
            Invia suggerimento
          </button>
        </article>

        {/* 6 · Bug */}
        <article className="nb-infoBug">
          <span className="nb-infoBugIcon" aria-hidden={true}>
            <Bug />
          </span>
          <div>
            <h3 className="nb-infoCardTitle">Segnala un bug</h3>
            <p className="nb-infoCardDesc">
              Hai trovato un problema? Aiutaci a migliorare NovaBeauty.
            </p>
          </div>
          <button
            type="button"
            className="nb-infoBugBtn"
            onClick={() => openExternal(GITHUB_ISSUES_URL)}
          >
            Segnala Bug
          </button>
        </article>

        {/* 7 · Roadmap */}
        <article className="nb-infoCard nb-infoRoadmap" id="info-roadmap">
          <div className="nb-infoCardHead">
            <span className="nb-infoCardIcon tone-map">
              <Map aria-hidden={true} />
            </span>
            <div>
              <h3 className="nb-infoCardTitle">Roadmap</h3>
              <p className="nb-infoCardDesc">Cosa è pronto, in corso e in arrivo.</p>
            </div>
          </div>
          <div className="nb-infoRoadCols">
            <RoadCol title="Completato" tone="done" items={ROADMAP.completato} />
            <RoadCol title="In sviluppo" tone="wip" items={ROADMAP.sviluppo} />
            <RoadCol title="Prossimamente" tone="soon" items={ROADMAP.prossimo} />
          </div>
        </article>

        {/* 8 · Thanks */}
        <article className="nb-infoThanks">
          <Heart className="nb-infoThanksHeart" aria-hidden={true} />
          <h3 className="nb-infoThanksTitle">Grazie per aver scelto NovaBeauty.</h3>
          <p className="nb-infoThanksText">
            Ogni aggiornamento nasce con l&apos;obiettivo di aiutare il tuo centro estetico a
            crescere.
          </p>
          <div className="nb-infoThanksMeta">
            <span>Made with ♥ by Nova Ecosystem</span>
            <span>Versione 0.1.0</span>
            <span>© 2026 Nova Ecosystem</span>
          </div>
          <button type="button" className="nb-infoThanksBtn" onClick={() => openExternal(NOVA_WEB_URL)}>
            <Sparkles className="nb-infoBtnIcon" aria-hidden={true} />
            Visita il sito ufficiale
            <ExternalLink className="nb-infoBtnIcon" aria-hidden={true} />
          </button>
        </article>
      </div>
    </div>
  );
}

function StatusFact({ label, value }: { label: string; value: string }) {
  return (
    <div className="nb-infoStatusFact">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function RoadCol({
  title,
  tone,
  items
}: {
  title: string;
  tone: "done" | "wip" | "soon";
  items: string[];
}) {
  return (
    <div className={clsx("nb-infoRoadCol", `is-${tone}`)}>
      <div className="nb-infoRoadColTitle">
        {tone === "done" ? (
          <CheckCircle2 className="nb-infoRoadIcon" aria-hidden={true} />
        ) : tone === "wip" ? (
          <Rocket className="nb-infoRoadIcon" aria-hidden={true} />
        ) : (
          <Sparkles className="nb-infoRoadIcon" aria-hidden={true} />
        )}
        {title}
      </div>
      <ul>
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}
