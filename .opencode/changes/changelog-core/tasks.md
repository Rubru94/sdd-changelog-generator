# Tasks: changelog-core

## Phase 1: Types

### T-001: Create src/types/commit.types.ts
- **Type**: code
- **Files**: `src/types/commit.types.ts`
- **Description**: Define CommitType, Commit, GroupedCommits, ChangelogOptions interfaces, COMMIT_TYPE_HEADINGS mapping, and COMMIT_TYPES array.
- **Acceptance**:
  - All types exported and used by other modules
  - `tsc --noEmit` sin errores
- **Depends on**: —

## Phase 2: Parser

### T-002: Create src/parsers/commit.parser.ts
- **Type**: code
- **Files**: `src/parsers/commit.parser.ts`
- **Description**: Implement conventional commit parser with regex. Parse type, scope, breaking indicator, description. Detect BREAKING CHANGE in body. Parse footers.
- **Acceptance**:
  - `parse('feat(auth): add login')` → `{ type: 'feat', scope: 'auth', description: 'add login', breaking: false }`
  - `parse('fix: correct timeout')` → `{ type: 'fix', scope: undefined, description: 'correct timeout', breaking: false }`
  - `parse('feat! : breaking')` → `{ breaking: true }`
  - `parse('non-conventional')` → `{ type: undefined, description: 'non-conventional' }`
  - Body con `BREAKING CHANGE:` detecta breaking=true
  - `tsc --noEmit` sin errores
- **Depends on**: T-001

### T-003: Create src/__tests__/commit.parser.test.ts
- **Type**: test
- **Files**: `src/__tests__/commit.parser.test.ts`
- **Description**: Tests for parser covering all conventional commit formats, edge cases, breaking changes, footers.
- **Acceptance**:
  - 8+ tests covering all scenarios
  - `npm test` passes
- **Depends on**: T-002

## Phase 3: Formatters

### T-004: Create src/formatters/markdown.formatter.ts
- **Type**: code
- **Files**: `src/formatters/markdown.formatter.ts`
- **Description**: Implement Markdown changelog formatter. Output structured Markdown with headers, grouped sections, breaking changes section.
- **Acceptance**:
  - Output starts with `# Changelog`
  - `--ver` includes `## [version] - date`
  - Commits grouped by type with section headers
  - Breaking changes in separate section
  - Empty commits shows "No changes" message
  - `tsc --noEmit` sin errores
- **Depends on**: T-001

### T-005: Create src/formatters/json.formatter.ts
- **Type**: code
- **Files**: `src/formatters/json.formatter.ts`
- **Description**: Implement JSON changelog formatter with structured output.
- **Acceptance**:
  - Output is valid JSON
  - Structure: `{ version?, date?, sections: [{ type, heading, commits }] }`
  - `tsc --noEmit` sin errores
- **Depends on**: T-001

### T-006: Create src/__tests__/markdown.formatter.test.ts
- **Type**: test
- **Files**: `src/__tests__/markdown.formatter.test.ts`
- **Description**: Tests for markdown formatter.
- **Acceptance**:
  - 6+ tests covering all scenarios
  - `npm test` passes
- **Depends on**: T-004

### T-007: Create src/__tests__/json.formatter.test.ts
- **Type**: test
- **Files**: `src/__tests__/json.formatter.test.ts`
- **Description**: Tests for JSON formatter.
- **Acceptance**:
  - 4+ tests covering all scenarios
  - `npm test` passes
- **Depends on**: T-005

## Phase 4: Services

### T-008: Create src/services/git.service.ts
- **Type**: code
- **Files**: `src/services/git.service.ts`
- **Description**: Implement git log retrieval using execSync. Parse structured git output.
- **Acceptance**:
  - `getLog({ repo: '.', from: 'HEAD~5', to: 'HEAD' })` returns string[]
  - Error thrown for non-git directory
  - Error thrown for invalid git refs
  - `tsc --noEmit` sin errores
- **Depends on**: T-001

### T-009: Create src/services/changelog.service.ts
- **Type**: code
- **Files**: `src/services/changelog.service.ts`
- **Description**: Orchestrate pipeline: git log → parse → filter → group → format.
- **Acceptance**:
  - Full pipeline produces correct output
  - Filtering by type works (--type feat,fix)
  - Grouping works (--group / --no-group)
  - Non-conventional filtered by default, included with --all
  - `tsc --noEmit` sin errores
- **Depends on**: T-002, T-004, T-005, T-008

### T-010: Create src/__tests__/git.service.test.ts
- **Type**: test
- **Files**: `src/__tests__/git.service.test.ts`
- **Description**: Tests for git service with mocked execSync.
- **Acceptance**:
  - 4+ tests covering parsing, errors, edge cases
  - `npm test` passes
- **Depends on**: T-008

## Phase 5: CLI

### T-011: Create src/commands/generate.ts
- **Type**: code
- **Files**: `src/commands/generate.ts`
- **Description**: Implement generate command handler. Wire Commander options to ChangelogService.
- **Acceptance**:
  - Reads all options from Commander
  - Calls changelogService.generate(options)
  - Writes to file if --output specified
  - Prints to stdout otherwise
  - Handles errors with console.error + process.exit(1)
  - `tsc --noEmit` sin errores
- **Depends on**: T-009

### T-012: Create src/index.ts
- **Type**: code
- **Files**: `src/index.ts`
- **Description**: CLI entry point with Commander setup.
- **Acceptance**:
  - `npm run dev -- --help` shows all options
  - `npm run dev` runs generate with defaults
  - `tsc --noEmit` sin errores
- **Depends on**: T-011

### T-013: Create src/__tests__/cli.integration.test.ts
- **Type**: test
- **Files**: `src/__tests__/cli.integration.test.ts`
- **Description**: Integration tests for CLI.
- **Acceptance**:
  - 3+ tests covering CLI scenarios
  - `npm test` passes
- **Depends on**: T-012

## Phase 6: Build & Verify

### T-014: Verify full build and tests
- **Type**: verify
- **Files**: —
- **Description**: Run typecheck, tests, and manual smoke test.
- **Acceptance**:
  - `npm run typecheck` exit 0
  - `npm test` all pass
  - `npm run dev` generates changelog for this repo
  - `npm run dev -- --help` shows complete help
- **Depends on**: T-003, T-006, T-007, T-010, T-013
