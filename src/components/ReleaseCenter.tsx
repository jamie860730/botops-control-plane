import { useState } from 'react';
import { Ban, CheckCircle2, ClipboardCheck, GitCompare } from 'lucide-react';
import type { Locale } from '../i18n';
import { text } from '../i18n';
import type { EvalResult, FlowVersionDiff, ReleaseBundle } from '../types';
import { formatDisplayText } from '../utils/display';
import { getBlockedReleaseReasons } from '../utils/metrics';
import { FlowVersionDiffView, flowDiffSummary } from './FlowVersionDiff';

export type ReleaseDecision = 'blocked' | 'promoted' | 'review_requested';

interface ReleaseCenterProps {
  bundles: ReleaseBundle[];
  evalResults: EvalResult[];
  getFlowVersionDiff: (bundleId: string) => FlowVersionDiff | undefined;
  locale: Locale;
  onReleaseDecision: (bundle: ReleaseBundle, decision: ReleaseDecision, reason: string) => void;
}

export function ReleaseCenter({
  bundles,
  evalResults,
  getFlowVersionDiff,
  locale,
  onReleaseDecision
}: ReleaseCenterProps) {
  const [decisions, setDecisions] = useState<Record<string, { decision: ReleaseDecision; reason: string }>>({});
  // Decision reasons are prefilled with a one-line flow diff summary the PM can edit.
  const [reasonByBundleId, setReasonByBundleId] = useState<Record<string, string>>(() => {
    const initialReasons: Record<string, string> = {};
    for (const bundle of bundles) {
      const diff = getFlowVersionDiff(bundle.id);
      if (diff) {
        initialReasons[bundle.id] = flowDiffSummary(diff, locale);
      }
    }
    return initialReasons;
  });
  const [expandedDiffBundleIds, setExpandedDiffBundleIds] = useState<Record<string, boolean>>({});

  function recordDecision(bundle: ReleaseBundle, decision: ReleaseDecision) {
    const reason = reasonByBundleId[bundle.id]?.trim() || decisionDetail(decision, locale);
    setDecisions((current) => ({ ...current, [bundle.id]: { decision, reason } }));
    onReleaseDecision(bundle, decision, reason);
  }

  return (
    <section className="screen-grid release-grid" data-testid="release-center">
      {bundles.map((bundle) => {
        const blockedReasons = getBlockedReleaseReasons(bundle, evalResults);
        const decisionRecord = decisions[bundle.id];
        const flowDiff = getFlowVersionDiff(bundle.id);
        const diffExpanded = Boolean(expandedDiffBundleIds[bundle.id]);
        return (
          <article className="panel release-panel" key={bundle.id}>
            <div className="section-heading">
              <div>
                <p className="eyebrow">{formatDisplayText(locale, bundle.status)}</p>
                <h3>{formatDisplayText(locale, bundle.label)}</h3>
              </div>
              <span className={blockedReasons.length > 0 ? 'risk-pill high' : 'risk-pill low'}>
                {formatDisplayText(locale, blockedReasons.length > 0 ? 'blocked' : 'ready')}
              </span>
            </div>
            <dl className="mini-meta release-meta">
              <div>
                <dt>{text(locale, 'Prompt version', 'Prompt 版本')}</dt>
                <dd>{bundle.promptVersion}</dd>
              </div>
              <div>
                <dt>{text(locale, 'KB snapshot', '知識庫快照')}</dt>
                <dd>{bundle.kbSnapshot}</dd>
              </div>
              <div>
                <dt>{text(locale, 'Retrieval config', '檢索設定')}</dt>
                <dd>{bundle.retrievalConfig}</dd>
              </div>
            </dl>
            {flowDiff && (
              <button
                aria-expanded={diffExpanded}
                aria-label={text(locale, `View changes for ${bundle.label}`, `檢視 ${formatDisplayText(locale, bundle.label)} 變更`)}
                className="tertiary-action flow-diff-toggle"
                onClick={() =>
                  setExpandedDiffBundleIds((current) => ({ ...current, [bundle.id]: !current[bundle.id] }))
                }
                type="button"
              >
                <GitCompare size={15} aria-hidden="true" />
                {diffExpanded ? text(locale, 'Hide changes', '收合變更') : text(locale, 'View changes', '檢視變更')}
              </button>
            )}
            {flowDiff && diffExpanded && <FlowVersionDiffView diff={flowDiff} locale={locale} />}
            <div className={blockedReasons.length > 0 ? 'blocked-reasons fail' : 'blocked-reasons pass'}>
              {blockedReasons.length > 0 ? (
                blockedReasons.map((reason) => <p key={reason}>{formatDisplayText(locale, reason)}</p>)
              ) : (
                <p>{text(locale, 'Required release gates passed.', '必要發布門檻已通過。')}</p>
              )}
            </div>
            <label className="release-reason-field">
              <span>{text(locale, 'Decision reason', '決策原因')}</span>
              <textarea
                aria-label={text(
                  locale,
                  `Decision reason for ${bundle.label}`,
                  `${formatDisplayText(locale, bundle.label)} 決策原因`
                )}
                onChange={(event) =>
                  setReasonByBundleId((current) => ({ ...current, [bundle.id]: event.target.value }))
                }
                placeholder={text(
                  locale,
                  'Gate evidence, reviewer, or rollback condition.',
                  '門檻依據、審查者或 rollback 條件。'
                )}
                rows={3}
                value={reasonByBundleId[bundle.id] ?? ''}
              />
            </label>
            {decisionRecord && (
              <div className="release-decision-banner" data-testid={`release-decision-${bundle.id}`}>
                <strong>{decisionLabel(decisionRecord.decision, locale)}</strong>
                <p>{decisionRecord.reason}</p>
              </div>
            )}
            <div className="release-actions">
              <button
                aria-label={text(locale, `Promote ${bundle.label}`, `推進 ${bundle.label}`)}
                className="primary-action compact-action"
                disabled={blockedReasons.length > 0}
                onClick={() => recordDecision(bundle, 'promoted')}
                title={
                  blockedReasons.length > 0
                    ? text(locale, 'Promotion is disabled until blocking gates pass.', '阻擋門檻通過前不可推進。')
                    : undefined
                }
                type="button"
              >
                <CheckCircle2 size={15} aria-hidden="true" />
                {text(locale, 'Promote', '推進')}
              </button>
              <button
                aria-label={text(locale, `Block release ${bundle.label}`, `阻擋發布 ${bundle.label}`)}
                className="secondary-action"
                onClick={() => recordDecision(bundle, 'blocked')}
                type="button"
              >
                <Ban size={15} aria-hidden="true" />
                {text(locale, 'Block release', '阻擋發布')}
              </button>
              <button
                aria-label={text(locale, `Request review for ${bundle.label}`, `請求審查 ${bundle.label}`)}
                className="tertiary-action"
                onClick={() => recordDecision(bundle, 'review_requested')}
                type="button"
              >
                <ClipboardCheck size={15} aria-hidden="true" />
                {text(locale, 'Request review', '請求審查')}
              </button>
            </div>
          </article>
        );
      })}
    </section>
  );
}

function decisionLabel(decision: ReleaseDecision, locale: Locale) {
  if (decision === 'promoted') {
    return text(locale, 'Promoted', '已推進');
  }
  if (decision === 'review_requested') {
    return text(locale, 'Review requested', '已請求審查');
  }
  return text(locale, 'Release blocked', '已阻擋發布');
}

function decisionDetail(decision: ReleaseDecision, locale: Locale) {
  if (decision === 'promoted') {
    return text(
      locale,
      'Bundle can proceed to the configured rollout stage.',
      '此 bundle 可進入指定 rollout 階段。'
    );
  }
  if (decision === 'review_requested') {
    return text(
      locale,
      'Reviewer confirmation is required before the next release step.',
      '進入下一個發布步驟前需取得審查者確認。'
    );
  }
  return text(
    locale,
    'Bundle remains unavailable for rollout until release gates are corrected.',
    '發布門檻修正前，此 bundle 不可進入 rollout。'
  );
}
