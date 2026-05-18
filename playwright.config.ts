import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

dotenv.config({ path: path.resolve(__dirname, '.env.local'), quiet: true });

const isCI = !!process.env.CI;

export default defineConfig({
  testDir: './tests/specs',
  timeout: isCI ? 45_000 : 60_000,
  expect: { timeout: 10_000 },
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 2 : 0,
  workers: isCI ? 2 : undefined,

  reporter: isCI
    ? [
        ['html', { outputFolder: 'playwright-report', open: 'never' }],
        ['json', { outputFile: 'playwright-report/results.json' }],
        ['github'],
        ['list'],
      ]
    : [['html', { open: 'never' }], ['list']],

  outputDir: 'test-results',

  use: {
    baseURL: process.env.BASE_URL ?? 'https://platform.tweenieai.com/',
    trace: isCI ? 'on-first-retry' : 'retain-on-failure',
    video: isCI ? 'retain-on-failure' : 'off',
    screenshot: 'only-on-failure',
    actionTimeout: 15_000,
    navigationTimeout: 30_000,
    launchOptions: {
      // Local default 150ms; override via SLOWMO_MS env var for demo walkthroughs.
      slowMo: isCI ? 0 : Number(process.env.SLOWMO_MS ?? 150),
    },
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    // Enable cross-browser coverage by running:
    //   pnpm exec playwright install firefox webkit
    // then un-comment the projects below.
    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // },
    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] },
    // },
  ],
});
