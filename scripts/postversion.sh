#!/bin/bash

# Postversion script for yarn v4 compatibility
# This script runs after yarn version command to push commits and tags

set -e  # Exit on error

echo "📤 Running postversion hooks..."
echo "   Pushing commits to origin..."
git push

echo "   Pushing tags to origin..."
git push --tags

echo "✅ Postversion complete"
