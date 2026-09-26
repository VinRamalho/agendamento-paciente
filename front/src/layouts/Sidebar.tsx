import { NavLink } from 'react-router-dom';
import {
  Briefcase,
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
      ? ([
          { to: '/profissoes', label: 'Profissões', icon: Briefcase, end: false },
          { to: '/usuarios', label: 'Usuários', icon: Shield, end: false },
        ] as const)
      : []),
  ];

  return (
    <>
      <div
        className={cn(
          'fixed inset-0 z-40 bg-slate-900/40 transition-opacity md:hidden',
          open ? 'opacity-100' : 'pointer-events-none opacity-0',
        )}
        onClick={onClose}
        aria-hidden={!open}
      />

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-[min(100%,17rem)] flex-col border-r border-slate-100 bg-white transition-transform md:static md:w-56 md:translate-x-0 md:shrink-0 lg:w-64',
          open ? 'translate-x-0' : '-translate-x-full md:translate-x-0',
        )}
        aria-label="Navegação principal"
      >
        <div className="flex h-[76px] items-center justify-between border-b border-slate-100 px-5 sm:px-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-primary">
              Clínica
            </p>
            <p className="text-sm font-semibold text-slate-900">Agendamento</p>
          </div>
          <button
            type="button"
            className="rounded-md p-2 text-slate-500 hover:bg-slate-100 md:hidden"
            onClick={onClose}
            aria-label="Fechar menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-1.5 overflow-y-auto px-3 py-6 sm:px-4">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={onClose}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-medium transition',
                  isActive
                    ? 'bg-emerald-50 text-[#28795d] shadow-[inset_3px_0_0_#72c9a8]'
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

