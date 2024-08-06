import { randomUUID } from 'node:crypto';

export function getDownloadSample() {
  return {
    id: randomUUID(),
    type: 'download',
    files: [
      {
        url: 'https://images.pix.fr/modulix/placeholder-image.svg',
        format: '.svg',
      },
    ],
  };
}
