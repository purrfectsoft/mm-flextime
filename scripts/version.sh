#!/bin/bash

# Version script for yarn v4 compatibility
# This script runs before creating the version tag to update hashes and stage changes

set -e  # Exit on error

echo "🔄 Running version hooks..."
echo "   Updating hashes..."
node scripts/update-hashes.js

echo "   Staging index.html..."
git add index.html

echo "✅ Version hooks complete"
