#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT_DIR"

echo "========================================================="
echo "🛡️  ENGINEERING HARNESS VERIFICATION SUITE"
echo "========================================================="

# 1. Validate Project Constitution
if [ ! -f "docs/constitution.md" ]; then
    echo "❌ FATAL: docs/constitution.md is missing."
    exit 1
fi
echo "✅ [HARNESS] Constitution found."

# 2. Run Spec Linting (SDD)
bash .harness/scripts/lint-specs.sh

# 3. Run Gherkin Linting (BDD)
bash .harness/scripts/lint-gherkin.sh

# 4. Check Traceability: Every Spec should have a BDD Feature
SPECS_DIR="specs/features"
BDD_DIR="specs/bdd"

if [ -d "$SPECS_DIR" ] && [ -d "$BDD_DIR" ]; then
    for spec in $(find "$SPECS_DIR" -maxdepth 1 -name "*.spec.md" 2>/dev/null || true); do
        base_name=$(basename "$spec" .spec.md)
        expected_bdd="$BDD_DIR/${base_name}.feature"
        if [ ! -f "$expected_bdd" ]; then
            echo "⚠️  WARNING: Spec $spec has no corresponding BDD feature at $expected_bdd"
        fi
    done
fi

echo "========================================================="
echo "🎉 [HARNESS] ALL INVARIANT & SPECIFICATION CHECKS PASSED"
echo "========================================================="
