# NestJS Architecture Recipes

> **Framework:** NestJS (Node.js / TypeScript)  
> **Source of Authority:** [backend-patterns.md](../archetypes/backend-patterns.md)

---

## 1. Tier 2: NestJS Modular Monolith (Standard Enterprise Application)

Leverages native NestJS dependency injection and module boundaries.

### Directory Structure

```text
src/
├── app.module.ts
├── main.ts
├── common/                      # Shared Guards, Interceptors, Filters, Decorators
│   ├── filters/                 # all-exceptions.filter.ts
│   ├── interceptors/            # logging.interceptor.ts
│   └── guards/                  # jwt-auth.guard.ts
│
└── modules/                     # Bounded Context Modules
    ├── auth/
    │   ├── dto/                 # login.dto.ts, register.dto.ts
    │   ├── auth.controller.ts   # HTTP routing & validation pipes
    │   ├── auth.service.ts      # Authentication business logic
    │   ├── auth.module.ts       # Exports AuthService, keeps strategy private
    │   └── strategies/          # jwt.strategy.ts
    │
    └── orders/
        ├── dto/
        ├── entities/            # TypeORM / Prisma / Mongoose entity schemas
        ├── orders.controller.ts
        ├── orders.service.ts
        ├── orders.repository.ts
        └── orders.module.ts
```

### Invariants & Rules

1. **Encapsulation via `exports`:**
   - Only export services that other modules legitimately need in `exports: [MyService]`.
   - Controllers and internal repositories should remain private to the module.
2. **DTO Validation:**
   - Use `class-validator` and `class-transformer` with a global `ValidationPipe({ whitelist: true, forbidNonWhitelisted: true })`.

---

## 2. Tier 3: NestJS as Infrastructure in Hexagonal Architecture

When domain complexity requires strict isolation from NestJS decorators and ORM frameworks.

### Directory Structure

```text
src/
├── core/
│   ├── domain/                  # 100% Pure TypeScript (Zero NestJS or ORM imports)
│   │   ├── entities/            # order.entity.ts (methods mutate state safely)
│   │   ├── value-objects/       # order-id.vo.ts, money.vo.ts
│   │   └── exceptions/          # order-cancelled.exception.ts
│   │
│   └── application/             # Use Cases & Abstract Port Tokens
│       ├── ports/
│       │   ├── in/              # create-order.command.ts
│       │   └── out/             # order-repository.port.ts (Symbol / Interface)
│       └── use-cases/           # create-order.use-case.ts
│
└── infrastructure/              # NestJS Modules & External Adapters
    ├── adapters/
    │   ├── persistence/         # TypeOrmOrderRepository implements OrderRepositoryPort
    │   │   ├── order.orm-entity.ts
    │   │   └── typeorm-order.repository.ts
    │   └── http/                # OrderController implements Inbound HTTP Port
    │       ├── dto/
    │       └── order.controller.ts
    │
    └── nest-modules/            # NestJS IoC Wiring Modules
        ├── order.nest-module.ts # Binds Port Symbol -> TypeOrmOrderRepository provider
        └── app.module.ts
```

### Wiring Example (Hexagonal IoC in NestJS)

```typescript
// infrastructure/nest-modules/order.nest-module.ts
export const ORDER_REPOSITORY_PORT = Symbol('ORDER_REPOSITORY_PORT');

@Module({
  imports: [TypeOrmModule.forFeature([OrderOrmEntity])],
  controllers: [OrderController],
  providers: [
    CreateOrderUseCase,
    {
      provide: ORDER_REPOSITORY_PORT,
      useClass: TypeOrmOrderRepository,
    },
  ],
})
export class OrderNestModule {}
```
