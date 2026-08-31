# Frontend Architectural Archetypes & Patterns

> **Status:** Official Architectural Guide  
> **Applies to:** React, Angular, Vue, Svelte, Solid, and modern web applications.

---

## 1. Core Principles for Frontend Architecture

Regardless of the framework used, any scalable frontend architecture must observe three universal separations of concern:

1. **Separation of Presentation vs Logic (Dumb vs Smart / Container vs Presentational):**
   - Presentational components receive data via props/inputs and emit events via callbacks/outputs. They do not know about network protocols or global store implementations.
2. **Separation of Data Access & State:**
   - Network requests (REST, GraphQL, WebSocket) and state management are isolated in dedicated services, hooks, or stores, preventing UI components from being directly coupled to HTTP client libraries.
3. **Public API Barrier (Encapsulation):**
   - Features expose only their container views and shared models via an entry-point (`index.ts` / module file). Internal helpers, sub-components, and private state remain unexported.

---

## 2. Archetypes by Tier

### Tier 1: Flat / Colocated Architecture (Prototypes & MVPs)

```text
src/
├── components/          # Reusable dumb/smart components
├── hooks/ (or services/)# Data fetch and shared state
├── pages/ (or views/)   # Route views
└── utils/               # Helpers
```
* **Best for:** Fast proof-of-concepts, single-page tools, applications with $< 10$ views.

---

### Tier 2: Feature-Driven Design (Standard Application)

```text
src/
├── app/                 # Root provider, router, global layout
├── core/                # Global singletons: auth interceptor, API client, theme tokens
├── shared/              # Reusable UI library (Button, Modal, Input), formatters, generic hooks
└── features/            # Business domains (e.g. auth, billing, dashboard)
    ├── [feature-name]/
    │   ├── api/         # Endpoint queries, mutations, DTOs
    │   ├── components/  # Feature-specific UI components
    │   ├── hooks/       # Feature state logic (or services/signals)
    │   ├── models/      # Feature types / interfaces
    │   └── index.ts     # Public interface of the feature
```

* **Rules:**
  - A feature can import from `shared/` and `core/`.
  - Feature-to-feature direct imports of private sub-components are forbidden. If Feature A needs something from Feature B, it imports from `features/B/index.ts`.

---

### Tier 3: Feature-Sliced Design (FSD) / Clean Frontend (Enterprise)

Follows the strict layered hierarchy where lower layers cannot import from upper layers:

```text
src/
├── app/                 # Layer 1: App initialization, providers, routing
├── pages/               # Layer 2: Composed page views
├── widgets/             # Layer 3: Self-contained complex UI blocks (e.g., Header, OrderTable)
├── features/            # Layer 4: User interactions / use-cases (e.g., LikeButton, CheckoutFlow)
├── entities/            # Layer 5: Business entities (e.g., User, Product, Order)
└── shared/              # Layer 6: UI primitives, utilities, API client
```

* **Dependency Rule:** `app` $\rightarrow$ `pages` $\rightarrow$ `widgets` $\rightarrow$ `features` $\rightarrow$ `entities` $\rightarrow$ `shared`.
* Upper layers depend on lower layers. Lower layers **never** import from upper layers.
