import type { Commit, ChangelogOptions } from '../types/commit.types.js';
import { COMMIT_TYPES } from '../types/commit.types.js';
import { parseCommit } from '../parsers/commit.parser.js';
import { getLog } from '../services/git.service.js';
import { formatMarkdown } from '../formatters/markdown.formatter.js';
import { formatJson } from '../formatters/json.formatter.js';

/**
 * Generate a changelog from git history.
 * Full pipeline: git log → parse → filter → group → format.
 */
export function generate(options: ChangelogOptions): string {
  // Step 1: Get raw git log
  const rawCommits = getLog({
    repo: options.repo,
    from: options.from,
    to: options.to,
    all: options.all,
  });

  // Step 2: Parse each raw commit
  const parsedCommits: Commit[] = rawCommits
    .map((raw) => parseCommit(raw))
    .filter(Boolean);

  // Step 3: Filter commits
  let filteredCommits = parsedCommits;

  // Filter out non-conventional commits unless --all is set
  if (!options.all) {
    filteredCommits = filteredCommits.filter((c) => c.type !== undefined);
  }

  // Filter by specific types if --type is set
  if (options.type && options.type.length > 0) {
    const allowedTypes = new Set(options.type);
    filteredCommits = filteredCommits.filter(
      (c) => c.type && allowedTypes.has(c.type),
    );
  }

  // Sort commits by date descending (newest first)
  filteredCommits.sort((a, b) => {
    const timeA = a.date ? Date.parse(a.date) : 0;
    const timeB = b.date ? Date.parse(b.date) : 0;
    return (isFinite(timeB) ? timeB : 0) - (isFinite(timeA) ? timeA : 0);
  });

  // Step 4: Format output
  if (options.format === 'json') {
    return formatJson(filteredCommits, options);
  }

  return formatMarkdown(filteredCommits, options);
}
