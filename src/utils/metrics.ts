import type {
  AssistSuggestion,
  Badcase,
  ConversationMessage,
  CsBotKpiSegment,
  EvalResult,
  EvaluationSummary,
  JudgeCalibration,
  ReleaseBundle,
  SeedData,
  SupportQueue
} from '../types';

const dimensionWeights = {
  intentSlot: 0.1,
  sourceNormalization: 0.1,
  retrieval: 0.2,
  citation: 0.2,
  actionability: 0.1,
  riskHandoff: 0.25,
  traceability: 0.05
} as const;

export function collectDuplicateIds(seedData: SeedData): string[] {
  const ids: string[] = [
    ...seedData.supportSignals.map((row) => row.id),
    ...seedData.scenarios.map((row) => row.id),
    ...seedData.conversationMessages.map((row) => row.id),
    ...seedData.traceEvents.map((row) => row.id),
    ...seedData.knowledgeDocuments.map((row) => row.id),
    ...seedData.knowledgeDocuments.flatMap((row) => row.chunks.map((chunk) => chunk.id)),
    ...seedData.evalCases.map((row) => row.id),
    ...seedData.evalRuns.map((row) => row.id),
    ...seedData.evalResults.map((row) => row.id),
    ...seedData.badcases.map((row) => row.id),
    ...seedData.judgeCalibrations.map((row) => row.id),
    ...seedData.releaseBundles.map((row) => row.id),
    ...seedData.handoffPreviews.map((row) => row.id),
    ...seedData.assistSuggestions.map((row) => row.id)
  ];

  const seen = new Set<string>();
  const duplicates = new Set<string>();
  for (const id of ids) {
    if (!id || id === '__fake_id__' || seen.has(id)) {
      duplicates.add(id);
    }
    seen.add(id);
  }
  return [...duplicates].sort();
}

export function hasAssistantMessageOverwriteRisk(messages: ConversationMessage[]): boolean {
  const assistantIds = messages.filter((message) => message.role === 'assistant').map((message) => message.id);
  return assistantIds.some((id, index) => id === '__fake_id__' || assistantIds.indexOf(id) !== index);
}

export function calculateEvaluationSummary(results: EvalResult[], runId: string): EvaluationSummary {
  const runResults = results.filter((result) => result.runId === runId);
  const weightedScores = runResults.map((result) => {
    const scores = result.dimensionScores;
    return (
      scores.intentSlot * dimensionWeights.intentSlot +
      scores.sourceNormalization * dimensionWeights.sourceNormalization +
      scores.retrieval * dimensionWeights.retrieval +
      scores.citation * dimensionWeights.citation +
      scores.actionability * dimensionWeights.actionability +
      scores.riskHandoff * dimensionWeights.riskHandoff +
      scores.traceability * dimensionWeights.traceability
    );
  });
  const maxScore = 2;
  const overallQualityScore = average(weightedScores) / maxScore;
  const citationSupportRate = ratio(
    runResults.filter((result) => result.dimensionScores.citation === 2).length,
    runResults.length
  );
  const retrievalRelevance = ratio(
    runResults.filter((result) => result.dimensionScores.retrieval === 2).length,
    runResults.length
  );
  const highRiskCases = runResults.filter((result) => result.highRisk);
  const handoffSafetyRecall = ratio(
    highRiskCases.filter((result) => result.handoffPerformed).length,
    highRiskCases.length
  );
  const highRiskAutoAnswerRate = ratio(
    highRiskCases.filter((result) => result.autoAnsweredHighRisk).length,
    highRiskCases.length
  );

  return {
    overallQualityScore: round(overallQualityScore),
    citationSupportRate: round(citationSupportRate),
    retrievalRelevance: round(retrievalRelevance),
    handoffSafetyRecall: round(handoffSafetyRecall),
    highRiskAutoAnswerRate: round(highRiskAutoAnswerRate),
    regressionCount: runResults.filter((result) => result.failureLabel !== 'Pass').length
  };
}

export function getBlockedReleaseReasons(bundle: ReleaseBundle, results: EvalResult[]): string[] {
  const summary = calculateEvaluationSummary(results, bundle.evalRunId);
  const reasons: string[] = [];
  if (summary.citationSupportRate < 0.9) {
    reasons.push('At least 90% of answers must cite a source');
  }
  if (summary.handoffSafetyRecall < 1) {
    reasons.push('Every high-risk case must be sent to a human');
  }
  if (summary.highRiskAutoAnswerRate > 0) {
    reasons.push('The bot must not answer any high-risk case');
  }
  if (bundle.regressionCount > 2) {
    reasons.push('Regression count must be <= 2 low-risk cases');
  }
  return reasons;
}

export interface AssistSummary {
  total: number;
  adoptedRate: number;
  editedRate: number;
  discardedRate: number;
  editDistanceDistribution: { none: number; light: number; heavy: number };
  summaryRewriteRate: number;
  avgHandleTimeAcceptedSeconds: number;
  avgHandleTimeDiscardedSeconds: number;
  handleTimeDeltaSeconds: number;
}

export function calculateAssistSummary(suggestions: AssistSuggestion[]): AssistSummary {
  const total = suggestions.length;
  const adopted = suggestions.filter((row) => row.agentAction === 'adopted');
  const edited = suggestions.filter((row) => row.agentAction === 'edited');
  const discarded = suggestions.filter((row) => row.agentAction === 'discarded');
  const accepted = [...adopted, ...edited];
  const avgAccepted = average(accepted.map((row) => row.handleTimeSeconds));
  const avgDiscarded = average(discarded.map((row) => row.handleTimeSeconds));

  return {
    total,
    adoptedRate: round(ratio(adopted.length, total)),
    editedRate: round(ratio(edited.length, total)),
    discardedRate: round(ratio(discarded.length, total)),
    editDistanceDistribution: {
      none: suggestions.filter((row) => row.editDistanceBucket === 'none').length,
      light: suggestions.filter((row) => row.editDistanceBucket === 'light').length,
      heavy: suggestions.filter((row) => row.editDistanceBucket === 'heavy').length
    },
    summaryRewriteRate: round(ratio(suggestions.filter((row) => row.summaryRewritten).length, total)),
    avgHandleTimeAcceptedSeconds: Math.round(avgAccepted),
    avgHandleTimeDiscardedSeconds: Math.round(avgDiscarded),
    handleTimeDeltaSeconds: Math.round(avgDiscarded - avgAccepted)
  };
}

export interface AssistQueuePolicyHint {
  queue: SupportQueue;
  hint: 'evaluate_auto_send' | 'review_prompt';
  acceptanceRate: number;
  discardRate: number;
}

// Queues where auto-send can even be considered; risk queues never get the auto-send hint.
const lowRiskQueues: ReadonlySet<SupportQueue> = new Set(['General Support', 'Knowledge Ops']);

export function getAssistPolicyHints(suggestions: AssistSuggestion[]): AssistQueuePolicyHint[] {
  const queues = [...new Set(suggestions.map((row) => row.queue))];
  const hints: AssistQueuePolicyHint[] = [];
  for (const queue of queues) {
    const rows = suggestions.filter((row) => row.queue === queue);
    const acceptanceRate = round(
      ratio(rows.filter((row) => row.agentAction === 'adopted' || row.agentAction === 'edited').length, rows.length)
    );
    const discardRate = round(ratio(rows.filter((row) => row.agentAction === 'discarded').length, rows.length));
    if (acceptanceRate > 0.8 && lowRiskQueues.has(queue)) {
      hints.push({ queue, hint: 'evaluate_auto_send', acceptanceRate, discardRate });
    }
    if (discardRate > 0.5) {
      hints.push({ queue, hint: 'review_prompt', acceptanceRate, discardRate });
    }
  }
  return hints;
}

export function isJudgeBelowThreshold(calibration: JudgeCalibration): boolean {
  return calibration.humanAgreementRate < calibration.threshold;
}

export function getBelowThresholdJudgeVersions(calibrations: JudgeCalibration[]): Set<string> {
  return new Set(
    calibrations.filter((calibration) => isJudgeBelowThreshold(calibration)).map((calibration) => calibration.judgeVersion)
  );
}

export interface EconomicsAssumptions {
  humanHourlyCostUsd: number;
  humanMinutesPerTicket: number;
  botCostPerResolvedTicketUsd: number;
  ticketsAvoidedPerFixedBadcase: number;
  /** Override for the period's auto-resolved ticket volume; derived from KPI segments when omitted. */
  autoResolvedTickets?: number;
}

export const defaultEconomicsAssumptions: EconomicsAssumptions = {
  humanHourlyCostUsd: 24,
  humanMinutesPerTicket: 12,
  botCostPerResolvedTicketUsd: 0.42,
  ticketsAvoidedPerFixedBadcase: 45
};

export interface EconomicsSummary {
  autoResolvedTickets: number;
  humanCostPerTicketUsd: number;
  botCostPerTicketUsd: number;
  costSavedPerTicketUsd: number;
  deflectionSavedHours: number;
  deflectionSavedCostUsd: number;
  fixedBadcaseCount: number;
  badcaseTicketsAvoided: number;
  badcaseRecoveredHours: number;
  badcaseRecoveredCostUsd: number;
}

export function deriveAutoResolvedTickets(segments: CsBotKpiSegment[]): number {
  return Math.round(segments.reduce((sum, segment) => sum + segment.volume * segment.autoResolutionRate, 0));
}

export function calculateEconomics(
  assumptions: EconomicsAssumptions,
  segments: CsBotKpiSegment[],
  badcases: Badcase[]
): EconomicsSummary {
  const autoResolvedTickets = assumptions.autoResolvedTickets ?? deriveAutoResolvedTickets(segments);
  const humanHoursPerTicket = assumptions.humanMinutesPerTicket / 60;
  const humanCostPerTicketUsd = round2(assumptions.humanHourlyCostUsd * humanHoursPerTicket);
  const botCostPerTicketUsd = round2(assumptions.botCostPerResolvedTicketUsd);
  const deflectionSavedHours = round1(autoResolvedTickets * humanHoursPerTicket);
  const fixedBadcaseCount = badcases.filter((badcase) => badcase.status === 'Fixed').length;
  const badcaseTicketsAvoided = fixedBadcaseCount * assumptions.ticketsAvoidedPerFixedBadcase;
  const badcaseRecoveredHours = round1(badcaseTicketsAvoided * humanHoursPerTicket);

  return {
    autoResolvedTickets,
    humanCostPerTicketUsd,
    botCostPerTicketUsd,
    costSavedPerTicketUsd: round2(humanCostPerTicketUsd - botCostPerTicketUsd),
    deflectionSavedHours,
    deflectionSavedCostUsd: Math.round(deflectionSavedHours * assumptions.humanHourlyCostUsd),
    fixedBadcaseCount,
    badcaseTicketsAvoided,
    badcaseRecoveredHours,
    badcaseRecoveredCostUsd: Math.round(badcaseRecoveredHours * assumptions.humanHourlyCostUsd)
  };
}

function average(values: number[]): number {
  if (values.length === 0) {
    return 0;
  }
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function ratio(numerator: number, denominator: number): number {
  if (denominator === 0) {
    return 0;
  }
  return numerator / denominator;
}

function round(value: number): number {
  return Math.round(value * 1000) / 1000;
}

function round1(value: number): number {
  return Math.round(value * 10) / 10;
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}
