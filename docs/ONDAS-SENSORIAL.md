# Ruido mental y experiencia sensorial: investigación y mapeo por nivel

Los cinco estados se llaman por el **ruido mental**, de más ego a menos: **Tormenta, Parloteo, Murmullo, Quietud,
Silencio** (decisión de Brooks, 2026-10-17). Las ondas cerebrales quedan solo como inspiración científica, en la tabla de
correspondencia de §0.

Pedido de Brooks (2026-10-17): investigar, por cada nivel del concepto,
qué experiencias sensoriales se reportan en la literatura y la fenomenología (meditación, hipnagogia, sueño profundo,
absorción), y traducirlo a un clima visual y sonoro del fondo de viaje. Implementado en `src/core/levels.js` (puro,
con pruebas en `tests/ondas.test.js`), `src/render/renderer.js` (fondo) y `src/audio/mix.js` / `engine.js` (sonido).

## 0. Qué es y qué no es esto

- **Los estados no son ondas cerebrales.** Eternia no mide el EEG, no induce ondas y no promete ningún efecto.
  Ningún texto del juego, de la interfaz ni de la accesibilidad nombra una onda. **No hay batidos binaurales**: la evidencia es inconsistente (en una revisión
  sistemática de 14 estudios, 5 apoyan, 8 contradicen y 1 es mixto: Ingendoh et al., 2023).
- Una banda de EEG **no es** una experiencia. La relación entre ondas y vivencia es correlacional, débil y depende de la
  tarea, de la región del cráneo y del método. Lo que tomamos de cada nivel es **lo que la gente cuenta que vive** en estados
  que la literatura asocia con esa banda, no una fisiología.
- Fuerza de la evidencia, marcada en cada fila:
  **[S] sólida** (metanálisis, revisión sistemática o hallazgo replicado),
  **[M] moderada** (estudios controlados, sin replicar del todo),
  **[A] anecdótica / cualitativa** (entrevistas, casos, autoinforme; útil para diseñar, no para afirmar).

### Tabla de correspondencia (solo inspiración científica)

| Estado (ruido mental) | Definición | Región del concepto | Onda que inspiró la investigación |
|---|---|---|---|
| **Tormenta** | > 0,72 | extremo | gamma / beta alta |
| **Parloteo** (entrada) | 0,35–0,72 | mezcla | beta baja |
| **Murmullo** | 0,2–0,35 | calma | alfa |
| **Quietud** | 0,08–0,2 | cerca del centro | theta |
| **Silencio** | < 0,08 | centro | delta |

Las secciones siguientes citan estudios sobre esas bandas porque es donde está la literatura; el juego solo usa los
nombres de la primera columna.

## 1. Lo que dice la literatura, nivel por nivel

### Tormenta → extremo (definición > 0,72)

| Hallazgo | Evidencia | Fuente |
|---|---|---|
| Beta se asocia a mantener el estado actual («status quo»): atención sostenida, control, disposición motora | [M] revisión teórica con apoyo empírico | Engel & Fries, 2010 |
| Meditadores de larga práctica muestran gamma alta y sincronizada durante meditación de compasión | [M] un estudio pequeño (8 expertos), muy citado, poco replicado | Lutz et al., 2004 |
| Parte del «gamma» del EEG de cuero cabelludo es artefacto de microsacadas y músculo | [S] replicado | Yuval-Greenberg et al., 2008 |
| En la práctica de mindfulness no hay cambios consistentes en beta, delta ni gamma | [S] revisión sistemática (56 estudios) | Lomas, Ivtzan & Fu, 2015 |

**Lectura para el diseño.** La Tormenta es el ego denso y estrecho. La literatura no dice que gamma sea agitación (en
Lutz et al. es justamente lo contrario), así que este estado se diseña desde la **atención estrecha y activada**: campo
estrecho, mucho detalle cerca, movimiento nervioso. Ver §5.

### Parloteo → mezcla (0,35–0,72; el nivel de entrada, 0,45)

| Hallazgo | Evidencia | Fuente |
|---|---|---|
| Vigilia ordinaria con atención hacia afuera; beta acompaña el procesamiento activo | [M] | Engel & Fries, 2010 |
| En Ganzfeld (campo visual uniforme) con estado activado aparecen primero percepciones elementales (puntos, luces, nieblas) y luego imágenes más complejas | [M] estudio controlado con EEG | Wackermann, Pütz & Allefeld, 2008 |

**Lectura.** Mundo «normal»: polvo visible, algunas estrellas, movimiento moderado, destellos raros.

### Murmullo → calma (0,2–0,35)

| Hallazgo | Evidencia | Fuente |
|---|---|---|
| La meditación aumenta alfa (y theta) de forma bastante consistente | [S] revisión sistemática | Lomas et al., 2015; Cahn & Polich, 2006 |
| Alfa se relaciona con inhibición de lo externo y atención interna | [S] revisión clásica | Klimesch, 1999 |
| Meditadores describen luces: unas **difusas o con patrón** (brillo del campo, nieblas) y otras **discretas** (puntos, orbes) | [A] estudio cualitativo; 9 de 28 practicantes | Lindahl et al., 2014 |

**Lectura.** Más espacio, menos polvo, luces suaves y difusas que respiran despacio; los colores se enfrían (azul, violeta).

### Quietud → cerca del centro (0,08–0,2)

| Hallazgo | Evidencia | Fuente |
|---|---|---|
| Theta frontal de la línea media aumenta en meditación con atención interiorizada y dicha («bliss») autoinformada | [M] | Aftanas & Golocheikine, 2001 |
| Hipnagogia (el borde del sueño): imágenes, luces y colores que aparecen solos; a veces sonidos y sensación corporal | [S] fenómeno muy documentado; [A] su contenido | Waters et al., 2016; Stickgold et al., 2000 |
| Experiencias de luz en meditación: **orbes** y formas luminosas discretas que aparecen y se van | [A] | Lindahl et al., 2014; Lindahl et al., 2017 |
| Al disolverse el límite del yo cambian el sentido del tiempo, del lugar y del centro; las sensaciones del cuerpo siguen | [A] estudio de caso fenomenológico | Ataria, Dor-Ziderman & Berkovich-Ohana, 2015; Berkovich-Ohana et al., 2013 |

**Lectura.** El nivel de los **orbes**: formas de luz de dos colores (índigo y verde agua) que aparecen y se desvanecen en
varios segundos, sin dirección; movimiento lento.

### Silencio → centro (< 0,08)

| Hallazgo | Evidencia | Fuente |
|---|---|---|
| Más ondas lentas en zonas posteriores se asocian a **no** recordar experiencia al despertar; menos ondas lentas, a soñar | [S] | Siclari et al., 2017 |
| En mindfulness no aparecen cambios consistentes de delta | [S] | Lomas et al., 2015 |
| Al disolverse el límite: espacio sin bordes, tiempo que se detiene | [A] | Ataria et al., 2015 |

**Lectura.** Casi nada que ver: oscuridad profunda, muchas estrellas lejanas y pequeñas (vastedad), polvo escaso, casi
inmóvil, destellos rarísimos; sonido casi en silencio. El centro ya tenía «parciales altas y mucho silencio».

## 2. Mapeo nivel → clima

Valores en `LEVELS` (`src/core/levels.js`). Entre niveles hay fundidos de ±0,04 de definición, así que el clima cambia
tan despacio como el ego (las transiciones lentas de [DECISIONES.md](DECISIONES.md)).

| Nivel (definición) | Paleta (matiz 1 / 2) | Partículas | Velocidad | Destellos | Capa sonora |
|---|---|---|---|---|---|
| **Tormenta** (> 0,72) | rojo 8 (disonante) u oro 42 (cristal), saturado | polvo 1,0 · estrellas 0,15 · sin orbes | 1,35 y temblor 0,6 | 0,7 / s, chispas pequeñas | aire de lecho claro y granulado (paso bajo 2,4 kHz), brillos 0,25 |
| **Parloteo** (0,35–0,72) | azul gris 205 / ámbar 30 | polvo 0,75 · estrellas 0,3 | 0,85 | 0,2 / s | aire tibio (1,1 kHz) |
| **Murmullo** (0,2–0,35) | azul 214 / violeta 262 | polvo 0,55 · estrellas 0,45 · luces suaves 0,5 · orbes 0,35 | 0,5 | 0,12 / s, centelleo suave | aire suave (700 Hz), brillos 0,5 |
| **Quietud** (0,08–0,2) | índigo 252 / verde agua 178 | polvo 0,35 · estrellas 0,6 · luces 0,7 · **orbes 1** | 0,3 | 0,08 / s | aire cálido y bajo (420 Hz), brillos 0,6 |
| **Silencio** (< 0,08) | azul noche 228 / 250, casi negro | polvo 0,2 · **estrellas 0,9** | 0,15 | 0,03 / s | casi silencio (260 Hz, ganancia 0,02), brillos 0,4 |

## 3. El fondo de viaje (capas de paralaje)

Seis capas ancladas al mundo, procedurales (sin imágenes), dibujadas en canvas:

| Capa | Paralaje | Qué es |
|---|---|---|
| Luces suaves | 0,35 | nubes de color muy tenue (celdas de 1100 px), respiran con un ciclo de ~90 s |
| Orbes | 0,5 | formas de luz discretas de la Quietud; nacen y se van en 9 s |
| Estrellas lejanas | 0,12 y 0,3 | puntos fríos que centellean lento; 6 % con halo |
| Polvo medio | 0,55 y 0,85 | motas con deriva; tiemblan en la Tormenta |
| Polvo cercano | 1,6 | pasa **más rápido que el mundo**; al viajar se estira en la dirección del movimiento |
| Destellos | pantalla | puntos con cruz que brillan 0,6 s |

Al moverse la cámara, lo lejano casi no se desplaza y lo cercano pasa rápido: esa diferencia es la sensación de viaje. Con
el zoom, el lienzo muestra más o menos universo (menos ego = más lejos = más estrellas a la vista).

**Seguridad y movimiento reducido.**
- Destellos ≤ 2 por segundo en una rejilla fija de 0,5 s: nunca 3 en un segundo (WCAG 2.3.1; Fisher et al., 2005). Cada uno
  ocupa unos píxeles, sin parpadeo de pantalla ni rojo saturado a pantalla completa. Hay prueba automática.
- Con `prefers-reduced-motion`: deriva × 0,25, sin estelas de viaje, sin temblor, destellos × 0,3.
- Costo: tope de 400 celdas por capa; sprites de punto en caché (como antes).

## 4. Sonido del clima

- Dentro de la capa 1 (lecho), no una capa nueva: un **aire de nivel** (ruido café por paso bajo) que se oscurece hacia el
  centro (2,4 kHz → 260 Hz) y casi se calla en el Silencio. Baja bajo la voz del cierre.
- **Brillo de destello**: cada destello visible suena como un seno muy bajo (pentatónica de mi, 1,3–2,2 kHz) con su cola en
  la reverberación, paneado según su posición. Imagen y sonido leen el mismo reloj (`flashesAt(s.t)`), así que coinciden.
- Ninguna frecuencia intenta imitar ni arrastrar una onda cerebral; no hay batidos binaurales.

## 5. Tensiones y decisiones

1. **Nombres de ruido mental, no de ondas (cerrado, 2026-10-17).** El gamma más famoso (Lutz et al., 2004) aparece en
   meditación experta, no en la agitación, y parte del gamma de EEG es artefacto: llamar «gamma» al extremo confundía.
   Brooks decidió nombrar los estados por el ruido mental (Tormenta, Parloteo, Murmullo, Quietud, Silencio); las ondas
   quedan solo en la tabla de correspondencia (§0). Cierra [ABIERTO.md](ABIERTO.md) #18.
2. **Quietud = orbes.** Los reportes de luces y orbes son cualitativos ([A]); los usamos como imagen poética, no como «lo que
   le pasará al jugador».
3. **Silencio = vastedad casi vacía.** El sueño profundo se asocia a menos experiencia recordada; se traduce como espacio, no
   como imágenes.
4. Ningún texto del juego, de la interfaz ni de la accesibilidad nombra las ondas. Viven solo en esta documentación, como nota de inspiración.

## 6. Capturas (390×844, `npm run evidence:ondas`)

En `docs/evidence/ondas/`, en bloques de 3:
- `revision-bloque-1.jpg`: Silencio · Quietud · Murmullo
- `revision-bloque-2.jpg`: Parloteo (entrada) · Tormenta disonante · Tormenta cristal
- `revision-bloque-3.jpg`: viaje en Parloteo · viaje en Quietud · viaje con movimiento reducido

Valores medidos en `docs/evidence/ondas/medidas.json`.

## 7. Fuentes

- Aftanas, L. I., & Golocheikine, S. A. (2001). Human anterior and frontal midline theta and lower alpha reflect emotionally positive state and internalized attention. *Neuroscience Letters, 310*(1), 57–60. https://doi.org/10.1016/S0304-3940(01)02094-8
- Ataria, Y., Dor-Ziderman, Y., & Berkovich-Ohana, A. (2015). How does it feel to lack a sense of boundaries? A case study of a long-term mindfulness meditator. *Consciousness and Cognition, 37*, 133–147. https://doi.org/10.1016/j.concog.2015.09.002
- Berkovich-Ohana, A., Dor-Ziderman, Y., Glicksohn, J., & Goldstein, A. (2013). Alterations in the sense of time, space, and body in the mindfulness-trained brain. *Frontiers in Psychology, 4*, 912. https://doi.org/10.3389/fpsyg.2013.00912
- Cahn, B. R., & Polich, J. (2006). Meditation states and traits: EEG, ERP, and neuroimaging studies. *Psychological Bulletin, 132*(2), 180–211. https://doi.org/10.1037/0033-2909.132.2.180
- Engel, A. K., & Fries, P. (2010). Beta-band oscillations — signalling the status quo? *Current Opinion in Neurobiology, 20*(2), 156–165. https://doi.org/10.1016/j.conb.2010.02.015
- Fisher, R. S., et al. (2005). Photic- and pattern-induced seizures: A review for the Epilepsy Foundation of America Working Group. *Epilepsia, 46*(9), 1426–1441. https://doi.org/10.1111/j.1528-1167.2005.31405.x
- Ingendoh, R. M., Posny, E. S., & Heine, A. (2023). Binaural beats to entrain the brain? A systematic review of the effects of binaural beat stimulation on brain oscillatory activity, and the implications for psychological research and intervention. *PLOS ONE, 18*(5), e0286023. https://doi.org/10.1371/journal.pone.0286023
- Klimesch, W. (1999). EEG alpha and theta oscillations reflect cognitive and memory performance: A review and analysis. *Brain Research Reviews, 29*(2–3), 169–195. https://doi.org/10.1016/S0165-0173(98)00056-3
- Lindahl, J. R., Kaplan, C. T., Winget, E. M., & Britton, W. B. (2014). A phenomenology of meditation-induced light experiences: Traditional Buddhist and neurobiological perspectives. *Frontiers in Psychology, 4*, 973. https://doi.org/10.3389/fpsyg.2013.00973
- Lindahl, J. R., Fisher, N. E., Cooper, D. J., Rosen, R. K., & Britton, W. B. (2017). The varieties of contemplative experience: A mixed-methods study of meditation-related challenges in Western Buddhists. *PLOS ONE, 12*(5), e0176239. https://doi.org/10.1371/journal.pone.0176239
- Lomas, T., Ivtzan, I., & Fu, C. H. Y. (2015). A systematic review of the neurophysiology of mindfulness on EEG oscillations. *Neuroscience & Biobehavioral Reviews, 57*, 401–410. https://doi.org/10.1016/j.neubiorev.2015.09.018
- Lutz, A., Greischar, L. L., Rawlings, N. B., Ricard, M., & Davidson, R. J. (2004). Long-term meditators self-induce high-amplitude gamma synchrony during mental practice. *PNAS, 101*(46), 16369–16373. https://doi.org/10.1073/pnas.0407401101
- Siclari, F., et al. (2017). The neural correlates of dreaming. *Nature Neuroscience, 20*, 872–878. https://doi.org/10.1038/nn.4545
- Stickgold, R., Malia, A., Maguire, D., Roddenberry, D., & O'Connor, M. (2000). Replaying the game: Hypnagogic images in normals and amnesics. *Science, 290*(5490), 350–353. https://doi.org/10.1126/science.290.5490.350
- Wackermann, J., Pütz, P., & Allefeld, C. (2008). Ganzfeld-induced hallucinatory experience, its phenomenology and cerebral electrophysiology. *Cortex, 44*(10), 1364–1378. https://doi.org/10.1016/j.cortex.2007.05.003
- Waters, F., et al. (2016). What is the link between hallucinations, dreams, and hypnagogic–hypnopompic experiences? *Schizophrenia Bulletin, 42*(5), 1098–1109. https://doi.org/10.1093/schbul/sbw076
- W3C (2023). *Understanding SC 2.3.1: Three Flashes or Below Threshold* (WCAG 2.2). https://www.w3.org/WAI/WCAG22/Understanding/three-flashes-or-below-threshold.html

Todos los DOI se comprobaron el 2026-10-17 (Crossref o la página de la revista).
