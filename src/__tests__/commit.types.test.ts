import { describe, it, expect } from 'vitest';
import type {
  Commit,
  ChangelogOptions,
  DateFormatMode,
} from '../types/commit.types.js';

describe('commit.types', () => {
  it('DateFormatMode accepts all valid values', () => {
    const modes: DateFormatMode[] = ['date-only', 'date-time', 'iso'];
    expect(modes).toHaveLength(3);
  });

  it('Commit.date is a required string field', () => {
    const commit: Commit = {
      hash: 'abc',
      description: 'test',
      date: '2026-07-06T12:00:00Z',
      breaking: false,
      footers: {},
    };
    expect(typeof commit.date).toBe('string');
  });

  it('ChangelogOptions accepts optional dateFormat', () => {
    const opts: ChangelogOptions = {
      format: 'markdown',
      group: true,
      dateFormat: 'date-only',
    };
    expect(opts.dateFormat).toBe('date-only');
  });
});
