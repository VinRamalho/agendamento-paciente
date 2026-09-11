import { Navigate, Route, Routes } from 'react-router-dom';
import { AppLayout } from '@/layouts/AppLayout';
import { AgendaPage } from '@/pages/AgendaPage';
import { ChangePasswordPage } from '@/pages/ChangePasswordPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { LoginPage } from '@/pages/LoginPage';
import { PatientsPage } from '@/pages/PatientsPage';
import { ProfessionalsPage } from '@/pages/ProfessionalsPage';
import { UsersPage } from '@/pages/UsersPage';
import { AdminRoute, PrivateRoute } from '@/routes/PrivateRoute';

export function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<PrivateRoute />}>
        <Route path="/alterar-senha" element={<ChangePasswordPage />} />
        <Route element={<AppLayout />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/agenda" element={<AgendaPage />} />
          <Route path="/pacientes" element={<PatientsPage />} />
          <Route path="/profissionais" element={<ProfessionalsPage />} />
          <Route element={<AdminRoute />}>
            <Route path="/usuarios" element={<UsersPage />} />
          </Route>
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
