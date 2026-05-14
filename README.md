# TweenieAI QA Automation

End-to-end UI tests for [TweenieAI UAT](https://platform.uat.tweenieai.com/) built with **Playwright + TypeScript**, authored with the help of **Microsoft Playwright MCP**, executed on **GitHub Actions**, and reported on **Cloudflare Pages**.

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

- Node.js **≥ 20** (project uses Node 24 locally)
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

`.mcp.json` registers the Playwright MCP server so AI editors (Claude Code, Cursor, etc.) can drive a real browser while you describe what to test in natural language.

**Example prompts** to your AI editor with MCP loaded:
- *"Open the login page, take a snapshot, and list every interactive element."*
- *"Sign in with the UAT account from .env.local, then write a Playwright test that asserts the dashboard greeting is visible."*
- *"Record a flow: create a new project, rename it, then delete it. Save the result as `tests/specs/project-crud.spec.ts`."*

MCP runs **only on your local machine** — CI uses `@playwright/test` directly.

## Credentials & secrets

Never commit credentials.
- Local: `.env.local` (gitignored)
- CI: GitHub Secrets (`TEST_USER_EMAIL`, `TEST_USER_PASSWORD`) — wired up in Phase 4

## Roadmap

- ✅ Phase 0 — old project archived to `../_legacy/`
- ✅ Phase 1 — project skeleton, TS config, Playwright config
- ✅ Phase 2 — Playwright MCP integration
- ✅ Phase 3 — POM + auth fixture + smoke spec
- ⏳ Phase 4 — GitHub Actions workflow (PR-triggered, sharded, merged report)
- ⏳ Phase 5 — Cloudflare Pages deploy of HTML report per PR
- ⏳ Phase 6 — CODEOWNERS, PR template, branch protection
