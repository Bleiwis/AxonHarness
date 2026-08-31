# AxonHarness

> **Universal AI-Native Engineering Harness (SDD + BDD + TDD)**

This repository is configured with an **AI-Native Engineering Harness** that integrates:
- **SDD (Spec-Driven Development):** Structured specifications as the single source of truth (`specs/features/`).
- **BDD (Behavior-Driven Development):** Declarative Gherkin scenarios expressing domain acceptance criteria (`specs/bdd/`).
- **TDD (Test-Driven Development):** Red-Green-Refactor cycle with automated test suites (`tests/`).
- **Harness Engineering:** Continuous verification, structural linters, and taste invariants (`.harness/` & `.agents/`).

---

## 🚀 Quick Start & Installation (Plug & Play)

### A. For Existing Projects (NestJS, Go, Python, React, etc.)

Install AxonHarness into any existing repository without altering your source code:

```bash
# Via NPX (Recommended)
npx axon-harness init

# Or via Shell script:
./install.sh /path/to/your-project
```

By default, it installs in **Isolated** mode (`axon_harness/`):
- Copies `.agents/` to your project root (allowing Antigravity / Cursor / Windsurf to detect the protocol immediately).
- Isolates specs, docs, and ADRs in the `axon_harness/` folder without cluttering your `src/` or `test/` directories.

### B. For New Projects (Greenfield)
1. Click **"Use this template"** on GitHub.
2. Or run in an empty directory:
```bash
npx axon-harness init --root
```

### C. Verification Commands
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
