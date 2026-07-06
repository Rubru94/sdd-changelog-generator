export type DateFormatMode = 'date-only' | 'date-time' | 'iso';

export type CommitType =
  | 'feat'
  | 'fix'
  | 'chore'
  | 'refactor'
  | 'docs'
  | 'style'
  | 'test'
  | 'perf'
  | 'ci'
  | 'build'
  | 'revert';

export interface Commit {
  hash: string;
  type?: CommitType;
  scope?: string;
  description: string;
  body?: string;
  date: string;
  breaking: boolean;
  footers: Record<string, string>;
}

export interface GroupedCommits {
  [type: string]: Commit[];
}

export interface ChangelogOptions {
  from?: string;
  to?: string;
  format: 'markdown' | 'json';
  group: boolean;
  output?: string;
  repo?: string;
  version?: string;
  all?: boolean;
  type?: CommitType[];
  dateFormat?: DateFormatMode;
}

export const COMMIT_TYPE_HEADINGS: Record<string, string> = {
  feat: 'Features',
  fix: 'Bug Fixes',
  chore: 'Chores',
  refactor: 'Refactors',
  docs: 'Documentation',
  style: 'Style',
  test: 'Tests',
  perf: 'Performance',
  ci: 'CI/CD',
  build: 'Build',
  revert: 'Reverts',
};

export const COMMIT_TYPES: CommitType[] = [
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

export const COMMIT_TYPE_ORDER: CommitType[] = [
  'feat',
  'fix',
  'perf',
  'refactor',
  'docs',
  'test',
  'ci',
  'build',
  'style',
  'chore',
  'revert',
];
