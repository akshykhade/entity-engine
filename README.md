# Extensible ERP Platform — Backend Layer

An ERP **platform** where business modules (CRM, Inventory, Purchase, Sales, Accounting, Manufacturing, Milk Collection, and more) are built from shared primitives—not bespoke applications per domain.

**This repository is the backend layer:** entity definitions, metadata-driven generic API, entity service (CRUD, audit, permissions, workflows, actions), and database infrastructure. A separate frontend (generic UI engine, `EntityTable`, `EntityForm`, theming) is planned—not implemented here yet.

Everything below describes the full platform vision; [implementation status](#implementation-status) reflects what exists in this repo today.

**Day-to-day development:** follow the [Standard operating procedure (SOP)](#standard-operating-procedure-sop) for adding or changing business entities.

## Core realization

The goal is not to build an ERP application.

The goal is to build an ERP platform where modules become **configuration** rather than custom development.

## Inspiration

Systems that solve similar problems:

- ERPNext / Frappe
- Odoo
- Salesforce
- ServiceNow

## Important insight

Most ERP systems are primarily **metadata**.

| What developers often see | What ERP architects see |
| --- | --- |
| Forms | Entities |
| Tables | Relationships |
| APIs | Permissions |
| Reports | Workflows |
| | Actions |

Everything else should be **generated**.

## Source of truth

Avoid stacking layers where each tier invents its own model:

```
Database → API → UI
```

```
UI → API → Database
```

Prefer a single definition that flows downward:

```
Entity Definition
      ↓
  Database
      ↓
     API
      ↓
      UI
      ↓
  Workflow
```

The **entity definition** is the primary source of truth.

## Platform primitives

The platform is built around four primitives.

### Entity

Represents business data (Member, Invoice, Customer, Payment, Inventory …).

```ts
defineEntity({
  name: "Member",
  fields: {
    memberCode: string(),
    name: string(),
    mobile: string(),
  },
});
```

### Workflow

Represents lifecycle transitions (Draft, Approved, Rejected, Paid, Cancelled, …).

```ts
defineWorkflow({
  entity: "Invoice",
  states: ["Draft", "Approved", "Paid"],
});
```

### Action

Represents business commands (Approve Invoice, Cancel Invoice, Generate Payment, Send SMS, …).

```ts
defineAction({
  entity: "Invoice",
  name: "Approve",
});
```

Actions matter more than CRUD in real ERP systems.

### Permission

Represents access control.

```ts
definePermission({
  entity: "Invoice",
  read: ["admin", "accountant"],
  update: ["admin"],
});
```

## Entity engine

The entity engine is the ERP kernel. It owns:

- Field definitions
- Validation
- Relationships
- Permissions
- UI metadata
- Search metadata
- Workflow attachment
- Action attachment

```ts
defineEntity({
  name: "Member",
  fields: {
    name: field({
      label: "Member Name",
      searchable: true,
    }),
  },
});
```

## Generic API engine

Do not hand-build routes per entity:

```
GET /customers
GET /suppliers
GET /members
GET /invoices
```

Build one metadata-driven surface:

```
GET    /api/entity/:entity
POST   /api/entity/:entity
PUT    /api/entity/:entity/:id
DELETE /api/entity/:entity/:id
```

The API layer should not know business entities—it only understands metadata:

```ts
const entity = registry.get("Member");
```

## Generic UI engine (planned)

Not in this repo yet. The target frontend will be generated from the same entity metadata the API exposes (`GET /api/entity/:name/meta`):

```tsx
<EntityTable entity="Member" />
<EntityForm entity="Member" />
```

Planned responsibilities: forms, tables, filters, search, detail views. See [Planning — frontend & UI](#planning--frontend--ui).

## Reports are different

Transactional domains (Members, Invoices, Payments, Collections) can use generic CRUD.

Reports should use **dedicated SQL**, not the CRUD engine:

```sql
SELECT village, SUM(quantity)
FROM milk_collection
GROUP BY village;
```

```
Entity  → CRUD
Report  → SQL
```

Treat them as separate systems.

## Workflows and actions over CRUD

Simple apps are CRUD-heavy. ERP systems are **command-heavy**.

Business users care about:

```
POST /invoice/123/approve
POST /invoice/123/cancel
POST /invoice/123/send
```

—not `PATCH /invoice/123`. Optimize for commands and workflows.

## Audit trail

Required from day one. Track:

- Who changed
- What changed
- Old value / new value
- Timestamp

All mutations flow through a central service:

```
Entity Service
      ↓
    Audit
      ↓
  Workflow
      ↓
 Permission
      ↓
  Database
```

Never allow direct database mutations from modules.

## Database strategy

**Drizzle** is infrastructure: schema, migrations, query execution, SQL generation.

Drizzle must not become the platform architecture.

Avoid:

```
Business Logic → Drizzle
```

Prefer:

```
Business Logic → Entity Service → Drizzle
```

Drizzle stays replaceable.

## Supabase perspective

Supabase is useful for Postgres, Auth, Storage, and Realtime.

Autogenerated Supabase CRUD APIs should **not** become the ERP architecture. As complexity grows:

```
CRUD        ↓
Workflows   ↑
Actions     ↑
Reports     ↑
```

The platform owns entities, workflows, actions, and permissions regardless of database vendor.

## Architecture

**Full platform (target):**

```
UI                          ← planned (separate repo / app)
 ↓
Generic UI Engine           ← planned
 ↓
Generic API Engine          ← this repo (apps/server)
 ↓
Entity Service              ← this repo (packages/engine)
 ├── Permission Engine      ← packages/permissions (partial)
 ├── Workflow Engine        ← packages/workflows (partial)
 ├── Audit Engine           ← packages/engine (implemented)
 └── Action Engine          ← packages/engine (partial)
 ↓
Entity Registry             ← packages/entities
 ↓
Drizzle                     ← packages/db
 ↓
Postgres (or SQLite in dev)
```

## Key principle

The most valuable asset is not forms, tables, APIs, or codegen templates.

The most valuable asset is:

```
Entity Definitions
Workflow Definitions
Permission Definitions
Action Definitions
```

These are the **operating system** of the ERP platform. Everything else is generated or derived from them.

---

## Implementation status

Status key: **Implemented** — used in dev paths · **Partial** — wired but incomplete or unused · **Scaffold** — types/registry only · **Planned** — not started in this repo · **Infra** — tooling only

| Package / app | Status | What exists today |
| --- | --- | --- |
| `apps/server` | **Implemented** | Generic entity routes, OpenAPI at `/docs`, health check, Better Auth proxy at `/api/auth/*` |
| `packages/domains` | **Implemented** | Per-entity modules (`member/`: schema, entity, actions, workflow, reports, permissions); bootstrap on import |
| `packages/schemas` | **Implemented** | Drizzle tables for domain entities (imported via each domain’s `schema.ts`) |
| `packages/entities` | **Implemented** | `defineEntity`, `field()`, registry (kernel only; no built-in entities) |
| `packages/engine` | **Implemented** | CRUD, list/search/filters/sort/pagination, audit, workflow validation on update; action route + registry exist but **no actions registered yet** |
| `packages/db` | **Implemented** | Drizzle + SQLite; `member`, `audit_log`, Better Auth tables |
| `packages/auth` | **Implemented** | Better Auth (email/password) with Drizzle adapter |
| `packages/env` | **Implemented** | Zod-validated server environment |
| `packages/workflows` | **Scaffold** | `defineWorkflow`, registry, transition validation; **no workflows registered** |
| `packages/permissions` | **Scaffold** | `definePermission`, registry; **no rules registered**; default allow when no rules |
| `packages/reports` | **Partial** | `defineReport` + registry; sample `member-count` registered in domains; **no report HTTP API yet** |
| `apps/server` (auth context) | **Partial** | `createEngineContext` returns `user: undefined` — permissions not tied to session yet |
| `packages/entities` (relations) | **Planned** | No relationship fields or joins in definitions |
| `apps/web` (frontend) | **Planned** | No frontend app in this repo; UI lives in a separate project |
| `packages/config` | **Infra** | Shared TypeScript config |

### Generic API (implemented)

| Method | Path | Purpose |
| --- | --- | --- |
| `GET` | `/api/entity/:name/meta` | Entity metadata for clients / future UI |
| `GET` | `/api/entity/:name` | List (search, filters, sort, pagination) |
| `GET` | `/api/entity/:name/:id` | Get one record |
| `POST` | `/api/entity/:name` | Create |
| `PUT` | `/api/entity/:name/:id` | Update (runs workflow validation when configured) |
| `DELETE` | `/api/entity/:name/:id` | Delete |
| `POST` | `/api/entity/:name/:id/action/:action` | Run registered custom action |

### Sample entity

Only **Member** is registered via `packages/domains/member` (`memberCode`, `name`). Use it to exercise the generic API and OpenAPI docs.

---

## Tech stack (backend)

Built with [Better-T-Stack](https://github.com/AmanVarshney01/create-better-t-stack):

- **TypeScript** — end-to-end types
- **Bun** — runtime
- **Fastify** — API server
- **Drizzle** — schema and queries (infrastructure only)
- **SQLite / Turso** — local and edge-friendly database
- **Better Auth** — authentication
- **Turborepo** — monorepo builds

## Project structure

```
crud-engine/
├── apps/
│   └── server/           # Generic entity API (Fastify) — backend entrypoint
├── packages/
│   ├── domains/          # Business modules (entity, actions, workflow, reports, permissions per folder)
│   ├── schemas/          # Drizzle table definitions (shared by db + domains)
│   ├── entities/         # Entity kernel (defineEntity, registry)
│   ├── engine/           # Entity service, audit, query builder, actions
│   ├── workflows/        # Workflow definitions & validation (scaffold)
│   ├── permissions/      # Permission definitions (scaffold)
│   ├── reports/          # Report definitions (scaffold; SQL later)
│   ├── db/               # Drizzle client, infra tables (auth, audit), migrations
│   ├── auth/             # Better Auth configuration
│   ├── env/              # Environment validation
│   └── config/           # Shared TS config
```

## Standard operating procedure (SOP)

How to add or change a business entity in this monorepo. All domain-specific configuration lives under **`packages/domains`**; kernel packages (`entities`, `engine`, `workflows`, `permissions`, `reports`) stay generic.

### Principles

1. **One folder per entity** — Everything for `Member`, `Invoice`, etc. lives in `packages/domains/src/<entity>/` (lowercase folder name; PascalCase `name` in `defineEntity`).
2. **Do not register entities in `packages/entities`** — That package only provides `defineEntity`, `field()`, and `entityRegistry`. Registration happens in each domain’s `index.ts`.
3. **Do not add business tables only in `packages/db`** — Domain tables are defined in `packages/schemas`, re-exported through the domain’s `schema.ts`, and aggregated in `packages/db/src/schema/index.ts` for `createDb()` and Drizzle Kit.
4. **Server bootstraps domains once** — `apps/server` imports `@crud-engine/domains`, which runs `bootstrapDomains()` and registers all modules.
5. **Mutations go through the entity service** — No ad-hoc Drizzle writes in routes; use generic API + actions/reports as designed.

### Module layout (per entity)

Use **`member`** as the reference implementation.

```
packages/
├── schemas/src/
│   └── member.ts              # Drizzle table (source of truth for DDL)
└── domains/src/member/
    ├── schema.ts              # Re-export table for this module
    ├── entity.ts              # defineEntity + field metadata
    ├── workflow.ts            # defineWorkflow (optional)
    ├── actions.ts             # defineAction handlers (array)
    ├── reports.ts             # defineReport executors (array)
    ├── permissions.ts         # definePermission rules (array)
    └── index.ts               # registerMember() — wires all of the above
```

| File | Responsibility |
| --- | --- |
| `schemas/src/<entity>.ts` | `sqliteTable` / columns; no business logic |
| `domains/.../schema.ts` | `export { table } from "@crud-engine/schemas/<entity>"` |
| `domains/.../entity.ts` | `defineEntity({ name, table, primaryKey, fields })` |
| `domains/.../workflow.ts` | `WorkflowDefinition` or `undefined` until a status field exists |
| `domains/.../actions.ts` | `ActionDefinition[]` — custom commands |
| `domains/.../reports.ts` | `ReportDefinition[]` — SQL/analytics (not CRUD) |
| `domains/.../permissions.ts` | `PermissionDefinition[]` — per entity + action |
| `domains/.../index.ts` | `register<Entity>()` calling all registries |

### SOP: Add a new entity

Replace `Invoice` / `invoice` with your names.

#### 1. Create the Drizzle table

**File:** `packages/schemas/src/invoice.ts`

```ts
import { sqliteTable, text } from "drizzle-orm/sqlite-core";

export const invoices = sqliteTable("invoices", {
  id: text("id").primaryKey(),
  // ...columns
});
```

Export from `packages/schemas/src/index.ts` if you use barrel exports.

#### 2. Scaffold the domain module

Create `packages/domains/src/invoice/` with:

- **`schema.ts`** — `export { invoices } from "@crud-engine/schemas/invoice";`
- **`entity.ts`** — `defineEntity({ name: "Invoice", table: invoices, ... })`
- **`workflow.ts`** — export `undefined` until you have a lifecycle column
- **`actions.ts`** — `export const invoiceActions: ActionDefinition[] = [];`
- **`reports.ts`** — `export const invoiceReports: ReportDefinition[] = [];`
- **`permissions.ts`** — `export const invoicePermissions: PermissionDefinition[] = [];`
- **`index.ts`** — copy the pattern from `member/index.ts` (`registerInvoice`)

#### 3. Register the module globally

**File:** `packages/domains/src/index.ts`

```ts
import { registerInvoice } from "./invoice";

export function bootstrapDomains(): void {
  registerMember();
  registerInvoice();
}
```

Re-export public symbols from `./invoice` if other packages need them.

#### 4. Wire the table into the database client

**File:** `packages/db/src/schema/index.ts`

```ts
export { invoices } from "@crud-engine/schemas/invoice";
```

Drizzle Kit already scans `packages/schemas/src` via `packages/db/drizzle.config.ts`. After schema changes:

```bash
bun run db:push
# or, for migration files:
bun run db:generate
bun run db:migrate
```

#### 5. Verify

```bash
bun run check-types
bun run dev:server
```

- Open [http://localhost:3000/docs](http://localhost:3000/docs) — entity should appear in generic routes.
- `GET /api/entity/Invoice/meta` — field metadata for clients.
- Exercise list/create/update/delete on `/api/entity/Invoice`.

Optional sanity check:

```bash
bun -e "import '@crud-engine/domains'; import { entityRegistry } from '@crud-engine/entities'; console.log(entityRegistry.list().map(e => e.name));"
```

### SOP: Enable workflow for an entity

1. Add a status column on the table in `packages/schemas`.
2. Expose the field in `entity.ts` (`field({ ... })`).
3. Define workflow in `workflow.ts`:

```ts
import type { WorkflowDefinition } from "@crud-engine/workflows";

export const invoiceWorkflow: WorkflowDefinition = {
  entity: "Invoice",
  field: "status",
  states: ["Draft", "Approved", "Paid"],
  transitions: [
    { from: "Draft", to: "Approved", action: "approve" },
  ],
};
```

4. `registerInvoice()` already calls `defineWorkflow` when the export is non-undefined.
5. Run `db:push` (or migrate) before testing `PUT` updates that change status.

### SOP: Add a custom action

**File:** `domains/src/invoice/actions.ts`

```ts
import { defineAction } from "@crud-engine/engine";
import type { ActionDefinition } from "@crud-engine/engine";

export const invoiceActions: ActionDefinition[] = [
  {
    entity: "Invoice",
    name: "approve",
    handler: async (ctx, id, body) => {
      // use ctx + entity service patterns; return result
      return { ok: true, id };
    },
  },
];
```

API: `POST /api/entity/Invoice/:id/action/approve`

Register matching permissions in `permissions.ts` when auth is wired (today CRUD defaults to allow if no rules exist).

### SOP: Add a report

**File:** `domains/src/invoice/reports.ts`

```ts
import type { ReportDefinition } from "@crud-engine/reports";
import { invoices } from "./schema";

export const invoiceReports: ReportDefinition[] = [
  {
    name: "invoice-summary",
    execute: async (ctx) => {
      // Prefer Drizzle/SQL here — not the generic CRUD list endpoint
      return { total: 0 };
    },
  },
];
```

Reports are registered in the report registry; a dedicated HTTP route for reports is **not implemented yet** — registry + `execute` are ready for a future `/api/report/:name` (or similar).

### SOP: Add permissions

**File:** `domains/src/invoice/permissions.ts`

```ts
import type { PermissionDefinition } from "@crud-engine/permissions";

export const invoicePermissions: PermissionDefinition[] = [
  {
    entity: "Invoice",
    action: "read",
    check: (ctx) => Boolean(ctx.user),
  },
];
```

Actions: `"read" | "create" | "update" | "delete"`. Multiple rules for the same entity/action must all pass. Custom action permissions are planned; use the action registry + route guards until then.

### SOP: Change an existing entity

1. Edit table in `packages/schemas` → `db:push` or migrate.
2. Update `entity.ts` fields to match columns (add/remove `field()` entries).
3. Adjust workflow/actions/reports/permissions in the same domain folder.
4. Run `check-types` and hit `/meta` + one CRUD path in OpenAPI.

Never change generic routes in `apps/server` for one entity — extend metadata in `domains` instead.

### Checklist (copy per PR)

- [ ] `packages/schemas/src/<entity>.ts` created or updated
- [ ] `packages/domains/src/<entity>/` complete (7 files)
- [ ] `register<Entity>()` called from `domains/src/index.ts`
- [ ] `packages/db/src/schema/index.ts` re-exports table
- [ ] Schema applied (`db:push` or migrate)
- [ ] `bun run check-types` passes
- [ ] Manual check: `/api/entity/<Name>/meta` and one CRUD operation

### What not to do

| Avoid | Do instead |
| --- | --- |
| `defineEntity` inside `packages/entities` | Register in `domains/.../index.ts` |
| Table only in `packages/db/src/schema` | Define in `packages/schemas`, re-export in db + domain |
| New Fastify route per entity | Generic `/api/entity/:name` routes |
| Report logic via list/search CRUD | `reports.ts` with SQL/Drizzle |
| Direct `db.insert` from `apps/server` | Entity service / actions |

### Package dependency rules

```
schemas          → drizzle-orm only
entities         → drizzle-orm (types)
domains          → schemas, entities, engine, workflows, permissions, reports
db               → schemas (+ auth/audit infra tables)
engine           → db, entities, workflows, permissions
server           → domains (bootstrap), engine, db, auth
```

Do not make `db` depend on `domains` (causes a circular dependency with `engine` / `reports`). Shared tables live in **`schemas`**.

---

## Getting started

Install dependencies:

```bash
bun install
```

### Database

This project uses SQLite with Drizzle ORM.

1. Optional: start local SQLite:

```bash
bun run db:local
```

2. Configure `apps/server/.env` if needed.

3. Apply schema:

```bash
bun run db:push
```

### Development

```bash
bun run dev
```

- API: [http://localhost:3000](http://localhost:3000)
- OpenAPI: [http://localhost:3000/docs](http://localhost:3000/docs)

Set `CORS_ORIGIN` in `apps/server/.env` for any client that calls the API (required for Better Auth trusted origins).

## Scripts

| Command | Description |
| --- | --- |
| `bun run dev` | Start all apps in development |
| `bun run build` | Build all packages and apps |
| `bun run dev:server` | Start API only |
| `bun run check-types` | Typecheck the monorepo |
| `bun run db:push` | Push schema to the database |
| `bun run db:generate` | Generate Drizzle client/types |
| `bun run db:migrate` | Run migrations |
| `bun run db:studio` | Open Drizzle Studio |
| `bun run db:local` | Start local SQLite |

## Planning — frontend & UI

The backend is designed to feed a **generic UI engine** in a **separate frontend project** (not in this monorepo). Nothing in that layer ships here yet.

### Planned frontend (separate repo or app)

- Next.js (or similar) consuming `/api/entity/:name/meta` and generic CRUD routes
- Metadata-driven `<EntityTable />`, `<EntityForm />`, filters, and detail views
- Auth session wired into API calls; permission-aware UI
- Own component library (e.g. shadcn) scoped to that app—no shared `packages/ui` in the backend repo

### Planned report UI

Report screens will call a **dedicated report API** (SQL-backed), not the entity CRUD engine—aligned with [Reports are different](#reports-are-different).
