import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000',
});

export const login = async (correo, password) => {
  const respuesta = await api.post('/api/auth/login', { correo, password });
  return respuesta.data.data;
};

export default api;