# PRD Improvement Plan

This plan captures the corrected product positioning after comparing BotOps Control Plane with the Coze-generated SmartCS reference.

## Positioning Correction

BotOps Control Plane is for AI Chatbot PMs, CS Bot PMs, and Bot Ops teams. It is not a first-line customer service reply console.

The interface should help PMs answer:

- Is the bot improving customer support outcomes?
- Which user cases, knowledge gaps, or handoff rules need product work?
- Which bot-created tickets are consuming human support capacity?
- Which release configuration is safe to promote?
- Can every important decision be traced through eval and audit evidence?

## What To Learn From SmartCS

SmartCS is easier to scan because it uses familiar customer support management patterns:

- KPI cards with plain business terms.
- Table-first knowledge management.
- Table-first ticket management.
- Clear page titles and one obvious purpose per page.
- A conversation simulator that immediately communicates "customer support bot".

These are useful interaction patterns, but SmartCS is closer to a customer support admin console. BotOps should borrow the clarity, not the product role.

## What Not To Copy

- Do not turn BotOps into a first-line customer service inbox.
- Do not make live chat the center of the product.
- Do not reduce knowledge management to FAQ CRUD only.
- Do not remove trace, eval, release gate, or audit depth.
- Do not make ticket management look like the final work destination for agents; it is a PM governance and coordination view.

## Required PRD Changes

### 1. Information Architecture

Move toward five PM-oriented modules:

1. `Dashboard`: Priority Queue, CS Bot KPI, automation health, knowledge gap, badcase trend, handoff risk, release readiness.
2. `Conversations`: source signals, simulation, post-reply review, retained response trace.
3. `Knowledge`: FAQ / SOP / RAG sources, tags, query counts, lifecycle, index state, citation chunks.
4. `Tickets & Handoff`: bot-created ticket flow, queue ownership, SLA risk, handoff package.
5. `Quality & Release`: Release Gates, KPI, Eval Runs, Badcases, Audit as progressive-disclosure tabs.

### 2. Dashboard

Add a Priority Queue before operational metrics:

- Blocked release package.
- SLA ticket risk.
- Knowledge re-index item.
- Open badcase or trace review.
- Each item needs severity, owner, due, short reason, and a CTA.

Then show operational metrics:

- Total Conversations / Reviewed Interactions.
- Auto-resolution Quality.
- Handoff / Ticket Conversion.
- Knowledge Base Size.
- Active Bot-created Tickets.
- Top Questions / Repeat Contact.
- Knowledge Gap Count.
- Badcase Trend.
- Release Readiness.

Quality gates should remain visible, but they should explain release readiness rather than dominate the first screen.

### 3. Knowledge

Use a table-first knowledge management view:

- ID.
- Question / Title.
- Category.
- Tags.
- Query Count.
- Status.
- Owner.
- Last Updated.
- Index Status.
- Actions: edit, archive, re-index, view chunks.

RAG chunks, snapshots, citation policy, and retrieval config should appear in detail views.

Detail requirements:

- Knowledge record detail: owner, language, effective date, vector index, retrieval config, last indexed, version history.
- Action feedback: Open chunks, Review citation scope, Queue re-index must produce visible status feedback.

### 4. Tickets

Use a table-first ticket flow view:

- Ticket ID.
- Problem / Case Type.
- Source.
- Priority.
- Status.
- Queue.
- PIC.
- SLA.
- Created Time.
- Action.

Use a drawer or modal for AI summary, next action, handoff reason, risk warning, and trace reference.

Detail requirements:

- Ticket detail: queue, status, PIC, SLA, source signals, trace reference, case summary, next action.
- Timeline: bot routed case, queue intake confirmed, SLA checkpoint.
- Status / PIC changes must produce visible feedback.

### 4.1 Quality & Release

Replace the long stacked page with tabs:

1. `Release Gates` as the default tab.
2. `KPI`.
3. `Eval Runs`.
4. `Badcases`.
5. `Audit`.

This keeps release readiness visible first and makes deep evaluation/audit views available without overwhelming the first screen.

### 5. Conversation Review

Conversation UI is allowed only if positioned as:

- QA review mode.
- A source for eval cases.
- A path into retained trace review.

It should not be positioned as the production customer service reply surface.

### 6. Next-layer Detail Standard

Every detail panel, drawer, or modal should answer:

- What happened.
- Why it matters.
- What should I do next.

Implemented first batch:

- Dashboard queue detail.
- Knowledge record detail and version history.
- Ticket detail and timeline.
- Eval run detail.
- Audit event detail.

Next batch:

- Conversation trace event drawer.
- Knowledge chunk job log.
- Release approval history.

### 7. Responsive Design

Mobile tables should not depend on horizontal scrolling as the primary interaction. Dashboard, Knowledge, Ticket, and Eval tables should reflow into card-style label/value rows.

## Success Criteria

- A new viewer understands within 30 seconds that this is a bot PM operations control plane.
- PMs can identify the next improvement area from the dashboard without reading documentation.
- Knowledge Owners can find high-query or stale knowledge from a table.
- Support Leads can understand bot-created handoff pressure without using the product as a helpdesk.
- Release decisions remain backed by eval gates and audit history.
