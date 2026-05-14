import { test, expect } from '../fixtures/auth.fixture.js';

test.describe('Smoke: TweenieAI UAT', () => {
  test('login page renders all required controls', async ({ loginPage }) => {
    await loginPage.expectLoaded();
    await expect(loginPage.googleButton).toBeVisible();
    await expect(loginPage.forgotPasswordLink).toBeVisible();
  });

  test('valid credentials log the user in', async ({ loginPage, credentials, page }) => {
    await loginPage.login(credentials.email, credentials.password);
    await expect(page).not.toHaveURL(/login/i, { timeout: 15_000 });
  });
});
