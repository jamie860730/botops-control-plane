import { calculateEvaluationSummary } from '../utils/metrics';
import type { SeedData } from '../types';
import type { Locale } from '../i18n';
import { text } from '../i18n';

interface OverviewDashboardProps {
  data: SeedData;
  locale: Locale;
}

export function OverviewDashboard({ data, locale }: OverviewDashboardProps) {
  const summary = calculateEvaluationSummary(data.evalResults, 'run_v19_candidate');
  const sourceCounts = data.supportSignals.reduce<Record<string, number>>((counts, signal) => {
    counts[signal.sourceChannel] = (counts[signal.sourceChannel] ?? 0) + 1;
    return counts;
  }, {});
  const activeTicketCount = data.supportTickets.filter((ticket) => ticket.status !== 'Resolved').length;
  const reindexCount = data.knowledgeDocuments.filter((document) => document.indexStatus === 'Needs re-index').length;
  const blockedReleaseCount = data.releaseBundles.filter((bundle) => bundle.status === 'Blocked').length;
  const operations = [
    {
      name: text(locale, 'Signals awaiting review', '待審訊號'),
      value: data.supportSignals.length,
      detail: text(locale, 'Prioritize sources with repeated post-reply issues.', '優先處理重複出現回覆後問題的來源。')
    },
    {
      name: text(locale, 'Active support tickets', '進行中工單'),
      value: activeTicketCount,
      detail: text(locale, 'Track escalated queues, owners, and SLA exposure.', '追蹤升級隊列、負責人與 SLA 風險。')
    },
    {
      name: text(locale, 'Knowledge items to re-index', '需重建索引文件'),
      value: reindexCount,
      detail: text(locale, 'Refresh retrieval evidence before expanding automation.', '擴大自動化前先更新檢索依據。')
    },
    {
      name: text(locale, 'Blocked releases', '阻擋發布'),
      value: blockedReleaseCount,
      detail: text(locale, 'Resolve failed gates before rollout.', '修正未通過門檻後才可 rollout。')
    }
  ];

  return (
    <section className="screen-grid overview-grid">
      <div className="panel overview-kpi">
        <div className="section-heading">
          <div>
            <p className="eyebrow">KPI Dashboard</p>
            <h3>{text(locale, 'Quality gates for support automation', '客服自動化品質門檻')}</h3>
          </div>
        </div>
        <div className="metric-grid">
          <Metric label={text(locale, 'Overall Quality', '整體品質')} value={summary.overallQualityScore.toFixed(2)} />
          <Metric label={text(locale, 'Citation Support', '引用支撐率')} value={summary.citationSupportRate.toFixed(2)} />
          <Metric label={text(locale, 'Handoff Safety Recall', '交接召回率')} value={summary.handoffSafetyRecall.toFixed(2)} />
          <Metric label={text(locale, 'High-risk Auto-answer', '高風險自動回覆')} value={summary.highRiskAutoAnswerRate.toFixed(2)} danger />
        </div>
      </div>
      <div className="panel overview-source">
        <div className="section-heading">
          <div>
            <p className="eyebrow">{text(locale, 'Source Distribution', '來源分布')}</p>
            <h3>{text(locale, 'Support signal ingress by source', '客服訊號來源分布')}</h3>
          </div>
        </div>
        <div className="stacked-list">
          {Object.entries(sourceCounts).map(([source, count]) => (
            <div className="distribution-row" key={source}>
              <span>{source}</span>
              <strong>{count}</strong>
            </div>
          ))}
        </div>
      </div>
      <div className="panel overview-map">
        <div className="section-heading">
          <div>
            <p className="eyebrow">{text(locale, 'Work status', '工作狀態')}</p>
            <h3>{text(locale, 'Queues requiring operational attention', '需要營運處理的隊列')}</h3>
          </div>
        </div>
        <div className="page-purpose-grid">
          {operations.map((operation) => (
            <article className="page-purpose" key={operation.name}>
              <strong>{operation.value}</strong>
              <p>{operation.name}</p>
              <p>{operation.detail}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function Metric({ label, value, danger = false }: { label: string; value: string; danger?: boolean }) {
  return (
    <div className={danger ? 'metric-tile danger' : 'metric-tile'}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
