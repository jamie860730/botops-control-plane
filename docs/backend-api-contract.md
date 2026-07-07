# Backend API Contract

This document defines the backend shape required for BotOps Control Plane as a production service. The repo also includes a lightweight local API in `server/server.mjs`; it validates the API contract without requiring API keys, a database, or private customer data.

## Backend Responsibilities

- Ingest support signals from Web/App Chat, X, LINE, Telegram, Discord, and internal reports.
- Store delivered bot messages and retained trace events after the bot replies.
- Manage RAG documents, chunks, snapshots, index state, and retrieval configuration.
- Review CS bot KPI metrics and segment-level user case trends.
- Save reviewed interactions as eval cases.
- Run evaluation jobs against current and proposed release versions.
- Convert eval failures into badcases and release gates.
- Track support tickets with queue, owner, SLA, status, AI summary, and next action.
- Record release decisions and audit events.
- Export eval summaries without exposing customer identifiers or account data.

## Core Entities

| Entity | Purpose | Stable ID example |
| --- | --- | --- |
| `support_signal` | Raw or normalized inbound signal from a channel. | `sig_tg_transfer_policy_fr_001` |
| `support_scenario` | Reviewable case grouped from one or more support signals. | `scn_cross_border_payment_fr` |
| `conversation_message` | User, assistant, or system message already produced by the bot flow. | `msg_assistant_transfer_policy_fr_002` |
| `trace_event` | Retained runtime event for source normalization, retrieval, generation, verification, and handoff. | `evt_transfer_retrieval_004` |
| `knowledge_document` | Governed source document for RAG. | `doc_payment_policy_eu` |
| `knowledge_chunk` | Citeable retrieval unit attached to a document and snapshot. | `chunk_payment_policy_eu_001` |
| `cs_bot_kpi_metric` | Top-level support impact metric for bot operations. | `kpi_auto_resolution_rate` |
| `cs_bot_kpi_segment` | Segment drilldown by channel or case cluster. | `segment_web_security` |
| `eval_case` | Replayable quality test case generated from curated incidents or saved traces. | `eval_saved_scn_cross_border_payment_fr` |
| `eval_run` | Evaluation run for one version config against a dataset. | `run_v19_candidate` |
| `eval_result` | Per-case scoring output for an eval run. | `eval_result_v19_case_001` |
| `badcase` | Actionable failure analysis item with owner and expected metric movement. | `badcase_unsafe_handoff_002` |
| `support_ticket` | Human-operable ticket record created from a bot-reviewed case. | `ticket_sec_20260701_001` |
| `release_bundle` | Version bundle being promoted, blocked, or reviewed. | `rel_mvp_019` |
| `audit_event` | Append-only event for trace review, eval, export, and release decision actions. | `audit_release_decision_20260701113000` |

## API Endpoints

| Method | Path | Purpose |
| --- | --- | --- |
| `GET` | `/api/signals?source_channel=` | List support signals by channel. |
| `GET` | `/api/scenarios?source_channel=` | List reviewable scenarios by channel. |
| `GET` | `/api/scenarios/{scenario_id}/review` | Return scenario, delivered messages, and retained trace events. |
| `POST` | `/api/eval-cases` | Save a reviewed scenario or trace as an eval case. |
| `GET` | `/api/knowledge/documents` | List RAG documents with index and citation metadata. |
| `GET` | `/api/knowledge/chunks/{chunk_id}` | Fetch a citeable chunk from the active snapshot. |
| `GET` | `/api/kpis/cs-bot` | Return CS bot KPI cards and segment drilldowns. |
| `GET` | `/api/eval/runs` | List eval runs and version configs. |
| `POST` | `/api/eval/runs` | Start an evaluation job. |
| `GET` | `/api/eval/runs/{run_id}/results` | List per-case eval results. |
| `GET` | `/api/eval/export-preview` | Return sanitized export headers and rows for preview. |
| `POST` | `/api/eval/export-jobs` | Create a signed CSV export job. |
| `GET` | `/api/badcases` | List failed cases and remediation status. |
| `GET` | `/api/tickets?queue=&status=` | List support tickets by queue or status. |
| `GET` | `/api/handoff-preview/{scenario_id}` | Build a human handoff package for high-risk cases. |
| `GET` | `/api/release/bundles` | List release bundles and gate status. |
| `POST` | `/api/release/bundles/{bundle_id}/decisions` | Record `promoted`, `blocked`, or `review_requested`. |
| `GET` | `/api/audit-events?event_type=&actor=&created_from=&created_to=` | List audit events, optionally filtered by type, actor, or time range. |

## Local API

Run:

```bash
npm run api
```

Then open:

```text
http://127.0.0.1:8787/api/health
```

The server is dependency-free and backed by local development data in `server/seedData.mjs`. It is not a production database, auth layer, or live LLM adapter.

## Request / Response Examples

### Interaction Review

```http
GET /api/scenarios/scn_cross_border_payment_fr/review
```

```json
{
  "scenario": {
    "id": "scn_cross_border_payment_fr",
    "sourceChannel": "Telegram",
    "region": "FR",
    "riskTag": "Policy / Compliance"
  },
  "messages": [
    {
      "id": "msg_assistant_transfer_policy_fr_002",
      "role": "assistant",
      "citationIds": ["chunk_payment_policy_eu_001"],
      "createdAt": "2026-07-01T09:30:08.000Z"
    }
  ],
  "traceEvents": [
    {
      "id": "evt_transfer_retrieval_004",
      "eventType": "retrieval",
      "status": "pass",
      "outputRef": "chunk_payment_policy_eu_001"
    }
  ]
}
```

### Save Eval Case

```http
POST /api/eval-cases
Content-Type: application/json
```

```json
{
  "scenarioId": "scn_cross_border_payment_fr",
  "sourceTraceId": "trace_transfer_policy_fr_001",
  "createdBy": "pm_user_001",
  "expectedBehavior": "Explain general policy, cite EU/FR policy, avoid account-specific conclusions."
}
```

### Release Decision

```http
POST /api/release/bundles/rel_mvp_019/decisions
Content-Type: application/json
```

```json
{
  "decision": "promoted",
  "actor": "PM",
  "reason": "Visible release gates passed. Promote to canary review.",
  "evalRunId": "run_v19_candidate"
}
```

Response:

```json
{
  "bundleId": "rel_mvp_019",
  "decision": "promoted",
  "auditEventId": "audit_release_decision_20260701113000",
  "createdAt": "2026-07-01T11:30:00.000Z"
}
```

## Eval Runner Job Flow

1. PM saves one or more reviewed traces as eval cases.
2. PM starts `POST /api/eval/runs` with version config and dataset ID.
3. Backend creates an `eval_run` with `status=running`.
4. Eval worker replays each case against the selected flow, prompt, KB snapshot, and retrieval config.
5. Judge writes `eval_result` rows with dimension scores and failure labels.
6. Backend computes summary metrics and release gates.
7. UI polls `GET /api/eval/runs/{run_id}/results` or subscribes to job status.
8. PM opens CSV preview, then creates a signed export job.

## Audit Event Contract

Audit events should be append-only. They should not contain raw private customer text, account identifiers, transaction IDs, KYC files, or secrets.

```json
{
  "id": "audit_eval_runner_completed_20260701112620",
  "eventType": "eval_runner_completed",
  "actor": "System",
  "title": "Completed offline eval run",
  "detail": "Candidate passed citation support and handoff safety gates.",
  "entityRef": "run_v19_candidate",
  "createdAt": "2026-07-01T11:26:20.000Z"
}
```

Supported event types:

- `live_trace_review`
- `eval_case_saved`
- `eval_runner_started`
- `eval_runner_completed`
- `csv_exported`
- `release_decision`

## Storage Notes

| Table | Key columns | Notes |
| --- | --- | --- |
| `support_signals` | `id`, `source_channel`, `duplicate_cluster_id`, `created_at` | Channel adapters write here. |
| `support_scenarios` | `id`, `source_channel`, `risk_tag`, `region` | Can be generated from one or more signals. |
| `conversation_messages` | `id`, `scenario_id`, `role`, `created_at` | Message IDs must be stable and unique. |
| `trace_events` | `id`, `trace_id`, `scenario_id`, `event_type`, `status` | Used for replay, debugging, and audit. |
| `knowledge_documents` | `id`, `status`, `effective_from`, `vector_index` | Document lifecycle and ownership live here. |
| `knowledge_chunks` | `id`, `document_id`, `citation_allowed` | Retrieval units must map back to documents. |
| `cs_bot_kpi_metrics` | `id`, `value`, `target`, `status`, `trend` | Review-level support impact metrics. |
| `cs_bot_kpi_segments` | `id`, `source_channel`, `volume`, `repeat_contact_rate`, `sla_risk_count` | User case and channel drilldown. |
| `eval_cases` | `id`, `dataset_id`, `risk_tag`, `must_handoff` | Curated replay set. |
| `eval_runs` | `id`, `dataset_id`, `status`, `started_at` | Long-running job parent. |
| `eval_results` | `id`, `run_id`, `case_id`, `failure_label` | Per-case scoring output. |
| `support_tickets` | `id`, `scenario_id`, `queue`, `owner`, `status`, `sla_due_at` | Ticket center queue record. |
| `release_bundles` | `id`, `eval_run_id`, `status`, `regression_count` | Release gate subject. |
| `release_decisions` | `id`, `bundle_id`, `decision`, `actor`, `created_at` | Human decision log. |
| `audit_events` | `id`, `event_type`, `actor`, `entity_ref`, `created_at` | Append-only governance log. |

## Security / Privacy Boundaries

- Do not expose real user IDs, transaction IDs, KYC document IDs, or account status in UI exports.
- Keep raw channel payloads separate from normalized review data.
- Signed CSV exports should expire and be scoped to the requesting role.
- Release decisions must require an authenticated actor.
- High-risk account, security, or compliance cases must not be auto-resolved by the bot.

Production hardening details, RBAC scope, and masking rules are tracked in `docs/production-readiness-plan.md`.
