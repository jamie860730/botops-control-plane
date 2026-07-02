import { after, before, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { createBotOpsApiServer } from './server.mjs';

let server;
let baseUrl;

describe('BotOps seed API server', () => {
  before(async () => {
    server = createBotOpsApiServer();
    await new Promise((resolve) => {
      server.listen(0, '127.0.0.1', () => {
        const address = server.address();
        baseUrl = `http://127.0.0.1:${address.port}`;
        resolve();
      });
    });
  });

  after(async () => {
    await new Promise((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
    });
  });

  it('lists support signals by source channel', async () => {
    const response = await fetch(`${baseUrl}/api/signals?source_channel=Telegram`);
    const body = await response.json();

    assert.equal(response.status, 200);
    assert.equal(body.length, 1);
    assert.equal(body[0].id, 'sig_tg_transfer_policy_fr_001');
  });

  it('returns delivered messages and retained trace for scenario review', async () => {
    const response = await fetch(`${baseUrl}/api/scenarios/scn_cross_border_payment_fr/review`);
    const body = await response.json();

    assert.equal(response.status, 200);
    assert.equal(body.scenario.id, 'scn_cross_border_payment_fr');
    assert.ok(body.messages.some((message) => message.role === 'assistant'));
    assert.ok(body.traceEvents.some((event) => event.eventType === 'retrieval'));
  });

  it('records auditable release decisions', async () => {
    const response = await fetch(`${baseUrl}/api/release/bundles/rel_mvp_019/decisions`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        decision: 'promoted',
        actor: 'PM',
        reason: 'Visible gates passed.'
      })
    });
    const body = await response.json();

    assert.equal(response.status, 201);
    assert.equal(body.bundleId, 'rel_mvp_019');
    assert.match(body.auditEventId, /^audit_release_decision_/);
  });

  it('lists ticket center queue records', async () => {
    const response = await fetch(`${baseUrl}/api/tickets?queue=Security-L2`);
    const body = await response.json();

    assert.equal(response.status, 200);
    assert.equal(body.length, 1);
    assert.equal(body[0].id, 'ticket_sec_20260701_001');
    assert.equal(body[0].status, 'Escalated');
  });

  it('returns CS bot KPI metrics and segment drilldowns', async () => {
    const response = await fetch(`${baseUrl}/api/kpis/cs-bot`);
    const body = await response.json();

    assert.equal(response.status, 200);
    assert.ok(body.metrics.some((metric) => metric.id === 'kpi_auto_resolution_rate'));
    assert.ok(body.segments.some((segment) => segment.id === 'segment_web_security'));
  });
});
