import {
  ArrowLeft,
  Bell,
  Building2,
  Check,
  Cloud,
  Info,
  KeyRound,
  Orbit,
  PartyPopper,
  Plug,
  Rocket,
  Settings,
  Shield,
  Sparkles
} from "lucide-react";
import clsx from "clsx";
import { useCallback, useEffect, useState, type ComponentType, type ReactNode } from "react";
import FounderCeremony from "./FounderCeremony";
import NovaHub from "./NovaHub";
import CentroAdmin from "./CentroAdmin";
import BackupCenter from "./BackupCenter";
import AppearanceCenter from "./AppearanceCenter";
import NotificationCenter from "./NotificationCenter";
import IntegrationsCenter from "./IntegrationsCenter";
import InfoSupportCenter from "./InfoSupportCenter";
import { startStripeCheckout } from "../utils/licenseBilling";

type SettingsSection =
  | "centro"
  | "licenza"
  | "nova"
  | "backup"
  | "aspetto"
  | "notifiche"
  | "integrazioni"
  | "informazioni";

export type SettingsDeepLink = "centro" | "notifiche";

type LicenseView = "status" | "plans" | "founder";

const SETTINGS_MENU: Array<{
  id: SettingsSection;
  label: string;
  icon: ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
}> = [
  { id: "centro", label: "Centro", icon: Building2 },
  { id: "licenza", label: "Licenza", icon: KeyRound },
  { id: "nova", label: "Nova", icon: Orbit },
  { id: "backup", label: "Backup", icon: Cloud },
  { id: "aspetto", label: "Studio Styles", icon: Sparkles },
  { id: "notifiche", label: "Notifiche", icon: Bell },
  { id: "integrazioni", label: "Integrazioni", icon: Plug },
  { id: "informazioni", label: "Informazioni", icon: Info }
];

export default function SettingsWorkspace({
  focusToken = 0,
  focusSection = "centro"
}: {
  focusToken?: number;
  focusSection?: SettingsDeepLink;
}) {
  const [section, setSection] = useState<SettingsSection>("centro");
  const [licenseView, setLicenseView] = useState<LicenseView>("status");
  const [ceremonyActive, setCeremonyActive] = useState(false);
  const [isFounderDemo, setIsFounderDemo] = useState(false);
  const [founderSlots, setFounderSlots] = useState(83);

  useEffect(() => {
    if (focusToken <= 0) return;
    setSection(focusSection);
    setLicenseView("status");
  }, [focusToken, focusSection]);

  const startCeremony = useCallback(() => {
    if (ceremonyActive) return;
    setFounderSlots(83);
    setCeremonyActive(true);
  }, [ceremonyActive]);

  const handleSlotsTick = useCallback((slots: number) => {
    setFounderSlots(slots);
  }, []);

  const handleCeremonyComplete = useCallback(() => {
    setCeremonyActive(false);
    setIsFounderDemo(true);
    setLicenseView("founder");
  }, []);

  return (
    <div
      className={clsx("nb-settingsWs", ceremonyActive && "isCeremonyLocked")}
      role="region"
      aria-label="Workspace Impostazioni"
      aria-busy={ceremonyActive}
    >
      <aside className="nb-setMenu">
        <div className="nb-setMenuHead">
          <Settings className="nb-setMenuIcon" aria-hidden={true} />
          <div>
            <div className="nb-setMenuTitle">Impostazioni</div>
            <div className="nb-setMenuSub">Preferenze studio · demo</div>
          </div>
        </div>
        <nav className="nb-setMenuList" aria-label="Menu impostazioni">
          {SETTINGS_MENU.map((item) => {
            const Icon = item.icon;
            const isActive = section === item.id;
            return (
              <button
                key={item.id}
                type="button"
                className={clsx("nb-setMenuItem", isActive && "isActive")}
                disabled={ceremonyActive}
                onClick={() => {
                  setSection(item.id);
                  if (item.id === "licenza") setLicenseView("status");
                }}
              >
                <span className="nb-setMenuItemIconWrap">
                  <Icon className="nb-setMenuItemIcon" aria-hidden={true} />
                </span>
                <span className="nb-setMenuItemLabel">{item.label}</span>
              </button>
            );
          })}
        </nav>
        <div className="nb-setMenuFoot">
          License Center pronto per collegamento futuro — nessuna logica attiva.
        </div>
      </aside>

      <section className="nb-setMain" aria-label="Contenuto impostazioni">
        {section === "licenza" ? (
          <LicenseCenter
            view={licenseView}
            onViewChange={setLicenseView}
            isFounderDemo={isFounderDemo}
            founderSlots={founderSlots}
            ceremonyActive={ceremonyActive}
            onSimulateFounder={startCeremony}
          />
        ) : section === "nova" ? (
          <NovaHub />
        ) : section === "centro" ? (
          <CentroAdmin />
        ) : section === "backup" ? (
          <BackupCenter />
        ) : section === "aspetto" ? (
          <AppearanceCenter />
        ) : section === "notifiche" ? (
          <NotificationCenter />
        ) : section === "integrazioni" ? (
          <IntegrationsCenter />
        ) : section === "informazioni" ? (
          <InfoSupportCenter />
        ) : null}
      </section>

      {ceremonyActive ? (
        <FounderCeremony
          slots={founderSlots}
          onComplete={handleCeremonyComplete}
          onSlotsTick={handleSlotsTick}
        />
      ) : null}
    </div>
  );
}

function LicenseCenter({
  view,
  onViewChange,
  isFounderDemo,
  founderSlots,
  ceremonyActive,
  onSimulateFounder
}: {
  view: LicenseView;
  onViewChange: (v: LicenseView) => void;
  isFounderDemo: boolean;
  founderSlots: number;
  ceremonyActive: boolean;
  onSimulateFounder: () => void;
}) {
  if (view === "plans") {
    return (
      <PlansView
        onBack={() => onViewChange("status")}
        onFounder={() => onViewChange("founder")}
        founderSlots={founderSlots}
        ceremonyActive={ceremonyActive}
        isFounderDemo={isFounderDemo}
      />
    );
  }
  if (view === "founder") {
    return <FounderView onBack={() => onViewChange("plans")} isFounderDemo={isFounderDemo} />;
  }
  return (
    <LicenseStatusView
      onCompare={() => onViewChange("plans")}
      isFounderDemo={isFounderDemo}
      ceremonyActive={ceremonyActive}
      onSimulateFounder={onSimulateFounder}
    />
  );
}

function LicenseStatusView({
  onCompare,
  isFounderDemo,
  ceremonyActive,
  onSimulateFounder
}: {
  onCompare: () => void;
  isFounderDemo: boolean;
  ceremonyActive: boolean;
  onSimulateFounder: () => void;
}) {
  return (
    <div className="nb-lic">
      <header className="nb-licHeader">
        <div className="nb-licHeaderIcon" aria-hidden={true}>
          <KeyRound className="nb-licHeaderIconSvg" />
        </div>
        <div>
          <h2 className="nb-licTitle">NovaBeauty License Center</h2>
          <p className="nb-licSubtitle">
            Gestisci il tuo piano e scopri tutte le funzionalità disponibili.
          </p>
        </div>
      </header>

      {isFounderDemo ? (
        <div className="nb-licFounderPermanent" role="status">
          <span className="nb-licFounderPermanentBadge">
            <Sparkles className="nb-licFounderPermanentIcon" aria-hidden={true} />
            Founder
          </span>
          <p className="nb-licFounderPermanentText">Grazie per aver creduto in NovaBeauty.</p>
        </div>
      ) : null}

      <article className="nb-licStatusCard">
        <div className="nb-licStatusTop">
          <div>
            <div className="nb-licPlanEyebrow">Piano attuale</div>
            <h3 className="nb-licPlanName">
              {isFounderDemo ? "Founder Edition" : "Community Edition"}
            </h3>
          </div>
          <span className="nb-licBadge isActive">Attiva</span>
        </div>

        <div className="nb-licStatusGrid">
          <LicField label="Versione" value={isFounderDemo ? "Founder" : "Gratuita"} />
          <LicField label="Aggiornamenti" value="Inclusi" />
          <LicField label="Supporto" value={isFounderDemo ? "Prioritario" : "Community"} />
          <LicField label="Operatori" value={isFounderDemo ? "Illimitati" : "1"} />
        </div>

        <div className="nb-licStatusFoot">
          <p className="nb-licStatusHint">
            Demo UI — pronta per validazione licenze e Stripe in futuro.
          </p>
          <div className="nb-licStatusActions">
            {!isFounderDemo ? (
              <button
                type="button"
                className="nb-licSimBtn"
                disabled={ceremonyActive}
                onClick={onSimulateFounder}
              >
                <PartyPopper className="nb-licSimBtnIcon" aria-hidden={true} />
                Simula acquisto Founder
              </button>
            ) : null}
            <button
              type="button"
              className="nb-newBtn nb-licCompareBtn"
              disabled={ceremonyActive}
              onClick={onCompare}
            >
              Confronta piani
            </button>
          </div>
        </div>
      </article>

      <div className="nb-licQuickRow">
        <QuickNote
          title={isFounderDemo ? "Founder" : "Community"}
          text={
            isFounderDemo
              ? "Licenza permanente demo attiva. Supporto prioritario e badge Founder."
              : "Ideale per la singola estetista. Tutti i moduli operativi base inclusi."
          }
        />
        <QuickNote
          title="Upgrade ready"
          text="Pro e Founder sbloccano multi-operatore, analytics e backup."
        />
      </div>
    </div>
  );
}

function PlansView({
  onBack,
  onFounder,
  founderSlots,
  ceremonyActive,
  isFounderDemo
}: {
  onBack: () => void;
  onFounder: () => void;
  founderSlots: number;
  ceremonyActive: boolean;
  isFounderDemo: boolean;
}) {
  const barWidth = `${founderSlots}%`;
  const [communityInfoOpen, setCommunityInfoOpen] = useState(false);
  const [proStep, setProStep] = useState<null | 0 | 1 | 2>(null);
  const [proBusy, setProBusy] = useState(false);
  const [proDemoMsg, setProDemoMsg] = useState<string | null>(null);

  const closePro = () => {
    setProStep(null);
    setProBusy(false);
    setProDemoMsg(null);
  };

  const confirmProUpgrade = async () => {
    setProBusy(true);
    // TODO: integrazione Stripe / verifica licenza / attivazione / sync Nova
    const result = await startStripeCheckout({
      plan: "pro",
      interval: "month",
      amountEur: 15,
      currency: "eur"
    });
    setProBusy(false);
    setProDemoMsg(result.message);
  };

  return (
    <div className="nb-lic">
      <header className="nb-licHeader compact">
        <button type="button" className="nb-licBack" onClick={onBack} disabled={ceremonyActive}>
          <ArrowLeft className="nb-licBackIcon" aria-hidden={true} />
          Torna allo stato
        </button>
        <div>
          <h2 className="nb-licTitle">Confronta piani</h2>
          <p className="nb-licSubtitle">Scegli il percorso giusto per il tuo studio. Solo UI demo.</p>
        </div>
      </header>

      <div className="nb-licPlans">
        <PlanCard
          name="Community"
          price="0 €"
          priceNote="Sempre gratuito"
          current={!isFounderDemo}
          features={[
            "1 operatore",
            "Dashboard",
            "Agenda",
            "Clienti",
            "Servizi",
            "Magazzino",
            "Fornitori",
            "Aggiornamenti"
          ]}
          cta={!isFounderDemo ? "Piano attuale" : "Community"}
          ctaDisabled={isFounderDemo || ceremonyActive}
          onCta={
            !isFounderDemo && !ceremonyActive ? () => setCommunityInfoOpen(true) : undefined
          }
        />

        <PlanCard
          name="Pro"
          price="15 €/mese"
          priceNote="oppure 99 €/anno"
          highlight={!isFounderDemo}
          features={[
            "Operatori illimitati",
            "Report avanzati",
            "Backup",
            "Analytics",
            "Integrazioni",
            "Tutte le funzioni future"
          ]}
          cta="Passa a Pro"
          ctaDisabled={ceremonyActive}
          onCta={ceremonyActive ? undefined : () => setProStep(0)}
        />

        <PlanCard
          name="Founder Edition"
          price="99 €"
          priceNote="Pagamento unico · Solo primi 100 clienti"
          founder
          current={isFounderDemo}
          features={[
            "Tutto Pro",
            "Licenza permanente",
            "Badge Founder",
            "Supporto prioritario",
            "Aggiornamenti futuri inclusi"
          ]}
          extra={
            <div className="nb-licSlots">
              <div className="nb-licSlotsLabel">Posti disponibili</div>
              <div className={clsx("nb-licSlotsValue", ceremonyActive && "isAnimating")}>
                {founderSlots} / 100
              </div>
              <div className="nb-licSlotsBar" aria-hidden={true}>
                <span style={{ width: barWidth }} />
              </div>
            </div>
          }
          cta={isFounderDemo ? "Piano attuale" : "Diventa Founder"}
          ctaDisabled={isFounderDemo || ceremonyActive}
          onCta={isFounderDemo || ceremonyActive ? undefined : onFounder}
        />
      </div>

      {communityInfoOpen ? (
        <div className="nb-dialogRoot isOpen" role="presentation">
          <button
            type="button"
            className="nb-dialogBackdrop"
            aria-label="Chiudi"
            onClick={() => setCommunityInfoOpen(false)}
          />
          <div className="nb-dialogCard" role="dialog" aria-modal="true" aria-label="Piano Community">
            <h2 className="nb-dialogTitle">Community</h2>
            <p className="nb-dialogSub">Stai già utilizzando questo piano.</p>
            <div className="nb-dialogActions">
              <button
                type="button"
                className="nb-newBtn"
                onClick={() => setCommunityInfoOpen(false)}
              >
                Chiudi
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {proStep !== null ? (
        <div className="nb-dialogRoot isOpen" role="presentation">
          <button type="button" className="nb-dialogBackdrop" aria-label="Chiudi" onClick={closePro} />
          <div
            className="nb-dialogCard nb-licUpgradeDialog"
            role="dialog"
            aria-modal="true"
            aria-label="Upgrade Pro"
          >
            <h2 className="nb-dialogTitle">Upgrade Pro</h2>
            <p className="nb-dialogSub">
              {proStep === 0
                ? "Riepilogo funzionalità"
                : proStep === 1
                  ? "Prezzo"
                  : "Conferma"}
            </p>

            {proStep === 0 ? (
              <ul className="nb-licUpgradeList">
                {[
                  "Operatori illimitati",
                  "Report avanzati",
                  "Backup",
                  "Analytics",
                  "Integrazioni",
                  "Tutte le funzioni future"
                ].map((f) => (
                  <li key={f}>
                    <Check className="nb-licFeatureCheck" aria-hidden={true} />
                    {f}
                  </li>
                ))}
              </ul>
            ) : null}

            {proStep === 1 ? (
              <div className="nb-licUpgradePrice">
                <div className="nb-licPlanPrice">15 €/mese</div>
                <div className="nb-licPlanPriceNote">oppure 99 €/anno · IVA esclusa</div>
              </div>
            ) : null}

            {proStep === 2 ? (
              <div className="nb-licUpgradeConfirm">
                <p className="nb-dialogSub">
                  Confermi di voler passare al piano Pro? In produzione il pagamento verrà gestito
                  da Stripe.
                </p>
                {proDemoMsg ? (
                  <p className="nb-licUpgradeDemoMsg" role="status">
                    {proDemoMsg}
                  </p>
                ) : null}
              </div>
            ) : null}

            <div className="nb-dialogActions">
              <button type="button" className="nb-ghostBtn" onClick={closePro} disabled={proBusy}>
                {proDemoMsg ? "Chiudi" : "Annulla"}
              </button>
              {proStep < 2 ? (
                <button
                  type="button"
                  className="nb-newBtn"
                  onClick={() => setProStep((s) => (s === null ? 0 : ((s + 1) as 0 | 1 | 2)))}
                >
                  Continua
                </button>
              ) : proDemoMsg ? null : (
                <button
                  type="button"
                  className="nb-newBtn"
                  disabled={proBusy}
                  onClick={() => void confirmProUpgrade()}
                >
                  {proBusy ? "Attendere…" : "Conferma"}
                </button>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function FounderView({ onBack, isFounderDemo }: { onBack: () => void; isFounderDemo: boolean }) {
  return (
    <div className="nb-lic">
      <header className="nb-licHeader compact">
        <button type="button" className="nb-licBack" onClick={onBack}>
          <ArrowLeft className="nb-licBackIcon" aria-hidden={true} />
          Torna ai piani
        </button>
      </header>

      {isFounderDemo ? (
        <div className="nb-licFounderPermanent" role="status">
          <span className="nb-licFounderPermanentBadge">
            <Sparkles className="nb-licFounderPermanentIcon" aria-hidden={true} />
            Founder
          </span>
          <p className="nb-licFounderPermanentText">Grazie per aver creduto in NovaBeauty.</p>
        </div>
      ) : null}

      <article className="nb-licFounderCard">
        <div className="nb-licFounderHero">
          <div className="nb-licFounderIcon" aria-hidden={true}>
            <Rocket className="nb-licFounderIconSvg" />
          </div>
          <div>
            <div className="nb-licFounderEyebrow">Founder Edition</div>
            <h2 className="nb-licFounderTitle">
              Grazie per aver creduto in NovaBeauty fin dall&apos;inizio.
            </h2>
            <p className="nb-licFounderText">
              Vista demo della conferma Founder — nessun pagamento reale in questo sprint.
            </p>
          </div>
        </div>

        <div className="nb-licFounderBadgeRow">
          <span className="nb-licFounderBadge">
            <Shield className="nb-licFounderBadgeIcon" aria-hidden={true} />
            Badge Founder
          </span>
        </div>

        <div className="nb-licStatusGrid">
          <LicField label="Cliente dal" value="15 Marzo 2027" />
          <LicField label="Licenza" value="Permanente" />
          <LicField label="Supporto" value="Prioritario" />
          <LicField label="Piano" value="Founder Edition" />
        </div>
      </article>
    </div>
  );
}

function PlanCard({
  name,
  price,
  priceNote,
  features,
  cta,
  ctaDisabled,
  current,
  highlight,
  founder,
  extra,
  onCta
}: {
  name: string;
  price: string;
  priceNote: string;
  features: string[];
  cta: string;
  ctaDisabled?: boolean;
  current?: boolean;
  highlight?: boolean;
  founder?: boolean;
  extra?: ReactNode;
  onCta?: () => void;
}) {
  return (
    <article
      className={clsx(
        "nb-licPlanCard",
        current && "isCurrent",
        highlight && "isHighlight",
        founder && "isFounder"
      )}
    >
      <div className="nb-licPlanCardTop">
        <h3 className="nb-licPlanCardName">{name}</h3>
        {current ? <span className="nb-licPill">Attuale</span> : null}
        {highlight ? <span className="nb-licPill accent">Consigliato</span> : null}
        {founder && !current ? <span className="nb-licPill founder">Limited</span> : null}
      </div>
      <div className="nb-licPlanPrice">{price}</div>
      <div className="nb-licPlanPriceNote">{priceNote}</div>

      {extra}

      <ul className="nb-licFeatureList">
        {features.map((f) => (
          <li key={f} className="nb-licFeatureItem">
            <Check className="nb-licFeatureCheck" aria-hidden={true} />
            {f}
          </li>
        ))}
      </ul>

      <button
        type="button"
        className={clsx(
          "nb-licPlanCta",
          current && "isCurrent",
          highlight && "isPrimary",
          founder && !current && "isFounder"
        )}
        disabled={Boolean(ctaDisabled) || !onCta}
        onClick={onCta}
      >
        {cta}
      </button>
    </article>
  );
}

function LicField({ label, value }: { label: string; value: string }) {
  return (
    <div className="nb-licField">
      <span className="nb-licFieldLabel">{label}</span>
      <span className="nb-licFieldValue">{value}</span>
    </div>
  );
}

function QuickNote({ title, text }: { title: string; text: string }) {
  return (
    <div className="nb-licQuickNote">
      <div className="nb-licQuickNoteTitle">{title}</div>
      <p className="nb-licQuickNoteText">{text}</p>
    </div>
  );
}
