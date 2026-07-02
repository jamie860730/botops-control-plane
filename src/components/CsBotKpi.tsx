import { ArrowDownRight, ArrowRight, ArrowUpRight, BarChart3 } from 'lucide-react';
import type { Locale } from '../i18n';
import { text } from '../i18n';
import type { CsBotKpiMetric, CsBotKpiSegment } from '../types';

interface CsBotKpiProps {
  locale: Locale;
  metrics: CsBotKpiMetric[];
  segments: CsBotKpiSegment[];
}

export function CsBotKpi({ locale, metrics, segments }: CsBotKpiProps) {
  const labels = {
    segment: text(locale, 'Segment', '分群'),
    volume: text(locale, 'Volume', '量體'),
    autoResolve: text(locale, 'Auto-resolve', '自動解決'),
    handoff: text(locale, 'Handoff', '人工交接'),
    citationFail: text(locale, 'Citation fail', '引用失敗'),
    repeatContact: text(locale, 'Repeat contact', '重複進線'),
    slaRisk: text(locale, 'SLA risk', 'SLA 風險'),
  };

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
        <div className="cs-kpi-metric-grid">
          {metrics.map((metric) => (
            <article className={`cs-kpi-card ${metric.status}`} key={metric.id}>
              <div className="row-title">
                <strong>{metric.label}</strong>
                <span>{metric.target}</span>
              </div>
              <div className="cs-kpi-value-row">
                <strong>{metric.value}</strong>
                <TrendIcon trend={metric.trend} />
              </div>
              <p>{metric.insight}</p>
            </article>
          ))}
        </div>
      </div>
      <div className="panel">
        <p className="eyebrow">{text(locale, 'KPI watchlist', 'KPI 關注清單')}</p>
        <h3>{text(locale, 'User cases behind the KPI movement', 'KPI 變動背後的用戶案例')}</h3>
        <p>
          {text(
            locale,
            'Segment movement by source channel, case cluster, and accountable owner.',
            '依來源渠道、案例群與負責 owner 追蹤分群變化。'
          )}
        </p>
      </div>
      <div className="panel span-2">
        <div className="section-heading">
          <div>
            <p className="eyebrow">{text(locale, 'Segment Drilldown', '分群分析')}</p>
            <h3>{text(locale, 'Channel and case-type KPI review', '依渠道與案例類型檢視 KPI')}</h3>
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
          </div>
          {segments.map((segment) => (
            <div className="table-row cs-kpi-row" key={segment.id}>
              <span data-label={labels.segment}>
                <strong>{segment.segment}</strong>
                <small>{segment.sourceChannel}</small>
              </span>
              <span data-label={labels.volume}>{segment.volume.toLocaleString()}</span>
              <span data-label={labels.autoResolve}>{formatRate(segment.autoResolutionRate)}</span>
              <span data-label={labels.handoff}>{formatRate(segment.handoffRate)}</span>
              <span data-label={labels.citationFail}>{formatRate(segment.citationFailureRate)}</span>
              <span data-label={labels.repeatContact}>{formatRate(segment.repeatContactRate)}</span>
              <span data-label={labels.slaRisk}>{segment.slaRiskCount}</span>
              <p>{segment.reviewFocus}</p>
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
