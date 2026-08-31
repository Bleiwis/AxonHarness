---
name: owasp-exception-handling
description: >-
  Expert guide for preventing OWASP A10:2025 Mishandling of Exceptional Conditions.
  Use when designing error handling architectures, implementing fail-closed security logic,
  preventing resource leaks (memory, file handles, database connections), and building resilient recovery flows.
---

# OWASP A10:2025 – Mishandling of Exceptional Conditions

## 1. Overview & Risk Profile

**A10:2025 Mishandling of Exceptional Conditions** is a new category in OWASP Top 10:2025. It targets critical security failures caused by improper handling of runtime errors, unhandled exceptions, resource cleanup failures, and **fail-open** authorization bugs where an error condition mistakenly grants access or crashes the service (Denial of Service).

- **OWASP Category:** A10:2025 – Mishandling of Exceptional Conditions
- **CWE References:** CWE-703, CWE-754, CWE-755, CWE-400 (Resource Exhaustion), CWE-276
- **Impact:** High (Authorization bypass, Denial of Service (DoS), persistent memory/lock leaks)

---

## 2. Core Remediation Rules

1. **Fail-Closed Security Checks:** If an exception occurs while verifying credentials, permissions, or tokens, access must be **DENIED by default**. Never allow exceptions in authorization middleware to silently fall through to the next handler.
2. **Deterministic Resource Cleanup:** Always release resources (database transactions, mutex locks, file streams, sockets) using `finally` blocks, Go `defer`, Python `with` context managers, or Rust RAII.
3. **Prevent Unhandled Rejections & Server Crashes:** Attach global process error handlers (`unhandledRejection`, `uncaughtException`) to log diagnostics and trigger graceful restarts rather than leaving workers in corrupt states.
4. **Sanitize Exception Responses:** Do not return raw internal exception objects or stack traces to end users. Map domain exceptions to standardized HTTP problem details (RFC 7807).

---

## 3. Code Examples (Anti-Pattern vs Secure Pattern)

### Example 1: Fail-Open Authorization Middleware

#### ❌ Vulnerable (Anti-Pattern - Fail-Open Error Swallowing)
```typescript
// VULNERABLE: When authorization service is slow or errors out, request passes through!
export async function authorizeUser(req: Request, res: Response, next: NextFunction) {
  try {
    const isAllowed = await externalPolicyEngine.check(req.user.id, req.path);
    if (!isAllowed) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    next();
  } catch (error) {
    // CATASTROPHIC BUG: Swallowing error and calling next() grants unauthorized access!
    logger.error('Policy check failed, proceeding anyway:', error);
    next(); 
  }
}
```

#### ✅ Secure (Remediated Pattern - Fail-Closed with Deterministic Error Boundary)
```typescript
// SECURE: Fail-closed architecture guarantees denial upon error
export async function authorizeUser(req: Request, res: Response, next: NextFunction) {
  try {
    const isAllowed = await externalPolicyEngine.check(req.user.id, req.path);
    if (!isAllowed) {
      return res.status(403).json({ error: 'Access denied: insufficient permissions' });
    }
    return next();
  } catch (error) {
    // FAIL-CLOSED: Log internal failure and deny access immediately
    logger.error('Authorization engine exception encountered', {
      error: error instanceof Error ? error.message : String(error),
      userId: req.user?.id,
      path: req.path,
    });

    return res.status(500).json({
      error: 'Security authorization check could not be completed. Access denied.',
    });
  }
}
```

---

### Example 2: Resource Leak / Transaction Deadlock on Error

#### ❌ Vulnerable (Anti-Pattern - Missing Cleanup on Exception)
```python
# VULNERABLE: If processing raises an exception, the database connection is never closed,
# exhausting the connection pool and causing Denial of Service!
def process_batch_records(records: list):
    conn = db_pool.get_connection()
    cursor = conn.cursor()
    
    for record in records:
        if record["amount"] < 0:
            raise ValueError("Negative amounts prohibited") # Connection leaked!
        cursor.execute("INSERT INTO ledger (amount) VALUES (%s)", (record["amount"],))
        
    conn.commit()
    conn.close()
```

#### ✅ Secure (Remediated Pattern - Context Manager & Guaranteed Rollback)
```python
from contextlib import contextmanager

# SECURE: Guaranteed cleanup and rollback even during unexpected exceptions
@contextmanager
def get_db_session():
    conn = db_pool.get_connection()
    try:
        yield conn
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close() # Deterministic return to pool

def process_batch_records(records: list):
    with get_db_session() as conn:
        cursor = conn.cursor()
        for record in records:
            if record["amount"] < 0:
                raise ValueError("Negative amounts prohibited")
            cursor.execute("INSERT INTO ledger (amount) VALUES (%s)", (record["amount"],))
```

---

## 4. Verification & Testing Strategy (TDD)

```typescript
describe('Fail-Closed Authorization Invariant', () => {
  it('should deny access (500) if authorization service throws an unexpected exception', async () => {
    // Simulate policy engine outage
    jest.spyOn(externalPolicyEngine, 'check').mockRejectedValue(new Error('Network Timeout'));

    const res = await request(app)
      .get('/api/secure-data')
      .set('Authorization', 'Bearer valid-token');

    // Must NOT be 200 OK
    expect(res.status).toBe(500);
    expect(res.body.error).toContain('Access denied');
  });
});
```

---

## 5. Security Checklist

- [ ] All security filters and middlewares fail-closed on exception.
- [ ] Database transactions and file locks wrapped in `try...finally` / context managers.
- [ ] No unhandled Promise rejections in asynchronous code.
- [ ] Resource quotas (timeouts, body size limits, max connections) enforced to prevent DoS.
- [ ] Production error responses sanitized against internal stack trace disclosure.
