import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { OverviewDashboard } from './OverviewDashboard';
import { seedData } from '../data/seedData';

describe('OverviewDashboard metric card drill-through', () => {
  it('navigates each metric card to its owning module', () => {
    const onNavigate = vi.fn();
    render(<OverviewDashboard data={seedData} locale="en" onNavigate={onNavigate} />);

    fireEvent.click(screen.getByRole('button', { name: 'Open Conversations for reviewed interactions' }));
    expect(onNavigate).toHaveBeenLastCalledWith('conversations');

    fireEvent.click(screen.getByRole('button', { name: 'Open KPI detail for auto-resolution quality' }));
    expect(onNavigate).toHaveBeenLastCalledWith('quality', {
      qualityTab: 'kpi',
      kpiMetricId: 'kpi_auto_resolution_rate'
    });

    fireEvent.click(screen.getByRole('button', { name: 'Open Knowledge for gap review' }));
    expect(onNavigate).toHaveBeenLastCalledWith('knowledge');

    fireEvent.click(screen.getByRole('button', { name: 'Open Tickets & Handoff' }));
    expect(onNavigate).toHaveBeenLastCalledWith('tickets');

    fireEvent.click(screen.getByRole('button', { name: 'Open Quality badcases' }));
    expect(onNavigate).toHaveBeenLastCalledWith('quality', { qualityTab: 'badcases' });

    fireEvent.click(screen.getByRole('button', { name: 'Open release gates' }));
    expect(onNavigate).toHaveBeenLastCalledWith('quality', { qualityTab: 'release' });
  });
});

describe('OverviewDashboard operating economics', () => {
  it('renders the three estimated economics cards with the seed-mode disclaimer', () => {
    render(<OverviewDashboard data={seedData} locale="en" onNavigate={() => {}} />);

    expect(screen.getByTestId('econ-cost-value')).toHaveTextContent('$0.42');
    expect(screen.getByTestId('econ-card-cost')).toHaveTextContent('$4.80');
    expect(screen.getByTestId('econ-deflection-value')).toHaveTextContent('348 h');
    expect(screen.getByTestId('econ-badcase-value')).toHaveTextContent('$432');
    expect(screen.getAllByText('Seed-mode illustrative')).toHaveLength(3);
  });

  it('recalculates estimates immediately when an assumption changes', () => {
    render(<OverviewDashboard data={seedData} locale="en" onNavigate={() => {}} />);

    fireEvent.click(screen.getByTestId('econ-assumptions-toggle'));
    fireEvent.change(screen.getByLabelText('Human minutes per ticket'), { target: { value: '24' } });

    expect(screen.getByTestId('econ-deflection-value')).toHaveTextContent('696 h');
    expect(screen.getByTestId('econ-card-cost')).toHaveTextContent('$9.60');

    fireEvent.change(screen.getByLabelText('Auto-resolved tickets (this period)'), {
      target: { value: '100' }
    });
    expect(screen.getByTestId('econ-deflection-value')).toHaveTextContent('40 h');
  });
});
