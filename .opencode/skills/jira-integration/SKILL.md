---
name: jira-integration
description: >
  Integración con Jira para leer tareas, crear ramas y generar Merge Requests.
  Trigger: Cuando se necesite leer una tarea de Jira, crear una rama desde una issue,
  o crear un MR vinculado a una issue de Jira.
license: Apache-2.0
metadata:
  author: sdd-project-template
  version: "1.0"
---

## When to Use

Usa este skill cuando:
- Necesites leer los detalles de una tarea de Jira (por clave, ej. PROJ-123)
- Necesites crear una rama a partir de una issue de Jira
- Necesites crear un Merge Request vinculado a una issue de Jira
- Estés trabajando con issues de Jira como parte del flujo SDD
- Quieras actualizar el estado de una issue en Jira

## Configuration

### Variables de Entorno

| Variable | Descripción | Requerida |
|----------|-------------|-----------|
| `JIRA_HOST` | URL del host de Jira (ej. `https://tu-dominio.atlassian.net`) | ✅ |
| `JIRA_EMAIL` | Email de la cuenta de Jira con acceso a la API | ✅ |
| `JIRA_API_TOKEN` | API Token generado en https://id.atlassian.com/manage/api-tokens | ✅ |
| `JIRA_PROJECT_KEY` | Clave del proyecto por defecto (ej. `PROJ`) | ✅ |
| `GITLAB_HOST` | URL del host de GitLab (ej. `https://gitlab.com`) | ✅ |
| `GITLAB_TOKEN` | Token de acceso personal de GitLab para crear MRs | ✅ |

### Autenticación Jira

Jira usa Basic Auth con email + API token:
```
Authorization: Basic $(echo -n "$JIRA_EMAIL:$JIRA_API_TOKEN" | base64)
```

### Jira API Base

```
GET ${JIRA_HOST}/rest/api/3/{endpoint}
```

## Workflow

```
Leer Issue de Jira → Extraer datos (título, descripción, tipo)
  → Crear rama local con formato estandarizado
  → Implementar cambios siguiendo SDD
  → Hacer commit con Conventional Commits
  → Crear MR en GitLab vinculado a la issue
  → Opcional: actualizar estado de la issue en Jira
```

## Comandos Jira API

### Obtener Issue

```bash
# Obtener detalles de una issue
curl -s -u "$JIRA_EMAIL:$JIRA_API_TOKEN" \
  "${JIRA_HOST}/rest/api/3/issue/${JIRA_PROJECT_KEY}-${ISSUE_NUM}" | jq .
```

### Campos Relevantes del Response

| Campo JSON | Descripción |
|------------|-------------|
| `.key` | Clave de la issue (ej. `PROJ-123`) |
| `.fields.summary` | Título de la issue |
| `.fields.description.content` | Descripción (formato ADF - Atlassian Document Format) |
| `.fields.issuetype.name` | Tipo: Task, Bug, Story, etc. |
| `.fields.status.name` | Estado: To Do, In Progress, Done, etc. |
| `.fields.priority.name` | Prioridad: High, Medium, Low, etc. |
| `.fields.labels` | Labels asociadas |
| `.fields.assignee.displayName` | Persona asignada |

### Extraer Texto de Descripción (ADF)

La descripción de Jira viene en ADF (Atlassian Document Format). Para extraer texto plano:

```bash
# Obtener la issue y extraer el texto de la descripción
ISSUE=$(curl -s -u "$JIRA_EMAIL:$JIRA_API_TOKEN" \
  "${JIRA_HOST}/rest/api/3/issue/${ISSUE_KEY}")

# Extraer summary y description type text
echo "$ISSUE" | jq -r '.fields.summary'
echo "$ISSUE" | jq -r '[.fields.description.content[] | select(.type == "paragraph") | .content[] | select(.type == "text") | .text] | join("\n")'
```

### Transicionar Issue

```bash
# Obtener transiciones disponibles
curl -s -u "$JIRA_EMAIL:$JIRA_API_TOKEN" \
  "${JIRA_HOST}/rest/api/3/issue/${ISSUE_KEY}/transitions" | jq '.transitions[] | {id, name, to: .to.name}'

# Ejecutar transición (ej. "In Progress" → "Done")
curl -s -X POST -u "$JIRA_EMAIL:$JIRA_API_TOKEN" \
  "${JIRA_HOST}/rest/api/3/issue/${ISSUE_KEY}/transitions" \
  -H "Content-Type: application/json" \
  -d '{"transition": {"id": "31"}}'
```

### Crear Issue

```bash
# Crear una nueva issue
curl -s -X POST -u "$JIRA_EMAIL:$JIRA_API_TOKEN" \
  "${JIRA_HOST}/rest/api/3/issue" \
  -H "Content-Type: application/json" \
  -d '{
    "fields": {
      "project": {"key": "'"$JIRA_PROJECT_KEY"'"},
      "summary": "As-you like",
      "description": {
        "type": "doc",
        "version": 1,
        "content": [{"type": "paragraph", "content": [{"type": "text", "text": "Detailed description"}]}]
      },
      "issuetype": {"name": "Task"}
    }
  }'
```

## Branch Naming

Las ramas deben seguir este formato:

```
${TIPO}/${JIRA-KEY}-descripción-corta
```

| Tipo | Prefix | Ejemplo |
|------|--------|---------|
| Feature | `feat` | `feat/PROJ-123-add-user-login` |
| Bug fix | `fix` | `fix/PROJ-456-fix-timezone-bug` |
| Chore | `chore` | `chore/PROJ-789-update-deps` |
| Refactor | `refactor` | `refactor/PROJ-234-extract-service` |

### Crear Rama

```bash
# Desde develop/main
git checkout main
git pull origin main

# Crear rama con formato estandarizado
git checkout -b "${TIPO}/${JIRA_KEY}-$(echo "$SUMMARY" | tr '[:upper:]' '[:lower:]' | sed 's/ /-/g' | sed 's/[^a-z0-9._-]//g' | cut -c1-60)"
```

## Convencional Commits con Jira

Los commits deben incluir la clave de Jira:

```
feat(PROJ-123): add user login endpoint
fix(PROJ-456): correct timezone offset for DST
chore(PROJ-789): update axios to 1.7.0
```

## Crear Merge Request

```bash
# Push de la rama
git push -u origin "${BRANCH_NAME}"

# Crear MR con gh CLI (GitHub) o glab (GitLab)
# GitLab:
glab mr create \
  --title "${TIPO}(${JIRA_KEY}): $(echo "$SUMMARY" | tr '[:upper:]' '[:lower:]')" \
  --description "## Summary\n\nImplements ${JIRA_KEY}: ${SUMMARY}\n\n## Jira Issue\n\n- [${JIRA_KEY}](${JIRA_HOST}/browse/${JIRA_KEY})\n\n## Changes\n\n- $(echo "$CHANGES" | tr '\n' ' ')\n\n## Test Plan\n\n- [ ] Unit tests pass\n- [ ] Manual testing completed" \
  --label "${TYPE_LABEL}" \
  --target-branch main

# O usando glab con descarga del template
glab mr create --fill
```

## Pipeline Completo (SDD + Jira)

```
/sdd-new PROJ-123
  ↓
sdd-explore → Lee la issue de Jira para entender requerimientos
sdd-propose → Propuesta basada en la descripción de Jira
sdd-spec    → Specs derivadas de los criterios de aceptación
sdd-design  → Diseño técnico
sdd-tasks   → Desglose en tareas
  ↓
jira-create-branch → Crea rama feat/PROJ-123-descripcion
  ↓
sdd-apply   → Implementa cada tarea con commits convencionales
sdd-verify  → Tests y validación
  ↓
jira-create-mr → Crea MR vinculado a Jira
  ↓
sdd-archive → Archiva el cambio
jira-transition → Mueve issue a "In Review"
```

## Script Helper (src/jira.ts)

Para facilitar la interacción programática con Jira desde la app, usa axios:

```typescript
import axios from 'axios';

const jira = axios.create({
  baseURL: `${process.env.JIRA_HOST}/rest/api/3`,
  auth: {
    username: process.env.JIRA_EMAIL!,
    password: process.env.JIRA_API_TOKEN!,
  },
  headers: { 'Content-Type': 'application/json' },
});

export async function getIssue(issueKey: string) {
  const { data } = await jira.get(`/issue/${issueKey}`);
  return {
    key: data.key,
    summary: data.fields.summary,
    type: data.fields.issuetype.name,
    status: data.fields.status.name,
    priority: data.fields.priority?.name,
    description: extractText(data.fields.description),
  };
}

export function extractText(adf: any): string {
  if (!adf?.content) return '';
  return adf.content
    .filter((n: any) => n.type === 'paragraph')
    .flatMap((n: any) => n.content?.filter((c: any) => c.type === 'text').map((c: any) => c.text) ?? [])
    .join('\n');
}
```

## Commands

```bash
# Leer issue de Jira (por número dentro del proyecto por defecto)
ISSUE_NUM=123
ISSUE_KEY="${JIRA_PROJECT_KEY}-${ISSUE_NUM}"
curl -s -u "$JIRA_EMAIL:$JIRA_API_TOKEN" \
  "${JIRA_HOST}/rest/api/3/issue/${ISSUE_KEY}" | jq '{key, summary, type: .fields.issuetype.name, status: .fields.status.name}'

# Leer issue por clave completa
ISSUE_KEY="PROJ-123"
curl -s -u "$JIRA_EMAIL:$JIRA_API_TOKEN" \
  "${JIRA_HOST}/rest/api/3/issue/${ISSUE_KEY}" | jq '{key, summary}'

# Crear rama desde issue
ISSUE_KEY="PROJ-123"
SUMMARY=$(curl -s -u "$JIRA_EMAIL:$JIRA_API_TOKEN" \
  "${JIRA_HOST}/rest/api/3/issue/${ISSUE_KEY}" | jq -r '.fields.summary')
BRANCH_NAME="feat/${ISSUE_KEY}-$(echo "$SUMMARY" | tr '[:upper:]' '[:lower:]' | sed 's/ /-/g' | sed 's/[^a-z0-9._-]//g' | cut -c1-50)"
git checkout -b "$BRANCH_NAME"
echo "Branch: $BRANCH_NAME"

# Crear MR
git push -u origin "$BRANCH_NAME"
glab mr create --title "feat(${ISSUE_KEY}): $SUMMARY" \
  --description "Closes ${ISSUE_KEY}\nSee: ${JIRA_HOST}/browse/${ISSUE_KEY}"
```

## Resources

- **Jira API Docs**: https://developer.atlassian.com/cloud/jira/platform/rest/v3/
- **Script helper**: `src/jira.ts` — funciones utilitarias para Jira API
