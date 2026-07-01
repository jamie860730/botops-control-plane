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

  return (
    <section className="screen-grid">
      <div className="panel span-2">
        <div className="section-heading">
          <div>
            <p className="eyebrow">KPI Dashboard</p>
            <h3>{text(locale, 'Offline quality gates for the candidate support flow', '候選客服流程的離線品質門檻')}</h3>
          </div>
        </div>
        <div className="metric-grid">
          <Metric label={text(locale, 'Overall Quality', '整體品質')} value={summary.overallQualityScore.toFixed(2)} />
          <Metric label={text(locale, 'Citation Support', '引用支撐率')} value={summary.citationSupportRate.toFixed(2)} />
          <Metric label={text(locale, 'Handoff Safety Recall', '交接召回率')} value={summary.handoffSafetyRecall.toFixed(2)} />
          <Metric label={text(locale, 'High-risk Auto-answer', '高風險自動回覆')} value={summary.highRiskAutoAnswerRate.toFixed(2)} danger />
        </div>
      </div>
      <div className="panel">
        <div className="section-heading">
          <div>
            <p className="eyebrow">{text(locale, 'Source Distribution', '來源分布')}</p>
            <h3>{text(locale, 'Where support signals enter', '客服訊號從哪裡進來')}</h3>
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
            <p className="eyebrow">{text(locale, 'Product map', '產品地圖')}</p>
            <h3>{text(locale, 'What each page proves in the bot management loop', '每個頁面在 Bot 管理閉環中證明什麼')}</h3>
          </div>
        </div>
        <div className="page-purpose-grid">
          {pagePurposes.map((page) => (
            <article className="page-purpose" key={page.name}>
              <strong>{text(locale, page.name, page.nameZh)}</strong>
              <p>{text(locale, page.purpose, page.purposeZh)}</p>
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
    nameZh: '訊號收件匣',
    purpose: 'Monitor live support signals from Web/App Chat, X, LINE, Telegram, Discord, and internal reports after the bot has replied.',
    purposeZh: '監控 Web/App Chat、X、LINE、Telegram、Discord 與內部通報等 live support signals。'
  },
  {
    name: 'Chat + Trace',
    nameZh: '回覆與追蹤',
    purpose: 'Review the live bot answer and retained trace: source, retrieval, citation, safety, verification, and handoff decisions.',
    purposeZh: '查看 Bot 已即時送出的回覆，以及來源、檢索、引用、安全、驗證與交接 trace。'
  },
  {
    name: 'Knowledge',
    nameZh: '知識庫',
    purpose: 'Manage RAG documents, chunks, KB snapshots, index status, retrieval config, and highlighted evidence from the trace.',
    purposeZh: '管理 RAG 文件、chunks、KB snapshot、index 狀態、retrieval config 與引用證據。'
  },
  {
    name: 'Evaluation',
    nameZh: '評測中心',
    purpose: 'Replay saved interactions against candidate and baseline flows, then export summary metrics for product review.',
    purposeZh: '用保存的互動重播 baseline / candidate，並匯出產品審查用指標。'
  },
  {
    name: 'Error Analysis',
    nameZh: '錯誤分析',
    purpose: 'Turn failed eval cases into actionable PM, bot ops, knowledge, or compliance fixes.',
    purposeZh: '把失敗 eval cases 轉成 PM、Bot Ops、知識庫或法遵可執行修正。'
  },
  {
    name: 'Handoff',
    nameZh: '人工交接',
    purpose: 'Package high-risk cases for human queues with required fields, summary, and explicit safety warnings.',
    purposeZh: '把高風險案例整理成人工隊列需要的欄位、摘要與安全警示。'
  },
  {
    name: 'Release Center',
    nameZh: '發布中心',
    purpose: 'Block unsafe bot versions when regression, citation, or high-risk auto-answer gates fail.',
    purposeZh: '當 regression、引用或高風險自動回覆門檻失敗時阻擋版本發布。'
  },
  {
    name: 'Ops Log',
    nameZh: '操作紀錄',
    purpose: 'Persist scenario runs, eval saves, eval runner actions, and exports as an audit trail.',
    purposeZh: '保存 trace review、eval、release decision 與 export，形成 audit trail。'
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
