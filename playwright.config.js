// Playwright config to run a lightweight static server via Python's http.server
// and run tests against http://127.0.0.1:5500

const { devices } = require('@playwright/test');

module.exports = {
    testDir: 'tests/e2e',
    timeout: 60 * 1000,
    expect: {
        timeout: 5000,
    },
    fullyParallel: false,
    webServer: {
        command: 'python -m http.server 5500',
        port: 5500,
        timeout: 120 * 1000,
        reuseExistingServer: process.env.CI ? false : true,
    },
    use: {
        headless: true,
        baseURL: 'http://127.0.0.1:5500',
        viewport: { width: 1280, height: 720 },
        ignoreHTTPSErrors: true,
        video: 'off',
        screenshot: 'only-on-failure',
    },
    projects: [
        { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
        { name: 'webkit', use: { ...devices['Desktop Safari'] } },
    ],
};
