import { describe, expect, it } from 'vitest';
import { seedData } from '../data/seedData';
import { buildEvalSummaryCsv } from './export';

describe('eval summary export', () => {
  it('builds a stable csv report for eval run comparison', () => {
    const csv = buildEvalSummaryCsv(seedData.evalRuns, seedData.evalResults, seedData.evalCases);

    expect(csv.split('\n')[0]).toBe(
      'run_id,run_label,overall_quality,citation_support,handoff_safety_recall,high_risk_auto_answer,regression_count,eval_case_count'
    );
    expect(csv).toContain('run_v19_candidate,v19 candidate');
    expect(csv).toContain('run_v18_baseline,v18 baseline');
  });
});
