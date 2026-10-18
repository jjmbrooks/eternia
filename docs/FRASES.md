# Banco de frases y sus esferas

El banco tiene **71 frases**: las 22 del PDF (marcadas «PDF») y 49 nuevas que pidió Brooks el 17 de octubre de
2026 («muchas más frases para los pensamientos»). Las escribió Codelius como se piensan: en español, en minúsculas,
sin exclamaciones y sin moraleja. Están en `src/core/phrases.js`; las formas, en `src/core/bubble.js`.

## Tipo y familia

Brooks nombró tipos de pensamiento (preocupación, deseo, juicio, recuerdo, calma…). El **tipo** dice cómo se piensa
la frase y decide su **familia**, que es como actúa en el campo (imán, piel de la esfera, voz del cierre, sonido).
Las cuatro familias del concepto no cambian.

| Tipo | Familia | Qué es | Ejemplo |
|---|---|---|---|
| preocupación | disonante | se adelanta al futuro, inestable | «y si sale mal» |
| juicio | disonante | áspero, absoluto, contra uno | «siempre lo arruino» |
| deseo | armónica | quiere más, que dure | «solo un poco más» |
| orgullo | armónica | «esto soy», el cristal | «lo hice perfecto» |
| calma | armónica | la calma **con dueño**: también es un cristal | «esto es meditar bien» |
| recuerdo | ambigua | dulce y perdido a la vez | «así olía la casa» |
| duda | ambigua | dos cargas que no se resuelven | «quiero y no quiero» |
| cotidiano | neutra | casi neutras, para que el campo no sea solo una pelea | «hay que comprar pan» |

**Por qué la calma es armónica:** el concepto dice que «un pensamiento feliz que cruza tampoco es el camino» y que el
cristal es la trampa bella. «Ya estoy en paz» dicho como identidad es ego; el centro no tiene frases.

## Forma de la esfera por tipo

Cada frase vive dentro de una **esfera contenedora** (pedido de Brooks). No es un globo de cómic ni un recuadro:
es una membrana tenue, del color de la frase, que respira. La forma sale de cinco parámetros (`SHAPES`):
redondez, lóbulos, aspereza, facetas y estiramiento. La **redondez medida** es 1 − (máx − mín) / media del
contorno (1 = círculo perfecto).

| Tipo | Forma | Movimiento | Redondez | Por qué |
|---|---|---|---|---|
| calma | círculo liso | respira muy despacio | 0,98 | Lo quieto y bonito: casi perfecto |
| orgullo | cristal de 10 facetas, con aristas tenues | gira apenas | 0,95 | «Demasiado simétrico»: el cristal |
| cotidiano | pompa sencilla, apenas achatada | casi quieta | 0,91 | Neutra: ni rota ni perfecta |
| recuerdo | óvalo blando, **borde difuso** | se deforma lento | 0,84 | Lo que se recuerda no tiene orilla nítida |
| deseo | gota que **se estira hacia la esfera-ego** | lenta | 0,67 | Quiere: se inclina hacia quien la mira |
| juicio | contorno **dentado**, asimétrico | lento, rígido | 0,70 | Áspero, roto |
| preocupación | blanda y temblorosa, tres lóbulos | **tiembla rápido** | 0,61 | Inestable; sus letras también tiemblan |
| duda | **dos lóbulos** que se mecen | oscila | 0,61 | No elige entre dos formas |

Regla general (probada en `tests/v2.test.js`): lo armónico, lo quieto y lo neutro es **más redondo**; lo disonante
y lo ambiguo, **más asimétrico o deforme**. El tamaño sale del texto (radio de 35 a 58 px a zoom 1) y crece con la
cámara como todo lo demás. Con el ego bajo, la esfera se encoge con las letras hasta quedar como una mota de color.

## Varias líneas

Las frases se parten en **1 a 4 líneas** sin cortar palabras. Se elige el corte que deja el bloque más redondo (el
radio menor), con una pequeña preferencia por menos líneas y sin dejar sola una palabra de 1–2 letras. Letra
Spectral 300 a 15 px con 18 px de interlínea a zoom 1 (ver DESIGN.md).

## Atributos

- **matiz**: grados. 0 = rojo, 42 = oro, 200–300 = fríos/violetas. Preocupación tira a rojo-naranja (356–18), juicio a
  rojo profundo (346–8), deseo a ámbar (34–42), orgullo a oro (40–46), calma a oro pálido (44–52).
- **textura**: de −1 (áspero) a +1 (liso). **simetría**: de 0 a 1.
- **activación**: de 0,6 a 1,4; multiplica el estallido de 0,18. Alta = urgente o absoluto (pánico, triunfo), baja =
  quieto.
- Las ambiguas tienen además una **segunda carga** (`hue2`).
- Las neutras no tiñen la esfera: si se funden, toman el matiz del momento.

### preocupación (disonante, 10)

| Frase | Líneas | Matiz | Textura | Simetría | Activación | 2ª carga | PDF |
|---|---|---|---|---|---|---|---|
| otra vez igual | otra vez / igual | 356 | −0,60 | 0,25 | 0,9 |  | sí |
| qué van a pensar | qué van a / pensar | 0 | −0,70 | 0,20 | 1,1 |  | sí |
| y si sale mal | y si sale / mal | 12 | −0,60 | 0,25 | 1,2 |  |  |
| no me va a alcanzar | no me va a / alcanzar | 14 | −0,55 | 0,30 | 1,1 |  |  |
| qué tal si se enoja | qué tal / si se / enoja | 10 | −0,60 | 0,25 | 1,0 |  |  |
| no voy a llegar | no voy a / llegar | 16 | −0,65 | 0,20 | 1,3 |  |  |
| algo se me está pasando | algo se / me está / pasando | 18 | −0,50 | 0,30 | 0,9 |  |  |
| ya es muy tarde | ya es muy / tarde | 8 | −0,60 | 0,25 | 1,0 |  |  |
| y si me equivoqué | y si me / equivoqué | 12 | −0,55 | 0,30 | 1,1 |  |  |
| mañana va a ser peor | mañana va / a ser peor | 6 | −0,70 | 0,20 | 1,2 |  |  |

### juicio (disonante, 10)

| Frase | Líneas | Matiz | Textura | Simetría | Activación | 2ª carga | PDF |
|---|---|---|---|---|---|---|---|
| no vas a poder | no vas a / poder | 4 | −0,80 | 0,15 | 1,2 |  | sí |
| mejor ni lo intentes | mejor ni lo / intentes | 350 | −0,50 | 0,30 | 0,7 |  | sí |
| ya debería haber terminado | ya debería / haber / terminado | 8 | −0,85 | 0,10 | 1,3 |  | sí |
| no es suficiente | no es / suficiente | 352 | −0,75 | 0,15 | 1,0 |  | sí |
| siempre lo arruino | siempre lo / arruino | 354 | −0,85 | 0,10 | 1,3 |  |  |
| qué tonto fui | qué tonto / fui | 358 | −0,80 | 0,15 | 1,1 |  |  |
| no sirvo para esto | no sirvo / para esto | 350 | −0,90 | 0,10 | 1,2 |  |  |
| ellos sí pueden | ellos sí / pueden | 346 | −0,70 | 0,20 | 0,9 |  |  |
| debí decir otra cosa | debí decir / otra cosa | 2 | −0,65 | 0,20 | 0,9 |  |  |
| así nunca vas a cambiar | así nunca / vas a / cambiar | 348 | −0,85 | 0,10 | 1,2 |  |  |

### deseo (armónica, 8)

| Frase | Líneas | Matiz | Textura | Simetría | Activación | 2ª carga | PDF |
|---|---|---|---|---|---|---|---|
| que no se acabe | que no se / acabe | 38 | 0,80 | 0,95 | 1,3 |  | sí |
| merezco quedarme aquí | merezco / quedarme / aquí | 42 | 0,90 | 1,00 | 1,1 |  | sí |
| quiero más de esto | quiero / más de / esto | 36 | 0,75 | 0,90 | 1,2 |  |  |
| solo un poco más | solo un / poco más | 38 | 0,70 | 0,88 | 1,0 |  |  |
| si tuviera eso estaría bien | si tuviera / eso estaría / bien | 34 | 0,65 | 0,86 | 1,1 |  |  |
| cuando llegue todo va a cambiar | cuando / llegue / todo va a / cambiar | 40 | 0,70 | 0,90 | 1,2 |  |  |
| que me vean así | que me / vean así | 36 | 0,80 | 0,92 | 1,3 |  |  |
| quiero que dure | quiero / que dure | 38 | 0,85 | 0,95 | 1,1 |  |  |

### orgullo (armónica, 7)

| Frase | Líneas | Matiz | Textura | Simetría | Activación | 2ª carga | PDF |
|---|---|---|---|---|---|---|---|
| esto sí soy | esto sí / soy | 40 | 0,85 | 1,00 | 1,2 |  | sí |
| esto es lo que soy | esto es / lo que / soy | 40 | 0,95 | 1,00 | 1,4 |  | sí |
| lo hice perfecto | lo hice / perfecto | 44 | 0,90 | 1,00 | 1,3 |  |  |
| yo sí lo entiendo | yo sí lo / entiendo | 42 | 0,85 | 0,98 | 1,1 |  |  |
| nadie lo hace como yo | nadie lo / hace como yo | 44 | 0,95 | 1,00 | 1,4 |  |  |
| por fin me salió | por fin / me salió | 46 | 0,80 | 0,95 | 1,2 |  |  |
| ya lo logré | ya lo / logré | 42 | 0,85 | 0,98 | 1,3 |  |  |

### calma (armónica, 8)

| Frase | Líneas | Matiz | Textura | Simetría | Activación | 2ª carga | PDF |
|---|---|---|---|---|---|---|---|
| qué bien se siente esto | qué bien se / siente esto | 44 | 0,70 | 0,90 | 1,0 |  | sí |
| por fin estoy bien | por fin / estoy / bien | 46 | 0,60 | 0,85 | 0,9 |  | sí |
| ya estoy en paz | ya estoy / en paz | 50 | 0,75 | 0,92 | 0,8 |  |  |
| todo está en su lugar | todo está / en su lugar | 48 | 0,80 | 0,95 | 0,7 |  |  |
| así quiero quedarme | así quiero / quedarme | 46 | 0,80 | 0,95 | 0,9 |  |  |
| ya lo solté todo | ya lo / solté / todo | 52 | 0,70 | 0,90 | 0,8 |  |  |
| nada me falta | nada me / falta | 50 | 0,85 | 0,96 | 0,7 |  |  |
| esto es meditar bien | esto es / meditar / bien | 48 | 0,90 | 0,98 | 1,0 |  |  |

### recuerdo (ambigua, 9)

| Frase | Líneas | Matiz | Textura | Simetría | Activación | 2ª carga | PDF |
|---|---|---|---|---|---|---|---|
| estaba mejor antes | estaba / mejor / antes | 30 | −0,20 | 0,45 | 0,9 | 260 | sí |
| por fin terminó | por fin / terminó | 20 | 0,10 | 0,50 | 0,8 | 200 | sí |
| así olía la casa | así olía / la casa | 32 | 0,10 | 0,55 | 0,7 | 220 |  |
| cuando éramos niños | cuando / éramos / niños | 36 | 0,15 | 0,50 | 0,8 | 250 |  |
| esa tarde en la playa | esa tarde / en la playa | 28 | 0,20 | 0,55 | 0,7 | 195 |  |
| lo que dijo al irse | lo que / dijo al / irse | 24 | −0,25 | 0,40 | 1,0 | 270 |  |
| antes era más fácil | antes era / más fácil | 30 | −0,15 | 0,45 | 0,8 | 230 |  |
| ya no está | ya no / está | 26 | −0,10 | 0,45 | 1,0 | 215 |  |
| esa canción otra vez | esa / canción / otra vez | 34 | 0,05 | 0,50 | 0,8 | 300 |  |

### duda (ambigua, 9)

| Frase | Líneas | Matiz | Textura | Simetría | Activación | 2ª carga | PDF |
|---|---|---|---|---|---|---|---|
| ojalá se quede | ojalá se / quede | 40 | −0,10 | 0,50 | 1,0 | 330 | sí |
| ya no importa | ya no / importa | 210 | 0,00 | 0,55 | 0,6 | 0 | sí |
| qué raro se siente | qué raro / se siente | 280 | 0,00 | 0,40 | 0,8 | 160 | sí |
| no sé si quiero | no sé si / quiero | 300 | −0,15 | 0,45 | 0,9 | 45 | sí |
| tal vez sí, tal vez no | tal vez / sí, tal / vez no | 290 | 0,00 | 0,40 | 0,8 | 40 |  |
| y si era lo correcto | y si era lo / correcto | 270 | −0,10 | 0,45 | 0,9 | 20 |  |
| me alivia y me duele | me alivia / y me duele | 200 | 0,00 | 0,50 | 1,0 | 350 |  |
| quiero y no quiero | quiero y / no quiero | 310 | −0,05 | 0,40 | 0,9 | 45 |  |
| no sé qué siento | no sé qué / siento | 285 | 0,00 | 0,45 | 0,8 | 180 |  |

### cotidiano (neutra, 10)

| Frase | Líneas | Matiz | Textura | Simetría | Activación | 2ª carga | PDF |
|---|---|---|---|---|---|---|---|
| el foco sigue prendido | el foco / sigue / prendido | 205 | 0,00 | 0,60 | 0,6 |  | sí |
| mañana hay que salir | mañana / hay que / salir | 200 | 0,00 | 0,60 | 0,6 |  | sí |
| se me olvidó algo | se me / olvidó / algo | 215 | 0,00 | 0,55 | 0,7 |  | sí |
| qué hora será | qué hora / será | 195 | 0,00 | 0,60 | 0,6 |  | sí |
| hay que comprar pan | hay que / comprar / pan | 205 | 0,00 | 0,60 | 0,6 |  |  |
| falta contestar ese mensaje | falta / contestar / ese mensaje | 210 | 0,00 | 0,55 | 0,7 |  |  |
| la ropa sigue en la lavadora | la ropa / sigue en la / lavadora | 200 | 0,00 | 0,60 | 0,6 |  |  |
| cerré la puerta | cerré la / puerta | 212 | 0,00 | 0,55 | 0,7 |  |  |
| tengo sed | tengo sed | 198 | 0,00 | 0,60 | 0,6 |  |  |
| se va a acabar la batería | se va a / acabar la / batería | 208 | 0,00 | 0,55 | 0,7 |  |  |
