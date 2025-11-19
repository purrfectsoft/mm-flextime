#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.join(__dirname, '..');

/**
 * Calculate SHA256 hash of a file
 */
function hashFile(filePath) {
    const content = fs.readFileSync(filePath);
    return crypto.createHash('sha256').update(content).digest('hex').substring(0, 8);
}

/**
 * Get version from package.json
 */
function getVersion() {
    const packageJsonPath = path.join(projectRoot, 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    return packageJson.version;
}

/**
 * Update APP_VERSION constant in i18n.js
 */
function updateI18nVersion(version) {
    const i18nPath = path.join(projectRoot, 'scripts', 'i18n.js');
    let content = fs.readFileSync(i18nPath, 'utf8');

    // Update APP_VERSION constant
    content = content.replace(/const APP_VERSION = '[^']*';/, `const APP_VERSION = 'v${version}';`);

    fs.writeFileSync(i18nPath, content, 'utf8');
    console.log(`   ✓ Updated APP_VERSION in scripts/i18n.js to v${version}`);
}

/**
 * Update HTML with new hashes and version
 */
function updateHtmlWithHashes() {
    const htmlPath = path.join(projectRoot, 'index.html');
    const cssPath = path.join(projectRoot, 'index.css');
    const jsPath = path.join(projectRoot, 'index.js');
    const i18nPath = path.join(projectRoot, 'scripts', 'i18n.js');
    const localesPath = path.join(projectRoot, 'locales');

    // Get version first
    const version = getVersion();

    // Update APP_VERSION in i18n.js before calculating its hash
    updateI18nVersion(version);

    // Read HTML first to calculate its hash (before modifications)
    const htmlContent = fs.readFileSync(htmlPath, 'utf8');

    // Calculate hashes
    const cssHash = hashFile(cssPath);
    const jsHash = hashFile(jsPath);
    const i18nHash = hashFile(i18nPath);

    // Calculate combined hash for locale files
    const localeFiles = fs.readdirSync(localesPath).filter((f) => f.endsWith('.json'));
    const localeHashes = localeFiles.map((f) => hashFile(path.join(localesPath, f)));
    const localesHash = crypto.createHash('sha256').update(localeHashes.join('')).digest('hex').substring(0, 8);

    const htmlHash = crypto.createHash('sha256').update(htmlContent).digest('hex').substring(0, 8);

    console.log(`📦 Updating hashes and version...`);
    console.log(`   Version: ${version}`);
    console.log(`   HTML hash: ${htmlHash}`);
    console.log(`   CSS hash: ${cssHash}`);
    console.log(`   JS hash: ${jsHash}`);
    console.log(`   i18n.js hash: ${i18nHash}`);
    console.log(`   Locales hash: ${localesHash} (${localeFiles.length} files)`);

    // Update HTML with new hashes
    let html = htmlContent;

    // Replace CSS link with new hash
    html = html.replace(/href="index\.css\?v=[^"]*"/, `href="index.css?v=${version}-${cssHash}"`);

    // Replace JS script with new hash
    html = html.replace(/src="index\.js\?v=[^"]*"/, `src="index.js?v=${version}-${jsHash}"`);

    // Replace i18n.js script with new hash
    html = html.replace(/src="scripts\/i18n\.js"/, `src="scripts/i18n.js?v=${version}-${i18nHash}"`);

    // Update data-html-hash attribute on body for deployment verification
    html = html.replace(/data-html-hash="[^"]*"/, `data-html-hash="${htmlHash}"`);

    // Add data-locales-hash attribute for locale file tracking
    if (html.includes('data-locales-hash=')) {
        html = html.replace(/data-locales-hash="[^"]*"/, `data-locales-hash="${localesHash}"`);
    } else {
        // Add it after data-html-hash
        html = html.replace(/(data-html-hash="[^"]*")/, `$1 data-locales-hash="${localesHash}"`);
    }

    // Replace version in footer (note: this is now handled by i18n with {version} placeholder)
    // But we keep this for backwards compatibility
    html = html.replace(/Strategic Proposal Microsite v[\d.]+/, `Strategic Proposal Microsite v${version}`);

    // Write updated HTML
    fs.writeFileSync(htmlPath, html, 'utf8');

    console.log(`✅ HTML updated with new hashes and version`);

    // Return hashes for deployment verification
    return {
        version,
        html: htmlHash,
        css: cssHash,
        js: jsHash,
        i18n: i18nHash,
        locales: localesHash,
    };
}

// Run the update
try {
    updateHtmlWithHashes();
    process.exit(0);
} catch (error) {
    console.error('❌ Error updating hashes:', error.message);
    process.exit(1);
}
