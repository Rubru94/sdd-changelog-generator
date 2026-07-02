Proyecto completado. Aquí tienes un resumen final de todo lo que se hizo:
✅ Resumen: Migración world-clock → changelog-generator

1. Limpieza
- Eliminado src/ completo (controllers, routes, services, middleware, tests world-clock)
- Eliminado .opencode/changes/archive/2026-07-02-world-clock-core/
- Eliminado src/jira.ts
- Removidas dependencias world-clock (express, supertest, axios)


2. Documentación Fundacional (requisito SDD)
Archivo	Propósito
SPEC.md	Especificación funcional del changelog generator
ARCHITECTURE.md	Arquitectura por capas + decisiones de diseño
AGENTS.md	Instrucciones del proyecto para el agente
agents/orchestrator.md	Definición del orquestador
agents/reviewer.md	Definición del revisor
rules.md	Reglas del auditor (PASS/WARN/FAIL)
EFFICIENCY.md	Baseline vs optimizado (3.75x menos tokens)
skills/changelog-generation.md	Skill reutilizable
tools/mock-git-api/	Mock API para probar sin Git real
tests/golden.jsonl	Golden tests

3. Implementación (SDD pipeline: changelog-core)
src/
├── index.ts                    # CLI con Commander (--from, --to, --format, --ver, --output, --repo, --group, --all, --type)
├── types/commit.types.ts       # Interfaces: Commit, CommitType, ChangelogOptions
├── parsers/commit.parser.ts    # Regex parser para conventional commits (type, scope, breaking, footers)
├── formatters/
│   ├── markdown.formatter.ts   # Output Markdown con secciones agrupadas
│   └── json.formatter.ts       # Output JSON estructurado
├── services/
│   ├── git.service.ts          # Git log via spawnSync (sin shell)
│   └── changelog.service.ts    # Pipeline: log → parse → filter → group → format
├── commands/generate.ts        # Command handler
└── __tests__/                  # 35 tests, 5 suites

4. Resultados
- ✅ TypeScript: tsc --noEmit sin errores
- ✅ Tests: 35/35 pasando
- ✅ Build: tsc compila sin errores
- ✅ CLI: --help, -V, generación Markdown/JSON funcionando
- ✅ Linter & Format: Prettier aplicado