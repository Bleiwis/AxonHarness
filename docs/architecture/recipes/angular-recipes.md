# Angular Architecture Recipes

> **Framework:** Angular (v17+ Standalone & Signals / Classic)  
> **Source of Authority:** [frontend-patterns.md](../archetypes/frontend-patterns.md)

---

## 1. Tier 2: Feature-Driven Design with Modern Standalone & Signals

Recommended for standard and growing Angular applications.

### Directory Structure

```text
src/app/
├── core/                        # Global Singletons (App-wide)
│   ├── guards/                  # auth.guard.ts
│   ├── interceptors/            # auth.interceptor.ts, error.interceptor.ts
│   └── services/                # theme.service.ts, analytics.service.ts
│
├── shared/                      # Shared Reusable Elements
│   ├── ui/                      # Dumb standalone components (button, modal, table)
│   ├── pipes/                   # date-format.pipe.ts, currency.pipe.ts
│   └── directives/              # auto-focus.directive.ts
│
└── features/                    # Feature Domains
    ├── auth/
    │   ├── data-access/         # auth.service.ts (Signals/RxJS), auth.store.ts
    │   ├── ui/                  # login-form.component.ts (Dumb UI)
    │   ├── models/              # auth-credentials.interface.ts, user.interface.ts
    │   ├── auth.routes.ts       # Feature routes (Lazy loaded)
    │   └── index.ts             # Public barrel export
    │
    └── dashboard/
        ├── data-access/         # metrics.service.ts
        ├── ui/                  # chart-card.component.ts
        ├── dashboard.component.ts # Smart Container Component
        ├── dashboard.routes.ts
        └── index.ts
```

### Invariants & Rules

1. **Standalone Components & Signals:**
   - Use `standalone: true` and `changeDetection: ChangeDetectionStrategy.OnPush` on all components.
   - Separate data fetching into `data-access/` using Angular Signals (`computed()`, `signal()`) or RxJS streams.
2. **Smart / Container vs Dumb / UI Separation:**
   - Components in `ui/` must only receive inputs (`input()`) and emit outputs (`output()`). No direct `HttpClient` injection inside presentational components.
3. **Lazy Loading by Feature:**
   - Each feature provides its own routes via `feature.routes.ts` loaded with `loadChildren: () => import('./features/auth/auth.routes')`.

---

## 2. Tier 3: Angular Enterprise Clean Architecture (Nx / Hexagonal)

For enterprise Angular codebases requiring domain purity:

```text
src/app/
├── domain/                      # 100% Pure TypeScript Models & Business Rules (No @angular/*)
│   ├── models/
│   └── validators/
│
├── ports/                       # Abstract Interfaces / InjectionTokens
│   ├── user-repository.port.ts
│   └── auth-storage.port.ts
│
├── adapters/                    # Angular Implementations
│   ├── http-user-repository.ts  # Injects HttpClient and implements UserRepositoryPort
│   └── local-storage-auth.ts
│
└── ui/                          # Angular Presentation Layer (Features, Pages, Shell)
```
