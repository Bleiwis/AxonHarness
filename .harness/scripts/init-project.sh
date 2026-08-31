#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT_DIR"

echo "========================================================="
echo "⚡ INITIALIZING NEW PROJECT FROM HARNESS TEMPLATE"
echo "========================================================="

read -p "Enter project name [my-harness-app]: " PROJECT_NAME
PROJECT_NAME=${PROJECT_NAME:-my-harness-app}

read -p "Enter project description: " PROJECT_DESC
PROJECT_DESC=${PROJECT_DESC:-"AI-Native project built on the Engineering Harness"}

read -p "Enter author/owner name: " AUTHOR_NAME
AUTHOR_NAME=${AUTHOR_NAME:-"Capability Architect"}

echo ""
echo "🚀 Configuring project '$PROJECT_NAME'..."

# 1. Install Git Hooks if inside a Git repo
if [ -d ".git" ]; then
    mkdir -p .git/hooks
    cp .harness/hooks/pre-commit .git/hooks/pre-commit
    cp .harness/hooks/pre-push .git/hooks/pre-push
    chmod +x .git/hooks/pre-commit .git/hooks/pre-push
    echo "✅ Git hooks installed (pre-commit, pre-push)."
else
    echo "ℹ️  Not a git repository yet. Run 'git init && make install-hooks' later."
fi

# 2. Make all harness scripts executable
chmod +x .harness/scripts/*.sh .harness/hooks/* 2>/dev/null || true

echo ""
echo "========================================================="
echo "🎉 Project initialized successfully!"
echo "Run 'make verify' to confirm your harness is ready."
echo "========================================================="
