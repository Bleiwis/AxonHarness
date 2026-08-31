# language: en
@spec:SPEC-[NUMBER]
Feature: [Feature Name]
  As a [Role / Persona]
  I want [Capability]
  So that [Business Value]

  Background:
    Given the system is in a clean baseline state
    And default configurations are loaded

  # --------------------------------------------------------------------------
  # Business Rule 1: [Rule Description]
  # --------------------------------------------------------------------------
  Rule: [Business Rule 1 Description]

    @smoke @happy-path
    Scenario: [Successful main flow scenario]
      Given [a valid initial domain condition]
      When [the user or system performs a key domain action]
      Then [the expected domain outcome is achieved]
      And [the system state satisfies the business invariant]

    @validation
    Scenario Outline: [Validation rules and parameterized inputs]
      Given [a user with state "<user_state>"]
      When [they attempt to execute action with input "<input_value>"]
      Then [the system responds with status "<expected_status>"]
      And [the error message should contain "<error_message>"]

      Examples:
        | user_state | input_value | expected_status | error_message    |
        | active     | invalid_1   | REJECTED        | Invalid format   |
        | suspended  | valid_val   | FORBIDDEN       | Account disabled |

  # --------------------------------------------------------------------------
  # Business Rule 2: [Edge Cases and Security Safeguards]
  # --------------------------------------------------------------------------
  Rule: [Business Rule 2 Description]

    @edge-case @resilience
    Scenario: [Handling boundary conditions or external failure]
      Given [a boundary condition exists]
      When [the critical operation is triggered]
      Then [the operation should fail gracefully without corrupting state]
      And [an auditable diagnostic event should be emitted]
