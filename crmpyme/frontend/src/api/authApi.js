import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000',
});

export const login = async (correo, password) => {
  // Cambiar '/api/auth/login' por '/auth/login' para alinearlo con el test unitario
  const respuesta = await api.post('/auth/login', { correo, password });
  return respuesta.data.data;
};

export default api;