# AxonHarness

> **Universal AI-Native Engineering Harness (SDD + BDD + TDD)**

This repository is configured with an **AI-Native Engineering Harness** that integrates:
- **SDD (Spec-Driven Development):** Structured specifications as the single source of truth (`specs/features/`).
- **BDD (Behavior-Driven Development):** Declarative Gherkin scenarios expressing domain acceptance criteria (`specs/bdd/`).
- **TDD (Test-Driven Development):** Red-Green-Refactor cycle with automated test suites (`tests/`).
- **Harness Engineering:** Continuous verification, structural linters, and taste invariants (`.harness/` & `.agents/`).

---

## 🚀 Quick Start & Installation (Plug & Play)

### A. Para Proyectos Existentes (NestJS, Go, Python, React, etc.)

Instala AxonHarness en cualquier repositorio existente sin modificar tu código fuente:

```bash
# Vía NPX (Recomendado)
npx axon-harness init

# O vía Shell script:
./install.sh /ruta/a/tu-proyecto
```

Por defecto, se instala en modo **Isolated** (`axon_harness/`):
- Copia `.agents/` en la raíz de tu proyecto (para que Antigravity / Cursor / Windsurf detecten el protocolo de inmediato).
- Aísla specs, docs y ADRs en la carpeta `axon_harness/` sin ensuciar tus carpetas `src/` o `test/`.

### B. Para Proyectos Nuevos (Greenfield)
1. Clic en GitHub en **"Use this template"**
2. O ejecuta en una carpeta vacía:
```bash
npx axon-harness init --root
```

### C. Comandos de Verificación
```bash
make verify
# o con Task:
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
