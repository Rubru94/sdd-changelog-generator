# Mock Git API

Mock server que simula respuestas de `git log` para probar el changelog generator sin un repositorio Git real.

## Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/health` | Health check |
| GET | `/api/tags` | Lista de tags simulados |
| GET | `/api/git-log?from=&to=` | Commits simulados en el rango |

## Usage

```bash
npm start
# Mock Git API running on http://localhost:3099
```

```bash
curl http://localhost:3099/api/git-log
curl http://localhost:3099/api/tags
```
