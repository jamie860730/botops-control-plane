import type { EvalCase, EvalResult, EvalRun } from '../types';
import { calculateEvaluationSummary } from './metrics';

const csvHeader = [
  'run_id',
  'run_label',
  'overall_quality',
  'citation_support',
  'handoff_safety_recall',
  'high_risk_auto_answer',
  'regression_count',
  'eval_case_count'
];

export function buildEvalSummaryRows(evalRuns: EvalRun[], evalResults: EvalResult[], evalCases: EvalCase[]): string[][] {
  return evalRuns.map((run) => {
    const summary = calculateEvaluationSummary(evalResults, run.id);
    return [
      run.id,
      run.label,
      summary.overallQualityScore.toFixed(2),
      summary.citationSupportRate.toFixed(2),
      summary.handoffSafetyRecall.toFixed(2),
      summary.highRiskAutoAnswerRate.toFixed(2),
      String(summary.regressionCount),
      String(evalCases.length)
    ];
  });
}

export function getEvalSummaryCsvHeader(): string[] {
  return [...csvHeader];
}

export function buildEvalSummaryCsv(evalRuns: EvalRun[], evalResults: EvalResult[], evalCases: EvalCase[]): string {
  const rows = buildEvalSummaryRows(evalRuns, evalResults, evalCases);

  return [csvHeader, ...rows].map((row) => row.map(escapeCsvCell).join(',')).join('\n');
}

function escapeCsvCell(value: string): string {
  if (!/[",\n]/.test(value)) {
    return value;
  }
  return `"${value.replace(/"/g, '""')}"`;
}
