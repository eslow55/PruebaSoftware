import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../../context/AuthContext';
import LoginPage from './LoginPage';
import { login } from '../../api/authApi';

// Mock del servicio de API
vi.mock('../../api/authApi', () => ({
  login: vi.fn(),
}));

// Helper de renderizado envolviendo con los contextos requeridos
const renderLoginPage = () => {
  return render(
    <BrowserRouter>
      <AuthProvider>
        <LoginPage />
      </AuthProvider>
    </BrowserRouter>
  );
};

describe('Nuevos criterios de aceptación (CA-07 y CA-08)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  test('CP-11: El botón se deshabilita y muestra "Ingresando..." durante el procesamiento', async () => {
    const user = userEvent.setup();
    login.mockReturnValue(new Promise(() => {}));

    renderLoginPage();

    await user.type(screen.getByLabelText(/correo/i), 'admin@crmpyme.com');
    await user.type(screen.getByLabelText(/contraseña/i), '123456');
    await user.click(screen.getByRole('button', { name: /login/i }));

    const boton = screen.getByRole('button', { name: /ingresando\.\.\./i });
    expect(boton).toBeDisabled();
  });

  test('CP-12: Un doble clic no envía más de una petición', async () => {
    const user = userEvent.setup();
    login.mockReturnValue(new Promise(() => {}));

    renderLoginPage();

    const boton = screen.getByRole('button', { name: /login/i });

    await user.type(screen.getByLabelText(/correo/i), 'admin@crmpyme.com');
    await user.type(screen.getByLabelText(/contraseña/i), '123456');

    await user.dblClick(boton);

    expect(login).toHaveBeenCalledTimes(1);
  });

  test('CP-13: Si ocurre un error, el botón vuelve a habilitarse', async () => {
    const user = userEvent.setup();
    login.mockRejectedValue(new Error('Credenciales inválidas'));

    renderLoginPage();

    await user.type(screen.getByLabelText(/correo/i), 'admin@crmpyme.com');
    await user.type(screen.getByLabelText(/contraseña/i), '123456');
    await user.click(screen.getByRole('button', { name: /login/i }));

    const botonRehabilitado = await screen.findByRole('button', { name: /login/i });
    expect(botonRehabilitado).not.toBeDisabled();
  });

  test('CP-14: Los mensajes de error incorporan el rol de alerta para accesibilidad', async () => {
    const user = userEvent.setup();
    login.mockRejectedValue(new Error('Correo o contraseña incorrectos'));

    renderLoginPage();

    await user.type(screen.getByLabelText(/correo/i), 'admin@crmpyme.com');
    await user.type(screen.getByLabelText(/contraseña/i), '123456');
    await user.click(screen.getByRole('button', { name: /login/i }));

    const alerta = await screen.findByRole('alert');
    expect(alerta).toHaveTextContent('Correo o contraseña incorrectos');
  });
});