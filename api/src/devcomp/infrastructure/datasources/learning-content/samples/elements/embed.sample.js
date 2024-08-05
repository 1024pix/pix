import { randomUUID } from 'node:crypto';

export function getEmbedSample() {
  return {
    id: randomUUID(),
    type: 'embed',
    isCompletionRequired: true,
    title: 'Simulateur de visioconférence - micro ouvert',
    url: 'https://epreuves.pix.fr/visio/visio.html?mode=modulix-didacticiel',
    instruction:
      '<p>Vous participez à la visioconférence ci-dessous.</p><p>Il y a du bruit à côté de vous.</p><p>Coupez le son de votre micro pour ne pas déranger vos interlocuteurs.</p>',
    solution: 'toto',
    height: 600,
  };
}
