# Operations Runbook

## Health and metrics

- Liveness: `GET /health/live` — process responds.
- Readiness: `GET /health/ready` — checks PostgreSQL connectivity.
- Prometheus scrape: `GET /metrics` — default Node.js metrics and `http_requests_total` counter.
- Logs are structured JSON via pino-http and carry a request ID. Authorization and password fields are redacted.
- Optional distributed traces are enabled by setting `OTEL_EXPORTER_OTLP_ENDPOINT`; OpenTelemetry Node auto-instrumentation exports OTLP/HTTP traces when configured.

Protect metrics from public access in production (private network/authenticated scrape); this demo exposes them without authentication for local convenience.

## Deployment checklist

1. Build immutable container image and scan dependencies/image.
2. Inject `DATABASE_URL`, strong `JWT_SECRET` and environment configuration from a secret manager.
3. Apply reviewed, versioned database migrations as a deployment job (the schema initializer is for development).
4. Deploy multiple API replicas behind TLS ingress and readiness checks.
5. Run smoke tests, observe error rate/latency, then shift traffic gradually.
6. Confirm backup age, replication health and alert routes.

## Incident response

- Elevated 5xx: check API logs by request ID, DB readiness, pool saturation and recent deploys; rollback if correlated.
- Booking conflicts: expected 409s may rise under contention; inspect slot availability and duplicate attempts. Never manually insert a second consultation for a slot.
- DB unavailable: readiness should fail; avoid retry storms. Restore connectivity/failover, then verify transaction consistency and replay client requests with the same idempotency key.
- Suspected data exposure: restrict access, preserve logs, rotate affected credentials/keys, follow the incident response and legal notification process.

## Backup and disaster recovery

Recommended production policy: automated encrypted full backups plus continuous WAL archiving/PITR; separate-account immutable copies; target RPO ≤ 5 minutes and RTO ≤ 60 minutes, subject to validation. Perform quarterly restore drills into an isolated environment, verify row counts and application invariants, and document actual recovery times. Never assume a successful backup job proves recoverability.
