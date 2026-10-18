# Diseño sonoro de Eternia

Diseño, fuentes y funcionamiento del sonido. Autor: Codelius (asistente de Brooks), 2026-10-17. Lo pidió Brooks:
«la experiencia sonora es muy importante; como en SnapFit, hace falta un diseño detallado». Manda el concepto
([CONCEPTO.md › Regiones y sonido](CONCEPTO.md#regiones-y-sonido)); las decisiones nuevas están también en
[DECISIONES.md](DECISIONES.md).

> **Nota honesta.** Codelius no puede escuchar. Todo lo de abajo está diseñado por su estructura (alturas,
> envolventes, niveles, tiempos) y verificado con pruebas de la mezcla y en el navegador, pero **no de oído**.
> Brooks tiene que escucharlo con audífonos y en la bocina del teléfono (ver [§ 15](#15-pendiente-para-brooks)).

## 1. Qué había antes (v1)

- Tres capas sintetizadas: un lecho por región (5 grupos de osciladores), la espiral (los pulsos 5/7/4) y la
  respiración (ruido café filtrado). Un oleaje grave en cada estallido y un tono para la voz del cierre.
- No había voz para los pensamientos, ni sonido del gesto, ni espacio ligado a la distancia, ni forma de quitar el
  sonido, ni vibración. Las transiciones de región duraban ~1,2 s.

## 2. Principios (del concepto, no se negocian)

1. **No es una canción ni una pista que se repite.** Es una textura generada en el momento, amarrada al aire y al
   estado de la esfera. No hay archivos de audio.
2. **Tres capas, y solo esas:** lecho, espiral y respiración. Todo lo nuevo vive dentro de una de ellas (las voces de
   los pensamientos son parte de la espiral) o es un **acento** del gesto: corto, que no forma una cuarta capa
   continua. La primera vez que alguien juega, las tres capas tienen que oírse por separado.
3. **El oído se entera de la trampa antes que cualquier número.** El cristal suena más bonito que el fragmento, y
   las dos espirales suenan a encierro: cerca, seco, sin aire.
4. **La quietud suena más bella que el cristal:** más aire, más espacio, más silencio.
5. **Sin saltos de volumen, sin disonancias que ataquen, sin sustos.** Lo fragmentado puede ser incómodo; nunca un
   sobresalto.
6. **Sin beats binaurales ni promesas** sobre ondas cerebrales. Los nombres (gamma, beta, alfa, theta, delta) solo
   sirven para pensar el clima.

## 3. Arquitectura: capas y acentos

| | Qué es | Cuándo se oye | Archivo |
|---|---|---|---|
| **1 · Lecho** (drone / ambiente) | Un clima por región + el **espacio** (reverberación, eco, ancho estéreo) ligado al zoom | Siempre (tras el primer toque) | `engine.js › BEDS`, `mix.js › bed, space` |
| **2 · Espiral** | **Centro áureo** (pulsos 5/7/4) + **voces de los pensamientos** (una por tipo) + voz sostenida mientras hay fusión | Según la definición y la piel de la esfera | `engine.js › ping, voice, startFused` |
| **3 · Respiración del borde** | Ruido café por un pasabanda que sube y baja con el marco | Siempre; al frente con el dedo en el borde | `engine.js › breath` |
| Acentos del gesto | Contacto, viento del viaje, brillo de la semilla, estallido, entrada, voz del cierre | Solo cuando pasa algo | `engine.js › oneShot, wind, shimmer` |

```
osciladores del lecho ─ panner (ancho) ─┐
pulsos 5/7/4 ───────────────────────────┤
voces de pensamientos ─ panner (x) ─────┼─► master ─► paso bajo (espacio) ─┬─► limitador ─► salida
respiración ─ panner (lado del dedo) ───┤                                  ├─► reverberación (wet) ─┘
acentos del gesto ──────────────────────┘                                  └─► eco 0,618 s (feedback) ─┘
```

## 4. Capa 1 · El lecho

### Un clima por región

Las regiones son estados de la definición del ego (DECISIONES › Regiones). Entre una y otra hay fundido cruzado.

| Región (definición) | Clima | Síntesis | Por qué |
|---|---|---|---|
| Centro (< 0,08) | «delta»: parciales altas, mucho silencio | 4 senos E6–E7 (1318–2637 Hz), muy suaves, LFO 0,03 Hz | El PDF: «en el centro quedan parciales altas, limpias, y mucho silencio» |
| Calma (0,08–0,35) | «alfa»: tonos que se alargan | 4 senos A3–B4, LFO 0,06 Hz, paso bajo 3 kHz | La respiración se asienta; nada empuja |
| Mezcla (0,35–0,72) | «beta baja»: aire cálido | 5 triángulos A2–E4, LFO 0,1 Hz, paso bajo 1,4 kHz | Es donde se entra: cálido, todavía abierto |
| Extremo disonante (> 0,72, áspero) | «gamma / beta alta»: denso, seco, roto | 6 dientes de sierra desafinados (±15 cents), modulación de amplitud a 37 Hz (grano), paso bajo 2,2 kHz | Fragmento: incómodo pero no agresivo (el paso bajo quita lo que muerde) |
| Extremo cristal (> 0,72, liso) | demasiado consonante, sin aire | 6 senos en quintas y octavas justas, sin LFO | Bello y rígido: «música consonante y sin aire» |

### El espacio sigue al zoom (y el zoom sigue al ego)

La **cercanía** es la posición logarítmica del zoom entre `zoomMin` (0,38) y `zoomMax` (1,5): 0 = lo más lejos,
1 = lo más cerca. Como el zoom de la cámara se mueve despacio, el espacio sonoro **acompaña a la cámara**, no salta
con la definición.

| Parámetro | Lejos (poco ego, cercanía 0) | Cerca (mucho ego, cercanía 1) | Por qué |
|---|---|---|---|
| Reverberación (wet) | 0,72 | 0,14 | Lo abierto es vasto; el encierro es seco |
| Eco 0,618 s (envío / realimentación) | 0,32 / 0,42 | 0,02 / 0,05 | Retardo en razón áurea: el eco tampoco cierra un ciclo |
| Ancho estéreo del lecho | 0,9 | 0,2 | Lejos, el sonido está alrededor; cerca, encima, en el centro de la cabeza |
| Paso bajo general | 9 kHz | 4,2 kHz | Cerca es más opaco y pesado |
| Nivel del lecho | 0,5 | 1,0 | Cerca, el ego llena el oído; lejos, hay sitio para el silencio |

## 5. Capa 2 · La espiral

### Centro áureo: los tres pulsos

- Tres pulsos de 5, 7 y 4 golpes por vuelta. Sus periodos son 13 s, 13·φ ≈ 21,03 s y 13/φ ≈ 8,03 s, así que un
  golpe cae cada 2,6 s, 3,0 s y 2,0 s y **nunca coinciden en un ciclo común** (la danza no cierra).
- Notas: do5, mi5 y re5 (523, 659, 588 Hz), senos con 4 s de cola. Son consonantes pero, como no se alinean,
  no forman una melodía que se repita.
- **Cerca del centro** (definición < 0,38) se oyen **los tres juntos**: el reconocimiento de la figura es sonoro.
- **Con la esfera definida** solo suena el pulso de su familia: el disonante (dos triángulos a un semitono, cola corta),
  el cristal (seno + quinta, cola larga) o el moteado. «El imán dejaba oír solo el pulso de la familia elegida».

### Voces de los pensamientos, por tipo

Cada pensamiento que **entra a la vista** dice su tipo con un gesto sonoro corto (no palabras). Si la esfera lo
toca, vuelve a sonar más cerca. Alturas por familia (`mix.js › SCALES`):

- disonante: re3 con segunda menor y tritono (147–220 Hz): incómodo, no agresivo;
- armónica: la mayor pentatónica (220–440 Hz): consonante, «demasiado bonita»;
- ambigua: sol con tercera mayor y menor (196–311 Hz): no elige;
- neutra: un tic agudo (880–988 Hz), casi sin altura.

| Tipo | Familia | Gesto sonoro | Envolvente | Por qué |
|---|---|---|---|---|
| preocupación | disonante | dos triángulos a un semitono con trémolo de 7 Hz | 80 ms de ataque, 1,3 s | Tiembla, como su esfera: inestable, adelantada |
| juicio | disonante | ruido estrecho (Q 6) + triángulo que cae un tercio | 20 ms, 0,9 s | Seco y áspero; cae como un veredicto, sin golpe |
| deseo | armónica | seno que sube un tono entero + octava | 0,7 s de hinchazón, 2,2 s | Se estira hacia lo que quiere, como su esfera-gota |
| orgullo | armónica | campana FM armónica (portadora 2f, moduladora 4f) + quinta | 10 ms, 3 s | Brillante y perfecta: el cristal facetado |
| calma | armónica | seno + octava | 0,9 s de entrada, 3,6 s | La calma con dueño: lisa, bonita, también es un cristal |
| recuerdo | ambigua | triángulo apagado (paso bajo 1,4 kHz) con vaivén de afinación de ±14 cents | 30 ms, 2,6 s | Caja de música lejana: dulce y perdida |
| duda | ambigua | tercera que alterna entre mayor y menor (4 cambios) sobre su fundamental | 50 ms, 1,8 s | Dos cargas que no se resuelven |
| cotidiano | neutra | tic de madera (ruido 2,2 kHz, 30 ms) + seno corto | 3 ms, 0,25 s | Casi nada: un foco, una hora |

Reglas de las voces:

- **Nivel = legibilidad.** Las voces suenan tanto como se leen las frases: en mezcla y extremo, completas; en calma,
  bajan; en el centro **callan** (no hay palabras, tampoco voces).
- **De una en una:** como mucho 3 a la vez y al menos **1,3 s** entre una voz nueva y la anterior. Así el extremo es
  denso pero no un murmullo, y queda silencio entre pensamientos.
- **Pan por posición:** la voz sale del lado de la pantalla donde está la frase.
- Las frases atenuadas (de otro matiz) suenan a un tercio.
- **Voz sostenida al fundirse:** mientras la atención está fundida con una frase, suena un acorde grave de su familia
  (sierras con paso bajo para lo disonante —con trémolo si es preocupación—, quintas puras para lo armónico,
  tercera que oscila para lo ambiguo). Entra en ~1,2 s y sale en ~0,8 s al soltar. Cuando un hermano se suma, su voz
  suena encima.

## 6. Capa 3 · La respiración del borde

- Ruido café por un pasabanda (Q 0,7) cuya frecuencia sigue al marco: 380 Hz con el aire fuera, 1,28 kHz con el
  aire dentro. Sin espiral, el ciclo es de **4,5 s de entrada y 6,0 s de salida**; con el ego definido se deforma
  (corta e irregular en lo disonante, pareja y sostenida en el cristal) igual que el marco.
- **Nivel:** 0,55 con el dedo en el borde, 0,22 sin dedo, 0,10 con la atención en la esfera; × la vitalidad (de
  0,35 a 1). Con la ayuda aceptada, +0,15.
- **Lado:** con el dedo en el borde, la respiración se va hacia ese lado (pan ±0,7).

## 7. Acentos del gesto (interacción del dedo)

| Momento | Sonido | Nivel | Por qué |
|---|---|---|---|
| Primer toque (entrada) | la2 + mi3 que entran en 1,2 s y se apagan en 5 s; el master entra en 1,5 s | 0,05 | Abrir el campo, sin golpe. iOS exige ese toque para encender el audio |
| El dedo toma la esfera | seno sol3, 40 ms de ataque, 0,7 s | 0,035 | Contacto: que se sienta que la atención se posó |
| Viajar por el lienzo | viento: ruido blanco por un pasabanda de 380 → 1980 Hz según la velocidad; pan según la dirección | hasta 0,06 | El lienzo infinito se oye: moverse es aire que pasa |
| La esfera toca una frase | la voz de su tipo, más cerca | 0,07 | Antes de fundir, el oído ya sabe qué se está tocando |
| Estallido (fusión, hermano) | oleaje grave 90 → 55 Hz, 0,25 s de ataque, 1,6 s | 0,12 × costo | Gasta, se siente en el cuerpo; nunca un susto |
| Sostener en el centro | brillo: dos senos (f y f·φ) que suben de 660 a 990 Hz con la semilla | hasta 0,025 | Querer agarrar el patrón suena a algo que se condensa |
| La semilla prende | mi5 + su quinta, 3,5 s | 0,05 | Una forma nace (y abre la puerta de regreso) |
| La semilla se deshace | seno que cae una octava, 1,5 s | 0,02 | Soltar a tiempo: el centro sigue |
| Voz del cierre (ofrece / acepta) | re4 / sol4 lejano, 1,5 s de entrada, 6 s | 0,04 / 0,06 | Un tono limpio desde el borde |

## 8. Cómo cambia el sonido con el nivel de ego y el zoom

| Estado | Zoom (cámara) | Lecho | Espacio | Espiral | Respiración | Silencio |
|---|---|---|---|---|---|---|
| Centro | 0,38 (lejos, mucho universo) | parciales altas, apenas | reverberación 0,7, eco largo, muy ancho | los tres pulsos juntos; sin voces | asentada, 4,5/6 s | mucho: es lo que más hay |
| Calma | ~0,5–0,85 | senos que se alargan | amplio | pulsos que se apagan; voces bajas | asentada | entre voces |
| Mezcla (la entrada) | 1,0 | triángulos cálidos | medio | voces completas, una por frase que llega | asentada | 1,3 s entre voces |
| Extremo disonante | hasta 1,5 (cerca, encima) | sierras granuladas a 37 Hz | seco, estrecho | el pulso del fragmento; voces de preocupación y juicio | corta, irregular | poco |
| Extremo cristal | hasta 1,5 | quintas y octavas puras, sin LFO | seco, estrecho | el pulso del cristal; voces de deseo, orgullo y calma | pareja, sostenida arriba | poco |
| La voz del cierre | — | **baja a 0,45** («sin música detrás») | — | pulsos a 0,3; voces a 0,2 | sigue | se abre un hueco para la voz |

## 9. Mezcla (niveles)

Niveles relativos al master (0,8 ≈ −2 dBFS antes del limitador). Son lineales; entre paréntesis, aproximado en dB.

| Fuente | Nivel máximo | |
|---|---|---|
| Lecho (suma de su región) | 0,10–0,25 (−20 a −12 dB) | La cama: siempre debajo de todo lo demás |
| Pulsos 5/7/4 | 0,09 (−21 dB) cada golpe | Se oyen, pero como gotas |
| Voces de pensamientos | 0,05 (−26 dB), 0,07 al tocar, 0,08 al sumarse un hermano | Cerca del lecho: no son diálogo |
| Voz sostenida de la fusión | 0,05 (−26 dB) | Un color, no una melodía |
| Respiración | 0,55 (−5 dB) con el dedo en el borde | **Es el sonido más fuerte** cuando la atención está en el aire (lo pide el PDF) |
| Viento del viaje | 0,06 (−24 dB) | Apenas |
| Estallido | 0,12 × costo / 0,18 (máx. ≈ 0,17 con activación 1,4) | Grave: se siente más de lo que se oye |

**Limitador** al final (umbral −14 dB, rodilla 12 dB, razón 8:1, ataque 10 ms, liberación 0,4 s): ninguna suma de
eventos puede producir un salto. La reverberación es una convolución de 4,5 s generada por código (ruido con caída).

## 10. Dinámica: nada cambia de golpe

Cada objetivo de la mezcla se persigue con una constante de tiempo (`mix.js › TAU`): un cambio llega al 63 % en τ y
al 95 % en 3τ.

| Qué | τ | 95 % en |
|---|---|---|
| Entrada del master (primer toque) / quitar el sonido | 1,5 s / 0,4 s | 4,5 s / 1,2 s |
| Lecho (cambio de región) | 2,5 s | 7,5 s |
| Espacio (reverberación, eco, ancho, paso bajo) | 3,5 s | 10,5 s — el mismo τ que el zoom |
| Respiración | 0,35 s | 1 s (tiene que seguir al marco) |
| Voz sostenida | 0,6 s | 1,8 s |
| Viento | 0,25 s | 0,75 s |

Ninguna voz tiene un ataque menor a 3 ms y solo el tic cotidiano baja de 10 ms (y es el más suave de todos).

## 11. Silencio

El silencio es material, no un hueco:

- En el **centro**, el lecho queda en parciales altas casi inaudibles y los pulsos caen cada 2–3 s: entre golpe y
  golpe hay aire y nada más.
- Las voces respetan **1,3 s** de separación y un máximo de 3.
- Cuando aparece la **voz del cierre**, todo baja para dejarle lugar.
- Al **ocultar la pestaña** el audio se suspende; al volver, sigue donde estaba.
- Apagarse no es el centro: si nadie toca, el campo sigue sonando suave (lecho y respiración), no se apaga.

## 12. Transiciones lentas (pedido de Brooks, 2026-10-17)

Brooks pidió que el paso entre niveles dure **bastante más**, lento y contemplativo, con cámara y sonido acompañando.
Las tasas de definición del PDF se multiplican por `pace = 0,3` (`src/core/params.js`):

| Tasa | PDF | Ahora |
|---|---|---|
| Dedo suelto | −0,04 / s | −0,012 / s |
| Dedo en el borde (aire) | −0,08 / s | −0,024 / s |
| Durante la fusión | +0,06 / s | +0,018 / s |

| Transición (sin tocar nada más) | Soltando | Con el dedo en el aire |
|---|---|---|
| Entrada (0,45, mezcla) → calma (0,35) | ≈ 8 s | ≈ 4 s |
| Calma (0,35) → centro (0,08) | ≈ 22 s | ≈ 11 s |
| Entrada → centro | ≈ 31 s | ≈ 15 s |
| Entrada → extremo (0,72) fundido a una frase | ≈ 15 s (menos si se suman hermanos: +0,03 cada uno) | — |

Encima de eso, la **cámara** tarda τ = 3,5 s en acompañar cada cambio de zoom (≈ 10 s al 95 %), el **lecho** cruza
de región con τ = 2,5 s y el **espacio** usa el mismo τ que la cámara. Lo que se ve y lo que se oye se alejan y se
acercan juntos.

## 13. Accesibilidad

- **Sin sonido, nada se pierde:** cada capa tiene su equivalente visual (región → color y tamaño, espiral → órbitas y
  piel, respiración → marco que respira, voces → la frase y su esfera, voz del cierre → texto + región `aria-live`).
  El juego se puede jugar mudo.
- **Quitar el sonido:** tecla **M** (se recuerda en el aparato, en `localStorage`); el lector de pantalla anuncia
  «sin sonido» / «con sonido». En iOS 17+ se usa `navigator.audioSession.type = 'ambient'`: respeta el interruptor
  de silencio del teléfono y no corta la música de otra app. Dentro del campo **no hay botón** (lo prohíbe el
  concepto); en el teléfono se baja el volumen con los botones del aparato. Ver ABIERTO #12.
- **Vibración (opcional y suave):** apagada por defecto, porque el concepto la deja como «añadido posterior y
  suave», nunca obligatoria. Se enciende con **`?vibra=1`** (se recuerda; `?vibra=0` la apaga). Hace un pulso de
  14 ms al empezar cada inhalación **solo con el dedo en el borde** y un toque de 10 ms en cada estallido. No vibra
  con `prefers-reduced-motion`. **iPhone no tiene vibración web** (Safari no implementa `navigator.vibrate`); solo
  Android.
- **Movimiento reducido** no cambia el sonido (las reglas del gesto no cambian), pero el campo va a la mitad.
- Sin destellos ni pulsos rápidos de volumen: el trémolo más rápido (7 Hz, preocupación) es de profundidad 0,4 y
  dura 1,3 s.

## 14. Fuentes y licencias

**Todo es síntesis propia con WebAudio**, escrita para Eternia (`src/audio/engine.js`, `src/audio/mix.js`, licencia
MIT como el resto del código). No hay archivos de audio en el repositorio: ni música, ni muestras, ni voces.

- Se consideraron paquetes CC0 (Kenney, por ejemplo) y se descartaron: el concepto pide que el sonido «se sintetice
  en el momento» y que no haya «música grabada»; una muestra repetida se reconoce y rompe la textura viva.
- Si en el futuro hace falta una muestra (por ejemplo, la voz hablada del cierre), solo CC0 o CC BY 4.0 con la
  licencia en `docs/ASSETS-PROVENANCE.md`. **Nada de pago** sin el visto bueno de Brooks (ABIERTO #2).

## 15. Implementación y pruebas

- `src/audio/mix.js` — **puro**: `mixFor(estado)` devuelve los niveles de todas las capas, el espacio y los acentos;
  `proximity(zoom)`; escalas por familia. Probado en `tests/v2.test.js › mezcla de sonido` (más ego = más seco;
  centro = solo pulsos; voces = legibilidad; respiración al frente en el borde; la voz del cierre sin música detrás;
  mudo = master 0).
- `src/audio/engine.js` — WebAudio: un `AudioContext` creado en el **primer toque** (o Intro/Espacio), nunca antes.
  Persigue los objetivos de `mixFor` con `setTargetAtTime`, programa los pulsos con 250 ms de anticipación y dispara
  las voces y acentos con los eventos del núcleo (`contact`, `fuse`, `unfuse`, `absorb`, `burst`, `seed-*`,
  `guide-*`).
- El núcleo (`src/core/`) sigue sin audio: solo emite eventos.

## 16. Pendiente para Brooks

1. **Escuchar todo**, con audífonos y con la bocina del teléfono: que se distingan las tres capas, que el cristal
   suene más bonito que el fragmento y que el centro suene todavía mejor.
2. ¿Las voces por tipo se entienden como «un pensamiento que llega» o distraen? Se puede bajar su nivel (0,05) o
   subir la separación (1,3 s).
3. ¿El viento del viaje suma o sobra?
4. ¿La vibración debería estar encendida por defecto en Android?
5. La voz hablada del cierre sigue abierta (ABIERTO #2).
