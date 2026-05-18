import { expect, type Locator, type Page } from '@playwright/test';
import { BasePage } from './BasePage.js';

export class DashboardPage extends BasePage {
  readonly greeting: Locator;
  readonly newChatNav: Locator;
  readonly flowsNav: Locator;
  readonly taskComposer: Locator;
  readonly taskComposerPlaceholder: Locator;
  readonly workspaceLabel: Locator;

  constructor(page: Page) {
    super(page);
    this.greeting = page.getByText(
      /(Good (morning|afternoon|evening|night)|It['’]s (quite )?(late|early))/i,
    );
    this.newChatNav = page.getByText('New Chat', { exact: true });
    this.flowsNav = page.getByText('Flows', { exact: true });
    this.taskComposer = page.locator('main').getByRole('textbox');
    this.taskComposerPlaceholder = page.getByText('Give Diaflow a task');
    this.workspaceLabel = page.getByText('My Workspace', { exact: true });
  }

  async waitForLoaded(): Promise<void> {
    // Login goes through an SSO redirect (workspace-specific subdomain → /redirect?…)
    // before landing on /dashboard. CI cold starts can take >10s for the round-trip,
    // so allow 30s instead of the default expect timeout.
    await this.page.waitForURL(/\/dashboard/, { timeout: 30_000 });
    await expect(this.taskComposer).toBeVisible();
    await expect(this.newChatNav).toBeVisible();
  }

  async startNewChat(): Promise<void> {
    await this.newChatNav.click();
  }
}
