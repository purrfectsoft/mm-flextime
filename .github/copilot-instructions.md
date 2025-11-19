# Copilot / AI Assist Guidance — mm-flextime-microsite

Summary

- This is a small, single-page static microsite. All dynamic features are implemented in `index.js` and the lightweight i18n micro-library at `scripts/i18n.js`.
- Key responsibilities for an AI agent: make safe UI changes, update translations, keep DOM queries stable, and preserve i18n usage patterns.

Big picture

- Single-page static site (no build/SSR). Content is served from `index.html` with CDN dependencies (Tailwind, Chart.js, Lucide), and runtime behaviors in `index.js`.
- Localization is file-based: `locales/*.json` loaded by `scripts/i18n.js` (exposes `window.i18n`, `t`, `tx`).
- Charts are created globally (`visitMixChart`, `staffingTierChart`) and tests expect those objects to exist on `window`.

Developer workflows (quick commands)

- Start local server: `npm run start` (runs `python -m http.server 5500`) — browse `http://127.0.0.1:5500`.
- Run E2E tests: `npm run test:e2e` (Playwright; will use `webServer` if no server).
- Validate translation keys and HTML usage: `npm run i18n:validate`.
- Format code: `npm run format:fix` (Prettier).
- Update version/hashes for deployment: `npm run version` (runs `scripts/update-hashes.js` and stages changes).
- Deploy: `npm run deploy` (runs `scripts/deploy.js`; requires `.env` with SSH vars and a deploy git branch).

Key files to review before coding

- `index.js` — Largest file; contains UI state, DOM queries, charts, and the model. Use `createTransientElement`, `parseHtmlFragment`, or `createTranslatedElement` for DOM + i18n content.
- `index.html` — Script tags include `index.js`, `index.css` and `scripts/i18n.js` with hashed query params. `data-html-hash` & `data-locales-hash` are used to track deploy changes.
- `scripts/i18n.js` — The micro i18n library; provides `t` (key+vars) and `tx` (printf-like) and methods `init()` and `setLanguage()`.
- `locales/*.json` — Translation files (en.json / bn.json) — keys ending with `.html` may contain HTML.
- `scripts/validate-i18n.js` — Checks HTML in strings and enforces `.html` naming conventions for keys with HTML.
- `scripts/update-hashes.js` — Computes content hashes and updates `index.html` with `?v=...` for cache-busting and updates `APP_VERSION` in `scripts/i18n.js`.
- `scripts/deploy.js` — Production deploy flow; uses `.env`, an SSH connection, and expects a `deploy` branch to be pushed.
- `tests/e2e/i18n.spec.js` — Playwright E2E tests verifying translation application and Chart creation.
- `playwright.config.js` — Test runner config and `baseURL`.

Patterns & conventions to follow

- Translation & i18n
    - Use `data-i18n` (and `data-i18n-html` if HTML) on elements for declarative replacement.
    - Prefer `t('scope.key', { vars })` for named interpolation and `tx('key', arg1, arg2)` for printf-style substitutions.
    - HTML content in translations must use `.html` suffix (e.g., `staffing.services.tier.2.html`). Add a warning if not.
    - Use `parseHtmlFragment` / `createTransientElement` helpers to safely insert HTML fragments (avoids raw `innerHTML` usage).
    - Avoid placing raw translation keys or raw `{{...}}` placeholders in the DOM. Tests assert keys are not visible.

- DOM & JS
    - Use `createTranslatedElement(tag, 'translation.key')` for small elements to attach `data-i18n` and initial content.
    - For dynamic content with complex markup, build a DocumentFragment using `parseHtmlFragment` or `createTransientElement`.
    - Global Chart.js instances (e.g., `visitMixChart`) are expected in tests — if you change them, keep global names consistent.
    - Preserve existing element IDs queried by `index.js` (e.g., `#staffing-tier-slider`, `#occupancy-slider`, `#dynamic-payroll-table-body`) to avoid breaking UI code and tests.
    - Use `window.i18n.ready` (or `i18n-ready` event) if adding JS that depends on translations being loaded.

- Files, versioning & deployment
    - `update-hashes.js` writes `APP_VERSION` to `scripts/i18n.js` and updates `index.html` hashes; run `npm run version` before creating a release.
    - `deploy.js` checks git branch `develop` and merges into `deploy`, expects `.env` to be configured (`SSH_HOST`, `SSH_USER`, `SSH_KEY_PATH`, `WEB_ROOT`, `WEB_URL`).
    - For deploy verification, the script compares HTML + CSS + JS + locales hashes found in the remote `WEB_URL` with local hashes.

Examples (copyable patterns from repo)

- Safe HTML injection w/ i18n:
    - `const frag = parseHtmlFragment('model_assumptions.max_daily_revenue_html', formatBDT(MAX_DAILY_REVENUE)); elem.replaceChildren(frag);`
    - `const el = createTranslatedElement('td', 'payroll.table.department_subtotal', 'Dept Subtotal');`
- t() & tx() examples:
    - `t('staffing.current_tier_label', { tier: 2, label: t('staffing.tier.2.name') })`
    - `tx('label.session_with_percent', t('pricing.visitmix.foundation'), '20%')`

Tests & CI tips

- Playwright tests depend on `http://127.0.0.1:5500` or `webServer` in `playwright.config.js`. Use `npm run test:e2e` to run them.
- E2E assertions check for no console errors and that no raw translation keys are visible. Keep translations updated and validated.
- Before proposing changes that touch UI copy, run `npm run i18n:validate` and add new keys to all locales.

Small 'do's & don'ts

- Do: use translation keys for all visible strings and use `data-i18n` where possible.
- Do: use `parseHtmlFragment`/`createTransientElement` for markup-containing translations.
- Do: run `npm run i18n:validate` after adding or editing translations.
- Don't: add `innerHTML` or raw HTML directly to elements; prefer the helpers.
- Don't: rename IDs referenced in `index.js` without updating `index.js` references and tests.

If unclear, check

- Start by reading `AGENTS.md` and `README.md` (high-level context); then open `index.js` and `scripts/i18n.js` (runtime patterns).
- For translations, update `locales/en.json` and `locales/bn.json` and run `npm run i18n:validate`.

Would you like me to update or expand any specific section (examples, workflows, tests, or edge cases)?
