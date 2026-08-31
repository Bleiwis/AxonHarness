# React & Next.js Architecture Recipes

> **Framework:** React, Next.js, Vite  
> **Source of Authority:** [frontend-patterns.md](../archetypes/frontend-patterns.md)

---

## 1. Tier 2: Feature-Driven Design (FDD) in React

Recommended for 90% of production React applications (SPAs or Next.js App Router).

### Directory Structure

```text
src/
├── app/                        # Next.js App Router or Root App Provider/Layout
├── core/                       # Global configs, HTTP client (Axios/Ky/fetch), Theme tokens
├── shared/                     # Pure reusable UI & utilities
│   ├── components/             # Button, Modal, Card, Input (Dumb/Presentational)
│   ├── hooks/                  # useDebounce, useLocalStorage, useMediaQuery
│   └── utils/                  # formatters, validators
│
└── features/                   # Business domain modules
    ├── authentication/
    │   ├── api/                # loginMutation.ts, fetchSession.ts
    │   ├── components/         # LoginForm.tsx, OAuthButtons.tsx
    │   ├── hooks/              # useAuth.ts
    │   ├── types/              # auth.types.ts
    │   └── index.ts            # Public API: exports LoginForm, useAuth
    │
    └── billing/
        ├── api/                # getInvoices.ts, cancelSubscription.ts
        ├── components/         # InvoiceTable.tsx, PaymentModal.tsx
        ├── hooks/              # useBillingHistory.ts
        ├── types/              # invoice.types.ts
        └── index.ts            # Public API: exports BillingDashboardWidget
```

### Invariants & Rules

1. **Feature Public Index (`index.ts`):**
   ```typescript
   // src/features/authentication/index.ts
   export { LoginForm } from './components/LoginForm';
   export { useAuth } from './hooks/useAuth';
   export type { UserSession } from './types/auth.types';
   ```
2. **Never import feature internals across features:**
   - ❌ `import { LoginForm } from '@/features/authentication/components/LoginForm'`
   - ✅ `import { LoginForm } from '@/features/authentication'`
3. **Smart vs Dumb Components:**
   - Keep presentational components in `components/` pure: pass state and handlers down via props.
   - Use custom hooks (`hooks/`) to encapsulate TanStack Query / SWR / Zustand logic.

---

## 2. Tier 3: Feature-Sliced Design (FSD) in Next.js / React

For multi-team enterprise platforms, implement strict FSD layers:

```text
src/
├── app/             # App setup, global providers, routing entries
├── pages/           # Page composition (combines widgets & features)
├── widgets/         # Composite UI blocks (e.g. Header, UserProfileWidget)
├── features/        # User action workflows (e.g. AddToCart, FilterProducts)
├── entities/        # Business models & UI cards (e.g. User, ProductCard, OrderItem)
└── shared/          # Base UI kit, API client, generic helpers
```
