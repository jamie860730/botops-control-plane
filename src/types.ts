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
  | 'release_decision'
  | 'faq_candidate_reviewed'
  | 'assist_badcase_flagged'
  | 'knowledge_index_queued';

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
  indexStatus: 'Indexed' | 'Needs re-index' | 'Index queued' | 'Excluded';
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

export type FlowNodeChangeType = 'added' | 'removed' | 'modified' | 'unchanged';

export interface FlowNodeChange {
  nodeName: string;
  changeType: FlowNodeChangeType;
  detail?: string;
}

export interface PromptChange {
  section: string;
  summary: string;
  beforeExcerpt: string;
  afterExcerpt: string;
}

export interface FlowVersionDiff {
  id: string;
  bundleId: string;
  baseVersionLabel: string;
  candidateVersionLabel: string;
  nodeChanges: FlowNodeChange[];
  promptChanges: PromptChange[];
  kbSnapshotChange?: {
    from: string;
    to: string;
    summary: string;
  };
  retrievalConfigChange?: {
    from: string;
    to: string;
    summary: string;
  };
}

export interface JudgeCalibration {
  id: string;
  judgeVersion: string;
  humanAgreementRate: number;
  sampledCases: number;
  pendingReviewCount: number;
  driftAlert: boolean;
  driftNote?: string;
  threshold: number;
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

export interface CsBotKpiMetric {
  id: string;
  label: string;
  value: string;
  target: string;
  status: 'healthy' | 'watch' | 'risk';
  trend: 'up' | 'down' | 'flat';
  insight: string;
}

export interface CsBotKpiSegment {
  id: string;
  segment: string;
  sourceChannel: SourceChannel | 'All';
  volume: number;
  autoResolutionRate: number;
  handoffRate: number;
  citationFailureRate: number;
  repeatContactRate: number;
  slaRiskCount: number;
  reviewFocus: string;
}

export interface AuditEvent {
  id: string;
  eventType: AuditEventType;
  actor: 'PM' | 'Bot Ops' | 'Knowledge Owner' | 'System';
  title: string;
  detail: string;
  /**
   * Traditional Chinese copies of title/detail, written at event creation time.
   * Optional so legacy events persisted in localStorage (English-only) still parse;
   * renderers must fall back to the English title/detail when these are absent.
   */
  titleZh?: string;
  detailZh?: string;
  entityRef: string;
  createdAt: string;
}

export type GapClusterStatus =
  | 'Observing'
  | 'Candidate drafted'
  | 'Adopted'
  | 'Rejected'
  | 'Not automatable';

export interface GapCluster {
  id: string;
  label: string;
  volume: number;
  weeklyTrend: 'up' | 'down' | 'flat';
  sampleUtterances: string[];
  relatedKbStatus: 'missing' | 'weak';
  sourceChannels: SourceChannel[];
  status: GapClusterStatus;
}

export type FaqCandidateStatus = 'Pending review' | 'Adopted' | 'Returned' | 'Not automatable';

export interface FaqCandidate {
  id: string;
  clusterId: string;
  draftQuestion: string;
  draftAnswer: string;
  citations: string[];
  reviewNote: string;
  status: FaqCandidateStatus;
  deflectionBefore?: number;
  deflectionAfter?: number;
}

export type SupportQueue =
  | 'General Support'
  | 'Security-L2'
  | 'KYC Review'
  | 'Compliance Support'
  | 'Knowledge Ops';

export type AssistAgentAction = 'adopted' | 'edited' | 'discarded';
export type AssistEditDistanceBucket = 'none' | 'light' | 'heavy';

export interface AssistSuggestion {
  id: string;
  caseRef: string;
  queue: SupportQueue;
  intentTag: string;
  suggestedReply: string;
  agentFinalReply: string;
  agentAction: AssistAgentAction;
  editDistanceBucket: AssistEditDistanceBucket;
  handleTimeSeconds: number;
  aiSummary: string;
  agentFinalSummary: string;
  summaryRewritten: boolean;
  traceScenarioId: string;
}

export type SopStatus = 'Draft' | 'Review' | 'Published' | 'Archived';
export type SopAutomationBoundary = 'auto' | 'human_confirm' | 'forbidden';

export interface SopStep {
  id: string;
  order: number;
  instruction: string;
  branchCondition?: string;
  automationBoundary: SopAutomationBoundary;
}

export interface SopRecord {
  id: string;
  title: string;
  triggerScenario: string;
  riskClass: RiskLevel;
  owner: string;
  status: SopStatus;
  steps: SopStep[];
  linkedFlowNodes: string[];
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
  judgeCalibrations: JudgeCalibration[];
  releaseBundles: ReleaseBundle[];
  flowVersionDiffs: FlowVersionDiff[];
  handoffPreviews: HandoffPreview[];
  supportTickets: SupportTicket[];
  csBotKpiMetrics: CsBotKpiMetric[];
  csBotKpiSegments: CsBotKpiSegment[];
  gapClusters: GapCluster[];
  faqCandidates: FaqCandidate[];
  assistSuggestions: AssistSuggestion[];
  sopRecords: SopRecord[];
}

export interface EvaluationSummary {
  overallQualityScore: number;
  citationSupportRate: number;
  retrievalRelevance: number;
  handoffSafetyRecall: number;
  highRiskAutoAnswerRate: number;
  regressionCount: number;
}
