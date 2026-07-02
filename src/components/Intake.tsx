import { Eye, SignalHigh } from 'lucide-react';
import type { Locale } from '../i18n';
import { text } from '../i18n';
import type { SourceChannel, SupportScenario, SupportSignal } from '../types';
import {
  formatExpectedBehavior,
  formatReporterType,
  formatRiskLevel,
  formatRiskTag,
  formatScenarioTitle,
  formatSourceChannel
} from '../utils/display';

const sourceChannels: (SourceChannel | 'All')[] = [
  'All',
  'Web/App Chat',
  'X',
  'LINE',
  'Telegram',
  'Discord',
  'Internal Report'
];

interface IntakeProps {
  locale: Locale;
  selectedSource: SourceChannel | 'All';
  signals: SupportSignal[];
  scenarios: SupportScenario[];
  onSourceChange: (source: SourceChannel | 'All') => void;
  onReviewInteraction: (id: string) => void;
}

export function Intake({
  locale,
  selectedSource,
  signals,
  scenarios,
  onSourceChange,
  onReviewInteraction
}: IntakeProps) {
  return (
    <section className="screen-grid intake-grid">
      <div className="panel span-2">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Multi-channel Intake</p>
            <h3>{text(locale, 'Monitor post-reply signals across sources', '監控多來源回覆後訊號')}</h3>
          </div>
          <span className="count-pill">
            {text(locale, `${signals.length} signals`, `${signals.length} 筆訊號`)}
          </span>
        </div>
        <div className="source-tabs" aria-label={text(locale, 'Source filters', '來源篩選')}>
          {sourceChannels.map((source) => (
            <button
              key={source}
              aria-pressed={selectedSource === source}
              className={selectedSource === source ? 'chip selected' : 'chip'}
              onClick={() => onSourceChange(source)}
              type="button"
            >
              {formatSourceChannel(locale, source)}
            </button>
          ))}
        </div>
        <div className="signal-list" data-testid="support-signal-list">
          {signals.map((signal) => (
            <article className="signal-row" key={signal.id}>
              <div className="row-icon">
                <SignalHigh size={16} aria-hidden="true" />
              </div>
              <div>
                <div className="row-title">
                  <strong>{formatSourceChannel(locale, signal.sourceChannel)}</strong>
                  <span>{formatReporterType(locale, signal.reporterType)}</span>
                  <span>{signal.region}</span>
                </div>
                <p>{signal.rawText}</p>
              </div>
              <span className={`risk-pill ${signal.priority.toLowerCase()}`}>
                {formatRiskLevel(locale, signal.priority)}
              </span>
            </article>
          ))}
        </div>
      </div>

      <div className="panel">
        <div className="section-heading">
          <div>
            <p className="eyebrow">{text(locale, 'Interaction review queue', '互動審查佇列')}</p>
            <h3>{text(locale, 'Inspect delivered bot replies and retained traces', '檢視已送出回覆與處理紀錄')}</h3>
          </div>
        </div>
        <div className="scenario-list" data-testid="scenario-list">
          {scenarios.map((scenario) => (
            <article className="scenario-card" key={scenario.id}>
              <div>
                <strong>{formatScenarioTitle(locale, scenario.title)}</strong>
                <p>{formatExpectedBehavior(locale, scenario.expectedBehavior)}</p>
              </div>
              <dl className="mini-meta">
                <div>
                  <dt>{text(locale, 'Source', '來源')}</dt>
                  <dd>{formatSourceChannel(locale, scenario.sourceChannel)}</dd>
                </div>
                <div>
                  <dt>{text(locale, 'Risk', '風險')}</dt>
                  <dd>{formatRiskTag(locale, scenario.riskTag)}</dd>
                </div>
                <div>
                  <dt>{text(locale, 'Region', '地區')}</dt>
                  <dd>{scenario.region}</dd>
                </div>
              </dl>
              <button
                aria-label={text(
                  locale,
                  `Review live reply and trace for ${scenario.title}`,
                  `檢視 ${formatScenarioTitle(locale, scenario.title)} 的回覆與處理紀錄`
                )}
                className="primary-action"
                onClick={() => onReviewInteraction(scenario.id)}
                type="button"
              >
                <Eye size={15} aria-hidden="true" />
                {text(locale, 'Inspect reply + trace', '檢視回覆與紀錄')}
              </button>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
