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

  // Read HTML first to calculate its hash (before modifications)
  const htmlContent = fs.readFileSync(htmlPath, 'utf8');
  
  // Calculate hashes
  const cssHash = hashFile(cssPath);
  const jsHash = hashFile(jsPath);
  const htmlHash = crypto.createHash('sha256').update(htmlContent).digest('hex').substring(0, 8);
  const version = getVersion();

  console.log(`📦 Updating hashes and version...`);
  console.log(`   Version: ${version}`);
  console.log(`   HTML hash: ${htmlHash}`);
  console.log(`   CSS hash: ${cssHash}`);
  console.log(`   JS hash: ${jsHash}`);

  // Update HTML with new hashes
  let html = htmlContent;

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

  // Update data-html-hash attribute on body for deployment verification
  html = html.replace(
    /data-html-hash="[^"]*"/,
    `data-html-hash="${htmlHash}"`
  );

  // Replace version in footer
  html = html.replace(
    /Strategic Proposal Microsite v[\d.]+/,
    `Strategic Proposal Microsite v${version}`
  );

  // Write updated HTML
  fs.writeFileSync(htmlPath, html, 'utf8');

  console.log(`✅ HTML updated with new hashes and version`);
  
  // Return hashes for deployment verification
  return {
    version,
    html: htmlHash,
    css: cssHash,
    js: jsHash,
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
