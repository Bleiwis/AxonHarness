#!/usr/bin/env bash
set -e

# ==============================================================================
# AxonHarness Quick Installer (Bash / Shell)
# ==============================================================================

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TARGET_DIR="${1:-$(pwd)}"
MODE="${2:---isolated}"

echo ""
echo "🚀 Installing AxonHarness into: $TARGET_DIR"
echo "⚙️  Mode: $MODE"
echo ""

# 1. Install .agents directly to target root
echo "📦 [1/2] Installing .agents/ rules and skills..."
mkdir -p "$TARGET_DIR/.agents"
cp -R "$SCRIPT_DIR/.agents/"* "$TARGET_DIR/.agents/"

if [ "$MODE" == "--root" ]; then
    echo "📦 [2/2] Installing Root Specs & Docs..."
    mkdir -p "$TARGET_DIR/specs" "$TARGET_DIR/docs"
    cp -R "$SCRIPT_DIR/specs/"* "$TARGET_DIR/specs/" 2>/dev/null || true
    cp -R "$SCRIPT_DIR/docs/"* "$TARGET_DIR/docs/" 2>/dev/null || true
    if [ -d "$SCRIPT_DIR/.harness" ]; then
        cp -R "$SCRIPT_DIR/.harness" "$TARGET_DIR/"
    fi
else
    echo "📦 [2/2] Installing Isolated 'axon_harness/' namespace..."
    mkdir -p "$TARGET_DIR/axon_harness/specs" "$TARGET_DIR/axon_harness/docs"
    cp -R "$SCRIPT_DIR/specs/"* "$TARGET_DIR/axon_harness/specs/" 2>/dev/null || true
    cp -R "$SCRIPT_DIR/docs/"* "$TARGET_DIR/axon_harness/docs/" 2>/dev/null || true
    if [ -f "$SCRIPT_DIR/docs/constitution.md" ]; then
        cp "$SCRIPT_DIR/docs/constitution.md" "$TARGET_DIR/axon_harness/constitution.md"
    fi
    if [ -d "$SCRIPT_DIR/.harness" ]; then
        mkdir -p "$TARGET_DIR/axon_harness/verify"
        cp -R "$SCRIPT_DIR/.harness/"* "$TARGET_DIR/axon_harness/verify/" 2>/dev/null || true
    fi

    # Update AGENTS.md paths to point to axon_harness/
    if [ -f "$TARGET_DIR/.agents/AGENTS.md" ]; then
        sed -i '' 's|docs/constitution\.md|axon_harness/constitution.md|g' "$TARGET_DIR/.agents/AGENTS.md" 2>/dev/null || \
        sed -i 's|docs/constitution\.md|axon_harness/constitution.md|g' "$TARGET_DIR/.agents/AGENTS.md"

        sed -i '' 's|specs/features/|axon_harness/specs/features/|g' "$TARGET_DIR/.agents/AGENTS.md" 2>/dev/null || \
        sed -i 's|specs/features/|axon_harness/specs/features/|g' "$TARGET_DIR/.agents/AGENTS.md"

        sed -i '' 's|specs/bdd/|axon_harness/specs/bdd/|g' "$TARGET_DIR/.agents/AGENTS.md" 2>/dev/null || \
        sed -i 's|specs/bdd/|axon_harness/specs/bdd/|g' "$TARGET_DIR/.agents/AGENTS.md"

        sed -i '' 's|docs/architecture/|axon_harness/docs/architecture/|g' "$TARGET_DIR/.agents/AGENTS.md" 2>/dev/null || \
        sed -i 's|docs/architecture/|axon_harness/docs/architecture/|g' "$TARGET_DIR/.agents/AGENTS.md"

        sed -i '' 's|docs/adr/|axon_harness/docs/adr/|g' "$TARGET_DIR/.agents/AGENTS.md" 2>/dev/null || \
        sed -i 's|docs/adr/|axon_harness/docs/adr/|g' "$TARGET_DIR/.agents/AGENTS.md"
    fi
fi

echo ""
echo "✅ AxonHarness successfully configured!"
echo "🤖 Ready for AI Agent Spec-Driven & BDD workflows."
echo ""
