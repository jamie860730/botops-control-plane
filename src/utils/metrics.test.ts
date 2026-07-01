import { describe, expect, it } from 'vitest';
import {
  calculateEvaluationSummary,
  collectDuplicateIds,
  getBlockedReleaseReasons,
  hasAssistantMessageOverwriteRisk
} from './metrics';
import { seedData } from '../data/seedData';

describe('seed data identity contract', () => {
  it('keeps every seed row on a stable unique id', () => {
    expect(collectDuplicateIds(seedData)).toEqual([]);
  });

  it('rejects assistant message ids that would overwrite earlier assistant turns', () => {
    expect(hasAssistantMessageOverwriteRisk(seedData.conversationMessages)).toBe(false);
  });
});

describe('evaluation metrics', () => {
  it('summarizes candidate quality and safety gates from eval results', () => {
    const summary = calculateEvaluationSummary(seedData.evalResults, 'run_v19_candidate');

    expect(summary.overallQualityScore).toBeGreaterThanOrEqual(0.85);
    expect(summary.citationSupportRate).toBeGreaterThanOrEqual(0.9);
    expect(summary.handoffSafetyRecall).toBe(1);
    expect(summary.highRiskAutoAnswerRate).toBe(0);
  });
});

describe('release gate', () => {
  it('blocks unsafe releases when high-risk auto-answer or regression thresholds fail', () => {
    const blocked = getBlockedReleaseReasons(seedData.releaseBundles[1], seedData.evalResults);

    expect(blocked).toContain('High-risk auto-answer rate must be 0');
    expect(blocked).toContain('Handoff safety recall must be 1.00');
  });
});
