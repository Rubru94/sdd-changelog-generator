# Skill: changelog-generation

## Purpose
Generar changelogs estructurados a partir de commits convencionales. Esta skill encapsula todo el flujo: obtener git log, parsear commits, agrupar por tipo, y formatear salida.

## When to Use
- Cuando necesites generar un changelog para un release
- Cuando necesites analizar commits convencionales en un repo
- Cuando quieras extraer métricas de tipos de commits (feat vs fix ratio)

## Instructions
1. Ejecutar `git log --format=...` con el rango especificado
2. Parsear cada línea con el regex de conventional commit
3. Clasificar commits por tipo (feat, fix, chore, etc.)
4. Detectar breaking changes (`!` en subject o `BREAKING CHANGE` en body)
5. Agrupar por tipo si se solicita
6. Formatear salida (Markdown o JSON)

## Example
Input: `git log --oneline --format="%s" HEAD~5..HEAD`
Output:
```
feat(auth): implement OAuth2 login
fix(api): correct status code for unauthorized
chore: update dependencies
```

Parsed:
```
{ type: 'feat', scope: 'auth', description: 'implement OAuth2 login', breaking: false }
{ type: 'fix', scope: 'api', description: 'correct status code for unauthorized', breaking: false }
{ type: 'chore', scope: undefined, description: 'update dependencies', breaking: false }
```

## Activation
Automática cuando:
- El usuario menciona "changelog", "release notes", "generar changelog"
- Se ejecuta el comando `generate` del CLI
- Se detecta un tag de versión nuevo en el repo
