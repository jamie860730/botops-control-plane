import type { FaqCandidate, GapCluster, KnowledgeDocument } from '../types';

/**
 * Shared knowledge-inventory state (index queue, citation review flags, adopted
 * FAQ candidates promoted to Draft documents) persisted in localStorage so the
 * inventory table, record detail, metric tiles, and dashboard stay in sync.
 */
export const knowledgeIndexStatusStorageKey = 'botops.knowledgeIndexStatusById';
export const citationReviewStorageKey = 'botops.knowledgeCitationReviewById';
export const adoptedKnowledgeDocsStorageKey = 'botops.adoptedKnowledgeDocs';
export const faqCandidateStatusStorageKey = 'botops.faqCandidateStatusById';

function readJson<T>(storageKey: string, guard: (value: unknown) => value is T, fallback: T): T {
  const stored = window.localStorage.getItem(storageKey);
  if (!stored) {
    return fallback;
  }
  try {
    const parsed = JSON.parse(stored);
    return guard(parsed) ? parsed : fallback;
  } catch {
    return fallback;
  }
}

function isPlainObject(value: unknown): value is Record<string, never> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

export function readIndexStatusOverrides(): Record<string, KnowledgeDocument['indexStatus']> {
  return readJson(knowledgeIndexStatusStorageKey, isPlainObject, {});
}

export function persistIndexStatusOverrides(value: Record<string, KnowledgeDocument['indexStatus']>) {
  window.localStorage.setItem(knowledgeIndexStatusStorageKey, JSON.stringify(value));
}

export function readCitationReviewFlags(): Record<string, boolean> {
  return readJson(citationReviewStorageKey, isPlainObject, {});
}

export function persistCitationReviewFlags(value: Record<string, boolean>) {
  window.localStorage.setItem(citationReviewStorageKey, JSON.stringify(value));
}

export function readAdoptedKnowledgeDocs(): KnowledgeDocument[] {
  return readJson(adoptedKnowledgeDocsStorageKey, Array.isArray, [] as KnowledgeDocument[]);
}

export function persistAdoptedKnowledgeDoc(doc: KnowledgeDocument) {
  const existing = readAdoptedKnowledgeDocs();
  if (existing.some((entry) => entry.id === doc.id)) {
    return;
  }
  window.localStorage.setItem(adoptedKnowledgeDocsStorageKey, JSON.stringify([...existing, doc]));
}

export function readFaqCandidateStatusOverrides(): Record<string, FaqCandidate['status']> {
  return readJson(faqCandidateStatusStorageKey, isPlainObject, {});
}

export function persistFaqCandidateStatusOverrides(value: Record<string, FaqCandidate['status']>) {
  window.localStorage.setItem(faqCandidateStatusStorageKey, JSON.stringify(value));
}

/**
 * Seed documents + adopted candidate documents, with persisted index-status
 * overrides applied. Single read path shared by KnowledgeBase and dashboards.
 */
export function applyKnowledgeState(documents: KnowledgeDocument[]): KnowledgeDocument[] {
  const overrides = readIndexStatusOverrides();
  const seedIds = new Set(documents.map((doc) => doc.id));
  const adopted = readAdoptedKnowledgeDocs().filter((doc) => !seedIds.has(doc.id));
  return [...documents, ...adopted].map((doc) => ({
    ...doc,
    indexStatus: overrides[doc.id] ?? doc.indexStatus
  }));
}

/** Builds a Draft knowledge document from an adopted FAQ candidate. */
export function buildKnowledgeDocFromCandidate(
  candidate: FaqCandidate,
  cluster: GapCluster,
  adoptedAtIso: string = new Date().toISOString()
): KnowledgeDocument {
  const docId = `doc_faq_${candidate.id.replace(/^faq_cand_/, '')}`;
  return {
    id: docId,
    title: candidate.draftQuestion,
    language: 'en',
    regionScope: 'Global',
    productScope: 'FAQ',
    riskClass: 'Low',
    status: 'Draft',
    effectiveFrom: adoptedAtIso.slice(0, 10),
    owner: 'Knowledge Ops',
    citationUsage: 0,
    indexStatus: 'Excluded',
    vectorIndex: 'vector_policy_support_prod',
    lastIndexedAt: adoptedAtIso,
    retrievalConfig: 'retriever_cfg_05',
    chunks: [
      {
        id: `chunk_${docId}_001`,
        documentId: docId,
        sectionPath: `FAQ / ${cluster.label}`,
        chunkText: candidate.draftAnswer,
        tokenCount: Math.max(1, Math.round(candidate.draftAnswer.split(/\s+/).length)),
        citationAllowed: true
      }
    ]
  };
}
