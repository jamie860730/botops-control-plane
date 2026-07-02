# BotOps Control Plane MVP

This is an MVP product for bot management in regulated customer support scenarios.

The current P0 version runs in seed-data mode, so the product can be reviewed without API keys, backend credentials, private customer data, or company-internal systems. It includes a lightweight local seed API server for backend contract validation, and is designed to evolve into live bot execution, persistent eval runs, channel connectors, and ticket/CRM handoff integrations.

## What P0 Includes

- Multi-channel intake for Web/App Chat, X, LINE, Telegram, Discord, and Internal Report.
- Live interaction review for cross-border payment policy, account takeover, KYC, missing KB, and incident spike cases.
- Chat + Trace review with stable message IDs, citations, and retained runtime events.
- RAG knowledge management with document lifecycle, chunk metadata, KB snapshot, index status, and highlighted citations.
- CS Bot KPI drilldown for auto-resolution, handoff, repeat contact, citation failure, SLA risk, and user case segments.
- Evaluation Center comparing v18 baseline and v19 candidate runs.
- Error Analysis with badcase attribution and retest metrics.
- Ticket Center with queue, owner, priority, SLA, AI case summary, and next action.
- Handoff Preview for high-risk support cases.
- Release Center with Promote / Block / Request review decisions based on visible release gates.
- Ops Log with local persistence for scenario runs, saved eval cases, eval runner actions, and CSV exports.
- Compact page intent headers so reviewers know the decision each page supports.
- Local seed API server for signals, scenario review, knowledge, eval, release decisions, and audit events.
- English / Traditional Chinese UI switcher with persisted locale preference.

## Page Purpose

| Page | Product purpose | Review narrative |
| --- | --- | --- |
| Signal Intake | Monitor live support signals from Web/App Chat, X, LINE, Telegram, Discord, and internal reports after the bot has replied. | Establishes multi-channel operational coverage. |
| Overview | Summarize quality gates, source distribution, and the full bot management workflow. | Defines the operating model before detailed review. |
| Response Trace | Review the live bot answer and retained trace: citations, retrieval, verification, and handoff decisions. | Provides post-reply accountability and traceability. |
| Knowledge | Manage RAG documents, chunks, snapshots, index status, and retrieval config. | Explains how PMs and knowledge owners control answer grounding. |
| CS Bot KPI | Review support impact metrics and the case clusters behind them. | Matches the JD requirement to review CS bot KPIs and user cases regularly. |
| Evaluation | Replay saved interactions against baseline and candidate flows, run offline eval, and export CSV. | Supports evidence-based release assessment. |
| Error Analysis | Convert failed eval rows into fixable badcases with owner and expected metric movement. | Links failures to accountable remediation work. |
| Ticket Center | Track bot-reviewed support cases by queue, priority, owner, SLA, summary, and next action. | Makes the JD's ticket center requirement explicit. |
| Handoff | Package high-risk cases for human queues with required fields and risk warnings. | Enforces escalation boundaries for sensitive cases. |
| Release Center | Promote, block, or request review based on visible release gates. | Connects eval outcomes to auditable release decisions. |
| Audit Log | Persist key actions as an audit trail. | Supports governance and backend audit logging readiness. |

## What P0 Does Not Claim

- No company-internal ticket data.
- No real customer data, transaction ID, user ID, KYC document, or account state.
- No production traffic, AB test, or real cost reduction claim.
- No live LLM dependency in P0.

## Commands

```bash
npm install
npm run dev
npm run api
npm run build
npm run test
npm run test:api
npm run test:e2e
```

`npm run test:e2e` builds the app first, then runs the Playwright desktop and mobile flow against the production preview.

`npm run api` starts the local seed API at `http://127.0.0.1:8787`. It is intentionally dependency-free and uses deterministic seed data only.

## Operator Docs

- [Admin user manual](docs/admin-user-manual.md)
- [Usability review](docs/usability-review.md)
- [Backend API contract](docs/backend-api-contract.md)

## Roadmap

- P0: Bot management MVP with deterministic workflow and E2E flow.
- P1: Local persistence, eval runner, CSV export, audit log, page intent guidance, and auditable release decisions.
- P2: CSV preview, Ops Log filters, Live Bot Mode with model adapter, retrieval adapter, trace logging, and fallback.
- P3: Channel connector and ticket/CRM handoff adapters.
