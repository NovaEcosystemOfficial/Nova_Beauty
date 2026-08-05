import {
  Activity,
  AlertTriangle,
  ArrowUpRight,
  BarChart3,
  CalendarDays,
  Euro,
  PackageSearch,
  Sparkles,
  Users
} from "lucide-react";
import clsx from "clsx";
import type { ComponentType, ReactNode } from "react";
import { useDemoWorkflow } from "../demo/DemoWorkflowContext";

type Tone = "primary" | "gold" | "mint" | "lavender";

function StatCard({
  label,
  value,
  helper,
  icon,
  tone,
  pulse
}: {
  label: string;
  value: string;
  helper: string;
  icon: ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  tone: Tone;
  pulse?: boolean;
}) {
  const Icon = icon;
  return (
    <section className={clsx("nb-statCard", `tone-${tone}`, pulse && "isPulse")}>
      <div className="nb-statTop">
        <div className="nb-statIconWrap">
          <Icon className="nb-statIcon" aria-hidden={true} />
        </div>
        <span className="nb-statTrend" aria-hidden="true">
          <ArrowUpRight className="nb-statTrendIcon" />
        </span>
      </div>
      <div className="nb-statLabel">{label}</div>
      <div className="nb-statValue" key={value}>
        {value}
      </div>
      <div className="nb-statHelper">{helper}</div>
    </section>
  );
}

function Panel({
  title,
  caption,
  icon,
  action,
  children
}: {
  title: string;
  caption?: string;
  icon: ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  action?: string;
  children: ReactNode;
}) {
  const Icon = icon;
  return (
    <section className="nb-panel">
      <div className="nb-panelHeader">
        <div className="nb-panelTitleWrap">
          <span className="nb-panelIconWrap">
            <Icon className="nb-panelIcon" aria-hidden={true} />
          </span>
          <div>
            <h2 className="nb-panelTitle">{title}</h2>
            {caption ? <p className="nb-panelCaption">{caption}</p> : null}
          </div>
        </div>
        {action ? (
          <button type="button" className="nb-panelAction" disabled>
            {action}
          </button>
        ) : null}
      </div>
      <div className="nb-panelBody">{children}</div>
    </section>
  );
}

const alerts = [
  { name: "Crema viso", level: "Scorta bassa", qty: "3 / min 8", severity: "low" },
  { name: "Gel refill", level: "Scorta bassa", qty: "2 / min 6", severity: "low" },
  { name: "Maschera", level: "Esaurito", qty: "0 / min 4", severity: "out" }
] as const;

export default function DemoDashboard() {
  const {
    appointmentsToday,
    revenueExpected,
    revenueCompleted,
    activities,
    appointments,
    inventoryScaledHint,
    reportsPulse
  } = useDemoWorkflow();

  const todayAgenda = appointments
    .filter((a) => a.dayOffset === 0 && a.status !== "annullato")
    .sort((a, b) => a.startMin - b.startMin)
    .slice(0, 6);

  return (
    <div className="nb-dashboard">
      <div className="nb-topStats">
        <StatCard
          label="Appuntamenti oggi"
          value={String(appointmentsToday)}
          helper="Workflow demo live"
          icon={CalendarDays}
          tone="primary"
          pulse
        />
        <StatCard
          label="Incasso oggi"
          value={`€${revenueCompleted || Math.min(revenueExpected, 240)}`}
          helper={
            revenueCompleted > 0
              ? `Completato €${revenueCompleted} · previsto €${revenueExpected}`
              : `Previsto €${revenueExpected}`
          }
          icon={Euro}
          tone="gold"
          pulse={revenueCompleted > 0}
        />
        <StatCard label="Clienti attivi" value="42" helper="5 nuovi questo mese" icon={Users} tone="mint" />
        <StatCard
          label="Prodotti da ordinare"
          value={inventoryScaledHint ? "7" : "6"}
          helper={inventoryScaledHint ? "Magazzino scalato · demo" : "3 sotto soglia critica"}
          icon={PackageSearch}
          tone="lavender"
          pulse={inventoryScaledHint}
        />
      </div>

      <div className="nb-middleGrid">
        <Panel title="Agenda di oggi" caption="Timeline operativa" icon={CalendarDays} action="Apri agenda">
          <div className="nb-timeline">
            {todayAgenda.map((row) => (
              <div key={row.id} className={clsx("nb-timelineItem", row.isNew && "isAppear")}>
                <div className="nb-timelineRail" aria-hidden="true">
                  <span className="nb-timelineDot" />
                </div>
                <div className="nb-timelineContent">
                  <div className="nb-timelineMeta">
                    <span className="nb-timelineTime">{row.timeLabel}</span>
                    <span
                      className={`nb-statusBadge tone-${
                        row.status === "confermato"
                          ? "mint"
                          : row.status === "da_confermare"
                            ? "gold"
                            : row.status === "completato"
                              ? "lavender"
                              : "primary"
                      }`}
                    >
                      {row.status.replace("_", " ")}
                    </span>
                  </div>
                  <div className="nb-timelineClient">{row.client}</div>
                  <div className="nb-timelineService">{row.service}</div>
                </div>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="Timeline attività" caption="Attività recenti" icon={Activity} action="Vedi tutte">
          <div className="nb-activityFeed">
            {activities.map((row) => (
              <div key={row.id} className={clsx("nb-activityFeedItem", row.isNew && "isAppear")}>
                <span className="nb-activityFeedTime">{row.time}</span>
                <span className="nb-activityFeedDot" aria-hidden="true" />
                <span className="nb-activityFeedText">{row.text}</span>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="Alert magazzino" caption="Scorte critiche" icon={AlertTriangle} action="Da ordinare">
          <div className="nb-alertList">
            {alerts.map((row) => (
              <div key={row.name} className={`nb-alertItem severity-${row.severity}`}>
                <div className="nb-alertCopy">
                  <div className="nb-alertName">{row.name}</div>
                  <div className="nb-alertQty">{row.qty}</div>
                </div>
                <span className="nb-alertBadge">{row.level}</span>
              </div>
            ))}
            {inventoryScaledHint ? (
              <div className="nb-alertItem severity-low isAppear">
                <div className="nb-alertCopy">
                  <div className="nb-alertName">Scarico demo</div>
                  <div className="nb-alertQty">Prodotto usato in trattamento</div>
                </div>
                <span className="nb-alertBadge">Aggiornato</span>
              </div>
            ) : null}
          </div>
        </Panel>
      </div>

      <section className={clsx("nb-analytics", reportsPulse && "isPulse")}>
        <div className="nb-analyticsGlow" aria-hidden="true" />
        <div className="nb-analyticsInner">
          <span className="nb-analyticsIconWrap">
            <BarChart3 className="nb-analyticsIcon" aria-hidden="true" />
          </span>
          <div className="nb-analyticsCopy">
            <h2 className="nb-analyticsTitle">
              {reportsPulse ? "Report aggiornati" : "Analytics in arrivo"}
            </h2>
            <p className="nb-analyticsText">
              {reportsPulse
                ? "Incassi, storico cliente e fidelity aggiornati dalla demo Completa."
                : "Qui arriveranno report, trend e insight professionali per il tuo studio."}
            </p>
          </div>
          <span className="nb-analyticsTag">
            <Sparkles className="nb-analyticsTagIcon" aria-hidden="true" />
            {reportsPulse ? "Live demo" : "Placeholder"}
          </span>
        </div>
      </section>
    </div>
  );
}
