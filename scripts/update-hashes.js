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
 * Update HTML with new hashes and version
 */
function updateHtmlWithHashes() {
  const htmlPath = path.join(projectRoot, 'index.html');
  const cssPath = path.join(projectRoot, 'index.css');
  const jsPath = path.join(projectRoot, 'index.js');

  // Calculate hashes
  const cssHash = hashFile(cssPath);
  const jsHash = hashFile(jsPath);
  const version = getVersion();

  console.log(`📦 Updating hashes and version...`);
  console.log(`   Version: ${version}`);
  console.log(`   CSS hash: ${cssHash}`);
  console.log(`   JS hash: ${jsHash}`);

  // Read HTML
  let html = fs.readFileSync(htmlPath, 'utf8');

  // Replace CSS link with new hash
  html = html.replace(
    /href="index\.css\?v=[^"]*"/,
    `href="index.css?v=${version}-${cssHash}"`
  );

  // Replace JS script with new hash
  html = html.replace(
    /src="index\.js\?v=[^"]*"/,
    `src="index.js?v=${version}-${jsHash}"`
  );

  // Replace version in footer
  html = html.replace(
    /Strategic Proposal Microsite v[\d.]+/,
    `Strategic Proposal Microsite v${version}`
  );

  // Write updated HTML
  fs.writeFileSync(htmlPath, html, 'utf8');

  console.log(`✅ HTML updated with new hashes and version`);
}

// Run the update
try {
  updateHtmlWithHashes();
  process.exit(0);
} catch (error) {
  console.error('❌ Error updating hashes:', error.message);
  process.exit(1);
}
