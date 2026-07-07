import { beforeEach, describe, expect, it } from 'vitest';
import { seedData } from '../data/seedData';
import {
  applyKnowledgeState,
  buildKnowledgeDocFromCandidate,
  knowledgeIndexStatusStorageKey,
  persistAdoptedKnowledgeDoc,
  persistIndexStatusOverrides,
  readAdoptedKnowledgeDocs
} from './knowledgeState';

const reindexDocId = 'doc_global_transfer_faq_v4';

describe('knowledgeState shared overrides', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('returns seed documents unchanged when nothing is persisted', () => {
    expect(applyKnowledgeState(seedData.knowledgeDocuments)).toEqual(seedData.knowledgeDocuments);
  });

  it('applies a queued index status and moves the re-index count', () => {
    persistIndexStatusOverrides({ [reindexDocId]: 'Index queued' });

    const documents = applyKnowledgeState(seedData.knowledgeDocuments);
    expect(documents.find((doc) => doc.id === reindexDocId)?.indexStatus).toBe('Index queued');
    expect(documents.filter((doc) => doc.indexStatus === 'Needs re-index')).toHaveLength(
      seedData.knowledgeDocuments.filter((doc) => doc.indexStatus === 'Needs re-index').length - 1
    );
  });

  it('falls back safely when the persisted payload is corrupted', () => {
    window.localStorage.setItem(knowledgeIndexStatusStorageKey, '[broken');
    expect(applyKnowledgeState(seedData.knowledgeDocuments)).toEqual(seedData.knowledgeDocuments);
  });

  it('builds a Draft knowledge document from an adopted FAQ candidate', () => {
    const candidate = seedData.faqCandidates[0];
    const cluster = seedData.gapClusters.find((entry) => entry.id === candidate.clusterId)!;
    const doc = buildKnowledgeDocFromCandidate(candidate, cluster, '2026-07-06T10:00:00.000Z');

    expect(doc.status).toBe('Draft');
    expect(doc.title).toBe(candidate.draftQuestion);
    expect(doc.effectiveFrom).toBe('2026-07-06');
    expect(doc.chunks).toHaveLength(1);
    expect(doc.chunks[0].chunkText).toBe(candidate.draftAnswer);
    expect(doc.chunks[0].documentId).toBe(doc.id);
  });

  it('persists adopted documents once and surfaces them in the merged inventory', () => {
    const candidate = seedData.faqCandidates[0];
    const cluster = seedData.gapClusters.find((entry) => entry.id === candidate.clusterId)!;
    const doc = buildKnowledgeDocFromCandidate(candidate, cluster);

    persistAdoptedKnowledgeDoc(doc);
    persistAdoptedKnowledgeDoc(doc); // adopting twice must not duplicate

    expect(readAdoptedKnowledgeDocs()).toHaveLength(1);
    const documents = applyKnowledgeState(seedData.knowledgeDocuments);
    expect(documents).toHaveLength(seedData.knowledgeDocuments.length + 1);
    expect(documents.filter((entry) => entry.id === doc.id)).toHaveLength(1);
  });
});
