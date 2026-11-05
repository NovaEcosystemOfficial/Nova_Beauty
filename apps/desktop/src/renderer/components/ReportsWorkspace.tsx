import {
  AlertTriangle,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Download,
  Euro,
  FileSpreadsheet,
  FileText,
  Lightbulb,
  Package,
  Printer,
  Sparkles,
  TrendingUp,
  UserPlus,
  Users
} from "lucide-react";
import clsx from "clsx";
import { useEffect, useMemo, useState } from "react";
import { useDemoWorkflow } from "../demo/DemoWorkflowContext";
import { listProducts } from "../data/inventoryApi";
import {
  buildReportDataset,
  isInReportWindow,
  type ReportDataset,
  type ReportPeriod
} from "../utils/reportDataset";
import {
  exportCsvFile,
  exportReportPdf,
  exportSimplePdf,
  exportWorkbook,
  printReportA4,
  reportDateStamp,
  type FilterMeta
} from "../utils/reportExport";

type Period = ReportPeriod;

const PERIODS: Array<{ id: Period; label: string }> = [
  { id: "oggi", label: "Oggi" },
  { id: "settimana", label: "Settimana" },
  { id: "mese", label: "Mese" },
  { id: "anno", label: "Anno" }
];

const ALL_OPERATORS = "Tutti";
const ALL_CABINS = "Tutte";
const ALL_SERVICES = "Tutti";

const CHART_META = [
  {
    id: "incassi",
    title: "Incassi nel tempo",
    caption: "Incasso dei completati, per giorno",
    kind: "line" as const
  },
  {
    id: "servizi",
    title: "Servizi più venduti",
    caption: "Quota sul totale del periodo",
    kind: "bars" as const
  },
  {
    id: "acquisiti",
    title: "Clienti acquisiti",
    caption: "Nuove schede nel periodo",
    kind: "area" as const
  },
  {
    id: "pagamenti",
    title: "Incasso registrato",
    caption: "Solo gli appuntamenti completati",
    kind: "donut" as const
  },
  {
    id: "occupazione",
    title: "Occupazione agenda",
    caption: "Fasce orarie più richieste",
    kind: "heat" as const
  },
  {
    id: "operatori",
    title: "Operatori",
    caption: "Carico e produttività",
    kind: "columns" as const
  }
];

function euro(n: number): string {
  return `€${n.toLocaleString("it-IT", { maximumFractionDigits: 0 })}`;
}

function presentReport(source: ReportDataset) {
  const incasso = source.completedCount ? source.incassoCompleted : source.incassoExpected;
  const ticket = Math.round(source.averageTicket);
  const kpi = [
    {
      id: "incasso",
      label: "Incasso",
      value: euro(Math.round(incasso)),
      raw: Math.round(incasso),
      delta: source.completedCount ? "fatto" : "previsto",
      hint: source.completedCount ? "appuntamenti completati" : "ancora da completare",
      icon: Euro,
      tone: "rose" as const
    },
    {
      id: "appt",
      label: "Appuntamenti",
      value: String(source.appointmentCount),
      raw: source.appointmentCount,
      delta: String(source.completedCount),
      hint: "completati nel periodo",
      icon: CalendarDays,
      tone: "mint" as const
    },
    {
      id: "clienti",
      label: "Nuovi clienti",
      value: String(source.newClients),
      raw: source.newClients,
      delta: "—",
      hint: "stato nuovo in anagrafica",
      icon: UserPlus,
      tone: "gold" as const
    },
    {
      id: "ticket",
      label: "Ticket medio",
      value: euro(ticket),
      raw: ticket,
      delta: "—",
      hint: source.completedCount ? "sui completati" : "sul previsto",
      icon: TrendingUp,
      tone: "lavender" as const
    },
    {
      id: "ore",
      label: "Ore in agenda",
      value: `${source.hours.toFixed(1).replace(".", ",")}h`,
      raw: source.hours,
      delta: "—",
      hint: "durata degli appuntamenti",
      icon: Clock3,
      tone: "slate" as const
    },
    {
      id: "prodotti",
      label: "Sotto scorta",
      value: String(source.magazzinoRows.filter((row) => row[3] !== "ok").length),
      raw: source.magazzinoRows.filter((row) => row[3] !== "ok").length,
      delta: "—",
      hint: "prodotti da ordinare",
      icon: Package,
      tone: "rose" as const
    }
  ];

  return {
    kpi,
    incassiRows: source.incassiRows,
    serviziRows: source.serviziRows,
    acquisitiRows: source.acquisitiRows,
    pagamentiRows: source.pagamentiRows,
    occupazioneRows: source.occupazioneRows,
    operatoriRows: source.operatoriRows,
    rankings: [
      { id: "clienti", title: "Top clienti", rows: source.topClienti },
      { id: "servizi", title: "Top servizi", rows: source.topServizi },
      { id: "prodotti", title: "Scorte da ordinare", rows: source.topProdotti },
      { id: "operatori", title: "Operatori", rows: source.topOperatori }
    ],
    magazzinoRows: source.magazzinoRows,
    clientiSheet: source.topClienti.map((row) => [row.rank, row.name, row.value]),
    serviziSheet: source.topServizi.map((row) => [row.rank, row.name, row.value]),
    operatoriSheet: source.operatoriRows.map((row) => [row[0], row[1], row[2], row[3]]),
    health: source.health
  };
}

export default function ReportsWorkspace() {
  const { reportsPulse, appointments, clients, pushToast } = useDemoWorkflow();
  const [period, setPeriod] = useState<Period>("settimana");
  const [operator, setOperator] = useState(ALL_OPERATORS);
  const [cabin, setCabin] = useState(ALL_CABINS);
  const [service, setService] = useState(ALL_SERVICES);
  const [products, setProducts] = useState<Array<{ name: string; quantity: number; minQuantity: number }>>(
    []
  );

  const periodLabel = PERIODS.find((p) => p.id === period)?.label ?? period;
  const operatorOptions = useMemo(
    () => [ALL_OPERATORS, ...new Set(appointments.map((item) => item.operator).filter(Boolean))],
    [appointments]
  );
  const cabinOptions = useMemo(
    () => [ALL_CABINS, ...new Set(appointments.map((item) => item.cabin).filter(Boolean))],
    [appointments]
  );
  const serviceOptions = useMemo(
    () => [ALL_SERVICES, ...new Set(appointments.map((item) => item.service).filter(Boolean))],
    [appointments]
  );

  const meta: FilterMeta = useMemo(
    () => ({ periodLabel, operator, cabin, service }),
    [periodLabel, operator, cabin, service]
  );

  useEffect(() => {
    void (async () => {
      const result = await listProducts();
      if (!result.ok) return;
      setProducts(
        result.data.map((product) => ({
          name: product.name,
          quantity: product.quantity,
          minQuantity: product.minQuantity
        }))
      );
    })();
  }, []);

  const data = useMemo(
    () =>
      presentReport(
        buildReportDataset({
          appointments,
          clients,
          products,
          period,
          operator,
          cabin,
          service
        })
      ),
    [appointments, cabin, clients, operator, period, products, service]
  );
  const health = data.health;

  const timeline = useMemo(
    () =>
      appointments
        .filter(
          (appointment) =>
            isInReportWindow(appointment, appointments, period) &&
            (operator === ALL_OPERATORS || appointment.operator === operator) &&
            (cabin === ALL_CABINS || appointment.cabin === cabin) &&
            (service === ALL_SERVICES || appointment.service === service)
        )
        .sort((a, b) => b.dayOffset - a.dayOffset || b.startMin - a.startMin)
        .slice(0, 8)
        .map((appointment) => ({
          id: appointment.id,
          time: appointment.timeLabel,
          text: `${
            appointment.status === "completato"
              ? "Completato"
              : appointment.status === "annullato"
                ? "Annullato"
                : "In agenda"
          } · ${appointment.client} · ${appointment.service}`
        })),
    [appointments, cabin, operator, period, service]
  );

  const insights = useMemo(() => {
    const topService = data.serviziRows[0];
    const topOperator = data.operatoriRows[0];
    const lowStock = data.magazzinoRows.filter((row) => row[3] !== "ok").length;
    return [
      {
        title: "Servizio",
        text: topService
          ? `${topService[0]} · ${topService[1]} appuntamenti (${topService[2]})`
          : "Nessun servizio nel periodo",
        icon: TrendingUp
      },
      {
        title: "Operatore",
        text: topOperator
          ? `${topOperator[0]} · ${euro(Number(topOperator[1]))} · ${topOperator[2]} appuntamenti`
          : "Nessun operatore nel periodo",
        icon: Users
      },
      {
        title: "Magazzino",
        text: lowStock
          ? `${lowStock} prodotti sotto la scorta minima`
          : "Nessun prodotto sotto scorta",
        icon: Package
      },
      {
        title: "Agenda",
        text: health.lines[2] ?? "Nessun annullamento",
        icon: CalendarDays
      }
    ];
  }, [data.magazzinoRows, data.operatoriRows, data.serviziRows, health.lines]);

  const HealthIcon =
    health.tone === "ottimo"
      ? CheckCircle2
      : health.tone === "attenzione"
        ? AlertTriangle
        : AlertTriangle;

  const stamp = reportDateStamp();

  const onExportPdf = () => {
    exportReportPdf({
      title: "NovaBeauty · Report Center",
      meta,
      filename: `Report_${stamp}.pdf`,
      sections: [
        {
          heading: "KPI",
          headers: ["Indicatore", "Valore", "Delta"],
          rows: data.kpi.map((k) => [k.label, k.value, k.delta])
        },
        {
          heading: "Business Health",
          headers: ["Stato", "Nota"],
          rows: [[health.title, health.lines.join(" · ")]]
        },
        {
          heading: "Incassi nel tempo",
          headers: ["Giorno", "Incasso €"],
          rows: data.incassiRows
        },
        {
          heading: "Servizi più venduti",
          headers: ["Servizio", "Vendite", "Quota"],
          rows: data.serviziRows
        },
        {
          heading: "Incasso registrato",
          headers: ["Metodo", "Importo €", "Quota"],
          rows: data.pagamentiRows
        },
        {
          heading: "Occupazione agenda",
          headers: ["Fascia", "Occupazione", "%"],
          rows: data.occupazioneRows.map((r) => [r[0], r[1], r[2]])
        },
        {
          heading: "Operatori",
          headers: ["Operatore", "Incasso €", "Appuntamenti"],
          rows: data.operatoriRows.map((row) => [row[0], row[1], row[2]])
        },
        {
          heading: "Top Clienti",
          headers: ["#", "Cliente", "Valore €"],
          rows: data.clientiSheet
        },
        {
          heading: "Top Servizi",
          headers: ["#", "Servizio", "Vendite"],
          rows: data.serviziSheet
        },
        {
          heading: "Scorte da ordinare",
          headers: ["#", "Prodotto", "Priorità"],
          rows: data.rankings[2].rows.map((r) => [r.rank, r.name, r.value])
        },
        {
          heading: "Top Operatori",
          headers: ["#", "Operatore", "Incasso €"],
          rows: data.rankings[3].rows.map((r) => [r.rank, r.name, r.value])
        }
      ]
    });
    pushToast(`PDF esportato · Report_${stamp}.pdf`);
  };

  const onExportExcel = () => {
    exportWorkbook({
      filename: `Report_${stamp}.xlsx`,
      sheets: [
        {
          name: "KPI",
          headers: ["Indicatore", "Valore", "Numerico", "Delta", "Periodo", "Operatore", "Cabina", "Servizio"],
          rows: data.kpi.map((k) => [
            k.label,
            k.value,
            k.raw,
            k.delta,
            periodLabel,
            operator,
            cabin,
            service
          ])
        },
        {
          name: "Clienti",
          headers: ["Rank", "Cliente", "Valore €"],
          rows: data.clientiSheet
        },
        {
          name: "Servizi",
          headers: ["Servizio", "Vendite", "Quota"],
          rows: data.serviziRows
        },
        {
          name: "Operatori",
          headers: ["Operatore", "Incasso €", "Appuntamenti"],
          rows: data.operatoriRows.map((row) => [row[0], row[1], row[2]])
        },
        {
          name: "Magazzino",
          headers: ["Prodotto", "Giacenza", "Minimo", "Stato"],
          rows: data.magazzinoRows
        }
      ]
    });
    pushToast(`Excel esportato · Report_${stamp}.xlsx`);
  };

  const onPrint = () => {
    printReportA4();
    pushToast("Finestra di stampa aperta · layout A4");
  };

  const exportWidget = (chartId: string) => {
    const base = `${chartId}_${stamp}`;
    switch (chartId) {
      case "incassi":
        exportCsvFile(`${base}.csv`, ["Giorno", "Incasso €"], data.incassiRows);
        exportSimplePdf({
          title: "Incassi nel tempo",
          meta,
          filename: `${base}.pdf`,
          headers: ["Giorno", "Incasso €"],
          rows: data.incassiRows
        });
        pushToast("Esportato Incassi · PDF + CSV");
        break;
      case "servizi":
        exportCsvFile(`${base}.csv`, ["Servizio", "Vendite", "Quota"], data.serviziRows);
        pushToast("Esportato elenco servizi · CSV");
        break;
      case "acquisiti":
        exportCsvFile(`${base}.csv`, ["Giorno", "Nuovi clienti"], data.acquisitiRows);
        pushToast("Esportati clienti acquisiti · CSV");
        break;
      case "pagamenti":
        exportCsvFile(`${base}.csv`, ["Metodo", "Importo €", "Quota"], data.pagamentiRows);
        pushToast("Esportata tabella pagamenti · CSV");
        break;
      case "occupazione":
        exportCsvFile(
          `${base}.csv`,
          ["Fascia", "Occupazione", "%"],
          data.occupazioneRows.map((r) => [r[0], r[1], r[2]])
        );
        pushToast("Esportata occupazione agenda · CSV");
        break;
      case "operatori":
        exportCsvFile(
          `${base}.csv`,
          ["Operatore", "Incasso €", "Appuntamenti"],
          data.operatoriRows.map((row) => [row[0], row[1], row[2]])
        );
        pushToast("Esportate statistiche operatori · CSV");
        break;
      default:
        pushToast("Nessun dato da esportare");
    }
  };

  return (
    <div
      className={clsx("nb-reportsWs", reportsPulse && "isPulse")}
      role="region"
      aria-label="Report Center"
    >
      <header className="nb-rpHead">
        <div className="nb-rpHeadIntro">
          <div className="nb-rpEyebrow">
            <Sparkles className="nb-rpEyebrowIcon" aria-hidden={true} />
            Report Center
          </div>
          <h2 className="nb-rpTitle">Andamento del centro estetico</h2>
          <p className="nb-rpSub">
            Report sugli appuntamenti salvati · {data.kpi[1]?.value ?? "0"} nel periodo selezionato
          </p>
        </div>

        <div className="nb-rpActions nb-noPrint">
          <button type="button" className="nb-rpGhostBtn" onClick={onExportPdf}>
            <FileText className="nb-rpBtnIcon" aria-hidden={true} />
            Esporta PDF
          </button>
          <button type="button" className="nb-rpGhostBtn" onClick={onExportExcel}>
            <FileSpreadsheet className="nb-rpBtnIcon" aria-hidden={true} />
            Esporta Excel
          </button>
          <button type="button" className="nb-rpPrimaryBtn" onClick={onPrint}>
            <Printer className="nb-rpBtnIcon" aria-hidden={true} />
            Stampa
          </button>
        </div>
      </header>

      <div className="nb-rpToolbar nb-noPrint">
        <div className="nb-rpPeriod" role="tablist" aria-label="Periodo">
          {PERIODS.map((p) => (
            <button
              key={p.id}
              type="button"
              role="tab"
              aria-selected={period === p.id}
              className={clsx("nb-rpPeriodBtn", period === p.id && "isActive")}
              onClick={() => setPeriod(p.id)}
            >
              {p.label}
            </button>
          ))}
        </div>

        <div className="nb-rpFilters">
          <label className="nb-rpFilter">
            <span>Operatore</span>
            <select value={operator} onChange={(e) => setOperator(e.target.value)}>
              {operatorOptions.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
          </label>
          <label className="nb-rpFilter">
            <span>Cabina</span>
            <select value={cabin} onChange={(e) => setCabin(e.target.value)}>
              {cabinOptions.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>
          <label className="nb-rpFilter">
            <span>Servizio</span>
            <select value={service} onChange={(e) => setService(e.target.value)}>
              {serviceOptions.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      <p className="nb-rpFilterSummary nb-printOnly">
        Filtri · {periodLabel} · {operator} · {cabin} · {service}
      </p>

      <section className="nb-rpSection" aria-labelledby="rp-panorama">
        <SectionHead
          id="rp-panorama"
          title="Panoramica"
          caption="KPI chiave del periodo selezionato"
        />
        <div className="nb-rpKpiGrid">
          {data.kpi.map((k, i) => {
            const Icon = k.icon;
            return (
              <article
                key={k.id}
                className={clsx("nb-rpKpi", `tone-${k.tone}`)}
                style={{ animationDelay: `${i * 50}ms` }}
              >
                <div className="nb-rpKpiTop">
                  <span className="nb-rpKpiIcon">
                    <Icon aria-hidden={true} />
                  </span>
                  <span className="nb-rpKpiDelta">{k.delta}</span>
                </div>
                <div className="nb-rpKpiLabel">{k.label}</div>
                <div className="nb-rpKpiValue">{k.value}</div>
                <div className="nb-rpKpiHint">{k.hint}</div>
              </article>
            );
          })}
        </div>
      </section>

      <section className="nb-rpSection" aria-labelledby="rp-health">
        <SectionHead
          id="rp-health"
          title="Business Health"
          caption="Stato di salute del centro in un colpo d’occhio"
        />
        <article className={clsx("nb-rpHealth", `is-${health.tone}`)}>
          <div className="nb-rpHealthStatus">
            <span className="nb-rpHealthDot" aria-hidden={true} />
            <div>
              <div className="nb-rpHealthLabel">Stato</div>
              <h3 className="nb-rpHealthTitle">
                <HealthIcon className="nb-rpHealthIcon" aria-hidden={true} />
                {health.title}
              </h3>
            </div>
          </div>
          <ul className="nb-rpHealthLines">
            {health.lines.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
          <p className="nb-rpHealthFoot">
            Sintesi del periodo · {periodLabel} · {operator} · {cabin} · {service}
          </p>
        </article>
      </section>

      <section className="nb-rpSection" aria-labelledby="rp-charts">
        <SectionHead
          id="rp-charts"
          title="Grafici"
          caption="Le altezze e le quote seguono i totali del periodo."
        />
        <div className="nb-rpChartGrid">
          {CHART_META.map((c) => (
            <article key={c.id} className="nb-rpChartCard">
              <header className="nb-rpChartHead">
                <div>
                  <h3 className="nb-rpChartTitle">{c.title}</h3>
                  <p className="nb-rpChartCap">{c.caption}</p>
                </div>
                <button
                  type="button"
                  className="nb-rpChartAction nb-noPrint"
                  onClick={() => exportWidget(c.id)}
                >
                  <Download className="nb-rpBtnIcon" aria-hidden={true} />
                  Esporta
                </button>
              </header>
              <div className="nb-rpChartBody">
                <ChartPlaceholder kind={c.kind} series={seriesForChart(c.id, data)} />
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="nb-rpSection" aria-labelledby="rp-ranks">
        <SectionHead id="rp-ranks" title="Classifiche" caption="Top performer del periodo" />
        <div className="nb-rpRankGrid">
          {data.rankings.map((block) => (
            <article key={block.title} className="nb-rpRankCard">
              <div className="nb-rpChartHead">
                <h3 className="nb-rpRankTitle">{block.title}</h3>
                <button
                  type="button"
                  className="nb-rpChartAction nb-noPrint"
                  onClick={() => {
                    exportCsvFile(
                      `${block.id}_${stamp}.csv`,
                      ["#", "Nome", "Valore"],
                      block.rows.map((r) => [r.rank, r.name, r.value])
                    );
                    pushToast(`Esportata ${block.title} · CSV`);
                  }}
                >
                  <Download className="nb-rpBtnIcon" aria-hidden={true} />
                  Esporta
                </button>
              </div>
              {block.rows.length === 0 ? (
                <p className="nb-rpRankMeta">Nessun dato nel periodo</p>
              ) : (
                <ol className="nb-rpRankList">
                  {block.rows.map((row) => (
                    <li key={row.name} className="nb-rpRankRow">
                      <span className={clsx("nb-rpRankBadge", row.rank <= 3 && "isTop")}>
                        {row.rank}
                      </span>
                      <span className="nb-rpRankName">{row.name}</span>
                      <span className="nb-rpRankMeta">{row.meta}</span>
                    </li>
                  ))}
                </ol>
              )}
            </article>
          ))}
        </div>
      </section>

      <section className="nb-rpSection" aria-labelledby="rp-timeline">
        <SectionHead
          id="rp-timeline"
          title="Timeline"
          caption="Appuntamenti del periodo selezionato"
        />
        <div className="nb-rpTimeline">
          {timeline.length === 0 ? (
            <p className="nb-rpRankMeta">Nessun appuntamento nel periodo</p>
          ) : (
            timeline.map((item, i) => (
              <div
                key={item.id}
                className="nb-rpTimelineItem"
                style={{ animationDelay: `${i * 40}ms` }}
              >
                <span className="nb-rpTimelineTime">{item.time}</span>
                <span className="nb-rpTimelineDot" aria-hidden={true} />
                <span className="nb-rpTimelineText">{item.text}</span>
              </div>
            ))
          )}
        </div>
      </section>

      <section className="nb-rpSection nb-rpSection--last" aria-labelledby="rp-insight">
        <SectionHead
          id="rp-insight"
          title="Insight"
          caption="Lettura dei numeri del periodo"
        />
        <div className="nb-rpInsightGrid">
          {insights.map((ins) => {
            const Icon = ins.icon;
            return (
              <article key={ins.title} className="nb-rpInsight">
                <span className="nb-rpInsightIcon">
                  <Icon aria-hidden={true} />
                </span>
                <div>
                  <h3 className="nb-rpInsightTitle">{ins.title}</h3>
                  <p className="nb-rpInsightText">{ins.text}</p>
                </div>
                <Lightbulb className="nb-rpInsightHint" aria-hidden={true} />
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function SectionHead({
  id,
  title,
  caption
}: {
  id: string;
  title: string;
  caption: string;
}) {
  return (
    <div className="nb-rpSectionHead">
      <h2 id={id} className="nb-rpSectionTitle">
        {title}
      </h2>
      <p className="nb-rpSectionCap">{caption}</p>
    </div>
  );
}

type ChartPoint = { label: string; value: number };

function seriesForChart(
  id: string,
  source: {
    incassiRows: Array<[string, number]>;
    serviziRows: Array<[string, number, string]>;
    acquisitiRows: Array<[string, number]>;
    pagamentiRows: Array<[string, number, string]>;
    occupazioneRows: Array<[string, string, number]>;
    operatoriRows: Array<[string, number, number, string]>;
  }
): ChartPoint[] {
  switch (id) {
    case "incassi":
      return source.incassiRows.map(([label, value]) => ({ label, value }));
    case "servizi":
      return source.serviziRows.map(([label, value]) => ({ label, value }));
    case "acquisiti":
      return source.acquisitiRows.map(([label, value]) => ({ label, value }));
    case "pagamenti":
      return source.pagamentiRows.map(([label, value]) => ({ label, value }));
    case "occupazione":
      return source.occupazioneRows.map(([label, , value]) => ({ label, value }));
    case "operatori":
      return source.operatoriRows.map(([label, value]) => ({ label, value }));
    default:
      return [];
  }
}

function chartLine(series: ChartPoint[]) {
  const max = Math.max(1, ...series.map((point) => point.value));
  const points = series.map((point, index) => {
    const x = series.length === 1 ? 180 : (index / (series.length - 1)) * 360;
    const y = 120 - (point.value / max) * 90;
    return { ...point, x, y };
  });
  const line = points
    .map((point, index) => `${index === 0 ? "M" : "L"}${point.x.toFixed(1)} ${point.y.toFixed(1)}`)
    .join(" ");
  const area =
    points.length > 0
      ? `${line} L${points[points.length - 1].x.toFixed(1)} 140 L${points[0].x.toFixed(1)} 140 Z`
      : "";
  return { points, line, area };
}

function ChartPlaceholder({
  kind,
  series
}: {
  kind: "line" | "bars" | "area" | "donut" | "heat" | "columns";
  series: ChartPoint[];
}) {
  const visible = series.filter((point) => point.value > 0);
  if (visible.length === 0) {
    return <p className="nb-rpRankMeta">Nessun dato nel periodo</p>;
  }

  if (kind === "line" || kind === "area") {
    const geometry = chartLine(visible);
    return (
      <svg className="nb-rpSvg" viewBox="0 0 360 140" preserveAspectRatio="none" role="img">
        <title>
          {visible.map((point) => `${point.label} ${point.value}`).join(", ")}
        </title>
        <defs>
          <linearGradient id={`rp-grad-${kind}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(196,138,151,0.35)" />
            <stop offset="100%" stopColor="rgba(196,138,151,0)" />
          </linearGradient>
        </defs>
        <path className="nb-rpSvgGrid" d="M0 35 H360 M0 70 H360 M0 105 H360" />
        {kind === "area" ? <path fill={`url(#rp-grad-${kind})`} d={geometry.area} /> : null}
        <path className="nb-rpSvgLine" fill="none" d={geometry.line} />
        {geometry.points.map((point) => (
          <circle key={point.label} className="nb-rpSvgDot" cx={point.x} cy={point.y} r="3.5">
            <title>
              {point.label} · {point.value}
            </title>
          </circle>
        ))}
      </svg>
    );
  }

  if (kind === "donut") {
    const total = visible.reduce((sum, point) => sum + point.value, 0) || 1;
    return (
      <div className="nb-rpDonutWrap">
        <svg className="nb-rpDonut" viewBox="0 0 120 120" aria-hidden={true}>
          <circle className="nb-rpDonutTrack" cx="60" cy="60" r="42" />
          <circle className="nb-rpDonutSeg s1" cx="60" cy="60" r="42" />
        </svg>
        <div className="nb-rpDonutLegend">
          {visible.map((point, index) => (
            <span key={point.label}>
              <i className={index % 2 === 0 ? "t1" : "t2"} /> {point.label}{" "}
              {Math.round((point.value / total) * 100)}%
            </span>
          ))}
        </div>
      </div>
    );
  }

  if (kind === "heat") {
    const max = Math.max(1, ...visible.map((point) => point.value));
    return (
      <div className="nb-rpHeat">
        {visible.map((point) => (
          <span
            key={point.label}
            title={`${point.label} · ${point.value}%`}
            style={{ opacity: 0.25 + (point.value / max) * 0.75 }}
          />
        ))}
      </div>
    );
  }

  const max = Math.max(1, ...visible.map((point) => point.value));
  return (
    <div className={clsx("nb-rpBars", kind === "columns" && "isColumns")}>
      {visible.map((point, index) => (
        <span
          key={point.label}
          title={`${point.label} · ${point.value}`}
          style={{
            height: `${Math.max(8, Math.round((point.value / max) * 100))}%`,
            animationDelay: `${index * 60}ms`
          }}
        />
      ))}
    </div>
  );
}
