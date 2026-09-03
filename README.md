# AxonHarness

> **Universal AI-Native Engineering Harness (SDD + BDD + TDD)**

This repository is configured with an **AI-Native Engineering Harness** that integrates:
- **SDD (Spec-Driven Development):** Structured specifications as the single source of truth (`specs/features/`).
- **BDD (Behavior-Driven Development):** Declarative Gherkin scenarios expressing domain acceptance criteria (`specs/bdd/`).
- **TDD (Test-Driven Development):** Red-Green-Refactor cycle with automated test suites (`tests/`).
- **Harness Engineering:** Continuous verification, structural linters, and taste invariants (`.harness/` & `.agents/`).

---

## 🚀 Quick Start & Installation (Plug & Play)

### 1. Installation

You can install `axon-harness` either as a project dependency or run it on-demand via `npx`.

```bash
# Option A: Install as dependency in your project (Recommended)
npm install -D axon-harness
# or
pnpm add -D axon-harness
# or
yarn add -D axon-harness

# Option B: Global installation
npm install -g axon-harness
```

> [!IMPORTANT]
> **Why `npx axon init` (or `npx axon-harness init`) is required:**
> Simply adding `axon-harness` to `dependencies` or `devDependencies` only downloads the package files into `node_modules`. To activate the harness in your project, you **must run the initialization command**:
> ```bash
> npx axon init
> # or (if installed locally):
> npx axon-harness init
> ```
> This creates the harness directory structure (`.axon/`, `axon_harness/` or root specs/docs), sets up the state machine config, and configures agent operating rules.

---

### 2. Initialization Modes

#### A. In Existing Projects (Isolated Mode - Default)
Preserves your existing code and test directories clean by isolating harness specs and docs under `axon_harness/`:

```bash
# Run init with isolated structure (default)
npx axon init
# or explicitly:
npx axon init --isolated

# Or using the shell installer script:
./install.sh /path/to/your-project --isolated
```

- Creates `.axon/config.json` configuring paths (`axon_harness/specs/features`, `axon_harness/specs/bdd`).
- Copies `.agents/` to project root so Antigravity, Cursor, Claude Code, and Windsurf instantly lock into the protocol.
- Isolates specs and documentation without altering your existing `src/` or `test/` layouts.

#### B. In Greenfield / Dedicated Projects (Root Mode)
Sets up specs and documentation directly at the root of the project:

```bash
npx axon init --root

# Or using the shell installer script:
./install.sh /path/to/your-project --root
```

---

## 💻 CLI Commands Reference (`axon` / `axon-harness`)

Both binary aliases are available: `axon` and `axon-harness`. If installed as a project devDependency, run them with `npx axon <command>` or `npx axon-harness <command>`.

| Command | Description | Key Options / Flags |
| :--- | :--- | :--- |
| `axon init` | Initialize Axon Harness configuration and project state | `--isolated` (default), `--root` |
| `axon new <feature>` | Start a new feature guided by the Axon state machine | `--spec <path>`, `--bdd <path>`, `--test <path>`, `--target <path>` |
| `axon status` | Visual dashboard of current feature, active phase, and tracked files | _None_ |
| `axon context` | Generate token-compressed context prompt (Anti-UBB) for AI models | `-s, --step <phase>`, `-b, --budget` |
| `axon verify` | Run deterministic validation gates for the current active phase | _None_ |
| `axon next` | Advance to the next lifecycle phase (validates gates automatically) | `-f, --force`, `-r, --reason <text>` |

### Usage Examples & Development Lifecycle

```bash
# 1. Start a new feature (enters SDD phase and creates initial spec file)
npx axon new user-authentication

# 2. Check current status & pipeline position
npx axon status

# 3. Generate optimized AI prompt for your current phase (or pipe to clipboard)
npx axon context
npx axon context | pbcopy   # macOS clipboard

# 4. Verify that current phase gates pass (e.g. valid spec or failing test)
npx axon verify

# 5. Advance to next phase (sdd -> bdd -> tdd_red -> tdd_green -> refactor -> verified)
npx axon next

# 6. Override or force advance if necessary
npx axon next --force --reason "Manual spec approval"
```

---

## 🤖 MCP Server (Model Context Protocol)

Axon includes a built-in MCP server for direct IDE and AI agent integration (Antigravity, Claude Desktop, Cursor):

```json
{
  "mcpServers": {
    "axon": {
      "command": "node",
      "args": ["./node_modules/axon-harness/dist/mcp.js"]
    }
  }
}
```

Exposed MCP Tools:
- `axon_get_status`: Inspect current feature, phase, and tracked files.
- `axon_get_context`: Retrieve token-compressed context prompt for any phase.
- `axon_new_feature`: Start a feature lifecycle directly from the model.
- `axon_verify`: Execute automated phase gates.
- `axon_advance_phase`: Advance the state machine phase.

---

### 🛠️ Harness Verification Commands (Makefile / Task)
```bash
make verify
# or with Task:
task verify
```

---

## 📁 Repository Structure

```plaintext
├── .agents/                        # AI Agent context, guardrails, and operating rules
│   ├── AGENTS.md                   # Master agent protocol
│   └── rules/                      # SDD, Gherkin, TDD, and Invariant rules
│
├── .harness/                       # Harness validation scripts and checks
│   └── scripts/                    # Verification, linting, and audit scripts
│
├── docs/                           # Architecture and decision records
│   ├── constitution.md             # Invariant project constitution
│   └── adr/                        # Architecture Decision Records (ADRs)
│
├── specs/                          # Specs and BDD contracts
│   ├── features/                   # Active feature specifications (*.spec.md)
│   ├── bdd/                        # Active Gherkin features (*.feature)
│   └── templates/                  # Templates for new specs and features
│
├── src/                            # Production source code
├── tests/                          # Automated tests (unit, integration, e2e)
│   ├── unit/
│   ├── integration/
│   └── e2e/
│
├── Makefile                        # Universal command interface
└── Taskfile.yml                    # Task runner configuration
```

---

## 🔄 The 7-Stage Development Workflow

1. **Constitution Check (`docs/constitution.md`):** Ensure requirements respect project principles.
2. **Specify (`specs/features/`):** Author a feature spec using `specs/templates/spec.template.md`.
3. **Behavioral Contract (`specs/bdd/`):** Write Gherkin scenarios using `specs/templates/bdd.template.feature`.
4. **Architecture Record (`docs/adr/`):** Document technical decisions using `docs/adr/0000-template.md`.
5. **Red (TDD):** Author failing tests in `tests/`.
6. **Green (TDD):** Implement minimal production code in `src/`.
7. **Refactor & Gate:** Run `make verify` to ensure zero drift and clean architecture.
