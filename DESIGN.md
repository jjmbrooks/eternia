---
name: Eternia
description: Un campo oscuro donde la atención se ve. Una esfera, frases de luz y un borde que respira.
colors:
  field: "#030307"
  title: "#ebe8ff"
  hint: "#d6daf0"
  breath: "#97c2d7"
  guide: "#def0f6"
  thought-disonante: "#eb5550"
  thought-armonica: "#f3cc71"
  thought-ambigua-a: "#dd9af3"
  thought-ambigua-b: "#9ae4f3"
  thought-neutra: "#b6c3cc"
  sphere-pale: "#e9edfb"
  focus-ring: "#97c2d7"
  debug-text: "#ccffee"
typography:
  title:
    fontFamily: "Spectral, Georgia, serif"
    fontSize: "clamp(38px, 11.5vw, 52px)"
    fontWeight: 200
    lineHeight: 1
    letterSpacing: "0.32em"
  hint:
    fontFamily: "Spectral, Georgia, serif"
    fontSize: "15px"
    fontWeight: 300
    lineHeight: 1.2
    letterSpacing: "0.08em"
  thought:
    fontFamily: "Spectral, Georgia, serif"
    fontSize: "14px–18px (profundidad) + hasta 5px (densidad)"
    fontWeight: 300
    lineHeight: 1
    letterSpacing: "0.01em"
  thought-dense:
    fontFamily: "Spectral, Georgia, serif"
    fontWeight: 500
  guide:
    fontFamily: "Spectral, Georgia, serif"
    fontSize: "15px"
    fontWeight: 300
    lineHeight: 1.4
    letterSpacing: "normal"
  debug:
    fontFamily: "ui-monospace, SF Mono, Menlo, monospace"
    fontSize: "11px"
    fontWeight: 400
    lineHeight: 1.35
spacing:
  edge-band: "18% del lado corto"
  sphere-min: "4% del lado corto"
  sphere-max: "11% del lado corto"
rounded:
  none: "0"
  debug: "6px"
components:
  title:
    textColor: "{colors.title}"
    typography: "{typography.title}"
  entry-hint:
    textColor: "{colors.hint}"
    typography: "{typography.hint}"
  guide-text:
    textColor: "{colors.guide}"
    typography: "{typography.guide}"
---

# Eternia — sistema de diseño

> Documentado con el flujo `document` de Impeccable a partir del código existente (`src/render/renderer.js`, `index.html`), el 2026-10-17. Los tokens del frontmatter son normativos; en el código viven como `TYPE` (renderer) y como variables CSS (`--field`, `--breath`).

## Overview

Es una pieza de **Experiencia** (modo Experience de Impeccable): la obra es la interfaz y la interfaz se retira. Hay una sola pantalla vertical oscura dibujada en canvas: un campo profundo con grano y viñeta, frases de luz sin recuadro, una esfera que hereda color y forma, y un borde que se expande y se contrae con la respiración. No hay menús, botones, marcadores ni contenedores. Todo lo que pasa se ve y se oye; nada se explica con texto, salvo «toca para entrar» antes del primer toque y las dos líneas de la voz.

Por regla del concepto, la quietud (calma y centro) es más bella que los extremos: más aire, más silencio, colores nítidos sin teñir.

## Colors

- **Campo** `#030307`: casi negro, frío. Es el fondo de todo. El halo central toma el matiz de la esfera en proporción a su tinte × definición.
- **Familias de pensamiento**: rojo disonante, oro armónico, iridiscente ambiguo (degradado que se desplaza entre violeta, cian, oro y verde agua) y gris azulado neutro. El color es la emoción, nunca una nota moral.
- **Respiración** `#97c2d7`: frío en calma. Se calienta hacia rojo o dorado con el extremo, y con eso se oscurece y se estrecha.
- **Voz** `#def0f6`: blanco frío, distinto de todas las familias. Es la única luz que no sale de un pensamiento.
- Los colores se calculan en HSL dentro del canvas. Los hex de arriba son las referencias.

## Typography

Una sola familia: **Spectral** (Production Type, OFL 1.1), autoalojada en `public/fonts/` (subconjunto latino que cubre á é í ó ú ñ ü ¿ ¡) y precacheada por el service worker. Es una serif pensada para pantalla, con versales serenas y peso Extra Light para el título. Su x-height es mayor que la de Cormorant, así que las frases de 14 px siguen legibles sobre negro.

| Rol | Peso | Tamaño | Tracking | Notas |
|---|---|---|---|---|
| Título «Eternia» | 200 | 11,5 % del ancho (38–52 px) | 0,32 em | aparece en ~1,6 s y se va; se va antes si alguien toca |
| Entrada «toca para entrar» | 300 cursiva | 15 px | 0,08 em | aparece a los ~2 s si nadie toca; alfa ≥ 0,53 (≈ 4,5:1) |
| Frase | 300 | 14–18 px según profundidad | 0,01 em | luz en lugar de recuadro: `shadowBlur` del color de la familia |
| Frase densa | 500 | + hasta 5 px | 0,01 em | doble trazo desplazado: «más literal, más cuerpo» |
| Voz | 300 cursiva | 15 px, interlineado 21 px | — | alineada a la derecha, junto a la luz del borde |
| Panel de depuración | monoespaciada | 11 px | — | solo con `?debug=1`, números tabulares |

El canvas espera a que Spectral cargue (`document.fonts.load`, con un máximo de 1,5 s) antes del primer cuadro, para que la tipografía no salte.

## Layout

- La **banda del borde** mide el 18 % del lado corto en cualquier orientación; ahí vive el aire. El resto es el campo.
- La **esfera** mide del 4 al 11 % del lado corto según la definición, y no entra en la banda.
- El título va al 36 % de la altura; la entrada, debajo, a ~0,95 × el tamaño del título.
- La voz se dibuja junto al borde derecho, al 60 % de la altura.
- Se adapta a 360×640, 390×844 y escritorio horizontal sin reglas especiales, porque todo se mide contra el lado corto.

## Elevation & Depth

La profundidad es **escala y luz**, nunca sombras de interfaz. Las frases más lejanas son más chicas y más tenues. La esfera tiene un halo radial y un brillo especular. El fondo lleva manchas abstractas desenfocadas que crecen solo mientras dura la fusión. Encima de todo va un grano en `overlay` (menos con movimiento reducido) y una viñeta.

## Shapes

- **Esfera pálida**: círculo translúcido.
- **Disonante**: contorno dentado y asimétrico, con grietas y fragmentos oscuros.
- **Cristal**: dodecágono perfectamente simétrico y facetado.
- **Moteada**: nácar con manchas de las dos cargas.
- **Centro**: puntos en filotaxis a 137,5° y tres órbitas elípticas con 5, 7 y 4 nodos.
- **No hay radios de esquina**: no hay cajas.

## Components

- **Campo** (canvas): `role="application"`, con descripción para lector de pantalla y `tabindex=0`. El foco de teclado se ve como una línea de aire de 1 px dentro del borde, nunca como un recuadro.
- **Halo del toque**: anillo suave donde está el dedo; nunca se dibuja un dedo.
- **Onda de entrada**: un anillo que se expande desde el primer toque.
- **Voz**: línea de luz vertical con halo y dos líneas en cursiva; también llega a una región `aria-live`.
- **Panel de depuración**: solo con `?debug=1`.

## Do's and Don'ts

- **Sí**: la luz como única forma de jerarquía; los cambios de estado visibles y audibles; mantener el centro como lo más bello.
- **Sí**: medir todo contra el lado corto; respetar el movimiento reducido (mitad de velocidad, menos grano).
- **No**: recuadros, burbujas ni tarjetas alrededor de las frases; menús, puntajes, barras de vida ni botones.
- **No**: dibujar la vitalidad como un marcador; solo se ve como luz y amplitud del borde.
- **No**: geometría sagrada importada como ícono; el patrón sale de la filotaxis y las órbitas.
- **No**: violencia, sangre ni sobresaltos de volumen.
