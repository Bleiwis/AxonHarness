# Test-Driven Development (TDD) Rules

## 1. The Red-Green-Refactor Cycle

AI Agents must follow the strict three-phase TDD discipline:

```
    🔴 RED
Write a failing test for the next unit of behavior
    │
    ▼
    🟢 GREEN
Write the minimal production code to make the test pass
    │
    ▼
    🔵 REFACTOR
Improve design, eliminate duplication, enforce taste invariants
```

1. **Phase 1 (Red):**
   - Write a unit or integration test before implementing business logic.
   - Run the test suite to ensure the test fails specifically due to the missing implementation (not a compilation or syntax error).
2. **Phase 2 (Green):**
   - Write only the code required to satisfy the failing test. Do not over-engineer or add speculative functionality.
   - Run the test suite; confirm all tests pass.
3. **Phase 3 (Refactor):**
   - Clean up code structure, adhere to clean code principles, optimize, and maintain encapsulation.
   - Ensure tests remain green after refactoring.

---

## 2. Test Organization & Hierarchy

```
tests/
├── unit/           # Fast, isolated tests for pure domain entities and business rules (No I/O)
├── integration/    # Tests verifying adapters, repositories, serialization, external boundaries
└── e2e/            # End-to-end and BDD step definitions executing scenarios from specs/bdd/
```

---

## 3. Testing Principles (AAA & Invariants)

- **Arrange-Act-Assert (AAA):** Keep tests organized into clear Setup (Arrange), Action (Act), and Assertion (Assert) blocks.
- **Determinism:** Tests must never depend on execution order, network availability (unless explicitly integration/e2e), or hardcoded real-time sleeps.
- **Meaningful Assertions:** Assert on domain invariants and observable outcomes, not private implementation details.
