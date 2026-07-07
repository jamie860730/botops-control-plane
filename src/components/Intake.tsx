import { ChevronDown, ChevronUp, Eye, SignalHigh } from 'lucide-react';
import { useState } from 'react';
import type { Locale } from '../i18n';
import { text } from '../i18n';
import type { SourceChannel, SupportScenario, SupportSignal } from '../types';
import {
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
  /** Unfiltered scenario list used to resolve a signal's related reply record. */
  allScenarios: SupportScenario[];
  onSourceChange: (source: SourceChannel | 'All') => void;
  onReviewInteraction: (id: string) => void;
}

/**
 * Resolves the scenario a signal belongs to. Signals and scenarios are linked by
 * duplicateClusterId first (same cluster), then by source channel as fallback.
 */
export function findRelatedScenario(
  signal: SupportSignal,
  scenarios: SupportScenario[]
): SupportScenario | undefined {
  if (signal.duplicateClusterId) {
    const clusterMatches = scenarios.filter((scenario) => scenario.duplicateClusterId === signal.duplicateClusterId);
    if (clusterMatches.length > 0) {
      return (
        clusterMatches.find((scenario) => scenario.sourceChannel === signal.sourceChannel) ?? clusterMatches[0]
      );
    }
  }
  return (
    scenarios.find(
      (scenario) => scenario.sourceChannel === signal.sourceChannel && scenario.product === signal.product
    ) ?? scenarios.find((scenario) => scenario.sourceChannel === signal.sourceChannel)
  );
}

export function Intake({
  locale,
  selectedSource,
  signals,
  scenarios,
  allScenarios,
  onSourceChange,
  onReviewInteraction
}: IntakeProps) {
  const [expandedSignalId, setExpandedSignalId] = useState<string | null>(null);

  return (
    <section className="screen-grid intake-grid">
      <div className="panel span-2">
        <div className="section-heading">
          <div>
            <p className="eyebrow">{text(locale, 'Multi-channel Intake', '多來源訊號接收')}</p>
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
          {signals.length === 0 && (
            <div className="empty-state">
              <strong>{text(locale, 'No signals from this source', '此來源目前沒有訊號')}</strong>
              <p>{text(locale, 'Try another source filter.', '請改用其他來源篩選。')}</p>
            </div>
          )}
          {signals.map((signal) => {
            const isExpanded = expandedSignalId === signal.id;
            const relatedScenario = findRelatedScenario(signal, allScenarios);
            return (
              <article className={isExpanded ? 'signal-row expanded' : 'signal-row'} key={signal.id}>
                <button
                  aria-expanded={isExpanded}
                  className="signal-row-toggle"
                  data-testid={`signal-toggle-${signal.id}`}
                  onClick={() => setExpandedSignalId(isExpanded ? null : signal.id)}
                  type="button"
                >
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
                  <span className="signal-row-meta">
                    <span className={`risk-pill ${signal.priority.toLowerCase()}`}>
                      {formatRiskLevel(locale, signal.priority)}
                    </span>
                    {isExpanded ? (
                      <ChevronUp size={15} aria-hidden="true" />
                    ) : (
                      <ChevronDown size={15} aria-hidden="true" />
                    )}
                  </span>
                </button>
                {isExpanded && (
                  <div className="signal-detail" data-testid={`signal-detail-${signal.id}`}>
                    <p className="signal-detail-text">{signal.rawText}</p>
                    {signal.attachmentsNote && <p className="signal-detail-text">{signal.attachmentsNote}</p>}
                    <dl className="compact-detail-list">
                      <div>
                        <dt>{text(locale, 'Source trust', '來源信任度')}</dt>
                        <dd>{formatRiskLevel(locale, signal.sourceTrust)}</dd>
                      </div>
                      <div>
                        <dt>{text(locale, 'Priority', '優先級')}</dt>
                        <dd>{formatRiskLevel(locale, signal.priority)}</dd>
                      </div>
                      <div>
                        <dt>{text(locale, 'Duplicate cluster', '重複叢集')}</dt>
                        <dd>{signal.duplicateClusterId ?? text(locale, 'Not clustered', '未歸入叢集')}</dd>
                      </div>
                      <div>
                        <dt>{text(locale, 'Region / Language / Product', '地區／語言／產品')}</dt>
                        <dd>{`${signal.region} · ${signal.language} · ${signal.product}`}</dd>
                      </div>
                    </dl>
                    {relatedScenario && (
                      <button
                        className="secondary-action compact-action"
                        data-testid={`signal-related-scenario-${signal.id}`}
                        onClick={() => onReviewInteraction(relatedScenario.id)}
                        type="button"
                      >
                        <Eye size={14} aria-hidden="true" />
                        {text(locale, 'View related reply record', '檢視相關回覆紀錄')}
                      </button>
                    )}
                  </div>
                )}
              </article>
            );
          })}
        </div>
      </div>

      <div className="panel span-2">
        <div className="section-heading">
          <div>
            <p className="eyebrow">{text(locale, 'Delivered replies', '已送出回覆清單')}</p>
            <h3>{text(locale, 'Open a reply to review its trace and evidence', '點開單筆回覆審查紀錄與證據')}</h3>
          </div>
          <span className="count-pill">
            {text(locale, `${scenarios.length} replies`, `${scenarios.length} 筆回覆`)}
          </span>
        </div>
        <div className="scenario-list" data-testid="scenario-list">
          {scenarios.length === 0 && (
            <div className="empty-state">
              <strong>{text(locale, 'No delivered replies from this source', '此來源目前沒有已送出回覆')}</strong>
              <p>{text(locale, 'Try another source filter.', '請改用其他來源篩選。')}</p>
            </div>
          )}
          {scenarios.map((scenario) => (
            <article className="scenario-row" data-testid={`scenario-row-${scenario.id}`} key={scenario.id}>
              <div className="scenario-row-main">
                <strong>{formatScenarioTitle(locale, scenario.title)}</strong>
                <div className="scenario-row-meta">
                  <span>{formatSourceChannel(locale, scenario.sourceChannel)}</span>
                  <span className="tag-pill">{formatRiskTag(locale, scenario.riskTag)}</span>
                  <span>{scenario.region}</span>
                </div>
              </div>
              <button
                aria-label={text(
                  locale,
                  `Review live reply and trace for ${scenario.title}`,
                  `檢視 ${formatScenarioTitle(locale, scenario.title)} 的回覆與處理紀錄`
                )}
                className="inline-action scenario-row-action"
                onClick={() => onReviewInteraction(scenario.id)}
                type="button"
              >
                <Eye size={14} aria-hidden="true" />
                {text(locale, 'View reply & trace', '檢視回覆與紀錄')}
              </button>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
