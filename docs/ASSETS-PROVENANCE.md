# Procedencia de los assets

| Asset | Ruta | Autor / herramienta | Fecha | Licencia | Uso |
|---|---|---|---|---|---|
| Documento conceptual (PDF original) | `docs/ref/Eternia-documento-conceptual.pdf` | Jhonatan Jesús Martínez Brooks | 2026-10-12 | CC BY 4.0 | Fuente del concepto |
| Conversión a Markdown | `docs/CONCEPTO.md` | Codelius (asistente de Brooks) | 2026-10-17 | CC BY 4.0 | Lectura |
| Maquetas de interfaz (9 cuadros, hoja de contactos) | `docs/mockups/index.html`, `docs/mockups/frames/*.png`, `docs/mockups/hoja.png` | Codelius, **hechas con código** (canvas 2D + Playwright) | 2026-10-13 | CC BY 4.0 (código de `index.html` y `shot.py`: MIT) | Referencia visual de la v1 |
| Imágenes conceptuales: moodboard, etapas, fusión y guía | `docs/ref/concepto/01-moodboard.jpg`, `02-etapas.jpg`, `03-fusion-guia.jpg` | Generador de imágenes de Grok Bot | 2026-10-13 | CC BY 4.0 en lo que corresponda a Brooks | **Solo referencia**: no son arte final ni se usan en la app. Tienen errores conocidos (un dedo real, texto deformado, una galaxia en lugar de la filotaxis). |
| Íconos de la PWA | `public/icons/*.png` | Codelius, con código (`scripts/gen-icons.py`, Pillow) | 2026-10-17 | CC BY 4.0 | Instalación |
| Capturas de evidencia | `docs/evidence/v1/*.png` | Playwright sobre la app (`scripts/evidence.py`) | 2026-10-17 | CC BY 4.0 | Verificación |
| Fuente Spectral 200/300/500/300 cursiva (subconjunto latino, woff2) | `public/fonts/` | Production Type, vía Google Fonts | — | **SIL OFL 1.1** (`public/fonts/OFL-Spectral.txt`) | Tipografía de la app |
| Capturas de la v2 (escala, cámara, pensamientos) | `docs/evidence/v2/*.png`, `medidas.json` | Playwright sobre la app (`scripts/evidence-v2.py`) | 2026-10-17 | CC BY 4.0 | Verificación |
| Hojas de revisión en bloques de 3 | `docs/evidence/v2/revision-bloque-*.jpg` | Codelius, montadas con Pillow a partir de las capturas | 2026-10-17 | CC BY 4.0 | Revisión de Brooks en el teléfono |
| Sonido (lecho, pulsos, voces de pensamientos, respiración, acentos, reverberación) | — | **Síntesis propia** en vivo con WebAudio (`src/audio/engine.js`, `src/audio/mix.js`), Codelius | 2026-10-17 | MIT (código) | No hay archivos de audio. Diseño en `docs/SONIDO.md` |
| Frases nuevas (49) | `src/core/phrases.js` | Codelius, escritas para Eternia | 2026-10-17 | CC BY 4.0 | Banco de pensamientos (las 22 del PDF son de Brooks) |

No se usaron fotografías, música grabada ni servicios de pago.
