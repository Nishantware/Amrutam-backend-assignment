# Amrutam Telemedicine Backend

A Node.js/Express/PostgreSQL backend assignment implementation focused on secure defaults, race-safe booking, idempotent writes, auditability and operational readiness.

## What is implemented

- Patient registration and login with bcrypt password hashing and short-lived signed JWTs.
- Role checks for `PATIENT`, `DOCTOR`, and `ADMIN`.
- Doctor search/filtering and creation/listing of availability slots.
- Booking with a PostgreSQL transaction, row-level `FOR UPDATE` lock, unique slot constraint, and mandatory `Idempotency-Key` header.
- Consultation lifecycle (`BOOKED → IN_PROGRESS → COMPLETED`, cancellation from active states) and prescription creation after completion.
- Append-only-style audit event records for key actions.
- Input validation with Zod, generic production 500 errors, Helmet, CORS allow-list, rate limiting, request IDs, structured logging, Prometheus metrics, and optional OpenTelemetry OTLP traces.
- Docker Compose, OpenAPI 3 schema, architecture/threat-model docs, smoke tests and CI workflow.

## Quick start (Docker)

1. Install Docker Desktop / Docker Engine with Compose.
2. From the project directory run:

   ```bash
   docker compose up --build
   ```

3. Check `http://localhost:3000/health/live`, `http://localhost:3000/health/ready`, and `http://localhost:3000/metrics`.
4. API schema is in `openapi.yaml`.

Tracing is disabled unless `OTEL_EXPORTER_OTLP_ENDPOINT` is configured. The compose file initializes the database from `db/schema.sql`. For a clean reset of local development data, run `docker compose down -v` (this deletes the local database volume).

## Run locally without Docker

Requires Node.js 20+ and PostgreSQL 16+.

```bash
cp .env.example .env
# Set DATABASE_URL and a random JWT_SECRET of at least 32 characters
npm install
npm run db:migrate
npm test
npm start
```

Never commit `.env`. Use a secret manager in deployed environments. Do not use the development credentials in production.

## API quick guide

All API routes are prefixed with `/api/v1`. Send JSON with `Content-Type: application/json`.

- `POST /auth/register` — `{ "email": "patient@example.com", "password": "at-least-12-characters", "fullName": "Test Patient" }`
- `POST /auth/login` — returns a short-lived bearer token.
- `GET /doctors?q=cardio&limit=20&offset=0` — verified doctor search.
- `GET /doctors/{doctorId}/availability` — available future slots.
- `POST /doctors/availability` — doctor token; `{ "startsAt": "2027-01-01T10:00:00.000Z", "endsAt": "2027-01-01T10:30:00.000Z" }`.
- `POST /consultations` — patient token, `Idempotency-Key: booking-unique-0001`, `{ "slotId": "<uuid>", "reason": "Follow-up" }`.
- `GET /consultations` — consultations visible to the authenticated role.
- `PATCH /consultations/{id}/status` — doctor/admin token; `{ "status": "IN_PROGRESS" }`.
- `POST /consultations/{id}/prescriptions` — doctor token after completion; `{ "items": [{ "name": "Example medicine", "dosage": "as directed", "frequency": "as directed", "duration": "as directed" }] }`.

Registration intentionally creates only `PATIENT` users. Do not expose public role selection. Doctor onboarding/verification and admin provisioning must be performed through a trusted, audited operational process; for a demo, seed users through a private script, not a public endpoint.

## Tests and CI

`npm test` runs fast invariant/smoke tests. CI runs tests, syntax checks and a container build. Before production, add database-backed integration tests for registration/login, authorization matrix, concurrent booking races, idempotency replay, state transitions, prescription ownership, and failure/rollback paths. Run a load test with representative data to validate the stated p95 targets.

## Important limitations / next steps

This is an assignment-ready foundation, not a certified medical platform. MFA is represented in the data model but its challenge/enrollment flow is not enabled; login deliberately refuses accounts with MFA enabled until that flow is configured. Payment provider integration, notification workers, outbox/saga orchestration, doctor onboarding, prescription retrieval, retention/deletion workflows, and a production secrets manager still need implementation. Do not use real patient data until security, privacy, legal, clinical, and operational reviews are complete.

See `docs/architecture.md`, `docs/security-threat-model.md`, and `docs/operations.md`.
