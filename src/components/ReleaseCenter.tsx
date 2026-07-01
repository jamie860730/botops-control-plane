import { Ban, CheckCircle2 } from 'lucide-react';
import type { Locale } from '../i18n';
import { text } from '../i18n';
import type { EvalResult, ReleaseBundle } from '../types';
import { getBlockedReleaseReasons } from '../utils/metrics';

interface ReleaseCenterProps {
  bundles: ReleaseBundle[];
  evalResults: EvalResult[];
  locale: Locale;
  onReleaseDecision: (bundle: ReleaseBundle, decision: 'blocked' | 'ready') => void;
}

export function ReleaseCenter({ bundles, evalResults, locale, onReleaseDecision }: ReleaseCenterProps) {
  return (
    <section className="screen-grid" data-testid="release-center">
      {bundles.map((bundle) => {
        const blockedReasons = getBlockedReleaseReasons(bundle, evalResults);
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
            <div className="blocked-reasons">
              {blockedReasons.length > 0 ? (
                blockedReasons.map((reason) => <p key={reason}>{reason}</p>)
              ) : (
                <p>{text(locale, 'All P0 release gates pass for seed-mode review.', '所有 P0 發布門檻皆通過 seed-mode review。')}</p>
              )}
            </div>
            <div className="release-actions">
              {blockedReasons.length > 0 ? (
                <button
                  className="secondary-action"
                  onClick={() => onReleaseDecision(bundle, 'blocked')}
                  type="button"
                >
                  <Ban size={15} aria-hidden="true" />
                  {text(locale, 'Keep blocked', '維持阻擋')}
                </button>
              ) : (
                <button
                  className="primary-action compact-action"
                  onClick={() => onReleaseDecision(bundle, 'ready')}
                  type="button"
                >
                  <CheckCircle2 size={15} aria-hidden="true" />
                  {text(locale, 'Mark ready for review', '標記為可審查')}
                </button>
              )}
            </div>
          </article>
        );
      })}
    </section>
  );
}
