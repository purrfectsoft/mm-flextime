# Agents & Tools

This file documents the agents, automation helpers, and local runtime endpoints available when working on this repository.

**Repo Structure (top-level):**

- `index.html` — Entry HTML for the microsite
- `index.css` — Project styles
- `index.js` — Main application logic + data models
- `locales/` — Translation JSON files (`en.json`, `bn.json`)
- `assets/images/` — Logos and brand assets
- `scripts/` — Helper scripts: `deploy.js`, `i18n.js`, `update-hashes.js`, `validate-i18n.js`
- `tests/e2e/` — Playwright end-to-end tests (`i18n.spec.js`)
- `playwright.config.js` — Playwright test runner configuration
- `package.json` — npm scripts and dependencies

**Local server / Live testing**

- Static files are served by `python -m http.server 5500` (also used by Playwright tests).
- `npm run start` runs the above command. Port: `5500`.
- Verified endpoint: `http://127.0.0.1:5500` responds with `HTTP/1.1 200 OK` in this environment.

**Playwright E2E**

- `npm run test:e2e` runs Playwright tests using `playwright.config.js`. It provides `webServer` config to start a server on port `5500` and reuses existing server unless `CI`.
- Playwright test suite uses `baseURL: 'http://127.0.0.1:5500'`.

**Available MCP Playwright Browser APIs**
The following `mcp_` Playwright APIs are available for automated web interactions (short usage):

- `mcp_playwright_browser_navigate`: Navigate the browser to a URL (example: `/` or `/index.html`).
- `mcp_playwright_browser_click`: Click an element by reference.
- `mcp_playwright_browser_type`: Type into an editable element.
- `mcp_playwright_browser_fill_form`: Fill multiple form fields at once.
- `mcp_playwright_browser_select_option`: Select option(s) in a dropdown.
- `mcp_playwright_browser_wait_for`: Wait for a time or for text to appear/disappear.
- `mcp_playwright_browser_evaluate`: Execute JS in page context to get values, run functions, or mutate page state.
- `mcp_playwright_browser_run_code`: Run multi-step Playwright code snippets (access to `page` object).
- `mcp_playwright_browser_console_messages`: Get captured console messages from page loads (errors, warnings).
- `mcp_playwright_browser_network_requests`: Inspect network requests recorded by the page.
- `mcp_playwright_browser_tabs`: Manage browser tabs (new, select, close).
- `mcp_playwright_browser_snapshot`: Capture an accessibility snapshot of the page (preferred over screenshots for testing content).
- `mcp_playwright_browser_take_screenshot`: Capture screenshots of the viewport or a specific element.
- `mcp_playwright_browser_drag`: Drag and drop elements between targets.
- `mcp_playwright_browser_hover`: Hover over an element to trigger hover states.
- `mcp_playwright_browser_press_key`: Press a key or character on the page.
- `mcp_playwright_browser_file_upload`: Upload files through a file chooser dialog.
- `mcp_playwright_browser_handle_dialog`: Automatic handling for dialogs (alerts, confirms, prompts).
- `mcp_playwright_browser_resize`: Resize viewport size.
- `mcp_playwright_browser_close`: Close the current page/tab.
- `mcp_playwright_browser_install`: Install required Playwright browsers (if needed).

**Helper & Utility Functions (workspace tooling)**

- `functions.apply_patch`: Update files in the workspace via V4A-style patch.
- `functions.create_file` / `functions.create_directory`: Create files or directories in the workspace.
- `functions.read_file` / `functions.list_dir` / `functions.file_search`: Inspect repository files.
- `functions.grep_search` / `functions.semantic_search`: Text search capabilities in repo.
- `functions.run_in_terminal`: Execute shell commands (e.g. `curl`, `npm`, `python`).
- `functions.runSubagent`: Launch a sub-agent for complex research tasks.
- `functions.vscode_searchExtensions_internal`: Browse VS Code extensions metadata.
- `functions.manage_todo_list`: Track tasks for multi-step operations and progress.

**I18n & Testing Notes**

- I18n micro-library: `scripts/i18n.js` exposes `window.i18n` with `t`/`tx` helpers in runtime.
- The E2E Playwright tests validate localization, charts, and runtime interactions (`tests/e2e/i18n.spec.js`).
- Use `npm run i18n:validate` to validate translation structure.

**How to use the local server and Playwright in this project**

1. Start the static server (if not using Playwright as `webServer`):

```
npm run start
# or
python -m http.server 5500
```

2. Run Playwright tests:

```
npm run test:e2e
```

**Notes & Caveats**

- `playwright.config.js` uses `reuseExistingServer: true` when not in CI to avoid launching a server if `127.0.0.1:5500` is already responding.
- If Playwright is unavailable locally, run `npx playwright install` to install required browsers.
- When running E2E locally, the test harness may start the `python -m http.server` if an existing server is not found.

**Verification Check**

- `http://127.0.0.1:5500` responded with `200 OK` at the time of creating this file.

**Contact / Maintenance**

- For further automation work or test enhancements, reference `playwright.config.js` and `tests/e2e` to extend scenarios or add CI jobs.

---

Generated: `AGENTS.md` — a brief mapping of repository structure, automation helpers, and local test server validation.
