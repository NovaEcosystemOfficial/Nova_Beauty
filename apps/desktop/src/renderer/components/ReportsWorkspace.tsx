import {
  AlertTriangle,
  BarChart3,
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
import { useMemo, useState } from "react";
import { useDemoWorkflow } from "../demo/DemoWorkflowContext";
import {
  exportCsvFile,
  exportReportPdf,
  exportSimplePdf,
  exportWorkbook,
  printReportA4,
  reportDateStamp,
  type FilterMeta
} from "../utils/reportExport";

type Period = "oggi" | "settimana" | "mese" | "anno" | "personalizzato";
type HealthTone = "ottimo" | "attenzione" | "critico";

const PERIODS: Array<{ id: Period; label: string }> = [
  { id: "oggi", label: "Oggi" },
  { id: "settimana", label: "Settimana" },
  { id: "mese", label: "Mese" },
  { id: "anno", label: "Anno" },
  { id: "personalizzato", label: "Personalizzato" }
];

const OPERATORS = ["Tutti", "Fabio", "Laura", "Chiara"];
const CABINS = ["Tutte", "Cabina 1", "Cabina 2", "Cabina 3"];
const SERVICES = [
  "Tutti",
  "Pulizia viso deep",
  "Massaggio rilassante",
  "Epilazione gambe",
  "Peeling enzimatico",
  "Pressoterapia"
];

const PERIOD_FACTOR: Record<Period, number> = {
  oggi: 0.18,
  settimana: 1,
  mese: 3.8,
  anno: 42,
  personalizzato: 0.7
};

const HEALTH: Record<Period, { tone: HealthTone; title: string; lines: string[] }> = {
  oggi: {
    tone: "ottimo",
    title: "Ottimo",
    lines: [
      "Incasso giornata sopra media (+11%)",
      "Agenda piena al 78% fino alle 18:00",
      "Nessuna scorta critica aperta oggi"
    ]
  },
  settimana: {
    tone: "ottimo",
    title: "Ottimo",
    lines: [
      "Incasso +14% rispetto alla settimana scorsa",
      "Hai 6 clienti da ricontattare",
      "3 prodotti sotto scorta"
    ]
  },
  mese: {
    tone: "attenzione",
    title: "Attenzione",
    lines: [
      "Incasso +6% rispetto al mese scorso",
      "5 clienti non tornano da oltre 90 giorni",
      "Occupazione cabine al 72% — margine migliorabile"
    ]
  },
  anno: {
    tone: "ottimo",
    title: "Ottimo",
    lines: [
      "Crescita annua solidale (+18% YoY)",
      "Ticket medio in aumento costante",
      "Retention clienti VIP stabile"
    ]
  },
  personalizzato: {
    tone: "critico",
    title: "Critico",
    lines: [
      "Intervallo selezionato con calo −9% vs benchmark",
      "Cancellazioni sopra soglia (12%)",
      "Rivedi pricing e slot serali"
    ]
  }
};

const CHART_META = [
  {
    id: "incassi",
    title: "Incassi nel tempo",
    caption: "Andamento giornaliero · demo",
    kind: "line" as const
  },
  {
    id: "servizi",
    title: "Servizi più venduti",
    caption: "Quote sul totale · demo",
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
    title: "Metodo di pagamento",
    caption: "Ripartizione incassi",
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

const INSIGHTS = [
  {
    title: "Picco settimanale",
    text: "Il martedì è il giorno con più appuntamenti.",
    icon: CalendarDays
  },
  {
    title: "Trend servizio",
    text: 'Il servizio "Pulizia Viso" è cresciuto del 18%.',
    icon: TrendingUp
  },
  {
    title: "Cabine",
    text: "Le cabine risultano occupate per il 72%.",
    icon: BarChart3
  },
  {
    title: "Retention",
    text: "5 clienti non tornano da oltre 90 giorni.",
    icon: Users
  }
];

const FALLBACK_ACTIVITY = [
  { id: "r1", time: "17:20", text: "Pagamento registrato · €65 · Carta" },
  { id: "r2", time: "16:45", text: "Appuntamento prenotato · Giulia Rossi" },
  { id: "r3", time: "15:10", text: "Nuovo cliente creato · Chiara Ferri" },
  { id: "r4", time: "14:02", text: "Prodotto scaricato · Siero vitamina C" },
  { id: "r5", time: "12:30", text: "Pagamento registrato · €55 · Contanti" },
  { id: "r6", time: "11:05", text: "Appuntamento completato · Massaggio" },
  { id: "r7", time: "10:15", text: "Magazzino · carico Crema viso" },
  { id: "r8", time: "09:40", text: "Nuovo appuntamento · Sara Bianchi" }
];

function euro(n: number): string {
  return `€${n.toLocaleString("it-IT", { maximumFractionDigits: 0 })}`;
}

function filterScale(operator: string, cabin: string, service: string): number {
  let s = 1;
  if (operator !== "Tutti") s *= 0.42;
  if (cabin !== "Tutte") s *= 0.55;
  if (service !== "Tutti") s *= 0.38;
  return s;
}

function buildDataset(
  period: Period,
  operator: string,
  cabin: string,
  service: string
) {
  const pf = PERIOD_FACTOR[period];
  const fs = filterScale(operator, cabin, service);
  const m = pf * fs;

  const incasso = Math.round(4280 * m);
  const appt = Math.max(1, Math.round(86 * m));
  const nuovi = Math.max(0, Math.round(12 * m));
  const ticket = Math.round((4980 * (service === "Tutti" ? 1 : 1.05)) / 100);
  const ore = Math.max(1, Math.round(128 * m));
  const prodotti = Math.max(0, Math.round(47 * m));

  const kpi = [
    {
      id: "incasso",
      label: "Incasso",
      value: euro(incasso),
      raw: incasso,
      delta: "+14%",
      hint: "vs periodo precedente",
      icon: Euro,
      tone: "rose" as const
    },
    {
      id: "appt",
      label: "Appuntamenti",
      value: String(appt),
      raw: appt,
      delta: "+9",
      hint: "completati nel periodo",
      icon: CalendarDays,
      tone: "mint" as const
    },
    {
      id: "clienti",
      label: "Nuovi clienti",
      value: String(nuovi),
      raw: nuovi,
      delta: "+3",
      hint: "acquisiti",
      icon: UserPlus,
      tone: "gold" as const
    },
    {
      id: "ticket",
      label: "Ticket medio",
      value: `€${(ticket / 100).toFixed(2).replace(".", ",")}`,
      raw: ticket / 100,
      delta: "+2,1%",
      hint: "per appuntamento",
      icon: TrendingUp,
      tone: "lavender" as const
    },
    {
      id: "ore",
      label: "Ore lavorate",
      value: `${ore}h`,
      raw: ore,
      delta: "94%",
      hint: "occupazione teorica",
      icon: Clock3,
      tone: "slate" as const
    },
    {
      id: "prodotti",
      label: "Prodotti consumati",
      value: String(prodotti),
      raw: prodotti,
      delta: "−8%",
      hint: "unità scaricate",
      icon: Package,
      tone: "rose" as const
    }
  ];

  const days = ["Lun", "Mar", "Mer", "Gio", "Ven", "Sab", "Dom"];
  const baseIncassi = [520, 780, 640, 910, 860, 420, 150];
  const incassiRows = days.map((d, i) => [
    d,
    Math.round(baseIncassi[i] * m * (0.85 + (i % 3) * 0.08))
  ]);

  let serviziRows: Array<[string, number, string]> = [
    ["Pulizia viso deep", Math.round(48 * m), "28%"],
    ["Massaggio rilassante", Math.round(36 * m), "21%"],
    ["Peeling enzimatico", Math.round(31 * m), "18%"],
    ["Epilazione gambe", Math.round(28 * m), "16%"],
    ["Pressoterapia", Math.round(22 * m), "13%"]
  ];
  if (service !== "Tutti") {
    serviziRows = serviziRows
      .filter((r) => r[0] === service)
      .map((r) => [r[0], Math.max(1, Math.round(Number(r[1]) * 1.4)), "100%"]);
  }

  const acquisitiRows = days.map((d, i) => [
    d,
    Math.max(0, Math.round((i === 1 ? 4 : i === 4 ? 3 : 1) * m))
  ]);

  const pagamentiRows: Array<[string, number, string]> = [
    ["Carta", Math.round(incasso * 0.54), "54%"],
    ["Contanti", Math.round(incasso * 0.28), "28%"],
    ["Bonifico", Math.round(incasso * 0.18), "18%"]
  ];

  const fasce = ["09–11", "11–13", "13–15", "15–17", "17–19", "19–21"];
  const occupazioneRows = fasce.map((f, i) => {
    const pct = Math.min(98, Math.round([42, 68, 35, 78, 88, 55][i] * (cabin === "Tutte" ? 1 : 0.9)));
    return [f, `${pct}%`, pct];
  });

  let operatoriRows: Array<[string, number, number, string]> = [
    ["Laura", Math.round(2140 * m), Math.round(38 * m), "4.8"],
    ["Fabio", Math.round(1680 * m), Math.round(32 * m), "4.9"],
    ["Chiara", Math.round(460 * m), Math.round(12 * m), "4.6"]
  ];
  if (operator !== "Tutti") {
    operatoriRows = operatoriRows.filter((r) => r[0] === operator);
  }

  let topClienti = [
    { name: "Marta Greco", meta: euro(Math.round(1890 * m)), rank: 1, value: Math.round(1890 * m) },
    { name: "Giulia Rossi", meta: euro(Math.round(1240 * m)), rank: 2, value: Math.round(1240 * m) },
    { name: "Sara Bianchi", meta: euro(Math.round(860 * m)), rank: 3, value: Math.round(860 * m) },
    { name: "Elena Conti", meta: euro(Math.round(620 * m)), rank: 4, value: Math.round(620 * m) },
    { name: "Valentina Russo", meta: euro(Math.round(540 * m)), rank: 5, value: Math.round(540 * m) }
  ];

  let topServizi = [
    { name: "Pulizia viso deep", meta: `${Math.round(48 * m)} vendite`, rank: 1, value: Math.round(48 * m) },
    { name: "Massaggio rilassante", meta: `${Math.round(36 * m)} vendite`, rank: 2, value: Math.round(36 * m) },
    { name: "Peeling enzimatico", meta: `${Math.round(31 * m)} vendite`, rank: 3, value: Math.round(31 * m) },
    { name: "Epilazione gambe", meta: `${Math.round(28 * m)} vendite`, rank: 4, value: Math.round(28 * m) },
    { name: "Pressoterapia", meta: `${Math.round(22 * m)} vendite`, rank: 5, value: Math.round(22 * m) }
  ];
  if (service !== "Tutti") {
    topServizi = topServizi
      .filter((r) => r.name === service)
      .map((r, i) => ({ ...r, rank: i + 1 }));
  }

  const topProdotti = [
    { name: "Crema viso idratante", meta: `${Math.round(42 * m)} usi`, rank: 1, value: Math.round(42 * m) },
    { name: "Siero vitamina C", meta: `${Math.round(31 * m)} usi`, rank: 2, value: Math.round(31 * m) },
    { name: "Olio mandorle", meta: `${Math.round(27 * m)} usi`, rank: 3, value: Math.round(27 * m) },
    { name: "Maschera argilla", meta: `${Math.round(24 * m)} usi`, rank: 4, value: Math.round(24 * m) },
    { name: "Cera liposolubile", meta: `${Math.round(19 * m)} usi`, rank: 5, value: Math.round(19 * m) }
  ];

  let topOperatori = [
    { name: "Laura", meta: euro(Math.round(2140 * m)), rank: 1, value: Math.round(2140 * m) },
    { name: "Fabio", meta: euro(Math.round(1680 * m)), rank: 2, value: Math.round(1680 * m) },
    { name: "Chiara", meta: euro(Math.round(460 * m)), rank: 3, value: Math.round(460 * m) },
    { name: "Guest · Marta", meta: euro(0), rank: 4, value: 0 },
    { name: "— slot libero", meta: "—", rank: 5, value: 0 }
  ];
  if (operator !== "Tutti") {
    topOperatori = topOperatori
      .filter((r) => r.name === operator)
      .map((r, i) => ({ ...r, rank: i + 1 }));
  }

  const magazzinoRows: Array<[string, number, number, string]> = [
    ["Crema viso idratante", Math.round(42 * m), 18, "ok"],
    ["Siero vitamina C", Math.round(31 * m), 11, "ok"],
    ["Olio mandorle", Math.round(27 * m), 9, "ok"],
    ["Maschera argilla", Math.round(24 * m), 4, "bassa"],
    ["Cera liposolubile", Math.round(19 * m), 0, "esaurito"]
  ];

  return {
    kpi,
    incassiRows,
    serviziRows,
    acquisitiRows,
    pagamentiRows,
    occupazioneRows,
    operatoriRows,
    rankings: [
      { id: "clienti", title: "Top 5 Clienti", rows: topClienti },
      { id: "servizi", title: "Top 5 Servizi", rows: topServizi },
      { id: "prodotti", title: "Top 5 Prodotti", rows: topProdotti },
      { id: "operatori", title: "Top 5 Operatori", rows: topOperatori }
    ],
    magazzinoRows,
    clientiSheet: topClienti.map((r) => [r.rank, r.name, r.value]),
    serviziSheet: topServizi.map((r) => [r.rank, r.name, r.value]),
    operatoriSheet: operatoriRows.map((r) => [r[0], r[1], r[2], r[3]])
  };
}

export default function ReportsWorkspace() {
  const { activities, reportsPulse, revenueCompleted, appointmentsToday, pushToast } =
    useDemoWorkflow();
  const [period, setPeriod] = useState<Period>("settimana");
  const [operator, setOperator] = useState(OPERATORS[0]);
  const [cabin, setCabin] = useState(CABINS[0]);
  const [service, setService] = useState(SERVICES[0]);

  const health = HEALTH[period];
  const periodLabel = PERIODS.find((p) => p.id === period)?.label ?? period;

  const meta: FilterMeta = useMemo(
    () => ({ periodLabel, operator, cabin, service }),
    [periodLabel, operator, cabin, service]
  );

  const data = useMemo(
    () => buildDataset(period, operator, cabin, service),
    [period, operator, cabin, service]
  );

  const timeline = useMemo(() => {
    if (activities.length === 0) return FALLBACK_ACTIVITY;
    return activities.slice(0, 8).map((a) => ({
      id: a.id,
      time: a.time,
      text: a.text
    }));
  }, [activities]);

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
          heading: "Metodo di pagamento",
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
          headers: ["Operatore", "Incasso €", "Appuntamenti", "Rating"],
          rows: data.operatoriRows
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
          heading: "Top Prodotti",
          headers: ["#", "Prodotto", "Usi"],
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
          headers: ["Operatore", "Incasso €", "Appuntamenti", "Rating"],
          rows: data.operatoriRows
        },
        {
          name: "Magazzino",
          headers: ["Prodotto", "Consumi", "Giacenza", "Stato"],
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
          ["Operatore", "Incasso €", "Appuntamenti", "Rating"],
          data.operatoriRows
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
            Panoramica demo · {appointmentsToday} appuntamenti oggi · incasso completato €
            {revenueCompleted}
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
              {OPERATORS.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
          </label>
          <label className="nb-rpFilter">
            <span>Cabina</span>
            <select value={cabin} onChange={(e) => setCabin(e.target.value)}>
              {CABINS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>
          <label className="nb-rpFilter">
            <span>Servizio</span>
            <select value={service} onChange={(e) => setService(e.target.value)}>
              {SERVICES.map((s) => (
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
            Sintesi demo · filtri {operator} · {cabin} · {service}
          </p>
        </article>
      </section>

      <section className="nb-rpSection" aria-labelledby="rp-charts">
        <SectionHead
          id="rp-charts"
          title="Grafici"
          caption="Placeholder professionali · dati demo"
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
                <ChartPlaceholder kind={c.kind} />
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
            </article>
          ))}
        </div>
      </section>

      <section className="nb-rpSection" aria-labelledby="rp-timeline">
        <SectionHead
          id="rp-timeline"
          title="Timeline attività"
          caption="Ultime operazioni del centro"
        />
        <div className="nb-rpTimeline">
          {timeline.map((item, i) => (
            <div
              key={item.id}
              className="nb-rpTimelineItem"
              style={{ animationDelay: `${i * 40}ms` }}
            >
              <span className="nb-rpTimelineTime">{item.time}</span>
              <span className="nb-rpTimelineDot" aria-hidden={true} />
              <span className="nb-rpTimelineText">{item.text}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="nb-rpSection nb-rpSection--last" aria-labelledby="rp-insight">
        <SectionHead
          id="rp-insight"
          title="Insight"
          caption="Segnali intelligenti · solo UI demo"
        />
        <div className="nb-rpInsightGrid">
          {INSIGHTS.map((ins) => {
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

function ChartPlaceholder({
  kind
}: {
  kind: "line" | "bars" | "area" | "donut" | "heat" | "columns";
}) {
  if (kind === "line" || kind === "area") {
    return (
      <svg className="nb-rpSvg" viewBox="0 0 360 140" preserveAspectRatio="none" aria-hidden={true}>
        <defs>
          <linearGradient id={`rp-grad-${kind}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(196,138,151,0.35)" />
            <stop offset="100%" stopColor="rgba(196,138,151,0)" />
          </linearGradient>
        </defs>
        <path className="nb-rpSvgGrid" d="M0 35 H360 M0 70 H360 M0 105 H360" />
        {kind === "area" ? (
          <path
            fill={`url(#rp-grad-${kind})`}
            d="M0 110 L40 95 L80 100 L120 70 L160 78 L200 48 L240 58 L280 36 L320 44 L360 28 L360 140 L0 140 Z"
          />
        ) : null}
        <path
          className="nb-rpSvgLine"
          fill="none"
          d="M0 110 L40 95 L80 100 L120 70 L160 78 L200 48 L240 58 L280 36 L320 44 L360 28"
        />
        {[40, 120, 200, 280, 360].map((x, i) => (
          <circle key={x} className="nb-rpSvgDot" cx={x} cy={[95, 70, 48, 36, 28][i]} r="3.5" />
        ))}
      </svg>
    );
  }

  if (kind === "donut") {
    return (
      <div className="nb-rpDonutWrap">
        <svg className="nb-rpDonut" viewBox="0 0 120 120" aria-hidden={true}>
          <circle className="nb-rpDonutTrack" cx="60" cy="60" r="42" />
          <circle className="nb-rpDonutSeg s1" cx="60" cy="60" r="42" />
          <circle className="nb-rpDonutSeg s2" cx="60" cy="60" r="42" />
          <circle className="nb-rpDonutSeg s3" cx="60" cy="60" r="42" />
        </svg>
        <div className="nb-rpDonutLegend">
          <span>
            <i className="t1" /> Carta 54%
          </span>
          <span>
            <i className="t2" /> Contanti 28%
          </span>
          <span>
            <i className="t3" /> Bonifico 18%
          </span>
        </div>
      </div>
    );
  }

  if (kind === "heat") {
    const cells = [0.3, 0.5, 0.7, 0.9, 0.6, 0.4, 0.8, 0.95, 0.55, 0.35, 0.65, 0.75];
    return (
      <div className="nb-rpHeat" aria-hidden={true}>
        {cells.map((v, i) => (
          <span key={i} style={{ opacity: 0.25 + v * 0.75 }} />
        ))}
      </div>
    );
  }

  const bars = kind === "columns" ? [42, 68, 55, 80, 36, 62] : [78, 64, 52, 44, 36, 28];

  return (
    <div className={clsx("nb-rpBars", kind === "columns" && "isColumns")} aria-hidden={true}>
      {bars.map((h, i) => (
        <span key={i} style={{ height: `${h}%`, animationDelay: `${i * 60}ms` }} />
      ))}
    </div>
  );
}
