import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { OverviewDashboard } from './OverviewDashboard';
import { seedData } from '../data/seedData';

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
