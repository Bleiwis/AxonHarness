---
name: owasp-supply-chain
description: >-
  Expert guide for preventing OWASP A03:2025 Software Supply Chain Failures.
  Use when adding new package dependencies, managing lockfiles, configuring CI/CD pipelines,
  generating SBOMs, verifying binary hashes, or defending against typosquatting and malicious packages.
---

# OWASP A03:2025 – Software Supply Chain Failures

## 1. Overview & Risk Profile

**A03:2025 Software Supply Chain Failures** is a newly elevated category in OWASP Top 10:2025. It addresses risks from vulnerable third-party dependencies, malicious packages (typosquatting / dependency confusion), compromised CI/CD build scripts, unverified external actions, and lack of Software Bill of Materials (SBOM).

- **OWASP Category:** A03:2025 – Software Supply Chain Failures
- **CWE References:** CWE-1357, CWE-1395, CWE-829
- **Impact:** Critical (Remote code execution in build pipelines, backdoor insertion, supply chain poisoning)

---

## 2. Core Remediation Rules

1. **Strict Version Pinning & Lockfiles:** Always commit deterministic lockfiles (`package-lock.json`, `pnpm-lock.yaml`, `go.sum`, `Cargo.lock`, `poetry.lock`). Do not use broad wildcards (`*`, `^`, `>=`).
2. **Automated Vulnerability Scanning:** Integrate tools like `npm audit`, `pip-audit`, `trivy`, `govulncheck`, or `cargo audit` in the verification pipeline.
3. **Pin CI/CD Actions to Full Commit SHAs:** Never reference mutable tags (e.g., `actions/checkout@v4`). Pin to immutable commit SHAs.
4. **Prevent Dependency Confusion & Typosquatting:** Scope internal packages under organization namespaces (e.g., `@mycompany/core`) and configure explicit package registry configurations (`.npmrc` / `pip.conf`).
5. **Verify Checksums & Signatures:** Validate SHA256 hashes for all third-party binaries, container base images, and external scripts.

---

## 3. Code Examples (Anti-Pattern vs Secure Pattern)

### Example 1: GitHub Actions CI/CD Pipeline

#### ❌ Vulnerable (Anti-Pattern - Mutable Tags & Unaudited Curl)
```yaml
# VULNERABLE: Uses mutable tags that can be hijacked, executes unverified remote script
name: Build & Deploy
on: [push]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4 # Mutable tag
      - uses: actions/setup-node@v3 # Mutable tag
      - name: Install Tools
        # DANGEROUS: Running unverified script directly from the internet
        run: curl -sSL https://raw.githubusercontent.com/some-tool/installer.sh | bash
      - run: npm install # Generates unverified drift if lockfile is ignored
```

#### ✅ Secure (Remediated Pattern - Pinned SHAs & Checksummed Binaries)
```yaml
# SECURE: Pinned immutable SHAs, lockfile enforcement, and checksum verification
name: Build & Deploy
on: [push]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      # Pinned to specific immutable commit SHA
      - uses: actions/checkout@11bd71901bbe5b1630ceea73d27597364c9af683 # v4.2.2
      - uses: actions/setup-node@39370e3970a6d050c480ffad4ff0ed4d3fdee5af # v4.1.0
        with:
          node-version: '20'
          cache: 'npm'

      - name: Verify & Install Dependencies
        # Enforce exact lockfile matching; fail if lockfile is out of sync
        run: npm ci

      - name: Run Automated Dependency Audit
        run: npm audit --audit-level=high

      - name: Download & Verify Binary Tool
        run: |
          curl -sSL -o tool.tar.gz https://github.com/trusted/tool/releases/download/v1.0.0/tool.tar.gz
          echo "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855 tool.tar.gz" | sha256sum --check
          tar -xzf tool.tar.gz
```

---

### Example 2: Dependency Declarations (Node.js & Python)

#### ❌ Vulnerable (Anti-Pattern - Wildcards & Unpinned Deps)
```json
// package.json (VULNERABLE)
{
  "dependencies": {
    "express": "*",
    "lodash": "^4.0.0",
    "axios": "latest"
  }
}
```

#### ✅ Secure (Remediated Pattern - Exact Versioning & Scoped Repositories)
```json
// package.json (SECURE)
{
  "dependencies": {
    "express": "4.21.2",
    "lodash": "4.17.21",
    "axios": "1.7.9"
  },
  "scripts": {
    "audit:deps": "npm audit --omit=dev --audit-level=moderate"
  }
}
```

---

## 4. Verification & Audit Commands

Run the appropriate supply chain check for your runtime:

```bash
# Node.js
npm audit --audit-level=high

# Python
pip-audit -r requirements.txt

# Go
govulncheck ./...

# Rust
cargo audit
```

---

## 5. Security Checklist

- [ ] Lockfiles committed to Git and kept in sync (`npm ci` / `poetry install --no-root`).
- [ ] No `latest` or `*` version wildcards in dependency definitions.
- [ ] CI/CD steps pinned to immutable commit hashes.
- [ ] Automated vulnerability auditing active in `make verify` or CI pipeline.
- [ ] Internal packages use scoped namespaces to prevent dependency confusion.
