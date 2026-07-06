# SDD Changelog Generator

Generador de changelogs basado en **conventional commits**, construido con **Spec-Driven Development (SDD)** y Node.js + TypeScript.

Lee el historial de Git, parsea los mensajes de commit (Conventional Commits), y genera un changelog estructurado en formato Markdown. Puede filtrar por rango de fechas, tags, o commits específicos.

## Stack del Proyecto

| Componente | Valor |
|------------|-------|
| **Runtime** | Node.js + TypeScript (ESM) |
| **CLI Framework** | Commander |
| **Testing** | Vitest |
| **Linter** | ESLint 9 |
| **Formatter** | Prettier |
| **Modelo orquestador** | `opencode/big-pickle` |
| **Persistencia** | Engram (memoria persistente entre sesiones) |
| **Skills SDD** | init, explore, propose, spec, design, tasks, apply, verify, archive, onboard |

## ¿Qué es SDD?

**Spec-Driven Development** es un flujo de trabajo estructurado que planifica antes de implementar:

```
/sdd-new <change>  →  proposal → specs → design → tasks → apply → verify → archive
```

Cada fase la ejecuta un subagente especializado. El orquestador coordina, no ejecuta.

## Cómo empezar

### 1. Inicializar SDD

```bash
/sdd-init
```

### 2. Crear un cambio

```bash
/sdd-new mi-nuevo-feature
```

### 3. Continuar un cambio existente

```bash
/sdd-continue mi-nuevo-feature
```

### 4. Verificar e implementar

```bash
/sdd-apply mi-cambio      # Implementa las tareas
/sdd-verify mi-cambio     # Valida contra las especificaciones
/sdd-archive mi-cambio    # Archiva el cambio completado
```

## Comandos rápidos

| Comando | Qué hace |
|---------|----------|
| `/sdd-init` | Inicializa SDD en el proyecto |
| `/sdd-new <nombre>` | Nuevo cambio completo |
| `/sdd-continue <nombre>` | Continúa el cambio desde donde se quedó |
| `/sdd-ff <nombre>` | Fast-forward planning |
| `/sdd-explore <tema>` | Investiga una idea |
| `/sdd-apply <nombre>` | Implementa las tareas |
| `/sdd-verify <nombre>` | Valida contra las specs |
| `/sdd-archive <nombre>` | Archiva un cambio completado |

## Estructura del proyecto

```
changelog-generator/
├── AGENTS.md                        ← Instrucciones del proyecto para el agente
├── SPEC.md                          ← Especificación funcional del producto
├── ARCHITECTURE.md                  ← Documento de arquitectura
├── opencode.json                    ← Configuración del proyecto
├── README.md                        ← Este documento
├── package.json                     ← Node.js + TypeScript + Commander
├── tsconfig.json                    ← TypeScript config
├── vitest.config.ts                 ← Vitest test runner
├── eslint.config.js                 ← ESLint flat config
├── .prettierrc                      ← Prettier formatter
├── .gitignore                       ← Ignora node_modules, dist, pkg, .env
│
├── agents/                          ← Agentes del sistema (orquestador + revisor)
│   ├── orchestrator.md              ← Orquestador SDD (principal)
│   └── reviewer.md                  ← Revisor de calidad
│
├── skills/                          ← Skills del proyecto
│   └── changelog-generation/        ← Skill de generación de changelogs
│       └── SKILL.md
│
├── src/
│   ├── index.ts                     ← Entry point CLI
│   └── __tests__/                   ← Tests Vitest
│
├── .opencode/                       ← Bootstrap de opencode (package.json, node_modules)
├── tools/                           ← MCP o Mock API
├── tests/                           ← Golden tests
│   └── golden.jsonl
│
├── rules.md                         ← Reglas del evaluador
├── EFFICIENCY.md                    ← Métricas de eficiencia
└── Practica_Individual_2Semanas.md  ← Enunciado de la práctica
```

## Convenciones del proyecto

- **Idioma**: español para comunicación, inglés para código y documentación técnica
- **Commits**: conventional commits en inglés (`feat:`, `fix:`, `chore:`, etc.)
- **Testing**: Vitest con TDD
- **Persistencia**: Engram (predeterminado)

## Scripts disponibles

```bash
npm run dev          # Desarrollo con hot-reload (tsx watch)
npm run build        # Compilar TypeScript → dist/
npm run start        # Ejecutar versión compilada (node dist/index.js)
npm run test         # Ejecutar tests (Vitest)
npm run test:watch   # Tests en modo watch
npm run lint         # ESLint
npm run typecheck    # tsc --noEmit
npm run package      # Compilar + generar binarios standalone → pkg/
```

## Binarios portables

El proyecto puede empaquetarse como binario standalone para **Linux, macOS y Windows** sin necesidad de Node.js ni npm.

### Generar los binarios

```bash
npm run package
```

Esto compila TypeScript y empaqueta todo (incluyendo Commander) en un solo ejecutable:

```
pkg/
├── changelog-generator-linux        (49 MB)
├── changelog-generator-macos        (54 MB)
└── changelog-generator-win.exe      (41 MB)
```

### Usar en cualquier repo

Copia el binario a cualquier repositorio con git y ejecútalo directamente:

```bash
# En Linux/macOS:
./changelog-generator-macos --from HEAD~5 --to HEAD

# En Windows:
changelog-generator-win.exe --from HEAD~5 --to HEAD

# Ejemplos:
./changelog-generator-macos --from v1.0.0 --to v2.0.0 --output CHANGELOG.md
./changelog-generator-macos --format json --from HEAD~10
./changelog-generator-macos --type feat,fix --group
```

Sin Node.js, sin npm install, sin dependencias. Binario autocontenido.
