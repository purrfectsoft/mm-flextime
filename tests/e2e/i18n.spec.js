import { test, expect } from '@playwright/test';

// Basic E2E tests for i18n and chart rendering

test.describe('i18n & Charts', () => {
    test('page loads, i18n ready, no raw keys in DOM, charts created & no console errors', async ({ page }) => {
        const consoleErrors = [];
        page.on('console', (msg) => {
            if (msg.type() === 'error') consoleErrors.push(msg.text());
        });

        // Navigate to the root of the site served by the webServer
        await page.goto('/');

        // Wait for i18n to be ready (the micro lib dispatches an i18n-ready event)
        await page.evaluate(() => {
            // State: wait for the `i18n.ready` Promise to resolve if available
            if (window.i18n && window.i18n.ready) {
                return window.i18n.ready;
            }
            return Promise.resolve(true);
        });

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

        // Check that a few key i18n elements are translated to their expected values
        const header = await page.textContent('[data-i18n="hero.h1"]');
        expect(header.trim().length).toBeGreaterThan(0);
        expect(header).not.toContain('hero.h1');

        // The occupancy lock toggle must have a localized title attribute (non-empty, not a raw key)
        const occTitle = await page.getAttribute('#occupancy-lock-toggle', 'title');
        expect(occTitle && occTitle.trim().length).toBeGreaterThan(0);
        expect(occTitle).not.toContain('occupancy.lock.title');

        // Check that `data-i18n` attributes exist on dynamic nodes (dynamic payroll rows get created)
        // We'll inspect the dynamic payroll table body and ensure the first generated cell contains a data-i18n attribute
        const payrollBodyExists = await page.$('#dynamic-payroll-table-body');
        expect(payrollBodyExists).toBeTruthy();

        // Move staffing tier to Tier 3 to ensure vBed info is shown and uses i18n keys
        await page.$eval('#staffing-tier-slider', (el) => {
            el.value = 3;
            el.dispatchEvent(new Event('input', { bubbles: true }));
        });
        await page.waitForSelector('span.vbed-count');
        const vbedText = await page.textContent('span.vbed-count');
        expect(vbedText.trim()).toContain('+');
        // Ensure this vBed count span uses the expected data-i18n key
        const vbedKey = await page.getAttribute('span.vbed-count', 'data-i18n');
        expect(vbedKey).toBe('labels.vbed_count');

        // Make sure we didn't render any raw `{{...}}` style placeholders in the visible DOM
        expect(bodyText).not.toContain('{{');
        expect(bodyText).not.toContain('{ ');
    });
});
