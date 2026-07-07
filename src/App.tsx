import { ArrowLeft } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { seedData } from './data/seedData';
import { SeedBackendAdapter } from './services/seedBackendAdapter';
import type { AssistSuggestion, AuditEvent, Badcase, KnowledgeDocument, SourceChannel } from './types';
import type { FaqReviewDecision } from './components/GapMining';
import { AgentAssist } from './components/AgentAssist';
import { ChatPlayground } from './components/ChatPlayground';
import { CsBotKpi } from './components/CsBotKpi';
import { ErrorAnalysis } from './components/ErrorAnalysis';
import { EvaluationCenter } from './components/EvaluationCenter';
import { Intake } from './components/Intake';
import { KnowledgeBase } from './components/KnowledgeBase';
import { OpsLog } from './components/OpsLog';
import { OverviewDashboard } from './components/OverviewDashboard';
import { ReleaseCenter, type ReleaseDecision } from './components/ReleaseCenter';
import { Shell, type NavigationTarget, type ViewKey } from './components/Shell';
import { TicketCenter } from './components/TicketCenter';
import { buildEvalSummaryCsv } from './utils/export';
import {
  formatDisplayText,
  formatRiskTag,
  formatScenarioTitle,
  formatSourceChannel
} from './utils/display';
import { buildKnowledgeDocFromCandidate, persistAdoptedKnowledgeDoc } from './utils/knowledgeState';
import { calculateEvaluationSummary, getBlockedReleaseReasons } from './utils/metrics';
import { text, type Locale } from './i18n';

const defaultScenarioId = 'scn_cross_border_payment_fr';
const legacySavedEvalCaseStorageKey = 'botops.savedEvalCaseId';
const savedEvalCasesStorageKey = 'botops.savedEvalCaseIds';
const auditEventsStorageKey = 'botops.auditEvents';
const localeStorageKey = 'botops.locale';
type QualityTab = 'release' | 'kpi' | 'eval' | 'badcases' | 'audit';

const initialAuditEvents: AuditEvent[] = [
  {
    id: 'audit_system_data_sync_initial',
    eventType: 'eval_runner_completed',
    actor: 'System',
    title: 'Operational data synchronized',
    detail: 'Support signals, traces, evaluation results, badcases, and release packages are available for review.',
    titleZh: '營運資料已同步',
    detailZh: '客服訊號、處理紀錄、評測結果、失敗案例與發布套件已可供審查。',
    entityRef: 'dataset_policy_support_seed_v1',
    createdAt: '2026-07-01T09:00:00.000Z'
  }
];

export function App() {
  const backend = useMemo(() => new SeedBackendAdapter(), []);
  const [activeView, setActiveView] = useState<ViewKey>('overview');
  const [sourceFilter, setSourceFilter] = useState<SourceChannel | 'All'>('All');
  const [selectedScenarioId, setSelectedScenarioId] = useState(defaultScenarioId);
  const [highlightedChunkId, setHighlightedChunkId] = useState('chunk_payment_policy_eu_001');
  const [savedEvalCaseIds, setSavedEvalCaseIds] = useState<Record<string, string>>(() =>
    readPersistedSavedEvalCases()
  );
  const [auditEvents, setAuditEvents] = useState<AuditEvent[]>(() => readPersistedAuditEvents());
  const [evalRunnerStatus, setEvalRunnerStatus] = useState('Idle');
  const [locale, setLocale] = useState<Locale>(() => readPersistedLocale());
  const [qualityTab, setQualityTab] = useState<QualityTab>('release');
  const [badcases, setBadcases] = useState<Badcase[]>(() => backend.listBadcases());
  const [pendingKnowledgeDocId, setPendingKnowledgeDocId] = useState<string | null>(null);
  const [selectedTicketId, setSelectedTicketId] = useState(() => backend.listSupportTickets()[0]?.id ?? '');
  const [focusTicketDetail, setFocusTicketDetail] = useState(false);
  // Progressive disclosure for Conversations: 'list' shows intake + delivered replies,
  // 'review' swaps the whole page for the chat + trace review layer.
  const [isConversationReview, setIsConversationReview] = useState(false);
  /** List-layer scroll position, restored when leaving the review layer. */
  const conversationListScrollYRef = useRef(0);

  const interactionReview = backend.getInteractionReview(selectedScenarioId);
  const sourceChannel = sourceFilter === 'All' ? undefined : sourceFilter;
  const supportTickets = backend.listSupportTickets();
  const selectedTicket = supportTickets.find((ticket) => ticket.id === selectedTicketId) ?? supportTickets[0];
  const releaseBundles = backend.listReleaseBundles();
  const evalResults = backend.listEvalResults();
  const releaseGateFailures = releaseBundles.map((bundle) => getBlockedReleaseReasons(bundle, evalResults));
  const blockedBundleCount = releaseGateFailures.filter((reasons) => reasons.length > 0).length;
  const failedGateCount = releaseGateFailures.reduce((sum, reasons) => sum + reasons.length, 0);
  const candidateBundle =
    releaseBundles.find((_, index) => releaseGateFailures[index].length === 0) ?? releaseBundles[0];
  const candidateVersionLabel = candidateBundle?.label.match(/v\d+/)?.[0] ?? candidateBundle?.label ?? '';
  const candidateRegressionCount = candidateBundle
    ? calculateEvaluationSummary(evalResults, candidateBundle.evalRunId).regressionCount
    : 0;

  useEffect(() => {
    window.localStorage.setItem(savedEvalCasesStorageKey, JSON.stringify(savedEvalCaseIds));
  }, [savedEvalCaseIds]);

  useEffect(() => {
    window.localStorage.setItem(auditEventsStorageKey, JSON.stringify(auditEvents));
  }, [auditEvents]);

  useEffect(() => {
    window.localStorage.setItem(localeStorageKey, locale);
  }, [locale]);

  function reviewLiveInteraction(id: string) {
    // Remember where the list layer was scrolled to so "back to list" can restore it.
    if (activeView === 'conversations' && !isConversationReview) {
      conversationListScrollYRef.current = window.scrollY;
    }
    setSelectedScenarioId(id);
    setIsConversationReview(true);
    setActiveView('conversations');
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
      titleZh: `已審查「${formatScenarioTitle('zh-TW', review.scenario.title)}」的 bot 處理紀錄`,
      detailZh: `已開啟這筆已回覆的客戶互動：來源 ${formatSourceChannel('zh-TW', review.scenario.sourceChannel)}、風險 ${formatRiskTag('zh-TW', review.scenario.riskTag)}、地區 ${review.scenario.region}。`,
      entityRef: review.scenario.id
    });
    // The review layer replaces the page, so start reading it from the top.
    requestAnimationFrame(() => window.scrollTo(0, 0));
  }

  function returnToConversationList() {
    setIsConversationReview(false);
    const savedScrollY = conversationListScrollYRef.current;
    requestAnimationFrame(() => window.scrollTo(0, savedScrollY));
  }

  function saveAsEvalCase() {
    const id = backend.saveConversationAsEvalCase(selectedScenarioId);
    setSavedEvalCaseIds((current) => ({ ...current, [selectedScenarioId]: id }));
    appendAuditEvent({
      eventType: 'eval_case_saved',
      actor: 'PM',
      title: 'Saved conversation as eval case',
      detail: 'Captured messages, citations, trace events, source channel, risk tag, and expected behavior.',
      titleZh: '已將對話轉存為評測案例',
      detailZh: '已保留訊息、引用、trace events、來源、風險標籤與預期行為。',
      entityRef: id
    });
  }

  function runOfflineEval() {
    if (evalRunnerStatus === 'Running') {
      return;
    }
    setEvalRunnerStatus('Running');
    appendAuditEvent({
      eventType: 'eval_runner_started',
      actor: 'Bot Ops',
      title: 'Started offline eval run',
      detail: 'Compared the current release and proposed release against the approved evaluation set.',
      titleZh: '已啟動離線評測',
      detailZh: '以核准評測集比較目前版本與候選版本。',
      entityRef: 'run_v19_candidate'
    });
    // Simulated runner latency: completion state and its audit entry land after the run "finishes".
    window.setTimeout(() => {
      setEvalRunnerStatus('Completed');
      appendAuditEvent({
        eventType: 'eval_runner_completed',
        actor: 'System',
        title: 'Completed offline eval run',
        detail: 'Proposed release passed citation support and handoff safety gates; the blocked release remains unavailable.',
        titleZh: '離線評測已完成',
        detailZh: '候選版本通過引用支撐與交接安全門檻；被阻擋的版本仍不可發布。',
        entityRef: 'run_v19_candidate'
      });
    }, 1700);
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
      titleZh: '已匯出評測摘要 CSV',
      detailZh: '已下載 run-level 評測摘要，供利害關係人審閱。',
      entityRef: 'botops-eval-summary.csv'
    });
  }

  function flagAssistBadcase(suggestion: AssistSuggestion) {
    const badcaseId = `badcase_assist_${suggestion.id}`;
    setBadcases((current) => {
      if (current.some((badcase) => badcase.id === badcaseId)) {
        return current;
      }
      return [
        ...current,
        {
          id: badcaseId,
          caseId: suggestion.caseRef,
          title: `Low-quality assist suggestion on ${suggestion.caseRef}`,
          failureLabel: 'Assist suggestion quality',
          lowScoreDimension: 'Assist suggestion adoption',
          observedCase: suggestion.suggestedReply,
          traceDiagnosis: `Agent action was "${suggestion.agentAction}" in queue ${suggestion.queue}; final reply diverged from the AI suggestion.`,
          chainNodeToChange: 'Answer Generation',
          modification: 'Review the assist prompt for this intent and compare against the agent final reply.',
          retestMetric: 'Suggestion adoption rate',
          expectedScoreMovement: 'Discard rate down for this queue',
          owner: 'PM',
          status: 'Open'
        }
      ];
    });
    appendAuditEvent({
      eventType: 'assist_badcase_flagged',
      actor: 'PM',
      title: 'Flagged assist suggestion as badcase',
      detail: `Assist suggestion ${suggestion.id} (queue ${suggestion.queue}, intent ${suggestion.intentTag}) was flagged into the Quality badcase loop.`,
      titleZh: '已將座席輔助建議標記為 badcase',
      detailZh: `座席輔助建議 ${suggestion.id}（隊列 ${formatDisplayText('zh-TW', suggestion.queue)}、意圖 ${formatDisplayText('zh-TW', suggestion.intentTag)}）已標記進品質失敗案例循環。`,
      entityRef: suggestion.id
    });
  }

  function queueKnowledgeReindex(doc: KnowledgeDocument) {
    appendAuditEvent({
      eventType: 'knowledge_index_queued',
      actor: 'Knowledge Owner',
      title: 'Queued knowledge re-index',
      detail: `Document "${doc.title}" was queued for re-indexing; retrieval evidence refresh is pending.`,
      titleZh: '已將知識文件排入重建索引',
      detailZh: `文件「${formatDisplayText('zh-TW', doc.title)}」已排入重建索引；檢索依據待更新。`,
      entityRef: doc.id
    });
  }

  function changeView(view: ViewKey, target?: NavigationTarget) {
    if (view === 'quality') {
      setQualityTab('release');
    }
    if (target?.ticketId) {
      setSelectedTicketId(target.ticketId);
    }
    setFocusTicketDetail(Boolean(target?.ticketId));
    setPendingKnowledgeDocId(target?.knowledgeDocId ?? null);
    if (view === 'conversations') {
      setSourceFilter(target?.sourceChannel ?? 'All');
      // Cross-view entries start a fresh list session, so "back to list" lands at the top.
      conversationListScrollYRef.current = 0;
      if (target?.scenarioId) {
        // A concrete scenario target (dashboard/KPI drill-through) opens the review layer directly.
        reviewLiveInteraction(target.scenarioId);
        return;
      }
      setIsConversationReview(false);
    }
    setActiveView(view);
    window.scrollTo(0, 0);
  }

  return (
    <Shell activeView={activeView} locale={locale} onLocaleChange={setLocale} onViewChange={changeView}>
      {activeView === 'overview' && <OverviewDashboard data={seedData} locale={locale} onNavigate={changeView} />}
      {activeView === 'conversations' && !isConversationReview && (
        <section className="module-stack" data-testid="conversation-list-layer">
          <Intake
            locale={locale}
            selectedSource={sourceFilter}
            signals={backend.listSignals({ sourceChannel })}
            scenarios={backend.listScenarios({ sourceChannel })}
            allScenarios={backend.listScenarios()}
            onSourceChange={setSourceFilter}
            onReviewInteraction={reviewLiveInteraction}
          />
        </section>
      )}
      {activeView === 'conversations' && isConversationReview && (
        <section className="module-stack" data-testid="conversation-review-layer">
          <div className="review-topbar">
            <button
              className="tertiary-action"
              data-testid="back-to-conversation-list"
              onClick={returnToConversationList}
              type="button"
            >
              <ArrowLeft size={15} aria-hidden="true" />
              {text(locale, 'Back to list', '返回清單')}
            </button>
            <nav aria-label={text(locale, 'Breadcrumb', '導覽路徑')} className="review-breadcrumb">
              <button className="review-breadcrumb-root" onClick={returnToConversationList} type="button">
                {text(locale, 'Conversations', '對話審查')}
              </button>
              <span aria-hidden="true" className="review-breadcrumb-separator">
                /
              </span>
              <strong aria-current="page">
                {formatScenarioTitle(locale, interactionReview.scenario.title)}
              </strong>
            </nav>
          </div>
          <ChatPlayground
            documents={backend.listDocuments()}
            highlightedChunkId={highlightedChunkId}
            locale={locale}
            onHighlightChunk={setHighlightedChunkId}
            onSaveEvalCase={saveAsEvalCase}
            review={interactionReview}
            savedEvalCaseId={savedEvalCaseIds[selectedScenarioId] ?? null}
          />
        </section>
      )}
      {activeView === 'knowledge' && (
        <KnowledgeBase
          documents={backend.listDocuments()}
          faqCandidates={backend.listFaqCandidates()}
          gapClusters={backend.listGapClusters()}
          sopRecords={backend.listSopRecords()}
          highlightedChunkId={highlightedChunkId}
          initialSelectedDocId={pendingKnowledgeDocId}
          locale={locale}
          onFaqCandidateReview={(candidate, cluster, decision) => {
            if (decision === 'adopted') {
              // Promote the adopted candidate into a Draft knowledge document so the
              // inventory table and metric tiles reflect it immediately and after reload.
              persistAdoptedKnowledgeDoc(buildKnowledgeDocFromCandidate(candidate, cluster));
            }
            appendAuditEvent({
              eventType: 'faq_candidate_reviewed',
              actor: 'Knowledge Owner',
              title: faqReviewTitle(decision),
              detail: faqReviewDetail(cluster.label, decision),
              titleZh: faqReviewTitleZh(decision),
              detailZh: faqReviewDetailZh(formatDisplayText('zh-TW', cluster.label), decision),
              entityRef: candidate.id
            });
          }}
          onQueueReindex={queueKnowledgeReindex}
        />
      )}
      {activeView === 'assist' && (
        <AgentAssist
          locale={locale}
          suggestions={backend.listAssistSuggestions()}
          onFlagBadcase={flagAssistBadcase}
        />
      )}
      {activeView === 'tickets' && (
        <section className="module-stack">
          <TicketCenter
            focusDetailOnMount={focusTicketDetail}
            handoffPreview={selectedTicket ? backend.getHandoffPreview(selectedTicket.scenarioId) : undefined}
            locale={locale}
            onSelectTicket={setSelectedTicketId}
            selectedTicketId={selectedTicket?.id ?? ''}
            tickets={supportTickets}
          />
        </section>
      )}
      {activeView === 'quality' && (
        <section className="module-stack">
          <section className="quality-workspace" data-testid="quality-workspace">
            <div className="quality-summary panel">
              <div>
                <p className="eyebrow">{text(locale, 'Release readiness', '發布狀態')}</p>
                <h3>
                  {blockedBundleCount > 0
                    ? text(locale, 'Blocked by release gates', '發布門檻阻擋')
                    : text(locale, 'Release gates passing', '發布門檻通過')}
                </h3>
              </div>
              <div className="quality-summary-metrics">
                <span>
                  {text(
                    locale,
                    `${blockedBundleCount} blocked package${blockedBundleCount === 1 ? '' : 's'}`,
                    `${blockedBundleCount} 個阻擋套件`
                  )}
                </span>
                <span>
                  {text(
                    locale,
                    `${failedGateCount} failed gate${failedGateCount === 1 ? '' : 's'}`,
                    `${failedGateCount} 個失敗門檻`
                  )}
                </span>
                <span>
                  {candidateRegressionCount === 0
                    ? text(locale, `0 regressions in ${candidateVersionLabel}`, `${candidateVersionLabel} 無退化`)
                    : text(
                        locale,
                        `${candidateRegressionCount} regressions in ${candidateVersionLabel}`,
                        `${candidateVersionLabel} 有 ${candidateRegressionCount} 項退化`
                      )}
                </span>
              </div>
            </div>
            <div className="quality-tabs" role="tablist" aria-label={text(locale, 'Quality sections', '品質模組')}>
              {qualityTabs(locale).map((tab) => (
                <button
                  aria-selected={qualityTab === tab.key}
                  className={qualityTab === tab.key ? 'chip selected' : 'chip'}
                  key={tab.key}
                  onClick={() => setQualityTab(tab.key)}
                  role="tab"
                  type="button"
                >
                  {tab.label}
                </button>
              ))}
            </div>
            {qualityTab === 'release' && (
              <ReleaseCenter
                bundles={releaseBundles}
                evalResults={evalResults}
                getFlowVersionDiff={(bundleId) => backend.getFlowVersionDiff(bundleId)}
                locale={locale}
                onReleaseDecision={(bundle, decision, reason) =>
                  appendAuditEvent({
                    eventType: 'release_decision',
                    actor: 'PM',
                    title: releaseDecisionTitle(decision),
                    detail: reason || releaseDecisionDetail(bundle.label, decision),
                    titleZh: releaseDecisionTitleZh(decision),
                    // PM-entered reasons are free text and shown verbatim in both locales.
                    detailZh:
                      reason || releaseDecisionDetailZh(formatDisplayText('zh-TW', bundle.label), decision),
                    entityRef: bundle.id
                  })
                }
              />
            )}
            {qualityTab === 'kpi' && (
              <CsBotKpi
                locale={locale}
                metrics={backend.listCsBotKpiMetrics()}
                segments={backend.listCsBotKpiSegments()}
                onViewConversations={(channel) => changeView('conversations', { sourceChannel: channel })}
              />
            )}
            {qualityTab === 'eval' && (
              <EvaluationCenter
                evalCases={backend.listEvalCases()}
                evalResults={evalResults}
                evalRuns={seedData.evalRuns}
                evalRunnerStatus={evalRunnerStatus}
                judgeCalibrations={backend.listJudgeCalibrations()}
                locale={locale}
                onExportCsv={exportEvalCsv}
                onRunEval={runOfflineEval}
                savedEvalCaseIds={savedEvalCaseIds}
              />
            )}
            {qualityTab === 'badcases' && <ErrorAnalysis badcases={badcases} locale={locale} />}
            {qualityTab === 'audit' && <OpsLog events={auditEvents} locale={locale} />}
          </section>
        </section>
      )}
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

function qualityTabs(locale: Locale): Array<{ key: QualityTab; label: string }> {
  return [
    { key: 'release', label: text(locale, 'Release Gates', '發布門檻') },
    { key: 'kpi', label: text(locale, 'KPI', 'KPI') },
    { key: 'eval', label: text(locale, 'Eval Runs', '評測批次') },
    { key: 'badcases', label: text(locale, 'Badcases', '失敗案例') },
    { key: 'audit', label: text(locale, 'Audit', '稽核') }
  ];
}

function faqReviewTitle(decision: FaqReviewDecision) {
  if (decision === 'adopted') {
    return 'Adopted FAQ candidate into knowledge base';
  }
  if (decision === 'returned') {
    return 'Returned FAQ candidate for rewrite';
  }
  return 'Marked FAQ candidate as not automatable';
}

function faqReviewTitleZh(decision: FaqReviewDecision) {
  if (decision === 'adopted') {
    return '已採納 FAQ 候選入庫';
  }
  if (decision === 'returned') {
    return '已退回 FAQ 候選重寫';
  }
  return '已標記 FAQ 候選為不適合自動化';
}

function faqReviewDetail(clusterLabel: string, decision: FaqReviewDecision) {
  if (decision === 'adopted') {
    return `FAQ candidate for cluster "${clusterLabel}" was adopted into the knowledge base; deflection tracking is now active.`;
  }
  if (decision === 'returned') {
    return `FAQ candidate for cluster "${clusterLabel}" was returned for rewrite with the review note.`;
  }
  return `Cluster "${clusterLabel}" was marked as not automatable and stays routed to human support.`;
}

function faqReviewDetailZh(clusterLabel: string, decision: FaqReviewDecision) {
  if (decision === 'adopted') {
    return `案例群「${clusterLabel}」的 FAQ 候選已採納入知識庫，deflection 追蹤已啟用。`;
  }
  if (decision === 'returned') {
    return `案例群「${clusterLabel}」的 FAQ 候選已附審核註記退回重寫。`;
  }
  return `案例群「${clusterLabel}」已標記為不適合自動化，維持轉由人工客服處理。`;
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

function releaseDecisionTitleZh(decision: ReleaseDecision) {
  if (decision === 'promoted') {
    return '已推進發布套件';
  }
  if (decision === 'review_requested') {
    return '已請求發布審查';
  }
  return '已阻擋發布套件';
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

function releaseDecisionDetailZh(bundleLabel: string, decision: ReleaseDecision) {
  if (decision === 'promoted') {
    return `${bundleLabel} 已在可見發布門檻通過後推進至 canary 審查。`;
  }
  if (decision === 'review_requested') {
    return `${bundleLabel} 已送交利害關係人審查，審查完成前不做 rollout 決定。`;
  }
  return `${bundleLabel} 維持阻擋，發布門檻修正前不可 rollout。`;
}

function readPersistedSavedEvalCases(): Record<string, string> {
  const stored = window.localStorage.getItem(savedEvalCasesStorageKey);
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        return parsed as Record<string, string>;
      }
    } catch {
      // Ignore corrupted storage and fall back to the legacy single-id key.
    }
  }

  // Migrate the legacy single-id format ("eval_saved_<scenarioId>") into the per-scenario map.
  const legacy = window.localStorage.getItem(legacySavedEvalCaseStorageKey);
  if (legacy && legacy.startsWith('eval_saved_')) {
    window.localStorage.removeItem(legacySavedEvalCaseStorageKey);
    return { [legacy.slice('eval_saved_'.length)]: legacy };
  }
  return {};
}

function readPersistedAuditEvents(): AuditEvent[] {
  const stored = window.localStorage.getItem(auditEventsStorageKey);
  if (!stored) {
    return initialAuditEvents;
  }

  try {
    const parsed = JSON.parse(stored);
    if (!Array.isArray(parsed)) {
      return initialAuditEvents;
    }
    // Legacy events (pre-bilingual format) have no titleZh/detailZh — they are kept
    // as-is and render their original English copy. Entries missing required string
    // fields are dropped instead of crashing the audit view.
    const events = parsed.filter(
      (event): event is AuditEvent =>
        Boolean(event) &&
        typeof event === 'object' &&
        typeof event.id === 'string' &&
        typeof event.title === 'string' &&
        typeof event.detail === 'string' &&
        typeof event.createdAt === 'string'
    );
    return events.length > 0 ? events : initialAuditEvents;
  } catch {
    return initialAuditEvents;
  }
}

function readPersistedLocale(): Locale {
  const stored = window.localStorage.getItem(localeStorageKey);
  return stored === 'zh-TW' || stored === 'en' ? stored : 'en';
}
