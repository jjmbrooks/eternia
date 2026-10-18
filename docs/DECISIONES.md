# Decisiones de Eternia

Este archivo junta las aclaraciones de Brooks y lo que se acordó en el chat del 13 al 17 de octubre de 2026. Cuando algo choca con [CONCEPTO.md](CONCEPTO.md), manda este archivo, porque lo complementa. Los valores en código están en `src/core/params.js`; ahí, los que marca `[D]` son decisiones de esta versión y no vienen del PDF.

## Escala, cámara y lienzo infinito (Brooks, 2026-10-17)

Brooks: «No intentes que todo el universo esté dentro de la pantalla. Las escalas están mal: si el dedo toca la
esfera, el dedo no deja ver la esfera; tiene que ser más grande y navegar un lienzo infinito en todas direcciones».
Esto **reemplaza** «la pantalla siempre es la misma» y el radio de 4 % a 11 % del lado corto.

- **Lienzo infinito.** El núcleo trabaja en px de **mundo** (sin orillas) y hay una **cámara** (`s.cam`: posición y
  zoom). El dedo llega en px de pantalla y se convierte con la cámara. El borde (el aire) sigue siendo la orilla de
  la **pantalla**: 18 % del lado corto.
- **Navegar.** Con esfera, el dedo la lleva y la cámara la sigue (1,1/s; si la esfera se acerca a la orilla, la
  alcanza más rápido). Sostener el dedo lejos del centro es viajar en esa dirección: la esfera persigue al dedo y la
  cámara la mantiene en la vista, así que el viaje no tiene fin. Sin esfera (centro), **arrastrar mueve el lienzo**
  con inercia (frenado 1,6/s). Los pensamientos nacen justo fuera de la vista, alrededor de la cámara, y la mayoría
  por delante cuando se viaja; se van cuando quedan lejos. El fondo tiene motas en tres profundidades y nieblas de
  color lejanas, ancladas al mundo, con paralaje.
- **El dedo no tapa la esfera.** La esfera mide **≈ 123 px** de diámetro al entrar (390×844) y el dedo, ~45 px.
  Además, la esfera va **un poco arriba del dedo** (0,55 de su radio): se la «agarra desde abajo» y queda a la vista.
  Radio en el mundo: de 54 px (definición 0,08) a 72 px (definición 1); en pantalla × el zoom: ≈ 58 px de diámetro
  con el ego bajo, ≈ 194 px en el extremo.
- **Zoom ligado al ego.** Más identificación = cámara más cerca; menos = se aleja y se ve más universo.
  `zoomFor(def)` es geométrico a ambos lados del nivel de entrada: 0,38 en el centro, **1,0 al entrar (0,45)**, 1,5
  en el extremo. El extremo se ve estrecho («el fragmento es estrecho, el cristal es estrecho») y el centro, vasto.
- **El patrón del centro** se dibuja en un punto del mundo que se recentra despacio en la cámara (0,12/s): al
  arrastrar, el patrón se queda atrás y luego vuelve. **Sostener** para condensar una semilla cuenta solo con el dedo
  quieto: si se mueve más de 26 px es arrastre y la cuenta vuelve a 0 `[D]`.

## Nivel de entrada intermedio y transiciones lentas (Brooks, 2026-10-17)

- Brooks: «El juego debe iniciar en un estado intermedio», y luego: «en un **nivel** intermedio (no solo zoom), y
  las transiciones entre niveles deben durar bastante más». Se entra con **definición 0,45**, en la **mezcla**, el
  nivel del medio de la escala centro · calma · mezcla · extremo (antes 0,22, en la calma). Esfera ligera y todavía
  sin teñir (como mucho 8 % del último matiz), frases enteras, zoom 1. No es el colapso: el concepto sigue cumplido
  («siempre se entra cerca», sin vitalidad en cero ni esfera definida).
- **Ritmo:** las tasas de definición del PDF se multiplican por **`pace = 0,3`**: soltar −0,012/s, aire −0,024/s,
  fusión +0,018/s. La vitalidad, los umbrales (0,8 s, 1,6 s), la respiración y la voz no cambian.
- **Tiempos resultantes:** entrada → calma ≈ 8 s soltando (≈ 4 s en el aire); calma → centro ≈ 22 s (≈ 11 s);
  entrada → centro ≈ 31 s (≈ 15 s); entrada → extremo fundido ≈ 15 s (menos con hermanos). La **cámara** acompaña
  con τ = 3,5 s (≈ 10 s al 95 %), el **lecho** sonoro con τ = 2,5 s y el **espacio** sonoro con el mismo τ que la
  cámara. Tabla completa en [SONIDO.md › Transiciones lentas](SONIDO.md#12-transiciones-lentas-pedido-de-brooks-2026-10-17).
- Esto responde también a ABIERTO #8 (el centro llegaba demasiado rápido).

## Pensamientos dentro de esferas (Brooks, 2026-10-17)

- Brooks: «más frases para los pensamientos, dentro de esferas que son esféricas o más asimétricas dependiendo del
  tipo de pensamiento; puedes poner las frases en varias líneas». Ahora hay **71 frases** en 8 tipos y cada una vive
  en una **esfera contenedora**. Ver [FRASES.md](FRASES.md).
- **Tensión con el concepto:** el PDF pide frases «sin recuadro de cómic» y AGENTS.md prohibía «recuadros alrededor
  de las frases». La esfera de Brooks no es un recuadro ni un globo de diálogo: es una membrana tenue del color de la
  frase, sin cola, sin fondo opaco, que se deforma según el tipo y se disuelve con las letras. Manda la aclaración de
  Brooks; la prohibición queda para recuadros, cajas y globos de cómic.
- El contacto con la esfera-ego ahora es por círculos: tocan cuando se solapan (radio del ego + 0,55 del radio de la
  frase). Las esferas de las frases se apartan entre sí.
- **Legibilidad:** frases enteras desde la mezcla (definición ≥ 0,36), pierden letras en la calma y en el centro no
  hay texto, como dice la tabla de regiones (antes se perdían letras ya en la mezcla). En el extremo disonante la frase
  se corta.

## Sonido: diseño detallado (Brooks, 2026-10-17)

Ver [SONIDO.md](SONIDO.md). Se conservan **las tres capas** del concepto (lecho, espiral, respiración). Las voces de
los pensamientos por tipo y el centro áureo viven dentro de la **espiral**; el gesto del dedo son **acentos** cortos,
no una cuarta capa. El espacio (reverberación, eco, ancho) sigue al zoom. Tecla **M** para quitar el sonido;
vibración opcional con `?vibra=1`. Todo es síntesis propia; no hay archivos de audio.

## Nombre

- Se llama **Eternia**, sin tilde, e-TER-nia. «Eterna» fue un error al escribir.

## El gesto

- **El dedo es la atención.** Con el dedo en el campo (fuera de la banda del borde) y la esfera presente, la esfera sigue al dedo con inercia (desde el 17 de octubre, a un punto un poco arriba del dedo; ver «Escala»). La inercia crece con el tamaño: tarda de 0,15 s a 0,70 s en obedecer.
  - *Decisión de implementación:* no hace falta tocar justo la esfera, porque cualquier toque en el campo la dirige. Así no hay toques muertos en un teléfono chico, y se cumple lo que dijo Brooks: «la esfera se mueve hacia donde el dedo la dirija».
- **Soltar** deja la esfera con la inercia que traía; frena despacio, con una fricción de 0,6/s. El ego pierde cohesión despacio (definición **−0,04/s**) y la vitalidad se recupera (**+0,015/s**).
- **Dedo en la banda del borde** (18 % del lado corto): la respiración sube de volumen, la definición baja **0,08/s** y la vitalidad sube **+0,035/s**. El aire **nunca crea ego**, por más tiempo que el dedo pase ahí.
- Sostener la esfera sin fundirse con nada no la engorda: «la atención quieta no engorda al ego».
- **Fusión:** con la atención en el ego, quedarse **0,8 s** en contacto con una frase la funde. Hay un estallido de 0,18 × activación; la definición sube +0,06/s, la densidad de la frase sube +0,12/s y la esfera hereda matiz y textura. Mientras se sigue fundido hay un goteo de vitalidad (0,008/s × activación) `[D]`. Si un pensamiento hermano (de la misma familia) toca la esfera, se suma con otro estallido y +0,03 de definición `[D]`.
- **Extremo:** por encima de 0,72 de definición, «rozar ya funde». Un pensamiento afín (afinidad ≥ 0,6) que toca la esfera 0,8 s se absorbe solo, aunque el dedo no esté. Entre un estallido espontáneo y otro pasan 2,5 s `[D]`.

## El imán

- El imán va **del ego hacia los pensamientos**. La fuerza es la afinidad (matiz × textura) multiplicada por la definición. Una esfera pálida apenas elige; lo que no se parece se atenúa, pero no desaparece del todo hasta el extremo. Con la esfera definida, los pensamientos se acercan girando, en espiral.
- Las frases ambiguas tienen dos cargas y un imán que oscila.

## Regiones = estados de la definición

Las regiones no son lugares de la pantalla, son estados de la definición del ego. Desde el 17 de octubre se notan
también en la **cámara**: más ego, más cerca (ver «Escala, cámara y lienzo infinito»). Los tamaños de esfera de la
tabla son los de la v1; los actuales están en esa sección.

| Estado | Definición | Esfera | Pensamientos en el campo | Lenguaje |
|---|---|---|---|---|
| Centro | 0 – 0,08 | no hay | ~3, solo color | sin texto |
| Calma | 0,08 – 0,35 | chica, translúcida (4–6 %) | ~3–4 | pierden letras |
| Mezcla | 0,35 – 0,72 | teñida | ~8 | frases enteras |
| Extremo | 0,72 – 1 | grande (hasta 11 %), áspera o facetada | 15 o más | completas, apiñadas |

La cantidad de pensamientos sale de `round(3 + 14·def^1.4)`.

## Sonido

El clima sonoro cambia con cada estado y se sintetiza en vivo en **tres capas** (lecho, espiral, respiración). No hay música grabada y no se promete ningún efecto sobre las ondas cerebrales; los nombres de las ondas solo sirven para pensar el clima.

| Estado | Clima | Implementación v1 |
|---|---|---|
| Extremo disonante | «gamma / beta alta»: denso, seco, roto | dientes de sierra desafinados con modulación áspera a 37 Hz y filtro paso bajo |
| Extremo cristal | demasiado consonante, sin aire | senos en quintas y octavas puras, sin LFO |
| Mezcla | «beta baja»: aire cálido | triángulos graves con paso bajo |
| Calma | «alfa»: tonos que se alargan | senos con LFO lento |
| Cerca del centro | «theta»: se oyen a la vez los pulsos 5/7/4 | capa de espiral con los tres pulsos |
| Centro | «delta»: parciales altas, mucho silencio | senos agudos y suaves; la reverberación crece |

La respiración es ruido café con filtro: queda al frente con la atención en el borde y baja con la atención en la esfera.

Diseño completo (voces por tipo, espacio ligado al zoom, mezcla, silencio, accesibilidad): [SONIDO.md](SONIDO.md).

## Respiración

- Sin espiral: **4,5 s de entrada y 6,0 s de salida**. Con la atención en el aire, el ritmo vuelve a este cauce en el ciclo siguiente.
- Con espiral disonante es corta e irregular (≈1,9 / 2,3 s, con variación). Con el cristal es pareja y se sostiene arriba (≈3,6 / 0,9 / 3,6 s) `[D]`.

## La voz (guía)

- **Aparece** cuando la vitalidad está en 0 y la definición pasa de 0,72. Es una **luz distinta en el borde**, a la derecha: no es una esfera ni una frase. Lleva dos líneas de texto pequeño que dependen de la piel:
  - disonante: «Esto te rebasó. / No tienes que seguirlo.»
  - cristal: «Esto también te está usando. / Lo bello no es la salida.»
- **Mientras se ofrece** (el bucle), ni soltar ni el aire adelgazan casi nada: el factor es 0,15 `[D]`. Es lo que dice el PDF de que «el borde, que sería la salida, es inalcanzable».
- **Aceptar** es dejar el dedo en el borde **3 ciclos de respiración**, 3 × (4,5 + 6,0) = **31,5 s** seguidos. Después, el imán baja a **1/3**, el borde se enciende y el aire vuelve a rendir completo hasta que la definición baja de **0,45**. Entonces la voz se va.
- **Agarrar la esfera** mientras la voz espera cancela la aceptación (el contador vuelve a 0) sin castigo extra.
- **Ignorarla** no tiene castigo. El texto se ve 14 s y luego se calla `[D]`; la luz sigue ahí y la voz se vuelve a ofrecer unos **60 s** después.
- En la v1 la voz es **texto, más un tono suave**. Para lectores de pantalla sale en una región `aria-live`. Si se graba o se sintetiza, ver [ABIERTO.md](ABIERTO.md).

## El centro

- Abajo de 0,08 no hay esfera. Se ve una filotaxis de puntos de colores a 137,5° y tres órbitas lentas con 5, 7 y 4 nodos. Sus periodos son 13 s, 13·φ s y 13/φ s; como están en razón φ, nunca cierran un ciclo común.
- Un roce no crea ego. **Sostener 1,6 s** empieza a condensar una semilla, que arranca en 0,04 de definición y sube +0,06/s `[D]`. Si se suelta antes de **0,15**, la semilla se deshace. Si llega a 0,15, prende: aparece una esfera teñida del matiz del punto donde está el dedo, y la atención pasa al ego.

## El juego no termina

No hay game over, puntaje, metas ni créditos.

## Al volver a abrir

- La definición arranca en **0,45** (el nivel intermedio que pidió Brooks; el PDF decía 0,22), la vitalidad en **0,75** y la textura en neutra. La esfera tiene **como mucho un 8 %** del último matiz.
- Solo se guarda el color (matiz + tinte), en `localStorage` del dispositivo.
- Antes del primer toque, la definición y la vitalidad no cambian: el campo se mueve, pero nadie ha llegado todavía.

## Entrada (primer toque)

- iOS no deja arrancar el audio sin un gesto. El nombre aparece y se va; si nadie toca, a los ~2 s aparece debajo, tenue, «toca para entrar».
- El primer toque es la entrada. Abre una onda en el campo, el sonido entra despacio (≈1,5 s) y la esfera se inclina hacia el punto tocado. Ese toque no cuenta como atención.
- También se entra con teclado: Intro o Espacio.

## Accesibilidad y movimiento

- Con `prefers-reduced-motion` (o `?rm=1`) el campo va a la mitad de velocidad y el grano baja a la mitad. Las reglas del gesto no cambian.
- Teclado: mantener Espacio es posar la atención; las flechas la mueven. El borde está en los extremos de la pantalla. **M** quita o devuelve el sonido.

## Atributos de las frases

Ver [FRASES.md](FRASES.md).
