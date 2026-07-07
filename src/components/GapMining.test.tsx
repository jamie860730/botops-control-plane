import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { GapMining } from './GapMining';
import { seedData } from '../data/seedData';

describe('GapMining', () => {
  beforeEach(() => {
    // Candidate review decisions persist to localStorage; isolate each test.
    window.localStorage.clear();
  });

  it('lists clusters and opens the AI draft in the detail drawer', () => {
    render(
      <GapMining
        candidates={seedData.faqCandidates}
        clusters={seedData.gapClusters}
        locale="en"
        onCandidateReview={vi.fn()}
      />
    );

    expect(screen.getByText('Transfer delay surge follow-ups')).toBeInTheDocument();
    expect(screen.getByText('New earn product FAQ blank')).toBeInTheDocument();
    // The detail drawer stays closed until a cluster row is clicked.
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /JP cross-border policy exception questions/ }));
    expect(
      screen.getByRole('heading', {
        level: 4,
        name: 'Is there a Japan-specific exception to the cross-border payment policy?'
      })
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Adopt into KB' })).toBeInTheDocument();
  });

  it('fires the review callback and shows inline feedback when adopting', () => {
    const onCandidateReview = vi.fn();
    render(
      <GapMining
        candidates={seedData.faqCandidates}
        clusters={seedData.gapClusters}
        locale="en"
        onCandidateReview={onCandidateReview}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /JP cross-border policy exception questions/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Adopt into KB' }));

    expect(onCandidateReview).toHaveBeenCalledTimes(1);
    const [candidate, cluster, decision] = onCandidateReview.mock.calls[0];
    expect(candidate.id).toBe('faq_cand_jp_policy_001');
    expect(cluster.id).toBe('dup_jp_policy_gap_101');
    expect(decision).toBe('adopted');
    expect(screen.getByRole('status')).toHaveTextContent('Candidate adopted into the knowledge base');
    // The cluster list behind the drawer reflects the adoption immediately.
    expect(
      screen.getByRole('button', { name: /JP cross-border policy exception questions/ })
    ).toHaveTextContent('Adopted');
  });

  it('shows the observation note for clusters below the drafting threshold', () => {
    render(
      <GapMining
        candidates={seedData.faqCandidates}
        clusters={seedData.gapClusters}
        locale="zh-TW"
        onCandidateReview={vi.fn()}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /新理財產品 FAQ 空白/ }));
    expect(screen.getByText(/樣本數低於起草門檻/)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: '採納入庫' })).not.toBeInTheDocument();
  });

  it('shows deflection before/after for the adopted cluster', () => {
    render(
      <GapMining
        candidates={seedData.faqCandidates}
        clusters={seedData.gapClusters}
        locale="en"
        onCandidateReview={vi.fn()}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /Transfer delay surge follow-ups/ }));
    expect(screen.getByText('Deflection tracking')).toBeInTheDocument();
    expect(screen.getByText('31%')).toBeInTheDocument();
    expect(screen.getByText('58%')).toBeInTheDocument();
  });
});
