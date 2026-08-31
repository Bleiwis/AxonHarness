# SPEC-[NUMBER]: [FEATURE TITLE]

> **Spec Status:** [Draft | Under Review | Approved | Implemented]  
> **Author:** [Author / Agent]  
> **Created:** YYYY-MM-DD  
> **Last Updated:** YYYY-MM-DD  
> **BDD Contract:** [specs/bdd/[NUMBER]-[feature-name].feature](../../specs/bdd/)  
> **ADR Reference:** [docs/adr/XXXX-[adr-name].md](../../docs/adr/)  

---

## 1. Intent & Business Value

### 1.1 Problem Statement
[Describe the real-world problem, user pain point, or system need this specification addresses.]

### 1.2 User Stories & Personas
- **As a** [role/user persona],
- **I want to** [action or capability],
- **So that** [business benefit or outcome].

### 1.3 Scope & Boundaries
- **In Scope:**
  - [Explicit item included]
  - [Explicit item included]
- **Out of Scope (Anti-Goals):**
  - [Explicit item excluded to prevent scope creep]

---

## 2. Requirements & Business Rules

### 2.1 Functional Requirements (FR)
- **FR-01:** [Requirement description]
- **FR-02:** [Requirement description]

### 2.2 Non-Functional Requirements (NFR)
- **NFR-01 (Performance):** [e.g., Latency < 100ms for p95]
- **NFR-02 (Security):** [e.g., Input sanitization, authentication]
- **NFR-03 (Reliability):** [e.g., Graceful degradation on timeout]

### 2.3 Edge Cases & Guardrails
- **Edge Case 1:** [Condition and expected behavior]
- **Edge Case 2:** [Condition and expected behavior]

---

## 3. Architecture & Data Contracts

### 3.1 Domain Entities & Invariants
```
Entity: [EntityName]
- Field: [fieldName]: [Type] (Constraint: [e.g., non-empty, > 0])
```

### 3.2 Interfaces / API Contracts (Agnostic / Schema)
```json
{
  "request": {},
  "response": {}
}
```

---

## 4. Acceptance Criteria & BDD Mapping

| ID | Business Rule / Scenario | Gherkin Reference in `.feature` |
| :--- | :--- | :--- |
| **AC-01** | [Scenario description] | `Scenario: [Scenario Name]` |
| **AC-02** | [Edge case description] | `Scenario: [Edge Case Name]` |

---

## 5. Implementation Tasks (Task Checklist)

- [ ] **Phase 1: Contracts & BDD Scenarios**
  - [ ] Write Gherkin scenarios in `specs/bdd/[NUMBER]-[feature-name].feature`
  - [ ] Define interfaces/types and domain contracts
- [ ] **Phase 2: TDD Test Suites (Red)**
  - [ ] Unit tests for core domain logic
  - [ ] Integration / Step definition tests
- [ ] **Phase 3: Implementation (Green)**
  - [ ] Core domain implementation
  - [ ] Adapters and infrastructure implementation
- [ ] **Phase 4: Harness Verification (Refactor & Polish)**
  - [ ] Run `make verify` / `task verify`
  - [ ] Code formatting, linting, and structural check
