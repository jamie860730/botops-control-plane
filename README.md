# BotOps Control Plane

BotOps Control Plane is a general-purpose bot operations control plane for AI Chatbot PMs, CS Bot PMs, and Bot Ops teams who run customer support automation in high-risk, multi-language, multi-region service environments.

The product is not a first-line customer service reply console. It covers post-reply signal intake, retained response trace review, FAQ/SOP/RAG knowledge governance, CS Bot KPI review, evaluation, bot-created ticket flow, release decisions, and audit logging. The demo dataset ships as a crypto/fintech domain pack: terms such as KYC and Security-L2 are pack content, not platform features. The repository includes a local development data provider and a lightweight API server so the product can be run without private customer data or company-internal systems.

## Product Capabilities

- Multi-channel intake for Web/App Chat, X, LINE, Telegram, Discord, and Internal Report.
- Live interaction review for cross-border payment policy, account takeover, KYC, missing KB, and incident spike cases (demo domain pack scenarios).
- Chat + Trace review with stable message IDs, citations, and retained runtime events.
- FAQ / SOP / RAG knowledge management with table-first scanning, document lifecycle, chunk metadata, KB snapshot, index status, and highlighted citations.
- CS Bot KPI drilldown for auto-resolution, handoff, repeat contact, citation failure, SLA risk, and user case segments.
- Evaluation Center comparing current and proposed release configurations.
- Error Analysis with badcase attribution and retest metrics.
- Ticket Center for PM and Support Lead review of bot-created handoff flow, queue, owner, priority, SLA, AI case summary, and next action.
- Handoff Preview for high-risk support cases.
- Release Center with Promote / Block / Request review decisions based on visible release gates.
- Ops Log with local persistence for trace reviews, saved eval cases, evaluation runs, release decisions, and CSV exports.
- Local API server for signals, scenario review, knowledge, eval, release decisions, and audit events.
- English / Traditional Chinese UI switcher with persisted locale preference.

## Module Purpose

| Module | Product purpose | Review narrative |
| --- | --- | --- |
| Dashboard | Summarize CS Bot KPI, knowledge gaps, badcase trend, handoff risk, bot-created tickets, and release readiness. | Starts PMs from an operational control view. |
| Conversations | Monitor source signals and inspect delivered bot replies with retained trace, citations, retrieval, verification, and handoff decisions. | Provides post-reply accountability without becoming a first-line reply inbox. |
| Knowledge | Manage FAQ, SOP, and RAG documents with table-first scanning, query count, tags, index status, and citation chunks. | Explains how PMs and knowledge owners control answer grounding and coverage. |
| Tickets & Handoff | Track bot-created support cases by queue, priority, owner, SLA, summary, next action, and handoff package. | Makes the JD's ticket center requirement explicit as a PM governance view, not an agent reply console. |
| Quality & Release | Review CS Bot KPI drilldown, run evaluation, inspect badcases, decide release gates, and verify audit events. | Connects eval outcomes to accountable remediation and auditable release decisions. |

## Domain Pack Architecture

The platform separates generic capability from industry content (see [PRD v2.0](docs/prd.md), chapter 17):

- The platform layer is industry-neutral: modules, trace pipeline, evaluation, badcase loop, release gates, and audit log carry no domain vocabulary.
- The industry layer is a domain pack: a pure data module under `src/data/packs/` that supplies channels, queues, risk labels, scenario copy, and KB topics.
- There is no pack switcher in the UI. Switching industries means adding a new pack file, changing one import, and rebuilding.
- The shipped pack is crypto/fintech. KYC, Security-L2, Travel Rule, and similar terms belong to the pack, not the platform.

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

`npm run api` starts the local API (`server/server.mjs`) at `http://127.0.0.1:8787`. It is dependency-free, uses local development data, and exists to validate the backend contract in [docs/backend-api-contract.md](docs/backend-api-contract.md). The frontend currently reads seed data directly through `SeedBackendAdapter` and does not call this API at runtime.

## Operator Docs

- [PRD v2.0](docs/prd.md)
- [IA inventory](docs/ia-inventory.html) (three-level information architecture)
- [Admin user manual](docs/admin-user-manual.md)
- [Usability review](docs/usability-review.md)
- [Backend API contract](docs/backend-api-contract.md)
- [System integration spec](docs/system-integration-spec.md) — gap inventory and work packages for wiring channels, bot runtime, and company systems
- [Production readiness plan](docs/production-readiness-plan.md)
- [PRD improvement plan](docs/prd-improvement-plan.md)
- [Product demo script](docs/product-demo-script.md)

## Scope Alignment

The current repository is the MVP prototype described in the PRD:

- It includes the complete operator workflow from Dashboard through Quality & Release audit review.
- It is positioned for AI Chatbot PM / CS Bot PM / Bot Ops users, with Support Lead, Knowledge Owner, and Compliance as collaborators.
- It uses local seed data, shipped as a crypto/fintech domain pack, and a lightweight API server so no customer data or private systems are required.
- It keeps production concerns visible through API contracts, audit events, export preview, stable IDs, i18n, responsive layouts, and end-to-end tests.

The current repository intentionally does not include:

- Production database persistence.
- Auth / RBAC enforcement.
- Append-only backend audit storage.
- Backend signed export jobs.
- Live channel connectors, CRM adapters, LLM adapters, retrieval adapters, or async eval workers.
- SOP management as a standalone page.
- First-line customer service agent reply workflows.

## Roadmap

- Production hardening: DB schema, Auth / RBAC, append-only audit store, signed export jobs, and sensitive data masking.
- Product depth: operational dashboard scanning, SOP lifecycle, table-first knowledge/ticket management, richer ticket/error/audit filters, eval case detail, and release decision reason capture.
- v2.0 features: knowledge gap mining, agent assist governance, SOP management, flow version diff, judge calibration, and operating economics cards (see [PRD v2.0](docs/prd.md), chapter 18).
- System integration: channel connectors, Ticket/CRM adapters, model and retrieval adapters, async eval worker, and polling/subscription status.
