import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/useAuth';

export function PrivateRoute() {
  const { isAuthenticated, isBootstrapping, mustChangePassword } = useAuth();
  const location = useLocation();

  if (isBootstrapping) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 text-slate-600">
        Carregando...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (
    mustChangePassword &&
    location.pathname !== '/alterar-senha'
  ) {
    return <Navigate to="/alterar-senha" replace />;
  }

  return <Outlet />;
}

export function AdminRoute() {
  const { isAdmin } = useAuth();

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
