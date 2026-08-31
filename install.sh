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

# 3. Create Multi-Agent Bridge Files
echo "🌉 [3/3] Configuring Cross-Agent Bridge Files (Cursor, Claude, Windsurf, Copilot)..."

SPECS_PATH="specs/features/"
BDD_PATH="specs/bdd/"
CONST_PATH="docs/constitution.md"
if [ "$MODE" != "--root" ]; then
    SPECS_PATH="axon_harness/specs/features/"
    BDD_PATH="axon_harness/specs/bdd/"
    CONST_PATH="axon_harness/constitution.md"
fi

HARNESS_HEADER="<!-- AxonHarness Integration -->
## 🛡️ Axon AI Engineering Harness Protocol
This repository adheres to the **Axon Engineering Harness**:
- **Master Protocol**: [.agents/AGENTS.md](.agents/AGENTS.md)
- **Constitution**: [${CONST_PATH}](${CONST_PATH})
- **Specifications (SDD)**: \`${SPECS_PATH}\`
- **Behavior Specs (BDD)**: \`${BDD_PATH}\`
- **Architecture & Invariants**: \`.agents/rules/\`
- **OWASP Security Skills**: \`.agents/skills/owasp-*\`

### Operating Rule for Agents:
1. **SDD**: Always check or define formal requirements in \`${SPECS_PATH}\` before building.
2. **BDD**: Write declarative \`.feature\` behavior specs in \`${BDD_PATH}\`.
3. **TDD**: Write failing tests first (**Red**), pass with minimal code (**Green**), then **Refactor**.
4. **OWASP Top 10:2025**: Consult \`.agents/skills/owasp-*\` for any security, auth, input, or session changes."

# Root AGENTS.md
if [ -f "$TARGET_DIR/AGENTS.md" ]; then
    if ! grep -q "Axon Engineering Harness" "$TARGET_DIR/AGENTS.md" 2>/dev/null; then
        echo -e "${HARNESS_HEADER}\n---\n\n$(cat "$TARGET_DIR/AGENTS.md")" > "$TARGET_DIR/AGENTS.md"
        echo "  ✓ Linked Axon into existing root AGENTS.md"
    fi
else
    echo -e "${HARNESS_HEADER}" > "$TARGET_DIR/AGENTS.md"
    echo "  ✓ Created root AGENTS.md bridge"
fi

# Cursor (.cursorrules & .cursor/rules/axon.mdc)
if [ ! -f "$TARGET_DIR/.cursorrules" ]; then
    echo -e "${HARNESS_HEADER}" > "$TARGET_DIR/.cursorrules"
    echo "  ✓ Created .cursorrules"
fi
mkdir -p "$TARGET_DIR/.cursor/rules"
if [ ! -f "$TARGET_DIR/.cursor/rules/axon.mdc" ]; then
    echo -e "---\ndescription: Axon AI Engineering Protocol, SDD, BDD, TDD and OWASP Rules\nglobs: *\n---\n\n${HARNESS_HEADER}" > "$TARGET_DIR/.cursor/rules/axon.mdc"
    echo "  ✓ Created .cursor/rules/axon.mdc"
fi

# Claude Code (CLAUDE.md)
if [ -f "$TARGET_DIR/CLAUDE.md" ]; then
    if ! grep -q "Axon Engineering Harness" "$TARGET_DIR/CLAUDE.md" 2>/dev/null; then
        echo -e "${HARNESS_HEADER}\n---\n\n$(cat "$TARGET_DIR/CLAUDE.md")" > "$TARGET_DIR/CLAUDE.md"
        echo "  ✓ Linked Axon into existing CLAUDE.md"
    fi
else
    echo -e "# CLAUDE Guidelines\n\n${HARNESS_HEADER}" > "$TARGET_DIR/CLAUDE.md"
    echo "  ✓ Created CLAUDE.md"
fi

# Windsurf (.windsurfrules)
if [ ! -f "$TARGET_DIR/.windsurfrules" ]; then
    echo -e "${HARNESS_HEADER}" > "$TARGET_DIR/.windsurfrules"
    echo "  ✓ Created .windsurfrules"
fi

# GitHub Copilot (.github/copilot-instructions.md)
mkdir -p "$TARGET_DIR/.github"
if [ ! -f "$TARGET_DIR/.github/copilot-instructions.md" ]; then
    echo -e "${HARNESS_HEADER}" > "$TARGET_DIR/.github/copilot-instructions.md"
    echo "  ✓ Created .github/copilot-instructions.md"
fi

echo ""
echo "✅ AxonHarness successfully configured!"
echo "🤖 All AI Agents (Antigravity, Cursor, Claude, Windsurf, Copilot) are now locked into Axon Protocols."
echo ""
