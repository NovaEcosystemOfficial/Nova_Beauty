import {
  ArrowLeft,
  Bell,
  Check,
  Cloud,
  CreditCard,
  Info,
  KeyRound,
  Palette,
  PartyPopper,
  Plug,
  Rocket,
  Settings,
  Shield,
  Sparkles,
  UserRound
} from "lucide-react";
import clsx from "clsx";
import { useCallback, useState, type ComponentType, type ReactNode } from "react";
import FounderCeremony from "./FounderCeremony";

type SettingsSection =
  | "generale"
  | "account"
  | "licenza"
  | "backup"
  | "aspetto"
  | "notifiche"
  | "integrazioni"
  | "informazioni";

type LicenseView = "status" | "plans" | "founder";

const SETTINGS_MENU: Array<{
  id: SettingsSection;
  label: string;
  icon: ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
}> = [
  { id: "generale", label: "Generale", icon: Settings },
  { id: "account", label: "Account", icon: UserRound },
  { id: "licenza", label: "Licenza", icon: KeyRound },
  { id: "backup", label: "Backup", icon: Cloud },
  { id: "aspetto", label: "Aspetto", icon: Palette },
  { id: "notifiche", label: "Notifiche", icon: Bell },
  { id: "integrazioni", label: "Integrazioni", icon: Plug },
  { id: "informazioni", label: "Informazioni", icon: Info }
];

export default function SettingsWorkspace() {
  const [section, setSection] = useState<SettingsSection>("licenza");
  const [licenseView, setLicenseView] = useState<LicenseView>("status");
  const [ceremonyActive, setCeremonyActive] = useState(false);
  const [isFounderDemo, setIsFounderDemo] = useState(false);
  const [founderSlots, setFounderSlots] = useState(83);

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
        ) : (
          <SettingsPlaceholder section={section} />
        )}
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
          ctaDisabled
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
          ctaDisabled
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
          ctaDisabled={isFounderDemo}
          onCta={isFounderDemo ? undefined : onFounder}
        />
      </div>
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
        disabled={ctaDisabled && !onCta}
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

function SettingsPlaceholder({ section }: { section: SettingsSection }) {
  const copy: Record<Exclude<SettingsSection, "licenza">, { title: string; text: string }> = {
    generale: {
      title: "Generale",
      text: "Lingua, formato data, densità UI e preferenze studio. Placeholder."
    },
    account: {
      title: "Account",
      text: "Profilo titolare, email e sicurezza. Nessuna autenticazione in questo sprint."
    },
    backup: {
      title: "Backup",
      text: "Esportazioni e ripristino. Funzione collegata al piano Pro in futuro."
    },
    aspetto: {
      title: "Aspetto",
      text: "Tema, accenti e layout. Placeholder UI."
    },
    notifiche: {
      title: "Notifiche",
      text: "Reminder, email e avvisi desktop. Placeholder UI."
    },
    integrazioni: {
      title: "Integrazioni",
      text: "WhatsApp, calendari e POS. Disponibili con Pro."
    },
    informazioni: {
      title: "Informazioni",
      text: "NovaBeauty Desktop · versione demo · License Center UI ready."
    }
  };

  const item = copy[section as Exclude<SettingsSection, "licenza">];

  return (
    <div className="nb-setPlaceholder">
      <div className="nb-setPlaceholderInner">
        <CreditCard className="nb-setPlaceholderIcon" aria-hidden={true} />
        <h2 className="nb-setPlaceholderTitle">{item.title}</h2>
        <p className="nb-setPlaceholderText">{item.text}</p>
      </div>
    </div>
  );
}
