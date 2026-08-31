---
name: owasp-security-misconfig
description: >-
  Expert guide for preventing and remediating OWASP A02:2025 Security Misconfiguration.
  Use when configuring web servers, security headers (CSP, HSTS, CORS), framework defaults,
  disabling verbose error debugging in production, or hardening container/cloud deployments.
---

# OWASP A02:2025 – Security Misconfiguration

## 1. Overview & Risk Profile

Security Misconfiguration arises when security controls are inaccurately defined, left at insecure defaults, unpatched, or overly permissive. In 2025, this encompasses misconfigured cloud permissions, missing HTTP security headers, verbose error messages exposing internal stack traces, and unneeded open ports/services.

- **OWASP Category:** A02:2025 – Security Misconfiguration
- **CWE References:** CWE-16, CWE-209, CWE-1004
- **Impact:** High (System compromise, sensitive architecture reconnaissance, clickjacking, data leakage)

---

## 2. Core Remediation Rules

1. **Disable Debug & Verbose Errors in Production:** Never expose stack traces, database schema dumps, or environment variables to end users.
2. **Enforce Hardened Security Headers:** Apply `Content-Security-Policy`, `Strict-Transport-Security`, `X-Content-Type-Options: nosniff`, and `X-Frame-Options: DENY`.
3. **Remove Default Credentials & Sample Endpoints:** Strip demo routes, default admin passwords, and unauthenticated Swagger/OpenAPI docs in restricted environments.
4. **Remove Technology Fingerprinting:** Suppress `X-Powered-By`, `Server`, and framework version headers.

---

## 3. Code Examples (Anti-Pattern vs Secure Pattern)

### Example 1: Web Server Headers & Fingerprinting

#### ❌ Vulnerable (Anti-Pattern - Default Express / Fastify Server)
```typescript
import express from 'express';
const app = express();

// VULNERABLE:
// 1. Exposes "X-Powered-By: Express"
// 2. Missing CSP, HSTS, X-Frame-Options (vulnerable to clickjacking & MIME sniffing)
// 3. Permissive error handler leaking stack traces
app.get('/data', (req, res) => {
  throw new Error('Database connection failed at postgres://admin:secret@10.0.0.4:5432');
});

app.use((err, req, res, next) => {
  res.status(500).json({ error: err.message, stack: err.stack }); // Leaks internal topology & credentials!
});
```

#### ✅ Secure (Remediated Pattern - Helmet & Hardened Handlers)
```typescript
import express from 'express';
import helmet from 'helmet';

const app = express();

// SECURE: Disable fingerprinting and configure strict security headers
app.disable('x-powered-by');

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'"],
        imgSrc: ["'self'", 'data:'],
        objectSrc: ["'none'"],
        upgradeInsecureRequests: [],
      },
    },
    hsts: {
      maxAge: 31536000, // 1 year
      includeSubDomains: true,
      preload: true,
    },
    frameguard: { action: 'deny' },
    noSniff: true,
  })
);

// Sanitized Production Error Handler
app.use((err, req, res, next) => {
  // Log full error internally to secure logger
  logger.error('Unhandled request exception', { error: err.message, traceId: req.traceId });

  // Return generic error message to client
  res.status(500).json({
    error: 'Internal Server Error',
    requestId: req.traceId,
  });
});
```

---

### Example 2: FastAPI / Python Production Hardening

#### ❌ Vulnerable (Anti-Pattern - Debug Enabled & Open Docs)
```python
# VULNERABLE: Debug enabled, docs exposed publicly without auth, CORS wildcard
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(debug=True) # Exposes interactive debuggers and stack traces!

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

#### ✅ Secure (Remediated Pattern - Environment-Aware Hardening)
```python
# SECURE: Strict environment checks, restricted documentation, and explicit CORS
import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.trustedhost import TrustedHostMiddleware

ENVIRONMENT = os.getenv("APP_ENV", "production")
IS_PROD = ENVIRONMENT == "production"

app = FastAPI(
    debug=False,
    docs_url=None if IS_PROD else "/docs",
    redoc_url=None if IS_PROD else "/redoc",
    openapi_url=None if IS_PROD else "/openapi.json",
)

app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=["api.axonplatform.com", "axonplatform.com"] if IS_PROD else ["*"]
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://app.axonplatform.com"] if IS_PROD else ["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["Authorization", "Content-Type"],
)
```

---

## 4. Verification & Testing Strategy

```typescript
describe('Security Headers Verification', () => {
  it('should include strict security headers and omit X-Powered-By', async () => {
    const res = await request(app).get('/health');
    
    expect(res.headers['x-powered-by']).toBeUndefined();
    expect(res.headers['x-frame-options']).toBe('DENY');
    expect(res.headers['x-content-type-options']).toBe('nosniff');
    expect(res.headers['strict-transport-security']).toBeDefined();
  });
});
```

---

## 5. Security Checklist

- [ ] `X-Powered-By` header disabled across all services.
- [ ] CSP, HSTS, X-Frame-Options, and X-Content-Type-Options headers active.
- [ ] Debug mode is strictly `false` in production environments.
- [ ] Unauthenticated API documentation (`/docs`, `/swagger`) disabled in public production.
- [ ] Error handler returns sanitized generic messages with correlation `traceId`.
