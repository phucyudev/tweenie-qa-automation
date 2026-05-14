import type { Page } from '@playwright/test';

export abstract class BasePage {
  constructor(protected readonly page: Page) {}

  async goto(path = '/'): Promise<void> {
    await this.page.goto(path);
  }

  async waitForReady(): Promise<void> {
    await this.page.waitForLoadState('domcontentloaded');
  }
}
