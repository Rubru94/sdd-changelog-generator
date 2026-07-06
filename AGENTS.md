# SDD Project — Instrucciones del Proyecto

Este proyecto sigue el enfoque **Spec-Driven Development (SDD)**.

## Stack del Proyecto

| Componente | Valor |
|------------|-------|
| **Runtime** | Node.js + TypeScript (ESM) |
| **CLI Framework** | Commander |
| **Testing** | Vitest |
| **Linter** | ESLint 9 |
| **Formatter** | Prettier |

## Skills del Proyecto

Las skills específicas del proyecto viven en `skills/<skill>/SKILL.md`.

### Skills de proyecto (`skills/`)

| Skill | Propósito |
|-------|-----------|
| `changelog-generation` | Generación de changelogs desde conventional commits |

### Skills de sistema (globales)

| Skill | Propósito |
|-------|-----------|
| `branch-pr` | Creación de PRs con issue-first enforcement |
| `issue-creation` | Creación de issues en GitHub |
| `judgment-day` | Revisión adversarial paralela |
| `prompt-engineer` | Refinamiento de prompts |
| `go-testing` | Testing en Go (si aplica) |
| `nodejs-backend-patterns` | Patrones Node.js backend (si aplica) |

Skills SDD de sistema: `sdd-init`, `sdd-explore`, `sdd-propose`, `sdd-spec`, `sdd-design`, `sdd-tasks`, `sdd-apply`, `sdd-verify`, `sdd-archive`, `sdd-onboard`.

## Convenciones

- **Idioma**: español para comunicación, inglés para código y documentación técnica
- **Commits**: conventional commits en inglés
- **Testing**: según detecte `sdd-init` (TDD si hay test runner disponible)
- **Persistencia**: Engram (predeterminado) o el que se configure al empezar un cambio

## Workflow de ramas

Cada cambio nuevo (`/sdd-new`) crea una rama separada desde `main`:

```
/sdd-new <change>
  → git checkout -b <type>/<change> main
  → [SDD flow: spec → design → tasks → apply → review → verify]
  → npm run version:minor   (si es feat) o npm run version:patch (si es fix)
  → git commit -m "chore: bump version to X.Y.Z"
  → [archive]
  → opcional: gh pr create
```

- **Naming**: `<type>/<change-name>` — `feat/show-commit-date`, `fix/parser-crash`, `chore/update-deps`
- **Commits**: cada tarea implementada genera un commit convencional independiente
- **Version bump**: el orquestador ejecuta `npm run version:minor` o `:patch` antes de archivar, y lo commitea como `chore: bump version`
- **PR**: opcional, se puede crear al final del ciclo con `gh pr create`

## Flujo de Trabajo SDD

```
/sdd-new <change>  →  proposal → specs → design → tasks → apply → verify → archive
```

Cada fase la ejecuta un subagente especializado. El orquestador coordina, no ejecuta.
