import { randomUUID } from 'node:crypto';

export function getQcmSample(nbOfProposals = 3) {
  return {
    id: randomUUID(),
    type: 'qcm',
    instruction: '<p>Une question à choix multiples ?</p>',
    proposals: Array.from(Array(nbOfProposals)).map((_, i) => ({
      id: `${i + 1}`,
      content: `Proposition ${i + 1}`,
    })),
    feedbacks: {
      valid: '<p>Correct !</p>',
      invalid: '<p>Incorrect !</p>',
    },
    solutions: ['1', '2'],
  };
}
