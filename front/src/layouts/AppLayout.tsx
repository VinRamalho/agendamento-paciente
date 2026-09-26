import { useMemo, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Header } from '@/layouts/Header';
import { Sidebar } from '@/layouts/Sidebar';

const titles: Record<string, string> = {
  '/': 'Painel',
  '/agenda': 'Agenda',
  '/pacientes': 'Pacientes',
  '/profissionais': 'Profissionais',
  '/usuarios': 'Usuários',
};

export function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const title = useMemo(() => titles[location.pathname] ?? 'Agendamento', [location.pathname]);

  return (
    <div className="min-h-screen md:px-4 md:py-4 lg:px-8 lg:py-6">
      <div className="mx-auto flex min-h-screen max-w-[1600px] overflow-hidden bg-white shadow-[0_28px_80px_-36px_rgba(31,53,66,0.28)] md:min-h-[calc(100vh-2rem)] md:rounded-2xl md:border md:border-white/80 lg:rounded-[28px]">
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="flex min-w-0 flex-1 flex-col">
          <Header title={title} onMenuClick={() => setSidebarOpen(true)} />
          <main className="min-w-0 flex-1 overflow-x-hidden bg-[#fcfdfd] px-3 py-4 sm:px-5 sm:py-6 lg:px-9 lg:py-7">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
