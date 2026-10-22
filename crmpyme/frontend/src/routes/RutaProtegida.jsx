import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function RutaProtegida() {
  const { usuario } = useAuth();

  // Si no hay un usuario autenticado en la sesión, redirige al inicio de sesión (CA-09)
  if (!usuario) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}