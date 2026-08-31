# Gherkin Expert & BDD Rules

## 1. Core Principles (Declarative over Imperative)

Gherkin is a communication tool between domain stakeholders, developers, and AI agents. It describes **what** the system does from a business perspective, not **how** the user interface or technical layers operate.

### Anti-Pattern (Imperative / Flaky UI Clicks):
```gherkin
# ❌ INCORRECT (Too technical / UI-coupled)
Given I go to "/login"
And I enter "alice@example.com" into the email field with id "#email"
And I enter "Secret123!" into "#password"
And I click the submit button
Then I should see the text "Welcome Alice" on the page
```

### Best Practice (Declarative / Domain Intent):
```gherkin
# ✅ CORRECT (Domain-focused / Intent-driven)
Given Alice is a registered user with valid credentials
When Alice logs into her account
Then Alice should be authenticated successfully
And her active session should be created
```

---

## 2. Gherkin Structure Standards

1. **Feature:** Must include a high-level user story (`As a... I want... So that...`) and a `@spec:SPEC-XXX` tag linking to the SDD spec.
2. **Rule Keyword:** Group scenarios under explicit business rules using `Rule: [Business Rule]`.
3. **Background:** Use `Background:` only for context essential to all scenarios in the feature. Keep it minimal.
4. **Scenario vs Scenario Outline:**
   - Use `Scenario:` for concrete singular behaviors and distinct edge cases.
   - Use `Scenario Outline:` with `Examples:` for testing combinations of inputs, boundaries, and validation tables.
5. **Tags:** Use standardized tags:
   - `@smoke` - Critical path / smoke tests
   - `@happy-path` - Nominal successful execution
   - `@validation` - Input boundary and validation rules
   - `@edge-case` - Complex edge cases, timeouts, resilience
   - `@security` - Access control, authentication, data privacy

---

## 3. Step Grammar & Vocabulary

- **Given (Precondition):** Sets up domain state (e.g., `Given a user with a positive account balance of 100 USD`).
- **When (Action):** The single domain event or trigger (e.g., `When the user requests a withdrawal of 50 USD`).
- **Then (Outcome):** Observable outcome and state assertion (e.g., `Then the transaction is approved with status COMPLETED`).
- **And / But (Conjunction):** Extends previous steps without changing meaning.
