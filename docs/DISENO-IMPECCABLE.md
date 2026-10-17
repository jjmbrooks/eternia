# Diseño con Impeccable

Brooks pidió revisar la interfaz con **Impeccable** de Paul Bakaus (https://github.com/pbakaus/impeccable, Apache-2.0). Se usó la skill v4.6.0 (commit `08d5b47`), clonada **fuera del repositorio** en `/workspace/tools/impeccable`. El repositorio no incluye nada de Impeccable; el crédito está en `NOTICE.md` y en el README.

Fecha: 2026-10-17 · Lo hizo Codelius (asistente de Brooks).

> **Condiciones de esta corrida:**
> 1. *Sin entrevista.* Impeccable pide preguntar al usuario en `init` y `critique`. Codelius trabajó como subagente sin canal para preguntar, así que las respuestas se infirieron del brief explícito (`docs/CONCEPTO.md` + `docs/DECISIONES.md`) y lo inferido va marcado en `PRODUCT.md`.
> 2. *Crítica degradada.* `critique` pide dos evaluaciones aisladas en subagentes y aquí no había herramienta para eso. Se hicieron en un solo contexto, con la evaluación de diseño (A) **antes** de ver el detector (B).
> 3. Por lo mismo, no se guardó el *snapshot* de `critique-storage` ni se hicieron las preguntas finales («Questions skipped: subagente sin canal al usuario»).

## Comandos que se corrieron

| Paso | Comando / referencia | Resultado |
|---|---|---|
| Contexto | `scripts/impeccable context` | `NO_PRODUCT_MD`, `EXISTING_VISUAL_SYSTEM`, `MANUAL_DETECTOR_REQUIRED` |
| init | `reference/init.md` | `PRODUCT.md` (plataforma `web`; lo inferido va marcado) |
| document | `reference/document.md` | `DESIGN.md` (frontmatter de tokens + las 8 secciones canónicas) |
| critique | `reference/critique.md` | ⚠️ degradada, ver abajo |
| audit | `reference/audit.md` | 5 dimensiones, ver abajo |
| typeset | `reference/typeset.md` + `detect --scope type` | Spectral autoalojada, sistema de roles |
| onboard | `reference/onboard.md` | Entrada con el primer toque, sin instrucciones |
| optimize / polish | `reference/polish.md`, `craft-floor.md` | Ver «Cambios» |
| Detector (antes) | `impeccable detect --json index.html src/` | `[]` (solo regex sobre .js; el propio detector avisa que es un conteo incompleto) |
| Detector (antes, URL) | `impeccable detect --json --viewport 390x844 http://localhost:4173/eternia/` | `[]` |
| Detector (después, fuentes) | `impeccable detect --json index.html src/` | 2 de contraste bajo + 3 avisos de tokens → **corregidos** (ver abajo) → `[]` y salida 0 |
| Detector (después, tipografía) | `impeccable detect --json --scope type index.html src/` | `[]` |
| Detector (después, build y URL) | `impeccable detect --json dist/index.html` y `--viewport 390x844 http://localhost:4173/eternia/` | `[]` |
| Detector (maquetas) | `impeccable detect --json docs/mockups/index.html` | 1 aviso: fondo `#000` fuera de DESIGN.md. **No aplica**: es una maqueta archivada del 13 de octubre y no se toca. |

**Límite del detector:** casi toda la pieza se dibuja en un `<canvas>`, y el detector solo analiza el DOM y el CSS. No ve el contraste de las frases, el tamaño del texto en el canvas ni el movimiento. Esas partes se revisaron a mano con las capturas de `docs/evidence/v1/`.

## Crítica

`⚠️ DEGRADED: single-context (sin herramienta de subagentes)`

**Modo:** Experience (la obra es la interfaz). Las heurísticas 7 (flexibilidad y eficiencia) y 10 (ayuda y documentación) quedan **n/a**: el concepto prohíbe atajos, menús y ayuda («la ayuda, si llega, es la voz»).

| # | Heurística | Puntos | Hallazgo clave |
|---|---|---|---|
| 1 | Visibilidad del estado | 3 | El estado se ve en el tamaño y la piel de la esfera, en la luz del borde y en el lenguaje. Faltaba que el primer toque tuviera efecto: ahora la esfera se inclina hacia el punto tocado |
| 2 | Coincidencia con el mundo real | 4 | Dedo = atención y borde = respiración; frases escritas «como se piensan» |
| 3 | Control y libertad | 3 | Siempre se puede soltar o ir al aire; en el bucle la salida es aceptar la voz (así lo pide el concepto) |
| 4 | Consistencia | 3 | Una sola familia tipográfica y un mismo lenguaje de luz. Antes había una serif de sistema como respaldo, que fallaba |
| 5 | Prevención de errores | 4 | No hay errores posibles; un roce no funde (umbral de 0,8 s) |
| 6 | Reconocer en vez de recordar | 3 | Nada que recordar; el borde se reconoce porque respira |
| 7 | Flexibilidad | n/a | Sin atajos por diseño. El teclado es accesibilidad, no un atajo |
| 8 | Estética y minimalismo | 3 | Fuerte en calma y centro. En el extremo las frases se amontonaban: se corrigió con órbitas en espiral, separación y recorte a la pantalla |
| 9 | Recuperación de errores | n/a→3 | No hay errores; el audio bloqueado no rompe nada (el campo sigue en silencio) |
| 10 | Ayuda | n/a | Por concepto |
| **Total** | | **26/32** | Bueno |

**Especificidad del diseño:** está hecha para este producto, no es intercambiable. El campo con grano, la esfera que hereda piel y la filotaxis no vienen de ninguna plantilla. Hay dos riesgos: (a) el título con mucho espacio entre letras sobre un halo frío roza el cliché de «app de meditación», y se compensa con que desaparece rápido; (b) el iridiscente de las ambiguas usa texto con degradado, algo que Impeccable rechaza por defecto, pero aquí **lo exige el brief** («iridiscente») y por eso se queda («the brief wins»).

**Personas:**

- *Primera vez (Jordan)*: sin el «toca para entrar» se quedaría esperando; con el texto tenue y la onda, entra.
- *Celular distraído (Casey)*: una mano, la banda del 18 % queda al alcance del pulgar.
- *Lector de pantalla (Sam)*: antes no tenía ninguna vía; ahora hay descripción, control por teclado y voz en `aria-live`.
- *Quien la pone a prueba (Riley)*: se simularon 10 minutos de gestos al azar sin estados inválidos (prueba «juego sin fin»).

## Auditoría

| # | Dimensión | Puntos | Hallazgo clave |
|---|---|---|---|
| 1 | Accesibilidad | 2 → 3 | Antes: canvas sin descripción ni teclado, y texto oculto negro sobre negro (detector). Ahora: `role="application"` + descripción, teclado, voz en `aria-live`, foco visible y movimiento reducido. Queda el contraste bajo de las frases, que es intencional (ABIERTO #10) |
| 2 | Rendimiento | 2 → 3 | Antes: ~420 gradientes radiales por cuadro en el centro. Ahora: un sprite por matiz (`drawImage`), DPR limitado a 2, grano en mosaico de 256 px precalculado y manchas del fondo pre-desenfocadas una sola vez. Queda `shadowBlur` en el texto: vigilar en teléfonos de gama baja. `?debug=1` muestra el tiempo de dibujo |
| 3 | Temas | 3 | Tokens en `DESIGN.md`, `TYPE` en el renderer y variables CSS (`--field`, `--breath`, `--title`, `--debug-*`). Solo hay tema oscuro, a propósito («el campo es oscuro») |
| 4 | Responsivo | 3 | Todo se mide contra el lado corto; se probó a 360×640, 390×844 y 1280×800. `touch-action: none`, captura del puntero y `pointercancel` atendidos. Se probó con mouse emulado en Chromium headless; **falta probarlo en un teléfono real** |
| 5 | Integridad | 3 | Sistema coherente y propio. Las excepciones al detector están justificadas (degradado iridiscente, grano en canvas) |
| **Total** | | **15/20** | Bueno |

Severidades: no hay P0. P1 (corregidos): la vía de accesibilidad y el contraste del texto oculto. P2: el amontonamiento en el extremo (corregido) y el costo de `shadowBlur` (vigilar). P3: el borde rectangular (ABIERTO #5).

## Typeset

- **Evaluación:** antes se usaba `Cormorant Garamond` con Georgia de respaldo, pero esa fuente **no estaba cargada**, así que se veía Georgia o la serif del sistema según el aparato. Es justo lo que `craft-floor` prohíbe: «la fuente instalada más parecida es un fracaso, no un respaldo». Cormorant, además, tiene una x-height chica que no aguanta 13 px sobre negro.
- **Decisión:** **Spectral** (Production Type, OFL 1.1). Es una serif pensada para pantalla, con pesos 200–800 y cursiva, que cubre el español. Se autoalojan solo los pesos que se usan (200, 300, 500 y 300 cursiva), en el subconjunto latino de woff2 (≈ 90 KB en total). El service worker los precachea, así que funcionan sin red (verificado: captura `20-sin-red.png`, con `document.fonts.check('300 16px Spectral') = true`).
- **Roles:** los de la tabla en `DESIGN.md › Typography`. En el código están en `TYPE`, dentro de `src/render/renderer.js`.
- **Compensación de texto claro sobre fondo oscuro:** las frases pasan de 200 a 300, tienen +0,01 em de espacio entre letras y nunca bajan de 14 px.
- **Carga:** `<link rel="preload">` para 200 y 300, `font-display: block` y `document.fonts.load()` antes del primer cuadro, con un máximo de 1,5 s. La tipografía no salta.

## Onboard

- El momento clave es mover la esfera y ver que algo responde. La única instrucción permitida es la entrada: iOS no deja arrancar el audio sin un toque, y el concepto prohíbe instrucciones permanentes.
- **Diseño:**
  1. El nombre aparece en 1,6 s.
  2. Si nadie toca, a los ~2 s aparece debajo «toca para entrar», en cursiva tenue, respirando (con alfa ≥ 0,53, que da unos 4,5:1).
  3. El primer toque en cualquier parte abre una onda desde el dedo, el sonido entra en 1,5 s, la esfera se inclina hacia el punto tocado y el título se va de inmediato.
  4. Antes de ese toque, la definición y la vitalidad no cambian: nadie ha llegado todavía.
- No hay tutorial, tooltips ni pasos. El resto lo enseña el campo («show, don't tell»).
- Con teclado: Intro o Espacio entra.

## Cambios aplicados (polish)

1. Spectral autoalojada y precacheada; sistema `TYPE`; espera de fuentes antes del primer cuadro.
2. **Accesibilidad:** `<main>`, `<h1>` oculto visualmente, descripción del gesto, canvas con `tabindex` y foco visible (una línea de aire de 1 px, nunca un recuadro sobre las frases), teclado (Espacio + flechas) y voz en `aria-live`.
3. **Detector:** el texto oculto heredaba negro (contraste 1:1), así que se agregó `color: var(--title)`. El color y el radio del panel de depuración pasaron a tokens (`--debug-text`, `--debug-radius`) y quedaron documentados en DESIGN.md.
4. **Rendimiento:** sprites de punto por matiz para la filotaxis y las órbitas.
5. **Extremo legible:** los pensamientos capturados entran en una espiral real. Orbitan en anillos y esperan su turno antes de fundirse, se separan entre sí y no se salen de la pantalla.
6. **Entrada:** la esfera responde al primer toque, el título se va al entrar y la entrada se puede leer.
7. **Superficies del navegador:** `color-scheme: dark`, `theme-color`, sin resaltado al tocar, sin menú contextual y números tabulares en el panel de depuración.
8. El service worker usa `ignoreVary` en el caché. Sin eso, los módulos y las fuentes con CORS no se servían sin red; lo detectó la prueba de offline de la auditoría.

## Lo que no aplica a una pieza de arte en canvas

- **Contraste AA de las frases:** el concepto pide que «el resto permanezca por debajo» y que la palabra se disuelva. Queda abierto un modo `prefers-contrast` (ABIERTO #10).
- **Texto con degradado** (las ambiguas): lo exige el brief («iridiscente»).
- **Grano:** el concepto lo pide («el grano baja» con movimiento reducido). Es grano de canvas, no `feTurbulence`.
- **Áreas táctiles de 44 px, estados hover y disabled:** no hay controles; toda la pantalla es la superficie del gesto.
- **Modo claro:** el campo es oscuro por concepto.
- **Hallazgo en las maquetas** (`docs/mockups/index.html`): es archivo histórico y no se modifica.
