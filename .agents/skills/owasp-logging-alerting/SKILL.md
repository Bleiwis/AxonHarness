---
name: owasp-logging-alerting
description: >-
  Expert guide for preventing OWASP A09:2025 Security Logging and Alerting Failures.
  Use when designing audit logging systems, masking sensitive PII/secrets in logs,
  formatting structured JSON logs, tracing request correlation IDs, or implementing security monitoring alerts.
---

# OWASP A09:2025 – Security Logging & Alerting Failures

## 1. Overview & Risk Profile

Insufficient logging, detection, monitoring, and alerting allow attackers to maintain persistence, pivot across internal systems, tamper with data, and extract records without timely detection. Conversely, excessive logging of sensitive data (passwords, tokens, credit cards) introduces critical data exposure risks.

- **OWASP Category:** A09:2025 – Security Logging & Alerting Failures
- **CWE References:** CWE-117 (Log Injection), CWE-223, CWE-532 (PII in Logs), CWE-778
- **Impact:** High (Undetected breaches, forensic blindspots, compliance violations)

---

## 2. Core Remediation Rules

1. **Log All Security Events:** Record authentication attempts (success/failure), authorization denials, password resets, role modifications, and rate limit triggers.
2. **Never Log Sensitive Data (PII/Secrets):** Strip passwords, session tokens, authorization headers, credit card PANs, and national IDs before writing logs.
3. **Structured JSON Logging:** Use structured JSON logging with standardized fields (`timestamp`, `level`, `eventType`, `userId`, `tenantId`, `ipAddress`, `traceId`).
4. **Prevent Log Injection (CWE-117):** Sanitize carriage return (`\r`) and newline (`\n`) characters from user input before writing to logs.
5. **Real-Time Alerting on Anomalies:** Configure automated alerts for anomalous spikes in 401/403 responses, sudden privilege escalations, or repeated rate limit triggers.

---

## 3. Code Examples (Anti-Pattern vs Secure Pattern)

### Example 1: Sanitized Logging Middleware

#### ❌ Vulnerable (Anti-Pattern - Logging Passwords & Unsanitized Input)
```typescript
// VULNERABLE: Dumps raw request body containing plaintext passwords and tokens to stdout
app.use((req, res, next) => {
  console.log(`[REQUEST] ${req.method} ${req.url} Body: ${JSON.stringify(req.body)}`); // PII & Secret leak!
  next();
});

// VULNERABLE: Log injection flaw (user can forge fake log lines via newlines)
app.post('/transfer', (req, res) => {
  const username = req.body.username; // input: "john\n[INFO] Transfer approved for 1,000,000 USD"
  console.log(`User ${username} requested money transfer`);
});
```

#### ✅ Secure (Remediated Pattern - Structured Logger with Masking)
```typescript
import pino from 'pino';

// SECURE: Redact sensitive keys automatically across all log payloads
export const securityLogger = pino({
  level: process.env.LOG_LEVEL || 'info',
  formatters: {
    level: (label) => ({ level: label }),
  },
  redact: {
    paths: [
      'password',
      'passwordConfirmation',
      'token',
      'accessToken',
      'refreshToken',
      'authorization',
      'creditCard',
      '*.password',
      'headers.authorization',
      'headers.cookie',
    ],
    censor: '[REDACTED_SECRET]',
  },
});

export interface SecurityAuditEvent {
  eventType: 'AUTH_SUCCESS' | 'AUTH_FAILURE' | 'AUTHZ_DENIED' | 'ROLE_CHANGED' | 'RATE_LIMITED';
  userId?: string;
  tenantId?: string;
  ipAddress: string;
  traceId: string;
  details?: Record<string, any>;
}

export function logSecurityEvent(event: SecurityAuditEvent) {
  securityLogger.warn({
    category: 'SECURITY_AUDIT',
    timestamp: new Date().toISOString(),
    ...event,
  });
}
```

---

### Example 2: Express Security Audit Middleware

```typescript
import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { securityLogger } from './logger';

export function requestAuditMiddleware(req: Request, res: Response, next: NextFunction) {
  const traceId = (req.headers['x-trace-id'] as string) || uuidv4();
  req.traceId = traceId;
  res.setHeader('X-Trace-Id', traceId);

  const start = Date.now();

  res.on('finish', () => {
    const durationMs = Date.now() - start;
    const isSecuritySensitive = res.statusCode === 401 || res.statusCode === 403 || res.statusCode === 429;

    const logPayload = {
      traceId,
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      durationMs,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      userId: (req as any).user?.id || 'anonymous',
    };

    if (isSecuritySensitive) {
      securityLogger.warn(logPayload, 'Security-relevant HTTP response recorded');
    } else {
      securityLogger.info(logPayload, 'HTTP request processed');
    }
  });

  next();
}
```

---

## 4. Verification & Testing Strategy (TDD)

```typescript
describe('Log Redaction Invariant', () => {
  it('should redact sensitive password and authorization fields in logs', () => {
    const loggedEntries: any[] = [];
    const testLogger = pino(
      {
        redact: ['password', 'headers.authorization'],
        censor: '[REDACTED]',
      },
      {
        write: (msg) => loggedEntries.push(JSON.parse(msg)),
      }
    );

    testLogger.info({
      user: 'alice',
      password: 'MySuperSecretPassword!',
      headers: { authorization: 'Bearer sensitive-token' },
    });

    expect(loggedEntries[0].password).toBe('[REDACTED]');
    expect(loggedEntries[0].headers.authorization).toBe('[REDACTED]');
  });
});
```

---

## 5. Security Checklist

- [ ] Automatic redaction configured for passwords, API tokens, and PII.
- [ ] Unique `traceId` injected into every request lifecycle.
- [ ] Structured JSON logging used consistently across all components.
- [ ] Security events logged with explicit category labels (`AUTH_FAILURE`, `AUTHZ_DENIED`).
- [ ] Alerting thresholds configured for brute-force attacks and rate limit breaches.
