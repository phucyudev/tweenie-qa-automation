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
  readonly chooseFolderDialog: Locator;
  readonly chooseFolderHeading: Locator;
  readonly chooseFolderCancel: Locator;

  constructor(page: Page) {
    super(page);
    this.pagesNav = page.getByText('Pages', { exact: true }).first();
    this.heading = page.locator('main').getByText('Pages', { exact: true });
    this.searchInput = page.getByRole('textbox', { name: 'Search' });
    // 'Create' appears twice in main: the toolbar button (primary) and a badge button
    // inside the Personal tab card. The toolbar one is first in DOM order.
    this.createButton = page.locator('main').getByRole('button', { name: 'Create', exact: true }).first();
    this.personalTab = page.getByRole('button', { name: /^Personal/ });
    this.trashTab = page.getByRole('button', { name: 'Trash' });
    this.createMenu = page.getByRole('menu');
    this.blankDocumentItem = page.getByRole('menuitem', { name: 'Blank document' });
    this.importWordItem = page.getByRole('menuitem', { name: /Import Word/ });
    this.importMarkdownItem = page.getByRole('menuitem', { name: /Import Markdown/ });
    this.chooseFolderDialog = page.getByRole('dialog');
    this.chooseFolderHeading = page.getByRole('heading', { name: 'Choose a folder' });
    this.chooseFolderCancel = page.getByRole('button', { name: 'Cancel' });
  }

  async openFromSidebar(): Promise<void> {
    await this.pagesNav.click();
    await this.page.waitForURL(/\/pages/, { timeout: 30_000 });
  }

  async openCreateMenu(): Promise<void> {
    await this.createButton.click();
    await expect(this.createMenu).toBeVisible();
  }

  async startBlankDocument(): Promise<void> {
    await this.blankDocumentItem.click();
  }

  async cancelChooseFolder(): Promise<void> {
    await this.chooseFolderCancel.click();
  }
}
