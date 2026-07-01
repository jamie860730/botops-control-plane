import { createServer } from 'node:http';
import { fileURLToPath } from 'node:url';
import {
  auditEvents,
  conversationMessages,
  evalCases,
  evalResults,
  evalRuns,
  handoffPreviews,
  knowledgeDocuments,
  releaseBundles,
  scenarios,
  supportSignals,
  traceEvents
} from './seedData.mjs';

const jsonHeaders = {
  'access-control-allow-origin': '*',
  'access-control-allow-methods': 'GET,POST,OPTIONS',
  'access-control-allow-headers': 'content-type',
  'content-type': 'application/json; charset=utf-8'
};

export function createBotOpsApiServer() {
  return createServer(async (request, response) => {
    const url = new URL(request.url ?? '/', 'http://127.0.0.1');

    if (request.method === 'OPTIONS') {
      response.writeHead(204, jsonHeaders);
      response.end();
      return;
    }

    try {
      const result = await routeRequest(request, url);
      sendJson(response, result.status ?? 200, result.body);
    } catch (error) {
      sendJson(response, 500, {
        error: 'internal_server_error',
        detail: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });
}

async function routeRequest(request, url) {
  if (request.method === 'GET' && url.pathname === '/api/health') {
    return { body: { status: 'ok', mode: 'seed-api' } };
  }

  if (request.method === 'GET' && url.pathname === '/api/signals') {
    const sourceChannel = url.searchParams.get('source_channel');
    return {
      body: sourceChannel ? supportSignals.filter((signal) => signal.sourceChannel === sourceChannel) : supportSignals
    };
  }

  if (request.method === 'GET' && url.pathname === '/api/scenarios') {
    const sourceChannel = url.searchParams.get('source_channel');
    return {
      body: sourceChannel ? scenarios.filter((scenario) => scenario.sourceChannel === sourceChannel) : scenarios
    };
  }

  const scenarioReviewMatch = url.pathname.match(/^\/api\/scenarios\/([^/]+)\/review$/);
  if (request.method === 'GET' && scenarioReviewMatch) {
    const scenarioId = scenarioReviewMatch[1];
    const scenario = scenarios.find((item) => item.id === scenarioId);
    if (!scenario) {
      return { status: 404, body: { error: 'scenario_not_found' } };
    }
    return {
      body: {
        scenario,
        messages: conversationMessages.filter((message) => message.scenarioId === scenario.id),
        traceEvents: traceEvents.filter((event) => event.scenarioId === scenario.id)
      }
    };
  }

  if (request.method === 'GET' && url.pathname === '/api/knowledge/documents') {
    return { body: knowledgeDocuments };
  }

  const chunkMatch = url.pathname.match(/^\/api\/knowledge\/chunks\/([^/]+)$/);
  if (request.method === 'GET' && chunkMatch) {
    const chunkId = chunkMatch[1];
    const chunk = knowledgeDocuments.flatMap((document) => document.chunks).find((item) => item.id === chunkId);
    return chunk ? { body: chunk } : { status: 404, body: { error: 'chunk_not_found' } };
  }

  if (request.method === 'GET' && url.pathname === '/api/eval/runs') {
    return { body: evalRuns };
  }

  if (request.method === 'POST' && url.pathname === '/api/eval/runs') {
    const body = await readJson(request);
    const runId = body.runId ?? 'run_v19_candidate';
    auditEvents.unshift({
      id: `audit_eval_runner_started_${Date.now()}`,
      eventType: 'eval_runner_started',
      actor: 'Bot Ops',
      title: 'Started offline eval run',
      detail: `Started seed-mode eval run ${runId}.`,
      entityRef: runId,
      createdAt: new Date().toISOString()
    });
    return { status: 201, body: { runId, status: 'completed' } };
  }

  const evalResultsMatch = url.pathname.match(/^\/api\/eval\/runs\/([^/]+)\/results$/);
  if (request.method === 'GET' && evalResultsMatch) {
    const runId = evalResultsMatch[1];
    return { body: evalResults.filter((result) => result.runId === runId) };
  }

  if (request.method === 'GET' && url.pathname === '/api/eval/export-preview') {
    return {
      body: {
        header: [
          'run_id',
          'run_label',
          'overall_quality',
          'citation_support',
          'handoff_safety_recall',
          'high_risk_auto_answer',
          'regression_count',
          'eval_case_count'
        ],
        rows: evalRuns.map((run) => {
          const result = evalResults.find((item) => item.runId === run.id);
          return [
            run.id,
            run.label,
            String(result?.overallQualityScore ?? ''),
            String(result?.citationSupportRate ?? ''),
            String(result?.handoffSafetyRecall ?? ''),
            String(result?.highRiskAutoAnswerRate ?? ''),
            String(result?.regressionCount ?? ''),
            String(evalCases.length)
          ];
        })
      }
    };
  }

  if (request.method === 'POST' && url.pathname === '/api/eval-cases') {
    const body = await readJson(request);
    const evalCaseId = `eval_saved_${body.scenarioId ?? 'unknown'}`;
    auditEvents.unshift({
      id: `audit_eval_case_saved_${Date.now()}`,
      eventType: 'eval_case_saved',
      actor: 'PM',
      title: 'Saved conversation as eval case',
      detail: `Saved ${body.scenarioId} as replayable eval case.`,
      entityRef: evalCaseId,
      createdAt: new Date().toISOString()
    });
    return { status: 201, body: { id: evalCaseId } };
  }

  if (request.method === 'GET' && url.pathname === '/api/release/bundles') {
    return { body: releaseBundles };
  }

  const releaseDecisionMatch = url.pathname.match(/^\/api\/release\/bundles\/([^/]+)\/decisions$/);
  if (request.method === 'POST' && releaseDecisionMatch) {
    const bundleId = releaseDecisionMatch[1];
    const body = await readJson(request);
    const bundle = releaseBundles.find((item) => item.id === bundleId);
    if (!bundle) {
      return { status: 404, body: { error: 'bundle_not_found' } };
    }
    const auditEvent = {
      id: `audit_release_decision_${Date.now()}`,
      eventType: 'release_decision',
      actor: body.actor ?? 'PM',
      title: `Release decision: ${body.decision}`,
      detail: body.reason ?? `${bundle.label} decision recorded.`,
      entityRef: bundle.id,
      createdAt: new Date().toISOString()
    };
    auditEvents.unshift(auditEvent);
    return {
      status: 201,
      body: {
        bundleId,
        decision: body.decision,
        auditEventId: auditEvent.id,
        createdAt: auditEvent.createdAt
      }
    };
  }

  const handoffMatch = url.pathname.match(/^\/api\/handoff-preview\/([^/]+)$/);
  if (request.method === 'GET' && handoffMatch) {
    const scenarioId = handoffMatch[1];
    const preview = handoffPreviews.find((item) => item.scenarioId === scenarioId);
    return preview ? { body: preview } : { status: 404, body: { error: 'handoff_not_found' } };
  }

  if (request.method === 'GET' && url.pathname === '/api/audit-events') {
    const eventType = url.searchParams.get('event_type');
    return { body: eventType ? auditEvents.filter((event) => event.eventType === eventType) : auditEvents };
  }

  return { status: 404, body: { error: 'not_found' } };
}

function sendJson(response, status, body) {
  response.writeHead(status, jsonHeaders);
  response.end(JSON.stringify(body, null, 2));
}

async function readJson(request) {
  const chunks = [];
  for await (const chunk of request) {
    chunks.push(chunk);
  }
  const raw = Buffer.concat(chunks).toString('utf8');
  return raw ? JSON.parse(raw) : {};
}

if (fileURLToPath(import.meta.url) === process.argv[1]) {
  const port = Number(process.env.BOTOPS_API_PORT ?? 8787);
  createBotOpsApiServer().listen(port, '127.0.0.1', () => {
    console.log(`BotOps API listening on http://127.0.0.1:${port}`);
  });
}
