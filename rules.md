# Rules — Changelog Generator

Reglas para el agente revisor. Define los criterios para PASS, WARN y FAIL.

## Evaluation Rules

### Code Quality

| Rule | Description | PASS | WARN | FAIL |
|------|-------------|------|------|------|
| R-001 | TypeScript compila sin errores | `tsc --noEmit` exit 0 | — | Cualquier error TS |
| R-002 | Tests pasan | `npm test` exit 0 | Tests lentos (>5s) | Tests fallan |
| R-003 | Sin dependencias no utilizadas | `npm ls` sin extras | — | Dependencia no usada en imports |
| R-004 | Formato consistente | Prettier sin cambios | — | Archivos sin formatear |
| R-005 | Linter sin errores | `npm run lint` exit 0 | Warnings | Errors |

### Conventional Commits

| Rule | Description | PASS | WARN | FAIL |
|------|-------------|------|------|------|
| R-006 | Commits siguen conventional commits | Todos los commits cumplen | 1-2 commits no convencionales | 3+ commits no convencionales |
| R-007 | Breaking changes documentados | `BREAKING CHANGE` en footer o `!` en subject | — | Breaking change no marcado |

### Architecture & Design

| Rule | Description | PASS | WARN | FAIL |
|------|-------------|------|------|------|
| R-008 | Separación de capas | services/ no importa express/commander | — | Service importa CLI framework |
| R-009 | Funciones puras en services | Sin side effects (solo IO en git service) | Side effects menores | Side effects en parser/formatter |
| R-010 | Tipos compartidos desde types/ | Un solo `commit.types.ts` | Tipos duplicados locales | Tipos esparcidos sin archivo común |

### Testing

| Rule | Description | PASS | WARN | FAIL |
|------|-------------|------|------|------|
| R-011 | Tests unitarios por componente | Cada capa tiene tests | Tests solo de integración | Sin tests |
| R-012 | Edge cases cubiertos | Empty input, malformed, breaking | Casos borde parciales | Solo happy path |
| R-013 | Sin tests rotos | `npm test` pasa completo | Tests flaky | Tests fallan |

### Documentation

| Rule | Description | PASS | WARN | FAIL |
|------|-------------|------|------|------|
| R-014 | SPEC y código coherentes | Todo req implementado | 1 req parcial | 2+ req no implementados |
| R-015 | ARCHITECTURE actualizada | Refleja estructura actual | Desactualizado parcial | No refleja la realidad |

### SDD Compliance

| Rule | Description | PASS | WARN | FAIL |
|------|-------------|------|------|------|
| R-016 | Cambio documentado en .opencode/changes/ | Todos los archivos presentes | Faltan 1 archivo | Faltan 2+ archivos |
| R-017 | Sin código sin especificación | Todo código tiene req asociado | 1 funcionalidad no especificada | 2+ sin especificar |

## PASS / WARN / FAIL Policy

- **PASS**: Todas las reglas PASS, ningún FAIL, hasta 3 WARN
- **WARN**: Sin FAIL, más de 3 WARN (se recomienda revisar pero no bloquea)
- **FAIL**: Cualquier regla FAIL → bloquea el avance, debe re-ejecutarse la fase necesaria

## Reviewer Workflow

1. Obtener diff de los cambios (no el código completo)
2. Ejecutar `npm run typecheck` y `npm test`
3. Revisar estructura de archivos contra ARCHITECTURE.md
4. Revisar que los tests cubren los escenarios de SPEC.md
5. Emitir veredicto: PASS | WARN | FAIL
6. Si FAIL, indicar QUÉ fase re-ejecutar y POR QUÉ
