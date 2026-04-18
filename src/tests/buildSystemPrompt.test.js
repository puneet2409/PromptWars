import { describe, it, expect } from 'vitest';
import { buildSystemPrompt } from '../utils/buildSystemPrompt';

describe('buildSystemPrompt', () => {
  it('correctly sets missing context', () => {
    const result = buildSystemPrompt(null, [], [], []);
    expect(result).toContain('Fan seat: Unknown');
    expect(result).toContain('No recent reports');
    expect(result).toContain('No data');
  });

  it('correctly formats and injects live data', () => {
    const waitTimes = [{ zone: 'Gate A', time: 5 }];
    const density = [{ zone: 'Gate A', level: 'LOW' }];
    const reports = ['Gate B is crowded'];
    
    const result = buildSystemPrompt('104 B 12', waitTimes, density, reports);
    expect(result).toContain('104 B 12');
    expect(result).toContain('Gate A: 5min');
    expect(result).toContain('Gate A: LOW');
    expect(result).toContain('Gate B is crowded');
  });
});
