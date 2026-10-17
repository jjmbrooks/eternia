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
| 8 | **Ritmo hacia el centro** | Con los valores del PDF, de 0,22 se llega al centro en ~3,5 s soltando o ~1,8 s en el aire | El PDF dice «si nunca se llega al centro, se acelera…»; aquí pasa lo contrario. ¿El centro debe tomar más tiempo (la pregunta de los «3 minutos»)? Bajar `releaseDefDecay` y `airDefDecay` o subir la definición inicial |
| 9 | **Valores marcados [D]** | Goteo, bucle 0,15, separación de estallidos 2,5 s, semilla 0,04 → 0,15 a 0,06/s, texto de la voz 14 s | Confirmar o ajustar jugando |
| 10 | **Contraste de las frases** | Son tenues a propósito (el campo «permanece por debajo») | Hay accesibilidad por teclado y lector de pantalla, pero las frases tenues no llegan a 4,5:1. ¿Se agrega un modo de contraste alto respetando `prefers-contrast`? |
| 11 | **Vibración** | No hay | El PDF la deja como añadido posterior y suave |
