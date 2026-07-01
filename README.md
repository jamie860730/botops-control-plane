# BotOps Control Plane MVP

This is an MVP product for bot management in regulated customer support scenarios.

The current P0 version runs in seed-data mode, so the product can be reviewed without API keys, backend credentials, private customer data, or company-internal systems. It is designed to evolve into live bot execution, persistent eval runs, channel connectors, and ticket/CRM handoff integrations.

## What P0 Includes

- Multi-channel intake for Web/App Chat, X, LINE, Telegram, Discord, and Internal Report.
- Live interaction review for cross-border payment policy, account takeover, KYC, missing KB, and incident spike cases.
- Chat + Trace review with stable message IDs, citations, and retained runtime events.
- RAG knowledge management with document lifecycle, chunk metadata, KB snapshot, index status, and highlighted citations.
- Evaluation Center comparing v18 baseline and v19 candidate runs.
- Error Analysis with badcase attribution and retest metrics.
- Handoff Preview for high-risk support cases.
- Release Center with blocked unsafe release gates.
- Ops Log with local persistence for scenario runs, saved eval cases, eval runner actions, and CSV exports.

## Page Purpose

| Page | Product purpose | Demo narrative |
| --- | --- | --- |
| Intake | Monitor live support signals from Web/App Chat, X, LINE, Telegram, Discord, and internal reports after the bot has replied. | Shows the PM understands bot operations do not only happen inside one chat box. |
| Overview | Summarize quality gates, source distribution, and the full bot management workflow. | Use this as the opening map before walking through the product. |
| Chat + Trace | Review the live bot answer and retained trace: citations, retrieval, verification, and handoff decisions. | Proves the product manages bot behavior after real-time replies, not only conversation UI. |
| Knowledge | Manage RAG documents, chunks, snapshots, index status, and retrieval config. | Explains how PMs and knowledge owners control answer grounding. |
| Evaluation | Replay saved interactions against baseline and candidate flows, run offline eval, and export CSV. | Demonstrates measurable product iteration and release confidence. |
| Error Analysis | Convert failed eval rows into fixable badcases with owner and expected metric movement. | Shows the improvement loop from failure to product decision. |
| Handoff | Package high-risk cases for human queues with required fields and risk warnings. | Shows safety boundary and human escalation design. |
| Release Center | Block unsafe versions when release gates fail. | Connects eval metrics to launch decisions. |
| Ops Log | Persist key actions as an audit trail. | Shows governance and readiness for backend audit logging. |

## What P0 Does Not Claim

- No company-internal ticket data.
- No real customer data, transaction ID, user ID, KYC document, or account state.
- No production traffic, AB test, or real cost reduction claim.
- No live LLM dependency in P0.

## Commands

```bash
npm install
npm run dev
npm run build
npm run test
npm run test:e2e
```

`npm run test:e2e` builds the app first, then runs the Playwright desktop and mobile flow against the production preview.

## Operator Docs

- [Admin user manual](docs/admin-user-manual.md)
- [Usability review](docs/usability-review.md)

## Roadmap

- P0: Bot management MVP with deterministic workflow and E2E flow.
- P1: Local persistence, eval runner, CSV export, audit log.
- P2: Live Bot Mode with model adapter, retrieval adapter, trace logging, and fallback.
- P3: Channel connector and ticket/CRM handoff adapters.
