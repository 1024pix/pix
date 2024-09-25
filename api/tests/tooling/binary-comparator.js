import { readFile } from 'node:fs/promises';

async function isSameBinary(referencePath, buffer) {
  const expectedBuffer = await readFile(referencePath);
  return expectedBuffer.equals(buffer);
}

export { isSameBinary };
