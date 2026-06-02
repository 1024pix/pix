# The Pix API — Architecture Overview

## What It Is

The API is a **Node.js HTTP backend** built on the [Hapi](https://hapi.dev/) framework (v21). It powers the Pix platform — an online skills assessment and certification service for the French educational system. The codebase follows **Domain-Driven Design (DDD)** and is one of the most structurally mature JavaScript backends you'll find in an open-source context. It manages users, assessments, certifications, campaigns, organizations, and much more.

---

## Entry Points

There are three processes the API can run as:

**`index.js` → HTTP server.** The main process. It boots a Hapi server, connects to databases, initializes Redis pub/sub, and registers a Prometheus metrics endpoint. It handles graceful shutdown on `SIGTERM`/`SIGINT`.

**`worker.js` → Background job worker.** A second process that consumes jobs from a PostgreSQL-backed queue (PG Boss). Jobs are grouped into `DEFAULT` and `FAST` queues. This process shares the same domain and infrastructure code but listens for work rather than HTTP requests.

**`server.js` → Server factory.** Not a process itself, but a factory function that configures the Hapi instance: registers plugins, sets up authentication strategies (JWT, OIDC, SAML), registers all routes across 22+ bounded contexts, and configures error handling, CORS, and HSTS headers.

---

## The Bounded Contexts

The `src/` directory is organized into **bounded contexts**, each representing a distinct business domain. This is the most important architectural decision in the project. Major contexts include:

- **`certification/`** — The most complex, split into 5 sub-domains: `configuration`, `enrolment`, `evaluation`, `results`, and `session-management`. Handles everything from session creation to PDF score reports.
- **`prescription/`** — Also split into 7 sub-domains. Manages campaigns, target profiles, participant tracking, and organization-learner relationships.
- **`evaluation/`** — Assessment engine: challenge selection, answer processing, scoring.
- **`devcomp/`** — Educational component system (DEVCOMP), a separate content format for modular learning paths.
- **`identity-access-management/`** — User authentication, OIDC federation, SAML SSO, account management.
- **`organizational-entities/`** — Organizations, divisions, school hierarchies.
- **`learning-content/`** — Integration with the LCMS (Learning Content Management System); caches frameworks, competences, tubes, skills, and challenges in memory.
- **`quest/`** — A gamification layer (quests, rewards).
- **`privacy/`** — User data anonymization and deletion flows, GDPR tooling.
- **`llm/`** — LLM API integration for AI-assisted features.
- **`shared/`** — Cross-cutting infrastructure: global auth strategies, database connections, email, storage, feature toggles, and shared repositories.

Each context is self-contained. Cross-context calls go through explicitly defined interfaces, not direct database joins across domains.

---

## The Layered Architecture Inside Each Context

Every bounded context follows the same internal structure:

```
<context>/
  application/    ← HTTP layer: controllers, routes, serializers
  domain/         ← Business logic: models, use cases, errors
  infrastructure/ ← Data access: repositories, adapters
```

**Domain layer** — Pure business logic with no knowledge of HTTP or SQL. Models are plain JavaScript classes that encapsulate rules (`user.isAdminInOrganization()`, `session.isFinalized()`). Use cases are functions that orchestrate domain operations; they accept dependencies via parameters to make them easy to test in isolation.

**Application layer** — Controllers receive Hapi requests, extract parameters, call use cases, and return serialized responses. Serializers convert domain objects to/from [JSON:API](https://jsonapi.org/) format. Routes are Hapi route definitions with Joi validation schemas.

**Infrastructure layer** — Repositories translate between SQL results and domain models. They use Knex (the query builder) directly — there's no ORM with lazy loading or magical relationships. Every query is explicit.

---

## Database Strategy

The API connects to **four PostgreSQL databases**:

| Connection | Purpose |
|---|---|
| `DATABASE_URL` | Main transactional database |
| `JOBS_DATABASE_URL` | PG Boss job queue |

There are **794 Knex migration files** in `db/migrations/`, representing the full history of the schema. Knex extensions add a few quality-of-life improvements: `whereInArray()` for querying PostgreSQL arrays, automatic date parsing to `YYYY-MM-DD` strings (instead of JavaScript `Date` objects), and query comment injection for observability.

A **`DomainTransaction` pattern** powered by Node.js `AsyncLocalStorage` ensures that any repository call within the same use case shares the same database connection/transaction automatically, without needing to thread it through every function call.

---

## Authentication

Three strategies coexist, all registered in Hapi:

- **JWT** — The default. Tokens are signed and verified with `jsonwebtoken`. Most API routes use this.
- **OIDC** — For federated identity via `openid-client` (e.g., Educonnect, France Connect).
- **SAML** — For institutional SSO via `samlify`.

Cookie-based session state is handled by the `@hapi/yar` plugin. Authorization is enforced via Hapi pre-handlers that run before route handlers.

---

## HTTP Framework: Hapi

Hapi was chosen over Express for its structured plugin system and built-in request lifecycle hooks. Key plugins registered:

- **Pino** — Structured JSON logging with per-request correlation (user ID, request ID).
- **Inert / Vision** — Static file serving and templating.
- **hapi-swagger** — Auto-generated OpenAPI documentation from route definitions.
- **Joi** — Schema validation on params, query strings, and payloads.

---

## Background Jobs

PG Boss v12 turns PostgreSQL into a job queue. The `worker.js` process polls for work. Jobs include things like sending emails after certification, generating exports, anonymizing user data, and running scheduled aggregations.

A notable pattern: **success handlers**. When a database transaction commits, a post-commit callback can be scheduled to enqueue a job. This avoids the classic "publish an event but the transaction rolls back" race condition.

---

## Observability

The API takes monitoring seriously:

- **Pino** for structured logs with full request context.
- **Datadog metrics** (histograms, gauges) for latency, error rates, and database pool health.
- **Prometheus** endpoint for scraping.
- **Database pool metrics** exported per connection.
- **Execution context manager** (`AsyncLocalStorage`) threads request/job/script context through the entire call stack so every log line knows which user triggered it, which request it belongs to, and how many DB queries it made.

---

## Key Infrastructure Services

| Service | Implementation |
|---|---|
| Email | Nodemailer + Brevo (Sendinblue) API |
| File storage | Generic S3 via `@aws-sdk/client-s3` |
| Cache / KV | Redis (`ioredis`) with in-memory fallback |
| Distributed locking | Redis-based `RedisMutex` |
| Pub/Sub | Redis + GraphQL subscriptions |
| PDF generation | `pdfkit` + `pdf-lib` |
| Excel/CSV export | `xlsx` + `@json2csv` |
| SAML/XML | `samlify`, `xml2js`, `xmlbuilder2` |

---

## Feature Toggles

`config/feature-toggles-config.js` defines 100+ feature flags. Each flag has a default value and can be overridden per environment via environment variables. Flags are tagged by team (`team-certif`, `team-prescription`, etc.) and surface (`frontend`, `backend`). This lets teams deploy code dark and activate features independently in production.

---

## Testing

Tests live in `tests/` with three levels:

- **Unit** — Pure logic, no database, fast.
- **Integration** — Uses a real database; `databaseBuilder` fixtures create and clean up data.
- **Acceptance** — Full HTTP round-trips against a running Hapi server.

The stack is **Mocha** (runner) + **Chai** (assertions) + **Sinon** (spying/stubbing) + **Nock** (HTTP mocking). Tests are organized to mirror the `src/` domain structure.

---

## Summary

The Pix API is a large, well-structured Node.js monolith organized around **22 DDD bounded contexts**, each with clear **application / domain / infrastructure** layers. It uses **Hapi** for HTTP, **Knex** for SQL across four PostgreSQL databases, **PG Boss** for background jobs, and a comprehensive observability stack. The architecture prioritizes explicit over magical: no ORM relationships, dependency injection through function parameters, and explicit transaction management. It is production-grade and designed to run at worldwide load.
