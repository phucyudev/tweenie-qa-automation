import { test as base, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage.js';

type TestCredentials = {
  email: string;
  password: string;
};

type Fixtures = {
  credentials: TestCredentials;
  loginPage: LoginPage;
};

function readCredentials(): TestCredentials {
  const email = process.env.TEST_USER_EMAIL;
  const password = process.env.TEST_USER_PASSWORD;
  if (!email || !password) {
    throw new Error(
      'Missing TEST_USER_EMAIL or TEST_USER_PASSWORD. Copy .env.example to .env.local and fill in the QA test account.',
    );
  }
  return { email, password };
}

export const test = base.extend<Fixtures>({
  credentials: async ({}, use) => {
    await use(readCredentials());
  },
  loginPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    await loginPage.open();
    await use(loginPage);
  },
});

export { expect };
