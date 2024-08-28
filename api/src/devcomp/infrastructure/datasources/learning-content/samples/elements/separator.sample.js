import { randomUUID } from 'node:crypto';

export function getSeparatorSample() {
  return {
    id: randomUUID(),
    type: 'separator',
  };
}
