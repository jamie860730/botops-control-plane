import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { ReleaseCenter } from './ReleaseCenter';
import { seedData } from '../data/seedData';
import type { Locale } from '../i18n';

function renderReleaseCenter(locale: Locale = 'en') {
  return render(
    <ReleaseCenter
      bundles={seedData.releaseBundles}
      evalResults={seedData.evalResults}
      getFlowVersionDiff={(bundleId) =>
        seedData.flowVersionDiffs.find((diff) => diff.bundleId === bundleId)
      }
      locale={locale}
      onReleaseDecision={() => {}}
    />
  );
}

describe('ReleaseCenter flow version diff', () => {
  it('expands the flow version diff with topology, prompt diff, and config changes', () => {
    renderReleaseCenter();

    expect(screen.queryByTestId('flow-diff-rel_mvp_019')).not.toBeInTheDocument();

    fireEvent.click(
      screen.getByRole('button', { name: 'View changes for Policy release package v19' })
    );

    const panel = screen.getByTestId('flow-diff-rel_mvp_019');
    expect(panel).toHaveTextContent('Current release v18');
    expect(panel).toHaveTextContent('Proposed release v19');
    // All eight flow nodes render in the read-only topology.
    expect(panel).toHaveTextContent('Source Normalization');
    expect(panel).toHaveTextContent('Human Handoff');
    // Prompt before/after excerpts.
    expect(panel).toHaveTextContent(
      'Answer transfer policy questions using the best available FAQ content.'
    );
    expect(panel).toHaveTextContent(
      'Answer transfer policy questions only when a published regional policy article supports the claim; otherwise abstain and open a KB gap.'
    );
    // KB snapshot and retrieval config changes.
    expect(panel).toHaveTextContent('kb_2026_06_seed');
    expect(panel).toHaveTextContent('kb_2026_07_seed');
    expect(panel).toHaveTextContent('retriever_cfg_04');
    expect(panel).toHaveTextContent('retriever_cfg_05');
  });

  it('marks topology nodes with their change type', () => {
    renderReleaseCenter();

    fireEvent.click(
      screen.getByRole('button', { name: 'View changes for Policy release package v19' })
    );

    const modifiedNodes = screen.getAllByTestId('flow-node-modified');
    expect(modifiedNodes).toHaveLength(3);
    for (const node of modifiedNodes) {
      expect(node).toHaveClass('flow-node-pill', 'modified');
    }
    expect(modifiedNodes.map((node) => node.textContent)).toEqual([
      'Risk Guardmodified',
      'Metadata Retrievalmodified',
      'Citationmodified'
    ]);
    expect(screen.getAllByTestId('flow-node-unchanged')).toHaveLength(5);
    expect(screen.queryByTestId('flow-node-removed')).not.toBeInTheDocument();
  });

  it('shows the removed Human Handoff node that explains the blocked bundle', () => {
    renderReleaseCenter();

    fireEvent.click(
      screen.getByRole('button', { name: 'View changes for Policy release package v18' })
    );

    const panel = screen.getByTestId('flow-diff-rel_mvp_018_blocked');
    const removedNode = screen.getByTestId('flow-node-removed');
    expect(removedNode).toHaveClass('flow-node-pill', 'removed');
    expect(removedNode).toHaveTextContent('Human Handoff');
    expect(panel).toHaveTextContent(
      'Hard handoff for account takeover was removed, so high-risk cases were auto-answered.'
    );
  });

  it('prefills the decision reason with a one-line diff summary', () => {
    renderReleaseCenter();

    const reasonField = screen.getByLabelText(
      'Decision reason for Policy release package v19'
    ) as HTMLTextAreaElement;
    expect(reasonField.value).toContain('Current release v18 → Proposed release v19');
    expect(reasonField.value).toContain('KB kb_2026_06_seed → kb_2026_07_seed');
  });

  it('renders the diff in zh-TW', () => {
    renderReleaseCenter('zh-TW');

    fireEvent.click(screen.getByRole('button', { name: '檢視 政策發布套件 v18 變更' }));

    const removedNode = screen.getByTestId('flow-node-removed');
    expect(removedNode).toHaveTextContent('人工交接');
    expect(removedNode).toHaveTextContent('移除');
    expect(
      screen.getByText('帳戶盜用的強制人工交接被移除，導致高風險案例被自動回答。')
    ).toBeInTheDocument();
  });
});
