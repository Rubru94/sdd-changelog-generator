# Proposal: changelog-core

## Intent
Implementar el núcleo del Changelog Generator CLI: parser de conventional commits, formateador Markdown/JSON, servicio Git, orquestación de changelog, y CLI entry point con Commander.

## Scope

### In Scope
- `src/index.ts` — CLI entry point with Commander
- `src/commands/generate.ts` — Generate command handler
- `src/services/git.service.ts` — Git log retrieval
- `src/services/changelog.service.ts` — Changelog orchestration
- `src/parsers/commit.parser.ts` — Conventional commit parsing
- `src/formatters/markdown.formatter.ts` — Markdown output
- `src/formatters/json.formatter.ts` — JSON output
- `src/types/commit.types.ts` — Shared TypeScript types
- Tests for all modules

### Out of Scope
- Config file support (.changelogrc)
- Templates (custom markdown templates)
- GitHub/GitLab integration
- CI/CD pipelines

## Capabilities
- `changelog-generate`: CLI command that produces changelogs from git history
- `commit-parse`: Parse conventional commit strings into structured data
- `markdown-format`: Generate Markdown changelog
- `json-format`: Generate JSON changelog
- `git-log`: Retrieve and filter git commit history

## Approach
Arquitectura por capas según ARCHITECTURE.md. Implementación TDD: primero tipos, luego parser, luego formatters, luego services, luego CLI. Cada componente con tests unitarios.

## Dependencies
- `commander` ^13.1.0 (ya instalado)

## Success Criteria
- [ ] `npm run typecheck` sin errores
- [ ] `npm test` pasa todos los tests
- [ ] `npm run dev -- --help` muestra ayuda completa
- [ ] `npm run dev` genera changelog del repo actual
- [ ] Parser maneja todos los tipos de conventional commits
- [ ] Formateador Markdown produce output válido
- [ ] Formateador JSON produce JSON válido
- [ ] Errores (no git repo, ref inválido) manejados gracefulmente
