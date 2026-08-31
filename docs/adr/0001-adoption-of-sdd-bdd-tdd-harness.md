# ADR-0001: Adoption of SDD, BDD, TDD, and Harness Engineering Paradigm

- **Status:** Accepted
- **Date:** 2026-08-31
- **Author(s):** Capability Architect & AI Agent
- **Deciders:** Project Lead
- **Related Spec:** N/A (Foundational)

---

## Context and Problem Statement

Modern software development with AI agents requires strict architectural guardrails, explicit context, and rapid feedback loops. Unconstrained code generation often leads to "AI slop", translation loss from business intent to code, and maintenance bottlenecks. We need a foundational engineering framework that guarantees high reliability, auditability, and speed while remaining agnostic to the final implementation stack.

## Decision Drivers

- **Intent Preservation:** Prevent loss of business requirements across the development lifecycle.
- **Agent Reliability:** Provide deterministic feedback loops and constraints so AI agents operate autonomously without architectural drift.
- **Auditability & Traceability:** Maintain a direct link from Constitution $\rightarrow$ Specs $\rightarrow$ BDD Scenarios $\rightarrow$ Code $\rightarrow$ Tests.
- **Language Agnosticism:** Ensure the harness architecture works seamlessly regardless of the chosen technology stack.

## Decision Outcome

Adopt a unified 4-pillar engineering framework:
1. **Spec-Driven Development (SDD):** Structured specifications (`specs/features/`) as the single source of truth.
2. **Behavior-Driven Development (BDD):** Declarative Gherkin scenarios (`specs/bdd/`) capturing acceptance criteria and business rules.
3. **Test-Driven Development (TDD):** Red-Green-Refactor cycle enforced with unit, integration, and contract tests (`tests/`).
4. **Harness Engineering:** Universal CLI runner (`Taskfile.yml` / `Makefile`), structural linters, invariant checks, and `.agents/` context management.

### Positive Consequences

- Zero translation loss between intent and code.
- Autonomous agent execution with human decision checkpoints.
- Continuous verification and automated regression prevention.

### Negative Consequences / Trade-offs

- Requires upfront investment in writing specs and Gherkin scenarios before coding.
- Enforces strict compliance gates that fail builds if invariants are violated.
