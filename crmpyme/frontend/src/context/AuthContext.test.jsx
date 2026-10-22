import { renderHook, act } from '@testing-library/react';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { AuthProvider, useAuth } from './AuthContext';
import { loginService } from '../api/authApi';

// Mock del servicio de la API de autenticación
vi.mock('../api/authApi', () => ({
  loginService: vi.fn()
}));

describe('AuthContext - Pruebas Unitarias', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  test('CP-09: Estado inicial nulo cuando no hay datos almacenados en localStorage', () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider
    });

    expect(result.current.usuario).toBeNull();
    expect(result.current.token).toBeNull();
  });

  test('CP-10: Carga la sesión almacenada en localStorage al montar el proveedor', () => {
    const usuarioMock = { id: 1, correo: 'admin@crmpyme.com', rol: 'admin' };
    localStorage.setItem('token', 'fake-jwt-token');
    localStorage.setItem('usuario', JSON.stringify(usuarioMock));

    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider
    });

    expect(result.current.token).toBe('fake-jwt-token');
    expect(result.current.usuario).toEqual(usuarioMock);
  });

  test('login: Almacena token y usuario en localStorage y actualiza el estado', async () => {
    const datosRespuesta = {
      token: 'jwt-token-123',
      usuario: { id: 2, correo: 'vendedor@crmpyme.com', rol: 'vendedor' }
    };
    loginService.mockResolvedValue(datosRespuesta);

    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider
    });

    await act(async () => {
      await result.current.login('vendedor@crmpyme.com', '123456');
    });

    expect(result.current.token).toBe('jwt-token-123');
    expect(result.current.usuario).toEqual(datosRespuesta.usuario);
    expect(localStorage.getItem('token')).toBe('jwt-token-123');
    expect(localStorage.getItem('usuario')).toBe(JSON.stringify(datosRespuesta.usuario));
  });

  test('logout: Elimina las llaves de localStorage y limpia el estado', () => {
    localStorage.setItem('token', 'jwt-token-123');
    localStorage.setItem('usuario', JSON.stringify({ id: 1 }));

    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider
    });

    act(() => {
      result.current.logout();
    });

    expect(result.current.token).toBeNull();
    expect(result.current.usuario).toBeNull();
    expect(localStorage.getItem('token')).toBeNull();
    expect(localStorage.getItem('usuario')).toBeNull();
  });
});

vi.mock('../api/authApi', () => ({
  login: vi.fn(),
}));