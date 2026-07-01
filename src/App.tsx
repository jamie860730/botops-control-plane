import { useEffect, useMemo, useState } from 'react';
import { seedData } from './data/seedData';
import { SeedBackendAdapter } from './services/seedBackendAdapter';
import type { AuditEvent, SourceChannel } from './types';
import { ChatPlayground } from './components/ChatPlayground';
import { ErrorAnalysis } from './components/ErrorAnalysis';
import { EvaluationCenter } from './components/EvaluationCenter';
import { HandoffPreview } from './components/HandoffPreview';
import { Intake } from './components/Intake';
import { KnowledgeBase } from './components/KnowledgeBase';
import { OpsLog } from './components/OpsLog';
import { OverviewDashboard } from './components/OverviewDashboard';
import { ReleaseCenter, type ReleaseDecision } from './components/ReleaseCenter';
import { Shell, type ViewKey } from './components/Shell';
import { buildEvalSummaryCsv } from './utils/export';
import type { Locale } from './i18n';

const defaultScenarioId = 'scn_cross_border_payment_fr';
const savedEvalCaseStorageKey = 'botops.savedEvalCaseId';
const auditEventsStorageKey = 'botops.auditEvents';
const localeStorageKey = 'botops.locale';

const initialAuditEvents: AuditEvent[] = [
  {
    id: 'audit_bootstrap_p0_seed_review',
    eventType: 'eval_runner_completed',
    actor: 'System',
    title: 'P0 seed dataset loaded',
    detail: 'Loaded deterministic support signals, traces, eval runs, badcases, and release bundles.',
    entityRef: 'dataset_policy_support_seed_v1',
    createdAt: '2026-07-01T09:00:00.000Z'
  }
];

export function App() {
  const backend = useMemo(() => new SeedBackendAdapter(), []);
  const [activeView, setActiveView] = useState<ViewKey>('intake');
  const [sourceFilter, setSourceFilter] = useState<SourceChannel | 'All'>('All');
  const [selectedScenarioId, setSelectedScenarioId] = useState(defaultScenarioId);
  const [highlightedChunkId, setHighlightedChunkId] = useState('chunk_payment_policy_eu_001');
  const [savedEvalCaseId, setSavedEvalCaseId] = useState<string | null>(() =>
    window.localStorage.getItem(savedEvalCaseStorageKey)
  );
  const [auditEvents, setAuditEvents] = useState<AuditEvent[]>(() => readPersistedAuditEvents());
  const [evalRunnerStatus, setEvalRunnerStatus] = useState('Idle');
  const [locale, setLocale] = useState<Locale>(() => readPersistedLocale());

  const interactionReview = backend.getInteractionReview(selectedScenarioId);
  const sourceChannel = sourceFilter === 'All' ? undefined : sourceFilter;

  useEffect(() => {
    if (savedEvalCaseId) {
      window.localStorage.setItem(savedEvalCaseStorageKey, savedEvalCaseId);
    }
  }, [savedEvalCaseId]);

  useEffect(() => {
    window.localStorage.setItem(auditEventsStorageKey, JSON.stringify(auditEvents));
  }, [auditEvents]);

  useEffect(() => {
    window.localStorage.setItem(localeStorageKey, locale);
  }, [locale]);

  function reviewLiveInteraction(id: string) {
    setSelectedScenarioId(id);
    setActiveView('chat');
    const review = backend.getInteractionReview(id);
    const retrievalEvent = review.traceEvents.find((event) => event.eventType === 'retrieval');
    if (retrievalEvent) {
      setHighlightedChunkId(retrievalEvent.outputRef);
    }
    appendAuditEvent({
      eventType: 'live_trace_review',
      actor: 'PM',
      title: `Reviewed live bot trace for ${review.scenario.title}`,
      detail: `Opened the already-answered customer interaction with source ${review.scenario.sourceChannel}, risk ${review.scenario.riskTag}, region ${review.scenario.region}.`,
      entityRef: review.scenario.id
    });
  }

  function saveAsEvalCase() {
    const id = backend.saveConversationAsEvalCase(selectedScenarioId);
    setSavedEvalCaseId(id);
    appendAuditEvent({
      eventType: 'eval_case_saved',
      actor: 'PM',
      title: 'Saved conversation as eval case',
      detail: 'Captured messages, citations, trace events, source channel, risk tag, and expected behavior.',
      entityRef: id
    });
  }

  function runOfflineEval() {
    setEvalRunnerStatus('Completed');
    appendAuditEvent({
      eventType: 'eval_runner_started',
      actor: 'Bot Ops',
      title: 'Started offline eval run',
      detail: 'Compared baseline and candidate against the same deterministic eval dataset.',
      entityRef: 'run_v19_candidate'
    });
    appendAuditEvent({
      eventType: 'eval_runner_completed',
      actor: 'System',
      title: 'Completed offline eval run',
      detail: 'Candidate passed citation support and handoff safety gates; unsafe baseline remains blocked.',
      entityRef: 'run_v19_candidate'
    });
  }

  function exportEvalCsv() {
    const csv = buildEvalSummaryCsv(seedData.evalRuns, backend.listEvalResults(), backend.listEvalCases());
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'botops-eval-summary.csv';
    anchor.click();
    URL.revokeObjectURL(url);
    appendAuditEvent({
      eventType: 'csv_exported',
      actor: 'PM',
      title: 'Exported eval summary CSV',
      detail: 'Downloaded run-level eval summary for stakeholder review.',
      entityRef: 'botops-eval-summary.csv'
    });
  }

  function changeView(view: ViewKey) {
    if (view === 'intake') {
      setSourceFilter('All');
    }
    setActiveView(view);
  }

  return (
    <Shell activeView={activeView} locale={locale} onLocaleChange={setLocale} onViewChange={changeView}>
      {activeView === 'intake' && (
        <Intake
          locale={locale}
          selectedSource={sourceFilter}
          signals={backend.listSignals({ sourceChannel })}
          scenarios={backend.listScenarios({ sourceChannel })}
          onSourceChange={setSourceFilter}
          onReviewInteraction={reviewLiveInteraction}
        />
      )}
      {activeView === 'overview' && <OverviewDashboard data={seedData} locale={locale} />}
      {activeView === 'chat' && (
        <ChatPlayground
          documents={backend.listDocuments()}
          highlightedChunkId={highlightedChunkId}
          locale={locale}
          onHighlightChunk={setHighlightedChunkId}
          onSaveEvalCase={saveAsEvalCase}
          review={interactionReview}
          savedEvalCaseId={savedEvalCaseId}
        />
      )}
      {activeView === 'knowledge' && (
        <KnowledgeBase documents={backend.listDocuments()} highlightedChunkId={highlightedChunkId} locale={locale} />
      )}
      {activeView === 'evaluation' && (
        <EvaluationCenter
          evalCases={backend.listEvalCases()}
          evalResults={backend.listEvalResults()}
          evalRuns={seedData.evalRuns}
          evalRunnerStatus={evalRunnerStatus}
          locale={locale}
          onExportCsv={exportEvalCsv}
          onRunEval={runOfflineEval}
          savedEvalCaseId={savedEvalCaseId}
        />
      )}
      {activeView === 'errors' && <ErrorAnalysis badcases={backend.listBadcases()} locale={locale} />}
      {activeView === 'handoff' && (
        <HandoffPreview
          locale={locale}
          preview={
            backend.getHandoffPreview(selectedScenarioId) ??
            backend.getHandoffPreview('scn_account_takeover_locked_transfer')
          }
        />
      )}
      {activeView === 'release' && (
        <ReleaseCenter
          bundles={backend.listReleaseBundles()}
          evalResults={backend.listEvalResults()}
          locale={locale}
          onReleaseDecision={(bundle, decision) =>
            appendAuditEvent({
              eventType: 'release_decision',
              actor: 'PM',
              title: releaseDecisionTitle(decision),
              detail: releaseDecisionDetail(bundle.label, decision),
              entityRef: bundle.id
            })
          }
        />
      )}
      {activeView === 'opsLog' && <OpsLog events={auditEvents} locale={locale} />}
    </Shell>
  );

  function appendAuditEvent(event: Omit<AuditEvent, 'id' | 'createdAt'>) {
    const createdAt = new Date().toISOString();
    setAuditEvents((events) => [
      {
        ...event,
        id: `audit_${event.eventType}_${createdAt.replace(/[-:.TZ]/g, '')}`,
        createdAt
      },
      ...events
    ]);
  }
}

function releaseDecisionTitle(decision: ReleaseDecision) {
  if (decision === 'promoted') {
    return 'Promoted release bundle';
  }
  if (decision === 'review_requested') {
    return 'Requested release review';
  }
  return 'Blocked release bundle';
}

function releaseDecisionDetail(bundleLabel: string, decision: ReleaseDecision) {
  if (decision === 'promoted') {
    return `${bundleLabel} was promoted to canary review after visible release gates passed.`;
  }
  if (decision === 'review_requested') {
    return `${bundleLabel} was sent for stakeholder review before any rollout decision.`;
  }
  return `${bundleLabel} remains blocked and unavailable for rollout until release gates are corrected.`;
}

function readPersistedAuditEvents(): AuditEvent[] {
  const stored = window.localStorage.getItem(auditEventsStorageKey);
  if (!stored) {
    return initialAuditEvents;
  }

  try {
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed : initialAuditEvents;
  } catch {
    return initialAuditEvents;
  }
}

function readPersistedLocale(): Locale {
  const stored = window.localStorage.getItem(localeStorageKey);
  return stored === 'zh-TW' || stored === 'en' ? stored : 'en';
}
