#!/usr/bin/env bash
set -euo pipefail

echo "🔍 [HARNESS] Validating SDD Specifications in specs/features/..."

SPECS_DIR="specs/features"
TEMPLATES_DIR="specs/templates"

if [ ! -d "$SPECS_DIR" ]; then
    echo "⚠️  No $SPECS_DIR directory found."
    exit 0
fi

SPEC_FILES=$(find "$SPECS_DIR" -maxdepth 1 -name "*.spec.md" 2>/dev/null || true)

if [ -z "$SPEC_FILES" ]; then
    echo "ℹ️  No active feature specifications found in $SPECS_DIR (Templates excluded)."
    exit 0
fi

FAILED=0

for spec in $SPEC_FILES; do
    echo "  Checking spec: $spec"
    
    # Check for required sections
    for section in "Intent & Business Value" "Requirements & Business Rules" "Acceptance Criteria"; do
        if ! grep -q "$section" "$spec"; then
            echo "    ❌ ERROR: Missing required section '$section' in $spec"
            FAILED=1
        fi
    done
done

if [ $FAILED -ne 0 ]; then
    echo "❌ [HARNESS] SDD Spec validation failed."
    exit 1
fi

echo "✅ [HARNESS] All SDD Specifications are valid."
