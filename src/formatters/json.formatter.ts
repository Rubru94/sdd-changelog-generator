import type {
  Commit,
  GroupedCommits,
  ChangelogOptions,
} from '../types/commit.types.js';
import {
  COMMIT_TYPE_HEADINGS,
  COMMIT_TYPE_ORDER,
} from '../types/commit.types.js';

interface JsonSection {
  type: string;
  heading: string;
  commits: Commit[];
}

interface JsonOutput {
  version?: string;
  date?: string;
  sections: JsonSection[];
}

/**
 * Format grouped commits as JSON changelog.
 */
export function formatJson(
  commits: Commit[] | GroupedCommits,
  options: ChangelogOptions,
): string {
  const output: JsonOutput = {
    sections: [],
  };

  if (options.version) {
    output.version = options.version;
    output.date = new Date().toISOString().split('T')[0];
  }

  if (!commits || (Array.isArray(commits) && commits.length === 0)) {
    return JSON.stringify(output, null, 2);
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

  for (const type of COMMIT_TYPE_ORDER) {
    const typeCommits = grouped[type];
    if (!typeCommits || typeCommits.length === 0) continue;

    output.sections.push({
      type,
      heading: COMMIT_TYPE_HEADINGS[type] ?? type,
      commits: typeCommits,
    });
  }

  // Handle any remaining types not in COMMIT_TYPE_ORDER
  for (const [type, typeCommits] of Object.entries(grouped)) {
    if (COMMIT_TYPE_ORDER.includes(type as any)) continue;
    if (type === '_other' || typeCommits.length === 0) continue;

    output.sections.push({
      type,
      heading: COMMIT_TYPE_HEADINGS[type] ?? type,
      commits: typeCommits,
    });
  }

  // Handle ungrouped commits
  if (grouped._other && grouped._other.length > 0) {
    output.sections.push({
      type: '_other',
      heading: 'Changes',
      commits: grouped._other,
    });
  }

  return JSON.stringify(output, null, 2);
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
