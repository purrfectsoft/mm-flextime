#!/usr/bin/env node
/*
 * Validate locale keys against source usage.
 * - Scans for keys used in HTML data-i18n attributes
 * - Scans for t('...') / t("...") usages in JS
 * - Confirms all used keys exist in locales/en.json
 * - Reports unused keys in en.json
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const LOCALES_DIR = path.join(ROOT, 'locales');
const EN_JSON = path.join(LOCALES_DIR, 'en.json');
const AUTO_JSON = path.join(LOCALES_DIR, 'en.auto.json');

// Limit scan to public site files to avoid scanning build/CI or tooling outputs.
const htmlFiles = [];
const jsFiles = [];
const candidateHtml = [path.join(ROOT, 'index.html')];
const candidateJs = [path.join(ROOT, 'index.js')];
// include scripts dir JS files (excluding the extractor/curation scripts themselves)
const scriptsDir = path.join(ROOT, 'scripts');
if (fs.existsSync(scriptsDir)) {
    fs.readdirSync(scriptsDir).forEach((f) => {
        if (/\.js$/.test(f) || /\.cjs$/.test(f)) {
            candidateJs.push(path.join(scriptsDir, f));
        }
    });
}

candidateHtml.forEach((p) => {
    if (fs.existsSync(p)) htmlFiles.push(p);
});
candidateJs.forEach((p) => {
    if (fs.existsSync(p)) jsFiles.push(p);
});

const htmlPattern = /data-i18n(?:-html|-placeholder|-title|-aria)?\s*=\s*"([^"]+)"/g;
const jsPattern = /t\(\s*['"]([^'"\)]+)['"]/g;

const usedKeys = new Set();

for (const file of htmlFiles) {
    const content = fs.readFileSync(file, 'utf8');
    let m;
    while ((m = htmlPattern.exec(content))) {
        const key = m[1];
        if (/^[a-z0-9_.\-\/]+$/i.test(key)) {
            // ignore some common tokens accidentally matched
            const banned = new Set(['div', 'span', 'tr', 'td', 'a', 'option', 'table', 'T', '-', 'en-IN', 'hex']);
            if (!banned.has(key)) usedKeys.add(key);
        }
    }
}

for (const file of jsFiles) {
    const content = fs.readFileSync(file, 'utf8');
    let m;
    while ((m = jsPattern.exec(content))) {
        const key = m[1];
        // Filter out strings that are not likely translation keys (e.g., HTML tags, punctuation, literals)
        if (/^[a-z0-9_.\-\/{}%]+$/i.test(key) && /[a-z]/i.test(key)) {
            const banned = new Set(['div', 'span', 'tr', 'td', 'a', 'option', 'table', 'T', '-', 'en-IN', 'hex']);
            if (!banned.has(key)) usedKeys.add(key);
        }
    }
}

let enKeys = {};
try {
    const enText = fs.readFileSync(EN_JSON, 'utf8');
    enKeys = JSON.parse(enText);
} catch (err) {
    console.error('Failed to parse en.json', err.message);
    process.exit(2);
}

let autoKeys = {};
try {
    const autoText = fs.readFileSync(AUTO_JSON, 'utf8');
    autoKeys = JSON.parse(autoText);
} catch (err) {
    // ignore; not all runs will have en.auto.json
}

const enKeySet = new Set(Object.keys(enKeys));
const missingKeys = [];
usedKeys.forEach((k) => {
    if (!enKeySet.has(k)) missingKeys.push(k);
});

const unusedKeys = [];
Object.keys(enKeys).forEach((k) => {
    if (!usedKeys.has(k)) unusedKeys.push(k);
});

console.log('Validation Summary:');
console.log(`  HTML files: ${htmlFiles.length}`);
console.log(`  JS files: ${jsFiles.length}`);
console.log(`  en.json keys: ${enKeySet.size}`);
console.log(`  used keys found: ${usedKeys.size}`);
console.log(`  missing keys: ${missingKeys.length}`);
console.log(`  unused keys: ${unusedKeys.length}`);

if (Object.keys(autoKeys).length > 0) {
    const missingAuto = Object.keys(autoKeys).filter((k) => !enKeySet.has(k));
    console.log(`  auto keys: ${Object.keys(autoKeys).length}, missing in en.json: ${missingAuto.length}`);
}

if (missingKeys.length > 0) {
    console.log('\nMissing keys (used but missing in locales/en.json):');
    missingKeys.slice(0, 200).forEach((k) => console.log('  -', k));
}

if (unusedKeys.length > 0) {
    console.log('\nUnused keys (present in en.json but not used in sources):');
    // show the first 200
    unusedKeys.slice(0, 200).forEach((k) => console.log('  -', k));
}

if (missingKeys.length > 0) process.exit(1);
process.exit(0);
