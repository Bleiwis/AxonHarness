# Spec-Driven Development (SDD) Rules

## 1. Core Principles

1. **Spec First, Code Second:** Code is a downstream byproduct of a verified specification. Never start coding without an approved spec.
2. **Intent Preservation:** Specs preserve business intent and prevent translation loss between stakeholder needs, architectural design, and implementation.
3. **Living Documentation:** Specs are not throwaway documentation; they are maintained and version-controlled alongside code.

---

## 2. Specification Structure

Every specification in `specs/features/` must follow the template (`specs/templates/spec.template.md`):

1. **Metadata Header:** Status (`Draft`, `Under Review`, `Approved`, `Implemented`), Author, Dates, Links to BDD (`.feature`) and ADRs.
2. **Intent & Business Value:**
   - Problem Statement
   - User Stories & Personas (`As a... I want to... So that...`)
   - Explicit In-Scope vs. Out-of-Scope (Anti-Goals).
3. **Requirements & Business Rules:**
   - Numbered Functional Requirements (`FR-01`, `FR-02`).
   - Non-Functional Requirements (`NFR-01`, `NFR-02` covering Performance, Security, Reliability).
   - Boundary Conditions & Edge Cases.
4. **Data Models & Contracts:**
   - Domain Entities, Invariants, and JSON/Schema/Interface contracts.
5. **Acceptance Criteria Table:**
   - Direct mapping from requirements to Gherkin scenarios.
6. **Task Breakdown:**
   - Phased task list for implementation tracking.

---

## 3. The 7-Stage SDD Lifecycle

```
[1. Constitution] -> [2. Specify] -> [3. Clarify] -> [4. Plan] -> [5. Tasks] -> [6. Implement] -> [7. Validate]
```

- **Specify:** Capture requirements and user stories without implementation bias.
- **Clarify:** Actively search for ambiguity, missing edge cases, and cross-feature interactions before writing architecture.
- **Plan:** Translate requirements into architectural components, data flows, and interfaces.
- **Tasks:** Break the plan into discrete, testable units of work.
- **Validate:** Verify that the finished code and automated tests satisfy 100% of the acceptance criteria defined in the spec.
