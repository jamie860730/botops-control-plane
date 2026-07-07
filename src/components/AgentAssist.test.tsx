import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { AgentAssist } from './AgentAssist';
import { seedData } from '../data/seedData';

describe('AgentAssist', () => {
  it('renders metric cards and policy hints computed from seed suggestions', () => {
    render(<AgentAssist locale="en" suggestions={seedData.assistSuggestions} onFlagBadcase={vi.fn()} />);

    expect(screen.getByText('Suggestion adoption')).toBeInTheDocument();
    // Acceptance = adopted 42% + edited 33% of 12 seed suggestions.
    expect(screen.getByText('75%')).toBeInTheDocument();
    expect(screen.getByText('AI summary rewrite rate')).toBeInTheDocument();
    expect(screen.getByText('33%')).toBeInTheDocument();
    // Policy hints derived from queue-level adoption/discard rates.
    expect(
      screen.getByText(/General Support: acceptance 100% in a low-risk queue/)
    ).toBeInTheDocument();
    expect(screen.getByText(/KYC Review: discard rate 75%/)).toBeInTheDocument();
  });

  it('filters the suggestion log by agent action', () => {
    render(<AgentAssist locale="en" suggestions={seedData.assistSuggestions} onFlagBadcase={vi.fn()} />);

    expect(screen.getByRole('button', { name: /case_gs_20260701_011/ })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Discarded' }));

    expect(screen.queryByRole('button', { name: /case_gs_20260701_011/ })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /case_kyc_20260701_041/ })).toBeInTheDocument();
  });

  it('opens the suggestion detail and fires the badcase callback with inline feedback', () => {
    const onFlagBadcase = vi.fn();
    render(
      <AgentAssist locale="en" suggestions={seedData.assistSuggestions} onFlagBadcase={onFlagBadcase} />
    );

    fireEvent.click(screen.getByRole('button', { name: /case_kyc_20260701_041/ }));

    const detail = screen.getByTestId('assist-suggestion-detail');
    expect(detail).toHaveTextContent('AI suggested reply');
    expect(detail).toHaveTextContent('Agent final reply');
    expect(detail).toHaveTextContent('Rewritten');
    expect(detail).toHaveTextContent('scn_kyc_rejected_tw');

    const flagButton = screen.getByRole('button', { name: /Flag as badcase/ });
    fireEvent.click(flagButton);

    expect(onFlagBadcase).toHaveBeenCalledTimes(1);
    expect(onFlagBadcase.mock.calls[0][0].id).toBe('assist_kyc_20260701_007');
    expect(screen.getByText(/Suggestion flagged as badcase/)).toBeInTheDocument();
    expect(flagButton).toBeDisabled();

    // Flagging is idempotent per suggestion.
    fireEvent.click(flagButton);
    expect(onFlagBadcase).toHaveBeenCalledTimes(1);
  });
});
