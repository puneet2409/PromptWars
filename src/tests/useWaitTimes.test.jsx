import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useWaitTimes } from '../hooks/useWaitTimes';

vi.mock('../services/db', () => ({
  subscribeToLiveUpdates: vi.fn((cb) => {
    cb({ waitTimes: [{ zone: 'Gate A', time: 5 }], crowdDensity: [] }, null);
    return () => {};
  })
}));

describe('useWaitTimes', () => {
  it('returns valid wait times from simulated streaming DB', () => {
    const { result } = renderHook(() => useWaitTimes());
    expect(result.current.waitTimes).toEqual([{ zone: 'Gate A', time: 5 }]);
    expect(result.current.crowdDensity).toEqual([]);
    expect(result.current.error).toBeNull();
  });
});
