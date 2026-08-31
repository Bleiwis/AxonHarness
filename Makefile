.DEFAULT_GOAL := help

# Colors for terminal output
BLUE  := \033[34m
GREEN := \033[32m
RESET := \033[0m

.PHONY: help
help: ## Show available commands
	@echo "$(BLUE)Agnostic Engineering Harness Commands:$(RESET)"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  $(GREEN)%-18s$(RESET) %s\n", $$1, $$2}'

.PHONY: verify
verify: ## Run full harness verification (Specs, BDD, Invariants)
	@bash .harness/scripts/verify-harness.sh

.PHONY: lint-specs
lint-specs: ## Validate SDD specifications in specs/features/
	@bash .harness/scripts/lint-specs.sh

.PHONY: lint-bdd
lint-bdd: ## Validate BDD Gherkin files in specs/bdd/
	@bash .harness/scripts/lint-gherkin.sh

.PHONY: audit-security
audit-security: ## Run OWASP Top 10:2025 security audit checks
	@bash .harness/scripts/audit-security.sh

.PHONY: test
test: ## Run test suite (TDD)
	@echo "🧪 Running tests (configured per runtime/language)..."

.PHONY: install-hooks
install-hooks: ## Install pre-commit and pre-push Git hooks
	@mkdir -p .git/hooks
	@cp .harness/hooks/pre-commit .git/hooks/pre-commit
	@cp .harness/hooks/pre-push .git/hooks/pre-push
	@chmod +x .git/hooks/pre-commit .git/hooks/pre-push
	@echo "✅ Git hooks installed successfully."

.PHONY: init
init: ## Bootstrap and initialize a new project from this template
	@bash .harness/scripts/init-project.sh

.PHONY: clean
clean: ## Clean temporary artifacts
	@rm -rf .tmp
