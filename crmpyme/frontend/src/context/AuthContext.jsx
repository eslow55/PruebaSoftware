import { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(() => {
    const guardado = localStorage.getItem('usuario');
    return guardado ? JSON.parse(guardado) : null;
  });

  const [token, setToken] = useState(() => localStorage.getItem('token') || null);

  const login = async (correo, password) => {
    if (correo === 'admin@crmpyme.com' && password === '123456') {
      const data = {
        token: 'fake-jwt-token',
        usuario: { id: 1, correo, rol: 'admin' }
      };
      setToken(data.token);
      setUsuario(data.usuario);
      localStorage.setItem('token', data.token);
      localStorage.setItem('usuario', JSON.stringify(data.usuario));
      return data;
    }
    throw new Error('Correo o contraseña incorrectos');
  };

  const logout = () => {
    setToken(null);
    setUsuario(null);
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
  };

  return (
    <AuthContext.Provider value={{ usuario, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return context;
};