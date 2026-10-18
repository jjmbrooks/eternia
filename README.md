# Eternia

> Un campo donde la atención se ve.

**Eternia** es una experiencia audiovisual sin fin y sin meta para bajar el ruido de la mente y quedarse un rato. En la pantalla hay una esfera, que es el yo con el que uno se cuenta; alrededor llegan pensamientos, frases de luz; y el borde respira. El dedo es la atención. Si se queda sobre una frase, la esfera se funde con ella y hereda su forma. Si suelta, la forma se adelgaza. Si se va al borde, el aire suena más fuerte y el yo se queda sin alimento. En el centro no hay esfera, solo una danza en proporción áurea que no cierra.

**Pruébala:** https://jjmbrooks.github.io/eternia/ (en el teléfono, en vertical y con audífonos si se puede; se instala como app y después funciona sin red).

No hay menús, puntaje, metas, cuentas ni anuncios. No es un tratamiento ni un dispositivo clínico, y no mide ni promete nada sobre las ondas cerebrales.

## Cómo se juega

No se explica dentro del campo; el campo enseña. Para quien llega aquí:

- **Primer toque**: entras y empieza el sonido (los navegadores lo exigen).
- **Dedo en el campo**: la esfera lo sigue (un poco arriba del dedo), con inercia; entre más grande, más tarde obedece. El campo no tiene orilla: si sostienes el dedo lejos de la esfera, viajas en esa dirección.
- **La cámara sigue al ego**: más identificación, más cerca; menos, se aleja y se ve más universo. Se entra en un nivel intermedio y los cambios son lentos.
- **Quedarse 0,8 s sobre una frase**: fusión. Fusionarse cuesta vitalidad, sea con una frase áspera o con una bella.
- **Soltar**: la forma baja sola.
- **Dedo en el borde**: la respiración. La esfera adelgaza más rápido y la vitalidad vuelve.
- **Vitalidad en cero dentro de un extremo**: aparece una voz en el borde. Ignorarla es válido. Para aceptarla, quédate tres respiraciones en el borde.
- **En el centro**: rozar no crea nada. Arrastrar mueve el campo. Sostener el dedo quieto 1,6 s condensa una semilla.
- **Teclado**: Intro entra. Mantén Espacio para posar la atención y muévela con las flechas. **M** quita el sonido.
- **Vibración** (Android, opcional): abre con `?vibra=1`.

## Documentos

| Archivo | Qué es |
|---|---|
| [`docs/CONCEPTO.md`](docs/CONCEPTO.md) | El documento conceptual completo (el PDF original está en [`docs/ref/`](docs/ref/)) |
| [`docs/DECISIONES.md`](docs/DECISIONES.md) | Aclaraciones de Brooks y refinamientos acordados |
| [`docs/FRASES.md`](docs/FRASES.md) | Las 71 frases, sus tipos y la forma de su esfera |
| [`docs/SONIDO.md`](docs/SONIDO.md) | Diseño sonoro detallado |
| [`docs/ONDAS-SENSORIAL.md`](docs/ONDAS-SENSORIAL.md) | Investigación por nivel de ondas y clima del fondo de viaje |
| [`docs/ABIERTO.md`](docs/ABIERTO.md) | Puntos abiertos |
| [`docs/05-ROADMAP.md`](docs/05-ROADMAP.md) | Hoja de ruta y consumo por fase |
| [`PRODUCT.md`](PRODUCT.md) · [`DESIGN.md`](DESIGN.md) | Producto y sistema de diseño (formato Impeccable) |
| [`docs/DISENO-IMPECCABLE.md`](docs/DISENO-IMPECCABLE.md) | Proceso de diseño con Impeccable: comandos, hallazgos y cambios |
| [`docs/mockups/`](docs/mockups/) | Maquetas de interfaz hechas con código (2026-10-13) |
| [`docs/evidence/v1/`](docs/evidence/v1/) | Capturas de la app en vivo |
| [`docs/ASSETS-PROVENANCE.md`](docs/ASSETS-PROVENANCE.md) | Procedencia de cada asset |

## Arquitectura

```
src/core/      simulación pura (sin DOM ni audio, RNG determinista)
  params.js    tabla «Primera afinación» del PDF + decisiones [D]
  phrases.js   banco de 71 frases en 8 tipos (22 del PDF) con matiz, textura, simetría y activación
  bubble.js    esfera contenedora de cada frase: forma por tipo y corte en líneas
  sim.js       estado, reglas, fusión, imán, voz, semilla, respiración
src/render/    canvas 2D (lee el estado, nunca lo modifica)
src/audio/     WebAudio sintetizado (docs/SONIDO.md): mix.js puro + engine.js; lecho y espacio ligado al zoom, espiral 5/7/4 y voces por tipo, respiración 4,5/6 s
src/main.js    un dedo (pointer events), teclado, bucle, persistencia, ?debug
src/sw/        service worker (precache completo → funciona sin red)
tests/         Vitest sobre el núcleo y la mezcla de sonido
```

```bash
npm ci
npm test          # pruebas del núcleo
npm run dev       # http://localhost:5173/eternia/
npm run build     # dist/ (incluye sw.js con precache)
npx vite preview --port 4173 & npm run evidence   # capturas en docs/evidence/v1 (Python + Playwright)
```

- `?debug=1` muestra un panel con definición, vitalidad, atención, voz y tiempo de dibujo, para afinar. `?debug=2` deja solo los ganchos, para las capturas.
- `?rm=1` simula movimiento reducido.

El despliegue es automático: cada push a `main` corre las pruebas y el build y publica en GitHub Pages (`.github/workflows/deploy.yml`).

## Privacidad

Eternia no tiene cuentas, servidores propios, analíticas, cookies ni rastreadores. Lo único que guarda es **el último color de la esfera y los ajustes**, en el `localStorage` de tu propio dispositivo. Nada sale del teléfono. Si borras los datos del sitio, se borra eso también.

## Salud

Eternia es una pieza contemplativa. **No es un tratamiento de la depresión, la ansiedad ni ningún otro padecimiento, ni sustituye la atención profesional.** Si estás en crisis, busca ayuda de inmediato con los servicios de emergencia de tu país o con alguien de confianza.

## Licencias

- Código: **MIT**. Ver [`LICENSE`](LICENSE).
- Documentos y arte (concepto, decisiones, frases, maquetas, capturas, íconos): **CC BY 4.0**, igual que SnapFit. Ver [`LICENSE-ASSETS.md`](LICENSE-ASSETS.md).
- La fuente Spectral se distribuye con la SIL OFL 1.1.
- El diseño de la interfaz se revisó con [**Impeccable**](https://github.com/pbakaus/impeccable), de Paul Bakaus (Apache-2.0). No está incluido en el repositorio. Ver [`NOTICE.md`](NOTICE.md).

© 2026 jjmbrooks (Jhonatan Jesús Martínez Brooks)
