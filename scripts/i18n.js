(function () {
    // Minimal i18n micro library
    const i18n = {
        lang: 'en',
        translations: {},
        // `init` returns a promise and sets `ready` to a Promise that resolves when translations are loaded.
        async init({ defaultLang = 'en', path = '/locales' } = {}) {
            this.lang = defaultLang;
            this.ready = (async () => {
                try {
                    const resp = await fetch(`${path}/${this.lang}.json`);
                    if (!resp.ok) {
                        console.warn('Could not load locale', resp.status);
                    } else {
                        this.translations = await resp.json();
                    }
                } catch (err) {
                    console.error('i18n init error', err);
                }
                // Apply to document once loaded (if possible)
                try {
                    this.apply();
                    // Emit a global event so callers can react when i18n finishes loading
                    try {
                        window.dispatchEvent(new CustomEvent('i18n-ready', { detail: { lang: this.lang } }));
                    } catch (e) {
                        /* ignore */
                    }
                } catch (e) {
                    /* ignore */
                }
                // Expose t globally for convenience
                window.t = this.t.bind(this);
                window.tx = this.tx.bind(this);
                window.i18n = this;
                return true;
            })();
            return this.ready;
        },
        async setLang(lang, { path = '/locales' } = {}) {
            this.lang = lang;
            this.ready = (async () => {
                try {
                    const resp = await fetch(`${path}/${this.lang}.json`);
                    if (!resp.ok) {
                        console.warn('Could not load locale', resp.status);
                    } else {
                        this.translations = await resp.json();
                    }
                    this.apply();
                    try {
                        window.dispatchEvent(new CustomEvent('i18n-ready', { detail: { lang: this.lang } }));
                    } catch (e) {
                        /* ignore */
                    }
                } catch (err) {
                    console.error('i18n setLang error', err);
                }
                return true;
            })();
            return this.ready;
        },
        t(key, vars) {
            if (!key) return '';
            const val = this.translations[key] || key;
            if (!vars) return val;
            // Support both {{var}} and {var} interpolation styles for flexibility
            return val.replace(/\{\{\s*(\w+)\s*\}\}|\{\s*(\w+)\s*\}/g, (_, k1, k2) => {
                const k = k1 || k2;
                return vars[k] !== undefined ? vars[k] : `{{${k}}}`;
            });
        },
        // printf-style positional translation helper: tx(keyOrString, ...args)
        // Supports ordered placeholders like %1$s, %2$d and unnumbered %s/%d which are applied sequentially.
        tx(keyOrString, ...args) {
            if (!keyOrString) return '';
            const tpl = this.translations[keyOrString] || keyOrString;
            let idx = 0;
            // Replace numbered placeholders first
            let str = tpl.replace(/%([1-9]\d*)\$[sdf]/g, (m, p1) => {
                const pos = Number(p1) - 1;
                return args[pos] !== undefined ? String(args[pos]) : m;
            });
            // Replace unnumbered %s/%d/%f sequentially
            str = str.replace(/%[sdf]/g, () => {
                const a = args[idx++];
                return a !== undefined ? String(a) : '';
            });
            return str;
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

    // Set the i18n object on the window immediately and expose a t() bound to it.
    // This ensures other scripts that execute during DOMContentLoaded can
    // reliably detect `window.i18n.ready` and attach callbacks.
    window.i18n = window.i18n || i18n;
    window.t = window.t || i18n.t.bind(i18n);
    // Expose printf-style positional helper early so scripts that run
    // during load can safely call `tx()` even if translations haven't
    // been fetched yet (fallback to key or format string behavior).
    window.tx = window.tx || i18n.tx.bind(i18n);
    window.addEventListener('DOMContentLoaded', () => {
        // Auto-init with default English if no ready promise exists. `init` sets
        // `i18n.ready` Promise synchronously so other scripts can attach `.then()` handlers.
        if (!window.i18n.ready) {
            i18n.init({ defaultLang: 'en', path: 'locales' });
            // Re-bind global helpers in case they were overridden earlier by other scripts
            window.i18n = window.i18n || i18n;
            window.t = window.t || i18n.t.bind(i18n);
        }
    });
})();
