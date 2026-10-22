import { login } from './authApi';

// vi.hoisted crea la función falsa ANTES de que se ejecute vi.mock
const { postFalso } = vi.hoisted(() => ({ postFalso: vi.fn() }));

vi.mock('axios', () => ({
  default: {
    create: () => ({ post: postFalso }),
  },
}));

describe('authApi.login', () => {
  test('CP-U01: envía correo y password a POST /auth/login', async () => {
    postFalso.mockResolvedValue({ data: { success: true, data: { token: 'abc', usuario: {} } } });
    await login('admin@crm.local', 'Admin123*');
    expect(postFalso).toHaveBeenCalledTimes(1);
    expect(postFalso).toHaveBeenCalledWith('/auth/login', {
      correo: 'admin@crm.local',
      password: 'Admin123*',
    });
  });

  test('CP-U02: devuelve solo el contenido de data (token y usuario)', async () => {
    const usuario = { id: 1, nombre: 'Admin', rol: 'administrador' };
    postFalso.mockResolvedValue({ data: { success: true, data: { token: 'abc', usuario } } });
    const resultado = await login('admin@crm.local', 'Admin123*');
    expect(resultado).toEqual({ token: 'abc', usuario });
  });

  test('CP-U03: si el backend responde error, la promesa se rechaza', async () => {
    const errorHttp = { response: { status: 401 } };
    postFalso.mockRejectedValue(errorHttp);
    await expect(login('x@crm.local', 'mala')).rejects.toBe(errorHttp);
  });
});