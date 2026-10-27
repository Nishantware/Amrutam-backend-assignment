# Security Checklist and Threat Model

## Data classification

- **Restricted health data:** consultation reasons, prescription contents, date of birth and patient/doctor relationships. Encrypt in transit and at rest; least-privilege access; never place in logs, metric labels, analytics events or error messages.
- **Personal data:** name, email, phone. Limit access, retention and exports.
- **Authentication secrets:** password hashes, JWT signing keys, DB credentials. Never return or log them; store production secrets in a secret manager and rotate them.
- **Operational data:** request IDs, status codes, timing and audit metadata. Avoid sensitive payloads; restrict access and set retention.

## Threats and mitigations

| Threat | Mitigation in this repository | Production follow-up |
|---|---|---|
| Credential stuffing / brute force | Rate limit; bcrypt; generic login error | Per-account/IP adaptive limits, breach detection, MFA |
| Token forgery / algorithm confusion | HS256 allow-list; issuer/audience checks; short token TTL | KMS-managed key rotation, refresh rotation/revocation, key IDs |
| Broken access control | Role middleware and doctor ownership check on status update | Full endpoint-by-endpoint object authorization tests; patient-specific prescription retrieval |
| Double booking / retry duplication | Row-level lock, unique slot constraint, idempotency key | Concurrent integration/load tests; request hash and stored response replay |
| SQL injection | Parameterized SQL | Static analysis and dependency scanning in CI |
| Oversized/malformed input | JSON size limit, Zod validation | Central schema coverage, abuse testing |
| Browser attacks / unsafe headers | Helmet; explicit CORS allow-list | TLS/HSTS at ingress; CSP tuned for client app |
| Sensitive logging | Authorization/password redaction; generic 500 response | Structured field allow-list; test redaction; restrict log access/retention |
| Dependency/supply-chain risk | Lockfile and CI should be committed | Dependabot/npm audit, SBOM, image scanning, signed builds |
| Insider misuse | Audit events for key flows | Append-only storage, access reviews, anomaly alerts, tamper-evident export |
| Data loss / ransomware | DB volume in local setup only | Managed encrypted backups, PITR, immutable copy, restore drills |
| DDoS / resource exhaustion | Basic per-process rate limit, body limit | WAF, CDN/edge throttles, shared rate-limit store, quotas |
| PHI exposure in cache/analytics | No sensitive response cache implemented | Data minimization, cache policy review, privacy review |

## OWASP controls

- **A01 Broken Access Control:** role-based middleware; enforce resource ownership on every route. Tests should include patient A reading/modifying patient B's resources.
- **A02 Cryptographic Failures:** TLS, database/storage encryption, bcrypt password hashing, managed keys and rotation.
- **A03 Injection:** parameterized SQL and strict input schemas.
- **A04 Insecure Design:** idempotent booking, explicit state transitions, threat modelling and abuse-case tests.
- **A05 Security Misconfiguration:** Helmet, restrictive CORS, no production secrets in images, health endpoints expose no internals.
- **A06 Vulnerable Components:** automated dependency updates, `npm audit`, SBOM and container scans.
- **A07 Identification/Auth Failures:** short JWT TTL, generic credential errors, rate limits; MFA flow remains to be implemented.
- **A08 Software/Data Integrity:** reviewed CI, pinned dependency lockfile, protected branches and signed releases.
- **A09 Logging/Monitoring Failures:** request IDs, structured logs, audit records and Prometheus counters; add alerting and distributed traces.
- **A10 SSRF:** no arbitrary URL fetch functionality currently exists; if integrations are added, allow-list destinations and block metadata/private IP ranges.

## Security acceptance checklist

- [ ] HTTPS enforced end-to-end; HSTS enabled at ingress.
- [ ] DB, backups and object storage encrypted at rest; TLS to DB where supported.
- [ ] Secrets stored outside source control and rotated; separate secrets per environment.
- [ ] MFA enrollment and challenge flow implemented and tested before enabling `mfa_enabled`.
- [ ] RBAC and object-level authorization integration tests cover all routes.
- [ ] Booking race, idempotency replay, rollback and cancellation tests pass under concurrency.
- [ ] Dependency, source, container and secret scanning enabled in CI.
- [ ] Audit logs are access-restricted, tamper-evident and retained per policy.
- [ ] Privacy/retention/deletion policy and applicable legal/regulatory review completed.
- [ ] Incident response, breach notification, key rotation and backup restore drills documented.

This threat model is an engineering starting point, not a legal compliance certification.
