import { expect, type Locator, type Page } from '@playwright/test';
import { BasePage } from './BasePage.js';

export class DashboardPage extends BasePage {
  readonly greeting: Locator;
  readonly newChatNav: Locator;
  readonly flowsNav: Locator;
  readonly taskInput: Locator;
  readonly workspaceLabel: Locator;

  constructor(page: Page) {
    super(page);
    this.greeting = page.getByText(
      /(Good (morning|afternoon|evening|night)|It['’]s (quite )?(late|early))/i,
    );
    this.newChatNav = page.getByText('New Chat', { exact: true });
    this.flowsNav = page.getByText('Flows', { exact: true });
    this.taskInput = page.getByText('Give Diaflow a task');
    this.workspaceLabel = page.getByText('My Workspace', { exact: true });
  }

  async waitForLoaded(): Promise<void> {
    // Login flows through an SSO redirect (automation.uat.tweenieai.com/redirect?...)
    // before landing on the dashboard. CI cold starts can take >10s for the
    // round-trip, so allow up to 30s instead of the default expect timeout.
    await this.page.waitForURL(/\/dashboard/, { timeout: 30_000 });
    await expect(this.taskInput).toBeVisible();
    await expect(this.newChatNav).toBeVisible();
  }

  async startNewChat(): Promise<void> {
    await this.newChatNav.click();
  }
}
