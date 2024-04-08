import { randomUUID } from 'node:crypto';

export function getQrocmSample() {
  return {
    id: randomUUID(),
    type: 'qrocm',
    instruction: '<p>Complétez le texte ci-dessous.</p>',
    proposals: [
      {
        type: 'text',
        content: "<p>Il est possible d'utiliser des textes à champs libres&nbsp;:</p>",
      },
      {
        input: 'symbole-separateur-email',
        type: 'input',
        inputType: 'text',
        size: 1,
        display: 'inline',
        placeholder: '',
        ariaLabel: "Remplir avec le caractère qui permet de séparer les deux parties d'une adresse mail",
        defaultValue: '',
        tolerances: ['t1'],
        solutions: ['@'],
      },
      {
        type: 'text',
        content: '<p>On peut aussi utiliser des liste déroulantes&nbsp;:</p>',
      },
      {
        input: 'modulix',
        type: 'select',
        display: 'block',
        placeholder: '',
        ariaLabel: "Choisir l'adjectif le plus adapté",
        defaultValue: '',
        tolerances: [],
        options: [
          {
            id: '1',
            content: 'Génial',
          },
          {
            id: '2',
            content: 'Incroyable',
          },
          {
            id: '3',
            content: 'Légendaire',
          },
        ],
        solutions: ['3'],
      },
    ],
    feedbacks: {
      valid: '<p>Correct !</p>',
      invalid: '<p>Incorrect !</p>',
    },
  };
}
