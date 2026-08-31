#!/usr/bin/env bash
set -euo pipefail

echo "🥒 [HARNESS] Validating BDD Gherkin Feature files in specs/bdd/..."

BDD_DIR="specs/bdd"

if [ ! -d "$BDD_DIR" ]; then
    echo "⚠️  No $BDD_DIR directory found."
    exit 0
fi

FEATURE_FILES=$(find "$BDD_DIR" -maxdepth 1 -name "*.feature" 2>/dev/null || true)

if [ -z "$FEATURE_FILES" ]; then
    echo "ℹ️  No active feature files found in $BDD_DIR (Templates excluded)."
    exit 0
fi

FAILED=0

for feature in $FEATURE_FILES; do
    echo "  Checking feature: $feature"
    
    # Check for Feature keyword
    if ! grep -q "^Feature:" "$feature"; then
        echo "    ❌ ERROR: Missing 'Feature:' declaration in $feature"
        FAILED=1
    fi

    # Check for Gherkin Given/When/Then steps
    if ! grep -q -E "(Given|When|Then)" "$feature"; then
        echo "    ❌ ERROR: No Given/When/Then steps found in $feature"
        FAILED=1
    fi
done

if [ $FAILED -ne 0 ]; then
    echo "❌ [HARNESS] BDD Gherkin validation failed."
    exit 1
fi

echo "✅ [HARNESS] All BDD Feature files are valid."
