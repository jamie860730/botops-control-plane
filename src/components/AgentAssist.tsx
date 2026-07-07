import { useState } from 'react';
import { Flag, Headset } from 'lucide-react';
import type { AssistAgentAction, AssistEditDistanceBucket, AssistSuggestion } from '../types';
import type { Locale } from '../i18n';
import { text } from '../i18n';
import { formatDisplayText } from '../utils/display';
import { calculateAssistSummary, getAssistPolicyHints, type AssistQueuePolicyHint } from '../utils/metrics';
import { Drawer } from './Drawer';

type ActionFilter = 'all' | AssistAgentAction;

interface AgentAssistProps {
  locale: Locale;
  suggestions: AssistSuggestion[];
  onFlagBadcase: (suggestion: AssistSuggestion) => void;
}

export function AgentAssist({ locale, suggestions, onFlagBadcase }: AgentAssistProps) {
  const [actionFilter, setActionFilter] = useState<ActionFilter>('all');
  const [selectedSuggestionId, setSelectedSuggestionId] = useState<string | null>(null);
  const [flaggedIds, setFlaggedIds] = useState<Record<string, boolean>>({});

  const summary = calculateAssistSummary(suggestions);
  const policyHints = getAssistPolicyHints(suggestions);
  const editDistance = summary.editDistanceDistribution;
  const editDistanceTotal = editDistance.none + editDistance.light + editDistance.heavy;
  // Headline the largest bucket as a share (e.g. "67% no edit") instead of the raw
  // "8 · 2 · 2" triple, which reads as an unlabeled code.
  const topEditBucket = (['none', 'light', 'heavy'] as const).reduce((top, bucket) =>
    editDistance[bucket] > editDistance[top] ? bucket : top
  );
  const topEditBucketShare =
    editDistanceTotal > 0 ? Math.round((editDistance[topEditBucket] / editDistanceTotal) * 100) : 0;
  const filteredSuggestions =
    actionFilter === 'all' ? suggestions : suggestions.filter((row) => row.agentAction === actionFilter);
  const selectedSuggestion = suggestions.find((row) => row.id === selectedSuggestionId);

  const labels = {
    caseRef: text(locale, 'Case', '案例'),
    queue: text(locale, 'Queue', '隊列'),
    intent: text(locale, 'Intent', '意圖'),
    action: text(locale, 'Agent action', '座席動作'),
    editDistance: text(locale, 'Edit distance', '修改幅度'),
    handleTime: text(locale, 'Handle time', '處理時長')
  };

  function flagBadcase(suggestion: AssistSuggestion) {
    if (flaggedIds[suggestion.id]) {
      return;
    }
    setFlaggedIds((current) => ({ ...current, [suggestion.id]: true }));
    onFlagBadcase(suggestion);
  }

  return (
    <section className="screen-grid" data-testid="agent-assist">
      <div className="panel span-3">
        <div className="section-heading">
          <div>
            <p className="eyebrow">{text(locale, 'Agent Assist governance', '座席輔助治理')}</p>
            <h3>
              {text(
                locale,
                'AI suggestion quality measured by real agent behavior',
                '用座席實際行為量測 AI 建議品質'
              )}
            </h3>
          </div>
          <Headset size={26} aria-hidden="true" />
        </div>
        <div className="cs-kpi-metric-grid">
          <article className={`cs-kpi-card ${summary.discardedRate > 0.3 ? 'watch' : 'healthy'}`}>
            <div className="row-title">
              <strong>{text(locale, 'Suggestion adoption', '建議採納率')}</strong>
              <span>{locale === 'zh-TW' ? `${summary.total} 筆建議` : `${summary.total} suggestions`}</span>
            </div>
            <div className="cs-kpi-value-row">
              <strong>{formatRate(summary.adoptedRate + summary.editedRate)}</strong>
            </div>
            <p>
              {locale === 'zh-TW'
                ? `直接採納 ${formatRate(summary.adoptedRate)} · 修改後採納 ${formatRate(summary.editedRate)} · 棄用 ${formatRate(summary.discardedRate)}`
                : `Adopted ${formatRate(summary.adoptedRate)} · Edited ${formatRate(summary.editedRate)} · Discarded ${formatRate(summary.discardedRate)}`}
            </p>
          </article>
          <article
            className={`cs-kpi-card ${
              summary.editDistanceDistribution.heavy > summary.editDistanceDistribution.light ? 'watch' : 'healthy'
            }`}
          >
            <div className="row-title">
              <strong>{text(locale, 'Edit distance distribution', '修改幅度分布')}</strong>
            </div>
            <div className="cs-kpi-value-row">
              <strong>
                {`${topEditBucketShare}% ${bucketLabel(locale, topEditBucket).toLowerCase()}`}
              </strong>
            </div>
            <p>
              {locale === 'zh-TW'
                ? `分布明細：無修改 ${editDistance.none}｜輕度 ${editDistance.light}｜重度 ${editDistance.heavy}`
                : `Breakdown: no edit ${editDistance.none} | light ${editDistance.light} | heavy ${editDistance.heavy}`}
            </p>
          </article>
          <article className={`cs-kpi-card ${summary.summaryRewriteRate > 0.25 ? 'watch' : 'healthy'}`}>
            <div className="row-title">
              <strong>{text(locale, 'AI summary rewrite rate', 'AI 摘要重寫率')}</strong>
            </div>
            <div className="cs-kpi-value-row">
              <strong>{formatRate(summary.summaryRewriteRate)}</strong>
            </div>
            <p>
              {text(
                locale,
                'Share of cases where the agent rewrote the AI case summary before saving.',
                '座席送出前重寫 AI 案例摘要的比例。'
              )}
            </p>
          </article>
          <article className={`cs-kpi-card ${summary.handleTimeDeltaSeconds > 120 ? 'watch' : 'healthy'}`}>
            <div className="row-title">
              <strong>{text(locale, 'Handle time gap', '處理時長差')}</strong>
            </div>
            <div className="cs-kpi-value-row">
              <strong>{formatMinutes(locale, summary.handleTimeDeltaSeconds)}</strong>
            </div>
            <p>
              {locale === 'zh-TW'
                ? `採納組平均 ${formatMinutes(locale, summary.avgHandleTimeAcceptedSeconds)}，棄用組平均 ${formatMinutes(locale, summary.avgHandleTimeDiscardedSeconds)}。`
                : `Accepted cases average ${formatMinutes(locale, summary.avgHandleTimeAcceptedSeconds)}, discarded cases ${formatMinutes(locale, summary.avgHandleTimeDiscardedSeconds)}.`}
            </p>
          </article>
        </div>
      </div>

      <div className="panel span-3" data-testid="assist-policy-hints">
        <div className="section-heading">
          <div>
            <p className="eyebrow">{text(locale, 'Policy hints', '政策提示')}</p>
            <h3>{text(locale, 'Rule-based next steps per queue', '依隊列計算的規則化建議')}</h3>
          </div>
          <span className="count-pill">
            {locale === 'zh-TW' ? `${policyHints.length} 則提示` : `${policyHints.length} hints`}
          </span>
        </div>
        {policyHints.map((hint) => (
          <div className="inline-status" key={`${hint.queue}_${hint.hint}`} role="status">
            {policyHintText(locale, hint)}
          </div>
        ))}
        {policyHints.length === 0 && (
          <div className="empty-state">
            <strong>{text(locale, 'No policy hints triggered', '目前沒有觸發政策提示')}</strong>
            <p>
              {text(
                locale,
                'No queue currently crosses the auto-send or prompt-review thresholds.',
                '目前沒有隊列達到自動送出或檢討 prompt 的門檻。'
              )}
            </p>
          </div>
        )}
      </div>

      <div className="panel span-3">
        <div className="section-heading">
          <div>
            <p className="eyebrow">{text(locale, 'Suggestion log', '建議明細')}</p>
            <h3>{text(locale, 'Every suggestion with the agent outcome', '每筆建議與座席最終處置')}</h3>
          </div>
          <span className="count-pill">
            {locale === 'zh-TW' ? `${filteredSuggestions.length} 筆` : `${filteredSuggestions.length} records`}
          </span>
        </div>
        <div className="source-tabs" aria-label={text(locale, 'Agent action filters', '座席動作篩選')}>
          {actionFilters(locale).map((filter) => (
            <button
              aria-pressed={actionFilter === filter.value}
              className={actionFilter === filter.value ? 'chip selected' : 'chip'}
              key={filter.value}
              onClick={() => setActionFilter(filter.value)}
              type="button"
            >
              {filter.label}
            </button>
          ))}
        </div>
        <div className="data-table">
          <div className="table-row table-head assist-row">
            <span>{labels.caseRef}</span>
            <span>{labels.queue}</span>
            <span>{labels.intent}</span>
            <span>{labels.action}</span>
            <span>{labels.editDistance}</span>
            <span>{labels.handleTime}</span>
          </div>
          {filteredSuggestions.map((suggestion) => (
            <button
              className={
                suggestion.id === selectedSuggestion?.id
                  ? 'table-row assist-row interactive-row selected'
                  : 'table-row assist-row interactive-row'
              }
              key={suggestion.id}
              onClick={() => setSelectedSuggestionId(suggestion.id)}
              type="button"
            >
              <span data-label={labels.caseRef}>
                <strong>{suggestion.caseRef}</strong>
              </span>
              <span data-label={labels.queue}>{formatDisplayText(locale, suggestion.queue)}</span>
              <span data-label={labels.intent}>{formatDisplayText(locale, suggestion.intentTag)}</span>
              <span data-label={labels.action}>{actionLabel(locale, suggestion.agentAction)}</span>
              <span data-label={labels.editDistance}>{bucketLabel(locale, suggestion.editDistanceBucket)}</span>
              <span data-label={labels.handleTime}>{formatMinutes(locale, suggestion.handleTimeSeconds)}</span>
            </button>
          ))}
          {filteredSuggestions.length === 0 && (
            <div className="empty-state">
              <strong>{text(locale, 'No suggestions match this filter', '沒有符合此篩選的建議')}</strong>
              <p>{text(locale, 'Try another agent-action filter.', '請改用其他座席動作篩選。')}</p>
            </div>
          )}
        </div>
      </div>

      <Drawer
        eyebrow={text(locale, 'Suggestion detail', '建議詳情')}
        footer={
          selectedSuggestion && (
            <button
              className="secondary-action compact-action"
              disabled={Boolean(flaggedIds[selectedSuggestion.id])}
              onClick={() => flagBadcase(selectedSuggestion)}
              type="button"
            >
              <Flag size={15} aria-hidden="true" /> {text(locale, 'Flag as badcase', '標記為 badcase')}
            </button>
          )
        }
        locale={locale}
        onClose={() => setSelectedSuggestionId(null)}
        open={Boolean(selectedSuggestion)}
        title={selectedSuggestion?.caseRef ?? ''}
      >
        {selectedSuggestion && (
        <div data-testid="assist-suggestion-detail">
          <div className="pill-stack drawer-pill-stack">
            <span className="count-pill">{actionLabel(locale, selectedSuggestion.agentAction)}</span>
          </div>
          <dl className="compact-detail-list">
            <div>
              <dt>{labels.queue}</dt>
              <dd>{formatDisplayText(locale, selectedSuggestion.queue)}</dd>
            </div>
            <div>
              <dt>{labels.intent}</dt>
              <dd>{formatDisplayText(locale, selectedSuggestion.intentTag)}</dd>
            </div>
            <div>
              <dt>{labels.handleTime}</dt>
              <dd>{formatMinutes(locale, selectedSuggestion.handleTimeSeconds)}</dd>
            </div>
            <div>
              <dt>{text(locale, 'Trace reference', 'Trace 參照')}</dt>
              <dd>{selectedSuggestion.traceScenarioId}</dd>
            </div>
          </dl>
          <div className="record-detail-panel">
            <p className="eyebrow">
              {text(locale, 'AI suggestion vs agent final reply', 'AI 建議 vs 座席最終版')}
            </p>
            <div className="assist-compare-grid">
              <article className="chunk-preview">
                <p className="eyebrow">{text(locale, 'AI suggested reply', 'AI 建議回覆')}</p>
                <p>{formatDisplayText(locale, selectedSuggestion.suggestedReply)}</p>
              </article>
              <article className="chunk-preview">
                <p className="eyebrow">{text(locale, 'Agent final reply', '座席最終回覆')}</p>
                <p>{formatDisplayText(locale, selectedSuggestion.agentFinalReply)}</p>
              </article>
            </div>
          </div>
          <div className="record-detail-panel">
            <p className="eyebrow">
              {text(locale, 'AI summary vs agent summary', 'AI 摘要 vs 座席摘要')}
              {selectedSuggestion.summaryRewritten && (
                <>
                  {' '}
                  <span className="count-pill">{text(locale, 'Rewritten', '已重寫')}</span>
                </>
              )}
            </p>
            <div className="assist-compare-grid">
              <article className="chunk-preview">
                <p className="eyebrow">{text(locale, 'AI case summary', 'AI 案例摘要')}</p>
                <p>{formatDisplayText(locale, selectedSuggestion.aiSummary)}</p>
              </article>
              <article className="chunk-preview">
                <p className="eyebrow">{text(locale, 'Agent final summary', '座席最終摘要')}</p>
                <p>{formatDisplayText(locale, selectedSuggestion.agentFinalSummary)}</p>
              </article>
            </div>
          </div>
          {flaggedIds[selectedSuggestion.id] && (
            <div className="inline-status" role="status">
              {text(
                locale,
                'Suggestion flagged as badcase. It is now visible in Quality → Badcases and recorded in the audit log.',
                '建議已標記為 badcase，可在「品質與發布 → 失敗案例」查看，並已寫入稽核紀錄。'
              )}
            </div>
          )}
        </div>
        )}
      </Drawer>
    </section>
  );
}

function actionFilters(locale: Locale): Array<{ value: ActionFilter; label: string }> {
  return [
    { value: 'all', label: text(locale, 'All', '全部') },
    { value: 'adopted', label: text(locale, 'Adopted', '已採納') },
    { value: 'edited', label: text(locale, 'Edited', '已修改') },
    { value: 'discarded', label: text(locale, 'Discarded', '已棄用') }
  ];
}

function actionLabel(locale: Locale, action: AssistAgentAction) {
  if (action === 'adopted') {
    return text(locale, 'Adopted', '直接採納');
  }
  if (action === 'edited') {
    return text(locale, 'Edited then sent', '修改後採納');
  }
  return text(locale, 'Discarded', '棄用');
}

function bucketLabel(locale: Locale, bucket: AssistEditDistanceBucket) {
  if (bucket === 'none') {
    return text(locale, 'No edit', '無修改');
  }
  if (bucket === 'light') {
    return text(locale, 'Light edit', '輕度修改');
  }
  return text(locale, 'Heavy rewrite', '重度改寫');
}

function policyHintText(locale: Locale, hint: AssistQueuePolicyHint) {
  const queue = formatDisplayText(locale, hint.queue);
  if (hint.hint === 'evaluate_auto_send') {
    return locale === 'zh-TW'
      ? `${queue}：採納率 ${formatRate(hint.acceptanceRate)} 且屬低風險隊列，可評估開放自動送出。`
      : `${queue}: acceptance ${formatRate(hint.acceptanceRate)} in a low-risk queue — consider enabling auto-send evaluation.`;
  }
  return locale === 'zh-TW'
    ? `${queue}：棄用率 ${formatRate(hint.discardRate)}，建議檢討 prompt 或暫時關閉此隊列的建議。`
    : `${queue}: discard rate ${formatRate(hint.discardRate)} — review the prompt or disable suggestions for this queue.`;
}

function formatRate(value: number) {
  return `${Math.round(value * 100)}%`;
}

function formatMinutes(locale: Locale, seconds: number) {
  const minutes = Math.round((seconds / 60) * 10) / 10;
  return locale === 'zh-TW' ? `${minutes} 分鐘` : `${minutes} min`;
}
