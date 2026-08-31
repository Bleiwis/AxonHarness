## 📌 Description of Changes
<!-- Provide a concise summary of the changes made and the business motivation -->

## 🔗 Traceability & Governance
- **Related SDD Spec:** `specs/features/XXX-[feature-name].spec.md`
- **Related BDD Feature:** `specs/bdd/XXX-[feature-name].feature`
- **Related ADR (if architectural decision was made):** `docs/adr/XXXX-[adr-title].md`

---

## 🛡️ Engineering Harness Verification Checklist

Please verify before requesting review:
- [ ] **SDD Alignment:** Changes strictly match the approved specification.
- [ ] **BDD Gherkin Scenarios:** Acceptance criteria are covered in declarative `.feature` files.
- [ ] **TDD Cycle (Red-Green-Refactor):**
  - [ ] Failing tests were created first.
  - [ ] Unit tests added/updated in `tests/unit/`.
  - [ ] Integration/E2E tests added/updated where applicable.
- [ ] **Taste Invariants:**
  - [ ] Core domain logic remains decoupled from external frameworks.
  - [ ] Explicit error handling (no swallowed exceptions).
  - [ ] Zero dead / speculative code.
- [ ] **Local Harness Verification:** `make verify` passes with 0 errors.
