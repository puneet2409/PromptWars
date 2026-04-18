import { describe, it, expect } from 'vitest';
import { sanitize } from '../utils/sanitize';

describe('sanitize', () => {
  it('strips HTML tags from input', () => {
    expect(sanitize('<script>alert("xss")</script>')).toBe('');
    expect(sanitize('<b>bold</b>')).toBe('bold');
  });

  it('returns empty string for null/undefined', () => {
    expect(sanitize(null)).toBe('');
    expect(sanitize(undefined)).toBe('');
    expect(sanitize('')).toBe('');
  });

  it('preserves plain text content', () => {
    expect(sanitize('Gate D is very crowded')).toBe('Gate D is very crowded');
  });

  it('strips event handlers', () => {
    expect(sanitize('<div onload="alert(1)">hello</div>')).toBe('hello');
  });
});
