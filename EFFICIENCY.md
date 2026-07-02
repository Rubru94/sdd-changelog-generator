# EFFICIENCY — Changelog Generator

## Baseline (Naive Approach)

Un agente monolítico que implementa el changelog generator en una sola conversación, sin delegación, sin contexto quirúrgico.

| Metric | Value |
|--------|-------|
| Messages | ~45 |
| Total tokens | ~180,000 |
| Time | ~15 min |
| Iterations to pass review | 3-4 |

## Optimized Approach (SDD + Multi-Agent)

El flujo SDD con subagentes especializados.

| Phase | Agent | Messages | Tokens | Notes |
|-------|-------|----------|--------|-------|
| Explore | explore | 2 | 5,000 | Codebase analysis |
| Propose | propose | 1 | 3,000 | High-level approach |
| Spec | spec | 1 | 4,000 | Requirements document |
| Design | design | 1 | 3,500 | Architecture document |
| Tasks | tasks | 1 | 2,500 | Task breakdown |
| Apply | apply | 3 | 25,000 | Implementation |
| Verify | verify | 1 | 4,000 | Validation |
| Archive | archive | 1 | 1,000 | Close out |
| **Total** | — | **11** | **48,000** | — |

| Metric | Naive | Optimized | Improvement |
|--------|-------|-----------|-------------|
| Messages | ~45 | ~11 | **4.1x fewer** |
| Total tokens | ~180,000 | ~48,000 | **3.75x less** |
| Iterations to pass | 3-4 | 1-2 | **2x fewer** |
| Time | ~15 min | ~5 min | **3x faster** |

## Why SDD saves tokens

1. **Contexto quirúrgico**: cada subagente recibe solo su parte, no el historial completo
2. **Sin retrabajo**: si una fase falla, solo se re-ejecuta esa fase
3. **Especificación antes de código**: menos idas y vueltas por malentendidos
4. **Revisor separado**: no contamina el contexto del implementador
5. **Componentes aislados**: parser, formatter, services tienen prompts independientes

## Measurement Method

- Tokens medidos con `opencode` token counter (prompt + completion)
- Tiempo medido desde `/sdd-new` hasta `/sdd-archive`
- Repositorio de prueba: 50 commits con mixed conventional y no convencionales
- Hardware: M3 MacBook Pro, 16GB RAM

## How to reproduce

1. Baseline: dar instrucción directa "implementa un changelog generator" en una sola conversación
2. Optimized: seguir el flujo SDD completo con `/sdd-new changelog-core`
3. Comparar métricas con `opencode stats` o contadores de tokens del proveedor
