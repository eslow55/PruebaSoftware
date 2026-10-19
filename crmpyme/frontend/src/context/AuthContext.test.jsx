import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AuthProvider } from './AuthContext';
import { useAuth } from './useAuth';

// Componente auxiliar SOLO para pruebas: expone lo que hay en el contexto
function Espia() {
  const { usuario, iniciarSesion } = useAuth();
  return (
    <div>
      <p data-testid="nombre">{usuario ? usuario.nombre : 'sin sesión'}</p>
      <button onClick={() => iniciarSesion('token-123', { id: 1, nombre: 'Ana', rol: 'gerente' })}>
        entrar
      </button>
    </div>
  );
}

describe('AuthProvider', () => {
  test('CP-U04: sin datos en localStorage, no hay usuario', () => {
    render(<AuthProvider><Espia /></AuthProvider>);
    expect(screen.getByTestId('nombre')).toHaveTextContent('sin sesión');
  });

  test('CP-U05: iniciarSesion guarda token y usuario en localStorage', async () => {
    const user = userEvent.setup();
    render(<AuthProvider><Espia /></AuthProvider>);
    await user.click(screen.getByRole('button', { name: 'entrar' }));
    expect(localStorage.getItem('token')).toBe('token-123');
    expect(JSON.parse(localStorage.getItem('usuario'))).toEqual({ id: 1, nombre: 'Ana', rol: 'gerente' });
    expect(screen.getByTestId('nombre')).toHaveTextContent('Ana');
  });

  test('CP-U06: si ya había sesión guardada, la recupera al cargar', () => {
    localStorage.setItem('usuario', JSON.stringify({ id: 2, nombre: 'Luis', rol: 'vendedor' }));
    render(<AuthProvider><Espia /></AuthProvider>);
    expect(screen.getByTestId('nombre')).toHaveTextContent('Luis');
  });
});