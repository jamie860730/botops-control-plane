import { Download, Play } from 'lucide-react';
import type { EvalCase, EvalResult, EvalRun } from '../types';
import { calculateEvaluationSummary } from '../utils/metrics';

interface EvaluationCenterProps {
  evalCases: EvalCase[];
  evalResults: EvalResult[];
  evalRuns: EvalRun[];
  evalRunnerStatus: string;
  onExportCsv: () => void;
  onRunEval: () => void;
  savedEvalCaseId: string | null;
}

export function EvaluationCenter({
  evalCases,
  evalResults,
  evalRuns,
  evalRunnerStatus,
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
            <p className="eyebrow">Evaluation Center</p>
            <h3>Compare baseline and candidate on the same cases</h3>
          </div>
          <div className="action-row">
            <button className="secondary-action" onClick={onExportCsv} type="button">
              <Download size={15} aria-hidden="true" />
              Export CSV
            </button>
            <button className="primary-action compact-action" onClick={onRunEval} type="button">
              <Play size={15} aria-hidden="true" />
              Run offline eval
            </button>
            <span className="count-pill">{evalCases.length} eval cases</span>
          </div>
        </div>
        <div className="data-table">
          <div className="table-row table-head eval-row">
            <span>Run</span>
            <span>Overall</span>
            <span>Citation</span>
            <span>Handoff Safety Recall</span>
            <span>Auto-answer</span>
            <span>Regressions</span>
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
        <p className="eyebrow">Runner status</p>
        <h3 data-testid="eval-runner-status">{evalRunnerStatus}</h3>
        <p>
          Offline runner output is deterministic in P1, so product and operations can review gates before live model
          traffic exists.
        </p>
      </div>
      <div className="panel">
        <p className="eyebrow">Saved eval candidate</p>
        <h3>{savedEvalCaseId ?? 'No saved live case yet'}</h3>
        <p>
          Saved conversations keep the source signal, messages, trace events, and version config so they can be
          replayed in the eval runner.
        </p>
      </div>
    </section>
  );
}
