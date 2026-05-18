import { test, expect } from '../fixtures/auth.fixture.js';
import { DashboardPage } from '../pages/DashboardPage.js';
import { PagesPage } from '../pages/PagesPage.js';

test.describe('Pages: TweenieAI', () => {
  test('user can open Pages section and reach the Create document flow', async ({
    page,
    loginPage,
    credentials,
  }) => {
    await loginPage.login(credentials.email, credentials.password);

    const dashboard = new DashboardPage(page);
    await dashboard.waitForLoaded();

    const pages = new PagesPage(page);
    await pages.openFromSidebar();

    await expect(page).toHaveURL(/\/pages$/);
    await expect(pages.heading).toBeVisible();
    await expect(pages.searchInput).toBeVisible();
    await expect(pages.createButton).toBeVisible();
    await expect(pages.personalTab).toBeVisible();
    await expect(pages.trashTab).toBeVisible();

    await pages.openCreateMenu();
    await expect(pages.blankDocumentItem).toBeVisible();
    await expect(pages.importWordItem).toBeVisible();
    await expect(pages.importMarkdownItem).toBeVisible();

    await pages.startBlankDocument();
    await expect(pages.chooseFolderDialog).toBeVisible();
    await expect(pages.chooseFolderHeading).toBeVisible();
    await expect(pages.chooseFolderCancel).toBeVisible();

    await pages.cancelChooseFolder();
    await expect(pages.chooseFolderDialog).toBeHidden();
  });
});