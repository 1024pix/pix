import { randomUUID } from 'node:crypto';

export function getTextSample() {
  return {
    id: randomUUID(),
    type: 'text',
    content: "<p>Ceci est un texte qui accepte de l'HTML.</p>",
  };
}
