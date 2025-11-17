(function () {
    // Minimal i18n micro library
    const i18n = {
        lang: 'en',
        translations: {},
        async init({ defaultLang = 'en', path = '/locales' } = {}) {
            this.lang = defaultLang;
            try {
                const resp = await fetch(`${path}/${this.lang}.json`);
                if (!resp.ok) {
                    console.warn('Could not load locale', resp.status);
                    return;
                }
                this.translations = await resp.json();
            } catch (err) {
                console.error('i18n init error', err);
            }
            this.apply();
            // Expose t globally for convenience
            window.t = this.t.bind(this);
            window.i18n = this;
        },
        async setLang(lang, { path = '/locales' } = {}) {
            this.lang = lang;
            try {
                const resp = await fetch(`${path}/${this.lang}.json`);
                if (!resp.ok) {
                    console.warn('Could not load locale', resp.status);
                    return;
                }
                this.translations = await resp.json();
                this.apply();
            } catch (err) {
                console.error('i18n setLang error', err);
            }
        },
        t(key, vars) {
            if (!key) return '';
            const val = this.translations[key] || key;
            if (!vars) return val;
            return val.replace(/\{\{\s*(\w+)\s*\}\}/g, (_, k) => (vars[k] !== undefined ? vars[k] : `{{${k}}}`));
        },
        apply(root = document) {
            // Replace text for elements with data-i18n, supports placeholders and html
            root.querySelectorAll('[data-i18n]').forEach((el) => {
                const key = el.getAttribute('data-i18n');
                const text = this.t(key);
                if (el.hasAttribute('data-i18n-html')) {
                    el.innerHTML = text;
                } else if (el.tagName === 'IMG' && el.hasAttribute('alt')) {
                    el.setAttribute('alt', text);
                } else {
                    // Preserve inner HTML structure but replace text nodes only on simple cases
                    // Default to setting textContent
                    el.textContent = text;
                }
            });

            // placeholders
            root.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
                const key = el.getAttribute('data-i18n-placeholder');
                el.setAttribute('placeholder', this.t(key));
            });

            // title attributes
            root.querySelectorAll('[data-i18n-title]').forEach((el) => {
                const key = el.getAttribute('data-i18n-title');
                el.setAttribute('title', this.t(key));
            });

            // aria labels
            root.querySelectorAll('[data-i18n-aria]').forEach((el) => {
                const key = el.getAttribute('data-i18n-aria');
                el.setAttribute('aria-label', this.t(key));
            });
        },
    };

    // Provide a fallback t function early so other scripts don't break (returns key by default)
    window.t = window.t || ((k) => k);
    window.i18n = window.i18n || {};
    window.addEventListener('DOMContentLoaded', () => {
        // Auto-init with default English
        if (!window.i18n) i18n.init({ defaultLang: 'en', path: '/locales' });
    });
})();
