import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '../../context/AuthContext';
import { login } from '../../api/authApi';
import LoginPage from './LoginPage';

// Reemplazamos el módulo que habla con el backend por una función falsa
vi.mock('../../api/authApi', () => ({ login: vi.fn() }));

function renderizarLogin() {
  render(
    <MemoryRouter initialEntries={['/']}>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/dashboard/admin" element={<h1>Dashboard Admin</h1>} />
          <Route path="/dashboard/gerente" element={<h1>Dashboard Gerente</h1>} />
          <Route path="/dashboard/vendedor" element={<h1>Dashboard Vendedor</h1>} />
        </Routes>
      </AuthProvider>
    </MemoryRouter>
  );
  return userEvent.setup();
}

async function llenarYEnviar(user, correo, password) {
  await user.type(screen.getByLabelText('Correo'), correo);
  await user.type(screen.getByLabelText('Contraseña'), password);
  await user.click(screen.getByRole('button', { name: 'Login' }));
}

describe('LoginPage renderizado', () => {
  test('CP-01: muestra el título, los campos y el botón', () => {
    renderizarLogin();
    expect(screen.getByRole('heading', { name: 'Iniciar sesión' })).toBeInTheDocument();
    expect(screen.getByLabelText('Correo')).toHaveAttribute('type', 'email');
    expect(screen.getByLabelText('Contraseña')).toHaveAttribute('type', 'password');
    expect(screen.getByRole('button', { name: 'Login' })).toBeInTheDocument();
  });

  test('CP-02: lo que el usuario escribe queda en los campos', async () => {
    const user = renderizarLogin();
    await user.type(screen.getByLabelText('Correo'), 'admin@crm.local');
    await user.type(screen.getByLabelText('Contraseña'), 'Admin123*');
    expect(screen.getByLabelText('Correo')).toHaveValue('admin@crm.local');
    expect(screen.getByLabelText('Contraseña')).toHaveValue('Admin123*');
  });
});

describe('LoginPage login exitoso', () => {
  test('CP-03: envía al API exactamente lo que el usuario escribió', async () => {
    login.mockResolvedValue({ token: 't', usuario: { id: 1, nombre: 'Admin', rol: 'administrador' } });
    const user = renderizarLogin();
    await llenarYEnviar(user, 'admin@crm.local', 'Admin123*');
    expect(login).toHaveBeenCalledWith('admin@crm.local', 'Admin123*');
  });

  test.each([
    ['administrador', 'Dashboard Admin'],
    ['gerente', 'Dashboard Gerente'],
    ['vendedor', 'Dashboard Vendedor'],
  ])('CP-04: rol %s redirige a "%s"', async (rol, tituloEsperado) => {
    login.mockResolvedValue({ token: 't', usuario: { id: 1, nombre: 'Test', rol } });
    const user = renderizarLogin();
    await llenarYEnviar(user, 'test@crm.local', 'Clave123*');
    expect(await screen.findByRole('heading', { name: tituloEsperado })).toBeInTheDocument();
  });

  test('CP-05: guarda token y usuario en localStorage', async () => {
    const usuario = { id: 1, nombre: 'Admin', rol: 'administrador' };
    login.mockResolvedValue({ token: 'jwt-falso', usuario });
    const user = renderizarLogin();
    await llenarYEnviar(user, 'admin@crm.local', 'Admin123*');
    await screen.findByRole('heading', { name: 'Dashboard Admin' });
    expect(localStorage.getItem('token')).toBe('jwt-falso');
    expect(JSON.parse(localStorage.getItem('usuario'))).toEqual(usuario);
  });

  test('CP-06: un rol desconocido se queda en la página de login', async () => {
    login.mockResolvedValue({ token: 't', usuario: { id: 9, nombre: 'X', rol: 'auditor' } });
    const user = renderizarLogin();
    await llenarYEnviar(user, 'x@crm.local', 'Clavel23*');
    expect(await screen.findByRole('heading', { name: 'Iniciar sesión' })).toBeInTheDocument();
  });
});

describe('LoginPage login fallido', () => {
  test('CP-07: si no hay respuesta del servidor, muestra el mensaje genérico', async () => {
    login.mockRejectedValue(new Error('Network Error'));
    const user = renderizarLogin();
    await llenarYEnviar(user, 'admin@crm.local', 'Admin123*');
    expect(await screen.findByText('Error al iniciar sesión')).toBeInTheDocument();
    expect(localStorage.getItem('token')).toBeNull();
  });

  test('CP-08: credenciales inválidas (401) muestran el mensaje del backend', async () => {
    login.mockRejectedValue({
      response: {
        status: 401,
        data: { success: false, error: { code: 'CREDENCIALES_INVALIDAS', message: 'Correo o contraseña incorrectos' } },
      },
    });
    const user = renderizarLogin();
    await llenarYEnviar(user, 'admin@crm.local', 'claveMala');
    expect(await screen.findByText('Correo o contraseña incorrectos')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Iniciar sesión' })).toBeInTheDocument();
  });

  test('CP-09: cuenta bloqueada (423) muestra el tiempo de espera', async () => {
    login.mockRejectedValue({
      response: {
        status: 423,
        data: { success: false, error: { code: 'CUENTA_BLOQUEADA', message: 'Cuenta bloqueada. Intenta de nuevo en 5 minuto(s).' } },
      },
    });
    const user = renderizarLogin();
    await llenarYEnviar(user, 'admin@crm.local', 'claveMala');
    expect(await screen.findByText(/Cuenta bloqueada/)).toBeInTheDocument();
  });
});

describe('LoginPage campos vacíos', () => {
  test('CP-10: enviar sin datos muestra el mensaje de campos obligatorios', async () => {
    login.mockRejectedValue({
      response: {
        status: 400,
        data: { success: false, error: { code: 'DATOS_FALTANTES', message: 'Correo y contraseña son obligatorios' } },
      },
    });
    const user = renderizarLogin();
    await user.click(screen.getByRole('button', { name: 'Login' }));
    expect(login).toHaveBeenCalledWith('', '');
    expect(await screen.findByText('Correo y contraseña son obligatorios')).toBeInTheDocument();
  });
});