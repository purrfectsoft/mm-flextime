import { test, expect } from '@playwright/test';

// Comprehensive E2E tests for i18n, language switching, persistence, query parameters, and chart rendering

const waitForPageReady = async (page) => {
    await page.evaluate(() => {
        if (window.i18n && window.i18n.ready) {
            return window.i18n.ready;
        }
        return Promise.resolve(true);
    });
};

test.describe('i18n: Initialization & Translation', () => {
    test('page loads with default language (English), i18n ready, charts created, no console errors', async ({
        page,
    }) => {
        const consoleErrors = [];
        page.on('console', (msg) => {
            if (msg.type() === 'error') consoleErrors.push(msg.text());
        });

        // Navigate to the root of the site served by the webServer
        await page.goto('/');
        await waitForPageReady(page);

        // Wait for the charts to exist (visitMixChart & staffingTierChart are declared globally)
        await page.waitForSelector('canvas#visitMixChart');
        await page.waitForSelector('canvas#staffingTierChart');

        // Ensure Chart instances are created on the page's global scope
        const chartsExist = await page.evaluate(() => {
            try {
                return (
                    typeof visitMixChart !== 'undefined' &&
                    visitMixChart &&
                    typeof staffingTierChart !== 'undefined' &&
                    staffingTierChart
                );
            } catch (e) {
                return false;
            }
        });
        expect(chartsExist).toBeTruthy();

        // Ensure no console errors were emitted during page load
        expect(consoleErrors.length, `Console errors during load: ${consoleErrors.join('\n')}`).toBe(0);

        // Ensure that there are no visible strings that contain 'auto.' (unpromoted keys leaking to users)
        const bodyText = await page.textContent('body');
        expect(bodyText).not.toContain('auto.');

        // Check that key i18n elements are translated to their expected values (using correct key)
        const header = await page.textContent('[data-i18n="home.hero.title_line1"]');
        expect(header).toBeTruthy();
        expect(header.trim().length).toBeGreaterThan(0);
        expect(header).not.toContain('home.hero.title_line1');
        expect(header).toContain('FlexTime™ Operations');

        // The occupancy lock toggle must have a localized title attribute (non-empty, not a raw key)
        const occTitle = await page.getAttribute('#occupancy-lock-toggle', 'title');
        expect(occTitle && occTitle.trim().length).toBeGreaterThan(0);
        expect(occTitle).not.toContain('occupancy.lock.title');

        // Check that `data-i18n` attributes exist on dynamic nodes
        const payrollBodyExists = await page.$('#dynamic-payroll-table-body');
        expect(payrollBodyExists).toBeTruthy();

        // Make sure we didn't render any raw `{{...}}` style placeholders in the visible DOM
        expect(bodyText).not.toContain('{{');
        expect(bodyText).not.toContain('{ ');
    });

    test('HTML lang attribute reflects current language on page load', async ({ page }) => {
        await page.goto('/');
        await waitForPageReady(page);

        const htmlLang = await page.getAttribute('html', 'lang');
        expect(htmlLang).toBe('en'); // Default should be English
    });
});

test.describe('i18n: Language Button Switching', () => {
    test('clicking language button switches UI language and updates content', async ({ page }) => {
        await page.goto('/');
        await waitForPageReady(page);
        await page.waitForSelector('#lang-bn-btn', { state: 'visible' });

        // Get initial English text
        const initialHeader = await page.textContent('[data-i18n="home.hero.title_line1"]');
        expect(initialHeader).toContain('FlexTime™ Operations');

        // Click Bengali language button (use force to ensure click happens)
        await page.click('#lang-bn-btn', { force: true });

        // Wait for language change and translation to apply
        await page.waitForFunction(
            () => {
                const header = document.querySelector('[data-i18n="home.hero.title_line1"]');
                return header && header.textContent.includes('অপারেশনস');
            },
            { timeout: 10000 }
        );

        // Verify text changed to Bengali
        const bengaliHeader = await page.textContent('[data-i18n="home.hero.title_line1"]');
        expect(bengaliHeader).toContain('অপারেশনস');
        expect(bengaliHeader).not.toContain('Operations');

        // Verify button states (aria-pressed)
        const enBtn = await page.getAttribute('#lang-en-btn', 'aria-pressed');
        const bnBtn = await page.getAttribute('#lang-bn-btn', 'aria-pressed');
        expect(bnBtn).toBe('true');
        expect(enBtn).toBe('false');
    });

    test('switching back to English from Bengali works correctly', async ({ page }) => {
        await page.goto('/');
        await waitForPageReady(page);
        await page.waitForSelector('#lang-bn-btn', { state: 'visible' });

        // Switch to Bengali
        await page.click('#lang-bn-btn', { force: true });
        await page.waitForFunction(
            () => {
                const header = document.querySelector('[data-i18n="home.hero.title_line1"]');
                return header && header.textContent.includes('অপারেশনস');
            },
            { timeout: 10000 }
        );

        // Switch back to English
        await page.click('#lang-en-btn', { force: true });
        await page.waitForFunction(
            () => {
                const header = document.querySelector('[data-i18n="home.hero.title_line1"]');
                return header && header.textContent.includes('Operations');
            },
            { timeout: 10000 }
        );

        const enHeader = await page.textContent('[data-i18n="home.hero.title_line1"]');
        expect(enHeader).toContain('FlexTime™ Operations');

        const enBtn = await page.getAttribute('#lang-en-btn', 'aria-pressed');
        expect(enBtn).toBe('true');
    });

    test('multiple UI elements update together when language changes', async ({ page }) => {
        await page.goto('/');
        await waitForPageReady(page);
        await page.waitForSelector('#lang-bn-btn', { state: 'visible' });

        // Verify multiple English elements exist
        let subtitle = await page.textContent('[data-i18n="home.hero.subtitle"]');
        expect(subtitle).toContain('Bangladesh');

        let navLink = await page.textContent('[data-i18n="header.nav.service_model"]');
        expect(navLink).toContain('Service Model');

        // Switch to Bengali
        await page.click('#lang-bn-btn', { force: true });

        await page.waitForFunction(
            () => {
                const sub = document.querySelector('[data-i18n="home.hero.subtitle"]');
                return sub && sub.textContent.includes('বাংলাদেশ');
            },
            { timeout: 10000 }
        );

        // Verify all elements switched to Bengali
        subtitle = await page.textContent('[data-i18n="home.hero.subtitle"]');
        expect(subtitle).toContain('বাংলাদেশ');

        navLink = await page.textContent('[data-i18n="header.nav.service_model"]');
        expect(navLink).toContain('সার্ভিস মডেল');
    });
});

test.describe('i18n: Language Persistence (localStorage)', () => {
    test('language preference persists across page refresh', async ({ page }) => {
        await page.goto('/');
        await waitForPageReady(page);
        await page.waitForSelector('#lang-bn-btn', { state: 'visible' });

        // Switch to Bengali
        await page.click('#lang-bn-btn', { force: true });
        await page.waitForFunction(
            () => {
                const header = document.querySelector('[data-i18n="home.hero.title_line1"]');
                return header && header.textContent.includes('অপারেশনস');
            },
            { timeout: 10000 }
        );

        // Verify localStorage was set
        const storedLang = await page.evaluate(() => localStorage.getItem('i18nLang'));
        expect(storedLang).toBe('bn');

        // Refresh page
        await page.reload();
        await waitForPageReady(page);

        // Verify Bengali persisted (no query param, so should use localStorage)
        const header = await page.textContent('[data-i18n="home.hero.title_line1"]');
        expect(header).toContain('অপারেশনস');

        const bnBtn = await page.getAttribute('#lang-bn-btn', 'aria-pressed');
        expect(bnBtn).toBe('true');
    });

    test('localStorage updates when language button is clicked', async ({ page }) => {
        await page.goto('/');
        await waitForPageReady(page);
        await page.waitForSelector('#lang-bn-btn', { state: 'visible' });

        // Click Bengali
        await page.click('#lang-bn-btn', { force: true });
        await page.waitForFunction(
            () => {
                const header = document.querySelector('[data-i18n="home.hero.title_line1"]');
                return header && header.textContent.includes('অপারেশনস');
            },
            { timeout: 10000 }
        );

        let storedLang = await page.evaluate(() => localStorage.getItem('i18nLang'));
        expect(storedLang).toBe('bn');

        // Click English
        await page.click('#lang-en-btn', { force: true });
        await page.waitForFunction(
            () => {
                const header = document.querySelector('[data-i18n="home.hero.title_line1"]');
                return header && header.textContent.includes('Operations');
            },
            { timeout: 10000 }
        );

        storedLang = await page.evaluate(() => localStorage.getItem('i18nLang'));
        expect(storedLang).toBe('en');
    });
});

test.describe('i18n: Query Parameter Language Selection', () => {
    test('?lang=bn query parameter loads page in Bengali', async ({ page }) => {
        await page.goto('/?lang=bn');
        await waitForPageReady(page);

        // Verify Bengali content is displayed
        const header = await page.textContent('[data-i18n="home.hero.title_line1"]');
        expect(header).toContain('অপারেশনস');

        // Verify button state
        const bnBtn = await page.getAttribute('#lang-bn-btn', 'aria-pressed');
        expect(bnBtn).toBe('true');

        // Verify HTML lang attribute
        const htmlLang = await page.getAttribute('html', 'lang');
        expect(htmlLang).toBe('bn');
    });

    test('?lang=en query parameter loads page in English', async ({ page }) => {
        await page.goto('/?lang=en');
        await waitForPageReady(page);

        const header = await page.textContent('[data-i18n="home.hero.title_line1"]');
        expect(header).toContain('FlexTime™ Operations');

        const enBtn = await page.getAttribute('#lang-en-btn', 'aria-pressed');
        expect(enBtn).toBe('true');

        const htmlLang = await page.getAttribute('html', 'lang');
        expect(htmlLang).toBe('en');
    });

    test('query parameter takes precedence over localStorage', async ({ page }) => {
        // First, set localStorage to Bengali
        await page.goto('/');
        await waitForPageReady(page);
        await page.waitForSelector('#lang-bn-btn', { state: 'visible' });

        await page.click('#lang-bn-btn', { force: true });
        await page.waitForFunction(
            () => {
                const header = document.querySelector('[data-i18n="home.hero.title_line1"]');
                return header && header.textContent.includes('অপারেশনস');
            },
            { timeout: 10000 }
        );

        // Verify localStorage is Bengali
        let storedLang = await page.evaluate(() => localStorage.getItem('i18nLang'));
        expect(storedLang).toBe('bn');

        // Now navigate with English query param (should override localStorage)
        await page.goto('/?lang=en');
        await waitForPageReady(page);

        // Should show English despite Bengali in localStorage
        const header = await page.textContent('[data-i18n="home.hero.title_line1"]');
        expect(header).toContain('FlexTime™ Operations');

        const enBtn = await page.getAttribute('#lang-en-btn', 'aria-pressed');
        expect(enBtn).toBe('true');
    });

    test('invalid query parameter falls back to localStorage or default', async ({ page }) => {
        await page.goto('/?lang=xyz');
        await waitForPageReady(page);

        // Should fallback to English (default)
        const header = await page.textContent('[data-i18n="home.hero.title_line1"]');
        expect(header).toContain('FlexTime™ Operations');
    });
});

test.describe('i18n: Dynamic URL Updates', () => {
    test('clicking language button updates URL with query parameter', async ({ page }) => {
        await page.goto('/');
        await waitForPageReady(page);
        await page.waitForSelector('#lang-bn-btn', { state: 'visible' });

        // Click Bengali button
        await page.click('#lang-bn-btn', { force: true });
        await page.waitForFunction(
            () => {
                const header = document.querySelector('[data-i18n="home.hero.title_line1"]');
                return header && header.textContent.includes('অপারেশনস');
            },
            { timeout: 10000 }
        );

        // URL should now include ?lang=bn
        const url = page.url();
        expect(url).toContain('lang=bn');
    });

    test('clicking English button updates URL to ?lang=en', async ({ page }) => {
        await page.goto('/?lang=bn');
        await waitForPageReady(page);
        await page.waitForSelector('#lang-en-btn', { state: 'visible' });

        // Click English button
        await page.click('#lang-en-btn', { force: true });
        await page.waitForFunction(
            () => {
                const header = document.querySelector('[data-i18n="home.hero.title_line1"]');
                return header && header.textContent.includes('Operations');
            },
            { timeout: 10000 }
        );

        // URL should update to ?lang=en
        const url = page.url();
        expect(url).toContain('lang=en');
    });

    test('URL updates are reflected when page is copied and shared', async ({ browser }) => {
        // Simulate user flow: open page, switch language, share URL
        const page1 = await browser.newPage();
        await page1.goto('/');
        await waitForPageReady(page1);
        await page1.waitForSelector('#lang-bn-btn', { state: 'visible' });

        // Switch to Bengali
        await page1.click('#lang-bn-btn', { force: true });
        await page1.waitForFunction(
            () => {
                const header = document.querySelector('[data-i18n="home.hero.title_line1"]');
                return header && header.textContent.includes('অপারেশনস');
            },
            { timeout: 10000 }
        );

        // Get the URL (would be copied and shared)
        const sharedUrl = page1.url();
        expect(sharedUrl).toContain('lang=bn');

        // New user opens the shared URL
        const page2 = await browser.newPage();
        await page2.goto(sharedUrl);
        await waitForPageReady(page2);

        // Should immediately see Bengali content without needing to click buttons
        const header = await page2.textContent('[data-i18n="home.hero.title_line1"]');
        expect(header).toContain('অপারেশনস');

        const bnBtn = await page2.getAttribute('#lang-bn-btn', 'aria-pressed');
        expect(bnBtn).toBe('true');

        await page1.close();
        await page2.close();
    });
});
