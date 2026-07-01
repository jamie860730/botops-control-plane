export type SourceChannel =
  | 'Web/App Chat'
  | 'X'
  | 'LINE'
  | 'Telegram'
  | 'Discord'
  | 'Internal Report';

export type ReporterType =
  | 'customer'
  | 'community_moderator'
  | 'internal_ops'
  | 'compliance'
  | 'public_social_post';

export type SourceTrust = 'Low' | 'Medium' | 'High';
export type RiskLevel = 'Low' | 'Medium' | 'High';
export type ReleaseStatus =
  | 'Draft'
  | 'Eval running'
  | 'Blocked'
  | 'Compliance review'
  | 'Canary simulation'
  | 'Ready'
  | 'Rolled back';

export type AuditEventType =
  | 'live_trace_review'
  | 'eval_case_saved'
  | 'eval_runner_started'
  | 'eval_runner_completed'
  | 'csv_exported'
  | 'release_decision';

export interface SupportSignal {
  id: string;
  sourceChannel: SourceChannel;
  reporterType: ReporterType;
  rawText: string;
  attachmentsNote?: string;
  sourceTrust: SourceTrust;
  duplicateClusterId?: string;
  region: string;
  language: string;
  product: string;
  createdAt: string;
  priority: RiskLevel;
}

export interface SupportScenario {
  id: string;
  title: string;
  sourceChannel: SourceChannel;
  reporterType: ReporterType;
  sourceTrust: SourceTrust;
  duplicateClusterId?: string;
  region: string;
  language: string;
  product: string;
  riskTag: string;
  query: string;
  expectedBehavior: string;
}

export interface ConversationMessage {
  id: string;
  scenarioId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  citationIds: string[];
  createdAt: string;
  sourceEventId?: string;
}

export interface TraceEvent {
  id: string;
  traceId: string;
  scenarioId: string;
  eventType:
    | 'source_normalization'
    | 'intent'
    | 'risk'
    | 'rewrite'
    | 'retrieval'
    | 'generation'
    | 'citation'
    | 'verification'
    | 'handoff';
  nodeName: string;
  status: 'pass' | 'watch' | 'blocked';
  inputRef: string;
  outputRef: string;
  detail: string;
  createdAt: string;
}

export interface KnowledgeChunk {
  id: string;
  documentId: string;
  sectionPath: string;
  chunkText: string;
  tokenCount: number;
  citationAllowed: boolean;
}

export interface KnowledgeDocument {
  id: string;
  title: string;
  language: string;
  regionScope: string;
  productScope: string;
  riskClass: RiskLevel;
  status: 'Draft' | 'Review' | 'Published' | 'Archived';
  effectiveFrom: string;
  effectiveTo?: string;
  owner: string;
  citationUsage: number;
  indexStatus: 'Indexed' | 'Needs re-index' | 'Excluded';
  vectorIndex: string;
  lastIndexedAt: string;
  retrievalConfig: string;
  chunks: KnowledgeChunk[];
}

export interface EvalCase {
  id: string;
  datasetId: string;
  sourceChannel: SourceChannel;
  reporterType: ReporterType;
  input: string;
  expectedSources: string[];
  expectedBehavior: string;
  riskTag: string;
  language: string;
  region: string;
  product: string;
  mustHandoff: boolean;
  forbiddenBehavior: string;
}

export interface DimensionScores {
  intentSlot: number;
  sourceNormalization: number;
  retrieval: number;
  citation: number;
  actionability: number;
  riskHandoff: number;
  traceability: number;
}

export interface EvalResult {
  id: string;
  runId: string;
  caseId: string;
  dimensionScores: DimensionScores;
  failureLabel: string;
  chainNode: string;
  revisionNote: string;
  highRisk: boolean;
  autoAnsweredHighRisk: boolean;
  handoffRequired: boolean;
  handoffPerformed: boolean;
}

export interface EvalRun {
  id: string;
  label: string;
  versionConfig: {
    flowVersion: string;
    promptVersion: string;
    kbSnapshot: string;
    retrievalConfig: string;
    judgeVersion: string;
  };
  datasetId: string;
  startedAt: string;
  status: 'completed' | 'running' | 'failed';
}

export interface Badcase {
  id: string;
  caseId: string;
  title: string;
  failureLabel: string;
  lowScoreDimension: string;
  observedCase: string;
  traceDiagnosis: string;
  chainNodeToChange: string;
  modification: string;
  retestMetric: string;
  expectedScoreMovement: string;
  owner: 'PM' | 'Bot Ops' | 'Knowledge Owner' | 'Compliance';
  status: 'Open' | 'In review' | 'Fixed';
}

export interface ReleaseBundle {
  id: string;
  label: string;
  flowVersion: string;
  promptVersion: string;
  kbSnapshot: string;
  retrievalConfig: string;
  judgeVersion: string;
  evalRunId: string;
  status: ReleaseStatus;
  regressionCount: number;
}

export interface HandoffPreview {
  id: string;
  scenarioId: string;
  reason: string;
  queue: 'Security-L2' | 'KYC Review' | 'Compliance Support';
  requiredFields: string[];
  summary: string;
  riskWarning: string;
}

export interface SupportTicket {
  id: string;
  scenarioId: string;
  sourceSignalIds: string[];
  queue: 'General Support' | 'Security-L2' | 'KYC Review' | 'Compliance Support' | 'Knowledge Ops';
  priority: RiskLevel;
  status: 'Open' | 'Pending review' | 'Escalated' | 'Resolved';
  owner: 'Support Ops' | 'Security Ops' | 'KYC Ops' | 'Knowledge Owner' | 'Compliance';
  slaDueAt: string;
  summary: string;
  caseSummary: string;
  nextAction: string;
}

export interface AuditEvent {
  id: string;
  eventType: AuditEventType;
  actor: 'PM' | 'Bot Ops' | 'System';
  title: string;
  detail: string;
  entityRef: string;
  createdAt: string;
}

export interface SeedData {
  supportSignals: SupportSignal[];
  scenarios: SupportScenario[];
  conversationMessages: ConversationMessage[];
  traceEvents: TraceEvent[];
  knowledgeDocuments: KnowledgeDocument[];
  evalCases: EvalCase[];
  evalRuns: EvalRun[];
  evalResults: EvalResult[];
  badcases: Badcase[];
  releaseBundles: ReleaseBundle[];
  handoffPreviews: HandoffPreview[];
  supportTickets: SupportTicket[];
}

export interface EvaluationSummary {
  overallQualityScore: number;
  citationSupportRate: number;
  retrievalRelevance: number;
  handoffSafetyRecall: number;
  highRiskAutoAnswerRate: number;
  regressionCount: number;
}
