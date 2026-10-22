require('dotenv').config();
const express = require('express');
const cors = require('cors'); // 1. Importar el paquete CORS
const { ok, fail } = require('./utils/apiResponse');
const authService = require('./modules/auth/auth.service');

const app = express();

// 2. Configurar CORS antes de los middlewares de rutas
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
}));

app.use(express.json());

app.get('/ping', (req, res) => res.send('pong'));

app.post('/auth/login', async (req, res) => {
  const { correo, password } = req.body;
  if (!correo || !password) return fail(res, 400, 'DATOS_FALTANTES', 'Correo y contraseña son obligatorios');
  try {
    const resultado = await authService.login(correo, password);
    return ok(res, resultado);
  } catch (err) {
    return fail(res, err.status || 500, err.code || 'ERROR_INTERNO', err.message || 'Error inesperado');
  }
});

app.listen(3000, () => console.log('Servidor escuchando en http://localhost:3000'));