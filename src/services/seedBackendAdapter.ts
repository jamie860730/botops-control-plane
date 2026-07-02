import { seedData } from '../data/seedData';
import type {
  Badcase,
  CsBotKpiMetric,
  CsBotKpiSegment,
  EvalCase,
  EvalResult,
  HandoffPreview,
  KnowledgeDocument,
  ReleaseBundle,
  SeedData,
  SourceChannel,
  SupportScenario,
  SupportSignal,
  SupportTicket,
  TraceEvent
} from '../types';

export interface InteractionReview {
  scenario: SupportScenario;
  messages: SeedData['conversationMessages'];
  traceEvents: TraceEvent[];
}

export class SeedBackendAdapter {
  private savedEvalCaseIds = new Set<string>();

  listSignals(filters: { sourceChannel?: SourceChannel } = {}): SupportSignal[] {
    return seedData.supportSignals.filter((signal) => {
      return filters.sourceChannel ? signal.sourceChannel === filters.sourceChannel : true;
    });
  }

  listScenarios(filters: { sourceChannel?: SourceChannel } = {}): SupportScenario[] {
    return seedData.scenarios.filter((scenario) => {
      return filters.sourceChannel ? scenario.sourceChannel === filters.sourceChannel : true;
    });
  }

  getScenario(id: string): SupportScenario | undefined {
    return seedData.scenarios.find((scenario) => scenario.id === id);
  }

  getInteractionReview(id: string): InteractionReview {
    const scenario = this.getScenario(id) ?? seedData.scenarios[0];
    return {
      scenario,
      messages: seedData.conversationMessages.filter((message) => message.scenarioId === scenario.id),
      traceEvents: seedData.traceEvents.filter((event) => event.scenarioId === scenario.id)
    };
  }

  listDocuments(): KnowledgeDocument[] {
    return seedData.knowledgeDocuments;
  }

  listEvalCases(): EvalCase[] {
    return seedData.evalCases;
  }

  saveConversationAsEvalCase(scenarioId: string): string {
    const evalCaseId = `eval_saved_${scenarioId}`;
    this.savedEvalCaseIds.add(evalCaseId);
    return evalCaseId;
  }

  hasSavedEvalCase(scenarioId: string): boolean {
    return this.savedEvalCaseIds.has(`eval_saved_${scenarioId}`);
  }

  listEvalResults(runId?: string): EvalResult[] {
    return runId ? seedData.evalResults.filter((result) => result.runId === runId) : seedData.evalResults;
  }

  listBadcases(): Badcase[] {
    return seedData.badcases;
  }

  listReleaseBundles(): ReleaseBundle[] {
    return seedData.releaseBundles;
  }

  getHandoffPreview(scenarioId: string): HandoffPreview | undefined {
    return seedData.handoffPreviews.find((preview) => preview.scenarioId === scenarioId);
  }

  listSupportTickets(): SupportTicket[] {
    return seedData.supportTickets;
  }

  listCsBotKpiMetrics(): CsBotKpiMetric[] {
    return seedData.csBotKpiMetrics;
  }

  listCsBotKpiSegments(): CsBotKpiSegment[] {
    return seedData.csBotKpiSegments;
  }
}

export const seedBackend = new SeedBackendAdapter();
