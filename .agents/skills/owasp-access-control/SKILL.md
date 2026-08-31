---
name: owasp-access-control
description: >-
  Expert guide for preventing and fixing OWASP A01:2025 Broken Access Control vulnerabilities.
  Use when designing authorization systems, multi-tenant databases, API endpoints, IDOR prevention,
  or Role-Based/Attribute-Based Access Control (RBAC/ABAC).
---

# OWASP A01:2025 – Broken Access Control

## 1. Overview & Risk Profile

Broken Access Control occurs when users can act outside their intended permissions. This includes **Insecure Direct Object References (IDOR)**, horizontal/vertical privilege escalation, missing function level access control, and permissive CORS configurations.

- **OWASP Category:** A01:2025 – Broken Access Control
- **CWE References:** CWE-200, CWE-284, CWE-285, CWE-639 (IDOR)
- **Impact:** High (Unauthorized data exposure, tenant data leakage, administrative takeover)

---

## 2. Core Remediation Rules

1. **Deny by Default:** Declare all endpoints, resources, and domain methods private unless explicitly annotated as public.
2. **Context-Aware Scoping (Anti-IDOR):** Never query a record by its primary key alone when belonging to a user/tenant. Always filter by `tenant_id` and/or `user_id`.
3. **Domain-Level Authorization:** Do not rely solely on UI button hiding or frontend routing. Authorize at the service/domain layer.
4. **CORS Hardening:** Avoid `Access-Control-Allow-Origin: *` with `Access-Control-Allow-Credentials: true`. Use strict whitelist validation.

---

## 3. Code Examples (Anti-Pattern vs Secure Pattern)

### Example 1: Insecure Direct Object Reference (IDOR) in Record Retrieval

#### ❌ Vulnerable (Anti-Pattern - Insecure IDOR)
```typescript
// VULNERABLE: Direct access by client-supplied ID without owner/tenant validation
app.get('/api/invoices/:id', async (req: Request, res: Response) => {
  const invoiceId = req.params.id;
  // Anyone authenticated can fetch ANY invoice by guessing or enumerating IDs!
  const invoice = await db.invoices.findById(invoiceId);
  if (!invoice) return res.status(404).json({ error: 'Not found' });
  return res.json(invoice);
});
```

#### ✅ Secure (Remediated Pattern - Tenant Scoped)
```typescript
// SECURE: Enforces authentication context and tenant-level isolation
app.get('/api/invoices/:id', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  const invoiceId = req.params.id;
  const userTenantId = req.user.tenantId;

  const invoice = await db.invoices.findOne({
    where: {
      id: invoiceId,
      tenantId: userTenantId, // Guarantees tenant boundary enforcement
    },
  });

  if (!invoice) {
    // Return 404 to avoid leaking existence of other tenants' records
    return res.status(404).json({ error: 'Invoice not found' });
  }

  return res.json(invoice);
});
```

---

### Example 2: Vertical Privilege Escalation in Role Updates

#### ❌ Vulnerable (Anti-Pattern - Blind Mass Assignment / Role Update)
```python
# VULNERABLE: Accepts any user role from the request body without checking permissions
@router.patch("/api/users/{user_id}")
async def update_profile(user_id: str, payload: UpdateUserSchema, current_user: User = Depends(get_current_user)):
    # Regular user can pass payload={"role": "ADMIN"} and escalate their own privileges!
    user = await user_repo.update(user_id, **payload.dict())
    return user
```

#### ✅ Secure (Remediated Pattern - Role-Gated & DTO Separation)
```python
# SECURE: Segregated schemas and strict permission enforcement
@router.patch("/api/users/{user_id}")
async def update_profile(
    user_id: str, 
    payload: UserSelfUpdateSchema, # Does not contain 'role' field
    current_user: User = Depends(get_current_user)
):
    if current_user.id != user_id and not current_user.has_permission("users:write"):
        raise HTTPException(status_code=403, detail="Forbidden: insufficient permissions")

    user = await user_repo.update_profile(user_id, name=payload.name, bio=payload.bio)
    return user

@router.patch("/api/admin/users/{user_id}/role")
async def update_user_role(
    user_id: str,
    payload: AdminRoleUpdateSchema,
    current_user: User = Depends(require_permission("admin:manage_roles"))
):
    user = await user_repo.update_role(user_id, role=payload.role)
    return user
```

---

## 4. Verification & Testing Strategy (TDD)

Always write integration tests verifying authorization rejection:

```typescript
describe('Invoices Access Control', () => {
  it('should return 404 when User A tries to access User B invoice (IDOR Protection)', async () => {
    const userA = await createTestUser({ tenantId: 'tenant-1' });
    const invoiceB = await createTestInvoice({ tenantId: 'tenant-2' });

    const res = await request(app)
      .get(`/api/invoices/${invoiceB.id}`)
      .set('Authorization', `Bearer ${userA.token}`);

    expect(res.status).toBe(404);
  });
});
```

---

## 5. Security Checklist

- [ ] All database queries filter by authenticated user/tenant identifier.
- [ ] Role changes and administrative actions require explicit RBAC permissions.
- [ ] No mass assignment vulnerabilities in update endpoints.
- [ ] CORS policies restrict origins to explicit domain lists.
