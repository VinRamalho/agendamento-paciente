import { NavLink } from 'react-router-dom';
import {
  CalendarDays,
  LayoutDashboard,
  Shield,
  Stethoscope,
  Users,
  X,
} from 'lucide-react';
import { useAuth } from '@/context/useAuth';
import { cn } from '@/lib/utils';

const baseNavItems = [
  { to: '/', label: 'Painel', icon: LayoutDashboard, end: true },
  { to: '/agenda', label: 'Agenda', icon: CalendarDays, end: false },
  { to: '/pacientes', label: 'Pacientes', icon: Users, end: false },
  {
    to: '/profissionais',
    label: 'Profissionais',
    icon: Stethoscope,
    end: false,
  },
] as const;

type SidebarProps = {
  open: boolean;
  onClose: () => void;
};

export function Sidebar({ open, onClose }: SidebarProps) {
  const { isAdmin } = useAuth();

  const navItems = [
    ...baseNavItems,
    ...(isAdmin
      ? ([{ to: '/usuarios', label: 'Usuários', icon: Shield, end: false }] as const)
      : []),
  ];

  return (
    <>
      <div
        className={cn(
          'fixed inset-0 z-40 bg-slate-900/40 transition-opacity lg:hidden',
          open ? 'opacity-100' : 'pointer-events-none opacity-0',
        )}
        onClick={onClose}
        aria-hidden={!open}
      />

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-[min(100%,16rem)] flex-col border-r border-slate-200 bg-white transition-transform lg:static lg:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full',
        )}
        aria-label="Navegação principal"
      >
        <div className="flex h-14 items-center justify-between border-b border-slate-200 px-4 sm:h-16 sm:px-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-primary">
              Clínica
            </p>
            <p className="text-sm font-semibold text-slate-900">Agendamento</p>
          </div>
          <button
            type="button"
            className="rounded-md p-2 text-slate-500 hover:bg-slate-100 lg:hidden"
            onClick={onClose}
            aria-label="Fechar menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={onClose}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition',
                  isActive
                    ? 'bg-blue-50 text-primary'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900',
                )
              }
            >
              <item.icon className="h-4 w-4 shrink-0" aria-hidden />
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  );
}
