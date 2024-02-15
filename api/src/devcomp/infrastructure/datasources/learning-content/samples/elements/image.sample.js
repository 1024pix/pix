import { randomUUID } from 'node:crypto';

export function getImageSample() {
  return {
    id: randomUUID(),
    type: 'image',
    url: 'https://images.pix.fr/modulix/placeholder-image.svg',
    alt: '',
    alternativeText: '',
  };
}
