# Práctica Individual (2 semanas)
## Sistema Multi-Agente

> Documento fuente: "Caso práctico · Tu propio sistema multi-agente"
> Objetivo: construir un sistema basado en IA capaz de generar, revisar y mantener una aplicación mediante una arquitectura multi-agente.

---

# Objetivo General

El proyecto **no consiste únicamente en desarrollar una aplicación**, sino en diseñar un sistema que permita a una IA:

- generar la aplicación,
- revisarla,
- mantenerla,
- trabajar de forma eficiente,
- minimizar el consumo de tokens.

La parte más importante de la evaluación es el propio sistema de IA, no la aplicación final.

---

# Los tres pilares obligatorios

Todos los proyectos deben incorporar estos tres bloques.

## 1. Orquestación Multi-Agente

Debe existir un sistema con al menos dos agentes diferenciados.

### Orquestador

Responsabilidades:

- dirigir todo el flujo de trabajo
- generar tareas
- decidir el siguiente paso
- invocar al revisor cuando corresponda
- interactuar con el usuario en los puntos de aprobación

Debe seguir obligatoriamente el flujo:

SPEC
↓

PLAN
↓

CODE
↓

REVIEW
↓

COMMIT

Cada fase puede tener aprobación ("gate") antes de continuar.

---

### Auditor / Revisor

No genera código.

Su única función es revisar el trabajo realizado.

Debe:

- comparar el resultado contra unas reglas explícitas (rules.md)
- revisar únicamente el diff o cambios realizados
- devolver uno de tres estados

PASS

WARNINGS

FAIL

Si falla, el sistema debe volver únicamente a la fase necesaria, sin repetir trabajo ya validado.

---

# 2. Skills + Herramientas (MCP)

El proyecto debe incluir al menos:

- 1 Skill reutilizable
- 1 herramienta

---

## Skill

Una skill encapsula una tarea frecuente.

Debe contener:

- instrucciones
- pasos
- ejemplos
- cuándo debe activarse

Idealmente la IA debe ser capaz de activarla automáticamente según el contexto.

Ejemplos:

- arquitecto frontend
- generador UI
- sincronizador Figma
- generador de documentación

---

## Herramienta

Debe existir una dependencia externa accesible por IA.

Puede implementarse mediante:

- servidor MCP
- Mock API

La idea es evitar depender de APIs reales con credenciales.

El sistema debe poder probarse completamente sin servicios externos.

---

# 3. Eficiencia de Tokens

No basta con funcionar.

Debe demostrarse que el sistema consume menos contexto.

Hay cuatro aspectos importantes.

---

## Selección de modelos

No usar siempre el modelo más potente.

Ejemplo esperado:

modelo ligero

↓

tareas repetitivas

modelo medio

↓

programación y revisión

modelo potente

↓

orquestación y decisiones importantes

Debe justificarse la elección.

---

## Gestión del contexto

Se espera:

- sesiones pequeñas
- limpiar contexto (/clear)
- compactar conversaciones (/compact)
- pasar únicamente los archivos necesarios (@archivo)
- persistir SPEC y PLAN para poder reanudar trabajo

---

## Uso de subagentes

Las tareas pesadas deben ejecutarse fuera del contexto principal.

Ejemplos:

- búsquedas
- validaciones
- comprobaciones

Objetivo:

evitar contaminar el contexto del agente principal.

---

## Medición

Debe compararse:

Sistema ingenuo

vs

Sistema optimizado

Midiendo por ejemplo:

- tokens consumidos
- número de iteraciones
- número de mensajes

Los resultados se documentan en:

EFFICIENCY.md

---

# Restricción principal

No está permitido hacer "vibe coding".

Antes de escribir una sola línea de código debe definirse el contrato del proyecto.

El documento considera que el contrato es mucho más importante que el código.

---

# Documentación obligatoria

## SPEC.md

Describe QUÉ hace el producto.

Debe contener:

- problema
- usuarios
- casos de uso
- criterios de aceptación
- restricciones de negocio

Nunca explica implementación.

---

## ARCHITECTURE.md

Describe CÓMO se construye.

Debe contener:

- componentes
- stack
- flujo de datos
- decisiones arquitectónicas
- trade-offs
- modelo utilizado en cada tarea

---

## AGENTS.md

Describe CÓMO deben trabajar los agentes.

Incluye:

- instrucciones
- comandos
- convenciones
- reglas
- validaciones
- proceso completo

---

# Productos sugeridos

La aplicación debe ser pequeña pero suficientemente compleja para justificar revisión automática.

Ejemplos:

- clasificador de tickets
- clasificador de correos
- extractor PDF → JSON
- extractor de facturas
- generador de documentación
- generador de changelog
- mini SaaS
- herramienta interna
- pequeño frontend guiado por diseño

También puede proponerse un proyecto propio.

---

# Entregable esperado

Debe existir un único repositorio.

El repositorio contiene dos cosas:

1.

La aplicación.

2.

El sistema que permite a la IA construir esa aplicación.

La segunda parte es la que más peso tiene.

---

# Estructura recomendada

```text
mi-proyecto/

README.md

SPEC.md

ARCHITECTURE.md

AGENTS.md

agents/
    orchestrator.md
    reviewer.md

rules.md

skills/
    mi-skill.md

tools/
    mock-api o servidor MCP

src/

tests/
    golden.jsonl

EFFICIENCY.md
```

---

# Función de cada archivo

## README.md

Explica:

- instalación
- ejecución
- cómo reproducir el sistema mediante IA

---

## SPEC.md

Contrato funcional.

No contiene implementación.

---

## ARCHITECTURE.md

Arquitectura completa.

Incluye:

- componentes
- stack
- modelos IA
- decisiones

---

## AGENTS.md

Manual de funcionamiento del sistema multiagente.

---

## agents/orchestrator.md

Define:

- responsabilidades
- flujo
- modelo utilizado
- gates

---

## agents/reviewer.md

Define:

- comportamiento del auditor
- reglas
- cuándo aprobar
- cuándo fallar

---

## rules.md

Reglas del auditor.

Debe definir claramente:

PASS

WARN

FAIL

---

## skills/

Cada archivo representa una Skill reutilizable.

Debe incluir:

- propósito
- instrucciones
- ejemplos
- activación

---

## tools/

Implementa:

- servidor MCP

o

- Mock API

---

## tests/

Conjunto de ejemplos para validar resultados.

---

## EFFICIENCY.md

Debe mostrar:

línea base

↓

flujo optimizado

incluyendo datos medibles.

---

# Flujo esperado

El sistema debe trabajar aproximadamente así.

Usuario

↓

Orquestador

↓

Generar SPEC

↓

Aprobación

↓

Generar PLAN

↓

Aprobación

↓

Generar código

↓

Enviar al Revisor

↓

PASS

↓

Commit

o

FAIL

↓

Volver únicamente al punto necesario

↓

Nueva revisión

---

# Evaluación

## 30%

Sistema regenerable

Otra persona debe poder reconstruir toda la aplicación usando únicamente:

- SPEC
- ARCHITECTURE
- AGENTS

---

## 25%

Orquestación

Debe existir:

- pipeline completo
- gates
- auditor funcional

---

## 20%

Eficiencia

Debe demostrarse reducción de tokens mediante datos.

---

## 15%

Skills + Herramientas

Las skills deben ser reutilizables.

El MCP o Mock debe funcionar.

---

## 10%

Calidad

Se valora:

- trazabilidad
- persistencia
- coherencia entre especificación y código

---

# Recomendaciones oficiales

1.

Empezar siempre por:

SPEC

↓

ARCHITECTURE

↓

AGENTS

No comenzar programando.

---

2.

Mantener el proyecto pequeño.

Es preferible un sistema completo y bien diseñado que una aplicación grande.

---

3.

Medir los tokens desde el principio.

Es uno de los criterios de evaluación más importantes.

---

4.

Cada tarea repetitiva debe convertirse en una Skill reutilizable.

---

# Resumen para el agente

El objetivo NO es desarrollar una aplicación.

El objetivo es construir un ecosistema donde una IA pueda:

- entender el problema
- planificar
- generar código
- revisarlo automáticamente
- corregir errores
- reutilizar habilidades
- usar herramientas externas (MCP o Mock)
- minimizar el uso de contexto
- demostrar eficiencia mediante métricas

El sistema debe ser reproducible, modular y documentado.