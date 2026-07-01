import type { Badcase } from '../types';
import type { Locale } from '../i18n';
import { text } from '../i18n';

interface ErrorAnalysisProps {
  badcases: Badcase[];
  locale: Locale;
}

export function ErrorAnalysis({ badcases, locale }: ErrorAnalysisProps) {
  return (
    <section className="screen-grid" data-testid="error-analysis">
      <div className="panel">
        <div className="section-heading">
          <div>
            <p className="eyebrow">{text(locale, 'Error Analysis', '錯誤分析')}</p>
            <h3>{text(locale, 'Badcases become product work items', '把 badcases 轉成產品修正任務')}</h3>
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
        <p className="eyebrow">{text(locale, 'Badcase detail', 'Badcase 詳情')}</p>
        <h3>{badcases[0]?.title}</h3>
        <dl className="detail-list">
          <div>
            <dt>{text(locale, 'Low-score dimension', '低分維度')}</dt>
            <dd>{badcases[0]?.lowScoreDimension}</dd>
          </div>
          <div>
            <dt>{text(locale, 'Trace diagnosis', 'Trace 診斷')}</dt>
            <dd>{badcases[0]?.traceDiagnosis}</dd>
          </div>
          <div>
            <dt>{text(locale, 'Chain node to change', '需修改節點')}</dt>
            <dd>{badcases[0]?.chainNodeToChange}</dd>
          </div>
          <div>
            <dt>{text(locale, 'Modification', '修改方式')}</dt>
            <dd>{badcases[0]?.modification}</dd>
          </div>
          <div>
            <dt>{text(locale, 'Retest metric', '重測指標')}</dt>
            <dd>{badcases[0]?.retestMetric}</dd>
          </div>
        </dl>
      </div>
    </section>
  );
}
