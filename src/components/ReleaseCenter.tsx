import { useState } from 'react';
import { Ban, CheckCircle2, ClipboardCheck } from 'lucide-react';
import type { Locale } from '../i18n';
import { text } from '../i18n';
import type { EvalResult, ReleaseBundle } from '../types';
import { getBlockedReleaseReasons } from '../utils/metrics';

export type ReleaseDecision = 'blocked' | 'promoted' | 'review_requested';

interface ReleaseCenterProps {
  bundles: ReleaseBundle[];
  evalResults: EvalResult[];
  locale: Locale;
  onReleaseDecision: (bundle: ReleaseBundle, decision: ReleaseDecision) => void;
}

export function ReleaseCenter({ bundles, evalResults, locale, onReleaseDecision }: ReleaseCenterProps) {
  const [decisions, setDecisions] = useState<Record<string, ReleaseDecision>>({});

  function recordDecision(bundle: ReleaseBundle, decision: ReleaseDecision) {
    setDecisions((current) => ({ ...current, [bundle.id]: decision }));
    onReleaseDecision(bundle, decision);
  }

  return (
    <section className="screen-grid release-grid" data-testid="release-center">
      {bundles.map((bundle) => {
        const blockedReasons = getBlockedReleaseReasons(bundle, evalResults);
        const decision = decisions[bundle.id];
        return (
          <article className="panel release-panel" key={bundle.id}>
            <div className="section-heading">
              <div>
                <p className="eyebrow">{bundle.status}</p>
                <h3>{bundle.label}</h3>
              </div>
              <span className={blockedReasons.length > 0 ? 'risk-pill high' : 'risk-pill low'}>
                {text(locale, blockedReasons.length > 0 ? 'blocked' : 'ready', blockedReasons.length > 0 ? 'blocked' : 'ready')}
              </span>
            </div>
            <dl className="mini-meta release-meta">
              <div>
                <dt>Prompt</dt>
                <dd>{bundle.promptVersion}</dd>
              </div>
              <div>
                <dt>KB</dt>
                <dd>{bundle.kbSnapshot}</dd>
              </div>
              <div>
                <dt>Retriever</dt>
                <dd>{bundle.retrievalConfig}</dd>
              </div>
            </dl>
            <div className={blockedReasons.length > 0 ? 'blocked-reasons fail' : 'blocked-reasons pass'}>
              {blockedReasons.length > 0 ? (
                blockedReasons.map((reason) => <p key={reason}>{reason}</p>)
              ) : (
                <p>{text(locale, 'All P0 release gates pass for seed-mode review.', '所有 P0 發布門檻皆已通過種子資料審查。')}</p>
              )}
            </div>
            {decision && (
              <div className="release-decision-banner" data-testid={`release-decision-${bundle.id}`}>
                <strong>{decisionLabel(decision, locale)}</strong>
                <p>{decisionDetail(decision, locale)}</p>
              </div>
            )}
            <div className="release-actions">
              <button
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
                className="secondary-action"
                onClick={() => recordDecision(bundle, 'blocked')}
                type="button"
              >
                <Ban size={15} aria-hidden="true" />
                {text(locale, 'Block release', '阻擋發布')}
              </button>
              <button
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
    return text(locale, 'Promoted to canary review', '已推進至 canary review');
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
      'Bundle can proceed to stakeholder or canary simulation review.',
      '此 bundle 可進入利害關係人或 canary simulation review。'
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
