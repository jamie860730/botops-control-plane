import { calculateEvaluationSummary } from '../utils/metrics';
import type { SeedData } from '../types';

interface OverviewDashboardProps {
  data: SeedData;
}

export function OverviewDashboard({ data }: OverviewDashboardProps) {
  const summary = calculateEvaluationSummary(data.evalResults, 'run_v19_candidate');
  const sourceCounts = data.supportSignals.reduce<Record<string, number>>((counts, signal) => {
    counts[signal.sourceChannel] = (counts[signal.sourceChannel] ?? 0) + 1;
    return counts;
  }, {});

  return (
    <section className="screen-grid">
      <div className="panel span-2">
        <div className="section-heading">
          <div>
            <p className="eyebrow">KPI Dashboard</p>
            <h3>Offline quality gates for the candidate support flow</h3>
          </div>
        </div>
        <div className="metric-grid">
          <Metric label="Overall Quality" value={summary.overallQualityScore.toFixed(2)} />
          <Metric label="Citation Support" value={summary.citationSupportRate.toFixed(2)} />
          <Metric label="Handoff Safety Recall" value={summary.handoffSafetyRecall.toFixed(2)} />
          <Metric label="High-risk Auto-answer" value={summary.highRiskAutoAnswerRate.toFixed(2)} danger />
        </div>
      </div>
      <div className="panel">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Source Distribution</p>
            <h3>Where support signals enter</h3>
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
      <div className="panel span-2">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Product map</p>
            <h3>What each page proves in the bot management loop</h3>
          </div>
        </div>
        <div className="page-purpose-grid">
          {pagePurposes.map((page) => (
            <article className="page-purpose" key={page.name}>
              <strong>{page.name}</strong>
              <p>{page.purpose}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

const pagePurposes = [
  {
    name: 'Intake',
    purpose: 'Monitor live support signals from Web/App Chat, X, LINE, Telegram, Discord, and internal reports after the bot has replied.'
  },
  {
    name: 'Chat + Trace',
    purpose: 'Review the live bot answer and retained trace: source, retrieval, citation, safety, verification, and handoff decisions.'
  },
  {
    name: 'Knowledge',
    purpose: 'Manage RAG documents, chunks, KB snapshots, index status, retrieval config, and highlighted evidence from the trace.'
  },
  {
    name: 'Evaluation',
    purpose: 'Replay saved interactions against candidate and baseline flows, then export summary metrics for product review.'
  },
  {
    name: 'Error Analysis',
    purpose: 'Turn failed eval cases into actionable PM, bot ops, knowledge, or compliance fixes.'
  },
  {
    name: 'Handoff',
    purpose: 'Package high-risk cases for human queues with required fields, summary, and explicit safety warnings.'
  },
  {
    name: 'Release Center',
    purpose: 'Block unsafe bot versions when regression, citation, or high-risk auto-answer gates fail.'
  },
  {
    name: 'Ops Log',
    purpose: 'Persist scenario runs, eval saves, eval runner actions, and exports as an audit trail.'
  }
];

function Metric({ label, value, danger = false }: { label: string; value: string; danger?: boolean }) {
  return (
    <div className={danger ? 'metric-tile danger' : 'metric-tile'}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
