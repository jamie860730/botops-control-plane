import type { Badcase } from '../types';

interface ErrorAnalysisProps {
  badcases: Badcase[];
}

export function ErrorAnalysis({ badcases }: ErrorAnalysisProps) {
  return (
    <section className="screen-grid" data-testid="error-analysis">
      <div className="panel">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Error Analysis</p>
            <h3>Badcases become product work items</h3>
          </div>
        </div>
        <div className="stacked-list">
          {badcases.map((badcase) => (
            <article className="badcase-row" key={badcase.id}>
              <strong>{badcase.title}</strong>
              <span>{badcase.failureLabel}</span>
              <p>{badcase.observedCase}</p>
            </article>
          ))}
        </div>
      </div>
      <div className="panel span-2">
        <p className="eyebrow">Badcase detail</p>
        <h3>{badcases[0]?.title}</h3>
        <dl className="detail-list">
          <div>
            <dt>Low-score dimension</dt>
            <dd>{badcases[0]?.lowScoreDimension}</dd>
          </div>
          <div>
            <dt>Trace diagnosis</dt>
            <dd>{badcases[0]?.traceDiagnosis}</dd>
          </div>
          <div>
            <dt>Chain node to change</dt>
            <dd>{badcases[0]?.chainNodeToChange}</dd>
          </div>
          <div>
            <dt>Modification</dt>
            <dd>{badcases[0]?.modification}</dd>
          </div>
          <div>
            <dt>Retest metric</dt>
            <dd>{badcases[0]?.retestMetric}</dd>
          </div>
        </dl>
      </div>
    </section>
  );
}
