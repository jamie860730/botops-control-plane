import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { KnowledgeBase } from './KnowledgeBase';
import { seedData } from '../data/seedData';
import { readIndexStatusOverrides } from '../utils/knowledgeState';

const reindexDocId = 'doc_global_transfer_faq_v4';

function renderKnowledgeBase(onQueueReindex = vi.fn()) {
  render(
    <KnowledgeBase
      documents={seedData.knowledgeDocuments}
      faqCandidates={seedData.faqCandidates}
      gapClusters={seedData.gapClusters}
      sopRecords={seedData.sopRecords}
      highlightedChunkId="chunk_payment_policy_eu_001"
      locale="en"
      onFaqCandidateReview={vi.fn()}
      onQueueReindex={onQueueReindex}
    />
  );
  return onQueueReindex;
}

describe('KnowledgeBase inventory actions', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('keeps the detail drawer closed until a record is opened', () => {
    renderKnowledgeBase();

    expect(screen.queryByTestId('knowledge-record-panel')).not.toBeInTheDocument();
    expect(screen.queryByTestId('chunk-evidence-panel')).not.toBeInTheDocument();
  });

  it('shows only the selected document chunks in the drawer evidence block', () => {
    renderKnowledgeBase();

    // Clicking the table row opens the record drawer for that document.
    fireEvent.click(screen.getByTestId('knowledge-row-doc_transfer_policy_eu_v2'));

    const evidence = screen.getByTestId('chunk-evidence-panel');
    expect(within(evidence).getByText('chunk_payment_policy_eu_001')).toBeInTheDocument();
    expect(within(evidence).queryByText('chunk_global_transfer_001')).not.toBeInTheDocument();
  });

  it('opens the retrieval policy explainer from the table heading', () => {
    renderKnowledgeBase();

    expect(screen.queryByTestId('retrieval-policy-modal')).not.toBeInTheDocument();
    fireEvent.click(screen.getByTestId('retrieval-policy-button'));
    expect(screen.getByTestId('retrieval-policy-modal')).toHaveTextContent('Grounding controls');

    fireEvent.click(screen.getByRole('button', { name: 'Close retrieval policy' }));
    expect(screen.queryByTestId('retrieval-policy-modal')).not.toBeInTheDocument();
  });

  it('queues a re-index from the table action, updates the row, tiles, and persists it', () => {
    const onQueueReindex = renderKnowledgeBase();

    expect(screen.getByTestId('reindex-count-tile')).toHaveTextContent('1');
    const row = screen.getByTestId(`knowledge-row-${reindexDocId}`);
    fireEvent.click(within(row).getByRole('button', { name: /Re-index Global transfer FAQ/i }));

    expect(within(row).getByText('Index queued')).toBeInTheDocument();
    expect(within(row).queryByRole('button', { name: /Re-index Global transfer FAQ/i })).not.toBeInTheDocument();
    expect(screen.getByTestId('reindex-count-tile')).toHaveTextContent('0');
    expect(screen.getByTestId('index-queued-tile')).toHaveTextContent('1');
    expect(onQueueReindex).toHaveBeenCalledTimes(1);
    expect(onQueueReindex.mock.calls[0][0].id).toBe(reindexDocId);
    expect(readIndexStatusOverrides()[reindexDocId]).toBe('Index queued');
  });

  it('opens a record from the table into the detail drawer', () => {
    renderKnowledgeBase();

    const row = screen.getByTestId(`knowledge-row-${reindexDocId}`);
    fireEvent.click(within(row).getByRole('button', { name: /Open record Global transfer FAQ/i }));

    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAccessibleName('Global transfer FAQ');
    expect(screen.getByTestId('knowledge-record-panel')).toBeInTheDocument();
    // Evidence block inside the drawer follows the selection.
    expect(within(screen.getByTestId('chunk-evidence-panel')).getByText('chunk_global_transfer_001')).toBeInTheDocument();

    // Closing the drawer removes the detail without touching the table.
    fireEvent.click(screen.getByRole('button', { name: 'Close panel' }));
    expect(screen.queryByTestId('knowledge-record-panel')).not.toBeInTheDocument();
    expect(screen.getByTestId(`knowledge-row-${reindexDocId}`)).toBeInTheDocument();
  });

  it('toggles the citation review pill on and off inside the drawer', () => {
    renderKnowledgeBase();

    fireEvent.click(screen.getByTestId('knowledge-row-doc_transfer_policy_eu_v2'));

    fireEvent.click(screen.getByRole('button', { name: 'Review citation scope' }));
    expect(screen.getByTestId('citation-review-pill')).toHaveTextContent('Citation review requested');

    fireEvent.click(screen.getByRole('button', { name: 'Cancel citation review' }));
    expect(screen.queryByTestId('citation-review-pill')).not.toBeInTheDocument();
  });
});
