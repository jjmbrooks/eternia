# Guía para agentes

- El concepto manda: `docs/CONCEPTO.md`. Las aclaraciones de Brooks están en `docs/DECISIONES.md`.
- La UI se rige por `PRODUCT.md` y `DESIGN.md` (formato Impeccable). Después de tocar la UI, corre el detector de Impeccable (instalado fuera del repo) y anota en `docs/DISENO-IMPECCABLE.md`.
- `src/core/` es puro: nada de DOM, audio ni `Math.random`. Toda regla nueva lleva su prueba en `tests/`.
- Prohibido en el campo: menús, puntajes, botones, recuadros alrededor de las frases, analíticas y cuentas.
- Haz commits normales en `main` y **nunca uses force-push**.
