import { randomUUID } from 'node:crypto';

export function getQcuSample(nbOfProposals = 3) {
  return {
    id: randomUUID(),
    type: 'qcu',
    instruction: '<p>Une question à choix unique ?</p>',
    proposals: Array.from(Array(nbOfProposals)).map((_, i) => ({
      id: `${i + 1}`,
      content: `Proposition ${i + 1}`,
      feedback: { state: 'Correct !', diagnosis: `<p>${i + 1}</p>` },
    })),
    solution: '1',
  };
}
