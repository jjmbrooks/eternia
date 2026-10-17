// Tabla «Primera afinación» del documento conceptual (docs/CONCEPTO.md) + valores acordados en chat
// (docs/DECISIONES.md). Los valores marcados [D] no están en el PDF: son decisiones de esta versión.
export const PARAMS = Object.freeze({
  defInitial: 0.22,          // Definición inicial
  vitInitial: 0.75,          // Vitalidad inicial
  inhale: 4.5,               // s, solo sin espiral
  exhale: 6.0,               // s
  fusionThreshold: 0.8,      // s de contacto con la atención en el ego
  burst: 0.18,               // × activación (0,6–1,4)
  restRecovery: 0.015,       // vitalidad / s sin fusión
  airRecovery: 0.035,        // vitalidad / s con la atención en el aire
  airDefDecay: 0.08,         // definición / s con la atención en el aire
  releaseDefDecay: 0.04,     // definición / s con el dedo suelto
  fusionDefGain: 0.06,       // definición / s durante la fusión
  fusionDensityGain: 0.12,   // densidad de la frase / s durante la fusión
  densityDecay: 0.05,        // densidad / s de la frase no atendida
  radiusMin: 0.04,           // × lado corto
  radiusMax: 0.11,
  inertiaMin: 0.15,          // s para obedecer, esfera chica
  inertiaMax: 0.70,          // s, esfera grande
  edgeBand: 0.18,            // × lado corto
  goldenAngle: 137.5,        // grados
  pulses: [5, 7, 4],

  // Regiones = estados de la definición (DECISIONES.md)
  centerMax: 0.08,
  calmMax: 0.35,
  mixMax: 0.72,

  // Voz / guía
  guideDef: 0.72,            // la voz aparece si vitalidad = 0 y definición > 0,72
  guideAcceptCycles: 3,      // ciclos de respiración en el borde (3 × 10,5 s = 31,5 s)
  guideMagnet: 1 / 3,        // imán mientras la ayuda vale
  guideRelease: 0.45,        // la voz se va cuando la definición baja de aquí
  guideReoffer: 60,          // [D] s: si se ignora, vuelve a ofrecerse
  guideTextHold: 14,         // [D] s que el texto queda visible antes de callarse
  lockedAirFactor: 0.15,     // [D] en el bucle (voz ofrecida, sin aceptar) ni el aire ni soltar adelgazan casi nada

  // Centro / semilla
  seedHold: 1.6,             // s sosteniendo un patrón para empezar a condensar
  seedPrend: 0.15,           // definición a la que la semilla «prende»
  seedStart: 0.04,           // [D] definición de la semilla cuando empieza a condensar
  seedGain: 0.06,            // [D] = fusionDefGain

  // Reapertura
  reopenTintMax: 0.08,       // como mucho 8 % del último matiz

  // [D] valores de esta versión, no fijados por el PDF
  fusionDrip: 0.008,         // vitalidad / s × activación mientras se sigue fundido («goteo»)
  siblingDefBump: 0.03,      // definición extra cuando un hermano se suma a la espiral
  autoFuseDef: 0.72,         // por encima, «los estallidos llegan solos» (rozar ya funde)
  autoFuseAffinity: 0.6,
  autoFuseCooldown: 2.5,     // s entre estallidos espontáneos
  inheritRate: 0.9,          // velocidad con la que la esfera hereda matiz/textura (1/s)
  ambInheritRate: 0.7,
  ambHueShare: 0.12,         // una frase ambigua solo arrastra parte del matiz
  coastFriction: 0.6,        // 1/s, frenado al soltar con inercia
  spawnMix: [0.7, 0.2, 0.1], // afín / ambiguo / otro matiz atenuado (esfera definida)
  neutralShare: 0.08,        // neutros, siempre minoría
});

export const PHI = (1 + Math.sqrt(5)) / 2;
export const breathCycle = (p = PARAMS) => p.inhale + p.exhale;
