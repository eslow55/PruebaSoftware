import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import LoginPage from './features/auth/LoginPage'; // Importación por defecto (sin llaves)
import { RutaProtegida } from './routes/RutaProtegida';

// Vistas de demostración para los paneles de control
function DashboardAdmin() {
  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>Panel de Administración</h1>
      <p>Bienvenido al módulo de administrador.</p>
    </div>
  );
}

function DashboardGerente() {
  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>Panel de Gerencia</h1>
      <p>Bienvenido al módulo de gerencia.</p>
    </div>
  );
}

function DashboardVendedor() {
  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>Panel de Ventas</h1>
      <p>Bienvenido al módulo de vendedor.</p>
    </div>
  );
}

export function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Ruta pública para el inicio de sesión */}
          <Route path="/" element={<LoginPage />} />

          {/* Rutas protegidas (CA-09) */}
          <Route element={<RutaProtegida />}>
            <Route path="/dashboard/admin" element={<DashboardAdmin />} />
            <Route path="/dashboard/gerente" element={<DashboardGerente />} />
            <Route path="/dashboard/vendedor" element={<DashboardVendedor />} />
          </Route>

          {/* Redirección ante cualquier otra ruta desconocida */}
          <Route path="*" element={<LoginPage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;