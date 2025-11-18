#!/usr/bin/env node
// Lists the auto.* keys in locales/en.json for manual curation
const fs = require('fs');
const path = require('path');
const localePath = path.resolve(__dirname, '../locales/en.json');
if (!fs.existsSync(localePath)) {
    console.error('Locales file not found: ' + localePath);
    process.exit(1);
}
const raw = fs.readFileSync(localePath, 'utf8');
const json = JSON.parse(raw);
const autoKeys = Object.entries(json).filter(([k]) => k.startsWith('auto.'));
if (autoKeys.length === 0) {
    console.log('No auto.* keys in en.json');
    process.exit(0);
}
console.log(`Found ${autoKeys.length} auto.* keys in en.json`);
// Sort by key
const keys = autoKeys.map(([k, v]) => ({ key: k, value: v }));
keys.sort((a, b) => a.key.localeCompare(b.key));
keys.forEach((k) => console.log(`${k.key}: ${k.value}`));

console.log('\nTop 50 preview:');
keys.slice(0, 50).forEach((k) => console.log(`${k.key}: ${k.value}`));
