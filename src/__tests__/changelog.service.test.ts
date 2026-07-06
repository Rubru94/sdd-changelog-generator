import { describe, it, expect, vi } from 'vitest';
import { generate } from '../services/changelog.service.js';

vi.mock('../services/git.service.js', () => ({
  getLog: vi.fn(),
}));

import { getLog } from '../services/git.service.js';

const DELIMITER = '|---end---|';

function makeRaw(
  hash: string,
  subject: string,
  date: string,
  body = '',
): string {
  return `${hash}${DELIMITER}${subject}${DELIMITER}${date}${DELIMITER}${body}${DELIMITER}`;
}

describe('changelog.service', () => {
  it('sorts commits by date descending in output', () => {
    vi.mocked(getLog).mockReturnValue([
      makeRaw('c1', 'feat: older commit', '2026-07-04T10:00:00Z'),
      makeRaw('c2', 'feat: middle commit', '2026-07-05T10:00:00Z'),
      makeRaw('c3', 'feat: newest commit', '2026-07-06T10:00:00Z'),
    ]);

    const result = JSON.parse(
      generate({ format: 'json', group: true, all: true }),
    );

    expect(result.sections).toHaveLength(1);
    const commits = result.sections[0].commits;
    expect(commits).toHaveLength(3);
    expect(commits[0].hash).toBe('c3');
    expect(commits[1].hash).toBe('c2');
    expect(commits[2].hash).toBe('c1');
  });

  it('sorts commits with same date by hash ascending', () => {
    vi.mocked(getLog).mockReturnValue([
      makeRaw('b-hash', 'feat: second commit', '2026-07-05T10:00:00Z'),
      makeRaw('a-hash', 'feat: first commit', '2026-07-05T10:00:00Z'),
    ]);

    const result = JSON.parse(
      generate({ format: 'json', group: true, all: true }),
    );

    const commits = result.sections[0].commits;
    expect(commits).toHaveLength(2);
    expect(commits[0].hash).toBe('a-hash');
    expect(commits[1].hash).toBe('b-hash');
  });

  it('sorts commits with missing date to end', () => {
    vi.mocked(getLog).mockReturnValue([
      makeRaw('c1', 'feat: with date', '2026-07-05T10:00:00Z'),
      makeRaw('c2', 'feat: no date', ''),
      makeRaw('c3', 'feat: newer date', '2026-07-06T10:00:00Z'),
    ]);

    const result = JSON.parse(
      generate({ format: 'json', group: true, all: true }),
    );

    const commits = result.sections[0].commits;
    expect(commits).toHaveLength(3);
    expect(commits[0].hash).toBe('c3');
    expect(commits[1].hash).toBe('c1');
    expect(commits[2].hash).toBe('c2');
  });
});
