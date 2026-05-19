# Project rules for AI agents (Claude Code, Cursor, etc.)

This file is auto-loaded by Claude Code as system context. Other AI editors
that respect `CLAUDE.md` will pick it up too.

## Target environment

- **Default test target**: `https://platform.tweenieai.com/` (Dev)
- **Do NOT** navigate to `https://platform.uat.tweenieai.com/` or any other
  environment unless the user explicitly asks for that environment in the
  current message.
- When invoking Playwright MCP `browser_navigate`, prefer reading
  `process.env.BASE_URL` (already set via `.env.local`) or default to the
  Dev URL above. Never hard-code a different host.

## Test account

- Email and password live in `.env.local` (local) and GitHub Secrets (CI),
  under the names `TEST_USER_EMAIL` and `TEST_USER_PASSWORD`.
- Never paste real credentials into chat, commits, or any file other than
  `.env.local` / `.env.example` (which holds placeholders only).
- Never log the password to console or attach it to traces.

## Locator strategy

The Diaflow UI does **not** expose semantic roles for the sidebar nav
(no `<nav>`, no `<a>`/`<button>` for nav items — they are styled `<div>`s
with onclick handlers). The Diaflow team **is** adding stable `id`
attributes (their convention is `id`, *not* `data-testid`) but rollout
is in progress, so most elements still need fallback strategies.

Preference order, most stable first:

1. **Id attribute** (Diaflow convention): `page.locator('#some-id')`.
   Most stable — not affected by layout, text changes, or i18n.
   Confirmed examples in the codebase today:
   - `#input-search-filter` — Pages search input
2. **Semantic role + accessible name**: `getByRole('button', { name: 'Continue with Email' })`.
3. **Scoped text**: `page.locator('main').getByText('Pages', { exact: true })`
   or `dialog.getByRole('button', { name: 'Cancel' })` — use when no id
   exists and the role match isn't unique.
4. Do **not** introduce absolute XPath. If a selector is genuinely
   ambiguous and no `id` exists, ask the dev team to add one (their
   convention is `id="..."` — *not* `data-testid`).

When writing new POM locators:
- First run a small diagnostic (`await el.getAttribute('id')`) to see if
  the element already has an id. Use it if so.
- Only fall through to role/text when no id is present.
- Periodically re-audit ids on screens you touch — coverage grows over
  time as the dev team backfills the convention.

## SPA navigation

Diaflow is a React SPA. Intra-app route changes frequently do not refire
the page `load` event, which breaks `page.waitForURL(...)` (it waits for
`waitUntil: 'load'` by default).

- Always assert URL changes with `expect(page).toHaveURL(/regex/)` — this
  polls `page.url()` without requiring any lifecycle event.
- Reserve `page.waitForURL(..., { waitUntil: 'commit' })` for the rare
  case where you actually need to wait on navigation commit.

## Commit messages

Do **not** add a `Co-Authored-By: Claude …` trailer. The user maintains
single-author attribution.

## Tests must pass locally before CI

- Run `pnpm exec playwright test --project=chromium` after any test or
  POM change.
- CI uses Node 22 (`pnpm` 11 requires Node ≥ 22.13) — local Node 24 is
  fine.
- The full suite currently lives in `tests/specs/{smoke,dashboard,pages}.spec.ts`
  with POMs in `tests/pages/`.