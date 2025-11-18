#!/usr/bin/env node
// Proposes curation mapping between auto.* keys in locales/en.json and semantic keys
// based on identical (or near-identical) string values.
const fs = require('fs');
const path = require('path');
const localePath = path.resolve(__dirname, '../locales/en.json');
if (!fs.existsSync(localePath)) {
    console.error('Locales file not found: ' + localePath);
    process.exit(1);
}
const raw = fs.readFileSync(localePath, 'utf8');
const json = JSON.parse(raw);
const auto = Object.entries(json).filter(([k]) => k.startsWith('auto.'));
const others = Object.entries(json).filter(([k]) => !k.startsWith('auto.'));

const normalize = (s) => s.replace(/[^\w]/g, '').toLowerCase();

const suggestions = [];
for (const [k, v] of auto) {
    const norm = normalize(v);
    if (!norm) continue;
    // search for exact match in other keys
    const match = others.find(([sk, sv]) => normalize(sv) === norm);
    if (match) {
        suggestions.push({ auto: k, candidate: match[0], value: v });
    }
}

if (suggestions.length === 0) {
    console.log('No simple auto.* -> semantic matches found based on normalization.');
    process.exit(0);
}

const out = {};
suggestions.forEach((s) => {
    out[s.auto] = s.candidate;
});
console.log('Proposed mappings (auto => semantic):\n');
console.log(JSON.stringify(out, null, 4));

console.log(
    '\nHuman review recommended. This maps auto.* keys to suspected existing semantic keys if values match exactly (ignoring punctuation/case).\n'
);

process.exit(0);
