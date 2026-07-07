# Production Readiness Plan

This document keeps the production backlog aligned with the PRD while the current repository remains a local, privacy-safe prototype.

## Scope Split

| Track | Included now | Next production step | Out of scope for current prototype |
| --- | --- | --- | --- |
| Product workflow | Signal intake, retained trace review, knowledge governance, evaluation, badcase review, ticket queue, handoff preview, release decision, audit log. | Persist every operational state through authenticated APIs. | Real customer data or production traffic. |
| Data layer | Seed data and local API contract. | Create relational tables for the core entities in `docs/backend-api-contract.md`. | Direct writes to third-party CRM or channel systems. |
| Identity and access | Admin-only local UI. | Add Auth / RBAC for Viewer, Operator, PM/Admin, and Compliance. | Anonymous access to export, release, or audit operations. |
| Auditability | Local audit events for trace review, eval, CSV export, and release decision. | Move audit events to an append-only backend store. | Mutating or deleting audit events from the UI. |
| Export | Frontend CSV preview and sanitized CSV download. | Create signed export jobs with expiry, actor, role, and export scope. | Raw message, account, KYC, transaction, or secret export. |
| Integrations | Interface-level planning only. | Add channel, CRM, LLM, retrieval, and eval worker adapters behind service boundaries. | Vendor-specific production credentials in this repo. |

## RBAC Model

| Role | Can view | Can operate | Can approve |
| --- | --- | --- | --- |
| Viewer | Overview, signal list, trace, knowledge state, KPI, audit log. | None. | None. |
| Operator | Viewer permissions plus ticket, badcase, and handoff queues. | Update ticket status/PIC, update badcase status, save reviewed traces as eval cases. | None. |
| PM/Admin | Operator permissions plus evaluation, release, export, and configuration views. | Run eval, request export, promote/block/request release review, manage knowledge lifecycle. | Standard-risk release decisions. |
| Compliance | Viewer permissions plus high-risk release and policy audit context. | Add compliance review notes. | High-risk release, policy, and sensitive workflow approvals. |

Production APIs should derive actor and role from the authenticated session. Client-submitted `actor` fields are acceptable in seed mode only.

## Persistence Order

1. `audit_events`: append-only governance trail for trace review, eval, export, and release decisions.
2. `support_tickets` and `badcases`: operational queues that need durable status and owner changes.
3. `eval_cases`, `eval_runs`, and `eval_results`: replayable quality evidence and release gates.
4. `knowledge_documents` and `knowledge_chunks`: RAG lifecycle, citation policy, and snapshot lineage.
5. `support_signals`, `support_scenarios`, `conversation_messages`, and `trace_events`: normalized source data and retained post-reply trace.

## Signed Export Jobs

1. User opens export preview.
2. Backend returns sanitized headers, sample rows, row count, export scope, and privacy warnings.
3. User confirms export.
4. Backend creates an export job with actor, role, filters, expiry, and allowed fields.
5. Worker writes the CSV to temporary storage and returns a signed URL.
6. Download and expiry events are written to `audit_events`.

Signed URLs should expire quickly and should be scoped to the requesting role and export job ID.

## Sensitive Data Policy

| Surface | Allowed | Blocked |
| --- | --- | --- |
| Response Trace | Stable scenario IDs, message IDs, citation IDs, trace node names, non-sensitive summaries. | Raw account IDs, transaction IDs, KYC document IDs, account status, secrets, access tokens. |
| Ticket Center | Queue, priority, SLA, owner, sanitized case summary, next action. | Customer identifiers, financial balances, private documents, exact asset movement instructions. |
| Evaluation Export | Run-level metrics, release config IDs, aggregate counts, failure labels. | Raw user messages, private conversation text, customer identifiers, account or transaction state. |
| Audit Log | Actor role, event type, entity reference, sanitized title/detail, timestamp. | Raw payloads, credentials, private customer text, mutable audit edits. |
| Handoff Preview | Non-sensitive timeline, required field names, risk warning, destination queue. | Approval, override, refund, unlock, or asset movement decisions made by AI. |

When a field might contain private customer data, store a stable reference and render a sanitized summary instead of the raw value.

## Completion Criteria

- README, PRD, and backend contract agree on MVP, production hardening, and P2 integration scope.
- Auth / RBAC is documented before production APIs accept mutating operations.
- Audit events are append-only and queryable by event type, actor, and time range.
- CSV export uses backend signed jobs rather than frontend-only downloads.
- Automated tests cover language switching, mutable ticket state, release audit filtering, and display text localization.
