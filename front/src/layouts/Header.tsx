import { Menu, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/useAuth';

type HeaderProps = {
  title: string;
  onMenuClick: () => void;
};

export function Header({ title, onMenuClick }: HeaderProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <header className="sticky top-0 z-30 flex min-h-[76px] items-center justify-between gap-2 border-b border-slate-100 bg-white/95 px-3 backdrop-blur sm:gap-4 sm:px-5 lg:px-7">
      <div className="flex min-w-0 items-center gap-2 sm:gap-3">
        <button
          type="button"
          className="shrink-0 rounded-md p-2 text-slate-600 hover:bg-slate-100 md:hidden"
          onClick={onMenuClick}
          aria-label="Abrir menu"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div className="min-w-0">
          <p className="hidden text-[11px] font-medium text-slate-400 sm:block">
            Clínica <span className="mx-1.5">/</span>{' '}
            <span className="text-slate-500">{title}</span>
          </p>
          <h1 className="truncate text-lg font-semibold tracking-tight text-slate-900 sm:mt-0.5">
            {title}
          </h1>
          <p className="hidden text-xs text-slate-500 lg:block">
            Gestão de atendimentos e agenda
          </p>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2 sm:gap-3">
        <div className="hidden text-right sm:block">
          <p className="text-sm font-medium text-slate-800">{user?.name}</p>
          <p className="text-xs text-slate-500">{user?.role}</p>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-2.5 py-2.5 text-sm font-medium text-slate-700 hover:border-emerald-200 hover:bg-emerald-50 sm:px-3.5"
        >
          <LogOut className="h-4 w-4" aria-hidden />
          Sair
        </button>
      </div>
    </header>
  );
}

