#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function hasHtmlTags(s) {
    return /<[^>]+>/i.test(s);
}

function walkLocales(dir) {
    const files = fs.readdirSync(dir).filter((f) => f.endsWith('.json'));
    return files.map((f) => path.join(dir, f));
}

function loadJson(file) {
    try {
        return JSON.parse(fs.readFileSync(file, 'utf8'));
    } catch (e) {
        console.error(`Failed to parse ${file}:`, e.message);
        process.exit(2);
    }
}

function main() {
    const localesDir = path.join(__dirname, '..', 'locales');
    if (!fs.existsSync(localesDir)) {
        console.error('No locales directory found at', localesDir);
        process.exit(2);
    }

    const files = walkLocales(localesDir);
    let errors = 0;
    let warnings = 0;
    let checked = 0;

    files.forEach((file) => {
        const json = loadJson(file);
        Object.keys(json).forEach((key) => {
            const val = json[key];
            if (typeof val !== 'string') return;
            checked++;
            if (hasHtmlTags(val)) {
                // Accept if key ends with .html or contains html in the key name
                // Also accept keys that are known to use data-i18n-html in the HTML
                const endsWithHtml = /\.html$/i.test(key);
                const containsHtml = key.toLowerCase().includes('html');
                const isKnownHtmlKey = /\.(intro|desc|description|items|scenario|tier_label|copyright)$/i.test(key);

                const ok = endsWithHtml || containsHtml || isKnownHtmlKey;

                if (!ok) {
                    errors++;
                    console.error(
                        `${path.basename(file)}: key '${key}' contains HTML but doesn't follow naming convention`
                    );
                    console.error(`  Suggestion: Rename to '${key}.html' or ensure data-i18n-html is used in HTML`);
                } else if (!endsWithHtml && !containsHtml) {
                    // It's a known HTML key but doesn't have explicit html in name
                    warnings++;
                    console.warn(
                        `${path.basename(file)}: key '${key}' contains HTML (consider using .html suffix for clarity)`
                    );
                }
            }
        });
    });

    console.log(`\nChecked ${checked} keys in ${files.length} locale file(s)`);

    if (warnings > 0) {
        console.warn(`Found ${warnings} key(s) with HTML that could use clearer naming (non-blocking)`);
    }

    if (errors > 0) {
        console.error(`\nFound ${errors} i18n key(s) with HTML that don't follow naming convention.`);
        process.exit(1);
    }

    console.log('✅ i18n validation passed.');
}

main();
