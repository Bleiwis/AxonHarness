# Harness Invariants & Taste Rules (Anti-Slop Guardrails)

## 1. Purpose

In an AI-native engineering environment, the harness enforces "Taste Invariants" to prevent architectural drift, code degradation, and low-quality code generation ("AI slop").

---

## 2. Invariant Rules

### Invariant 1: Spec & BDD Synchronization
- Every `.spec.md` in `specs/features/` must have a corresponding `.feature` file in `specs/bdd/`.
- Changing code contracts requires updating the corresponding Spec and Feature files.

### Invariant 2: Pure Domain Isolation
- Domain models and core business entities must have zero external dependencies (no HTTP frameworks, no database drivers, no UI libraries).
- All external dependencies must be accessed via Ports & Adapters (Interfaces).

### Invariant 3: Explicit Error Handling
- Never ignore, swallow, or discard errors silently.
- Errors must be propagated with meaningful context or mapped to domain errors.

### Invariant 4: No Dead or Speculative Code (YAGNI)
- Do not generate placeholder functions, unused variables, or speculative features not documented in an active Spec.

### Invariant 5: Fast Verification Gate
- The verification suite (`make verify` or `task verify`) must be runnable locally in one command and pass completely before merging.
