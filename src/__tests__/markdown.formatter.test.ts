import { describe, it, expect } from 'vitest';
import { formatMarkdown } from '../formatters/markdown.formatter.js';
import type { Commit, ChangelogOptions } from '../types/commit.types.js';

function makeCommit(overrides: Partial<Commit> = {}): Commit {
  return {
    hash: 'abc123',
    type: 'feat',
    scope: undefined,
    description: 'test commit',
    body: undefined,
    date: '',
    breaking: false,
    footers: {},
    ...overrides,
  };
}

describe('markdown.formatter', () => {
  it('starts with # Changelog header', () => {
    const result = formatMarkdown([], { format: 'markdown', group: true });
    expect(result).toMatch(/^# Changelog/);
  });

  it('shows "No changes" for empty commits', () => {
    const result = formatMarkdown([], { format: 'markdown', group: true });
    expect(result).toContain('No changes in the specified range.');
  });

  it('includes version header when --version is set', () => {
    const result = formatMarkdown([], {
      format: 'markdown',
      group: true,
      version: '1.0.0',
    });
    expect(result).toContain('## [1.0.0]');
    expect(result).toContain('- ');
  });

  it('groups commits by type', () => {
    const commits: Commit[] = [
      makeCommit({ type: 'feat', description: 'feature one' }),
      makeCommit({ type: 'fix', description: 'fix one' }),
      makeCommit({ type: 'fix', description: 'fix two' }),
    ];
    const result = formatMarkdown(commits, { format: 'markdown', group: true });

    expect(result).toContain('### Features');
    expect(result).toContain('### Bug Fixes');
    expect(result).toContain('feature one');
    expect(result).toContain('fix one');
    expect(result).toContain('fix two');
  });

  it('shows scope in bold when present', () => {
    const commits: Commit[] = [
      makeCommit({ scope: 'auth', description: 'add login' }),
    ];
    const result = formatMarkdown(commits, { format: 'markdown', group: true });
    expect(result).toContain('**auth**');
  });

  it('includes BREAKING CHANGES section', () => {
    const commits: Commit[] = [
      makeCommit({
        type: 'feat',
        description: 'breaking change',
        breaking: true,
      }),
    ];
    const result = formatMarkdown(commits, { format: 'markdown', group: true });
    expect(result).toContain('### BREAKING CHANGES');
    expect(result).toContain('breaking change');
  });

  it('does not group when --no-group', () => {
    const commits: Commit[] = [
      makeCommit({ type: 'feat', description: 'feature one' }),
      makeCommit({ type: 'fix', description: 'fix one' }),
    ];
    const result = formatMarkdown(commits, {
      format: 'markdown',
      group: false,
    });
    expect(result).not.toContain('### Features');
    expect(result).toContain('### Changes');
  });

  it('formats with version and grouped commits', () => {
    const commits: Commit[] = [
      makeCommit({ type: 'feat', description: 'new feature' }),
      makeCommit({ type: 'fix', description: 'bug fix' }),
    ];
    const result = formatMarkdown(commits, {
      format: 'markdown',
      group: true,
      version: '2.0.0',
    });

    expect(result).toContain('## [2.0.0]');
    expect(result).toContain('### Features');
    expect(result).toContain('### Bug Fixes');
  });

  it('shows date in YYYY-MM-DD format in parentheses when present', () => {
    const commits: Commit[] = [
      makeCommit({ date: '2026-07-03T12:00:00Z', description: 'dated commit' }),
    ];
    const result = formatMarkdown(commits, { format: 'markdown', group: true });
    expect(result).toContain('(2026-07-03)');
  });

  it('skips date parentheses when date is empty', () => {
    const commits: Commit[] = [
      makeCommit({ date: '', description: 'no date commit' }),
    ];
    const result = formatMarkdown(commits, { format: 'markdown', group: true });
    expect(result).toContain('- no date commit');
    expect(result).not.toContain('()');
  });

  it('skips date parentheses when date is empty string', () => {
    const commits: Commit[] = [
      makeCommit({ description: 'another no date commit' }),
    ];
    const result = formatMarkdown(commits, { format: 'markdown', group: true });
    expect(result).toContain('- another no date commit');
    expect(result).not.toContain('()');
  });

  it('shows date-time format when dateFormat is date-time', () => {
    const commits: Commit[] = [
      makeCommit({ date: '2026-07-03T14:30:00Z', description: 'dated commit' }),
    ];
    const result = formatMarkdown(commits, {
      format: 'markdown',
      group: true,
      dateFormat: 'date-time',
    });
    expect(result).toContain('(2026-07-03 14:30)');
  });

  it('shows only date when dateFormat is date-only', () => {
    const commits: Commit[] = [
      makeCommit({ date: '2026-07-03T14:30:00Z', description: 'dated commit' }),
    ];
    const result = formatMarkdown(commits, {
      format: 'markdown',
      group: true,
      dateFormat: 'date-only',
    });
    expect(result).toContain('(2026-07-03)');
    expect(result).not.toContain('14:30');
  });
});
