# Product

<!-- impeccable:product-schema 1 -->

> Escrito con el flujo `init` de Impeccable el 2026-10-17. Las respuestas no salieron de una entrevista: Codelius trabajó como subagente sin canal para preguntar, así que se infirieron del brief explícito, que es el documento conceptual (`docs/CONCEPTO.md`) más las aclaraciones de Brooks en el chat (`docs/DECISIONES.md`). Lo que no está en esas fuentes va marcado **(inferido)**. Brooks puede corregir cualquier campo.

## Platform

web

## Stack

Vite + JavaScript sin framework, PWA que funciona sin red, publicada en GitHub Pages bajo `/eternia/`. Lo eligió Brooks en el encargo de la v1. Canvas 2D para la imagen y WebAudio para el sonido.

## Users

Una persona con el teléfono en la mano, que puede tener un minuto o diez y que no viene a que la evalúen. Abre la pieza en un momento de ruido mental, con una sola mano y en vertical. También quien quiere explorarla como un objeto: irse al caos a propósito, volver y oír cómo cambia el campo.

## Product Purpose

Eternia es una experiencia audiovisual sin fin y sin meta para bajar el ruido de la mente y quedarse un rato. Es un campo abstracto donde la atención se ve. Funciona si una persona, sin explicación, puede fundirse con una frase, soltar, ir al aire, recorrer los dos extremos, encontrar la voz y llegar al centro (ver la lista «Cuándo la primera versión ya está» en `docs/CONCEPTO.md`), y si se siente como «una trampa bella y no como un examen».

## Positioning

No es una app de meditación con instrucciones, rachas ni metas. El gesto (un dedo = la atención; quedarse = fusión; el borde = la respiración) *es* la enseñanza. Los dos extremos, el áspero y el bello, gastan igual. El centro no se gana, se habita.

## Operating Context

- Teléfono en vertical, con una mano. El dedo tiene que alcanzar la esfera y el borde.
- Muchas veces en momentos de estrés o de ruido, a veces con audífonos (inferido) y a veces en silencio.
- iOS exige un toque antes de que suene el audio.
- Sin red, una vez instalada.

## Capabilities and Constraints

- Una sola pantalla oscura, sin menús, sin marcador, sin botones, sin cuentas, sin analíticas y sin recuadros alrededor de las frases.
- La única instrucción visible es «toca para entrar», que desaparece con el primer toque.
- El estado solo se guarda en el dispositivo: el último color.
- La voz de la v1 es texto; la voz hablada está abierta (`docs/ABIERTO.md`). Un TTS de pago requiere el visto bueno de Brooks.
- No es un tratamiento ni un dispositivo clínico, y no promete efectos sobre las ondas cerebrales.

## Brand Commitments

- El nombre es **Eternia** (e-TER-nia, sin tilde). La primera pantalla tiene que ser abstracta de verdad para que no se oiga la fantasía heroica de He-Man.
- La voz de la pieza habla en español, va en minúsculas, sin exclamaciones ni moraleja; las frases se escriben «como se piensan».
- No se usan emblemas religiosos ni geometría sagrada importada: el patrón tiene que salir del movimiento.

## Evidence on Hand

- Concepto: `docs/CONCEPTO.md` (y el PDF en `docs/ref/`).
- Maquetas hechas con código: `docs/mockups/`. Imágenes conceptuales del generador, solo de referencia: `docs/ref/concepto/`.
- No hay testimonios, usuarios de prueba ni métricas, y no deben inventarse.

## Product Principles

1. **El campo enseña.** Ninguna regla se explica con texto; cada regla se ve y se oye.
2. **La quietud es lo más bello.** El centro tiene que ganarle en belleza al cristal, o la lección es falsa.
3. **Sin examen ni castigo.** No hay game over, puntaje ni regaños; si un valor se siente examen, se cambia.
4. **Lo intenso es sensorial, nunca un susto.** Sin violencia, sin saltos de volumen.
5. **Siempre se entra cerca.** Ninguna visita empieza dentro del colapso.

## Accessibility & Inclusion

- `prefers-reduced-motion`: el campo va a la mitad de velocidad y con menos grano (lo pide el PDF).
- Control por teclado y región viva para la voz (inferido: es lo mínimo de WCAG para una pieza basada en gestos).
- Las frases tenues están por debajo del contraste AA a propósito: es parte del concepto. Queda abierto un modo de contraste alto.
