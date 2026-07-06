import { describe, it, expect } from 'vitest';
import { getLog } from '../services/git.service.js';

describe('git.service', () => {
  it('throws error for non-existent directory', () => {
    expect(() => getLog({ repo: '/tmp/non-existent-repo-12345' })).toThrow(
      /not a git repository/i,
    );
  });

  it('returns commits for current repo (happy path)', () => {
    // This test runs in the project's own git repo
    const result = getLog({ repo: '.', from: 'HEAD~1', to: 'HEAD' });
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
  });

  it('includes hash and subject in raw output', () => {
    const result = getLog({ repo: '.', from: 'HEAD~1', to: 'HEAD' });
    expect(result.length).toBeGreaterThanOrEqual(1);
    // Each entry should contain the delimiter
    expect(result[0]).toContain('|---end---|');
  });

  it('accepts getLog with no options (defaults to cwd)', () => {
    // Should not throw since we're in a git repo
    expect(() => getLog()).not.toThrow();
  });

  it('includes ISO date in raw output (from %cI format)', () => {
    const result = getLog({ repo: '.', from: 'HEAD~1', to: 'HEAD' });
    expect(result.length).toBeGreaterThanOrEqual(1);
    // The output should contain an ISO date string between two delimiters
    expect(result[0]).toMatch(/\|---end---\|.*\|---end---\|/);
    // %cI produces ISO 8601 format, so the date field should match YYYY-MM-DD
    const parts = result[0].split('|---end---|');
    expect(parts.length).toBeGreaterThanOrEqual(3);
    // parts[2] should be the date field from %cI
    expect(parts[2]).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });
});
