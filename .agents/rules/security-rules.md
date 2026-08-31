# Security Rules & Invariants (OWASP Top 10:2025 Compliant)

## 1. Purpose & Scope

This specification defines the mandatory security invariants and coding standards required for all code, infrastructure configurations, and architectural designs generated within this harness. Every change must adhere to the **OWASP Top 10:2025** framework.

---

## 2. Core Security Invariants

### Invariant 1: Explicit Access Control & Tenant Isolation (A01:2025)
- Every endpoint, data layer query, and domain operation must explicitly verify user identity and granular permissions (RBAC/ABAC).
- Direct Object References (IDOR) are strictly prohibited. Always scope record lookups by the authenticated tenant/user context (e.g., `WHERE id = ? AND tenant_id = ?`).
- Deny by default: any resource or route not explicitly declared public requires authentication and authorization.

### Invariant 2: Secure Defaults & Minimal Attack Surface (A02:2025)
- Default credentials, debug endpoints, and sample configs are banned in production artifacts.
- Security headers (`Content-Security-Policy`, `Strict-Transport-Security`, `X-Content-Type-Options`, `X-Frame-Options`) must be enabled on all HTTP responses.
- Stack traces, database schema details, and framework version headers (`X-Powered-By`) must never be leaked to clients.

### Invariant 3: Supply Chain & Dependency Integrity (A03:2025)
- All third-party dependencies must be pinned to explicit versions with lockfiles (`package-lock.json`, `pnpm-lock.yaml`, `Cargo.lock`, `go.sum`, `poetry.lock`).
- Verify hash integrity and signatures for external binaries, container base images, and CI/CD actions.
- Automatically scan dependencies for known CVEs before merging.

### Invariant 4: Strong Cryptography & Secret Protection (A04:2025)
- Never hardcode secrets, API keys, passwords, or private tokens in source code or specs. Use environment variables, secure secret managers, or vault adapters.
- Legacy or broken cryptographic primitives (`MD5`, `SHA-1`, `DES`, `RC4`, ECB mode) are banned for security operations.
- Use modern password hashing algorithms with salt and cost parameters (e.g., `Argon2id`, `bcrypt` with work factor >= 12).
- Enforce TLS 1.3 (or TLS 1.2 minimum) for all data in transit; encrypt sensitive PII and confidential data at rest (e.g., AES-GCM-256).

### Invariant 5: Total Injection Prevention (A05:2025)
- Raw string interpolation, template literals, or concatenation into SQL, NoSQL, OS shell commands, LDAP, or XPath queries is strictly forbidden.
- Always use parameterized queries, prepared statements, typed ORM builders, or safe execution wrappers (e.g., `execFile` with argument arrays instead of shell execution).
- Sanitize and context-encode untrusted input before rendering to HTML/DOM or executing downstream.

### Invariant 6: Secure by Design & Threat Modeling (A06:2025)
- Apply threat modeling (STRIDE / Defense-in-Depth) to any feature processing financial, authentication, or PII workflows.
- Implement rate limiting, IP throttling, and anti-abuse safeguards on sensitive entry points (login, password reset, payment, API keys).

### Invariant 7: Robust Authentication & Session Handling (A07:2025)
- Session cookies must include `HttpOnly`, `Secure`, and `SameSite=Lax` (or `Strict`) attributes.
- Token validation must enforce expiration (`exp`), issuer (`iss`), and audience (`aud`) checks with constant-time signature verification.
- Protect against brute-force attacks via exponential backoff or account lockouts.

### Invariant 8: Software & Data Integrity (A08:2025)
- Insecure deserialization (e.g., untrusted Python `pickle`, Java `ObjectInputStream`, raw YAML load) is banned. Use strictly typed JSON/Protobuf schemas with input validation.
- Verify digital signatures and checksums for all incoming webhooks, external updates, and data interchange.

### Invariant 9: Sanitized Audit Logging & Proactive Alerting (A09:2025)
- Log all security-critical events (authentication successes/failures, authorization denials, privilege changes, rate limit triggers) with timestamp, user ID, IP address, and outcome.
- Never log sensitive data (passwords, tokens, credit cards, PII) in plain text.

### Invariant 10: Deterministic & Fail-Closed Exception Handling (A10:2025)
- Security checks must **fail-closed**: if an error occurs during authentication or authorization evaluation, access must be denied.
- Clean up resources (database locks, open file handles, memory allocations) deterministically in `finally` / `defer` blocks to prevent Denial of Service (DoS) and resource exhaustion.
