import { describe, it, expect } from 'vitest';
import { parseCommit } from '../parsers/commit.parser.js';

describe('commit.parser', () => {
  it('parses feat with scope', () => {
    const raw = `abc123|---end---|feat(auth): add login|---end---|`;
    const result = parseCommit(raw);
    expect(result.hash).toBe('abc123');
    expect(result.type).toBe('feat');
    expect(result.scope).toBe('auth');
    expect(result.description).toBe('add login');
    expect(result.breaking).toBe(false);
  });

  it('parses fix without scope', () => {
    const raw = `abc124|---end---|fix: correct timeout|---end---|`;
    const result = parseCommit(raw);
    expect(result.type).toBe('fix');
    expect(result.scope).toBeUndefined();
    expect(result.description).toBe('correct timeout');
    expect(result.breaking).toBe(false);
  });

  it('detects breaking change from subject (!)', () => {
    const raw = `abc125|---end---|feat! : breaking change|---end---|`;
    const result = parseCommit(raw);
    expect(result.type).toBe('feat');
    expect(result.breaking).toBe(true);
  });

  it('detects breaking change from subject with scope', () => {
    const raw = `abc126|---end---|refactor(core)!: major refactor|---end---|`;
    const result = parseCommit(raw);
    expect(result.type).toBe('refactor');
    expect(result.scope).toBe('core');
    expect(result.breaking).toBe(true);
  });

  it('detects breaking change from body', () => {
    const raw = `abc127|---end---|feat: add new API|---end---|BREAKING CHANGE: removes old endpoints`;
    const result = parseCommit(raw);
    expect(result.type).toBe('feat');
    expect(result.breaking).toBe(true);
  });

  it('handles non-conventional commit', () => {
    const raw = `abc128|---end---|fix bug in parser|---end---|`;
    const result = parseCommit(raw);
    expect(result.type).toBeUndefined();
    expect(result.description).toBe('fix bug in parser');
    expect(result.breaking).toBe(false);
  });

  it('parses chore with deps scope', () => {
    const raw = `abc129|---end---|chore(deps): update lodash|---end---|`;
    const result = parseCommit(raw);
    expect(result.type).toBe('chore');
    expect(result.scope).toBe('deps');
    expect(result.description).toBe('update lodash');
  });

  it('parses body content', () => {
    const raw = `abc130|---end---|feat: implement feature|---end---|Detailed body here\n\nReviewed-by: User`;
    const result = parseCommit(raw);
    expect(result.body).toContain('Detailed body here');
    expect(result.footers).toHaveProperty('Reviewed-by');
    expect(result.footers['Reviewed-by']).toBe('User');
  });

  it('handles empty input', () => {
    const result = parseCommit('');
    expect(result.hash).toBe('');
    expect(result.description).toBe('');
  });

  it('parses all commit types', () => {
    const types = [
      'feat',
      'fix',
      'chore',
      'refactor',
      'docs',
      'style',
      'test',
      'perf',
      'ci',
      'build',
      'revert',
    ];
    for (const type of types) {
      const raw = `abc|---end---|${type}: test message|---end---|`;
      const result = parseCommit(raw);
      expect(result.type).toBe(type as any);
    }
  });

  it('returns undefined type for unknown type', () => {
    const raw = `abc|---end---|unknown: something|---end---|`;
    const result = parseCommit(raw);
    expect(result.type).toBeUndefined();
    expect(result.description).toBe('something');
  });
});
