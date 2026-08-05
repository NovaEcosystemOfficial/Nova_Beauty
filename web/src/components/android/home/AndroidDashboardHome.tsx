"use client";

import Link from "next/link";
import { Timestamp } from "firebase/firestore";
import {
  Bell,
  CalendarPlus,
  ChevronRight,
  Clock3,
  Euro,
  Scissors,
  Store,
  UserRound,
  Users
} from "lucide-react";
import { AndroidMetricCard } from "@/components/android/shared/AndroidMetricCard";
import { AndroidQuickAction } from "@/components/android/shared/AndroidQuickAction";
import { AndroidSectionTitle } from "@/components/android/shared/AndroidSectionTitle";
import { AndroidTopBar } from "@/components/android/layout/AndroidTopBar";
import { Skeleton } from "@/components/ui/Skeleton";
import { useDashboardData } from "@/lib/hooks/useDashboardData";
import { routes } from "@/lib/constants/routes";
import { cn } from "@/lib/utils/cn";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0
  }).format(value);
}

function formatTime(timestamp: Timestamp) {
  return new Intl.DateTimeFormat("it-IT", {
    hour: "2-digit",
    minute: "2-digit"
  }).format(timestamp.toDate());
}

const statusTone: Record<string, string> = {
  Prenotato: "bg-beauty-lavender/15 text-beauty-lavender",
  Confermato: "bg-beauty-primary/12 text-beauty-primary",
  Completato: "bg-beauty-success/12 text-beauty-success",
  Annullato: "bg-beauty-danger/10 text-beauty-danger"
};

export function AndroidDashboardHome() {
  const {
    data,
    isLoading,
    error,
    todayRevenue,
    setupActions,
    nextAppointment,
    ownerName,
    businessName
  } = useDashboardData();

  const greeting = ownerName ? `Ciao ${ownerName.split(" ")[0]}` : "Ciao";

  return (
    <div className="space-y-4 pb-2">
      <AndroidTopBar
        compact
        title={greeting}
        subtitle={businessName}
        right={
          <Link
            href={routes.notifications}
            className="grid size-9 place-items-center rounded-full bg-beauty-elevated text-beauty-primary shadow-beauty-soft"
            aria-label="Notifiche"
          >
            <Bell className="size-4" aria-hidden="true" />
          </Link>
        }
      />

      {error ? <p className="text-[13px] text-beauty-danger">{error}</p> : null}

      <section className="space-y-2">
        <AndroidSectionTitle title="Oggi" />
        {isLoading ? (
          <div className="grid grid-cols-2 gap-2">
            <Skeleton className="h-[76px] rounded-2xl" />
            <Skeleton className="h-[76px] rounded-2xl" />
            <Skeleton className="h-[76px] rounded-2xl" />
            <Skeleton className="h-[76px] rounded-2xl" />
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            <AndroidMetricCard
              label="Appuntamenti"
              value={String(data.todayAppointments.length)}
              icon={Clock3}
              tone="primary"
            />
            <AndroidMetricCard label="Incasso" value={formatCurrency(todayRevenue)} icon={Euro} tone="mint" />
            <AndroidMetricCard label="Clienti" value={String(data.clients.length)} icon={Users} tone="gold" />
            <AndroidMetricCard
              label="Prossimo"
              value={nextAppointment ? formatTime(nextAppointment.date) : "—"}
              icon={CalendarPlus}
              tone="lavender"
            />
          </div>
        )}
      </section>

      <section className="space-y-2">
        <AndroidSectionTitle title="Azioni rapide" />
        <div className="grid grid-cols-2 gap-2">
          <AndroidQuickAction label="Nuovo appuntamento" href={routes.appointments} icon={CalendarPlus} tone="primary" />
          <AndroidQuickAction label="Nuovo cliente" href={routes.clients} icon={UserRound} tone="mint" />
          <AndroidQuickAction label="Nuovo servizio" href={routes.services} icon={Scissors} tone="gold" />
          <AndroidQuickAction label="Magazzino" href={routes.studioMagazzino} icon={Store} tone="lavender" />
        </div>
      </section>

      <section className="space-y-2">
        <AndroidSectionTitle
          title="Agenda di oggi"
          action={
            <Link href={routes.appointments} className="text-[12px] font-semibold text-beauty-primary">
              Vedi tutta
            </Link>
          }
        />
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-14 rounded-xl" />
            <Skeleton className="h-14 rounded-xl" />
          </div>
        ) : data.todayAppointments.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-beauty-border/70 bg-beauty-elevated/50 px-4 py-5 text-center">
            <p className="text-[14px] font-semibold text-beauty-text">Nessun appuntamento oggi</p>
            <p className="mt-1 text-[12px] text-beauty-muted">Programma il prossimo dalla agenda.</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-beauty-border/60 bg-beauty-elevated/70">
            {data.todayAppointments.map((appointment, index) => (
              <Link
                key={appointment.id}
                href={routes.appointments}
                className={cn(
                  "flex min-h-[56px] items-center gap-3 px-3 py-2.5 transition active:bg-beauty-primary/6",
                  index > 0 && "border-t border-beauty-border/50"
                )}
              >
                <div className="w-12 shrink-0 text-center">
                  <p className="text-[13px] font-bold text-beauty-primary">{formatTime(appointment.date)}</p>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[14px] font-semibold text-beauty-text">{appointment.clientNameSnapshot}</p>
                  <p className="truncate text-[12px] text-beauty-muted">{appointment.serviceName}</p>
                </div>
                <span
                  className={cn(
                    "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold",
                    statusTone[appointment.status] ?? statusTone.Prenotato
                  )}
                >
                  {appointment.status}
                </span>
              </Link>
            ))}
          </div>
        )}
      </section>

      {setupActions.length > 0 ? (
        <section className="space-y-2">
          <AndroidSectionTitle title="Primi passi" />
          <div className="space-y-2">
            {setupActions.map((action) => (
              <Link
                key={action.title}
                href={action.href}
                className="flex min-h-[52px] items-center justify-between gap-3 rounded-2xl border border-beauty-border/60 bg-beauty-elevated/70 px-3 py-2.5 transition active:bg-beauty-primary/6"
              >
                <span className="text-[14px] font-semibold text-beauty-text">{action.title}</span>
                <ChevronRight className="size-4 shrink-0 text-beauty-subtle" aria-hidden="true" />
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      {nextAppointment ? (
        <section className="rounded-2xl border border-beauty-border/60 bg-beauty-primary/6 px-3 py-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-beauty-muted">Prossima prenotazione</p>
          <p className="mt-1 text-[15px] font-bold text-beauty-text">
            {formatTime(nextAppointment.date)} · {nextAppointment.clientNameSnapshot}
          </p>
          <p className="text-[12px] text-beauty-muted">{nextAppointment.serviceName}</p>
        </section>
      ) : null}
    </div>
  );
}
