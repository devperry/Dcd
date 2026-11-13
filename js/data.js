/**
 * Contenido editable del deck. Separado de la lógica.
 */
(function (global) {
  'use strict';

  const data = {
    /* ── Checkpoint 1 · Decisiones ── */
    checkpoint1: {
      questions: [
        {
          q: '¿Qué significa realmente «decidir»?',
          options: [
            'Elegir la opción más fácil para evitar problemas',
            'Elegir entre varias opciones y hacerte cargo de las consecuencias',
            'Dejar que otros elijan por ti',
            'Hacer lo primero que se te ocurre'
          ],
          correct: 1,
          why: 'Decidir no es solo elegir: incluye asumir lo que pasa después.'
        },
        {
          q: '¿Por qué a los adolescentes les cuesta medir consecuencias a largo plazo?',
          options: [
            'Porque no les importa el futuro',
            'Porque el sistema límbico madura antes que la corteza prefrontal: la emoción pesa más',
            'Porque tienen poca memoria',
            'Porque nunca piensan antes de actuar'
          ],
          correct: 1,
          why: 'Las zonas emocionales maduran antes que las de planificación. Por eso conviene entrenar la pausa.'
        }
      ]
    },

    /* ── Red Flag / Green Flag ── */
    redflag: {
      cards: [
        { text: 'Tu amigo te apoya cuando algo te sale mal.',                               flag: 'green' },
        { text: 'Te presionan para hacer algo «para demostrar que eres del grupo».',         flag: 'red'   },
        { text: 'Pueden decirse «no estoy de acuerdo» sin pelear.',                         flag: 'green' },
        { text: 'Comparten tus secretos con otras personas.',                               flag: 'red'   },
        { text: 'Se burlan de tus gustos delante de todos.',                                flag: 'red'   },
        { text: 'Se alegran de verdad cuando te va bien.',                                  flag: 'green' },
        { text: 'Solo te buscan cuando necesitan algo de ti.',                              flag: 'red'   },
        { text: 'Respetan cuando dices que no quieres hacer algo.',                         flag: 'green' }
      ]
    },

    /* ── ¿Qué harías? (aplicación de asertividad) ── */
    scenarios: {
      scenarios: [
        {
          situation: 'Tu amigo te pide dinero otra vez. La última vez no te lo devolvió. ¿Qué le dices?',
          options: [
            { text: '«Bueno, OK… total, ¿qué son $500?»',           style: 'passive',
              feedback: 'PASIVO: cedes para evitar el conflicto. Te callas lo que sientes.' },
            { text: '«Eres un caradura, no te doy más».',           style: 'aggressive',
              feedback: 'AGRESIVO: impones con enojo. Rompe el vínculo.' },
            { text: '«Oye, la otra vez no me devolviste. Esta vez no puedo».', style: 'assertive',
              feedback: '¡ASERTIVO! Marcas el límite con respeto, sin agredir ni ceder.' }
          ]
        },
        {
          situation: 'En el grupo te insisten para que subas una foto vergonzosa de un compañero.',
          options: [
            { text: '«Bueno, la subo… pero no le digan a nadie».',           style: 'passive',
              feedback: 'PASIVO: cedes a la presión y después te vas a sentir mal.' },
            { text: '«Eres un imbécil, ¿cómo se te ocurre?».',               style: 'aggressive',
              feedback: 'AGRESIVO: atacas en vez de marcar el límite.' },
            { text: '«No, no me parece. No voy a subir algo que lo haga sentir mal».', style: 'assertive',
              feedback: '¡ASERTIVO! El límite es claro y respetuoso.' }
          ]
        },
        {
          situation: 'Un amigo te invita a una fiesta y tú no quieres ir.',
          options: [
            { text: '«Bueno, voy… pero me voy temprano».',                    style: 'passive',
              feedback: 'PASIVO: vas para no quedar mal, aunque no quieras.' },
            { text: '«No me molestes, no quiero ir, ¿entiendes?».',           style: 'aggressive',
              feedback: 'AGRESIVO: el enojo no es un límite, es un ataque.' },
            { text: '«Gracias por invitarme, pero esta vez paso. Diviértete».', style: 'assertive',
              feedback: '¡ASERTIVO! Agradeces y marcas tu decisión con claridad.' }
          ]
        },
        {
          situation: 'Alguien hace un chiste sobre ti en el grupo.',
          options: [
            { text: '«Jaja, qué gracioso» (te ríes igual).',                     style: 'passive',
              feedback: 'PASIVO: te ríes para no generar tensión. Pero no te gustó.' },
            { text: '«Eres un imbécil, ojalá te mueras».',                        style: 'aggressive',
              feedback: 'AGRESIVO: la escalada de violencia no resuelve nada.' },
            { text: '«Oye, no me gustó. No me río de ti, no me gusta que se rían de mí».', style: 'assertive',
              feedback: '¡ASERTIVO! Expresas lo que sientes sin atacar.' }
          ]
        }
      ]
    },

    /* ── Checkpoint final · Consolidación ── */
    checkpointFinal: {
      questions: [
        {
          q: 'La presión de grupo INDIRECTA aparece cuando…',
          options: [
            'Alguien te amenaza explícitamente',
            'Imitas lo que hace el grupo para encajar, sin que nadie te lo pida',
            'Te ofrecen algo a cambio',
            'Un amigo te da un consejo'
          ],
          correct: 1,
          why: 'La presión indirecta no se dice: se respira. Es el «todos hacen esto» silencioso.'
        },
        {
          q: '¿Qué es la asertividad?',
          options: [
            'Imponer tu opinión por encima de los demás',
            'Callarte para no generar conflictos',
            'Expresar lo que piensas y sientes con respeto, sin agredir ni ceder',
            'Evitar hablar con la gente que no te gusta'
          ],
          correct: 2,
          why: 'La asertividad es el punto medio: ni pasivo (callarse) ni agresivo (atacar).'
        },
        {
          q: 'En la técnica del semáforo, el primer paso es…',
          options: [
            'Actuar rápido para no quedar mal',
            'Parar y respirar',
            'Pensar en las consecuencias',
            'Buscar culpables'
          ],
          correct: 1,
          why: 'Sin pausa no hay elección, solo reacción.'
        }
      ]
    }
  };

  global.App = global.App || {};
  global.App.data = data;
})(window);
