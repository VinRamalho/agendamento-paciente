import { Link } from 'react-router-dom';
import { CalendarClock, Stethoscope, UserRoundCheck } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useDashboardSummary } from '@/hooks/useDashboardSummary';
import type { DashboardAppointmentItem } from '@/types/dashboard';
import type { AppointmentStatus } from '@/types/appointment';
import {
  appointmentStatusClass,
  appointmentStatusLabel,
} from '@/utils/labels';

function formatDateTime(value: string): string {
  return format(parseISO(value), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
}

function AppointmentList({
  title,
  items,
  emptyMessage,
}: {
  title: string;
  items: DashboardAppointmentItem[];
  emptyMessage: string;
}) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-base font-semibold text-slate-900">{title}</h2>
      {items.length === 0 ? (
        <p className="mt-4 text-sm text-slate-500">{emptyMessage}</p>
      ) : (
        <ul className="mt-4 divide-y divide-slate-100">
          {items.map((item) => (
            <li key={item.id} className="flex items-start justify-between gap-3 py-3">
              <div>
                <p className="font-medium text-slate-800">{item.patientName}</p>
                <p className="text-sm text-slate-500">
                  {formatDateTime(item.startAt)} · {item.durationMinutes} min
                </p>
              </div>
              <span
                className={`rounded-full px-2.5 py-1 text-xs font-medium ${appointmentStatusClass(item.status as AppointmentStatus)}`}
              >
                {appointmentStatusLabel[item.status as AppointmentStatus] ??
                  item.status}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export function DashboardPage() {
  const { data, isLoading, isError, error, refetch, isFetching } =
    useDashboardSummary();

  if (isLoading) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-8 text-slate-500">
        Carregando dashboard...
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-danger">
        <p role="alert">
          Não foi possível carregar o dashboard.
          {error instanceof Error ? ` ${error.message}` : ''}
        </p>
        <button
          type="button"
          onClick={() => void refetch()}
          className="mt-3 rounded-lg bg-white px-3 py-2 text-sm font-medium text-slate-700 ring-1 ring-slate-200"
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-slate-600">
          Visão rápida do dia e próximos atendimentos.
        </p>
        <button
          type="button"
          onClick={() => void refetch()}
          disabled={isFetching}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-white disabled:opacity-60"
        >
          {isFetching ? 'Atualizando...' : 'Atualizar'}
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <span className="rounded-lg bg-blue-50 p-2 text-primary">
              <CalendarClock className="h-5 w-5" aria-hidden />
            </span>
            <div>
              <p className="text-sm text-slate-500">Atendimentos de hoje</p>
              <p className="text-2xl font-semibold text-slate-900">
                {data.todayCount}
              </p>
            </div>
          </div>
        </article>

        <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <span className="rounded-lg bg-amber-50 p-2 text-amber-700">
              <UserRoundCheck className="h-5 w-5" aria-hidden />
            </span>
            <div>
              <p className="text-sm text-slate-500">Pacientes pendentes</p>
              <p className="text-2xl font-semibold text-slate-900">
                {data.pendingPatientsCount}
              </p>
            </div>
          </div>
          <Link
            to="/pacientes"
            className="mt-3 inline-block text-sm font-medium text-primary hover:underline"
          >
            Revisar cadastros
          </Link>
        </article>

        <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:col-span-2 xl:col-span-1">
          <div className="flex items-center gap-3">
            <span className="rounded-lg bg-emerald-50 p-2 text-success">
              <Stethoscope className="h-5 w-5" aria-hidden />
            </span>
            <div>
              <p className="text-sm text-slate-500">Profissionais ativos</p>
              <p className="text-2xl font-semibold text-slate-900">
                {data.activeProfessionalsCount}
              </p>
            </div>
          </div>
        </article>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <AppointmentList
          title="Agenda de hoje"
          items={data.todayAppointments}
          emptyMessage="Nenhum atendimento agendado para hoje."
        />
        <AppointmentList
          title="Próximos atendimentos"
          items={data.upcomingAppointments}
          emptyMessage="Nenhum atendimento futuro encontrado."
        />
      </div>
    </div>
  );
}
