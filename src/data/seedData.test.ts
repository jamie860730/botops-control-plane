import { describe, expect, it } from 'vitest';
import { seedData } from './seedData';

describe('Gap mining seed data', () => {
  it('provides four gap clusters covering the review lifecycle', () => {
    expect(seedData.gapClusters).toHaveLength(4);
    const statuses = seedData.gapClusters.map((cluster) => cluster.status);
    expect(statuses.filter((status) => status === 'Candidate drafted')).toHaveLength(2);
    expect(statuses.filter((status) => status === 'Adopted')).toHaveLength(1);
    expect(statuses.filter((status) => status === 'Observing')).toHaveLength(1);
  });

  it('links every FAQ candidate to an existing cluster and existing chunks', () => {
    const clusterIds = new Set(seedData.gapClusters.map((cluster) => cluster.id));
    const chunkIds = new Set(
      seedData.knowledgeDocuments.flatMap((doc) => doc.chunks.map((chunk) => chunk.id))
    );
    for (const candidate of seedData.faqCandidates) {
      expect(clusterIds.has(candidate.clusterId)).toBe(true);
      for (const citation of candidate.citations) {
        expect(chunkIds.has(citation)).toBe(true);
      }
    }
  });

  it('keeps the observing cluster without a draft and tracks deflection on the adopted one', () => {
    const observing = seedData.gapClusters.find((cluster) => cluster.status === 'Observing');
    expect(observing).toBeDefined();
    expect(seedData.faqCandidates.some((candidate) => candidate.clusterId === observing?.id)).toBe(false);

    const adopted = seedData.faqCandidates.find((candidate) => candidate.status === 'Adopted');
    expect(adopted).toBeDefined();
    expect(adopted?.deflectionBefore).toBeDefined();
    expect(adopted?.deflectionAfter).toBeDefined();
    expect(adopted!.deflectionAfter!).toBeGreaterThan(adopted!.deflectionBefore!);
  });
});
