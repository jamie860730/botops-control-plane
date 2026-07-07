# Product Demo Script

This script is for a 5-7 minute interview walkthrough. It should stay outside the product UI so the formal operator interface remains clean.

## Opening Pitch

BotOps Control Plane is a management platform for AI Chatbot PMs, CS Bot PMs, and Bot Ops teams who own customer support bots in high-risk, multi-language, multi-region service environments.

The goal is not to show a first-line customer service reply console. The goal is to show how a PM or Bot Ops owner governs the full loop after a bot has already replied: post-reply signals, retained response trace, FAQ/SOP/RAG knowledge quality, offline evaluation, badcase repair, bot-created ticket flow, release gates, and audit history.

The cases in this walkthrough come from a demo domain pack built on crypto/fintech support scenarios. The platform itself is industry-neutral. Useful verbal mapping during the demo: the same high-risk pattern shows up as refund disputes in e-commerce and subscription billing disputes in SaaS.

## Demo Route

Use this route:

1. Dashboard
2. Conversations
3. Knowledge
4. Tickets & Handoff
5. Quality & Release

Primary case:

- `FR cross-border payment policy hold`

High-risk contrast case:

- `Account takeover with transfer on hold`

Both cases are demo domain pack scenarios. Introduce them as such, then map them to the interviewer's industry if useful.

## 5-7 Minute Walkthrough

### 0:00-0:40 — Dashboard

What to do:

- Start on `Dashboard`.
- Point to PM-readable metrics: reviewed interactions, auto-resolution quality, knowledge gaps, bot-created tickets, open badcases, release readiness.
- Point to release gates and top user cases.

Talk track:

This page gives the PM or Bot Ops manager a fast operational read: whether answer quality is passing, whether citations support the answers, whether high-risk cases are being handed off, and whether release risk is blocked.

The important product decision is that the platform starts from PM-readable bot operations metrics and operating queues, not from an agent reply inbox. That matches a real support automation workflow where the bot is already live and the PM needs to manage quality, knowledge coverage, handoff risk, and release readiness.

### 0:40-2:25 — Conversations

What to do:

- Open `Conversations`.
- Filter or point to `Telegram`.
- Open `FR cross-border payment policy hold`.
- Review the user message and bot answer.
- Point to citation support.
- Point to trace events: source normalization, intent, risk guard, retrieval, generation, verification.
- Open the citation chunk.
- Save trace as eval case.

Talk track:

Support issues can arrive from Web/App Chat, X, LINE, Telegram, Discord, and internal reports. The intake page normalizes those sources into reviewable scenarios for PM / Bot Ops governance.

Here I am selecting a Telegram signal about a French cross-border payment policy hold, one of the demo domain pack scenarios. The operator is not asking the bot to generate a new answer. They are opening the already-delivered reply and its retained trace.

This is the traceability layer. The operator can answer three questions: what did the bot say, what source supported it, and which internal steps led to that answer.

For regulated or high-risk support, this is more useful than a simple chat transcript. The retained trace shows retrieval output, verification status, and whether the system avoided account-specific conclusions.

I can save this reviewed interaction as an eval case, which turns real operational evidence into a repeatable release test.

### 2:25-3:10 — Knowledge

What to do:

- Open `Knowledge`.
- Point to table-first knowledge management: title, category, tags, query count, status, index status, action.
- Point to citation chunks.

Talk track:

This view borrows the scanability of a customer support knowledge table, but keeps the PM control plane depth. PMs and Knowledge Owners can find high-query, stale, or release-critical sources, then drill into chunks and citation readiness.

### 3:10-4:15 — Quality & Release

What to do:

- Open `Quality & Release`.
- Point to CS Bot KPI drilldown.
- Run evaluation.
- Open CSV preview.
- Point to privacy note.

Talk track:

The Evaluation Center compares current and proposed release configurations against the same approved cases. The release decision is not based only on subjective review.

The CSV preview intentionally contains run-level metrics only. It avoids customer identifiers, raw private messages, account state, KYC data, and transaction identifiers. In production this would become a backend signed export job with role checks and expiry.

### 4:15-4:55 — Error Analysis within Quality & Release

What to do:

- Show a badcase.
- Change status if needed.
- Open detail modal.

Talk track:

Failed eval rows become accountable repair tasks. Each badcase has a failure label, observed case, low-score dimension, trace diagnosis, owner, modification, and retest metric.

This is where PM work becomes operational: the team can decide whether to fix retrieval, risk guard, source normalization, handoff logic, or knowledge content.

### 4:55-5:35 — Tickets & Handoff

What to do:

- Open `Tickets & Handoff`.
- Point to table-first ticket flow: ticket ID, problem, queue, priority, SLA, status, PIC.
- Change status and PIC.
- Point to human handoff preview.

Talk track:

The Ticket Center connects bot review to human support operations. It is not where an agent replies to every customer. It helps the PM and Support Lead understand which bot-created cases are consuming human queues, with ownership, SLA, status, PIC, case summary, and next action.

Status and PIC changes remain visible after navigation in this local prototype. In production, this would be backed by durable ticket persistence or a CRM adapter.

### 5:35-6:20 — Release and Audit within Quality & Release

What to do:

- Return to `Quality & Release`.
- Point to release gates.
- Add decision reason.
- Promote the passing package.
- Block the unsafe package.
- Filter Audit Log by `Release decision`.

Talk track:

The Release Center ties eval outcomes to release decisions. A package can be promoted only when required gates pass. The unsafe package is blocked because handoff safety and high-risk auto-answer gates fail.

Each decision requires a reason so the release trail has human context, not just a button click. In production this action would require an authenticated actor and would write to an append-only audit store.

The audit log closes the governance loop. Trace review, saved eval cases, eval runs, CSV export, and release decisions are recorded as events.

This is still local persistence in the prototype, but the backend contract defines the production direction: append-only audit events queryable by event type, actor, and time range.

### 6:20-7:00 — Close

Talk track:

The main product point is that customer support bot quality takes more than prompt editing. It needs knowledge governance, trace review, eval, ticket operations, release gates, and auditability.

This prototype shows the full PM operating loop with privacy-safe seed data, stable IDs, API contracts, responsive UI, English/Traditional Chinese localization, and automated tests. The scenarios come from a swappable demo domain pack, so the same platform applies to other high-risk support domains.

## 3 Minute Version

Use this if time is short:

1. `Dashboard`: show quality gates and operational queues.
2. `Conversations`: show a delivered bot answer, citation, retained trace, and saved eval case.
3. `Knowledge`: show table-first knowledge coverage and citation chunks.
4. `Tickets & Handoff`: show bot-created ticket pressure and handoff package.
5. `Quality & Release`: run eval, inspect badcases, make release decision, and verify audit trail.

Short close:

This is a control plane for managing live support automation quality. It turns real interactions into eval cases, converts failures into repair work, and prevents unsafe releases through gates and audit logs.

## Likely Follow-up Questions

### Is this platform specific to crypto?

No. The platform layer (trace review, knowledge governance, evaluation, badcase repair, release gates, audit) is industry-neutral. The crypto/fintech content is a demo domain pack: a pure data module under `src/data/packs/`. Switching industries means writing a new pack file, not changing the platform. The same high-risk pattern appears as refund disputes in e-commerce or subscription billing disputes in SaaS.

### Why not show a normal chatbot UI?

Because the target user is an AI Chatbot PM, CS Bot PM, or Bot Ops manager. Support Lead, Knowledge Owner, and Compliance are collaborators. Their job is not to reply to every customer from this console; it is to govern bot quality after the bot has replied in production.

### What would be first in production?

Auth / RBAC, production DB schema, append-only audit events, durable ticket/badcase state, and backend signed export jobs.

### How do you avoid leaking sensitive data?

The prototype uses seed data only. The production plan blocks raw user IDs, transaction IDs, KYC document IDs, account status, private message text, and secrets from trace views, exports, and audit logs. Sensitive values should be represented by stable references and sanitized summaries.

### How does this connect to RAG?

Knowledge Governance manages document lifecycle, chunks, KB snapshots, index status, retrieval config, and citation policy. Response Trace shows which chunk supported the answer. Evaluation checks whether the release configuration still produces supported answers.

### What is the release gate logic?

A release package must meet citation support, handoff safety recall, high-risk auto-answer, and regression thresholds. If gates fail, the package cannot be promoted.

### What is still prototype-only?

The current repository uses local seed data, localStorage for some operational state, and a lightweight API server. It does not yet include production DB persistence, Auth / RBAC enforcement, live source connectors, CRM adapters, LLM adapters, retrieval adapters, or async eval workers.
