import { ArrowDownRight, ArrowRight, ArrowUpRight, BarChart3 } from 'lucide-react';
import { useRef, useState } from 'react';
import type { Locale } from '../i18n';
import { text } from '../i18n';
import type { CsBotKpiMetric, CsBotKpiSegment, SourceChannel } from '../types';
import { formatDisplayText, formatSourceChannel } from '../utils/display';

interface CsBotKpiProps {
  locale: Locale;
  metrics: CsBotKpiMetric[];
  segments: CsBotKpiSegment[];
  /** Opens the Conversations view pre-filtered to the segment's source channel. */
  onViewConversations: (sourceChannel: SourceChannel | 'All') => void;
}

export function CsBotKpi({ locale, metrics, segments, onViewConversations }: CsBotKpiProps) {
  const [focusedMetricId, setFocusedMetricId] = useState<string | null>(null);
  const metricGridRef = useRef<HTMLDivElement>(null);
  const watchlistMetrics = metrics.filter((metric) => metric.status === 'risk' || metric.status === 'watch');
  const labels = {
    segment: text(locale, 'Segment', '分群'),
    volume: text(locale, 'Volume', '量體'),
    autoResolve: text(locale, 'Auto-resolve', '自動解決'),
    handoff: text(locale, 'Handoff', '人工交接'),
    citationFail: text(locale, 'Citation fail', '引用失敗'),
    repeatContact: text(locale, 'Repeat contact', '重複進線'),
    slaRisk: text(locale, 'SLA risk', 'SLA 風險'),
    action: text(locale, 'Action', '操作')
  };

  function focusMetric(metricId: string) {
    setFocusedMetricId(metricId);
    requestAnimationFrame(() => {
      metricGridRef.current
        ?.querySelector(`[data-metric-id="${metricId}"]`)
        ?.scrollIntoView?.({ behavior: 'smooth', block: 'center' });
    });
  }

  return (
    <section className="screen-grid kpi-grid" data-testid="cs-bot-kpi">
      <div className="panel span-2">
        <div className="section-heading">
          <div>
            <p className="eyebrow">{text(locale, 'CS Bot KPI', '客服 Bot KPI')}</p>
            <h3>{text(locale, 'Operational metrics for bot quality and support impact', '機器人品質與客服營運影響指標')}</h3>
          </div>
          <BarChart3 size={26} aria-hidden="true" />
        </div>
        <div className="cs-kpi-metric-grid" ref={metricGridRef}>
          {metrics.map((metric) => (
            <article
              className={
                metric.id === focusedMetricId ? `cs-kpi-card ${metric.status} focused` : `cs-kpi-card ${metric.status}`
              }
              data-metric-id={metric.id}
              data-testid={`kpi-card-${metric.id}`}
              key={metric.id}
            >
              <div className="row-title">
                <strong>{formatDisplayText(locale, metric.label)}</strong>
                <span>{metric.target}</span>
              </div>
              <div className="cs-kpi-value-row">
                <strong>{metric.value}</strong>
                <TrendIcon trend={metric.trend} />
              </div>
              <p>{formatDisplayText(locale, metric.insight)}</p>
            </article>
          ))}
        </div>
      </div>
      <div className="panel" data-testid="kpi-watchlist">
        <p className="eyebrow">{text(locale, 'KPI watchlist', 'KPI 關注清單')}</p>
        <h3>{text(locale, 'Metrics off target that need review', '偏離目標、需要追蹤的指標')}</h3>
        {watchlistMetrics.length > 0 ? (
          <div className="kpi-watchlist-list">
            {watchlistMetrics.map((metric) => (
              <button
                className={
                  metric.id === focusedMetricId ? 'kpi-watchlist-item selected' : 'kpi-watchlist-item'
                }
                data-testid={`kpi-watchlist-${metric.id}`}
                key={metric.id}
                onClick={() => focusMetric(metric.id)}
                type="button"
              >
                <span className="row-title">
                  <strong>{formatDisplayText(locale, metric.label)}</strong>
                  <span className={metric.status === 'risk' ? 'risk-pill high' : 'risk-pill medium'}>
                    {metric.status === 'risk' ? text(locale, 'Risk', '風險') : text(locale, 'Watch', '關注')}
                  </span>
                </span>
                <p>{formatDisplayText(locale, metric.insight)}</p>
              </button>
            ))}
          </div>
        ) : (
          <p>{text(locale, 'All KPI metrics are currently on target.', '目前所有 KPI 指標皆在目標範圍內。')}</p>
        )}
      </div>
      <div className="panel span-2">
        <div className="section-heading">
          <div>
            <p className="eyebrow">{text(locale, 'Segment Drilldown', '分群分析')}</p>
            <h3>{text(locale, 'Source and case-type KPI review', '依來源與案例類型檢視 KPI')}</h3>
          </div>
        </div>
        <div className="data-table">
          <div className="table-row table-head cs-kpi-row">
            <span>{labels.segment}</span>
            <span>{labels.volume}</span>
            <span>{labels.autoResolve}</span>
            <span>{labels.handoff}</span>
            <span>{labels.citationFail}</span>
            <span>{labels.repeatContact}</span>
            <span>{labels.slaRisk}</span>
            <span>{labels.action}</span>
          </div>
          {segments.map((segment) => (
            <div className="table-row cs-kpi-row" key={segment.id}>
              <span data-label={labels.segment}>
                <strong>{formatDisplayText(locale, segment.segment)}</strong>
                <small>{formatSourceChannel(locale, segment.sourceChannel)}</small>
              </span>
              <span data-label={labels.volume}>{segment.volume.toLocaleString()}</span>
              <span data-label={labels.autoResolve}>{formatRate(segment.autoResolutionRate)}</span>
              <span data-label={labels.handoff}>{formatRate(segment.handoffRate)}</span>
              <span data-label={labels.citationFail}>{formatRate(segment.citationFailureRate)}</span>
              <span data-label={labels.repeatContact}>{formatRate(segment.repeatContactRate)}</span>
              <span data-label={labels.slaRisk}>{segment.slaRiskCount}</span>
              <span data-label={labels.action}>
                <button
                  aria-label={text(
                    locale,
                    `View conversations for ${segment.segment}`,
                    `檢視 ${formatDisplayText(locale, segment.segment)} 的對話`
                  )}
                  className="table-action"
                  data-testid={`segment-drilldown-${segment.id}`}
                  onClick={() => onViewConversations(segment.sourceChannel)}
                  type="button"
                >
                  {text(locale, 'View conversations', '檢視對話')}
                </button>
              </span>
              <p>{formatDisplayText(locale, segment.reviewFocus)}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function TrendIcon({ trend }: { trend: CsBotKpiMetric['trend'] }) {
  if (trend === 'up') {
    return <ArrowUpRight size={17} aria-label="up" />;
  }
  if (trend === 'down') {
    return <ArrowDownRight size={17} aria-label="down" />;
  }
  return <ArrowRight size={17} aria-label="flat" />;
}

function formatRate(value: number) {
  return `${Math.round(value * 100)}%`;
}
