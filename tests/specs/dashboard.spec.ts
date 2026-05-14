import { test, expect } from '../fixtures/auth.fixture.js';
import { DashboardPage } from '../pages/DashboardPage.js';

test.describe('Dashboard: TweenieAI UAT', () => {
  test('user can log in and start a new chat from the dashboard', async ({
    page,
    loginPage,
    credentials,
  }) => {
    await loginPage.login(credentials.email, credentials.password);

    const dashboard = new DashboardPage(page);
    await dashboard.waitForLoaded();
    await expect(dashboard.workspaceLabel).toBeVisible();
    await expect(dashboard.taskInput).toBeVisible();

    await dashboard.startNewChat();

    await expect(page).toHaveURL(/\/dashboard/);
    await expect(dashboard.taskInput).toBeVisible();
  });
});
