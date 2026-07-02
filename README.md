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
├── .gitignore                       ← Ignora node_modules, dist, .env
│
├── src/
│   ├── index.ts                     ← Entry point CLI
│   └── __tests__/                   ← Tests Vitest
│
├── .opencode/
│   ├── agent/
│   │   └── sdd-orchestrator.md      ← Orquestador SDD
│   └── skills/                      ← Skills del proyecto
│
├── agents/                          ← Definiciones de agentes
│   ├── orchestrator.md
│   └── reviewer.md
│
├── skills/                          ← Skills reutilizables
│
├── tools/                           ← MCP o Mock API
│
├── tests/                           ← Golden tests
│   └── golden.jsonl
│
├── rules.md                         ← Reglas del auditor
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
npm run build        # Compilar TypeScript
npm run start        # Ejecutar versión compilada
npm run test         # Ejecutar tests (Vitest)
npm run test:watch   # Tests en modo watch
npm run lint         # ESLint
npm run typecheck    # tsc --noEmit
```
