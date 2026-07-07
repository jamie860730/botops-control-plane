import { X } from 'lucide-react';
import { useState } from 'react';
import type { Badcase } from '../types';
import type { Locale } from '../i18n';
import { text } from '../i18n';
import { formatBadcaseText } from '../utils/display';

interface ErrorAnalysisProps {
  badcases: Badcase[];
  locale: Locale;
}

export function ErrorAnalysis({ badcases, locale }: ErrorAnalysisProps) {
  const [selectedBadcaseId, setSelectedBadcaseId] = useState<string | null>(null);
  const [statusById, setStatusById] = useState<Record<string, Badcase['status']>>(() =>
    Object.fromEntries(badcases.map((badcase) => [badcase.id, badcase.status]))
  );
  const selectedBadcase = badcases.find((badcase) => badcase.id === selectedBadcaseId);

  return (
    <section className="screen-grid error-grid" data-testid="error-analysis">
      <div className="panel">
        <div className="section-heading">
          <div>
            <p className="eyebrow">{text(locale, 'Error Analysis', '錯誤分析')}</p>
            <h3>{text(locale, 'Failed cases requiring product fixes', '需要修正的失敗案例')}</h3>
          </div>
        </div>
        <div className="stacked-list">
          {badcases.map((badcase) => (
            <article className="badcase-row badcase-action-row" key={badcase.id}>
              <div className="row-title">
                <strong>{formatBadcaseText(locale, badcase.title)}</strong>
                <span>{formatBadcaseText(locale, badcase.failureLabel)}</span>
              </div>
              <p>{formatBadcaseText(locale, badcase.observedCase)}</p>
              <div className="badcase-controls">
                <label>
                  <span>{text(locale, 'Status', '狀態')}</span>
                  <select
                    aria-label={text(
                      locale,
                      `Status for ${badcase.title}`,
                      `${formatBadcaseText(locale, badcase.title)} 狀態`
                    )}
                    onChange={(event) =>
                      setStatusById((current) => ({
                        ...current,
                        [badcase.id]: event.target.value as Badcase['status']
                      }))
                    }
                    value={statusById[badcase.id] ?? badcase.status}
                  >
                    <option value="Open">{formatBadcaseText(locale, 'Open')}</option>
                    <option value="In review">{formatBadcaseText(locale, 'In review')}</option>
                    <option value="Fixed">{formatBadcaseText(locale, 'Fixed')}</option>
                  </select>
                </label>
                <button className="inline-action" onClick={() => setSelectedBadcaseId(badcase.id)} type="button">
                  {text(locale, 'Open record', '開啟紀錄')}
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>
      {selectedBadcase && (
        <div
          aria-labelledby="badcase-detail-title"
          aria-modal="true"
          className="modal-backdrop"
          data-testid="badcase-detail-modal"
          role="dialog"
        >
          <div className="modal-panel">
            <div className="section-heading">
              <div>
                <p className="eyebrow">{text(locale, 'Failure detail', '失敗案例詳情')}</p>
                <h3 id="badcase-detail-title">{formatBadcaseText(locale, selectedBadcase.title)}</h3>
              </div>
              <button
                aria-label={text(locale, 'Close failure detail', '關閉失敗案例詳情')}
                className="icon-button"
                onClick={() => setSelectedBadcaseId(null)}
                type="button"
              >
                <X size={17} aria-hidden="true" />
              </button>
            </div>
            <dl className="detail-list">
              <div>
                <dt>{text(locale, 'Low-score dimension', '低分項目')}</dt>
                <dd>{formatBadcaseText(locale, selectedBadcase.lowScoreDimension)}</dd>
              </div>
              <div>
                <dt>{text(locale, 'Trace diagnosis', '追蹤診斷')}</dt>
                <dd>{formatBadcaseText(locale, selectedBadcase.traceDiagnosis)}</dd>
              </div>
              <div>
                <dt>{text(locale, 'Chain node to change', '需調整節點')}</dt>
                <dd>{formatBadcaseText(locale, selectedBadcase.chainNodeToChange)}</dd>
              </div>
              <div>
                <dt>{text(locale, 'Modification', '調整方式')}</dt>
                <dd>{formatBadcaseText(locale, selectedBadcase.modification)}</dd>
              </div>
              <div>
                <dt>{text(locale, 'Retest metric', '重測指標')}</dt>
                <dd>{formatBadcaseText(locale, selectedBadcase.retestMetric)}</dd>
              </div>
              <div>
                <dt>{text(locale, 'Owner', '負責單位')}</dt>
                <dd>{formatBadcaseText(locale, selectedBadcase.owner)}</dd>
              </div>
              <div>
                <dt>{text(locale, 'Status', '狀態')}</dt>
                <dd>{formatBadcaseText(locale, statusById[selectedBadcase.id] ?? selectedBadcase.status)}</dd>
              </div>
            </dl>
          </div>
        </div>
      )}
    </section>
  );
}
