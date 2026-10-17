# Atributos del banco de frases (v1)

Las frases son las 22 del PDF. Los atributos los asignó Codelius el 17 de octubre de 2026 como primera afinación y están en `src/core/phrases.js`.

- **matiz**: ángulo en grados. 0 = rojo, 42 = oro, 200–300 = fríos/violetas.
- **textura**: de −1 (áspero) a +1 (liso).
- **simetría**: de 0 a 1.
- **activación**: de 0,6 a 1,4; multiplica el estallido de 0,18.
- Las ambiguas tienen además una **segunda carga** (`hue2`) y `amb = 1`.

Criterio: la activación alta es lo urgente o lo absoluto (pánico, triunfo: «ya debería haber terminado», «esto es lo que soy») y la baja es lo quieto («mejor ni lo intentes», «ya no importa»).

| Frase | Familia | Matiz | Textura | Simetría | Activación | 2ª carga |
|---|---|---|---|---|---|---|
| otra vez igual | disonante | 356 | −0,60 | 0,25 | 0,9 | |
| no vas a poder | disonante | 4 | −0,80 | 0,15 | 1,2 | |
| mejor ni lo intentes | disonante | 350 | −0,50 | 0,30 | 0,7 | |
| ya debería haber terminado | disonante | 8 | −0,85 | 0,10 | 1,3 | |
| qué van a pensar | disonante | 0 | −0,70 | 0,20 | 1,1 | |
| no es suficiente | disonante | 352 | −0,75 | 0,15 | 1,0 | |
| qué bien se siente esto | armónica | 44 | 0,70 | 0,90 | 1,0 | |
| esto sí soy | armónica | 40 | 0,85 | 1,00 | 1,2 | |
| que no se acabe | armónica | 38 | 0,80 | 0,95 | 1,3 | |
| por fin estoy bien | armónica | 46 | 0,60 | 0,85 | 0,9 | |
| merezco quedarme aquí | armónica | 42 | 0,90 | 1,00 | 1,1 | |
| esto es lo que soy | armónica | 40 | 0,95 | 1,00 | 1,4 | |
| por fin terminó | ambigua | 20 | 0,10 | 0,50 | 0,8 | 200 (alivio / pérdida) |
| ojalá se quede | ambigua | 40 | −0,10 | 0,50 | 1,0 | 330 (ternura / miedo) |
| ya no importa | ambigua | 210 | 0,00 | 0,55 | 0,6 | 0 (quietud / rendición) |
| estaba mejor antes | ambigua | 30 | −0,20 | 0,45 | 0,9 | 260 |
| qué raro se siente | ambigua | 280 | 0,00 | 0,40 | 0,8 | 160 |
| no sé si quiero | ambigua | 300 | −0,15 | 0,45 | 0,9 | 45 |
| el foco sigue prendido | neutra | 205 | 0 | 0,60 | 0,6 | |
| mañana hay que salir | neutra | 200 | 0 | 0,60 | 0,6 | |
| se me olvidó algo | neutra | 215 | 0 | 0,55 | 0,7 | |
| qué hora será | neutra | 195 | 0 | 0,60 | 0,6 | |

Las neutras no tiñen la esfera: si se funden, toman el matiz del momento.
