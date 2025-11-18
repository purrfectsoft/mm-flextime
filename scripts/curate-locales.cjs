#!/usr/bin/env node
/*
 * Curate auto-extracted locale strings into locales/en.json.
 * By default, adds keys from en.auto.json into en.json under `auto.` namespace
 * if they are not already present in en.json.
 * Use --promote <mapping.json> to move auto keys into desired semantic keys (mapping.json format: { "auto.key": "semantic.key" })
 */
const fs = require('fs');
const path = require('path');
// Minimal CLI arg parsing (avoid external deps)
const rawArgs = process.argv.slice(2);
const argv = rawArgs.reduce((acc, arg, idx, arr) => {
    if (arg.startsWith('--')) {
        const [key, value] = arg.split('=');
        if (value !== undefined) acc[key.replace(/^--/, '')] = value;
        else if (arr[idx + 1] && !arr[idx + 1].startsWith('--')) acc[key.replace(/^--/, '')] = arr[idx + 1];
        else acc[key.replace(/^--/, '')] = true;
    }
    return acc;
}, {});

const ROOT = path.resolve(__dirname, '..');
const LOCALES_DIR = path.join(ROOT, 'locales');
const EN_JSON = path.join(LOCALES_DIR, 'en.json');
const AUTO_JSON = path.join(LOCALES_DIR, 'en.auto.json');

if (!fs.existsSync(AUTO_JSON)) {
    console.error('No en.auto.json found — run the extractor first: npm run i18n:extract');
    process.exit(2);
}

let en = {};
let auto = {};
try {
    en = JSON.parse(fs.readFileSync(EN_JSON, 'utf8'));
    auto = JSON.parse(fs.readFileSync(AUTO_JSON, 'utf8'));
} catch (err) {
    console.error('Error reading locales', err.message);
    process.exit(2);
}

const promoteMap = argv.promote ? JSON.parse(fs.readFileSync(path.resolve(process.cwd(), argv.promote), 'utf8')) : {};
const autoPromote = argv['auto-promote'] || false; // suggestions only when true
const apply = argv.apply || false;

const added = [];
const promoted = [];

Object.keys(auto).forEach((k) => {
    if (en[k] !== undefined) return; // already exists as-is
    if (promoteMap[k]) {
        const target = promoteMap[k];
        if (!en[target]) {
            en[target] = auto[k];
            promoted.push({ from: k, to: target });
        }
    } else {
        // add under auto namespace; sanitize key name
        const safeKey = `auto.${k
            .replace(/[^a-z0-9._-]+/gi, '.')
            .replace(/\.+/g, '.')
            .replace(/^\.|\.$/g, '')}`;
        if (!en[safeKey]) {
            en[safeKey] = auto[k];
            added.push(safeKey);
        }
    }
});

// Auto-promotion pass: suggest/copty auto.* keys to top-level if target is clean and not present
const autoKeysInEn = Object.keys(en).filter((key) => key.startsWith('auto.'));
const suggestions = [];
autoKeysInEn.forEach((autoKey) => {
    const target = autoKey.replace(/^auto\./, '');
    if (!en[target] && /^[a-z0-9_.\-]+$/i.test(target)) {
        suggestions.push({ from: autoKey, to: target, value: en[autoKey] });
    }
});

if (suggestions.length > 0) {
    // Find used keys in site (index.html and index.js)
    const used = new Set();
    const htmlFile = path.join(ROOT, 'index.html');
    const jsFile = path.join(ROOT, 'index.js');
    const htmlRaw = fs.existsSync(htmlFile) ? fs.readFileSync(htmlFile, 'utf8') : '';
    const jsRaw = fs.existsSync(jsFile) ? fs.readFileSync(jsFile, 'utf8') : '';
    const htmlPattern = /data-i18n(?:-html|-placeholder|-title|-aria)?\s*=\s*"([^"]+)"/g;
    const jsPattern = /t\(\s*['"]([^'"\)]+)['"]/g;
    let m;
    while ((m = htmlPattern.exec(htmlRaw))) {
        used.add(m[1]);
    }
    while ((m = jsPattern.exec(jsRaw))) {
        if (/^[a-z0-9_.\-\/{}%]+$/i.test(m[1]) && /[a-z]/i.test(m[1])) used.add(m[1]);
    }

    // Only promote suggestions where the target key is used in site
    const applied = [];
    const toSuggest = suggestions.filter((s) => used.has(s.to));
    if (toSuggest.length === 0) {
        console.log('No auto.* keys appear to be used in the site — no auto-promotions applied.');
    } else if (autoPromote) {
        console.log(`Auto-promoting ${toSuggest.length} entries from auto.* into top-level keys`);
        toSuggest.forEach((s) => {
            console.log(`  Suggest: ${s.from} -> ${s.to}`);
            if (apply) {
                en[s.to] = s.value;
                delete en[s.from];
                applied.push(s);
            }
        });
        if (apply) fs.writeFileSync(EN_JSON, JSON.stringify(en, null, 4) + '\n', 'utf8');
    } else {
        console.log(
            `Auto-promote suggestions for used keys (${toSuggest.length}). Use --auto-promote --apply to apply:`
        );
        toSuggest.slice(0, 200).forEach((s) => console.log(`  ${s.from} -> ${s.to}`));
    }
    if (applied.length) console.log(`Applied promotions: ${applied.length}`);
}

if (added.length || promoted.length) {
    fs.writeFileSync(EN_JSON, JSON.stringify(en, null, 4) + '\n', 'utf8');
}

console.log('Curation complete');
console.log('  Added:', added.length);
console.log('  Promoted:', promoted.length);
if (promoted.length) promoted.forEach((p) => console.log(`  Promote: ${p.from} -> ${p.to}`));
if (added.length) added.slice(0, 200).forEach((k) => console.log('  Added key:', k));

process.exit(0);
