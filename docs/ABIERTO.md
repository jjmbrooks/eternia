# Puntos abiertos

Estos puntos los tiene que decidir Brooks o hay que afinarlos jugando. Ninguno bloquea la v1.

| # | Punto | Estado en v1 | Qué falta decidir |
|---|---|---|---|
| 1 | **Aspecto y lado de la voz** | Línea de luz vertical a la derecha, a 60 % de la altura, con dos líneas de texto en cursiva | ¿Siempre del mismo lado o del lado más lejano al dedo? ¿Forma (línea, halo, ola del borde)? |
| 2 | **Voz hablada** | Solo texto más un tono suave (y región `aria-live`) | ¿Grabada por Brooks, síntesis del sistema (`speechSynthesis`, gratis pero varía según el aparato) o TTS de pago? **Un TTS de pago necesita el visto bueno de Brooks** antes de usarlo. El PDF pide «en español, cerca, sin carácter de personaje y sin música detrás». |
| 3 | **Cómo se ven los pulsos 5/7/4** | Tres órbitas elípticas con 5, 7 y 4 nodos; las ondas recorren la filotaxis | Validar si se lee como «una figura lenta» o hace falta otra forma |
| 4 | **Tipografía** | Spectral (OFL), autoalojada: 200 título, 300 frases, 500 densas, 300 cursiva voz y entrada | Validar en teléfono real. Alternativas: Newsreader, EB Garamond |
| 5 | **Aspecto orgánico del borde** | Marco rectangular con línea de respiración ondulada y degradado interior | ¿Bordes redondeados como la pantalla del teléfono? ¿Grano más orgánico? |
| 6 | **Aviso de salud / orientación en crisis** | No hay aviso dentro del campo; el README dice que no es un tratamiento | ¿Hace falta una nota fuera del campo (por ejemplo en la descripción de la PWA) con a dónde acudir en una crisis real? ¿Qué recurso y en qué país? |
| 7 | **Afinar atributos de las frases** | Asignados en [FRASES.md](FRASES.md) | Ajustar matiz, textura y activación después de jugar |
| 8 | **Ritmo hacia el centro** | *Actualizado 2026-10-17:* Brooks pidió entrar en el nivel intermedio y transiciones mucho más lentas. Ahora se entra en 0,45 y las tasas van × 0,3: al centro en ~31 s soltando o ~15 s en el aire (DECISIONES). Antes: ~3,5 s / ~1,8 s | El PDF dice «si nunca se llega al centro, se acelera…»; aquí pasa lo contrario. ¿El centro debe tomar más tiempo (la pregunta de los «3 minutos»)? Bajar `releaseDefDecay` y `airDefDecay` o subir la definición inicial |
| 9 | **Valores marcados [D]** | Goteo, bucle 0,15, separación de estallidos 2,5 s, semilla 0,04 → 0,15 a 0,06/s, texto de la voz 14 s | Confirmar o ajustar jugando |
| 10 | **Contraste de las frases** | Son tenues a propósito (el campo «permanece por debajo») | Hay accesibilidad por teclado y lector de pantalla, pero las frases tenues no llegan a 4,5:1. ¿Se agrega un modo de contraste alto respetando `prefers-contrast`? |
| 11 | **Vibración** | Opcional con `?vibra=1` (Android; iPhone no tiene vibración web): 14 ms al inhalar con el dedo en el borde y 10 ms por estallido | ¿Encendida por defecto en Android? ¿Más o menos intensa? |
| 12 | **Quitar el sonido sin teclado** | Tecla M, interruptor de silencio del iPhone (sesión `ambient`) y volumen del aparato. No hay botón: el concepto prohíbe botones en el campo | ¿Hace falta un gesto (por ejemplo, dos dedos) o una opción fuera del campo? |
| 13 | **Mirar sin mover el ego** | Con esfera, se navega llevándola; sin esfera (centro), arrastrar mueve el lienzo | ¿Brooks quiere también arrastrar el lienzo con el ego presente (por ejemplo, con dos dedos)? Hoy un dedo = la atención |
| 14 | **La esfera arriba del dedo** | Va 0,55 de su radio arriba del dedo para que no la tape | Probar en teléfono real: ¿se siente natural o desfasado? |
| 15 | **Escuchar el diseño sonoro** | Diseñado y probado por estructura, no de oído | Ver [SONIDO.md › Pendiente](SONIDO.md#16-pendiente-para-brooks) |
| 16 | **Letra con la cámara lejos** | La letra escala con el zoom; en la calma (zoom ~0,6–0,85) baja a 9–13 px mientras las letras se van | ¿Mínimo de tamaño aunque la cámara se aleje? |
| 17 | **Ritmo y tamaños nuevos** | `pace` 0,3, zoom 0,38 / 1 / 1,5, radio 54–72 px de mundo, cámara τ 3,5 s | Afinar jugando |
| 18 | ~~**Gamma en el extremo**~~ **Cerrado (2026-10-17)** | Brooks decidió nombrar los estados por el ruido mental: Tormenta, Parloteo, Murmullo, Quietud, Silencio | Nada. Las ondas quedan solo como inspiración en la tabla de correspondencia de [ONDAS-SENSORIAL.md](ONDAS-SENSORIAL.md) |
| 19 | **Intensidad del fondo de viaje** | Estrellas, polvo, orbes de la Quietud y destellos (≤ 2/s) calibrados en capturas, no en teléfono | Mirar en teléfono real: ¿demasiado tenue o demasiado presente? ¿Más estelas al viajar? |
| 20 | **Brillo sonoro de los destellos** | Un seno muy bajo por destello, sincronizado con la imagen | Escucharlo: ¿suma o distrae? Se puede apagar dejando `glint` en 0 |
