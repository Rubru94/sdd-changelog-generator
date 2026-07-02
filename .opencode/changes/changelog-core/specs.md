# Specs: changelog-core

Delta specs for the first implementation of the Changelog Generator. References main SPEC.md for full context.

## Requirements

### REQ-CLI-001: CLI entry point
- **Priority**: High
- **Description**: El CLI MUST ser ejecutable via `npm run dev -- [args]` y `node dist/index.js [args]`. MUST mostrar ayuda completa con `--help`. MUST aceptar `generate` como subcomando o como comando por defecto.
- **Scenarios**:
  - `npm run dev -- --help` MUST mostrar opciones y salir con código 0
  - `npm run dev` MUST ejecutar generate con valores por defecto (repo=CWD, format=markdown, group=true)

### REQ-CLI-002: CLI options
- **Priority**: High
- **Description**: El CLI MUST aceptar las siguientes opciones:
  - `--from <ref>`: ref inicial (tag, commit hash, HEAD~N)
  - `--to <ref>`: ref final
  - `--output <file>`: archivo de salida (default: stdout)
  - `--format <format>`: formato de salida (`markdown` | `json`, default: `markdown`)
  - `--repo <path>`: ruta al repositorio (default: process.cwd())
  - `--ver <semver>`: versión para el encabezado
  - `--group`: agrupar commits por tipo (default: true)
  - `--no-group`: no agrupar
  - `--all`: incluir commits no convencionales
  - `--type <types>`: filtrar por tipos (coma separados, ej: feat,fix)
- **Scenarios**:
  - Cada opción MUST ser parseada correctamente por Commander
  - Tipos inválidos en `--type` MUST mostrar warning y continuar con tipos válidos
  - `--output` sin valor MUST usar stdout

### REQ-PARSE-001: Conventional commit parsing
- **Priority**: High
- **Description**: El parser MUST convertir strings de commits convencionales en objetos Commit estructurados.
- **Format**: `type(scope): description` o `type: description`
- **Scenarios**:
  - `feat(auth): add login` → `{ type: 'feat', scope: 'auth', description: 'add login', breaking: false }`
  - `fix: correct timeout` → `{ type: 'fix', scope: undefined, description: 'correct timeout', breaking: false }`
  - `feat! : breaking change` → `{ type: 'feat', scope: undefined, description: 'breaking change', breaking: true }`
  - `refactor(core)!: major refactor` → `{ type: 'refactor', scope: 'core', description: 'major refactor', breaking: true }`
  - `chore(deps): update lodash` → `{ type: 'chore', scope: 'deps', description: 'update lodash', breaking: false }`
  - Mensaje no convencional `fix bug` → `{ type: undefined, description: 'fix bug' }` (solo si --all)

### REQ-PARSE-002: Breaking change detection
- **Priority**: High
- **Description**: El parser MUST detectar breaking changes via `!` antes de `:` en el subject O `BREAKING CHANGE:` en el body/footers.
- **Scenarios**:
  - `feat! : add new API` → `{ breaking: true }`
  - `feat: add new API` con body `BREAKING CHANGE: removes old endpoints` → `{ breaking: true }`
  - `feat: add new API` sin indicadores → `{ breaking: false }`

### REQ-FMT-001: Markdown output
- **Priority**: High
- **Description**: El formateador Markdown MUST generar changelog estructurado con secciones por tipo de commit.
- **Scenarios**:
  - Output MUST empezar con `# Changelog` como header principal
  - Si `--ver` está presente, MUST incluir `## [version] - date`
  - Commits agrupados MUST tener headers tipo `### Features`, `### Bug Fixes`, etc.
  - Cada commit MUST mostrarse como `- **scope**: description` o `- description` si no hay scope
  - Breaking changes MUST tener sección `### BREAKING CHANGES` al final
  - Si no hay commits, MUST mostrar `No changes in the specified range.`

### REQ-FMT-002: JSON output
- **Priority**: Medium
- **Description**: El formateador JSON MUST generar un objeto JSON estructurado.
- **Scenarios**:
  - Output MUST ser JSON válido parseable con `JSON.parse()`
  - MUST tener estructura `{ version?: string, date?: string, sections: [{ type: string, heading: string, commits: Commit[] }] }`
  - Si `--ver` está presente, MUST incluir `version` y `date` en el root

### REQ-GIT-001: Git log retrieval
- **Priority**: High
- **Description**: El servicio Git MUST ejecutar `git log` y parsear el output estructurado.
- **Scenarios**:
  - MUST usar `execSync` con `git log --format="%H||%s||%b||---end---"`
  - MUST soportar `--from` y `--to` como refs de git
  - Si no hay `--from`, MUST empezar desde el primer commit
  - Si no hay `--to`, MUST ir hasta HEAD
  - MUST lanzar error claro si el directorio no es un repo git

### REQ-SVC-001: Changelog orchestration
- **Priority**: High
- **Description**: El servicio de changelog MUST orquestar el pipeline completo: git log → parse → group → format.
- **Scenarios**:
  - MUST llamar a git.service.getLog() para obtener commits raw
  - MUST parsear cada commit raw con commit.parser.parse()
  - MUST filtrar commits no convencionales si --all es false
  - MUST agrupar por tipo si --group es true
  - MUST llamar al formateador correspondiente (markdown o json)
  - MUST retornar string formateado

### REQ-TEST-001: Unit tests
- **Priority**: High
- **Description**: Cada módulo MUST tener tests unitarios con Vitest.
- **Scenarios**:
  - `commit.parser.test.ts`: probar todos los formatos de conventional commits, edge cases
  - `markdown.formatter.test.ts`: probar output con/sin version, con/sin group, breaking changes
  - `json.formatter.test.ts`: probar estructura JSON, con/sin version
  - `git.service.test.ts`: probar parsing de output de git log (mock de execSync)
  - `cli.integration.test.ts`: probar el CLI completo (con mock de git service)
