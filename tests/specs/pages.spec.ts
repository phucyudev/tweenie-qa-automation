import { test, expect } from '../fixtures/auth.fixture.js';
import type { Locator } from '@playwright/test';
import { DashboardPage } from '../pages/DashboardPage.js';
import { PagesPage } from '../pages/PagesPage.js';

test.describe('Pages: TweenieAI', () => {
  test('full Pages workflow on a single browser', async ({
    page,
    loginPage,
    credentials,
  }) => {
    let pages!: PagesPage;

    // If any Create-option flow opens a native file picker, cancel by
    // supplying no files. Keeps the test from hanging on OS dialogs.
    page.on('filechooser', async (fc) => {
      await fc.setFiles([]).catch(() => {});
    });

    await test.step('Login and open the Pages section from the sidebar', async () => {
      await loginPage.login(credentials.email, credentials.password);
      const dashboard = new DashboardPage(page);
      await dashboard.waitForLoaded();
      pages = new PagesPage(page);
      await pages.openFromSidebar();
      await expect(page).toHaveURL(/\/pages$/);
      await expect(pages.heading).toBeVisible();
      await expect(pages.searchInput).toBeVisible();
      await expect(pages.createButton).toBeVisible();
      await expect(pages.personalTab).toBeVisible();
      await expect(pages.trashTab).toBeVisible();
    });

    const createOptions: Array<{ name: string; item: () => Locator }> = [
      { name: 'Blank document',         item: () => pages.blankDocumentItem },
      { name: 'Import Word (.docx)',    item: () => pages.importWordItem },
      { name: 'Import Markdown (.md)',  item: () => pages.importMarkdownItem },
      { name: 'Import TXT (.txt)',      item: () => pages.importTxtItem },
      { name: 'Import ODT (.odt)',      item: () => pages.importOdtItem },
      { name: 'Import from Drive',      item: () => pages.importDriveItem },
    ];

    for (const opt of createOptions) {
      await test.step(`Create flow: ${opt.name} → Choose folder → Confirm`, async () => {
        await pages.openCreateMenu();
        await opt.item().click();
        await expect(pages.chooseFolderDialog).toBeVisible();
        await expect(pages.chooseFolderHeading).toBeVisible();
        await pages.confirmChooseFolder();
        // Confirm typically navigates Blank document to /document/<id> and
        // may do the same for imports. Bring the page back to /pages so the
        // next step starts from a known state.
        await pages.ensureOnPagesList();
        await expect(pages.heading).toBeVisible();
      });
    }

    await test.step('Search "Ghun" returns the existing Ghun document', async () => {
      await pages.searchFor('Ghun');
      await expect(pages.noResultMessage).toBeHidden();
      await expect(
        page.locator('main').getByText(/Ghun/i).first(),
      ).toBeVisible({ timeout: 10_000 });
      await pages.clearSearch();
    });

    await test.step('Sort by → switch to "Date modified"', async () => {
      await pages.selectSortBy('Date modified');
      // Trigger now reflects the new selection.
      await expect(pages.sortDropdownTrigger).toContainText('Date modified');
    });

    await test.step('Create a new Personal folder named "Demo" (auto-increment on collision)', async () => {
      const created = await pages.createPersonalFolder('Demo');
      await expect(
        page.locator('main').getByRole('button', { name: new RegExp(`^${created}\\b`) }),
      ).toBeVisible({ timeout: 10_000 });
      test.info().annotations.push({ type: 'created-folder', description: created });
    });

    await test.step('Trash tab → click "Restore all"', async () => {
      await pages.switchToTrash();
      await expect(pages.trashRestoreAll).toBeVisible();
      await pages.trashRestoreAll.click();
      // If a confirmation dialog appears, accept it to complete the action.
      const confirm = page.getByRole('dialog').getByRole('button', { name: /OK|Confirm|Yes|Restore/i }).first();
      if (await confirm.isVisible({ timeout: 2_000 }).catch(() => false)) {
        await confirm.click();
      }
    });

    await test.step('Trash tab → click "Delete all"', async () => {
      await expect(pages.trashDeleteAll).toBeVisible();
      await pages.trashDeleteAll.click();
      const confirm = page.getByRole('dialog').getByRole('button', { name: /OK|Confirm|Yes|Delete/i }).first();
      if (await confirm.isVisible({ timeout: 2_000 }).catch(() => false)) {
        await confirm.click();
      }
    });
  });
});