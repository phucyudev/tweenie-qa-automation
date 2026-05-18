# TweenieAI QA Automation

[![Playwright Tests](https://github.com/phucyudev/tweenie-qa-automation/actions/workflows/pr-tests.yml/badge.svg)](https://github.com/phucyudev/tweenie-qa-automation/actions/workflows/pr-tests.yml)

End-to-end UI tests for [TweenieAI Dev](https://platform.tweenieai.com/) built with **Playwright + TypeScript**, authored with the help of **Microsoft Playwright MCP**, executed on **GitHub Actions**, and reported on **Cloudflare Pages**.

## Stack

| Layer | Tool |
|---|---|
| Test framework | `@playwright/test` |
| Language | TypeScript (ESM) |
| AI-assisted authoring (local only) | `@playwright/mcp` via `.mcp.json` |
| CI | GitHub Actions *(coming in Phase 4)* |
| Report hosting | Cloudflare Pages — https://qa-automation-report.pages.dev *(Phase 5)* |
| Package manager | pnpm (via Corepack) |

## Prerequisites

- Node.js **≥ 22.13** (project uses Node 24 locally; pnpm 11.x requires Node 22.13+)
- pnpm activated via Corepack: `corepack enable pnpm`
- Browsers: `pnpm exec playwright install --with-deps`

## Getting started

```bash
pnpm install
cp .env.example .env.local        # then fill TEST_USER_PASSWORD
pnpm exec playwright install --with-deps
pnpm test                          # run full smoke suite
pnpm test:ui                       # interactive runner
pnpm test:chromium                 # single browser
pnpm test:report                   # open last HTML report
```

## Project layout

```
tests/
├── specs/          # *.spec.ts — actual tests
├── pages/          # Page Object Models (BasePage, LoginPage, …)
└── fixtures/       # custom test fixtures (auth, data factories)
playwright.config.ts
.mcp.json           # Playwright MCP server config (local only)
.env.local          # credentials (gitignored)
```

## Using Playwright MCP for AI-assisted authoring

`@playwright/mcp` is installed as a **pinned devDependency** (see `package.json`). `.mcp.json` points AI editors (Claude Code, Cursor, …) at the local binary so the version stays consistent across the team and there is no per-launch network fetch.

```bash
pnpm mcp            # start MCP server (headless, what Claude Code uses)
pnpm mcp:headed     # start with a visible browser window for debugging
pnpm mcp:isolated   # fresh browser context every session (no cookies persisted)
pnpm mcp:help       # see all flags
```

**Example prompts** to your AI editor once MCP is connected:
- *"Open the login page, take a snapshot, and list every interactive element."*
- *"Sign in with the test account from .env.local, then write a Playwright test that asserts the dashboard greeting is visible."*
- *"Record a flow: create a new project, rename it, then delete it. Save the result as `tests/specs/project-crud.spec.ts`."*

**Upgrading**: `pnpm up @playwright/mcp@latest`, then commit the lockfile so the team picks it up.

MCP runs **only on your local machine** — CI uses `@playwright/test` directly.

## Credentials & secrets

Never commit credentials.
- **Local**: `.env.local` (gitignored)
- **CI (GitHub Actions)**: repository secrets — see below

### Required GitHub Secrets

Go to **Settings → Secrets and variables → Actions → New repository secret** and add:

| Name | Value |
|---|---|
| `TEST_USER_EMAIL` | Email of the QA test account |
| `TEST_USER_PASSWORD` | Password of the QA test account |

> Tip with the GitHub CLI (pipe via stdin to avoid leaking the password into shell history):
> ```bash
> grep '^TEST_USER_EMAIL=' .env.local    | cut -d= -f2- | gh secret set TEST_USER_EMAIL
> grep '^TEST_USER_PASSWORD=' .env.local | cut -d= -f2- | gh secret set TEST_USER_PASSWORD
> ```

## CI workflow

`.github/workflows/pr-tests.yml` runs on every PR to `main` (and on direct pushes to `main`):

1. Setup Node 22 + pnpm via Corepack
2. `pnpm install --frozen-lockfile`
3. Cache Playwright browsers keyed on the installed `@playwright/test` version
4. Run `playwright test --project=chromium`
5. Upload **HTML report** as an artifact (`playwright-report-chromium-*`), retained 14 days
6. On failure, also upload `test-results/` (traces & videos), retained 7 days

Download the artifact from the Actions run summary, unzip, and open `index.html` to inspect.

Hosted report on Cloudflare Pages is wired up in Phase 5 — until then, use artifacts.

## Roadmap

- ✅ Phase 0 — old project archived to `../_legacy/`
- ✅ Phase 1 — project skeleton, TS config, Playwright config
- ✅ Phase 2 — Playwright MCP integration
- ✅ Phase 3 — POM + auth fixture + smoke spec
- ✅ Phase 4 — GitHub Actions workflow (PR-triggered, browser caching, artifact reports)
- ⏳ Phase 5 — Cloudflare Pages deploy of HTML report per PR
- ⏳ Phase 6 — CODEOWNERS, PR template, branch protection
