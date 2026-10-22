import { test, expect } from '@playwright/test';

test.describe('Pruebas E2E - Taller HU-01', () => {

  test('E2E-04: Redirección automática de dashboard a login sin sesión activa (CA-09)', async ({ page }) => {
    await page.goto('/dashboard/admin');
    await expect(page).toHaveURL('http://localhost:5173/');
  });

  test('E2E-05: Visualización de alerta al recibir código 423 por cuenta bloqueada (CA-04)', async ({ page }) => {
    await page.route('**/api/auth/login', async (route) => {
      await route.fulfill({
        status: 423,
        contentType: 'application/json',
        body: JSON.stringify({
          success: false,
          error: {
            code: 'CUENTA_BLOQUEADA',
            message: 'Cuenta bloqueada. Intenta de nuevo en 5 minuto (s).'
          }
        })
      });
    });

    await page.goto('/');
    await page.getByLabel(/correo/i).fill('bloqueado@crmpyme.com');
    await page.getByLabel(/contraseña/i).fill('123456');
    await page.getByRole('button', { name: /login/i }).click();

    await expect(page.getByRole('alert')).toContainText('Cuenta bloqueada');
  });

});