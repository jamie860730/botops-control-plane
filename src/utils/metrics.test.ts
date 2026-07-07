import { describe, expect, it } from 'vitest';
import {
  calculateAssistSummary,
  calculateEconomics,
  calculateEvaluationSummary,
  collectDuplicateIds,
  defaultEconomicsAssumptions,
  getAssistPolicyHints,
  getBelowThresholdJudgeVersions,
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

describe('agent assist metrics', () => {
  it('summarizes adoption, edit distance, rewrite rate, and handle-time gap from seed suggestions', () => {
    const summary = calculateAssistSummary(seedData.assistSuggestions);

    expect(summary.total).toBe(12);
    expect(summary.adoptedRate + summary.editedRate).toBeCloseTo(0.75, 2);
    expect(summary.discardedRate).toBeCloseTo(0.25, 2);
    expect(summary.editDistanceDistribution).toEqual({ none: 8, light: 2, heavy: 2 });
    expect(summary.summaryRewriteRate).toBeCloseTo(0.333, 2);
    expect(summary.avgHandleTimeDiscardedSeconds).toBeGreaterThan(summary.avgHandleTimeAcceptedSeconds);
    expect(summary.handleTimeDeltaSeconds).toBeGreaterThan(120);
  });

  it('hints auto-send for high-adoption low-risk queues and prompt review for high-discard queues', () => {
    const hints = getAssistPolicyHints(seedData.assistSuggestions);

    expect(hints).toContainEqual(
      expect.objectContaining({ queue: 'General Support', hint: 'evaluate_auto_send' })
    );
    expect(hints).toContainEqual(expect.objectContaining({ queue: 'KYC Review', hint: 'review_prompt' }));
    expect(hints.some((hint) => hint.queue === 'Compliance Support')).toBe(false);
  });
});

describe('judge calibration', () => {
  it('collects only judge versions whose human agreement is below the threshold', () => {
    const belowThreshold = getBelowThresholdJudgeVersions(seedData.judgeCalibrations);

    expect(belowThreshold.has('judge_policy_v02')).toBe(true);
    expect(belowThreshold.has('judge_policy_v03')).toBe(false);
  });
});

describe('operating economics', () => {
  it('estimates per-ticket cost gap, deflection savings, and badcase payback from seed data', () => {
    const summary = calculateEconomics(defaultEconomicsAssumptions, seedData.csBotKpiSegments, seedData.badcases);

    // Auto-resolved volume derived from KPI segments: sum(volume x autoResolutionRate).
    expect(summary.autoResolvedTickets).toBe(1740);
    expect(summary.humanCostPerTicketUsd).toBeCloseTo(4.8, 2);
    expect(summary.botCostPerTicketUsd).toBeCloseTo(0.42, 2);
    expect(summary.costSavedPerTicketUsd).toBeCloseTo(4.38, 2);
    expect(summary.deflectionSavedHours).toBe(348);
    expect(summary.deflectionSavedCostUsd).toBe(8352);
    expect(summary.fixedBadcaseCount).toBe(2);
    expect(summary.badcaseTicketsAvoided).toBe(90);
    expect(summary.badcaseRecoveredHours).toBe(18);
    expect(summary.badcaseRecoveredCostUsd).toBe(432);
  });

  it('recalculates when assumptions change and honors the auto-resolved override', () => {
    const summary = calculateEconomics(
      { ...defaultEconomicsAssumptions, humanMinutesPerTicket: 24, autoResolvedTickets: 100 },
      seedData.csBotKpiSegments,
      seedData.badcases
    );

    expect(summary.autoResolvedTickets).toBe(100);
    expect(summary.humanCostPerTicketUsd).toBeCloseTo(9.6, 2);
    expect(summary.costSavedPerTicketUsd).toBeCloseTo(9.18, 2);
    expect(summary.deflectionSavedHours).toBe(40);
    expect(summary.deflectionSavedCostUsd).toBe(960);
    expect(summary.badcaseRecoveredHours).toBe(36);
  });
});

describe('release gate', () => {
  it('blocks unsafe releases when high-risk auto-answer or regression thresholds fail', () => {
    const blocked = getBlockedReleaseReasons(seedData.releaseBundles[1], seedData.evalResults);

    expect(blocked).toContain('High-risk auto-answer rate must be 0');
    expect(blocked).toContain('Handoff safety recall must be 1.00');
  });
});
