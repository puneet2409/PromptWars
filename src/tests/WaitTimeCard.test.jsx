import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { WaitTimeCard } from '../components/WaitTimeCard';
import React from 'react';

describe('WaitTimeCard', () => {
  it('renders correct color badge for LOW thresholds (< 5 min)', () => {
    render(<WaitTimeCard zone="Gate A" time={2} />);
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('LOW')).toBeInTheDocument();
  });

  it('renders correct color badge for MODERATE thresholds (5-10 min)', () => {
    render(<WaitTimeCard zone="Gate B" time={7} />);
    expect(screen.getByText('7')).toBeInTheDocument();
    expect(screen.getByText('MODERATE')).toBeInTheDocument();
  });

  it('renders correct color badge for HIGH thresholds (> 10 min)', () => {
    render(<WaitTimeCard zone="Gate C" time={14} />);
    expect(screen.getByText('14')).toBeInTheDocument();
    expect(screen.getByText('HIGH')).toBeInTheDocument();
  });

  it('provides accessible aria-label with wait time details', () => {
    render(<WaitTimeCard zone="Restroom North" time={3} />);
    const card = screen.getByLabelText(/Restroom North: 3 minute wait, LOW/i);
    expect(card).toBeInTheDocument();
  });

  it('abbreviates long zone names for compact display', () => {
    render(<WaitTimeCard zone="Concession 1" time={5} />);
    expect(screen.getByText('C1')).toBeInTheDocument();
  });
});
