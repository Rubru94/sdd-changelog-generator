import { describe, it, expect } from 'vitest';
import { formatDate } from '../formatters/date.formatter.js';
import type { DateFormatMode } from '../types/commit.types.js';

describe('date.formatter', () => {
  it('date-only returns YYYY-MM-DD from full ISO string', () => {
    expect(formatDate('2026-07-06T12:30:00Z', 'date-only')).toBe('2026-07-06');
  });

  it('date-time returns YYYY-MM-DD HH:mm from full ISO string', () => {
    expect(formatDate('2026-07-06T12:30:00Z', 'date-time')).toBe(
      '2026-07-06 12:30',
    );
  });

  it('iso returns the full string as-is', () => {
    expect(formatDate('2026-07-06T12:30:00Z', 'iso')).toBe(
      '2026-07-06T12:30:00Z',
    );
  });

  it('empty string returns empty string regardless of mode', () => {
    const modes: DateFormatMode[] = ['date-only', 'date-time', 'iso'];
    for (const mode of modes) {
      expect(formatDate('', mode)).toBe('');
    }
  });

  it('date string without time with date-time mode works', () => {
    expect(formatDate('2026-07-06', 'date-time')).toBe('2026-07-06');
  });
});
