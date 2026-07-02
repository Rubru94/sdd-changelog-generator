# SDD Project Template

Plantilla de proyecto lista para desarrollar con **Spec-Driven Development (SDD)** y el modelo **big-pickle**.

Este repositorio es un **punto de partida** — una base limpia, sin dependencias de terceros, preparada para iniciar cualquier tipo de proyecto siguiendo el flujo SDD: desde una CLI en Go hasta una API en Node.js.

## Stack por defecto

| Componente | Valor |
|------------|-------|
| **Modelo** | `opencode/big-pickle` |
| **Orquestador** | `sdd-orchestrator` (`.opencode/agent/sdd-orchestrator.md`) |
| **Persistencia** | Engram (memoria persistente entre sesiones) |
| **Skills globales** | branch-pr, issue-creation, judgment-day, prompt-engineer, go-testing, nodejs-backend-patterns |
| **Skills SDD** | init, explore, propose, spec, design, tasks, apply, verify, archive, onboard |

## ¿Qué es SDD?

**Spec-Driven Development** es un flujo de trabajo estructurado que planifica antes de implementar:

```
/sdd-new <change>  →  proposal → specs → design → tasks → apply → verify → archive
```

Cada fase la ejecuta un subagente especializado. El orquestador coordina, no ejecuta. Esto garantiza:

- **Traza completa**: cada decisión queda documentada
- **Aislamiento de fallos**: si una fase falla, solo se re-ejecuta esa
- **Contexto quirúrgico**: cada subagente recibe solo lo que necesita
- **Calidad**: especificación antes que implementación, verificación después

## Cómo empezar

### 1. Definir el stack

Antes del primer cambio, inicializa SDD para que detecte tu stack:

```
/sdd-init
```

Esto escanea el proyecto, detecta el stack (lenguaje, test runner, linter) y configura la persistencia.

### 2. Crear un cambio

```
/sdd-new mi-nuevo-feature
```

El orquestador lanza las fases en orden. Puedes elegir entre:

- **Modo automático**: todas las fases seguidas, sin pausa
- **Modo interactivo**: después de cada fase, te muestra el resultado y pregunta si continuar

### 3. Continuar un cambio existente

```
/sdd-continue mi-nuevo-feature
```

Retoma el cambio desde la siguiente fase disponible.

### 4. Verificar e implementar

```
/sdd-apply mi-cambio      # Implementa las tareas
/sdd-verify mi-cambio     # Valida contra las especificaciones
/sdd-archive mi-cambio    # Archiva el cambio completado
```

## Comandos rápidos

| Comando | Qué hace |
|---------|----------|
| `/sdd-init` | Inicializa SDD en el proyecto |
| `/sdd-new <nombre>` | Nuevo cambio: propuesta → specs → diseño → tareas → aplicar → verificar → archivar |
| `/sdd-continue <nombre>` | Continúa el cambio desde donde se quedó |
| `/sdd-ff <nombre>` | Fast-forward: planea todo de golpe (propuesta + specs + diseño + tareas) |
| `/sdd-explore <tema>` | Investiga una idea sin comprometerse a un cambio |
| `/sdd-apply <nombre>` | Implementa las tareas de un cambio |
| `/sdd-verify <nombre>` | Valida la implementación contra las specs |
| `/sdd-archive <nombre>` | Archiva un cambio completado |

## Estructura del proyecto

```
sdd-project-template/
├── AGENTS.md                        ← Instrucciones del proyecto para el agente
├── opencode.json                    ← Configuración del proyecto (modelo, agente, instrucciones)
├── README.md                        ← Esta plantilla
│
├── .opencode/
│   ├── agent/
│   │   └── sdd-orchestrator.md      ← Orquestador SDD (agente principal)
│   └── skills/                      ← Skills propias del proyecto (vacío, para añadir)
│
└── ...                              ← Tu código fuente aquí
```

## Skills incorporadas

### SDD (sistema)
- `sdd-init` — Bootstrap del contexto SDD
- `sdd-explore` — Investigación exploratoria del código
- `sdd-propose` — Creación de propuestas de cambio
- `sdd-spec` — Redacción de especificaciones
- `sdd-design` — Diseño técnico detallado
- `sdd-tasks` — Desglose en tareas implementables
- `sdd-apply` — Implementación de código
- `sdd-verify` — Validación contra especificaciones
- `sdd-archive` — Cierre y archivado de cambios

### Globales (genéricas)
- `branch-pr` — Creación de PRs con issue-first
- `issue-creation` — Creación de issues en GitHub
- `judgment-day` — Revisión adversarial paralela
- `prompt-engineer` — Refinamiento de prompts
- `go-testing` — Testing en Go (cuando aplique)
- `nodejs-backend-patterns` — Patrones Node.js (cuando aplique)

## Convenciones del proyecto

- **Idioma**: español para comunicación, inglés para código y documentación técnica
- **Commits**: conventional commits en inglés (`feat:`, `fix:`, `chore:`, etc.)
- **Testing**: según detecte `sdd-init` (TDD si hay test runner disponible)
- **Persistencia**: Engram (predeterminado)

## Notas

- El directorio `.opencode/skills/` está vacío para que añadas las skills específicas de tu proyecto.
- El skill registry vive en Engram (no en disco) para mantener el proyecto limpio.
