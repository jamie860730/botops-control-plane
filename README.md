# BotOps Control Plane

BotOps Control Plane is a bot management platform for regulated customer support operations.

The product covers post-reply signal intake, retained response trace review, RAG knowledge governance, evaluation, ticket operations, release decisions, and audit logging. The repository includes a local development data provider and a lightweight API server so the product can be run without private customer data or company-internal systems.

## Product Capabilities

- Multi-channel intake for Web/App Chat, X, LINE, Telegram, Discord, and Internal Report.
- Live interaction review for cross-border payment policy, account takeover, KYC, missing KB, and incident spike cases.
- Chat + Trace review with stable message IDs, citations, and retained runtime events.
- RAG knowledge management with document lifecycle, chunk metadata, KB snapshot, index status, and highlighted citations.
- CS Bot KPI drilldown for auto-resolution, handoff, repeat contact, citation failure, SLA risk, and user case segments.
- Evaluation Center comparing current and proposed release configurations.
- Error Analysis with badcase attribution and retest metrics.
- Ticket Center with queue, owner, priority, SLA, AI case summary, and next action.
- Handoff Preview for high-risk support cases.
- Release Center with Promote / Block / Request review decisions based on visible release gates.
- Ops Log with local persistence for trace reviews, saved eval cases, evaluation runs, release decisions, and CSV exports.
- Local API server for signals, scenario review, knowledge, eval, release decisions, and audit events.
- English / Traditional Chinese UI switcher with persisted locale preference.

## Page Purpose

| Page | Product purpose | Review narrative |
| --- | --- | --- |
| Signal Intake | Monitor live support signals from Web/App Chat, X, LINE, Telegram, Discord, and internal reports after the bot has replied. | Establishes multi-channel operational coverage. |
| Overview | Summarize quality gates, source distribution, operational queues, and release risk. | Starts operators from a real dashboard rather than a walkthrough. |
| Response Trace | Review the live bot answer and retained trace: citations, retrieval, verification, and handoff decisions. | Provides post-reply accountability and traceability. |
| Knowledge | Manage RAG documents, chunks, snapshots, index status, and retrieval config. | Explains how PMs and knowledge owners control answer grounding. |
| CS Bot KPI | Review support impact metrics and the case clusters behind them. | Matches the JD requirement to review CS bot KPIs and user cases regularly. |
| Evaluation | Replay saved interactions against versioned release configurations and export CSV. | Supports evidence-based release assessment. |
| Error Analysis | Convert failed eval rows into fixable badcases with owner and expected metric movement. | Links failures to accountable remediation work. |
| Ticket Center | Track bot-reviewed support cases by queue, priority, owner, SLA, summary, and next action. | Makes the JD's ticket center requirement explicit. |
| Handoff | Package high-risk cases for human queues with required fields and risk warnings. | Enforces escalation boundaries for sensitive cases. |
| Release Center | Promote, block, or request review based on visible release gates. | Connects eval outcomes to auditable release decisions. |
| Audit Log | Persist key actions as an audit trail. | Supports governance and backend audit logging. |

## Local Development Scope

- No company-internal ticket data.
- No real customer data, transaction ID, user ID, KYC document, or account state.
- No production traffic or AB test data in this repository.
- Live channel connectors, ticket/CRM integrations, and production LLM adapters are represented by interfaces and planned integration points.

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

`npm run api` starts the local API at `http://127.0.0.1:8787`. It is dependency-free and uses local development data.

## Operator Docs

- [Admin user manual](docs/admin-user-manual.md)
- [Usability review](docs/usability-review.md)
- [Backend API contract](docs/backend-api-contract.md)

## Roadmap

- Production data persistence, auth, RBAC, and organization-level audit trails.
- Live channel connectors for Web/App Chat, X, LINE, Telegram, Discord, and internal reports.
- Ticket/CRM handoff adapters with queue ownership and SLA synchronization.
- Live bot execution with model adapter, retrieval adapter, trace logging, and fallback controls.
