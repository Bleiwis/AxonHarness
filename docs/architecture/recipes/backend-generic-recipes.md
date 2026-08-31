# Backend Generic Recipes (Python, Go, Java)

> **Languages & Frameworks:** Python (FastAPI), Go (Gin/Fiber), Java/Kotlin (Spring Boot)  
> **Source of Authority:** [backend-patterns.md](../archetypes/backend-patterns.md)

---

## 1. Python (FastAPI) Recipes

### Tier 2: Feature-Based Modular Layout

```text
src/
├── core/
│   ├── config.py                # Pydantic Settings
│   ├── database.py              # SQLAlchemy / Tortoise engine & session
│   └── security.py              # JWT encoding & password hashing
│
└── features/
    ├── users/
    │   ├── router.py            # APIRouter with endpoints
    │   ├── schemas.py           # Pydantic request/response schemas
    │   ├── service.py           # Domain & business logic
    │   ├── models.py            # SQLAlchemy database models
    │   └── dependencies.py      # FastAPI Depends helpers
    │
    └── billing/
        ├── router.py
        ├── schemas.py
        └── service.py
```

### Tier 3: Clean Architecture / Hexagonal in Python

```text
src/
├── domain/                      # Pure Python Dataclasses / Domain entities
│   ├── entities/
│   └── exceptions.py
├── application/                 # Use Cases & ABCs (Abstract Base Classes)
│   ├── ports/
│   └── use_cases/
└── infrastructure/              # FastAPI routers, SQLAlchemy adapters, Celery tasks
    ├── api/
    └── repositories/
```

---

## 2. Go (Standard & Hexagonal Layout)

### Tier 2 / 3: Standard Go Hexagonal Layout

```text
cmd/
└── server/
    └── main.go                  # Dependency injection wiring & server start

internal/
├── core/
│   ├── domain/                  # Pure Go structs, domain errors, business rules
│   │   ├── order.go
│   │   └── errors.go
│   │
│   └── ports/                   # Inbound & Outbound interfaces
│       ├── in.go                # OrderService interface (Use cases)
│       └── out.go               # OrderRepository, PaymentGateway interfaces
│
└── adapters/
    ├── handler/
    │   └── http/                # Gin/Fiber HTTP handlers
    └── repository/
        └── postgres/            # Database implementation using sqlx or pgx
```

---

## 3. Java / Kotlin (Spring Boot) Recipes

### Tier 3: Ports & Adapters in Spring Boot

```text
src/main/java/com/app/
├── domain/                      # Plain Old Java Objects (POJO) / Kotlin Data Classes
│   ├── model/
│   └── exception/
│
├── application/                 # Use cases and port interfaces
│   ├── port/
│   │   ├── in/                  # Command & Query interfaces
│   │   └── out/                 # RepositoryPort, NotificationPort
│   └── service/                 # @Service implementing inbound ports
│
└── infrastructure/              # Spring Controllers & Persistence
    ├── adapter/
    │   ├── in/web/              # @RestController implementing Web Port
    │   └── out/persistence/     # Spring Data JPA Repository adapter
    └── config/                  # @Configuration beans
```
