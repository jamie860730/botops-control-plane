import type { EvalResult, ReleaseBundle } from '../types';
import { getBlockedReleaseReasons } from '../utils/metrics';

interface ReleaseCenterProps {
  bundles: ReleaseBundle[];
  evalResults: EvalResult[];
}

export function ReleaseCenter({ bundles, evalResults }: ReleaseCenterProps) {
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
                {blockedReasons.length > 0 ? 'blocked' : 'ready'}
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
                <p>All P0 release gates pass for seed-mode review.</p>
              )}
            </div>
          </article>
        );
      })}
    </section>
  );
}
