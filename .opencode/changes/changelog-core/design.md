# Design: changelog-core

References main ARCHITECTURE.md. This document covers change-specific implementation details.

## Module Specifications

### src/types/commit.types.ts

```typescript
export type CommitType = 'feat' | 'fix' | 'chore' | 'refactor' | 'docs' 
  | 'style' | 'test' | 'perf' | 'ci' | 'build' | 'revert';

export interface Commit {
  hash: string;
  type?: CommitType;
  scope?: string;
  description: string;
  body?: string;
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
  'feat', 'fix', 'chore', 'refactor', 'docs', 'style',
  'test', 'perf', 'ci', 'build', 'revert',
];
```

### src/parsers/commit.parser.ts

**Regex**:
```typescript
const CONVENTIONAL_COMMIT_RE = /^(?<type>\w+)(?:\((?<scope>[^)]+)\))?(?<breaking>!)?\s*:\s*(?<description>.+)$/;
const BREAKING_CHANGE_RE = /^BREAKING[\s-]CHANGE:\s*(.+)$/m;
const FOOTER_RE = /^(?<key>[A-Za-z-]+):\s*(?<value>.+)$/;
```

**Algorithm**:
1. Split raw commit by `\n---end---\n` delimiter
2. Extract hash from first field, subject from second, body from third
3. Apply CONVENTIONAL_COMMIT_RE to subject
4. If match: extract type (normalize to lowercase), scope, breaking (!), description
5. Check body for BREAKING_CHANGE_RE
6. Parse footers from body lines matching FOOTER_RE
7. Return Commit object

### src/services/git.service.ts

**Git format string**:
```
git log --format="%H||%s||%b||---end---" ${from}..${to}
```

**Edge cases**:
- If `from` is empty, use `--root` to include all commits
- If `to` is empty, use HEAD
- If repo path is invalid, throw descriptive error
- If git not installed, throw descriptive error

### src/services/changelog.service.ts

**Pipeline**:
1. `getLog(options)` → raw commit strings
2. For each raw string: `parse(raw)` → `Commit`
3. If `!options.all`: filter out commits without type
4. If `options.type`: filter by allowed types
5. If `options.group`: group by `commit.type`
6. If formatter === 'markdown': `markdownFormatter.format(commits, options)`
7. If formatter === 'json': `jsonFormatter.format(commits, options)`
8. Return string

### src/formatters/markdown.formatter.ts

**Output template**:
```
# Changelog${version ? `\n\n## [${version}] - ${date}` : ''}
${sections.map(s => `\n### ${s.heading}\n${s.commits.map(c => `- ${c.scope ? `**${c.scope}**: ` : ''}${c.description}`).join('\n')}`).join('\n')}
${breaking.length ? `\n### BREAKING CHANGES\n${breaking.map(c => `- ${c.scope ? `**${c.scope}**: ` : ''}${c.description}`).join('\n')}` : ''}
```

### src/formatters/json.formatter.ts

**Output structure**:
```json
{
  "version": "1.0.0",
  "date": "2026-07-03",
  "sections": [
    {
      "type": "feat",
      "heading": "Features",
      "commits": [
        { "hash": "abc123", "type": "feat", "scope": "auth", "description": "add login", "breaking": false }
      ]
    }
  ]
}
```

### src/commands/generate.ts

Command handler that:
1. Reads CLI options from Commander
2. Creates ChangelogOptions object
3. Instantiates GitService, CommitParser, formatter, ChangelogService
4. Calls changelogService.generate(options)
5. If output: write to file with fs.writeFileSync
6. If no output: console.log result
7. Handles errors with console.error + process.exit(1)

### src/index.ts

```typescript
import { Command } from 'commander';

const program = new Command();
program
  .name('changelog-generator')
  .description('Generate changelogs from conventional commits')
  .version('0.1.0');

program
  .option('--from <ref>', 'Starting git ref (tag, commit, HEAD~N)')
  .option('--to <ref>', 'Ending git ref')
  .option('--output <file>', 'Output file path')
  .option('--format <format>', 'Output format: markdown or json', 'markdown')
  .option('--repo <path>', 'Repository path', process.cwd())
  .option('--ver <semver>', 'Version for changelog header')
  .option('--group', 'Group commits by type', true)
  .option('--no-group', 'Do not group commits')
  .option('--all', 'Include non-conventional commits')
  .option('--type <types>', 'Filter by commit types (comma-separated)')
  .action((options) => {
    // Import and run generate handler
    import('./commands/generate.js').then(m => m.default(options));
  });

program.parse(process.argv);
```

## Error Handling Matrix

| Scenario | Error Message | Exit Code |
|----------|---------------|-----------|
| Not a git repo | `Error: Not a git repository: /path` | 1 |
| Invalid git ref | `Error: Invalid git ref: v999.0.0` | 1 |
| Git not installed | `Error: Git is not installed or not in PATH` | 1 |
| Permission denied (output) | `Error: Cannot write to /path (EACCES)` | 1 |
| Invalid format | `Error: Invalid format. Use "markdown" or "json"` | 1 |

## Test Plan

| Test File | Tests | Approach |
|-----------|-------|----------|
| `commit.parser.test.ts` | 8-10 tests | Pure function, no mocks |
| `markdown.formatter.test.ts` | 6-8 tests | Pure function, no mocks |
| `json.formatter.test.ts` | 4-6 tests | Pure function, no mocks |
| `git.service.test.ts` | 4-5 tests | Mock execSync |
| `cli.integration.test.ts` | 3-4 tests | Mock ChangelogService |

### Type Section Display Order

The sections in Markdown MUST follow this order (not alphabetical):
1. Features (feat)
2. Bug Fixes (fix)
3. Performance (perf)
4. Refactors (refactor)
5. Documentation (docs)
6. Tests (test)
7. CI/CD (ci)
8. Build (build)
9. Style (style)
10. Chores (chore)
11. Reverts (revert)
