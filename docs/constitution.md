# Project Constitution & Engineering Principles

> **Status:** Active & Immutable without Human Review  
> **Scope:** Repository-wide (All languages, tools, and agents)  
> **Source of Authority:** Specification-Driven Development (SDD) & Harness Engineering

---

## 1. Vision & Core Philosophy

This repository is governed by the principles of **AI-Native Software Engineering**, **Spec-Driven Development (SDD)**, **Behavior-Driven Development (BDD)**, and **Test-Driven Development (TDD)** within a deterministic **Harness Engineering** system.

In this paradigm:
1. **The Human is the Capability Architect & Decision Owner:** Humans define constraints, business requirements, risk boundaries, and approve architectural designs.
2. **The AI Agent is the Implementation Engine:** AI implements features, writes tests, detects drift, and maintains consistency strictly under the constraints of the harness.
3. **The Specification is the Single Source of Truth (SSOT):** No production code is written without a specification (`specs/features/`) and corresponding behavior scenarios (`specs/bdd/`).
4. **The Harness is the Execution & Quality Gatekeeper:** The harness provides instant feedback loops, checks invariants, and guarantees zero architectural drift or "AI slop".

---

## 2. Invariant Engineering Principles

### Principle 1: Spec Quality = Output Quality (SDD)
- All user stories, system capabilities, and API contracts must be formally written and clarified before code generation.
- Requirements follow the lifecycle: **Specify $\rightarrow$ Clarify $\rightarrow$ Plan $\rightarrow$ Tasks $\rightarrow$ Implement $\rightarrow$ Validate**.

### Principle 2: Declarative Behavior Contracts (BDD)
- Business behaviors and acceptance criteria must be expressed using **Gherkin (`.feature`)** syntax following domain-driven, declarative patterns (no technical UI/imperative noise).
- Every feature must map directly to its corresponding SDD spec and vice-versa.

### Principle 3: Deterministic Test-Driven Development (TDD)
- The implementation workflow must follow **Red $\rightarrow$ Green $\rightarrow$ Refactor**.
- No business logic may exist without automated verification tests (Unit, Integration, or E2E).
- Code coverage is a baseline hygiene metric, not an afterthought.

### Principle 4: Taste Invariants & Architecture Isolation
- Code must adhere to Clean Architecture / Hexagonal Architecture principles:
  - **Core Domain Logic** has zero dependencies on external frameworks, UI, or databases.
  - **Ports & Interfaces** separate domain contracts from technical adapters.
  - **Explicit Error Handling:** No silent failures, swallowed exceptions, or unchecked errors.

### Principle 5: Deterministic & Fast Feedback Loops (The Harness)
- Verification commands (`make verify` or `task verify`) must run deterministically and provide actionable diagnostic outputs in seconds.
- Linting, static analysis, structural architecture checks, and security audits must pass before any change is merged.

### Principle 6: Security-First & OWASP Top 10:2025 Compliance
- All generated code, database access, APIs, and infrastructure configurations must comply with the **OWASP Top 10:2025** security invariants.
- Proactively eliminate injection vectors, enforce fail-closed authorization, isolate multi-tenant data, protect secrets, and prevent supply chain vulnerabilities.

---

## 3. Human Decision Gates

The AI Agent must halt and request human approval when:
1. Creating or modifying the **Constitution** or Core Architectural Decision Records (ADRs).
2. Changing public API contracts or database schema definitions.
3. Introducing new third-party dependencies or external integrations.
4. Ambiguities arise during the **Clarify** step that affect business rules or security.
