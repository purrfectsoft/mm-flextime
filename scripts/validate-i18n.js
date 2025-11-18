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

    files.forEach((file) => {
        const json = loadJson(file);
        Object.keys(json).forEach((key) => {
            const val = json[key];
            if (typeof val !== 'string') return;
            if (hasHtmlTags(val)) {
                // Accept if key indicates html
                const ok = /(_html$|\.services_html\.|_html\.|_html$)/i.test(key) || key.toLowerCase().includes('html');
                if (!ok) {
                    errors++;
                    console.error(`${path.basename(file)}: key '${key}' contains HTML but key name does not follow _html/.services_html convention`);
                }
            }
        });
    });

    if (errors > 0) {
        console.error(`\nFound ${errors} i18n key(s) with HTML that don't follow naming convention.`);
        process.exit(1);
    }

    console.log('i18n validation passed.');
}

main();
