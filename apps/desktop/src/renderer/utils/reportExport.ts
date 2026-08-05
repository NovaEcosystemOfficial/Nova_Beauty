import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

export type FilterMeta = {
  periodLabel: string;
  operator: string;
  cabin: string;
  service: string;
};

export type SheetTable = {
  name: string;
  headers: string[];
  rows: Array<Array<string | number>>;
};

export function reportDateStamp(d = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function downloadBlob(filename: string, blob: Blob): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1500);
}

export function downloadText(filename: string, content: string, mime: string): void {
  downloadBlob(filename, new Blob([content], { type: mime }));
}

export function toCsv(headers: string[], rows: Array<Array<string | number>>): string {
  const esc = (v: string | number) => {
    const s = String(v ?? "");
    if (/[",\n;]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
    return s;
  };
  return [headers.map(esc).join(";"), ...rows.map((r) => r.map(esc).join(";"))].join("\n");
}

function filterFooter(meta: FilterMeta): string {
  return `Filtri · ${meta.periodLabel} · ${meta.operator} · ${meta.cabin} · ${meta.service}`;
}

export function exportReportPdf(opts: {
  title: string;
  meta: FilterMeta;
  sections: Array<{ heading: string; headers: string[]; rows: Array<Array<string | number>> }>;
  filename?: string;
}): void {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const stamp = reportDateStamp();
  const filename = opts.filename ?? `Report_${stamp}.pdf`;

  doc.setFontSize(16);
  doc.text(opts.title, 14, 18);
  doc.setFontSize(10);
  doc.setTextColor(90);
  doc.text(filterFooter(opts.meta), 14, 26);
  doc.text(`Generato · ${stamp}`, 14, 32);
  doc.setTextColor(20);

  let startY = 38;
  for (const section of opts.sections) {
    if (startY > 260) {
      doc.addPage();
      startY = 16;
    }
    doc.setFontSize(12);
    doc.text(section.heading, 14, startY);
    autoTable(doc, {
      startY: startY + 4,
      head: [section.headers],
      body: section.rows.map((r) => r.map(String)),
      styles: { fontSize: 9, cellPadding: 2 },
      headStyles: { fillColor: [196, 138, 151], textColor: 255 },
      margin: { left: 14, right: 14 }
    });
    const table = (doc as unknown as { lastAutoTable?: { finalY: number } }).lastAutoTable;
    startY = (table?.finalY ?? startY) + 12;
  }

  doc.save(filename);
}

export function exportSimplePdf(opts: {
  title: string;
  meta: FilterMeta;
  headers: string[];
  rows: Array<Array<string | number>>;
  filename: string;
}): void {
  exportReportPdf({
    title: opts.title,
    meta: opts.meta,
    filename: opts.filename,
    sections: [{ heading: opts.title, headers: opts.headers, rows: opts.rows }]
  });
}

export function exportWorkbook(opts: {
  sheets: SheetTable[];
  filename?: string;
}): void {
  const stamp = reportDateStamp();
  const filename = opts.filename ?? `Report_${stamp}.xlsx`;
  const wb = XLSX.utils.book_new();
  for (const sheet of opts.sheets) {
    const safeName = sheet.name.slice(0, 31);
    const aoa = [sheet.headers, ...sheet.rows];
    const ws = XLSX.utils.aoa_to_sheet(aoa);
    XLSX.utils.book_append_sheet(wb, ws, safeName);
  }
  XLSX.writeFile(wb, filename);
}

export function exportCsvFile(
  filename: string,
  headers: string[],
  rows: Array<Array<string | number>>
): void {
  downloadText(filename, toCsv(headers, rows), "text/csv;charset=utf-8");
}

export function printReportA4(): void {
  document.body.classList.add("nb-rpPrinting");
  const cleanup = () => {
    document.body.classList.remove("nb-rpPrinting");
    window.removeEventListener("afterprint", cleanup);
  };
  window.addEventListener("afterprint", cleanup);
  window.setTimeout(() => window.print(), 50);
}
