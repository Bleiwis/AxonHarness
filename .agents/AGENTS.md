# Master AI Agent Guidelines & Engineering Harness Protocol

Welcome, Agent. You are operating in an **AI-Native Engineering Harness** repository designed for high reliability, zero translation loss, and zero "AI slop".

You must strictly adhere to the protocols and rules documented here and in `.agents/rules/`.

---

## 1. Operating Methodology: The 4 Pillars

```
┌─────────────────────────────────────────────────────────────┐
│                    Harness Engineering                      │
│   (Universal Runner, Taste Invariants, Feedback Loops)      │
├─────────────────┬─────────────────────┬─────────────────────┤
│    1. SDD       │       2. BDD        │       3. TDD        │
│  (Spec-First)   │  (Gherkin Behavior) │ (Red-Green-Refactor)│
└─────────────────┴─────────────────────┴─────────────────────┘
```

1. **SDD (Spec-Driven Development):** Always ground requirements in formal specs located in `specs/features/`. Never invent features on the fly.
2. **BDD (Behavior-Driven Development):** Translate spec acceptance criteria into declarative `.feature` files in `specs/bdd/` using Gherkin Expert syntax.
3. **TDD (Test-Driven Development):** Write failing tests first (**Red**), write the minimal code to pass (**Green**), then **Refactor** while keeping all tests passing.
4. **Harness Engineering:** Continuously run verification commands (`make verify` or `task verify`). Never submit changes that violate structural invariants, linters, or taste rules.

---

## 2. Step-by-Step Task Lifecycle

When requested to build, modify, or extend any feature:

### Phase 1: Clarify & Specify (SDD)
- Review `docs/constitution.md` to ensure no invariant is violated.
- If creating a new feature, create/update `specs/features/XXX-[feature].spec.md` using `specs/templates/spec.template.md`.
- Explicitly define: Problem Statement, User Stories, In Scope / Out of Scope, Functional & Non-Functional Requirements, and Data Contracts.
- Select and document the architecture archetype (Tier 1/2/3) using `.agents/rules/architecture-rules.md` and `docs/architecture/decision-matrix.md`.
- If architectural decisions are required, propose an ADR in `docs/adr/`.

### Phase 2: Behavior Specification (BDD)
- Create or update the companion Gherkin file in `specs/bdd/XXX-[feature].feature` using `specs/templates/bdd.template.feature`.
- Follow `.agents/rules/gherkin-rules.md`: use `Rule:`, `Scenario:`, `Scenario Outline:` and declarative business language (no UI clicks or technical verbs).

### Phase 3: Test-Driven Development (TDD)
- **Step 1 (Red):** Write failing unit/integration tests in `tests/` that verify domain rules and Gherkin step definitions. Run tests to confirm they fail for the right reason.
- **Step 2 (Green):** Implement the minimal domain and adapter code in `src/` to make the tests pass.
- **Step 3 (Refactor):** Clean up the code, optimize, eliminate duplication, and verify architecture boundaries.

### Phase 4: Harness Verification
- Run `make verify` (or `task verify`) to execute:
  - Spec completeness and link checks
  - Gherkin syntax linting
  - Full test suite execution (Unit + Integration)
  - Code formatting, linting, and type checking
  - Structural invariant checks

---

## 3. Critical Agent Guardrails (Taste Invariants)

1. **No Silent Changes:** Every code modification must map to an approved Spec or bug report.
2. **Domain Isolation:** The core domain in `src/` must remain pure and free from framework-specific dependencies.
3. **Explicit Error Handling:** Never swallow exceptions or discard errors without context.
4. **Deterministic Tests:** Tests must be idempotent, fast, and avoid random flakiness (no hardcoded sleeps).
5. **Preserve Documentation Integrity:** Keep specs and code comments synchronized with code changes.
6. **OWASP Top 10:2025 Security Compliance:** Enforce zero injection vectors, explicit access control, secret sanitization, and fail-closed handling.

---

## 4. Rule Index & Skills

### Rules
- [SDD Protocol](rules/sdd-rules.md)
- [Architecture Selection Rules](rules/architecture-rules.md)
- [Gherkin Expert Guide](rules/gherkin-rules.md)
- [TDD & Testing Standards](rules/tdd-rules.md)
- [Harness Invariants & Taste Rules](rules/harness-invariants.md)
- [Security Rules (OWASP Top 10:2025)](rules/security-rules.md)

### Security Skills
- `owasp-top-10`: Master router, security audit checklist & OWASP 2025 decision framework.
- `owasp-access-control`: A01 Broken Access Control & IDOR mitigation.
- `owasp-security-misconfig`: A02 Security Misconfiguration & secure hardening.
- `owasp-supply-chain`: A03 Software Supply Chain Failures & dependency integrity.
- `owasp-crypto-secrets`: A04 Cryptographic Failures & secret management.
- `owasp-injection-prevention`: A05 Injection Prevention (SQL, Command, NoSQL, XSS).
- `owasp-insecure-design`: A06 Insecure Design, Threat Modeling & Rate Limiting.
- `owasp-auth-sessions`: A07 Authentication & Session Management.
- `owasp-integrity-failures`: A08 Software and Data Integrity Failures.
- `owasp-logging-alerting`: A09 Security Logging & Alerting Failures.
- `owasp-exception-handling`: A10 Mishandling of Exceptional Conditions & Fail-Closed Logic.
