(function () {
    // Minimal i18n micro library
    const STORAGE_LANG_KEY = 'i18nLang';
    const APP_VERSION = 'v2.8.2';

    const i18n = {
        lang: 'en',
        translations: {},
        // Helper to get stored language or default to 'en'
        getStoredLanguage() {
            try {
                return localStorage.getItem(STORAGE_LANG_KEY) || 'en';
            } catch (err) {
                return 'en';
            }
        },
        // Helper to save language to localStorage
        saveLanguage(lang) {
            try {
                localStorage.setItem(STORAGE_LANG_KEY, lang);
            } catch (err) {
                console.warn('Could not save language to localStorage', err);
            }
        },
        // `init` returns a promise and sets `ready` to a Promise that resolves when translations are loaded.
        async init({ defaultLang = 'en', path = '/locales' } = {}) {
            // Check for stored language preference
            const storedLang = this.getStoredLanguage();
            this.lang = storedLang || defaultLang;

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
                    // Update html lang attribute
                    document.documentElement.setAttribute('lang', this.lang);
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
            // Save language preference to localStorage
            this.saveLanguage(lang);

            this.ready = (async () => {
                try {
                    const resp = await fetch(`${path}/${this.lang}.json`);
                    if (!resp.ok) {
                        console.warn('Could not load locale', resp.status);
                    } else {
                        this.translations = await resp.json();
                    }
                    this.apply();
                    // Update html lang attribute
                    document.documentElement.setAttribute('lang', this.lang);
                    try {
                        window.dispatchEvent(new CustomEvent('i18n-ready', { detail: { lang: this.lang } }));
                        window.dispatchEvent(new CustomEvent('i18n-lang-changed', { detail: { lang: this.lang } }));
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
        // Convenience method for setting language - main API for switcher
        setLanguage(lang) {
            return this.setLang(lang, { path: 'locales' });
        },
        t(key, vars) {
            if (!key) return '';
            const val = this.translations[key] || key;
            // Merge app constants (like version) with provided vars
            const allVars = { version: APP_VERSION, ...vars };
            if (!val.includes('{')) return val;
            // Support both {{var}} and {var} interpolation styles for flexibility
            return val.replace(/\{\{\s*(\w+)\s*\}\}|\{\s*(\w+)\s*\}/g, (_, k1, k2) => {
                const k = k1 || k2;
                return allVars[k] !== undefined ? allVars[k] : `{{${k}}}`;
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
                    try {
                        if (window.createTransientElement) {
                            const frag = window.createTransientElement(text);
                            el.replaceChildren(frag);
                        } else {
                            // Fallback: parse via template to avoid direct innerHTML where possible
                            const tpl = document.createElement('template');
                            tpl.innerHTML = text;
                            el.replaceChildren(tpl.content);
                        }
                    } catch (e) {
                        // Last resort: set innerHTML (should be rare)
                        el.innerHTML = text;
                    }
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

    // Utility: create a transient DocumentFragment from an HTML string with
    // optional positional translation keys. Usage:
    //   const frag = createTransientElement('<p>%s</p>', 'labels.some_key');
    //   node.replaceChildren(frag);
    function createTransientElement(htmlStr, ...i18nArgs) {
        // Resolve i18nArgs: if an arg is a string, attempt to resolve it via t(),
        // otherwise use it as a raw value. This allows callers to pass either
        // translation keys or already-resolved strings.
        const resolved = i18nArgs.map((a) => {
            if (typeof a === 'string') {
                try {
                    // Prefer treating dotted strings as translation keys;
                    // fall back to raw string if translation missing.
                    const candidate = i18n.t(a);
                    return candidate || a;
                } catch (e) {
                    return a;
                }
            }
            return a;
        });

        // Use tx to perform positional substitutions when possible. tx will
        // return the htmlStr unchanged if it isn't a template.
        let rendered;
        try {
            rendered = i18n.tx(htmlStr, ...resolved);
        } catch (e) {
            // Fallback: attempt simple concatenation
            rendered = htmlStr;
        }

        const tpl = document.createElement('template');
        tpl.innerHTML = rendered;
        return tpl.content;
    }

    // Expose utility globally for use throughout the app
    window.createTransientElement = window.createTransientElement || createTransientElement;
})();
