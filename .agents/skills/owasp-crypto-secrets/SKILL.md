---
name: owasp-crypto-secrets
description: >-
  Expert guide for preventing OWASP A04:2025 Cryptographic Failures and Secret Leaks.
  Use when implementing password hashing (Argon2id, bcrypt), symmetric/asymmetric encryption (AES-256-GCM, RSA/Ed25519),
  secure token generation, secrets management (env vars, vault), or eliminating hardcoded credentials.
---

# OWASP A04:2025 – Cryptographic Failures & Secret Management

## 1. Overview & Risk Profile

Cryptographic Failures occur when sensitive data is exposed due to broken, outdated, or poorly implemented cryptographic primitives, hardcoded keys, insecure random number generation, or unencrypted data transmission.

- **OWASP Category:** A04:2025 – Cryptographic Failures
- **CWE References:** CWE-259, CWE-327, CWE-328, CWE-330, CWE-798
- **Impact:** Critical (Mass credential exposure, session hijacking, data breach, non-compliance)

---

## 2. Core Remediation Rules

1. **Zero Hardcoded Secrets:** Never commit API keys, database passwords, or JWT secrets to code or configuration files. Load strictly from environment variables or dedicated secret stores.
2. **Modern Password Hashing:** Use **Argon2id** (preferred) or **bcrypt** (cost $\ge 12$). Never use `MD5`, `SHA-1`, `SHA-256` (without salt & iterations), or simple HMACs for passwords.
3. **Authenticated Symmetric Encryption:** When encrypting data at rest, use authenticated encryption: **AES-256-GCM** or **ChaCha20-Poly1305** with unique initialization vectors (IV/nonce) per operation. Avoid AES-ECB or AES-CBC without HMAC.
4. **Cryptographically Secure Randomness:** Always use CSPRNG (`crypto.randomBytes`, `secrets.token_hex`, `crypto/rand`). Never use pseudo-random generators (`Math.random()`, `random.random()`) for security-sensitive tokens.
5. **TLS 1.3 Enforcement:** All network communications transmitting PII or credentials must enforce TLS 1.3 (or TLS 1.2 minimum).

---

## 3. Code Examples (Anti-Pattern vs Secure Pattern)

### Example 1: Password Hashing

#### ❌ Vulnerable (Anti-Pattern - Fast/Unsalted Hash or Hardcoded Secret)
```python
import hashlib

# VULNERABLE: SHA256 is fast and vulnerable to GPU rainbow tables / brute-force attacks!
def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()

# VULNERABLE: Hardcoded secret key in source code
JWT_SECRET_KEY = "super-secret-key-12345"
```

#### ✅ Secure (Remediated Pattern - Argon2id & Environment Configuration)
```python
import os
from argon2 import PasswordHasher
from argon2.exceptions import VerifyMismatchError

# SECURE: Modern memory-hard password hashing algorithm
ph = PasswordHasher(
    time_cost=3,        # Iterations
    memory_cost=65536,  # 64 MB memory
    parallelism=4,      # Parallel threads
    hash_len=32,
    salt_len=16
)

def hash_password(password: str) -> str:
    return ph.hash(password)

def verify_password(hashed_password: str, plain_password: str) -> bool:
    try:
        return ph.verify(hashed_password, plain_password)
    except VerifyMismatchError:
        return False

# SECURE: Mandatory environment variable extraction with fail-fast check
JWT_SECRET_KEY = os.environ.get("JWT_SECRET_KEY")
if not JWT_SECRET_KEY or len(JWT_SECRET_KEY) < 32:
    raise RuntimeError("CRITICAL: JWT_SECRET_KEY environment variable is missing or insecurely short (< 32 chars).")
```

---

### Example 2: Secure Token Generation & Symmetric Encryption

#### ❌ Vulnerable (Anti-Pattern - Math.random & AES-ECB)
```typescript
// VULNERABLE: Math.random() is predictable; ECB mode leaks plaintext patterns
import crypto from 'crypto';

function generatePasswordResetToken(): string {
  return Math.random().toString(36).substring(2); // Predictable PRNG
}

function encryptData(text: string, key: Buffer): Buffer {
  const cipher = crypto.createCipheriv('aes-256-ecb', key, null); // Insecure ECB mode
  return Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);
}
```

#### ✅ Secure (Remediated Pattern - CSPRNG & AES-256-GCM)
```typescript
import crypto from 'crypto';

// SECURE: CSPRNG generation for high-entropy reset tokens
export function generatePasswordResetToken(): string {
  return crypto.randomBytes(32).toString('hex'); // 256 bits of cryptographically secure entropy
}

// SECURE: Authenticated Encryption with AES-256-GCM and unique Nonce
export interface EncryptedPayload {
  iv: string;
  ciphertext: string;
  authTag: string;
}

export function encryptSensitiveData(text: string, key: Buffer): EncryptedPayload {
  const iv = crypto.randomBytes(12); // 96-bit IV for GCM
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);

  const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();

  return {
    iv: iv.toString('hex'),
    ciphertext: encrypted.toString('hex'),
    authTag: authTag.toString('hex'),
  };
}

export function decryptSensitiveData(payload: EncryptedPayload, key: Buffer): string {
  const iv = Buffer.from(payload.iv, 'hex');
  const authTag = Buffer.from(payload.authTag, 'hex');
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
  
  decipher.setAuthTag(authTag);
  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(payload.ciphertext, 'hex')),
    decipher.final(),
  ]);

  return decrypted.toString('utf8');
}
```

---

## 4. Verification & Testing Strategy (TDD)

```typescript
describe('Cryptographic Invariants', () => {
  it('should encrypt and decrypt payload with authentication tag validation', () => {
    const key = crypto.randomBytes(32);
    const secretMessage = 'Confidential Patient Health Record';

    const encrypted = encryptSensitiveData(secretMessage, key);
    const decrypted = decryptSensitiveData(encrypted, key);

    expect(decrypted).toBe(secretMessage);
    expect(encrypted.ciphertext).not.toContain(secretMessage);
  });

  it('should fail decryption if ciphertext or authTag is tampered', () => {
    const key = crypto.randomBytes(32);
    const encrypted = encryptSensitiveData('Test Message', key);

    encrypted.authTag = crypto.randomBytes(16).toString('hex'); // Tamper tag

    expect(() => decryptSensitiveData(encrypted, key)).toThrow();
  });
});
```

---

## 5. Security Checklist

- [ ] Zero plaintext secrets or API keys in source files or VCS.
- [ ] Passwords hashed with Argon2id or bcrypt (cost $\ge 12$).
- [ ] Symmetric encryption uses authenticated algorithms (AES-256-GCM).
- [ ] Tokens and keys generated via CSPRNG (`crypto.randomBytes`).
- [ ] Constant-time comparisons (`crypto.timingSafeEqual`) used for HMAC/signature verification.
