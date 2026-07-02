# Changelog Generator — SPEC

## Overview

**Changelog Generator** es una herramienta CLI que lee el historial de commits de un repositorio Git, parsea mensajes escritos en formato **Conventional Commits** y genera un changelog estructurado en Markdown (o JSON).

El objetivo es automatizar la generación de changelogs para proyectos que siguen Conventional Commits, eliminando la necesidad de mantenerlos manualmente.

## Problem Statement

Mantener un changelog actualizado manualmente es tedioso y propenso a errores. Los desarrolladores suelen olvidar documentar cambios, o el formato del changelog se vuelve inconsistente entre versiones. Herramientas como `git-cliff` o `standard-version` existen, pero este proyecto busca una implementación ligera, educativa y extensible, construida con SDD (Spec-Driven Development).

## Target Users

- **Desarrolladores** que usan Conventional Commits y quieren generar changelogs automáticamente
- **Equipos de software** que necesitan changelogs consistentes para sus releases
- **Estudiantes** que quieren entender el parsing de commits y generación de documentos

## Use Cases

### UC-01: Generar changelog completo
El usuario ejecuta el CLI sin argumentos y obtiene un changelog con todos los commits convencionales desde el inicio del repo.

### UC-02: Generar changelog por rango
El usuario especifica `--from v1.0.0 --to v2.0.0` y obtiene solo los commits entre esas dos etiquetas.

### UC-03: Generar changelog para una versión específica
El usuario usa `--version 1.5.0` y el changelog incluye un encabezado con el número de versión y la fecha actual.

### UC-04: Filtrar por tipo de commit
El usuario usa `--type feat,fix` para incluir solo features y bugfixes, excluyendo chores y refactors.

### UC-05: Cambiar formato de salida
El usuario usa `--format json` y obtiene el changelog en JSON estructurado en lugar de Markdown.

### UC-06: Guardar en archivo
El usuario usa `--output CHANGELOG.md` y el resultado se escribe en un archivo en lugar de stdout.

### UC-07: Repositorio remoto
El usuario usa `--repo /path/to/repo` para generar el changelog de un repositorio que no es el directorio actual.

## Functional Requirements

### FR-001: CLI entry point
- **Priority**: High
- **Description**: El sistema MUST exponer un CLI ejecutable via `npx changelog-generator` o `npm run dev -- [args]`. Debe mostrar ayuda con `--help`.
- **Acceptance**: `npm run dev -- --help` muestra todos los comandos y opciones disponibles.

### FR-002: Git log retrieval
- **Priority**: High
- **Description**: El sistema MUST ejecutar `git log` en el repositorio especificado (o CWD por defecto) para obtener el historial de commits. Debe soportar rangos via `--from` y `--to` usando tags, commit hashes o referencias.
- **Acceptance**: Ejecutar el CLI en un repo Git devuelve commits sin errores. `--from HEAD~5` devuelve los últimos 5 commits.

### FR-003: Conventional commit parsing
- **Priority**: High
- **Description**: El sistema MUST parsear mensajes de commit en formato Conventional Commit: `type(scope): description`. Debe extraer type, scope (opcional), description, breaking changes (`!` o `BREAKING CHANGE`), y footers.
- **Acceptance**: `feat(auth): add login` → `{ type: 'feat', scope: 'auth', description: 'add login', breaking: false }`. `feat! : breaking change` → `{ breaking: true }`.

### FR-004: Commit type classification
- **Priority**: High
- **Description**: El sistema MUST clasificar commits por tipo: feat, fix, chore, refactor, docs, style, test, perf, ci, build, revert. Commits que no coincidan con el formato convencional MUST ser omitidos por defecto.
- **Acceptance**: Solo commits con formato convencional aparecen en el changelog por defecto. `--all` incluye commits no convencionales.

### FR-005: Markdown output
- **Priority**: High
- **Description**: El sistema MUST generar un changelog en Markdown válido con estructura: headers por versión (si se especifica), secciones agrupadas por tipo (Features, Bug Fixes, etc.), listas con descripciones y scopes, bloques de código para breaking changes.
- **Acceptance**: El output Markdown es parseable como Markdown válido.

### FR-006: JSON output
- **Priority**: Medium
- **Description**: El sistema MUST generar output en JSON estructurado cuando `--format json` está activo, con la misma información que el Markdown pero en formato machine-readable.
- **Acceptance**: `--format json` produce JSON válido con estructura `{ version, date, sections: { type: string, commits: Commit[] }[] }`.

### FR-007: Error handling
- **Priority**: High
- **Description**: El sistema MUST manejar errores gracefulmente: repo no encontrado, tag inválido, commit range inválido, permisos insuficientes. Los errores MUST mostrar un mensaje claro en stderr y salir con código distinto de cero.
- **Acceptance**: Ejecutar en un directorio sin repo Git muestra mensaje de error claro y exit code !== 0.

### FR-008: Empty changelog
- **Priority**: Medium
- **Description**: Cuando no hay commits en el rango especificado, el sistema MUST devolver un changelog vacío (sin errores) o un mensaje indicando que no hay cambios.
- **Acceptance**: `--from v999.0.0` (tag inexistente) muestra mensaje de que no hay commits en ese rango.

## Non-Functional Requirements

### NFR-001: Performance
- **Priority**: Medium
- **Description**: El sistema MUST procesar un repositorio con 1000+ commits en menos de 2 segundos.
- **Acceptance**: Benchmark con repo de prueba de 1000 commits.

### NFR-002: Portability
- **Priority**: Medium
- **Description**: El sistema MUST funcionar en macOS, Linux y Windows (vía Node.js).
- **Acceptance**: Tests pasan en los 3 SO.

### NFR-003: Zero runtime dependencies
- **Priority**: Low
- **Description**: Idealmente, las únicas dependencias de producción son Commander. El parsing y formateo usan APIs nativas de Node.js.
- **Acceptance**: `npm ls --prod` muestra solo `commander`.

## Constraints

- El proyecto usa Node.js + TypeScript con ESM (`"type": "module"`)
- Los commits deben seguir el formato Conventional Commit 1.0.0
- El CLI usa Commander como framework
- Los tests usan Vitest
- No se permite "vibe coding": toda implementación debe seguir el flujo SDD

## Assumptions

- El repositorio tiene Git instalado y accesible via PATH
- El usuario tiene permisos de lectura en el repositorio
- Los mensajes de commit pueden contener caracteres UTF-8
