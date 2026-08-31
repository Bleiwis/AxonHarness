---
name: owasp-top-10
description: >-
  Master security guide and architectural auditor covering the OWASP Top 10:2025 standard.
  Use when conducting security audits, designing system architectures, performing code reviews,
  or routing to specific vulnerability remediation skills.
---

# OWASP Top 10:2025 Master Security Framework & Auditor

## 1. Overview & 2025 Risk Taxonomy

The **OWASP Top 10:2025** represents the foundational standard for securing modern software systems, APIs, microservices, and cloud-native applications.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          OWASP Top 10:2025 Taxonomy                         │
├───────┬──────────────────────────────────────────┬──────────────────────────┤
│ ID    │ Risk Category                            │ Primary Focus Area       │
├───────┼──────────────────────────────────────────┼──────────────────────────┤
│ A01   │ Broken Access Control                    │ IDOR, RBAC/ABAC, CORS    │
│ A02   │ Security Misconfiguration                │ Hardening, Headers, Logs │
│ A03   │ Software Supply Chain Failures           │ Deps, SBOM, Lockfiles    │
│ A04   │ Cryptographic Failures                   │ Ciphers, Secrets, Keys   │
│ A05   │ Injection                                │ SQLi, OS Exec, XSS, SSRF │
│ A06   │ Insecure Design                          │ Threat Model, Rate Limit │
│ A07   │ Authentication Failures                  │ Sessions, MFA, Brute-F.  │
│ A08   │ Software & Data Integrity Failures       │ Deserialization, CI/CD   │
│ A09   │ Security Logging & Alerting Failures     │ Audit Trails, Monitoring │
│ A10   │ Mishandling of Exceptional Conditions    │ Fail-Closed, Resource DoS│
└───────┴──────────────────────────────────────────┴──────────────────────────┘
```

---

## 2. Specialized Skills Routing Table

When dealing with a specific security domain, activate the corresponding skill:

| Category | Vulnerability Type | Specialized Agent Skill |
| :--- | :--- | :--- |
| **A01:2025** | Broken Access Control, IDOR, Privilege Escalation | `owasp-access-control` |
| **A02:2025** | Security Misconfiguration, Missing Headers, Info Leaks | `owasp-security-misconfig` |
| **A03:2025** | Supply Chain Failures, Unpinned Deps, Malicious Packages | `owasp-supply-chain` |
| **A04:2025** | Cryptographic Failures, Hardcoded Secrets, Weak Hashes | `owasp-crypto-secrets` |
| **A05:2025** | Injection (SQL, Command, NoSQL, Template, XSS) | `owasp-injection-prevention` |
| **A06:2025** | Insecure Design, Missing Rate Limiting, Business Logic Flaws | `owasp-insecure-design` |
| **A07:2025** | Authentication Failures, Broken Sessions, Weak Password Policies | `owasp-auth-sessions` |
| **A08:2025** | Data Integrity Failures, Insecure Deserialization, Webhook Forgery | `owasp-integrity-failures` |
| **A09:2025** | Logging Failures, PII Leaks, Lack of Alerting | `owasp-logging-alerting` |
| **A10:2025** | Mishandling Exceptions, Fail-Open Logic, Memory Exhaustion | `owasp-exception-handling` |

---

## 3. Systematic Security Audit Workflow

Follow this procedure during every code review, architectural review, or SDD specification phase:

```
┌─────────────────┐     ┌──────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│ 1. Threat Model │ ──> │ 2. Invariant Chk │ ──> │ 3. Automated Test│ ──> │ 4. Verification │
│ (STRIDE/A06)    │     │ (A01-A05,A07-A10)│     │ (TDD Security)   │     │ (make verify)   │
└─────────────────┘     └──────────────────┘     └──────────────────┘     └─────────────────┘
```

1. **Verify Authentication & Authorization:** Is every route protected by default? Are tenant IDs enforced in all database queries (`WHERE id = ? AND tenant_id = ?`)?
2. **Eliminate Injection Points:** Are all SQL queries parameterized? Are external OS commands avoided or executed via argument vectors?
3. **Audit Secrets & Crypto:** Are API keys loaded exclusively via environment variables or secret managers? Are passwords hashed using Argon2id/bcrypt?
4. **Inspect Error & Exception Handling:** Does the code fail-closed upon unexpected errors? Are user-facing error messages generic?
5. **Check Supply Chain & Dependencies:** Are lockfiles committed? Are dependencies pinned and scanned?

---

## 4. Pre-Commit Security Checklist

- [ ] Zero hardcoded secrets, tokens, or private certificates.
- [ ] All database queries parameterized or managed via type-safe ORM/Query Builders.
- [ ] Authorization checks applied at the domain/controller layer before resource access.
- [ ] Passwords and sensitive data masked in logging outputs.
- [ ] Exceptions handled deterministically with generic client error messages and secure logging.
- [ ] Dependencies locked and audited for known vulnerabilities.
