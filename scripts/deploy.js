#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import crypto from 'crypto';
import https from 'https';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.join(__dirname, '..');

// Load environment variables
const envPath = path.join(projectRoot, '.env');
if (!fs.existsSync(envPath)) {
    console.error('❌ .env file not found. Please create it based on .env.example');
    process.exit(1);
}
dotenv.config({ path: envPath });

const {
    SSH_HOST,
    SSH_USER,
    SSH_KEY_PATH,
    WEB_ROOT,
    WEB_URL,
    GIT_REMOTE = 'origin',
    DEPLOY_BRANCH = 'deploy',
    DEVELOP_BRANCH = 'develop',
} = process.env;

// Validate required env vars
const required = ['SSH_HOST', 'SSH_USER', 'SSH_KEY_PATH', 'WEB_ROOT', 'WEB_URL'];
const missing = required.filter((v) => !process.env[v]);
if (missing.length) {
    console.error(`❌ Missing environment variables: ${missing.join(', ')}`);
    process.exit(1);
}

/**
 * Execute shell command
 */
function exec(cmd, options = {}) {
    try {
        return execSync(cmd, {
            stdio: 'pipe',
            cwd: projectRoot,
            ...options,
        })
            .toString()
            .trim();
    } catch (error) {
        throw new Error(`Command failed: ${cmd}\n${error.message}`);
    }
}

/**
 * Execute shell command with output
 */
function execWithOutput(cmd, label = '') {
    try {
        console.log(`  ℹ️  ${label || cmd}`);
        return execSync(cmd, {
            stdio: 'inherit',
            cwd: projectRoot,
        });
    } catch (error) {
        throw new Error(`Command failed: ${cmd}`);
    }
}

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
 * Get hashes from HTML
 */
function getHashesFromHtml() {
    const htmlPath = path.join(projectRoot, 'index.html');
    const content = fs.readFileSync(htmlPath, 'utf8');

    const htmlMatch = content.match(/data-html-hash="([^"]*)"/);
    const localesMatch = content.match(/data-locales-hash="([^"]*)"/);
    const cssMatch = content.match(/index\.css\?v=[\w.-]+/);
    const jsMatch = content.match(/index\.js\?v=[\w.-]+/);
    const i18nMatch = content.match(/scripts\/i18n\.js\?v=[\w.-]+/);

    return {
        html: htmlMatch ? htmlMatch[1] : null,
        css: cssMatch ? cssMatch[0].split('-')[1] : null,
        js: jsMatch ? jsMatch[0].split('-')[1] : null,
        i18n: i18nMatch ? i18nMatch[0].split('-')[1] : null,
        locales: localesMatch ? localesMatch[1] : null,
    };
}

/**
 * Fetch and verify remote deployment
 */
function verifyRemoteDeployment(version, localHashes) {
    return new Promise((resolve, reject) => {
        const url = new URL(WEB_URL);

        https
            .get(url, { timeout: 5000 }, (res) => {
                let data = '';

                res.on('data', (chunk) => {
                    data += chunk;
                });
                res.on('end', () => {
                    try {
                        // Extract version from footer
                        const versionMatch = data.match(/Strategic Proposal Microsite v([\d.]+)/);
                        const remoteVersion = versionMatch ? versionMatch[1] : null;

                        // Extract hashes from HTML
                        const htmlMatch = data.match(/data-html-hash="([^"]*)"/);
                        const localesMatch = data.match(/data-locales-hash="([^"]*)"/);
                        const cssMatch = data.match(/index\.css\?v=[\w.-]+/);
                        const jsMatch = data.match(/index\.js\?v=[\w.-]+/);
                        const i18nMatch = data.match(/scripts\/i18n\.js\?v=[\w.-]+/);

                        const remoteHashes = {
                            html: htmlMatch ? htmlMatch[1] : null,
                            css: cssMatch ? cssMatch[0].split('-')[1] : null,
                            js: jsMatch ? jsMatch[0].split('-')[1] : null,
                            i18n: i18nMatch ? i18nMatch[0].split('-')[1] : null,
                            locales: localesMatch ? localesMatch[1] : null,
                        };

                        // Verify match
                        const versionMatch_ = remoteVersion === version;
                        const htmlMatch_ = remoteHashes.html === localHashes.html;
                        const cssMatch_ = remoteHashes.css === localHashes.css;
                        const jsMatch_ = remoteHashes.js === localHashes.js;
                        const i18nMatch_ = remoteHashes.i18n === localHashes.i18n;
                        const localesMatch_ = remoteHashes.locales === localHashes.locales;

                        if (versionMatch_ && htmlMatch_ && cssMatch_ && jsMatch_ && i18nMatch_ && localesMatch_) {
                            resolve({ version: remoteVersion, hashes: remoteHashes });
                        } else {
                            reject(
                                new Error(
                                    `Version/hash mismatch:\n` +
                                        `  Version: ${remoteVersion} (expected ${version})\n` +
                                        `  HTML: ${remoteHashes.html} (expected ${localHashes.html})\n` +
                                        `  CSS: ${remoteHashes.css} (expected ${localHashes.css})\n` +
                                        `  JS: ${remoteHashes.js} (expected ${localHashes.js})\n` +
                                        `  i18n.js: ${remoteHashes.i18n} (expected ${localHashes.i18n})\n` +
                                        `  Locales: ${remoteHashes.locales} (expected ${localHashes.locales})`
                                )
                            );
                        }
                    } catch (error) {
                        reject(error);
                    }
                });
            })
            .on('error', reject);
    });
}

/**
 * Display deployment status
 */
function displayStatus(version, hashes, url) {
    const box = (text) => {
        const padding = '  ';
        const line = '═'.repeat(text.length + padding.length * 2);
        return [`╔${line}╗`, `║${padding}${text}${padding}║`, `╚${line}╝`].join('\n');
    };

    // Add HTML hash as query parameter for cache busting
    const urlWithHash = `${url}?h=${hashes.html}`;

    console.log('\n');
    console.log('╔═══════════════════════════════════════════════════════════════╗');
    console.log('║                  ✅ DEPLOYMENT SUCCESSFUL                      ║');
    console.log('╚═══════════════════════════════════════════════════════════════╝');
    console.log('');
    console.log(`  📦      Version:    ${version}`);
    console.log(`  📄    HTML Hash:    ${hashes.html}`);
    console.log(`  🎨     CSS Hash:    ${hashes.css}`);
    console.log(`  ⚙️      JS Hash:    ${hashes.js}`);
    console.log(`  🌐  i18n Hashes:    ${hashes.i18n} ${hashes.locales}`);
    console.log(`  🔗          URL:    ${urlWithHash}`);
    console.log('');
    console.log('═'.repeat(67));
    console.log('');
}

/**
 * Main deployment flow
 */
async function deploy() {
    try {
        console.log('🚀 Starting deployment process...\n');

        // Step 1: Verify local git state
        console.log('📋 Step 1: Verifying local git state...');
        try {
            const currentBranch = exec('git rev-parse --abbrev-ref HEAD');
            if (currentBranch !== DEVELOP_BRANCH) {
                console.log(`  ⚠️  Currently on ${currentBranch}, attempting to switch to ${DEVELOP_BRANCH}...`);

                // Check if working tree is clean
                const status = exec('git status --porcelain');
                if (status) {
                    throw new Error(
                        `Cannot switch branches: Uncommitted changes detected. Please commit or stash changes.`
                    );
                }

                // Safe switch back to develop branch
                try {
                    exec(`git checkout ${DEVELOP_BRANCH}`);
                    console.log(`  ✅ Switched to ${DEVELOP_BRANCH} branch`);
                } catch (error) {
                    throw new Error(`Failed to switch to ${DEVELOP_BRANCH}: ${error.message}`);
                }
            } else {
                console.log(`  ✅ On ${DEVELOP_BRANCH} branch`);
            }
        } catch (error) {
            throw new Error(`Git verification failed: ${error.message}`);
        }

        // Step 2: Check git status
        console.log('📋 Step 2: Checking git status...');
        try {
            const status = exec('git status --porcelain');
            if (status) {
                throw new Error('Uncommitted changes detected. Please commit or stash changes.');
            }
            console.log('  ✅ Working directory clean');
        } catch (error) {
            throw new Error(`Git status check failed: ${error.message}`);
        }

        // Step 3: Fetch latest
        console.log('📋 Step 3: Fetching latest changes...');
        execWithOutput(`git fetch ${GIT_REMOTE}`, `Fetching from ${GIT_REMOTE}`);
        console.log('  ✅ Fetch complete');

        // Step 4: Merge develop into deploy locally (--ff-only)
        console.log('📋 Step 4: Merging develop → deploy locally...');
        try {
            exec(`git checkout ${DEPLOY_BRANCH}`);
            exec(`git merge ${GIT_REMOTE}/${DEVELOP_BRANCH} --ff-only`);
            console.log('  ✅ Fast-forward merge successful');
        } catch (error) {
            throw new Error(`Merge failed: ${error.message}`);
        }

        // Step 5: Push deploy branch
        console.log('📋 Step 5: Pushing deploy branch...');
        execWithOutput(`git push ${GIT_REMOTE} ${DEPLOY_BRANCH}`, `Pushing ${DEPLOY_BRANCH} to ${GIT_REMOTE}`);
        console.log('  ✅ Push complete');

        // Step 6: SSH to remote and pull
        console.log(`📋 Step 6: Pulling on remote server (${SSH_HOST})...`);
        const sshCmd = `ssh -i ${SSH_KEY_PATH} ${SSH_USER}@${SSH_HOST} "cd ${WEB_ROOT} && git branch | grep -q '\\* ${DEPLOY_BRANCH}' && git pull ${GIT_REMOTE} ${DEPLOY_BRANCH}"`;
        try {
            execWithOutput(sshCmd, `Executing remote pull on ${SSH_HOST}`);
            console.log('  ✅ Remote pull complete');
        } catch (error) {
            throw new Error(`SSH deployment failed: ${error.message}`);
        }

        // Step 7: Get local version and hashes
        console.log('📋 Step 7: Verifying deployment...');
        const version = getVersion();
        const localHashes = getHashesFromHtml();
        console.log(`  ℹ️  Local version: ${version}`);
        console.log(`  ℹ️  Local HTML hash: ${localHashes.html}`);
        console.log(`  ℹ️  Local CSS hash: ${localHashes.css}`);
        console.log(`  ℹ️  Local JS hash: ${localHashes.js}`);
        console.log(`  ℹ️  Local i18n.js hash: ${localHashes.i18n}`);
        console.log(`  ℹ️  Local Locales hash: ${localHashes.locales}`);

        // Step 8: Verify remote deployment
        console.log(`📋 Step 8: Checking remote deployment (${WEB_URL})...`);
        const remoteDeployment = await verifyRemoteDeployment(version, localHashes);
        console.log(`  ✅ Remote deployment verified`);

        // Step 9: Display status
        displayStatus(version, localHashes, WEB_URL);

        process.exit(0);
    } catch (error) {
        console.error('\n❌ Deployment failed:');
        console.error(`   ${error.message}\n`);
        process.exit(1);
    }
}

// Run deployment
deploy();
