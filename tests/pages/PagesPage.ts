import { expect, type Locator, type Page } from '@playwright/test';
import { BasePage } from './BasePage.js';

export class PagesPage extends BasePage {
  readonly pagesNav: Locator;
  readonly heading: Locator;
  readonly searchInput: Locator;
  readonly createButton: Locator;
  readonly personalTab: Locator;
  readonly trashTab: Locator;

  readonly createMenu: Locator;
  readonly blankDocumentItem: Locator;
  readonly importWordItem: Locator;
  readonly importMarkdownItem: Locator;
  readonly importTxtItem: Locator;
  readonly importOdtItem: Locator;
  readonly importDriveItem: Locator;

  readonly chooseFolderDialog: Locator;
  readonly chooseFolderHeading: Locator;
  readonly chooseFolderCancel: Locator;
  readonly chooseFolderConfirm: Locator;

  readonly trashRestoreAll: Locator;
  readonly trashDeleteAll: Locator;

  readonly sortDropdownTrigger: Locator;
  readonly sortDropdownPanel: Locator;
  readonly noResultMessage: Locator;

  readonly personalCreateFolderTrigger: Locator;
  readonly folderCreateDialog: Locator;
  readonly folderNameInput: Locator;
  readonly folderCreateConfirm: Locator;
  readonly folderCreateCancel: Locator;

  constructor(page: Page) {
    super(page);
    this.pagesNav = page.getByText('Pages', { exact: true }).first();
    this.heading = page.locator('main').getByText('Pages', { exact: true });
    // Diaflow team's convention is plain `id` attributes (not data-testid).
    // The Pages search input is one of the few elements already tagged —
    // use the id directly for the most stable locator.
    this.searchInput = page.locator('#input-search-filter');
    // 'Create' appears twice in main: the toolbar button (primary, first in
    // DOM order) and a badge button inside the Personal tab. We grab the
    // toolbar one for the document-create menu.
    this.createButton = page
      .locator('main')
      .getByRole('button', { name: 'Create', exact: true })
      .first();
    this.personalTab = page.getByRole('button', { name: /^Personal/ });
    this.trashTab = page.getByRole('button', { name: 'Trash' });

    this.createMenu = page.getByRole('menu');
    this.blankDocumentItem = page.getByRole('menuitem', { name: 'Blank document' });
    this.importWordItem = page.getByRole('menuitem', { name: 'Import Word (.docx)' });
    this.importMarkdownItem = page.getByRole('menuitem', { name: 'Import Markdown (.md)' });
    this.importTxtItem = page.getByRole('menuitem', { name: 'Import TXT (.txt)' });
    this.importOdtItem = page.getByRole('menuitem', { name: 'Import ODT (.odt)' });
    this.importDriveItem = page.getByRole('menuitem', { name: 'Import from Drive' });

    // 'Choose a folder' dialog that appears after picking Blank document from
    // the toolbar Create menu — distinct from the folder-create dialog below.
    this.chooseFolderDialog = page.getByRole('dialog').filter({ hasText: 'Choose a folder' });
    this.chooseFolderHeading = page.getByRole('heading', { name: 'Choose a folder' });
    this.chooseFolderCancel = this.chooseFolderDialog.getByRole('button', { name: 'Cancel' });
    this.chooseFolderConfirm = this.chooseFolderDialog.getByRole('button', { name: 'Confirm' });

    // Trash tab action buttons appear in the content area only after switchToTrash()
    this.trashRestoreAll = page.locator('main').getByRole('button', { name: 'Restore all' });
    this.trashDeleteAll = page.locator('main').getByRole('button', { name: 'Delete all' });

    // Ant Design exposes role=combobox on a hidden input; the visible click
    // target is .ant-select-selector. Scope to main since the folder-picker
    // dialog also renders a select.
    this.sortDropdownTrigger = page.locator('main .ant-select-selector').first();
    this.sortDropdownPanel = page.locator(
      '.ant-select-dropdown:not(.ant-select-dropdown-hidden)',
    );
    this.noResultMessage = page.getByText(/Sorry, we couldn['’]t find/i);

    // Personal tab wraps a nested Create button (for folder creation) and a
    // Toggle button. We target the nested Create — second occurrence of
    // 'Create' in main when no dialog is open (first is the toolbar Create).
    this.personalCreateFolderTrigger = page
      .locator('main')
      .getByRole('button', { name: 'Create', exact: true })
      .nth(1);

    // Folder-create dialog: the Confirm button is also labelled 'Create',
    // so we scope every locator to a dialog that contains the name input
    // placeholder, which is unique to this dialog.
    this.folderCreateDialog = page
      .getByRole('dialog')
      .filter({ has: page.getByPlaceholder('Enter name here') });
    this.folderNameInput = this.folderCreateDialog.getByPlaceholder('Enter name here');
    this.folderCreateConfirm = this.folderCreateDialog.getByRole('button', {
      name: 'Create',
      exact: true,
    });
    this.folderCreateCancel = this.folderCreateDialog.getByRole('button', {
      name: 'Cancel',
      exact: true,
    });
  }

  async openFromSidebar(): Promise<void> {
    await this.pagesNav.click();
    // toHaveURL polls page.url() without waiting for the 'load' event, which
    // the Diaflow SPA frequently does not refire on intra-app route changes
    // (see DashboardPage.waitForLoaded for the original investigation).
    await expect(this.page).toHaveURL(/\/pages/, { timeout: 30_000 });
  }

  async openCreateMenu(): Promise<void> {
    await this.createButton.click();
    await expect(this.createMenu).toBeVisible();
  }

  async closeCreateMenu(): Promise<void> {
    await this.page.keyboard.press('Escape');
    await expect(this.createMenu).toBeHidden();
  }

  async startBlankDocument(): Promise<void> {
    await this.blankDocumentItem.click();
  }

  async cancelChooseFolder(): Promise<void> {
    await this.chooseFolderCancel.click();
  }

  async confirmChooseFolder(): Promise<void> {
    await this.chooseFolderConfirm.click();
    // Wait for the post-Confirm side effect to settle: Diaflow either
    // dismisses the dialog (rare) or navigates to the document editor at
    // /document/<id>. Without this wait, the next test step sees the page
    // mid-transition and either fails its locator or interacts with the
    // wrong screen.
    await Promise.race([
      this.page.waitForURL(/\/document\//, { timeout: 10_000 }),
      this.chooseFolderDialog.waitFor({ state: 'hidden', timeout: 10_000 }),
    ]).catch(() => {});
  }

  /**
   * After Confirm on Blank document (and some import variants) Diaflow
   * navigates to the editor at /document/<id>. For sequential test steps
   * we need to return to /pages and wait for the Pages heading.
   *
   * IMPORTANT: Diaflow keeps its auth token in SPA memory. Full reloads
   * (page.goto) on either platform.tweenieai.com or the workspace
   * subdomain (e.g. aa892.tweenieai.com) lose that token and bounce us
   * to /login. We therefore navigate via history (goBack) which keeps
   * the SPA process alive, falling back to clicking the sidebar Pages
   * link if back-nav doesn't land us in the right place.
   */
  async ensureOnPagesList(): Promise<void> {
    if (!/\/pages(\?|$)/.test(this.page.url())) {
      // Diaflow uses replaceState on the /pages → /document/<id> transition,
      // so a single goBack from the editor lands on /dashboard (not /pages).
      // Step back once to exit the editor — that restores the dashboard
      // chrome with the full sidebar — then SPA-navigate into Pages.
      await this.page.goBack().catch(() => {});
      await this.pagesNav.click({ timeout: 5_000 }).catch(() => {});
    }
    await expect(this.page).toHaveURL(/\/pages/, { timeout: 15_000 });
    await expect(this.heading).toBeVisible({ timeout: 10_000 });
  }

  async searchFor(query: string): Promise<void> {
    await this.searchInput.fill(query);
  }

  async clearSearch(): Promise<void> {
    await this.searchInput.fill('');
  }

  async openSortDropdown(): Promise<void> {
    await this.sortDropdownTrigger.click();
    await expect(this.sortDropdownPanel).toBeVisible();
  }

  async closeSortDropdown(): Promise<void> {
    await this.page.keyboard.press('Escape');
  }

  async selectSortBy(option: 'Date created' | 'Date modified'): Promise<void> {
    await this.openSortDropdown();
    await this.sortDropdownPanel.getByText(option, { exact: true }).click();
    // After click the panel dismisses and the trigger reflects the new value.
    await expect(this.sortDropdownTrigger).toContainText(option);
  }

  async switchToTrash(): Promise<void> {
    await this.trashTab.click();
  }

  async switchToPersonal(): Promise<void> {
    await this.personalTab.click();
  }

  /**
   * Open the folder-name dialog, type a name, submit. Returns whether the
   * dialog closed (true = created, false = error / still open).
   */
  private async attemptCreateFolder(name: string): Promise<boolean> {
    await this.personalCreateFolderTrigger.click({ force: true });
    await expect(this.folderCreateDialog).toBeVisible({ timeout: 5_000 });
    await this.folderNameInput.fill(name);
    await this.folderCreateConfirm.click();
    return await this.folderCreateDialog
      .waitFor({ state: 'hidden', timeout: 3_000 })
      .then(() => true)
      .catch(() => false);
  }

  /**
   * Create a Personal folder. If `baseName` already exists, try
   * `${baseName}1`, `${baseName}2`, … up to 20 times. Returns the actual
   * name that was successfully created.
   */
  async createPersonalFolder(baseName: string): Promise<string> {
    for (let attempt = 0; attempt < 20; attempt += 1) {
      const candidate = attempt === 0 ? baseName : `${baseName}${attempt}`;
      const created = await this.attemptCreateFolder(candidate);
      if (created) return candidate;
      // Dialog stayed open — collision. Cancel and try the next name.
      if (await this.folderCreateDialog.isVisible().catch(() => false)) {
        await this.folderCreateCancel.click();
        await expect(this.folderCreateDialog).toBeHidden({ timeout: 5_000 });
      }
    }
    throw new Error(`Exhausted attempts to create a folder starting with "${baseName}"`);
  }
}