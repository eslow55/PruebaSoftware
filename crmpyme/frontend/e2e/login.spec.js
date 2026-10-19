import { test, expect } from '@playwright/test';

const URL_LOGIN_API = 'http://localhost:3000/auth/login';

// Simula la respuesta del backend: el navegador cree que habló con Express
async function simularBackend(page, status, body) {
  await page.route(URL_LOGIN_API, (route) =>
    route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(body) })
  );
}

async function iniciarSesion(page, correo, password) {
  await page.goto('/');
  await page.getByLabel('Correo').fill(correo);
  await page.getByLabel('Contraseña').fill(password);
  await page.getByRole('button', { name: 'Login' }).click();
}

test('E2E-01: el administrador entra y llega a su dashboard', async ({ page }) => {
  await simularBackend(page, 200, {
    success: true,
    data: { token: 'jwt-e2e', usuario: { id: 1, nombre: 'Administrador Inicial', rol: 'administrador' } },
  });

  await iniciarSesion(page, 'admin@crm.local', 'Admin123');

  await expect(page).toHaveURL(/\/dashboard\/admin$/);
  await expect(page.getByRole('heading', { name: 'Dashboard Admin' })).toBeVisible();

  const token = await page.evaluate(() => localStorage.getItem('token'));
  expect(token).toBe('jwt-e2e');
});

test('E2E-02: credenciales incorrectas muestran el error y no se pierde la página', async ({ page }) => {
  await simularBackend(page, 401, {
    success: false,
    error: { code: 'CREDENCIALES_INVALIDAS', message: 'Correo o contraseña incorrectos' },
  });

  await iniciarSesion(page, 'admin@crm.local', 'claveMala');

  await expect(page.getByText('Correo o contraseña incorrectos')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Iniciar sesión' })).toBeVisible();
  await expect(page).toHaveURL('http://localhost:5173/');
});

test('E2E-03: el navegador no deja enviar un correo mal escrito', async ({ page }) => {
  let peticiones = 0;
  await page.route(URL_LOGIN_API, (route) => { peticiones++; return route.abort(); });

  await iniciarSesion(page, 'esto-no-es-un-correo', 'Admin123');

  const valido = await page.getByLabel('Correo').evaluate((input) => input.checkValidity());
  expect(valido).toBe(false);
  expect(peticiones).toBe(0);
});