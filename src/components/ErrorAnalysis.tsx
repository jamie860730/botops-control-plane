import type { Badcase } from '../types';
import type { Locale } from '../i18n';
import { text } from '../i18n';
import { formatBadcaseText } from '../utils/display';

interface ErrorAnalysisProps {
  badcases: Badcase[];
  locale: Locale;
}

export function ErrorAnalysis({ badcases, locale }: ErrorAnalysisProps) {
  const selectedBadcase = badcases[0];

  return (
    <section className="screen-grid" data-testid="error-analysis">
      <div className="panel">
        <div className="section-heading">
          <div>
            <p className="eyebrow">{text(locale, 'Error Analysis', '錯誤分析')}</p>
            <h3>{text(locale, 'Failed cases requiring product fixes', '需要修正的失敗案例')}</h3>
          </div>
        </div>
        <div className="stacked-list">
          {badcases.map((badcase) => (
            <article className="badcase-row" key={badcase.id}>
              <div className="row-title">
                <strong>{formatBadcaseText(locale, badcase.title)}</strong>
                <span>{formatBadcaseText(locale, badcase.failureLabel)}</span>
                <span>{formatBadcaseText(locale, badcase.status)}</span>
              </div>
              <p>{formatBadcaseText(locale, badcase.observedCase)}</p>
            </article>
          ))}
        </div>
      </div>
      <div className="panel span-2">
        <p className="eyebrow">{text(locale, 'Failure detail', '失敗案例詳情')}</p>
        <h3>{selectedBadcase ? formatBadcaseText(locale, selectedBadcase.title) : ''}</h3>
        <dl className="detail-list">
          <div>
            <dt>{text(locale, 'Low-score dimension', '低分項目')}</dt>
            <dd>{selectedBadcase ? formatBadcaseText(locale, selectedBadcase.lowScoreDimension) : ''}</dd>
          </div>
          <div>
            <dt>{text(locale, 'Trace diagnosis', '追蹤診斷')}</dt>
            <dd>{selectedBadcase ? formatBadcaseText(locale, selectedBadcase.traceDiagnosis) : ''}</dd>
          </div>
          <div>
            <dt>{text(locale, 'Chain node to change', '需調整節點')}</dt>
            <dd>{selectedBadcase ? formatBadcaseText(locale, selectedBadcase.chainNodeToChange) : ''}</dd>
          </div>
          <div>
            <dt>{text(locale, 'Modification', '調整方式')}</dt>
            <dd>{selectedBadcase ? formatBadcaseText(locale, selectedBadcase.modification) : ''}</dd>
          </div>
          <div>
            <dt>{text(locale, 'Retest metric', '重測指標')}</dt>
            <dd>{selectedBadcase ? formatBadcaseText(locale, selectedBadcase.retestMetric) : ''}</dd>
          </div>
          <div>
            <dt>{text(locale, 'Owner', '負責單位')}</dt>
            <dd>{selectedBadcase ? formatBadcaseText(locale, selectedBadcase.owner) : ''}</dd>
          </div>
        </dl>
      </div>
    </section>
  );
}
