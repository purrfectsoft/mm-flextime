#!/usr/bin/env node
// Prunes 'auto.*' keys in locales/en.json when a semantic key with the same value exists
// This helps remove duplicated auto keys left from the extraction process.
const fs = require('fs');
const path = require('path');
const localePath = path.resolve(__dirname, '../locales/en.json');
if (!fs.existsSync(localePath)) {
    console.error('Locales file not found: ' + localePath);
    process.exit(1);
}
const raw = fs.readFileSync(localePath, 'utf8');
const json = JSON.parse(raw);
const autoKeys = Object.keys(json).filter((k) => k.startsWith('auto.'));
if (autoKeys.length === 0) {
    console.log('No auto.* keys in en.json');
    process.exit(0);
}

const inverted = {};
Object.entries(json).forEach(([k, v]) => {
    const s = String(v).trim();
    if (s && !inverted[s]) {
        inverted[s] = [];
    }
    if (s) inverted[s].push(k);
});

const toRemove = [];
for (const k of autoKeys) {
    const v = json[k];
    const duplicates = inverted[String(v).trim()] || [];
    // If there is a non-auto key with the same value, remove this auto key
    const hasSemantic = duplicates.some((d) => !d.startsWith('auto.'));
    if (hasSemantic) {
        toRemove.push(k);
    }
}

if (toRemove.length === 0) {
    console.log('No auto.* duplicate keys that match semantic keys were found.');
    process.exit(0);
}

console.log('Found the following auto.* keys that appear to be duplicates of existing semantic keys:');
toRemove.forEach((k) => console.log(k + ' -> ' + json[k]));

const previewPath = path.resolve(__dirname, '../locales/en.pruned.json');
const newJson = { ...json };
for (const k of toRemove) delete newJson[k];
fs.writeFileSync(previewPath, JSON.stringify(newJson, null, 4));

console.log(
    '\nCreated a pruned preview file at locales/en.pruned.json. Review it and if acceptable, overwrite locales/en.json or keep it to maintain history.'
);
process.exit(0);
