import { Download, Play } from 'lucide-react';
import type { Locale } from '../i18n';
import { text } from '../i18n';
import type { EvalCase, EvalResult, EvalRun } from '../types';
import { calculateEvaluationSummary } from '../utils/metrics';

interface EvaluationCenterProps {
  evalCases: EvalCase[];
  evalResults: EvalResult[];
  evalRuns: EvalRun[];
  evalRunnerStatus: string;
  locale: Locale;
  onExportCsv: () => void;
  onRunEval: () => void;
  savedEvalCaseId: string | null;
}

export function EvaluationCenter({
  evalCases,
  evalResults,
  evalRuns,
  evalRunnerStatus,
  locale,
  onExportCsv,
  onRunEval,
  savedEvalCaseId
}: EvaluationCenterProps) {
  const rows = evalRuns.map((run) => ({
    run,
    summary: calculateEvaluationSummary(evalResults, run.id)
  }));

  return (
    <section className="screen-grid" data-testid="evaluation-center">
      <div className="panel span-2">
        <div className="section-heading">
          <div>
            <p className="eyebrow">{text(locale, 'Evaluation Center', '評測中心')}</p>
            <h3>{text(locale, 'Compare baseline and candidate on the same cases', '用同一批案例比較 baseline 與 candidate')}</h3>
          </div>
          <div className="action-row">
            <button className="secondary-action" onClick={onExportCsv} type="button">
              <Download size={15} aria-hidden="true" />
              {text(locale, 'Export CSV', '匯出 CSV')}
            </button>
            <button className="primary-action compact-action" onClick={onRunEval} type="button">
              <Play size={15} aria-hidden="true" />
              {text(locale, 'Run offline eval', '執行離線評測')}
            </button>
            <span className="count-pill">
              {text(locale, `${evalCases.length} eval cases`, `${evalCases.length} 個評測案例`)}
            </span>
          </div>
        </div>
        <div className="data-table">
          <div className="table-row table-head eval-row">
            <span>{text(locale, 'Run', '評測批次')}</span>
            <span>{text(locale, 'Overall', '整體')}</span>
            <span>{text(locale, 'Citation', '引用')}</span>
            <span>{text(locale, 'Handoff Safety Recall', '交接召回')}</span>
            <span>{text(locale, 'Auto-answer', '自動回覆')}</span>
            <span>{text(locale, 'Regressions', '退化')}</span>
          </div>
          {rows.map(({ run, summary }) => (
            <div className="table-row eval-row" key={run.id}>
              <span>{run.label}</span>
              <span>{summary.overallQualityScore.toFixed(2)}</span>
              <span>{summary.citationSupportRate.toFixed(2)}</span>
              <span>{summary.handoffSafetyRecall.toFixed(2)}</span>
              <span>{summary.highRiskAutoAnswerRate.toFixed(2)}</span>
              <span>{summary.regressionCount}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="panel">
        <p className="eyebrow">{text(locale, 'Runner status', '評測執行狀態')}</p>
        <h3 data-testid="eval-runner-status">{text(locale, evalRunnerStatus, evalRunnerStatus === 'Completed' ? '已完成' : '閒置')}</h3>
        <p>
          {text(
            locale,
            'Offline runner output is deterministic in P1, so product and operations can review gates before live model traffic exists.',
            'P1 的離線評測輸出可重現，讓產品與營運在接上真實模型流量前先審查品質門檻。'
          )}
        </p>
      </div>
      <div className="panel">
        <p className="eyebrow">{text(locale, 'Saved eval candidate', '已保存評測候選')}</p>
        <h3>{savedEvalCaseId ?? text(locale, 'No saved live case yet', '尚未保存 live case')}</h3>
        <p>
          {text(
            locale,
            'Saved conversations keep the source signal, messages, trace events, and version config so they can be replayed in the eval runner.',
            '保存的互動會保留來源訊號、訊息、trace events 與版本設定，後續可在評測 runner 中 replay。'
          )}
        </p>
      </div>
    </section>
  );
}
