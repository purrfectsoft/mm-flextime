const fs = require('fs');
const path = require('path');

const projectRoot = path.resolve(__dirname, '..');
const htmlPath = path.join(projectRoot, 'index.html');
const jsPath = path.join(projectRoot, 'index.js');
const outPath = path.join(projectRoot, 'locales', 'en.auto.json');

function extractFromHtml(html) {
    const regex = />\s*([^<\n][^<]{0,200}?)\s*</g;
    const texts = new Set();
    let m;
    while ((m = regex.exec(html)) !== null) {
        const t = m[1].trim();
        if (!t) continue;
        // skip script/style-ish
        if (/^<!|^!--|^\{|^\}|^=|^<\//.test(t)) continue;
        // skip numbers only
        if (/^[\d,\.\+\-%:\s]+$/.test(t)) continue;
        texts.add(t);
    }
    return [...texts];
}

function extractFromJs(js) {
    const texts = new Set();
    // showToast string args
    const showToastRegex = /showToast\((`|'|\")(.*?)\1/gs;
    let m;
    while ((m = showToastRegex.exec(js)) !== null) {
        const s = m[2].trim();
        if (s) {
            const cleaned = s.replace(/\${.*?}/g, '{{var}}');
            texts.add(cleaned);
        }
    }
    // add other pattern-based strings
    const textContentRegex = /\.textContent\s*=\s*['\"](.*?)['\"]/gs;
    while ((m = textContentRegex.exec(js)) !== null) {
        const s = m[1].trim();
        if (s) texts.add(s);
    }
    const setAttributeRegex = /setAttribute\(\s*['\"](title|alt|placeholder)['\"]\s*,\s*['\"](.*?)['\"]\s*\)/gs;
    while ((m = setAttributeRegex.exec(js)) !== null) {
        const s = m[2].trim();
        if (s) texts.add(s);
    }

    return [...texts];
}

(function () {
    try {
        const html = fs.readFileSync(htmlPath, 'utf8');
        const js = fs.readFileSync(jsPath, 'utf8');
        const h = extractFromHtml(html);
        const j = extractFromJs(js);

        const resultSet = new Set([...h, ...j]);
        const filtered = [...resultSet].filter((s) => s && s.length > 0 && s.length < 300);

        const result = {};
        filtered.forEach((s) => {
            const key = s
                .toLowerCase()
                .replace(/[^a-z0-9\s]/g, '')
                .trim()
                .replace(/\s+/g, '.')
                .slice(0, 80);
            let k = key || `string_${Object.keys(result).length + 1}`;
            let count = 1;
            while (result[k]) {
                k = `${key}.${count}`;
                count++;
            }
            result[k] = s;
        });

        fs.mkdirSync(path.dirname(outPath), { recursive: true });
        fs.writeFileSync(outPath, JSON.stringify(result, null, 2), 'utf8');
        console.log('Extracted', Object.keys(result).length, 'strings to', outPath);
    } catch (err) {
        console.error('Extraction failed', err);
        process.exit(1);
    }
})();
