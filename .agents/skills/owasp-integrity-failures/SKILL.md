---
name: owasp-integrity-failures
description: >-
  Expert guide for preventing OWASP A08:2025 Software and Data Integrity Failures.
  Use when handling object serialization/deserialization (pickle, Java serialized objects, YAML),
  verifying incoming webhook signatures (Stripe, GitHub, HMAC), code signing, or auto-update mechanisms.
---

# OWASP A08:2025 – Software & Data Integrity Failures

## 1. Overview & Risk Profile

Software and Data Integrity Failures relate to code and infrastructure that do not protect against integrity violations. This occurs when applications rely upon plugins, libraries, serialized objects, or data from untrusted sources without verifying their integrity and authenticity.

- **OWASP Category:** A08:2025 – Software and Data Integrity Failures
- **CWE References:** CWE-494, CWE-502 (Insecure Deserialization), CWE-565, CWE-829
- **Impact:** Critical (Remote Code Execution (RCE), arbitrary state tampering, replay attacks)

---

## 2. Core Remediation Rules

1. **Ban Insecure Deserialization Primitives:** Never deserialize untrusted data using unsafe formats: Python `pickle`, `marshal`, `shelve`; Java `ObjectInputStream`; PHP `unserialize()`; Ruby `Marshal.load`; or `yaml.load()` without `SafeLoader`.
2. **Use Strictly Typed Data Formats:** Use JSON, Protocol Buffers, or FlatBuffers validated against rigorous schemas (e.g., Zod, Pydantic, JSON Schema).
3. **Verify Webhook Signatures with HMAC:** Always verify HMAC-SHA256 signatures using constant-time comparisons (`crypto.timingSafeEqual`) on raw request bodies before processing external webhooks.
4. **Enforce Digital Signatures on Binaries & Updates:** Software updates and plugin files must be cryptographically signed by trusted private keys and verified before execution.

---

## 3. Code Examples (Anti-Pattern vs Secure Pattern)

### Example 1: Object Serialization / Deserialization (Python)

#### ❌ Vulnerable (Anti-Pattern - Insecure Pickle / YAML Load)
```python
import pickle
import yaml

# VULNERABLE: Attacker crafts a malicious pickle payload triggering arbitrary OS commands!
def load_user_session(serialized_data: bytes):
    return pickle.loads(serialized_data) # Remote Code Execution vulnerability!

# VULNERABLE: yaml.load without SafeLoader executes arbitrary Python tags
def parse_user_config(yaml_string: str):
    return yaml.load(yaml_string)
```

#### ✅ Secure (Remediated Pattern - Typed Pydantic & Safe YAML)
```python
import yaml
from pydantic import BaseModel, Field, ValidationError

class UserSessionSchema(BaseModel):
    user_id: str
    tenant_id: str
    roles: list[str] = Field(default_factory=list)

# SECURE: Strictly typed schema validation over standard JSON
def load_user_session(json_string: str) -> UserSessionSchema:
    return UserSessionSchema.model_validate_json(json_string)

# SECURE: SafeLoader disables execution of arbitrary class instantiations
def parse_user_config(yaml_string: str) -> dict:
    return yaml.safe_load(yaml_string)
```

---

### Example 2: External Webhook Signature Verification

#### ❌ Vulnerable (Anti-Pattern - Missing or Timing-Vulnerable Signature Check)
```typescript
// VULNERABLE: Accepts incoming webhook without signature verification
// or compares signatures using insecure standard equality (===) vulnerable to timing attacks
app.post('/webhooks/stripe', async (req, res) => {
  const event = req.body;
  // Attacker can forge fake payment_intent.succeeded events!
  if (event.type === 'payment_intent.succeeded') {
    await markOrderAsPaid(event.data.object.orderId);
  }
  res.json({ received: true });
});
```

#### ✅ Secure (Remediated Pattern - HMAC Verification with Timing-Safe Comparison)
```typescript
import crypto from 'crypto';
import { Request, Response } from 'express';

const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET!;

// SECURE: Validates raw body with HMAC-SHA256 using timing-safe comparison
export function verifyWebhookSignature(req: Request, res: Response, next: Function) {
  const signatureHeader = req.headers['stripe-signature'] as string;
  const rawBody = (req as any).rawBody; // Must use raw, unparsed buffer

  if (!signatureHeader || !rawBody) {
    return res.status(400).json({ error: 'Missing webhook signature or raw payload' });
  }

  const expectedSignature = crypto
    .createHmac('sha256', WEBHOOK_SECRET)
    .update(rawBody)
    .digest('hex');

  // Parse header timestamp & signature
  const signatureBuffer = Buffer.from(signatureHeader, 'hex');
  const expectedBuffer = Buffer.from(expectedSignature, 'hex');

  if (
    signatureBuffer.length !== expectedBuffer.length ||
    !crypto.timingSafeEqual(signatureBuffer, expectedBuffer)
  ) {
    return res.status(401).json({ error: 'Invalid webhook signature' });
  }

  next();
}
```

---

## 4. Verification & Testing Strategy (TDD)

```typescript
describe('Webhook Integrity Verification', () => {
  it('should reject tampered webhook payloads with 401 Unauthorized', async () => {
    const payload = JSON.stringify({ type: 'payment.success', amount: 5000 });
    const forgedSignature = 'abcdef1234567890';

    const res = await request(app)
      .post('/webhooks/payment')
      .set('stripe-signature', forgedSignature)
      .send(payload);

    expect(res.status).toBe(401);
  });
});
```

---

## 5. Security Checklist

- [ ] Zero usage of `pickle`, `eval()`, or unverified deserializers on untrusted data.
- [ ] Incoming webhooks enforce HMAC verification with constant-time equality checks.
- [ ] Schema validators (Zod / Pydantic / JSON Schema) sanitize all external payloads.
- [ ] Continuous deployment artifacts and container images verified against trusted signatures.
