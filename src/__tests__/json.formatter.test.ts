import { describe, it, expect } from 'vitest';
import { formatJson } from '../formatters/json.formatter.js';
import type { Commit, ChangelogOptions } from '../types/commit.types.js';

function makeCommit(overrides: Partial<Commit> = {}): Commit {
  return {
    hash: 'abc123',
    type: 'feat',
    scope: undefined,
    description: 'test commit',
    body: undefined,
    date: undefined,
    breaking: false,
    footers: {},
    ...overrides,
  };
}

describe('json.formatter', () => {
  it('returns valid JSON', () => {
    const result = formatJson([], { format: 'json', group: true });
    expect(() => JSON.parse(result)).not.toThrow();
  });

  it('returns empty sections for no commits', () => {
    const result = JSON.parse(formatJson([], { format: 'json', group: true }));
    expect(result).toHaveProperty('sections');
    expect(result.sections).toHaveLength(0);
  });

  it('includes version and date when specified', () => {
    const result = JSON.parse(
      formatJson([], { format: 'json', group: true, version: '1.0.0' }),
    );
    expect(result.version).toBe('1.0.0');
    expect(result.date).toBeDefined();
  });

  it('groups commits by type', () => {
    const commits: Commit[] = [
      makeCommit({ type: 'feat', description: 'feature one' }),
      makeCommit({ type: 'fix', description: 'fix one' }),
    ];
    const result = JSON.parse(
      formatJson(commits, { format: 'json', group: true }),
    );

    expect(result.sections).toHaveLength(2);
    expect(result.sections[0].type).toBe('feat');
    expect(result.sections[0].commits).toHaveLength(1);
    expect(result.sections[1].type).toBe('fix');
    expect(result.sections[1].commits).toHaveLength(1);
  });

  it('includes commit details in sections', () => {
    const commits: Commit[] = [
      makeCommit({
        hash: 'abc123',
        type: 'feat',
        scope: 'auth',
        description: 'add login',
        breaking: true,
      }),
    ];
    const result = JSON.parse(
      formatJson(commits, { format: 'json', group: true }),
    );

    const section = result.sections[0];
    expect(section.heading).toBe('Features');
    expect(section.commits[0].hash).toBe('abc123');
    expect(section.commits[0].scope).toBe('auth');
    expect(section.commits[0].description).toBe('add login');
    expect(section.commits[0].breaking).toBe(true);
  });

  it('does not group when --no-group', () => {
    const commits: Commit[] = [
      makeCommit({ type: 'feat', description: 'feature one' }),
      makeCommit({ type: 'fix', description: 'fix one' }),
    ];
    const result = JSON.parse(
      formatJson(commits, { format: 'json', group: false }),
    );

    expect(result.sections).toHaveLength(1);
    expect(result.sections[0].type).toBe('_other');
  });

  it('includes date field in commit when present', () => {
    const commits: Commit[] = [
      makeCommit({ date: '2026-07-03T12:00:00Z', description: 'dated commit' }),
    ];
    const result = JSON.parse(
      formatJson(commits, { format: 'json', group: true }),
    );

    expect(result.sections[0].commits[0].date).toBe('2026-07-03T12:00:00Z');
  });

  it('omits date field when not set', () => {
    const commits: Commit[] = [
      makeCommit({ description: 'no date commit' }),
    ];
    const result = JSON.parse(
      formatJson(commits, { format: 'json', group: true }),
    );

    expect(result.sections[0].commits[0].date).toBeUndefined();
  });
});
