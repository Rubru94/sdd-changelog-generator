# Changelog Generator — Architecture

## Overview

**Changelog Generator** es una CLI construida con Node.js + TypeScript (ESM) y Commander. Sigue una arquitectura por capas con separación clara de responsabilidades: CLI, servicios, parsers, formatters y tipos.

## Stack

| Componente | Tecnología | Razón |
|------------|-----------|-------|
| Runtime | Node.js 18+ (ESM) | Universal, portátil |
| Lenguaje | TypeScript 5.7 | Tipado estático, mejor DX |
| CLI Framework | Commander 13 | Estándar para CLIs Node.js |
| Testing | Vitest 3 | Rápido, compatible ESM |
| Linter | ESLint 9 + typescript-eslint | Calidad de código |
| Formatter | Prettier 3 | Formato consistente |

## Module Structure

```
src/
├── index.ts                    # CLI entry point with Commander
├── commands/
│   └── generate.ts             # 'generate' subcommand handler
├── services/
│   ├── git.service.ts          # Git log retrieval via execSync
│   └── changelog.service.ts    # Orchestration: get log → parse → group → format
├── parsers/
│   └── commit.parser.ts        # Conventional commit regex parser
├── formatters/
│   ├── markdown.formatter.ts   # Markdown output generator
│   └── json.formatter.ts       # JSON output generator
├── types/
│   └── commit.types.ts         # TypeScript interfaces & types
└── __tests__/
    ├── commit.parser.test.ts   # Unit tests for parser
    ├── markdown.formatter.test.ts  # Unit tests for markdown formatter
    ├── json.formatter.test.ts      # Unit tests for JSON formatter
    ├── git.service.test.ts     # Unit tests for git service
    └── cli.integration.test.ts # Integration tests (VITEST_INTEGRATION)
```

## Component Responsibilities

### 1. CLI Layer (`src/index.ts` + `src/commands/generate.ts`)

**Purpose**: Bootstrap Commander, register commands, parse CLI arguments, handle exit codes.

```
index.ts:
  - Create Commander program
  - Set name, version, description
  - Register 'generate' as default command
  - Call .parse()

generate.ts:
  - Define options (--from, --to, --output, --format, --group, --repo, --version, --all, --type)
  - Instantiate ChangelogService
  - Call service.generate(options)
  - Write output to stdout or file
  - Handle errors with process.exit(1)
```

**Dependencies**: `commander`, `services/changelog.service.ts`

### 2. Services Layer (`src/services/`)

#### git.service.ts
**Purpose**: Execute `git log` commands and return raw commit data.

```typescript
interface GitService {
  getLog(options: { repo?: string; from?: string; to?: string; all?: boolean }): string[];
  getTags(repo?: string): string[];
}
```

- Uses `child_process.execSync` to run git commands
- Parses git log output with `--format` for structured data
- Handles errors: invalid repo, invalid ref, git not installed
- Returns raw commit lines as string[] (one commit per entry with all metadata)

**Key design**: `--format` uses `%H%n%s%n%b%n---end-of-commit---` delimiter to parse multi-line commits.

#### changelog.service.ts
**Purpose**: Orchestrate the full changelog generation pipeline.

```typescript
interface ChangelogService {
  generate(options: ChangelogOptions): string;
}
```

Pipeline:
1. Call `gitService.getLog(options)` → raw commit strings
2. Parse each raw commit with `commitParser.parse(line)` → `Commit[]`
3. Apply filters (type filter, exclude non-conventional unless --all)
4. Group commits by type
5. Call appropriate formatter (markdown or json)
6. Return formatted string

### 3. Parser Layer (`src/parsers/commit.parser.ts`)

**Purpose**: Parse conventional commit strings into structured objects.

```typescript
interface CommitParser {
  parse(rawCommit: string): Commit;
  parseType(rawType: string): CommitType;
}
```

**Regex pattern**:
```
/^(?<type>\w+)(?:\((?<scope>[^)]+)\))?(?<breaking>!)?:\s*(?<description>.+)$/m
```

Parsing logic:
1. Extract first line as subject
2. Apply conventional commit regex to subject
3. Extract type, scope, breaking indicator
4. Parse body (everything after first blank line)
5. Detect `BREAKING CHANGE:` in body or footers
6. Extract footers (lines with `key: value` format)

### 4. Formatter Layer (`src/formatters/`)

#### markdown.formatter.ts
**Purpose**: Generate Markdown changelog.

```typescript
interface MarkdownFormatter {
  format(commits: GroupedCommits, options: ChangelogOptions): string;
}
```

Output structure:
```markdown
# Changelog

## [1.0.0] - 2026-07-03

### Features
- **auth**: add login endpoint ([abc1234](https://...))
- **api**: implement rate limiting

### Bug Fixes
- **ui**: fix button alignment

### BREAKING CHANGES
- **core**: migrate to new database schema
```

#### json.formatter.ts
**Purpose**: Generate JSON structured changelog.

```typescript
interface JsonFormatter {
  format(commits: GroupedCommits, options: ChangelogOptions): string;
}
```

Output: JSON with `{ version, date, sections: [{ type, heading, commits: Commit[] }] }`.

### 5. Types Layer (`src/types/commit.types.ts`)

```typescript
type CommitType = 'feat' | 'fix' | 'chore' | 'refactor' | 'docs' | 'style' 
                | 'test' | 'perf' | 'ci' | 'build' | 'revert';

interface Commit {
  hash: string;
  type: CommitType;
  scope?: string;
  description: string;
  body?: string;
  breaking: boolean;
  footers: Record<string, string>;
}

interface GroupedCommits {
  [type: string]: Commit[];
}

interface ChangelogOptions {
  from?: string;        // Git ref (tag, commit hash, HEAD~N)
  to?: string;          // Git ref
  format: 'markdown' | 'json';
  group: boolean;
  output?: string;      // File path
  repo?: string;        // Repo path (default: cwd)
  version?: string;     // Semver for header
  all?: boolean;        // Include non-conventional commits
  type?: CommitType[];  // Filter by types
}
```

## Data Flow

```
User runs CLI
    │
    ▼
Commander parses args (index.ts)
    │
    ▼
generate handler creates options object
    │
    ▼
changelog.service.generate(options)
    │
    ├─► git.service.getLog({ from, to, repo, all })
    │       │
    │       ▼
    │   execSync('git log --format=...')
    │       │
    │       ▼
    │   raw commit strings[]
    │
    ├─► commit.parser.parse(rawCommit)
    │       │
    │       ▼
    │   Commit object
    │
    ├─► [repeat for each raw commit]
    │
    ├─► Filter commits (type filter, conventional check)
    │
    ├─► Group commits by type (if --group)
    │
    ├─► formatter.format(groupedCommits, options)
    │       │
    │       ▼
    │   Formatted string (markdown or json)
    │
    ▼
Write to stdout or file
```

## Error Handling Strategy

| Capa | Error | Respuesta |
|------|-------|-----------|
| CLI | Argumento inválido | Commander muestra error + --help |
| Git service | No es repo Git | Error claro: `"Not a git repository: /path"` |
| Git service | Ref inválido | Error: `"Invalid git ref: v999.0.0"` |
| Git service | Git no instalado | Error: `"Git is not installed or not in PATH"` |
| Parser | Commit mal formado | Skip (log debug) o incluir como "Other" si --all |
| Formatter | Error de escritura | Error: `"Cannot write to file: /path (permission denied)"` |

No se usan excepciones personalizadas — se usa `console.error()` + `process.exit(1)` para errores fatales, y returns para advertencias.

## Design Decisions

### Decision 1: execSync over native git bindings
- **Context**: Necesitamos ejecutar comandos git
- **Option A**: `execSync` de Node.js
- **Option B**: `isomorphic-git` (librería JS pura)
- **Decision**: **A** — execSync. Razón: cero dependencias, usa el git del sistema, más rápido, más familiar. No necesitamos operaciones remotas.
- **Trade-off**: Dependemos de git instalado (asumido).

### Decision 2: Strategy pattern for formatters
- **Context**: Soportamos Markdown y JSON
- **Decision**: Interface común `Formatter` con implementaciones separadas. Fácil añadir nuevos formatos (YAML, HTML).
- **Trade-off**: Mínimo overhead de abstracción para máxima extensibilidad.

### Decision 3: Single command over subcommands
- **Context**: CLI puede tener generate, init, validate...
- **Decision**: Por ahora solo `generate` como comando por defecto (no requiere subcomando explícito). Se puede extender con subcomandos más adelante.
- **Trade-off**: Simplicidad ahora, extensibilidad después.

### Decision 4: GroupByType as post-processing
- **Context**: Los commits pueden agruparse por tipo en el service o en el formatter
- **Decision**: El service agrupa (lógica de negocio). El formatter solo recibe datos ya agrupados y los pinta.
- **Trade-off**: El service conoce tipos, el formatter no necesita saber de tipos de commit.

## AI Model Assignments

| Fase / Componente | Modelo | Razón |
|-------------------|--------|-------|
| Orquestación | `opencode/big-pickle` | Coordinación, decisiones de flujo |
| Specs y diseño | Sonnet | Documentación estructurada |
| Parser (regex) | Sonnet | Patrones complejos, edge cases |
| Formatters | Sonnet | Template logic |
| Tests | Sonnet | Cobertura, casos borde |
| Code review | Haiku | Ligero, rápido para revisiones |

## Performance

- **Objetivo**: < 2s para 1000 commits
- **Cuello de botella**: `execSync` de git log (depende del tamaño del repo)
- **Optimización**: Usar `--format` con delimitadores en vez de parsear output crudo
- **No se requiere**: Caching, parallelismo, streaming (el volumen es pequeño)
