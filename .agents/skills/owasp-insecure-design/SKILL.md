---
name: owasp-insecure-design
description: >-
  Expert guide for preventing OWASP A06:2025 Insecure Design vulnerabilities.
  Use when conducting threat modeling (STRIDE), designing business workflows, implementing rate limiting,
  preventing race conditions, anti-automation, or establishing defense-in-depth architectural boundaries.
---

# OWASP A06:2025 – Insecure Design & Threat Modeling

## 1. Overview & Risk Profile

Insecure Design represents flaws in architectural planning, threat modeling, and business logic before code is even written. Unlike implementation bugs, design flaws cannot be fixed by perfect coding. Examples include lack of rate limiting on financial endpoints, coupon re-use race conditions, unlimited file upload quotas, and missing account recovery protections.

- **OWASP Category:** A06:2025 – Insecure Design
- **CWE References:** CWE-20, CWE-362 (Race Condition), CWE-799, CWE-840
- **Impact:** High (Financial drain, account takeover, denial of service, logic abuse)

---

## 2. Core Remediation Rules

1. **Threat Modeling at SDD Phase:** Apply STRIDE (Spoofing, Tampering, Repudiation, Information Disclosure, Denial of Service, Elevation of Privilege) during initial spec authoring.
2. **Deterministic Rate Limiting:** Enforce token-bucket or sliding-window rate limits on all sensitive business actions (login, reset password, checkout, voucher redeem).
3. **Atomic State Transitions (Anti-Race Condition):** Ensure financial balances, voucher uses, and inventory decrements use database transactions with row-level locks (`SELECT FOR UPDATE` or atomic decrement `UPDATE ... WHERE balance >= amount`).
4. **Defense-in-Depth:** Layer controls across multiple boundaries (network gateway $\rightarrow$ reverse proxy $\rightarrow$ app controller $\rightarrow$ domain invariants).

---

## 3. Code Examples (Anti-Pattern vs Secure Pattern)

### Example 1: Voucher Redemption Race Condition (Check-Then-Act Flaw)

#### ❌ Vulnerable (Anti-Pattern - Non-Atomic Business Logic)
```typescript
// VULNERABLE: Race condition allows concurrent requests to redeem the same single-use coupon multiple times!
export async function redeemCoupon(userId: string, couponCode: string) {
  const coupon = await db.coupons.findOne({ where: { code: couponCode } });
  
  if (!coupon || coupon.isUsed) {
    throw new Error('Coupon invalid or already used.');
  }

  // Concurrent request reaches here before isUsed is set to true!
  await applyDiscountToCart(userId, coupon.discountAmount);

  coupon.isUsed = true;
  await db.coupons.save(coupon);
}
```

#### ✅ Secure (Remediated Pattern - Atomic Transaction with Row Locking)
```typescript
// SECURE: Atomic transaction with conditional update / pessimistic row locking
export async function redeemCoupon(userId: string, couponCode: string) {
  return await db.transaction(async (trx) => {
    // Lock coupon row for the duration of the transaction
    const coupon = await trx('coupons')
      .where({ code: couponCode })
      .forUpdate()
      .first();

    if (!coupon || coupon.is_used) {
      throw new DomainError('Coupon invalid or already used.');
    }

    // Mark as used within the atomic boundary
    await trx('coupons')
      .where({ id: coupon.id })
      .update({
        is_used: true,
        redeemed_by_user_id: userId,
        redeemed_at: new Date(),
      });

    await applyDiscountToCart(trx, userId, coupon.discount_amount);
    return { success: true, discount: coupon.discount_amount };
  });
}
```

---

### Example 2: Sensitive Endpoint Rate Limiting & Anti-Automation

#### ❌ Vulnerable (Anti-Pattern - Unrestricted API Endpoint)
```typescript
// VULNERABLE: Unlimited SMS sending allows toll fraud and SMS bombing
app.post('/api/send-otp', async (req, res) => {
  const { phoneNumber } = req.body;
  await smsProvider.sendOTP(phoneNumber);
  res.json({ message: 'OTP sent' });
});
```

#### ✅ Secure (Remediated Pattern - Sliding Window Rate Limiting)
```typescript
import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import { redisClient } from './redis';

// SECURE: Strict IP and Phone Number rate limits with sliding window
const otpRateLimiter = rateLimit({
  store: new RedisStore({
    sendCommand: (...args: string[]) => redisClient.call(...args),
  }),
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 3, // Max 3 OTP requests per 15 minutes per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many OTP requests. Please wait 15 minutes before trying again.' },
});

app.post('/api/send-otp', otpRateLimiter, async (req, res) => {
  const { phoneNumber } = req.body;
  
  // Also enforce phone-number level rate limit in Redis
  const phoneKey = `ratelimit:otp:${phoneNumber}`;
  const count = await redisClient.incr(phoneKey);
  if (count === 1) await redisClient.expire(phoneKey, 300); // 5 min TTL
  if (count > 2) {
    return res.status(429).json({ error: 'Too many OTP requests for this phone number.' });
  }

  await smsProvider.sendOTP(phoneNumber);
  return res.json({ message: 'OTP sent successfully' });
});
```

---

## 4. Verification & Testing Strategy (TDD)

```typescript
describe('Business Logic Concurrency Protection', () => {
  it('should only permit one successful coupon redemption when 10 concurrent requests arrive', async () => {
    const couponCode = 'ONE-TIME-100';
    await createTestCoupon({ code: couponCode, isUsed: false });

    // Trigger 10 parallel requests
    const promises = Array.from({ length: 10 }).map(() =>
      redeemCoupon('user-1', couponCode).catch((err) => err)
    );

    const results = await Promise.all(promises);
    const successful = results.filter((r) => r && r.success === true);
    const failed = results.filter((r) => r instanceof Error);

    expect(successful.length).toBe(1);
    expect(failed.length).toBe(9);
  });
});
```

---

## 5. Security Checklist

- [ ] Critical state changes protected by database transactions or atomic operators.
- [ ] Rate limits configured on authentication, password reset, payment, and external API gateways.
- [ ] Business workflows enforce linear state machine transitions.
- [ ] File upload features enforce strict size limits, MIME type verification, and virus scanning.
