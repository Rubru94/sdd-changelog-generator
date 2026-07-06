import type { Commit, CommitType } from '../types/commit.types.js';
import { COMMIT_TYPES } from '../types/commit.types.js';

const CONVENTIONAL_COMMIT_RE =
  /^(?<type>\w+)(?:\((?<scope>[^)]+)\))?(?<breaking>!)?\s*:\s*(?<description>.+)$/;

const BREAKING_CHANGE_RE = /^BREAKING[\s-]CHANGE:\s*(.+)$/m;

const FOOTER_RE = /^(?<key>[A-Za-z-]+):\s*(?<value>.+)$/;

const DELIMITER = '|---end---|';

export interface RawCommit {
  hash: string;
  subject: string;
  date: string;
  body: string;
}

/**
 * Parse a raw commit string (from git log) into a structured RawCommit.
 */
export function parseRawCommit(raw: string): RawCommit | null {
  if (!raw || raw.trim().length === 0) return null;

  const parts = raw.split(DELIMITER);
  if (parts.length < 2) return null;

  const hash = parts[0]?.trim() ?? '';
  const subject = parts[1]?.trim() ?? '';
  const date = parts[2]?.trim() ?? '';
  const body = parts[3]?.trim() ?? '';

  return { hash, subject, date, body };
}

/**
 * Parse a conventional commit subject into a Commit object.
 */
export function parseCommit(
  raw: string,
  options?: { fallback?: boolean },
): Commit {
  const rawCommit = parseRawCommit(raw);
  if (!rawCommit) {
    return {
      hash: '',
      description: raw?.trim() ?? '',
      date: '',
      breaking: false,
      footers: {},
    };
  }

  const { hash, subject, body, date } = rawCommit;
  const match = subject.match(CONVENTIONAL_COMMIT_RE);

  if (!match?.groups) {
    return {
      hash,
      description: subject,
      body,
      date,
      breaking: checkBreakingInBody(body),
      footers: parseFooters(body),
    };
  }

  const type = normalizeType(match.groups.type);
  const scope = match.groups.scope || undefined;
  const breakingSubject = match.groups.breaking === '!';
  const description = match.groups.description.trim();

  const breakingBody = checkBreakingInBody(body);
  const footers = parseFooters(body);

  return {
    hash,
    type,
    scope,
    description,
    body,
    date,
    breaking: breakingSubject || breakingBody,
    footers,
  };
}

function normalizeType(raw: string): CommitType | undefined {
  const lower = raw.toLowerCase() as CommitType;
  return COMMIT_TYPES.includes(lower) ? lower : undefined;
}

function checkBreakingInBody(body: string): boolean {
  if (!body) return false;
  return BREAKING_CHANGE_RE.test(body);
}

function parseFooters(body: string): Record<string, string> {
  const footers: Record<string, string> = {};
  if (!body) return footers;

  const lines = body.split('\n');
  for (const line of lines) {
    const match = line.match(FOOTER_RE);
    if (match?.groups) {
      footers[match.groups.key] = match.groups.value.trim();
    }
  }
  return footers;
}
