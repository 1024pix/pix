import { randomUUID } from 'node:crypto';

export function getQcuSample(nbOfProposals = 3) {
  return {
    id: randomUUID(),
    type: 'qcu',
    instruction: '<p>Une question à choix unique ?</p>',
    proposals: Array.from(Array(nbOfProposals)).map((_, i) => ({
      id: `${i + 1}`,
      content: `Proposition ${i + 1}`,
    })),
    feedbacks: {
      valid: '<p>Correct !</p>',
      invalid: '<p>Incorrect !</p>',
    },
    solution: '1',
  };
}
