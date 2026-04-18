import { describe, it, expect } from 'vitest';
import { formatWaitTime } from '../utils/formatWaitTime';

describe('formatWaitTime', () => {
  it('returns LOW for wait times under 5 minutes', () => {
    expect(formatWaitTime(0).label).toBe('LOW');
    expect(formatWaitTime(4).label).toBe('LOW');
    expect(formatWaitTime(5).label).toBe('LOW');
  });

  it('returns MODERATE for wait times between 6 and 10 minutes', () => {
    expect(formatWaitTime(6).label).toBe('MODERATE');
    expect(formatWaitTime(10).label).toBe('MODERATE');
  });

  it('returns HIGH for wait times over 10 minutes', () => {
    expect(formatWaitTime(11).label).toBe('HIGH');
    expect(formatWaitTime(99).label).toBe('HIGH');
  });

  it('clamps negative values to LOW', () => {
    expect(formatWaitTime(-5).label).toBe('LOW');
  });

  it('returns appropriate color codes', () => {
    expect(formatWaitTime(2).color).toBe('#10b981'); // green
    expect(formatWaitTime(7).color).toBe('#f59e0b'); // amber
    expect(formatWaitTime(15).color).toBe('#ef4444'); // red
  });
});
