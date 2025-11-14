# Deployment Guide

This guide covers the automated deployment process for the MM FlexTime Microsite.

## Quick Start

### 1. Setup (One-time)

```bash
# Copy example configuration
cp .env.example .env

# Edit .env with your server details
nano .env

# 3. Install dependencies
npm run install
```

### Automatic Updates

````

### 2. Create a Version

```bash
```bash
# Patch release (1.0.0 → 1.0.1)
npm run version patch

# Minor release (1.0.0 → 1.1.0)
npm run version minor

# Major release (1.0.0 → 2.0.0)
npm run version major

# Specific version
npm run version 1.5.0
````

````

### 3. Deploy to Production

```bash
npm run deploy
````

This will:

- Verify you're on the `develop` branch
- Fetch latest changes from origin
- Fast-forward merge `develop` → `deploy` branch (locally)
- Push `deploy` branch to remote
- SSH to your server and pull the latest
- Verify the deployment by checking version and hashes on the live URL

## Environment Configuration

Create a `.env` file in the project root (copy from `.env.example`):

```bash
# SSH Connection Details
SSH_HOST=your-server.com          # Your server hostname
SSH_USER=deploy                   # SSH user (should have git access)
SSH_KEY_PATH=~/.ssh/id_rsa        # Path to your SSH private key

# Remote Server Configuration
WEB_ROOT=/var/www/mm-flextime-microsite    # Where the website is deployed

# Web URL for Verification
WEB_URL=https://your-domain.com/mm-flextime  # Live URL to verify deployment

# Git Configuration (optional)
GIT_REMOTE=origin                 # Default remote
DEPLOY_BRANCH=deploy              # Deployment branch
DEVELOP_BRANCH=develop            # Development branch
```

## Deployment Workflow

### Local Changes → Production

```
┌─────────────────────────────────────┐
│ Local: develop branch               │
│ Make changes, commit                │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│ npm run version patch                  │
│ - Updates version in package.json   │
│ - Recalculates CSS/JS hashes        │
│ - Updates HTML                      │
│ - Creates git tag                   │
│ - Pushes to origin                  │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│ npm run deploy                         │
│ - Verifies develop branch           │
│ - Fetches from origin               │
│ - Merges develop → deploy (--ff)    │
│ - Pushes deploy branch              │
│ - SSHs to server & pulls            │
│ - Verifies version/hashes on live   │
└─────────────────────────────────────┘
```

## File Hashing System

The deployment system uses SHA256 hashing to prevent aggressive browser caching:

- **CSS**: `index.css?v=1.0.0-2b0e0feb`
- **JS**: `index.js?v=1.0.0-97ebc825`

When either file changes, the hash changes, forcing browsers to fetch the new version.

The `update-hashes.js` script:

1. Reads `package.json` for current version
2. Calculates SHA256 hash of `index.css` (first 8 chars)
3. Calculates SHA256 hash of `index.js` (first 8 chars)
4. Updates `index.html` with new query params
5. Also updates the footer version display

## Git Branches

- **develop**: Main development branch
- **deploy**: Production-ready branch (merged from develop)

The deploy script ensures a clean fast-forward merge to prevent merge commits.

## Security Considerations

1. **SSH Key**: Ensure your `SSH_KEY_PATH` points to a secure key with limited permissions
2. **.env**: Never commit `.env` - it's in `.gitignore`
3. **SSH User**: Create a dedicated git-pulling user on the server with minimal permissions
4. **Remote permissions**: The SSH user should only be able to:
    - Access `WEB_ROOT` directory
    - Execute `git pull` and `git status`
    - Read web files

## Troubleshooting

### "Uncommitted changes detected"

```bash
# Commit your changes
git add .
git commit -m "Your message"

# Or stash if not ready
git stash
```

### "Currently on main, must be on develop"

```bash
# Switch to develop
git checkout develop

# Ensure you're in sync
git pull origin develop
```

### SSH connection fails

```bash
# Test SSH connection
ssh -i ~/.ssh/id_rsa user@host

# Check key permissions
ls -la ~/.ssh/id_rsa    # Should be 600
```

### Version/hash mismatch after deployment

```bash
# Ensure remote has latest code
ssh -i ~/.ssh/id_rsa user@host "cd /var/www/mm-flextime-microsite && git status"

# Manually pull on server
ssh -i ~/.ssh/id_rsa user@host "cd /var/www/mm-flextime-microsite && git pull origin deploy"
```

## Rollback

If needed, rollback to a previous version:

```bash
# Locally
git checkout v1.0.0      # Checkout previous tag
npm run deploy           # Deploy the previous version

# The script will verify the remote matches the local version
```

## CI/CD Integration

For GitHub Actions or similar, use:

```bash
npm run install
npm run deploy
```

The script will handle all git operations and remote deployment.

## Production Checklist

Before deploying to production:

- [ ] All changes committed and pushed
- [ ] `.env` configured with correct server details
- [ ] SSH key has correct permissions
- [ ] Web server is running
- [ ] Git is initialized on remote server
- [ ] Deploy branch exists on remote
- [ ] DNS/URL is pointing to correct server

## Support

For issues or questions, check:

1. `.env` configuration
2. Git branch status: `git status`
3. Remote connectivity: `ssh -i SSH_KEY_PATH SSH_USER@SSH_HOST`
4. Server logs: `ssh ... "tail -f /var/log/nginx/error.log"`
