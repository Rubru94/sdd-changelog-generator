import type {
  Commit,
  GroupedCommits,
  ChangelogOptions,
} from '../types/commit.types.js';
import {
  COMMIT_TYPE_HEADINGS,
  COMMIT_TYPE_ORDER,
} from '../types/commit.types.js';
import { formatDate } from './date.formatter.js';

/**
 * Format grouped commits as Markdown changelog.
 */
export function formatMarkdown(
  commits: Commit[] | GroupedCommits,
  options: ChangelogOptions,
): string {
  const lines: string[] = [];

  lines.push('# Changelog');

  if (options.version) {
    const date = new Date().toISOString().split('T')[0];
    lines.push('');
    lines.push(`## [${options.version}] - ${date}`);
  }

  if (!commits || (Array.isArray(commits) && commits.length === 0)) {
    lines.push('');
    lines.push('No changes in the specified range.');
    return lines.join('\n');
  }

  let grouped: GroupedCommits;
  if (Array.isArray(commits)) {
    if (options.group) {
      grouped = groupByType(commits);
    } else {
      grouped = { _other: commits };
    }
  } else {
    grouped = commits;
  }

  const breakingCommits: Commit[] = [];

  for (const type of COMMIT_TYPE_ORDER) {
    const typeCommits = grouped[type];
    if (!typeCommits || typeCommits.length === 0) continue;

    const heading = COMMIT_TYPE_HEADINGS[type] ?? type;
    lines.push('');
    lines.push(`### ${heading}`);

    for (const commit of typeCommits) {
      const scope = commit.scope ? `**${commit.scope}**: ` : '';
      const formattedDate = formatDate(
        commit.date,
        options.dateFormat ?? 'date-only',
      );
      const date = formattedDate ? ` (${formattedDate})` : '';
      lines.push(`- ${scope}${commit.description}${date}`);

      if (commit.breaking) {
        breakingCommits.push(commit);
      }
    }
  }

  // Handle any remaining types not in COMMIT_TYPE_ORDER
  for (const [type, typeCommits] of Object.entries(grouped)) {
    if (COMMIT_TYPE_ORDER.includes(type as any)) continue;
    if (type === '_other' || typeCommits.length === 0) continue;

    const heading = COMMIT_TYPE_HEADINGS[type] ?? type;
    lines.push('');
    lines.push(`### ${heading}`);

    for (const commit of typeCommits) {
      const scope = commit.scope ? `**${commit.scope}**: ` : '';
      const formattedDate = formatDate(
        commit.date,
        options.dateFormat ?? 'date-only',
      );
      const date = formattedDate ? ` (${formattedDate})` : '';
      lines.push(`- ${scope}${commit.description}${date}`);
    }
  }

  // Handle ungrouped commits (--no-group)
  if (grouped._other && grouped._other.length > 0) {
    lines.push('');
    lines.push('### Changes');
    for (const commit of grouped._other) {
      const formattedDate = formatDate(
        commit.date,
        options.dateFormat ?? 'date-only',
      );
      const date = formattedDate ? ` (${formattedDate})` : '';
      lines.push(`- ${commit.description}${date}`);
    }
  }

  // Breaking changes section
  if (breakingCommits.length > 0) {
    lines.push('');
    lines.push('### BREAKING CHANGES');
    for (const commit of breakingCommits) {
      const scope = commit.scope ? `**${commit.scope}**: ` : '';
      const formattedDate = formatDate(
        commit.date,
        options.dateFormat ?? 'date-only',
      );
      const date = formattedDate ? ` (${formattedDate})` : '';
      lines.push(`- ${scope}${commit.description}${date}`);
      if (commit.body) {
        const breakingBody = extractBreakingBody(commit.body);
        if (breakingBody) {
          lines.push('');
          lines.push('  ```');
          lines.push(`  ${breakingBody}`);
          lines.push('  ```');
        }
      }
    }
  }

  lines.push('');
  return lines.join('\n');
}

function groupByType(commits: Commit[]): GroupedCommits {
  const grouped: GroupedCommits = {};

  for (const commit of commits) {
    const type = commit.type ?? '_other';
    if (!grouped[type]) {
      grouped[type] = [];
    }
    grouped[type].push(commit);
  }

  return grouped;
}

function extractBreakingBody(body: string): string {
  const match = body.match(/BREAKING[\s-]CHANGE:\s*(.+)/);
  return match ? match[1].trim() : '';
}
