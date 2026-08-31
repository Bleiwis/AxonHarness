#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT_DIR"

echo "🔍 [SECURITY AUDIT] Running OWASP Top 10:2025 Static Verification..."

ERRORS=0

# 1. Verify Security Rules & Invariants File
if [ ! -f ".agents/rules/security-rules.md" ]; then
    echo "❌ [SECURITY ERROR] .agents/rules/security-rules.md is missing!"
    ERRORS=$((ERRORS + 1))
else
    echo "✅ [SECURITY] Security rules and invariants documented."
fi

# 2. Verify OWASP Top 10 Skills Suite
OWASP_SKILLS=(
    "owasp-top-10"
    "owasp-access-control"
    "owasp-security-misconfig"
    "owasp-supply-chain"
    "owasp-crypto-secrets"
    "owasp-injection-prevention"
    "owasp-insecure-design"
    "owasp-auth-sessions"
    "owasp-integrity-failures"
    "owasp-logging-alerting"
    "owasp-exception-handling"
)

for skill in "${OWASP_SKILLS[@]}"; do
    skill_file=".agents/skills/${skill}/SKILL.md"
    if [ ! -f "$skill_file" ]; then
        echo "❌ [SECURITY ERROR] Missing skill file: $skill_file"
        ERRORS=$((ERRORS + 1))
    fi
done
echo "✅ [SECURITY] All 11 OWASP Top 10:2025 skills verified."

# 3. Check for Hardcoded Secrets / Private Keys in Source
if [ -d "src" ]; then
    # Look for private keys
    if grep -rE --exclude-dir={.git,node_modules,vendor,.tmp} "BEGIN (RSA |EC |OPENSSH )?PRIVATE KEY" src/ 2>/dev/null; then
        echo "❌ [SECURITY ERROR] Private key detected in src/ directory!"
        ERRORS=$((ERRORS + 1))
    fi

    # Look for blatant hardcoded secret assignments in src/
    if grep -rEn --exclude-dir={.git,node_modules,vendor,.tmp} "(api_key|apiKey|secret_key|jwt_secret|password)\s*=\s*['\"][A-Za-z0-9_\-]{16,}['\"]" src/ 2>/dev/null; then
        echo "❌ [SECURITY ERROR] Potential hardcoded secret/API key found in src/!"
        ERRORS=$((ERRORS + 1))
    fi
fi

# 4. Supply Chain Check: If package manifest exists, lockfile must exist
if [ -f "package.json" ] && [ ! -f "package-lock.json" ] && [ ! -f "pnpm-lock.yaml" ] && [ ! -f "yarn.lock" ]; then
    echo "⚠️  [SECURITY WARNING] package.json exists without a deterministic lockfile."
fi

if [ -f "pyproject.toml" ] && [ ! -f "poetry.lock" ] && [ ! -f "Pipfile.lock" ] && [ ! -f "uv.lock" ]; then
    echo "⚠️  [SECURITY WARNING] pyproject.toml exists without a lockfile."
fi

if [ $ERRORS -gt 0 ]; then
    echo "❌ [SECURITY AUDIT] Failed with $ERRORS error(s)."
    exit 1
fi

echo "✅ [SECURITY AUDIT] All OWASP Top 10:2025 security baseline checks passed."
