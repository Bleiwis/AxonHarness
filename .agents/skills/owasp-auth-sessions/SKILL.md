---
name: owasp-auth-sessions
description: >-
  Expert guide for preventing OWASP A07:2025 Authentication Failures and Broken Session Management.
  Use when building login/registration flows, JWT token handling, cookie configuration (HttpOnly, Secure, SameSite),
  multi-factor authentication (MFA/TOTP), session invalidation, or password reset mechanisms.
---

# OWASP A07:2025 – Authentication Failures & Session Management

## 1. Overview & Risk Profile

Authentication Failures occur when application functions related to user authentication, credential storage, or session state management are implemented incorrectly, allowing attackers to compromise passwords, keys, session tokens, or exploit other implementation flaws to assume other users' identities.

- **OWASP Category:** A07:2025 – Authentication Failures
- **CWE References:** CWE-287, CWE-384 (Session Fixation), CWE-613 (Insufficient Session Expiration), CWE-798
- **Impact:** Critical (Full account takeover, session hijacking, identity spoofing)

---

## 2. Core Remediation Rules

1. **Secure Cookie Transmission:** All session cookies must include `HttpOnly` (blocks XSS token theft), `Secure` (HTTPS-only), and `SameSite=Lax` or `SameSite=Strict` (mitigates CSRF).
2. **Defend Against Brute-Force & Credential Stuffing:** Implement exponential backoff, account lockout thresholds, or CAPTCHA on consecutive failed logins.
3. **Session Invalidation & Re-generation:** Re-generate session IDs upon successful authentication (prevents session fixation); invalidate tokens server-side upon logout.
4. **Token Security (JWT Best Practices):** Validate expiration (`exp`), issuer (`iss`), and audience (`aud`). Enforce strong asymmetric (RS256/EdDSA) or 256-bit symmetric secrets. Never trust `alg: none`.
5. **Multi-Factor Authentication (MFA):** Support RFC 6238 TOTP or WebAuthn / Passkeys for sensitive administrative accounts.

---

## 3. Code Examples (Anti-Pattern vs Secure Pattern)

### Example 1: Session Cookie Configuration

#### ❌ Vulnerable (Anti-Pattern - Insecure Cookies & LocalStorage Token)
```typescript
// VULNERABLE: Client stores JWT in localStorage (accessible to any XSS payload)
// or sets insecure cookies without HttpOnly/Secure flags
app.post('/login', async (req, res) => {
  const token = generateToken(user);
  
  // DANGEROUS: JavaScript can read this cookie, sent over unencrypted HTTP, vulnerable to CSRF
  res.setHeader('Set-Cookie', `session_token=${token}; Path=/;`);
  res.json({ token }); // Returns token to be placed in localStorage
});
```

#### ✅ Secure (Remediated Pattern - Hardened HttpOnly Cookies)
```typescript
import { Response } from 'express';

// SECURE: Enforce hardened cookie flags
export function setAuthCookie(res: Response, token: string) {
  res.cookie('axon_session', token, {
    httpOnly: true, // Prevents JavaScript document.cookie access (Anti-XSS)
    secure: process.env.NODE_ENV === 'production', // Enforces HTTPS transmission
    sameSite: 'lax', // Protects against Cross-Site Request Forgery
    maxAge: 8 * 60 * 60 * 1000, // 8 hours absolute session lifespan
    path: '/',
  });
}

export function clearAuthCookie(res: Response) {
  res.clearCookie('axon_session', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
  });
}
```

---

### Example 2: JWT Verification & Alg Whitelist

#### ❌ Vulnerable (Anti-Pattern - Unverified Header or Algorithm Confusion)
```python
import jwt

# VULNERABLE: Does not enforce expected algorithm; vulnerable to alg:none or public key HMAC attack!
def decode_jwt_token(token: str):
    return jwt.decode(token, options={"verify_signature": False}) # Disables signature check!
```

#### ✅ Secure (Remediated Pattern - Strict Algorithm & Claims Validation)
```python
import os
import jwt
from jwt.exceptions import PyJWTError

JWT_SECRET = os.environ["JWT_SECRET_KEY"]
JWT_ISSUER = "https://auth.axonplatform.com"
JWT_AUDIENCE = "axon-api"

# SECURE: Explicit algorithm whitelist, audience, issuer, and signature verification
def verify_access_token(token: str) -> dict:
    try:
        payload = jwt.decode(
            token,
            JWT_SECRET,
            algorithms=["HS256"], # Explicit algorithm whitelist
            audience=JWT_AUDIENCE,
            issuer=JWT_ISSUER,
            options={
                "verify_signature": True,
                "verify_exp": True,
                "verify_nbf": True,
                "verify_iat": True,
                "require": ["exp", "iss", "aud", "sub"],
            },
        )
        return payload
    except PyJWTError as e:
        raise AuthenticationError("Invalid or expired token.") from e
```

---

## 4. Verification & Testing Strategy (TDD)

```typescript
describe('Authentication Security', () => {
  it('should reject expired JWT tokens with 401 Unauthorized', async () => {
    const expiredToken = generateExpiredToken();

    const res = await request(app)
      .get('/api/protected/profile')
      .set('Cookie', `axon_session=${expiredToken}`);

    expect(res.status).toBe(401);
  });

  it('should set HttpOnly and SameSite cookie attributes on login', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'user@axon.com', password: 'ValidPassword123!' });

    const cookieHeader = res.headers['set-cookie'][0];
    expect(cookieHeader).toContain('HttpOnly');
    expect(cookieHeader).toContain('SameSite=Lax');
  });
});
```

---

## 5. Security Checklist

- [ ] Cookies configured with `HttpOnly`, `Secure`, and `SameSite`.
- [ ] Authentication failure returns generic message (preventing username enumeration).
- [ ] Session identifiers re-generated upon privilege level change.
- [ ] JWT tokens validate `exp`, `iss`, `aud`, and restrict allowed `algorithms`.
- [ ] Exponential backoff or lockout implemented on failed authentication attempts.
