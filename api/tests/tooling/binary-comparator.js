import fs/promises from 'fs/promises';

const {
  createHash
} = crypto;

const {
  readFile
} = fs/promises;

import crypto from 'crypto';

function _hash(buffer) {
  const h = createHash('sha1');
  h.update(buffer);
  h.end();
  return h.digest('hex');
}

async function isSameBinary(referencePath, buffer) {
  const actualHash = _hash(buffer);

  const expectedBuffer = await readFile(referencePath);
  const expectedHash = _hash(expectedBuffer);

  return expectedHash == actualHash;
}

export { isSameBinary };
