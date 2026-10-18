# Guía para agentes

- El concepto manda: `docs/CONCEPTO.md`. Las aclaraciones de Brooks están en `docs/DECISIONES.md`.
- La UI se rige por `PRODUCT.md` y `DESIGN.md` (formato Impeccable). Después de tocar la UI, corre el detector de Impeccable (instalado fuera del repo) y anota en `docs/DISENO-IMPECCABLE.md`.
- `src/core/` es puro: nada de DOM, audio ni `Math.random`. Toda regla nueva lleva su prueba en `tests/`.
- Prohibido en el campo: menús, puntajes, botones, recuadros o globos de cómic alrededor de las frases, analíticas y cuentas. Las **esferas contenedoras** de las frases sí van (las pidió Brooks el 2026-10-17; ver `docs/DECISIONES.md`).
- El sonido se diseña en `docs/SONIDO.md`; la mezcla pura vive en `src/audio/mix.js` y tiene pruebas.
- Haz commits normales (en `main` o en una rama con PR) y **nunca uses force-push**.
