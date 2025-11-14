# File Hashing & Versioning System

This microsite uses an automated file hashing system to prevent aggressive caching of CSS and JavaScript assets while maintaining deterministic cache control.

## How It Works

### Version Format

Files are versioned using the format: `?v={version}-{hash}`

Example: `index.css?v=1.0.0-2b0e0feb`

- **version**: Semantic version from `package.json` (e.g., `1.0.0`)
- **hash**: First 8 characters of the SHA256 hash of the file

### Automatic Updates

When you bump the version using yarn, the system automatically:

1. **Updates `package.json`** with the new version
2. **Calculates file hashes** for `index.css` and `index.js`
3. **Updates `index.html`** with the new version and hashes
4. **Commits changes** to git (via postversion hook)

## Workflow

### Bumping the Version

```bash
# Patch release (1.0.0 → 1.0.1)
npm run version patch

# Minor release (1.0.0 → 1.1.0)
npm run version minor

# Major release (1.0.0 → 2.0.0)
npm run version major

# Specific version
npm run version 1.5.0
```

### What Happens Behind the Scenes

```
npm run version patch
    ↓
Updates package.json version
    ↓
Runs "version" script (update-hashes.js)
    ├─ Calculates SHA256 hashes for index.css and index.js
    ├─ Updates index.html with new hashes
    └─ Stages index.html for commit
    ↓
Creates git tag (v1.0.1)
    ↓
Commits changes ("v1.0.1")
    ↓
Runs "postversion" script
    ├─ Pushes commits to origin
    └─ Pushes tags to origin
```

## Benefits

✅ **Browser Cache Busting**: Unique hash on every file change  
✅ **Deterministic**: Same version = same hash (useful for tracking)  
✅ **Semantic Versioning**: Standard npm run versioning practices  
✅ **Automated**: No manual hash updates needed  
✅ **Auditable**: Git history shows all version changes  
✅ **CDN-Friendly**: Different query parameters mean different cache entries

## Example Scenario

1. You make changes to `index.css`
2. Run `npm run version patch`
3. Script detects the file changed → new hash calculated
4. HTML automatically updated: `index.css?v=1.0.1-9c3f2a1e`
5. Browser fetches new CSS instead of using cached version
6. Changes automatically committed and pushed

## Scripts Reference

### `scripts/update-hashes.js`

Calculates SHA256 hashes of CSS and JS files and updates the HTML.

**Triggered by**: `npm run version` command  
**Modifies**: `index.html`  
**Output**: Console log showing version and hashes

### npm run Hooks

- **version** script: Runs before git tag is created
- **`postversion`** script: Runs after git tag is created, pushes commits

## Manual Hash Update

If you need to manually recalculate hashes without bumping the version:

```bash
node scripts/update-hashes.js
```

This is useful for testing or if you've modified files without updating version.

## Troubleshooting

### Hashes aren't updating

Ensure your files have been saved and run:

```bash
node scripts/update-hashes.js
```

### Git push fails after version bump

Check your git remote is configured and you have push permissions:

```bash
git remote -v
git push origin develop
```

To skip the automatic push temporarily, you can run:

```bash
npm run version patch --no-git-tag-version
node scripts/update-hashes.js
```

Then manually commit and push.

## Version History

All version changes are tagged in git. View the history:

```bash
git tag -l
git log --oneline --all
```

## Integration with Deployment

When deploying:

1. Version is already bumped locally
2. All files are hashed and HTML is updated
3. Changes are committed and pushed
4. Deployment system can safely cache by version

No additional build steps needed!
