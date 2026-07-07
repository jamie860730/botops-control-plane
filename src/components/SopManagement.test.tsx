import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { SopManagement } from './SopManagement';
import { seedData } from '../data/seedData';

describe('SopManagement', () => {
  it('lists every SOP record with risk, owner, status, and step count', () => {
    render(<SopManagement locale="en" sopRecords={seedData.sopRecords} />);

    expect(screen.getAllByText('Account takeover freeze handling').length).toBeGreaterThan(0);
    expect(screen.getByText('KYC rejection reply flow')).toBeInTheDocument();
    expect(screen.getByText('Policy update knowledge sync')).toBeInTheDocument();
    expect(screen.getByText('Incident spike escalation flow')).toBeInTheDocument();

    const firstRow = screen.getByRole('button', { name: /account-takeover-freeze-001/ });
    expect(firstRow).toHaveTextContent('High');
    expect(firstRow).toHaveTextContent('Security Ops');
    expect(firstRow).toHaveTextContent('Published');
    expect(firstRow).toHaveTextContent('4');
  });

  it('shows the step timeline with all three automation boundary badges in the drawer', () => {
    render(<SopManagement locale="en" sopRecords={seedData.sopRecords} />);

    // The detail drawer stays closed until a SOP row is clicked.
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Account takeover freeze handling/ }));

    // The account takeover freeze SOP demonstrates auto, human_confirm, and forbidden.
    expect(screen.getAllByTestId('sop-step-auto')).toHaveLength(2);
    expect(screen.getAllByTestId('sop-step-human_confirm')).toHaveLength(1);
    const forbiddenStep = screen.getByTestId('sop-step-forbidden');
    expect(forbiddenStep).toHaveClass('forbidden');
    expect(forbiddenStep).toHaveTextContent('Automation forbidden');
    expect(forbiddenStep).toHaveTextContent('Decide on asset movement: refund, unlock, or transfer approval.');

    // The human_confirm step carries its branch condition.
    expect(
      screen.getByText('Only when an active session shows a suspicious pending transfer.')
    ).toBeInTheDocument();
  });

  it('shows the linked chat flow nodes for the selected SOP', () => {
    render(<SopManagement locale="en" sopRecords={seedData.sopRecords} />);

    fireEvent.click(screen.getByRole('button', { name: /KYC rejection reply flow/ }));

    expect(screen.getByText('Intent + Slot')).toBeInTheDocument();
    expect(screen.getByText('Metadata Retrieval')).toBeInTheDocument();
    expect(screen.getByText('Answer Generation')).toBeInTheDocument();
    expect(screen.getByText('Escalate the drafted reply to a KYC reviewer before sending.')).toBeInTheDocument();
  });

  it('renders zh-TW labels and translated SOP content', () => {
    render(<SopManagement locale="zh-TW" sopRecords={seedData.sopRecords} />);

    expect(screen.getAllByText('帳號盜用凍結處理').length).toBeGreaterThan(0);
    fireEvent.click(screen.getByRole('button', { name: /帳號盜用凍結處理/ }));
    expect(screen.getByTestId('sop-step-forbidden')).toHaveTextContent('禁止自動化');
    expect(screen.getByText('決定資產移動：退款、解鎖或核准轉帳。')).toBeInTheDocument();
  });
});
