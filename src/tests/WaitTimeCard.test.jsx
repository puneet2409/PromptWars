import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { WaitTimeCard } from '../components/WaitTimeCard';
import React from 'react';

describe('WaitTimeCard', () => {
  it('renders correct color badge for low thresholds', () => {
    render(<WaitTimeCard zone="Gate X" time={2} />);
    expect(screen.getByText('Gate X')).toBeInTheDocument();
    expect(screen.getByText('2 min')).toBeInTheDocument();
    expect(screen.getByText('LOW')).toBeInTheDocument();
  });

  it('renders correct color badge for high thresholds', () => {
    render(<WaitTimeCard zone="Gate Y" time={45} />);
    expect(screen.getByText('HIGH')).toBeInTheDocument();
  });
});
